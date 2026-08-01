#!/usr/bin/env node

/**
 * First-pass station classifier for the resource corpus.
 *
 * Assigns each resource in `_data/resources/` a `stations:` list (inspection
 * station slugs, see _data/stations.js) plus a `stationsConfidence`:
 *   - high   — derived from a strong topical tag (mcp, figma, documentation…)
 *   - medium — derived only from a keyword hit in the title/summary
 *   - low    — nothing matched; a review/enrich candidate
 *
 * This is a heuristic backfill, not a source of truth. It NEVER overwrites a
 * resource that already carries a `stations:` field (e.g. hand-classified ones).
 * Re-run any time; use --force to also re-classify already-tagged files.
 *
 * Usage: node scripts/classify-stations.js [--force] [--dry]
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const RESOURCES_DIR = path.join(__dirname, "..", "_data", "resources");
const FORCE = process.argv.includes("--force");
const DRY = process.argv.includes("--dry");

const VALID = new Set([
	"coverage-gaps", "best-practices", "accessibility", "shared-language",
	"testing-validation", "orchestration", "governance-version-control",
	"feedback-adoption", "machine-readable-docs", "agent-access",
]);

// Strong signal: a topical tag maps to one or more stations (primary first).
const TAG_MAP = {
	"mcp": ["agent-access", "machine-readable-docs"],
	"claude": ["agent-access"],
	"ai-coding": ["agent-access"],
	"a2ui": ["agent-access"],
	"visual builder": ["agent-access"],
	"prompting": ["agent-access"],
	"cursor": ["agent-access"],
	"vibe coding": ["agent-access"],
	"agent": ["agent-access"],
	"figma": ["orchestration"],
	"tokens": ["orchestration"],
	"design-tokens": ["orchestration"],
	"design tokens": ["orchestration"],
	"storybook": ["orchestration"],
	"workflow": ["orchestration"],
	"handoff": ["orchestration"],
	"documentation": ["machine-readable-docs"],
	"context engineering": ["machine-readable-docs"],
	"context-based design systems": ["machine-readable-docs"],
	"cbds": ["machine-readable-docs"],
	"ai-architecture": ["machine-readable-docs"],
	"api": ["shared-language"],
	"props": ["shared-language"],
	"terminology": ["shared-language"],
	"vocabulary": ["shared-language"],
	"language": ["shared-language"],
	"components": ["coverage-gaps"],
	"linting": ["testing-validation"],
	"standards": ["best-practices"],
	"process": ["governance-version-control"],
	"advocacy": ["feedback-adoption"],
	"case-study": ["feedback-adoption"],
};

// Weak signal: keyword hit in title + summary. Precise patterns to limit noise.
const KEYWORD_MAP = [
	["accessibility", /accessib|a11y|wcag|screen reader|inclusive design/i],
	["testing-validation", /\btesting\b|\bevals?\b|\blint(ing)?\b|visual regression|unit test|\bQA\b/i],
	["governance-version-control", /governance|version control|contribution guideline|release process|changelog|versioning/i],
	["shared-language", /shared language|naming convention|taxonomy|component api|semantic token/i],
	["best-practices", /best practice|cascade of quality|quality bar|\bcraft\b/i],
	["feedback-adoption", /adoption|advocacy|feedback loop|evangel/i],
	["coverage-gaps", /component librar|coverage gap|component inventory|missing component/i],
	["orchestration", /design token|design-to-code|design to code|\bparity\b|synchroniz/i],
	["machine-readable-docs", /machine-readable|llms?\.txt|context file|design\.md|documentation/i],
	["agent-access", /\bmcp\b|coding agent|claude code|\bcursor\b|vibe cod/i],
];

const MAX_STATIONS = 4;

function classify(data) {
	const tags = (data.tags || []).map((t) =>
		(typeof t === "string" ? t.split("|")[0] : t.name || "").toLowerCase().trim()
	);
	const text = `${data.title || ""} ${data.slackSummary || ""}`;

	const fromTags = [];
	for (const tag of tags) {
		for (const st of TAG_MAP[tag] || []) {
			if (!fromTags.includes(st)) fromTags.push(st);
		}
	}
	const fromKeywords = [];
	for (const [st, re] of KEYWORD_MAP) {
		if (re.test(text) && !fromTags.includes(st) && !fromKeywords.includes(st)) {
			fromKeywords.push(st);
		}
	}

	const stations = [...fromTags, ...fromKeywords].filter((s) => VALID.has(s)).slice(0, MAX_STATIONS);
	let confidence = "low";
	if (fromTags.length) confidence = "high";
	else if (fromKeywords.length) confidence = "medium";
	return { stations, confidence };
}

// Insert stations + confidence before the closing --- of frontmatter.
// Newline-agnostic: handles a closing `---` with or without a trailing newline
// (some frontmatter-only files end in `---` at EOF).
function withStations(raw, stations, confidence) {
	const block =
		(stations.length
			? "stations:\n" + stations.map((s) => `  - ${s}\n`).join("")
			: "stations: []\n") +
		`stationsConfidence: ${confidence}\n`;
	// m[1]: `---\n` + frontmatter body ending in a newline · m[2]: closing `---`
	// m[3]: trailing newline or EOF · m[4]: body
	const m = raw.match(/^(---\n[\s\S]*?\n)(---)(\r?\n|$)([\s\S]*)$/);
	if (!m) return raw; // no recognizable frontmatter — leave untouched
	return m[1] + block + m[2] + (m[3] || "\n") + m[4];
}

function main() {
	const files = fs.readdirSync(RESOURCES_DIR).filter((f) => f.endsWith(".md"));
	const stats = { classified: 0, skipped: 0, byConfidence: { high: 0, medium: 0, low: 0 }, byStation: {} };

	for (const file of files) {
		const p = path.join(RESOURCES_DIR, file);
		const raw = fs.readFileSync(p, "utf8");
		const { data } = matter(raw);

		if ("stations" in data && !FORCE) { stats.skipped++; continue; }

		const { stations, confidence } = classify(data);
		stats.classified++;
		stats.byConfidence[confidence]++;
		for (const s of stations) stats.byStation[s] = (stats.byStation[s] || 0) + 1;

		if (!DRY) {
			// If forcing, strip any existing stations/confidence lines first.
			let base = raw;
			if (FORCE) {
				base = raw
					.replace(/^stations:\s*(\[\])?\s*\n(?:\s+-\s+.*\n)*/m, "")
					.replace(/^stationsConfidence:.*\n/m, "");
			}
			fs.writeFileSync(p, withStations(base, stations, confidence), "utf8");
		}
	}

	console.log(`\n${DRY ? "[dry run] " : ""}Classified ${stats.classified}, skipped ${stats.skipped} (already tagged).`);
	console.log("Confidence:", stats.byConfidence);
	console.log("Per-station counts:");
	Object.entries(stats.byStation).sort((a, b) => b[1] - a[1])
		.forEach(([s, n]) => console.log(`  ${String(n).padStart(3)}  ${s}`));
}

main();
