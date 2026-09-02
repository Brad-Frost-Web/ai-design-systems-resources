const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

/**
 * Loads course lessons from per-lesson markdown files in _data/lessons/.
 *
 * Each file is a POINTER to a lesson, not the lesson: number, title, chapter,
 * the Thinkific URL, presenters, tags, and a one-paragraph summary in the
 * body. Transcripts never land here — the course is the product; this is the
 * index that lets the site point students at the right video.
 *
 * Files are written by scripts/sync-lessons.js from the Notion
 * "AI & Design Systems Transcripts" database (only rows with a Thinkific URL,
 * i.e. published lessons).
 */
module.exports = function () {
	const dir = path.join(__dirname, "lessons");
	if (!fs.existsSync(dir)) {
		console.warn("⚠️  Lessons directory not found. Using empty array.");
		return [];
	}
	const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
	const lessons = files.map((file) => {
		const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
		const chapterNumber = Number((data.chapter || "").replace(/\D/g, ""));
		return {
			slug: file.replace(/\.md$/, ""),
			number: String(data.number || ""),
			title: data.title || "Untitled",
			chapter: data.chapter || null,
			chapterNumber: Number.isFinite(chapterNumber) ? chapterNumber : null,
			url: data.url || null,
			notionId: data.notionId || null,
			created: data.created || null,
			presenters: data.presenters || [],
			tags: data.tags || [],
			summary: (content || "").trim() || null,
		};
	});

	// Chapter, then lesson number (natural-ish sort: "1.10" after "1.09")
	lessons.sort((a, b) => {
		if (a.chapterNumber !== b.chapterNumber) return (a.chapterNumber ?? 99) - (b.chapterNumber ?? 99);
		return a.number.localeCompare(b.number, undefined, { numeric: true });
	});

	console.log(`✅ Loaded ${lessons.length} course lessons from markdown files`);
	return lessons;
};
