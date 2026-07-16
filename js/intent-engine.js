/**
 * On-device intent engine for the adaptive resources layer.
 *
 * Takes a free-text ask + an optional lens (who you are), reads the
 * machine-readable corpus (/intel.json), and emits a declarative UI spec —
 * an A2UI-style payload whose vocabulary is limited to a trusted component
 * catalog rendered by <ed-r-c-adaptive-stage>. No server, no tracking, no
 * model: deterministic heuristics that run in the time it takes to blink.
 *
 * The spec is deliberately inspectable ("View the UI spec" in the stage) —
 * the point of the demo is that an agent talks to a design system in data,
 * not in code.
 */

export const SPEC_VERSION = "resources-a2ui/0.1";

/**
 * The trusted catalog: every surface component the engine may request.
 * The renderer refuses anything outside this list — the design system is
 * the guardrail that keeps generated UI safe.
 */
export const CATALOG = ["note", "termCards", "timeline", "cardGrid", "statRow"];

export const LENSES = {
	designer: {
		label: "Designer new to AI",
		boostTags: { figma: 3, claude: 2, "ai-coding": 2, tools: 1, course: 1 },
		suggestion: "Where do I even start with AI as a designer?",
	},
	engineer: {
		label: "DS engineer",
		boostTags: { mcp: 3, storybook: 2, code: 2, api: 2, documentation: 1 },
		suggestion: "How do I connect my design system to an LLM?",
	},
	tokens: {
		label: "Token specialist",
		boostTags: { tokens: 3, "design-tokens": 3, figma: 1, documentation: 1 },
		suggestion: "What's the state of token pipelines and DTCG?",
	},
	lead: {
		label: "DS lead",
		boostTags: { concepts: 2, culture: 2, ethics: 2, strategy: 3, process: 2 },
		suggestion: "I need ammunition: leadership says AI makes our design system obsolete.",
	},
	student: {
		label: "Course student",
		boostTags: { course: 3, concepts: 1 },
		suggestion: "Give me the companion links for Chapter 5.",
	},
	skeptic: {
		label: "Healthy skeptic",
		boostTags: { ethics: 3, culture: 2, concepts: 1, history: 2 },
		suggestion: "Give me the case against the hype.",
	},
};

/** Keyword clusters → corpus tags. Grounded in the actual tag vocabulary. */
const TOPICS = [
	{ id: "mcp", words: ["mcp", "server", "protocol", "connect", "wire up", "hook up", "llm"], tags: ["mcp", "api", "claude"], label: "MCP & connecting systems to LLMs" },
	{ id: "figma", words: ["figma", "variables", "code connect", "design file"], tags: ["figma"], label: "Figma & AI" },
	{ id: "tokens", words: ["token", "dtcg", "style dictionary", "pipeline", "theming"], tags: ["tokens", "design-tokens"], label: "Design tokens" },
	{ id: "docs", words: ["documentation", "docs", "machine-readable", "component.md", "design.md", "metadata", "readme", "ai-ready"], tags: ["documentation"], label: "Machine-readable documentation" },
	{ id: "governance", words: ["boss", "manager", "leadership", "business case", "sunset", "ammunition", "pushback", "stakeholder", "obsolete", "roi", "politics", "convince"], tags: ["culture", "ethics", "strategy", "politics", "concepts", "process"], label: "Governance & making the case" },
	{ id: "genui", words: ["generative ui", "a2ui", "adaptive", "diffusion", "gen ui", "generated interface"], tags: ["a2ui", "concepts", "visual builder"], label: "Generative & adaptive UI" },
	{ id: "coding", words: ["claude code", "cursor", "vibe", "agent", "coding", "prompt", "skill", "subagent", "workflow"], tags: ["ai-coding", "claude", "prompting", "workflow", "context engineering"], label: "Agentic coding workflows" },
	{ id: "storybook", words: ["storybook", "story ui", "stories"], tags: ["storybook"], label: "Storybook" },
	{ id: "community", words: ["community", "slack", "who else", "people"], tags: ["community"], label: "Community" },
];

const LATEST_WORDS = ["latest", "what's new", "whats new", "recent", "this week", "this month", "catch up", "stay current", "keep up", "newest", "fresh"];
const START_WORDS = ["start", "begin", "new to", "beginner", "overwhelmed", "where do i", "first step", "basics"];

function norm(s) {
	return (s || "").toLowerCase().replace(/[^\w\s.'-]/g, " ").replace(/\s+/g, " ").trim();
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

function scoreResources({ ask, lens, topics, resources, wantLatest }) {
	const q = norm(ask);
	const askWords = q.split(" ").filter((w) => w.length > 3);
	const topicTags = new Set(topics.flatMap((t) => t.tags));
	const boost = (lens && LENSES[lens]?.boostTags) || {};

	const scored = resources.map((r) => {
		let score = 0;
		const why = [];
		for (const tag of r.tags) {
			if (topicTags.has(tag)) { score += 3; why.push(tag); }
			if (boost[tag]) score += boost[tag];
			// Direct tag mentions in the ask (e.g. from the constellation)
			if (tag.length > 2 && q.includes(tag)) { score += 3; why.push(tag); }
		}
		const title = norm(r.title);
		const summary = norm(r.summary || "");
		for (const w of askWords) {
			if (title.includes(w)) score += 2;
			else if (summary.includes(w)) score += 1;
		}
		const age = daysSince(r.created);
		if (wantLatest) score += Math.max(0, 10 - age / 9); // strong recency pull
		else score += Math.max(0, 2 - age / 90); // mild freshness nudge
		if (r.source === "slack" && r.summary) score += 0.5; // human judgment attached
		return { r, score, why };
	});

	const max = Math.max(...scored.map((s) => s.score), 1);
	return scored
		.filter((s) => s.score > (wantLatest ? 2 : 3))
		.sort((a, b) => b.score - a.score)
		.map((s) => ({ ...s, fit: Math.min(99, Math.round((s.score / max) * 100)) }));
}

/**
 * The main entry: ask + lens + corpus → declarative UI spec.
 */
export function composeSpec({ ask = "", lens = null, intel }) {
	const topics = detectTopics(ask);
	const terms = matchTerms(ask, intel.terms);
	const wantLatest = LATEST_WORDS.some((w) => norm(ask).includes(w));
	const wantStart = START_WORDS.some((w) => norm(ask).includes(w));
	const reasoning = [];
	const surface = [];

	if (lens && LENSES[lens]) reasoning.push(`Lens: ${LENSES[lens].label} — related topics weigh more.`);
	for (const t of topics) reasoning.push(`Detected topic: ${t.label}.`);
	for (const t of terms) reasoning.push(`“${t.term}” is a course glossary term — surfacing its definition and lessons.`);
	if (wantLatest) reasoning.push("You asked for recency — composing a timeline instead of a grid.");
	if (wantStart) reasoning.push("Sounds like a starting point — leading with orientation, not depth.");

	const ranked = scoreResources({ ask, lens, topics, resources: intel.resources, wantLatest });

	// Glossary terms first: definitions anchor everything else.
	if (terms.length) {
		surface.push({ component: "termCards", props: { terms: terms.map((t) => t.slug) } });
	}

	if (wantLatest) {
		const items = ranked.length ? ranked : intel.resources.map((r) => ({ r, fit: null }));
		surface.push({
			component: "timeline",
			props: {
				heading: topics.length ? `Latest on ${topics.map((t) => t.label.toLowerCase()).join(", ")}` : "The latest, newest first",
				items: items.slice(0, 12).map((s) => s.r.id),
			},
		});
	} else if (ranked.length) {
		surface.push({
			component: "cardGrid",
			props: {
				heading: wantStart ? "Start here" : "Best matches, with fit scores",
				items: ranked.slice(0, wantStart ? 6 : 9).map((s) => ({ id: s.r.id, fit: s.fit })),
			},
		});
	}

	if (!surface.length) {
		reasoning.push("No confident match — showing the shape of the collection instead of guessing.");
		surface.push({
			component: "note",
			props: { text: "I couldn't map that to the collection with any confidence. Low confidence gets you honesty, not hallucination — try one of the suggested asks, or browse the constellation below." },
		});
		surface.push({ component: "statRow", props: { stats: "collection" } });
	} else {
		surface.push({ component: "statRow", props: { stats: "result", count: ranked.length } });
	}

	const confidence = Math.min(0.95, 0.25 + topics.length * 0.25 + (terms.length ? 0.2 : 0) + (ranked.length > 3 ? 0.15 : 0));

	return {
		version: SPEC_VERSION,
		engine: "on-device heuristics — no server, no tracking, no model",
		ask,
		lens,
		confidence: Math.round(confidence * 100) / 100,
		reasoning,
		surface,
	};
}

/** Suggested asks — the questions the community actually keeps asking. */
export const SUGGESTED_ASKS = [
	"How do I make my design system AI-ready?",
	"Show me the latest",
	"How do I connect my design system to an LLM?",
	"I need ammunition: my boss says AI makes design systems obsolete",
	"What is generative UI?",
	"Where do I start? I'm overwhelmed.",
];
