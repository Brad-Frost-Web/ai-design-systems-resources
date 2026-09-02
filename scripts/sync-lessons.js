#!/usr/bin/env node

/**
 * One-way sync: Notion "AI & Design Systems Transcripts" → _data/lessons/.
 *
 * Usage: node scripts/sync-lessons.js   (npm run sync:lessons)
 *
 * Every published lesson (a row with a Thinkific URL) becomes one markdown
 * file carrying POINTERS only — number, title, chapter, URL, presenters,
 * tags, and the one-paragraph Summary as the body. Transcripts (the page
 * bodies) are never read and never written: the course is the product, the
 * site just points at it.
 *
 * Behavior:
 *   - Rows without a Thinkific URL are skipped (unpublished lessons never
 *     surface as cards that open nothing).
 *   - Files are matched by notionId; the filename is derived from the
 *     lesson number + title and is renamed if the title drifts.
 *   - Nothing is deleted. A lesson that loses its URL is left in place and
 *     reported, so removal stays a deliberate human act.
 *
 * Environment:
 *   NOTION_API_KEY             integration secret (same as sync-notion.js).
 *                              The Transcripts database must be shared with it.
 *   NOTION_LESSONS_DATABASE_ID the Transcripts database id
 *                              (34a3c9323e86802ab3ebc1964320d79c)
 */

const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const LESSONS_DIR = path.join(__dirname, "..", "_data", "lessons");
const DEFAULT_DATABASE_ID = "34a3c9323e86802ab3ebc1964320d79c";

function slugify(text) {
	return String(text)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function yamlQuote(value) {
	return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function plain(rich) {
	return (rich || []).map((r) => r.plain_text).join("").trim();
}

function pageToLesson(page) {
	const p = page.properties;
	return {
		notionId: page.id.replace(/-/g, ""),
		number: plain(p.Number?.rich_text),
		title: plain(p.Title?.title) || "Untitled",
		chapter: p.Chapter?.select?.name || null,
		url: p["Thinkific URL"]?.url || null,
		created: page.created_time,
		presenters: (p.Owner?.people || []).map((u) => u.name).filter(Boolean),
		tags: (p.Tags?.multi_select || []).map((t) => t.name),
		summary: plain(p.Summary?.rich_text),
	};
}

function toMarkdown(l) {
	let y = "---\n";
	y += `number: ${yamlQuote(l.number)}\n`;
	y += `title: ${yamlQuote(l.title)}\n`;
	y += `chapter: ${yamlQuote(l.chapter || "")}\n`;
	y += `url: ${yamlQuote(l.url)}\n`;
	y += `notionId: ${yamlQuote(l.notionId)}\n`;
	y += `created: ${yamlQuote(l.created)}\n`;
	y += l.presenters.length ? `presenters:\n${l.presenters.map((n) => `  - ${yamlQuote(n)}\n`).join("")}` : "presenters: []\n";
	y += l.tags.length ? `tags:\n${l.tags.map((t) => `  - ${yamlQuote(t)}\n`).join("")}` : "tags: []\n";
	y += "---\n";
	if (l.summary) y += `${l.summary}\n`;
	return y;
}

function existingByNotionId() {
	const map = new Map();
	if (!fs.existsSync(LESSONS_DIR)) return map;
	for (const file of fs.readdirSync(LESSONS_DIR)) {
		if (!file.endsWith(".md")) continue;
		const raw = fs.readFileSync(path.join(LESSONS_DIR, file), "utf8");
		const m = raw.match(/^notionId:\s*"([0-9a-f]+)"/m);
		if (m) map.set(m[1], file);
	}
	return map;
}

async function fetchAll(notion, databaseId) {
	let all = [];
	let cursor;
	do {
		const res = await notion.databases.query({
			database_id: databaseId,
			start_cursor: cursor,
			filter: { property: "Thinkific URL", url: { is_not_empty: true } },
		});
		all = all.concat(res.results);
		cursor = res.has_more ? res.next_cursor : undefined;
	} while (cursor);
	return all;
}

async function main() {
	const token = process.env.NOTION_API_KEY || process.env.NOTION_TOKEN;
	const databaseId = process.env.NOTION_LESSONS_DATABASE_ID || DEFAULT_DATABASE_ID;
	if (!token) {
		console.error("❌ NOTION_API_KEY is not set. Share the Transcripts database with the integration and add the key to .env.");
		process.exit(1);
	}
	fs.mkdirSync(LESSONS_DIR, { recursive: true });
	const notion = new Client({ auth: token });
	const pages = await fetchAll(notion, databaseId);
	const existing = existingByNotionId();
	let created = 0;
	let updated = 0;
	let renamed = 0;
	const seen = new Set();

	for (const page of pages) {
		const lesson = pageToLesson(page);
		if (!lesson.url) continue;
		seen.add(lesson.notionId);
		const filename = `${slugify(lesson.number)}-${slugify(lesson.title)}.md`;
		const target = path.join(LESSONS_DIR, filename);
		const markdown = toMarkdown(lesson);
		const prior = existing.get(lesson.notionId);
		if (prior && prior !== filename) {
			fs.renameSync(path.join(LESSONS_DIR, prior), target);
			renamed++;
		}
		if (!fs.existsSync(target)) {
			fs.writeFileSync(target, markdown);
			created++;
		} else if (fs.readFileSync(target, "utf8") !== markdown) {
			fs.writeFileSync(target, markdown);
			updated++;
		}
	}

	const orphans = [...existing.keys()].filter((id) => !seen.has(id));
	console.log(`✅ Lessons: ${pages.length} published in Notion → ${created} created, ${updated} updated, ${renamed} renamed.`);
	if (orphans.length) {
		console.log(`ℹ️  ${orphans.length} local lesson file(s) no longer have a published URL in Notion (left in place, never deleted):`);
		for (const id of orphans) console.log(`   - ${existing.get(id)}`);
	}
}

main().catch((err) => {
	console.error("❌ sync-lessons failed:", err.message);
	process.exit(1);
});
