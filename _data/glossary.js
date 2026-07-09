const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

/**
 * Loads the course glossary from per-term markdown files in _data/glossary/.
 * Each file's frontmatter carries the term, aliases, source, and the related
 * course lessons; the markdown body is the definition.
 */
module.exports = function () {
	const glossaryDir = path.join(__dirname, "glossary");

	if (!fs.existsSync(glossaryDir)) {
		console.warn("⚠️  Glossary directory not found. Using empty array.");
		return [];
	}

	const files = fs
		.readdirSync(glossaryDir)
		.filter((file) => file.endsWith(".md"));

	if (files.length === 0) {
		console.warn("⚠️  No markdown files found in glossary directory.");
		return [];
	}

	const terms = files.map((file) => {
		const slug = file.replace(/\.md$/, "");
		const fileContents = fs.readFileSync(path.join(glossaryDir, file), "utf8");
		const { data, content } = matter(fileContents);

		const term = data.term || slug;
		return {
			slug,
			term,
			letter: term.charAt(0).toUpperCase(),
			aliases: data.aliases || [],
			definition: (content || "").trim(),
			source: data.source || null,
			lessons: data.lessons || [],
			tags: data.tags || [],
		};
	});

	// Alphabetical by term (case-insensitive)
	terms.sort((a, b) =>
		a.term.toLowerCase().localeCompare(b.term.toLowerCase()),
	);

	console.log(`✅ Loaded ${terms.length} glossary terms from markdown files`);
	return terms;
};
