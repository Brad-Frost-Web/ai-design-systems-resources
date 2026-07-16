/**
 * Build-time intelligence index for the adaptive resource layer.
 *
 * Bundles the resource corpus and the course glossary into one
 * machine-readable object. index.njk's /intel.json template dumps this for
 * the client-side intent engine (js/intent-engine.js) — the same "make your
 * system machine-readable" move the course teaches, applied to this site's
 * own content.
 */
const resources = require("./resources.js");
const glossary = require("./glossary.js");

module.exports = function () {
	const allResources = resources().map((r, i) => ({
		id: `r${i}`,
		title: r.title,
		url: r.href,
		type: r.type,
		source: r.source || null,
		tags: (r.tags || []).map((t) => t.name),
		created: r.created,
		summary: r.slackSummary || null,
	}));

	const terms = glossary().map((t) => ({
		slug: t.slug,
		term: t.term,
		aliases: t.aliases,
		definition: t.definition,
		tags: t.tags || [],
		lessons: (t.lessons || []).map((l) => ({
			title: l.title,
			chapter: l.chapter,
			url: l.url,
		})),
	}));

	return {
		generated: new Date().toISOString(),
		counts: { resources: allResources.length, terms: terms.length },
		resources: allResources,
		terms,
	};
};
