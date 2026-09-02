/**
 * On-device intent engine for the adaptive resources layer — the floor.
 *
 * Takes a free-text ask + an optional lens (who you are), reads the
 * machine-readable corpus (/intel.json: resources, glossary terms, course
 * lesson pointers, and the component catalog generated from eddie-brain),
 * and emits an A2UI-shaped message list:
 *
 *   beginRendering  → which surface, which root
 *   surfaceUpdate   → a flat adjacency list of components (ids + children)
 *   dataModelUpdate → the data those components bind to, keyed by id
 *
 * The agent speaks structure and ids; the data model is filled from the
 * corpus; the renderer (<ed-r-c-adaptive-stage>) maps components onto Eddie
 * and refuses anything outside the catalog. Same contract whether the
 * "agent" is these deterministic heuristics or Claude behind the Netlify
 * compose function — that interchangeability is the whole lesson.
 */

export const SPEC_VERSION = "a2ui-eddie/0.2";
export const SURFACE_ID = "results";

/** Fallback node list if the catalog manifest is missing. */
export const FALLBACK_CATALOG = [
	"summary",
	"videoGrid",
	"definition",
	"resourceTimeline",
	"table",
	"tabs",
	"barChart",
	"statRow",
	"note",
];

export const LENSES = {
	designer: {
		label: "Designer new to AI",
		boostTags: { figma: 3, claude: 2, "ai-coding": 2, tools: 1, course: 1 },
	},
	engineer: {
		label: "DS engineer",
		boostTags: { mcp: 3, storybook: 2, code: 2, api: 2, documentation: 1 },
	},
	tokens: {
		label: "Token specialist",
		boostTags: { tokens: 3, "design-tokens": 3, figma: 1, documentation: 1 },
	},
	lead: {
		label: "DS lead",
		boostTags: { concepts: 2, culture: 2, ethics: 2, strategy: 3, process: 2 },
	},
	student: {
		label: "Course student",
		boostTags: { course: 3, concepts: 1 },
	},
	skeptic: {
		label: "Healthy skeptic",
		boostTags: { ethics: 3, culture: 2, concepts: 1, history: 2 },
	},
};

/** Keyword clusters → corpus tags. Grounded in the actual tag vocabulary. */
const TOPICS = [
	{ id: "mcp", words: ["mcp", "server", "protocol", "connect", "wire up", "hook up", "llm"], tags: ["mcp", "api", "claude"], label: "MCP & connecting systems to LLMs" },
	{ id: "figma", words: ["figma", "variables", "code connect", "design file", "figma make"], tags: ["figma"], label: "Figma & AI" },
	{ id: "tokens", words: ["token", "dtcg", "style dictionary", "pipeline", "theming", "dark mode"], tags: ["tokens", "design-tokens"], label: "Design tokens" },
	{ id: "docs", words: ["documentation", "docs", "machine-readable", "machine readability", "component.md", "design.md", "metadata", "readme", "ai-ready", "description"], tags: ["documentation"], label: "Machine-readable documentation" },
	{ id: "governance", words: ["boss", "manager", "leadership", "business case", "sunset", "ammunition", "pushback", "stakeholder", "obsolete", "roi", "politics", "convince", "governance"], tags: ["culture", "ethics", "strategy", "politics", "concepts", "process"], label: "Governance & making the case" },
	{ id: "genui", words: ["generative ui", "a2ui", "adaptive", "dynamic ui", "dynamic uis", "diffusion", "gen ui", "generated interface"], tags: ["a2ui", "concepts", "visual builder"], label: "Generative & adaptive UI" },
	{ id: "coding", words: ["claude code", "cursor", "vibe", "agent", "coding", "prompt", "skill", "skills", "subagent", "workflow", "rules", "agents.md"], tags: ["ai-coding", "claude", "prompting", "workflow", "context engineering", "cursor"], label: "Agentic coding workflows" },
	{ id: "storybook", words: ["storybook", "story ui", "stories"], tags: ["storybook"], label: "Storybook" },
	{ id: "sync", words: ["sync", "synchroniz", "in sync", "drift", "parity", "design and code", "design & code"], tags: ["figma", "mcp", "code"], label: "Keeping design and code in sync" },
	{ id: "testing", words: ["test", "testing", "qa", "eval", "lint", "audit"], tags: ["linting", "assessment"], label: "Testing & evaluation" },
	{ id: "community", words: ["community", "slack", "who else", "people"], tags: ["community"], label: "Community" },
];

const LATEST_WORDS = ["latest", "what's new", "whats new", "recent", "this week", "this month", "catch up", "stay current", "keep up", "newest", "fresh"];
const START_WORDS = ["start", "begin", "new to", "beginner", "overwhelmed", "where do i", "first step", "basics"];
const CHART_WORDS = ["month-by-month", "month by month", "per month", "breakdown", "how many", "chart", "graph", "over time", "by month", "by tag", "by type", "per tag", "per type", "count", "growth", "trend"];
const COMPARE_WORDS = ["compare", "comparison", "versus", " vs ", "which tools", "which tool", "what tools", "worth it", "options", "difference between", "when do i use which", "which should i"];
const PATH_WORDS = ["chapter", "which videos", "what videos", "which lessons", "learning path", "should i watch", "curriculum", "course videos"];

function norm(s) {
	return (s || "").toLowerCase().replace(/[^\w\s.'&-]/g, " ").replace(/\s+/g, " ").trim();
}

function daysSince(iso) {
	if (!iso) return 9999;
	return (Date.now() - new Date(iso).getTime()) / 86400000;
}

/** Freshness label for timestamps-on-everything (requested by the community). */
export function freshness(iso) {
	const d = daysSince(iso);
	if (d <= 7) return { label: "this week", hot: true };
	if (d <= 31) return { label: "this month", hot: true };
	if (d <= 92) return { label: "this quarter", hot: false };
	return { label: null, hot: false };
}

const STOP = new Set(["what", "does", "with", "that", "this", "from", "have", "into", "your", "when", "which", "should", "where", "about", "using", "like", "look", "make", "need", "want", "them", "they", "there", "their", "will", "just", "really", "much", "more", "some", "than", "then", "also", "been", "being", "were", "would", "could", "know", "help", "show", "give", "tell", "find", "resources", "added", "website", "site"]);

function askWords(ask) {
	return norm(ask)
		.split(" ")
		.map((w) => w.replace(/[.'&-]+$/g, ""))
		.filter((w) => w.length > 3 && !STOP.has(w));
}

function matchTerms(ask, terms) {
	const q = norm(ask);
	if (!q) return [];
	const hits = [];
	for (const t of terms) {
		const names = [t.term, ...(t.aliases || [])].map(norm).filter(Boolean);
		if (names.some((n) => n.length > 2 && q.includes(n))) hits.push(t);
	}
	// Longest term match first — "generative ui" beats "ui"
	return hits.sort((a, b) => b.term.length - a.term.length).slice(0, 3);
}

function detectTopics(ask) {
	const q = norm(ask);
	return TOPICS.filter((t) => t.words.some((w) => q.includes(w)));
}

function scoreLessons({ ask, topics, lessons }) {
	const q = norm(ask);
	const words = askWords(ask);
	const topicTags = new Set(topics.flatMap((t) => t.tags));
	const wantsTJ = /\btj\b|pitre|southleft/.test(q);
	return lessons
		.map((l) => {
			let score = 0;
			const why = [];
			const title = norm(l.title);
			const summary = norm(l.summary || "");
			const tags = (l.tags || []).map(norm);
			if (q.length > 6 && title.includes(q)) { score += 8; why.push("title matches the ask"); }
			for (const w of words) {
				if (title.includes(w)) score += 3;
				else if (tags.some((t) => t.includes(w))) score += 2;
				else if (summary.includes(w)) score += 1;
			}
			for (const t of tags) if (topicTags.has(t)) score += 1.5;
			if (wantsTJ && (l.presenters || []).some((p) => /tj/i.test(p))) { score += 3; why.push("TJ's lesson"); }
			return { l, score, why };
		})
		.filter((s) => s.score >= 3)
		.sort((a, b) => b.score - a.score);
}

function scoreResources({ ask, lens, topics, resources, wantLatest }) {
	const q = norm(ask);
	const words = askWords(ask);
	const topicTags = new Set(topics.flatMap((t) => t.tags));
	const boost = (lens && LENSES[lens]?.boostTags) || {};

	const scored = resources.map((r) => {
		let score = 0;
		const why = [];
		for (const tag of r.tags) {
			if (topicTags.has(tag)) { score += 3; why.push(tag); }
			if (boost[tag]) score += boost[tag];
			if (tag.length > 2 && q.includes(tag)) { score += 3; why.push(tag); }
		}
		const title = norm(r.title);
		const summary = norm(r.summary || "");
		for (const w of words) {
			if (title.includes(w)) score += 2;
			else if (summary.includes(w)) score += 1;
		}
		const age = daysSince(r.created);
		if (wantLatest) score += Math.max(0, 10 - age / 9);
		else score += Math.max(0, 2 - age / 90);
		if (r.source === "slack" && r.summary) score += 0.5;
		if (r.essential && score > 0 && !wantLatest) { score += 4; why.push("essential"); }
		return { r, score, why };
	});

	const max = Math.max(...scored.map((s) => s.score), 1);
	return scored
		.filter((s) => s.score > (wantLatest ? 2 : 3))
		.sort((a, b) => (wantLatest ? new Date(b.r.created) - new Date(a.r.created) : b.score - a.score))
		.map((s) => ({ ...s, fit: Math.min(99, Math.round((s.score / max) * 100)) }));
}

/* ------------------------------------------------------------------------ */
/* Chart data — quantitative asks about the collection itself               */
/* ------------------------------------------------------------------------ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function chartFor(ask, intel) {
	const q = norm(ask);
	const yearMatch = q.match(/\b(20\d\d)\b/);
	const year = yearMatch ? Number(yearMatch[1]) : null;
	const items = intel.resources.filter((r) => r.created && (!year || new Date(r.created).getFullYear() === year));

	if (q.includes("by tag") || q.includes("per tag") || q.includes("topic")) {
		const counts = new Map();
		for (const r of items) for (const t of r.tags) counts.set(t, (counts.get(t) || 0) + 1);
		const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
		return {
			heading: `Resources by tag${year ? ` in ${year}` : ""}`,
			chartLabel: `Number of resources per tag${year ? ` added in ${year}` : ""}`,
			orientation: "horizontal",
			labels: top.map(([t]) => t),
			datasets: [{ label: "Resources", values: top.map(([, n]) => n) }],
		};
	}
	if (q.includes("by type") || q.includes("per type")) {
		const counts = new Map();
		for (const r of items) counts.set(r.type || "untyped", (counts.get(r.type || "untyped") || 0) + 1);
		const top = [...counts.entries()].sort((a, b) => b[1] - a[1]);
		return {
			heading: `Resources by type${year ? ` in ${year}` : ""}`,
			chartLabel: `Number of resources per type${year ? ` added in ${year}` : ""}`,
			orientation: "vertical",
			labels: top.map(([t]) => t),
			datasets: [{ label: "Resources", values: top.map(([, n]) => n) }],
		};
	}
	// Default: month by month
	const counts = new Map();
	for (const r of items) {
		const d = new Date(r.created);
		const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
		counts.set(key, (counts.get(key) || 0) + 1);
	}
	const keys = [...counts.keys()].sort();
	return {
		heading: `Resources added${year ? ` in ${year}` : ""}, month by month`,
		chartLabel: `Number of resources added to the collection per month${year ? ` in ${year}` : ""}`,
		orientation: "vertical",
		labels: keys.map((k) => `${MONTHS[Number(k.slice(5)) - 1]}${year ? "" : ` ${k.slice(2, 4)}`}`),
		datasets: [{ label: "Resources added", values: keys.map((k) => counts.get(k)) }],
	};
}

/* ------------------------------------------------------------------------ */
/* The main entry: ask + lens + corpus → A2UI-shaped message list           */
/* ------------------------------------------------------------------------ */

export function composeSpec({ ask = "", lens = null, intel }) {
	const started = performance.now();
	const q = norm(ask);
	const topics = detectTopics(ask);
	const terms = matchTerms(ask, intel.terms);
	const wantLatest = LATEST_WORDS.some((w) => q.includes(w));
	const wantStart = START_WORDS.some((w) => q.includes(w));
	const wantChart = CHART_WORDS.some((w) => q.includes(w)) && !terms.length;
	const wantCompare = COMPARE_WORDS.some((w) => q.includes(w));
	const wantPath = PATH_WORDS.some((w) => q.includes(w));
	const reasoning = [];

	if (lens && LENSES[lens]) reasoning.push(`Lens: ${LENSES[lens].label} — related topics weigh more.`);
	for (const t of topics) reasoning.push(`Detected topic: ${t.label}.`);
	for (const t of terms) reasoning.push(`“${t.term}” is a course glossary term — surfacing its definition and lessons.`);

	const lessons = scoreLessons({ ask, topics, lessons: intel.lessons });
	const ranked = scoreResources({ ask, lens, topics, resources: intel.resources, wantLatest });
	const essentialHits = ranked.slice(0, 12).filter((s) => s.r.essential).length;
	// How many lessons the chosen shape will actually show — the summary must
	// not promise nine when the grid renders six.
	const lessonCap = wantPath ? 15 : wantCompare || wantLatest ? 3 : wantStart ? 3 : 6;
	const shownLessons = lessons.slice(0, lessonCap);
	const tjCount = shownLessons.filter((s) => (s.l.presenters || []).some((p) => /tj/i.test(p))).length;

	const components = [];
	const rootChildren = [];
	const add = (id, component, props) => {
		components.push({ id, component, props });
		rootChildren.push(id);
	};

	let shape = "default";
	let summary = "";

	if (wantChart) {
		shape = "chart";
		const chart = chartFor(ask, intel);
		reasoning.push("You asked about numbers — composing a chart, not a list. The chart carries its own data table.");
		summary = `A numbers question gets a chart, not a list: ${chart.chartLabel.toLowerCase()}. Every bar is backed by the collection below.`;
		add("chart", "barChart", chart);
		add("stats", "statRow", { stats: "collection" });
	} else if (!lessons.length && !terms.length && !ranked.length) {
		shape = "none";
		reasoning.push("No confident match — showing the shape of the collection instead of guessing.");
		summary = "Nothing in the collection matched that with confidence. Low confidence gets honesty, not hallucination — try rephrasing, or browse the collection below.";
		add("note", "note", { heading: "Low confidence, high honesty", text: summary });
		add("stats", "statRow", { stats: "collection" });
	} else {
		const parts = [];
		if (lessons.length) parts.push(`${shownLessons.length === 1 ? "one course lesson" : `${shownLessons.length} course lessons`}${tjCount ? (tjCount === shownLessons.length ? " from TJ" : ` (${tjCount} TJ's)`) : ""}`);
		if (terms.length) parts.push(`${terms.length === 1 ? "one glossary term" : `${terms.length} glossary terms`}`);
		if (ranked.length) parts.push(`${Math.min(ranked.length, 12)} resources${essentialHits ? ` (${essentialHits} essential)` : ""}`);
		const lead = parts.length > 1 ? `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}` : parts[0];

		if (wantPath && lessons.length > 2) {
			shape = "path";
			reasoning.push("You asked about a path through the course — grouping lessons by chapter in tabs.");
			summary = `The course itself answers this best: ${lead}, grouped by chapter so you see the path, not just a list.`;
				const groups = new Map();
			for (const s of lessons.slice(0, 15)) {
				const key = s.l.chapter || "Other";
				if (!groups.has(key)) groups.set(key, []);
				groups.get(key).push(s.l.id);
			}
			add("path", "tabs", {
				heading: "Course lessons, by chapter",
				groups: [...groups.entries()].sort().map(([label, items]) => ({ label, items })),
			});
			if (terms.length) add("terms", "definition", { terms: terms.map((t) => t.slug) });
			if (ranked.length) add("reading", "resourceTimeline", { heading: "Then keep reading", items: ranked.slice(0, 6).map((s) => s.r.id) });
		} else if (wantCompare && ranked.length > 2) {
			shape = "compare";
			reasoning.push("You're comparing options — a table makes the differences scannable.");
			summary = `A comparison reads best as a table: ${lead}. Rows are the candidates, columns are what separates them.`;
				if (lessons.length) add("videos", "videoGrid", { heading: "Watch first", items: lessons.slice(0, 3).map((s) => s.l.id) });
			const tools = ranked.filter((s) => s.r.type === "tool" || s.r.tags.includes("tool") || s.r.tags.includes("tools"));
			const rows = (tools.length >= 3 ? tools : ranked).slice(0, 10).map((s) => s.r.id);
			add("compare", "table", { heading: "Side by side", items: rows });
			if (terms.length) add("terms", "definition", { terms: terms.map((t) => t.slug) });
		} else if (wantLatest) {
			shape = "latest";
			reasoning.push("You asked for recency — composing a timeline, newest first.");
			summary = `What's new${topics.length ? ` on ${topics.map((t) => t.label.toLowerCase()).join(", ")}` : ""}: ${lead}, newest first.`;
				const items = (ranked.length ? ranked : intel.resources.map((r) => ({ r }))).slice(0, 12).map((s) => s.r.id);
			add("latest", "resourceTimeline", { heading: topics.length ? `Latest on ${topics.map((t) => t.label.toLowerCase()).join(", ")}` : "The latest, newest first", items });
			if (lessons.length) add("videos", "videoGrid", { heading: "Recently relevant lessons", items: lessons.slice(0, 3).map((s) => s.l.id) });
		} else {
			shape = "default";
			if (wantStart) reasoning.push("Sounds like a starting point — leading with orientation, not depth.");
			if (lessons.length) reasoning.push(`${lessons.length} course lesson${lessons.length === 1 ? "" : "s"} match — lessons lead.`);
			if (essentialHits) reasoning.push(`${essentialHits} of the matching resources are flagged essential reading — they float up.`);
			summary = `${lead.charAt(0).toUpperCase()}${lead.slice(1)}. ${lessons.length ? "Lessons first — the deepest treatment" : "Ranked by fit"}${terms.length ? ", then the vocabulary" : ""}${ranked.length && (lessons.length || terms.length) ? ", then the reading" : ""}${wantStart ? ", orientation pieces first" : ""}.`;
				if (lessons.length) add("videos", "videoGrid", { heading: wantStart ? "Start with these lessons" : "Course lessons", items: shownLessons.map((s) => s.l.id) });
			if (terms.length) add("terms", "definition", { terms: terms.map((t) => t.slug) });
			if (ranked.length) add("reading", "resourceTimeline", { heading: wantStart ? "Then read these" : "From the collection", items: ranked.slice(0, wantStart ? 6 : 8).map((s) => s.r.id) });
		}
		add("stats", "statRow", { stats: "result", counts: { lessons: lessons.length, terms: terms.length, resources: ranked.length } });
	}

	const confidence = Math.min(
		0.95,
		0.25 + topics.length * 0.2 + (terms.length ? 0.2 : 0) + (lessons.length ? 0.2 : 0) + (ranked.length > 3 ? 0.1 : 0),
	);

	// The heuristics' summary is templated, so it isn't rendered as a node —
	// a fill-in-the-blanks sentence above every view is noise. It rides along
	// in the spec (the "why" panel shows it) and the model path, whose
	// summary is a real framing, emits its own summary node.
	const spec = {
		version: SPEC_VERSION,
		summary,
		engine: {
			kind: "heuristics",
			label: "On-device heuristics",
			detail: "Deterministic keyword routing in your browser. No server saw this ask.",
			model: null,
			latencyMs: Math.round(performance.now() - started),
			trace: [],
		},
		ask,
		lens,
		shape,
		confidence: Math.round(confidence * 100) / 100,
		reasoning,
		messages: [
			{ beginRendering: { surfaceId: SURFACE_ID, root: "root" } },
			{
				surfaceUpdate: {
					surfaceId: SURFACE_ID,
					components: [{ id: "root", component: "Column", children: rootChildren }, ...components],
				},
			},
		],
	};
	return hydrate(spec, intel);
}

/* ------------------------------------------------------------------------ */
/* Hydration — the data model, filled from the corpus                       */
/* ------------------------------------------------------------------------ */

/**
 * Append (or replace) the dataModelUpdate message: the agent emits ids, the
 * corpus supplies the records. Works on specs from the heuristics AND from
 * the model, so the renderer never has to trust an agent's copy of the data.
 */
export function hydrate(spec, intel) {
	const byResource = new Map(intel.resources.map((r) => [r.id, r]));
	const byLesson = new Map(intel.lessons.map((l) => [l.id, l]));
	const byTerm = new Map(intel.terms.map((t) => [t.slug, t]));
	const contents = { resources: {}, lessons: {}, terms: {} };
	const surface = spec.messages.find((m) => m.surfaceUpdate)?.surfaceUpdate;
	for (const c of surface?.components || []) {
		const p = c.props || {};
		const ids = [
			...(Array.isArray(p.items) ? p.items : []),
			...((p.groups || []).flatMap((g) => g.items || [])),
		];
		for (const id of ids) {
			if (byLesson.has(id)) contents.lessons[id] = byLesson.get(id);
			else if (byResource.has(id)) contents.resources[id] = byResource.get(id);
		}
		for (const slug of p.terms || []) if (byTerm.has(slug)) contents.terms[slug] = byTerm.get(slug);
	}
	const messages = spec.messages.filter((m) => !m.dataModelUpdate);
	messages.push({ dataModelUpdate: { surfaceId: SURFACE_ID, path: "/", contents } });
	return { ...spec, messages };
}

/** Suggested asks — real student questions, from the course FigJam and tickets. */
export const SUGGESTED_ASKS = [
	"Figma Console MCP",
	"How do I use AI and a design system to build adaptive, dynamic UIs with MCP?",
	"How do I connect my React design system to Figma Make via MCP?",
	"How do I keep design and code components in sync with AI?",
	"Skills vs rules vs agents.md vs MCP: when do I use which?",
	"The Figma plugin ecosystem is overwhelming. Which tools are worth it?",
	"Month by month, how many resources were added in 2026?",
	"What's new this month?",
];
