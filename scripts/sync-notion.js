#!/usr/bin/env node

/**
 * Two-way, non-destructive sync between the Notion database and local
 * markdown files in _data/resources/.
 *
 * Usage: node scripts/sync-notion.js
 *
 * Behavior:
 *   1. Notion -> files: every Notion page is mirrored to a markdown file.
 *      - Pages with no matching local file create a new file.
 *      - Files that originated from Notion (no `source:` field) are kept in
 *        sync with Notion in place (matched by notionId, so the filename is
 *        stable even if the title changes).
 *      - Files added by other sources (Slack etc., which carry a `source:`
 *        field) are NEVER overwritten — we only stamp in the matching
 *        `notionId` if it's missing, preserving all of their metadata.
 *   2. Files -> Notion: any local file whose URL is not yet in Notion gets a
 *      new Notion page created for it, and the new notionId is written back
 *      into the file. This is how Slack/manually-added resources flow upstream.
 *   3. Nothing is ever deleted. Removing a resource is a deliberate manual act
 *      in Notion + the repo, not a side effect of this sync.
 *
 * Matching key: a page and a file are "the same resource" if they share a
 * notionId, or (failing that) the same URL. URL is unique in the database.
 */

const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const RESOURCES_DIR = path.join(__dirname, "..", "_data", "resources");

// Create slug from title
function slugify(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

// Format date for filename
function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toISOString().split("T")[0];
}

// Escape a value for a double-quoted YAML scalar
function yamlQuote(value) {
	return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

// Build YAML frontmatter for a Notion-originated resource
function toMarkdown(resource) {
	let yaml = "---\n";
	yaml += `title: ${yamlQuote(resource.title)}\n`;
	yaml += `url: ${yamlQuote(resource.href)}\n`;
	if (resource.type) yaml += `type: ${yamlQuote(resource.type)}\n`;
	if (resource.created) yaml += `created: ${yamlQuote(resource.created)}\n`;
	if (resource.notionId) yaml += `notionId: ${yamlQuote(resource.notionId)}\n`;
	if (resource.tags.length > 0) {
		yaml += "tags:\n";
		resource.tags.forEach((tag) => {
			yaml += `  - ${yamlQuote(`${tag.name}|${tag.color}`)}\n`;
		});
	}
	yaml += "---\n";
	return yaml;
}

// Minimal frontmatter reader: returns the scalar string fields we care about.
// (We only need `url`, `source`, and `notionId` for matching decisions.)
function readFrontmatter(raw) {
	const m = raw.match(/^---\n([\s\S]*?)\n---/);
	const fm = {};
	if (!m) return fm;
	for (const line of m[1].split("\n")) {
		const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
		if (!kv) continue;
		const key = kv[1];
		let val = kv[2].trim();
		if (val === "") continue; // skip block keys like `tags:`
		val = val.replace(/^"(.*)"$/, "$1").replace(/\\"/g, '"');
		fm[key] = val;
	}
	return fm;
}

// Insert a `notionId` line into an existing frontmatter block without
// disturbing anything else. Returns the updated file contents.
function stampNotionId(raw, notionId) {
	const line = `notionId: ${yamlQuote(notionId)}`;
	// Prefer to place it right after `created:`; fall back to after `url:`;
	// otherwise just after the opening `---`.
	if (/^created:.*$/m.test(raw)) {
		return raw.replace(/^(created:.*)$/m, `$1\n${line}`);
	}
	if (/^url:.*$/m.test(raw)) {
		return raw.replace(/^(url:.*)$/m, `$1\n${line}`);
	}
	return raw.replace(/^---\n/, `---\n${line}\n`);
}

// Read a Notion page into our normalized resource shape
function pageToResource(page) {
	const properties = page.properties;
	return {
		title: properties.Name?.title?.[0]?.plain_text || "Untitled",
		href: properties.URL?.url || "#",
		tags:
			properties.Tags?.multi_select?.map((tag) => ({
				name: tag.name,
				color: tag.color,
			})) || [],
		type: properties.Type?.select?.name || null,
		created: properties.Created?.created_time || null,
		notionId: page.id,
	};
}

async function fetchAllNotionPages(notion, databaseId) {
	let all = [];
	let hasMore = true;
	let startCursor = undefined;
	while (hasMore) {
		const response = await notion.databases.query({
			database_id: databaseId,
			start_cursor: startCursor,
			sorts: [{ property: "Created", direction: "descending" }],
		});
		all = all.concat(response.results);
		hasMore = response.has_more;
		startCursor = response.next_cursor;
	}
	return all;
}

// Create a Notion page from a local file's frontmatter. Returns the new page id.
async function createNotionPage(notion, databaseId, fm, tagNames) {
	const properties = {
		Name: { title: [{ text: { content: fm.title || "Untitled" } }] },
	};
	if (fm.url && fm.url !== "#") properties["URL"] = { url: fm.url };
	if (fm.type) properties["Type"] = { select: { name: fm.type } };
	if (tagNames.length > 0) {
		properties["Tags"] = { multi_select: tagNames.map((name) => ({ name })) };
	}
	const created = await notion.pages.create({
		parent: { database_id: databaseId },
		properties,
	});
	return created.id;
}

// Parse `tags:` block into bare tag names (frontmatter stores `name|color`).
function readTagNames(raw) {
	const block = raw.match(/^---\n([\s\S]*?)\n---/);
	if (!block) return [];
	const lines = block[1].split("\n");
	const start = lines.findIndex((l) => /^tags:\s*$/.test(l));
	if (start < 0) return [];
	const out = [];
	for (let i = start + 1; i < lines.length; i++) {
		const mm = lines[i].match(/^\s+-\s+"?(.*?)"?\s*$/);
		if (!mm) break; // end of the list
		out.push(mm[1].split("|")[0]);
	}
	return out.filter(Boolean);
}

async function sync() {
	const notion = new Client({ auth: process.env.NOTION_API_KEY });
	const databaseId = process.env.NOTION_DATABASE_ID;

	if (!databaseId || !process.env.NOTION_API_KEY) {
		console.error(
			"❌ Notion credentials not found. Set NOTION_API_KEY and NOTION_DATABASE_ID in .env"
		);
		process.exit(1);
	}

	if (!fs.existsSync(RESOURCES_DIR)) {
		fs.mkdirSync(RESOURCES_DIR, { recursive: true });
	}

	console.log("📡 Fetching resources from Notion...");
	const pages = await fetchAllNotionPages(notion, databaseId);
	console.log(`📦 Found ${pages.length} resources in Notion`);

	// Index the local files we already have.
	const localFiles = fs
		.readdirSync(RESOURCES_DIR)
		.filter((f) => f.endsWith(".md"));
	const byNotionId = new Map(); // notionId -> filename
	const byUrl = new Map(); // url -> filename
	for (const filename of localFiles) {
		const raw = fs.readFileSync(path.join(RESOURCES_DIR, filename), "utf8");
		const fm = readFrontmatter(raw);
		if (fm.notionId) byNotionId.set(fm.notionId, filename);
		if (fm.url) byUrl.set(fm.url, filename);
	}

	const notionUrls = new Set();
	let created = 0;
	let stamped = 0;
	let updated = 0;
	let pushedToNotion = 0;

	// --- 1. Notion -> files ---------------------------------------------------
	for (const page of pages) {
		const resource = pageToResource(page);
		if (resource.href && resource.href !== "#") notionUrls.add(resource.href);

		const existing =
			byNotionId.get(resource.notionId) || byUrl.get(resource.href);

		if (!existing) {
			// New resource that lives only in Notion: create a file for it.
			const datePrefix = resource.created
				? formatDate(resource.created)
				: "undated";
			const filename = `${datePrefix}-${slugify(resource.title)}.md`;
			fs.writeFileSync(
				path.join(RESOURCES_DIR, filename),
				toMarkdown(resource),
				"utf8"
			);
			byUrl.set(resource.href, filename);
			byNotionId.set(resource.notionId, filename);
			created++;
			console.log(`  ✅ created ${filename}`);
			continue;
		}

		const filePath = path.join(RESOURCES_DIR, existing);
		const raw = fs.readFileSync(filePath, "utf8");
		const fm = readFrontmatter(raw);

		if (fm.source) {
			// Externally-sourced (Slack etc.): never overwrite. Just ensure the
			// notionId is recorded so the two stay linked.
			if (!fm.notionId) {
				fs.writeFileSync(filePath, stampNotionId(raw, resource.notionId), "utf8");
				stamped++;
				console.log(`  🔗 linked ${existing}`);
			}
		} else {
			// Notion-managed file: keep it in sync with Notion in place.
			const next = toMarkdown(resource);
			if (next !== raw) {
				fs.writeFileSync(filePath, next, "utf8");
				updated++;
			}
		}
	}

	// --- 2. files -> Notion ---------------------------------------------------
	for (const filename of fs
		.readdirSync(RESOURCES_DIR)
		.filter((f) => f.endsWith(".md"))) {
		const filePath = path.join(RESOURCES_DIR, filename);
		const raw = fs.readFileSync(filePath, "utf8");
		const fm = readFrontmatter(raw);
		if (!fm.url || fm.url === "#") continue;
		if (notionUrls.has(fm.url)) continue; // already in Notion

		try {
			const newId = await createNotionPage(
				notion,
				databaseId,
				fm,
				readTagNames(raw)
			);
			notionUrls.add(fm.url);
			pushedToNotion++;
			if (!fm.notionId) {
				fs.writeFileSync(filePath, stampNotionId(raw, newId), "utf8");
			}
			console.log(`  ⬆️  pushed to Notion: ${filename}`);
		} catch (err) {
			// Don't let one bad row break the whole sync (or the commit).
			console.error(`  ⚠️  could not push ${filename} to Notion: ${err.message}`);
		}
	}

	console.log(
		`\n✨ Sync complete. created ${created}, updated ${updated}, linked ${stamped}, pushed to Notion ${pushedToNotion}. Nothing deleted.`
	);
}

sync().catch((error) => {
	console.error("❌ Sync failed:", error.message);
	process.exit(1);
});
