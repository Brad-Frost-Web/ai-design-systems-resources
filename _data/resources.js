const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

module.exports = function () {
	const resourcesDir = path.join(__dirname, "resources");

	// Check if the resources directory exists
	if (!fs.existsSync(resourcesDir)) {
		console.warn("⚠️  Resources directory not found. Using empty array.");
		return [];
	}

	// Get all markdown files in the resources directory
	const files = fs
		.readdirSync(resourcesDir)
		.filter((file) => file.endsWith(".md")).sort();

	if (files.length === 0) {
		console.warn("⚠️  No markdown files found in resources directory.");
		return [];
	}

	const records = files.map((file) => {
		const filePath = path.join(resourcesDir, file);
		const fileContents = fs.readFileSync(filePath, "utf8");
		const { data } = matter(fileContents);

		// Parse tags from frontmatter (stored as "name|color" format)
		const tags = (data.tags || []).map((tag) => {
			if (typeof tag === "string" && tag.includes("|")) {
				const [name, color] = tag.split("|");
				return { name, color };
			}
			// If tag is already an object or doesn't have color
			return typeof tag === "object" ? tag : { name: tag, color: "default" };
		});

		const resource = {
			id: file.replace(/\.md$/, ""),
			title: data.title || "Untitled",
			href: data.url || "#",
			tags,
			type: data.type || null,
			created: data.created || null,
			notionId: data.notionId || null,
			essential: data.essential === true,
		};

		// Pass through Slack-specific fields when present
		if (data.source) resource.source = data.source;
		if (data.slackMessageUrl) resource.slackMessageUrl = data.slackMessageUrl;
		if (data.slackSummary) resource.slackSummary = data.slackSummary;
		if (data.slackSentiment) resource.slackSentiment = data.slackSentiment;

		return resource;
	});

	const resources = uniqueResources(records);

	// Sort by created date (newest first)
	resources.sort((a, b) => {
		if (!a.created) return 1;
		if (!b.created) return -1;
		return new Date(b.created) - new Date(a.created);
	});

	console.log(`✅ Loaded ${resources.length} resources from markdown files`);
	return resources;
};

// Keep source files intact, but render/count each public URL once.
function resourceKey(href) {
	try {
		const url = new URL(href);
		if (!["http:", "https:"].includes(url.protocol) || ["mail.google.com", "outlook.office.com", "outlook.live.com"].includes(url.hostname)) return null;
		return url.href.replace(/\/$/, "");
	} catch { return null; }
}
function uniqueResources(records) {
	const unique = new Map();
	for (const record of records) {
		const key = resourceKey(record.href);
		if (!key) continue;
		const previous = unique.get(key);
		if (!previous) { unique.set(key, {...record}); continue; }
		// First filename supplies the stable ID; first-seen date supplies chronology.
		const richer = (record.slackSummary?.length || 0) > (previous.slackSummary?.length || 0) ? record : previous;
		unique.set(key, {...previous, ...richer, id:previous.id,
			created:[previous.created, record.created].filter(Boolean).sort()[0] || null,
			essential:previous.essential || record.essential,
			tags:[...new Map([...previous.tags, ...record.tags].map(tag=>[tag.name,tag])).values()]});
	}
	return [...unique.values()];
}
module.exports.resourceKey = resourceKey;
module.exports.uniqueResources = uniqueResources;
