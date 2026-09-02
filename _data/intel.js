/**
 * Build-time intelligence index for the adaptive resource layer.
 *
 * Bundles four things into one machine-readable object that /intel.json
 * serves to the client-side engine and the Netlify compose function:
 *
 *   1. resources — the curated link collection (with the human-set
 *      `essential` flag, weighted heavily in ranking)
 *   2. terms     — the course glossary, each wired to specific lessons
 *   3. lessons   — POINTERS to published course videos (title, chapter,
 *      presenters, summary, Thinkific URL). Never transcripts.
 *   4. catalog   — the component catalog the UI engine may compose from,
 *      generated from eddie-brain by scripts/build-catalog.js. The renderer
 *      refuses anything that isn't in it.
 *
 * This is the "make your own content machine-readable" move the course
 * teaches, applied to the site's own content.
 */
const fs = require("fs");
const path = require("path");
const resources = require("./resources.js");
const glossary = require("./glossary.js");
const lessons = require("./lessons.js");

function loadCatalog() {
	const file = path.join(__dirname, "catalog.json");
	if (!fs.existsSync(file)) {
		console.warn("⚠️  _data/catalog.json missing — run `npm run build:catalog`. Using empty catalog.");
		return { source: null, generated: null, nodes: [] };
	}
	return JSON.parse(fs.readFileSync(file, "utf8"));
}

module.exports = function () {
	const allResources = resources().map((r, i) => ({
		id: `r${i}`,
		title: r.title,
		url: r.href,
		type: r.type,
		source: r.source || null,
		tags: (r.tags || []).map((t) => t.name),
		created: r.created,
		essential: Boolean(r.essential),
		summary: r.slackSummary || null,
	}));

	const terms = glossary().map((t) => ({
		slug: t.slug,
		term: t.term,
		aliases: t.aliases,
		definition: t.definition,
		tags: t.tags || [],
		status: t.status || null,
		lessons: (t.lessons || []).map((l) => ({
			number: l.number,
			title: l.title,
			chapter: l.chapter,
			url: l.url,
		})),
	}));

	const allLessons = lessons()
		.filter((l) => l.url)
		.map((l) => ({
			id: `l-${l.slug}`,
			number: l.number,
			title: l.title,
			chapter: l.chapter,
			chapterNumber: l.chapterNumber,
			url: l.url,
			presenters: l.presenters,
			tags: l.tags,
			summary: l.summary,
			created: l.created,
		}));

	const catalog = loadCatalog();

	return {
		generated: new Date().toISOString(),
		counts: {
			resources: allResources.length,
			essential: allResources.filter((r) => r.essential).length,
			terms: terms.length,
			lessons: allLessons.length,
		},
		catalog,
		resources: allResources,
		terms,
		lessons: allLessons,
	};
};
