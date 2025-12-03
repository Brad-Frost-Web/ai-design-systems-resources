#!/usr/bin/env node

/**
 * Sync Notion database to local markdown files
 * 
 * Usage: node scripts/sync-notion.js
 * 
 * This script fetches all resources from the Notion database
 * and saves them as individual markdown files in _data/resources/
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

// Convert resource to markdown frontmatter
function toMarkdown(resource) {
	const frontmatter = {
		title: resource.title,
		url: resource.href,
		type: resource.type,
		created: resource.created,
		notionId: resource.notionId,
		tags: resource.tags.map((tag) => `${tag.name}|${tag.color}`),
	};

	// Build YAML frontmatter
	let yaml = "---\n";
	yaml += `title: "${frontmatter.title.replace(/"/g, '\\"')}"\n`;
	yaml += `url: "${frontmatter.url}"\n`;
	if (frontmatter.type) yaml += `type: "${frontmatter.type}"\n`;
	if (frontmatter.created) yaml += `created: "${frontmatter.created}"\n`;
	if (frontmatter.notionId) yaml += `notionId: "${frontmatter.notionId}"\n`;
	if (frontmatter.tags.length > 0) {
		yaml += "tags:\n";
		frontmatter.tags.forEach((tag) => {
			yaml += `  - "${tag}"\n`;
		});
	}
	yaml += "---\n";

	return yaml;
}

async function syncFromNotion() {
	const notion = new Client({
		auth: process.env.NOTION_API_KEY,
	});

	const databaseId = process.env.NOTION_DATABASE_ID;

	if (!databaseId || !process.env.NOTION_API_KEY) {
		console.error("❌ Notion credentials not found. Set NOTION_API_KEY and NOTION_DATABASE_ID in .env");
		process.exit(1);
	}

	// Ensure resources directory exists
	if (!fs.existsSync(RESOURCES_DIR)) {
		fs.mkdirSync(RESOURCES_DIR, { recursive: true });
	}

	try {
		console.log("📡 Fetching resources from Notion...");

		// Fetch all pages (handling pagination)
		let allResults = [];
		let hasMore = true;
		let startCursor = undefined;

		while (hasMore) {
			const response = await notion.databases.query({
				database_id: databaseId,
				start_cursor: startCursor,
				sorts: [
					{
						property: "Created",
						direction: "descending",
					},
				],
			});

			allResults = allResults.concat(response.results);
			hasMore = response.has_more;
			startCursor = response.next_cursor;
		}

		console.log(`📦 Found ${allResults.length} resources in Notion`);

		// Track existing files to detect deleted resources
		const existingFiles = new Set(
			fs.readdirSync(RESOURCES_DIR).filter((f) => f.endsWith(".md"))
		);
		const processedFiles = new Set();

		// Process each page
		for (const page of allResults) {
			const properties = page.properties;

			const title = properties.Name?.title?.[0]?.plain_text || "Untitled";
			const href = properties.URL?.url || "#";
			const tags =
				properties.Tags?.multi_select?.map((tag) => ({
					name: tag.name,
					color: tag.color,
				})) || [];
			const type = properties.Type?.select?.name || null;
			const created = properties.Created?.created_time || null;

			const resource = {
				title,
				href,
				tags,
				type,
				created,
				notionId: page.id,
			};

			// Create filename from date and slug
			const datePrefix = created ? formatDate(created) : "undated";
			const slug = slugify(title);
			const filename = `${datePrefix}-${slug}.md`;

			const filePath = path.join(RESOURCES_DIR, filename);
			const markdown = toMarkdown(resource);

			fs.writeFileSync(filePath, markdown, "utf8");
			processedFiles.add(filename);
			console.log(`  ✅ ${filename}`);
		}

		// Report files that exist locally but not in Notion
		const deletedInNotion = [...existingFiles].filter(
			(f) => !processedFiles.has(f)
		);
		if (deletedInNotion.length > 0) {
			console.log("\n⚠️  Files exist locally but not in Notion:");
			deletedInNotion.forEach((f) => console.log(`  - ${f}`));
			console.log("  (These files were NOT deleted. Remove manually if needed.)");
		}

		console.log(`\n✨ Sync complete! ${processedFiles.size} resources saved to _data/resources/`);
	} catch (error) {
		console.error("❌ Error fetching from Notion:", error.message);
		process.exit(1);
	}
}

syncFromNotion();

