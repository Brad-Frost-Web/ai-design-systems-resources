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

	// Get all markdown files in the resources  directory
	const files = fs
		.readdirSync(resourcesDir)
		.filter((file) => file.endsWith(".md"));

	if (files.length === 0) {
		console.warn("⚠️  No markdown files found in resources directory.");
		return [];
	}

	const resources = files.map((file) => {
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

		return {
			title: data.title || "Untitled",
			href: data.url || "#",
			tags,
			type: data.type || null,
			created: data.created || null,
			notionId: data.notionId || null,
		};
	});

	// Sort by created date (newest first)
	resources.sort((a, b) => {
		if (!a.created) return 1;
		if (!b.created) return -1;
		return new Date(b.created) - new Date(a.created);
	});

	console.log(`✅ Loaded ${resources.length} resources from markdown files`);
	return resources;
};
