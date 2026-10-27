/** Ranking and aggregation adapted from the recorded Chameleon exploration. */
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
	{ id: "mcp", words: ["mcp", "server", "protocol", "connect", "wire up", "hook up", "llm"], tags: ["mcp", "api", "claude", "figma console mcp"], titleWords: ["mcp"], label: "MCP & connecting systems to LLMs" },
	{ id: "figma", words: ["figma", "variables", "code connect", "design file", "figma make", "plugin"], tags: ["figma", "figmalint", "figma make", "code connect"], titleWords: ["figma", "figmalint"], label: "Figma & AI" },
	{ id: "tokens", words: ["token", "dtcg", "style dictionary", "pipeline", "theming", "dark mode"], tags: ["tokens", "design-tokens", "design tokens"], titleWords: ["token", "theme", "dark mode"], label: "Design tokens" },
	{ id: "docs", words: ["documentation", "docs", "machine-readable", "machine readability", "component.md", "design.md", "metadata", "readme", "ai-ready", "description"], tags: ["documentation"], titleWords: ["docs", "documentation", "readme", "description"], label: "Machine-readable documentation" },
	{ id: "governance", words: ["boss", "manager", "leadership", "business case", "sunset", "ammunition", "pushback", "stakeholder", "obsolete", "roi", "politics", "convince", "governance"], tags: ["culture", "ethics", "strategy", "politics", "concepts", "process"], label: "Governance & making the case" },
	{ id: "genui", words: ["generative ui", "a2ui", "adaptive", "dynamic ui", "dynamic uis", "diffusion", "gen ui", "generated interface", "generate"], tags: ["a2ui", "generative ui", "visual builder", "prototyping"], titleWords: ["generat", "adaptive", "dynamic", "a2ui", "prototyp"], label: "Generative & adaptive UI" },
	{ id: "coding", words: ["claude code", "cursor", "vibe", "agent", "coding", "prompt", "skill", "skills", "subagent", "workflow", "rules", "agents.md"], tags: ["ai-coding", "claude", "prompting", "workflow", "context engineering", "cursor", "skills", "agents"], titleWords: ["claude code", "cursor", "skill", "agent", "rules", "guardrail"], label: "Agentic coding workflows" },
	{ id: "storybook", words: ["storybook", "story ui", "stories"], tags: ["storybook"], titleWords: ["storybook"], label: "Storybook" },
	{ id: "sync", words: ["sync", "synchroniz", "in sync", "drift", "parity", "design and code", "design & code"], tags: ["synchronization", "drift", "code connect"], titleWords: ["sync", "bidirectional", "translat", "drift", "parity"], label: "Keeping design and code in sync" },
	{ id: "testing", words: ["test", "testing", "qa", "eval", "lint", "audit"], tags: ["linting", "assessment", "testing", "evals"], titleWords: ["test", "lint", "eval", "audit", "inspection"], label: "Testing & evaluation" },
	{ id: "community", words: ["community", "slack", "who else", "people"], tags: ["community"], label: "Community" },
];

/** Multi-word phrases: an ask that names one and a title that carries it is a strong match. */
const PHRASES = ["figma console mcp", "figma make", "storybook mcp", "code connect", "design tokens", "claude code", "company docs", "dark mode", "login page", "login form", "generative ui", "figma mcp"];

/** Words in nearly every title in this corpus — they barely discriminate. */
const GENERIC = new Set(["design", "system", "systems", "ai", "build", "building", "use", "using", "tools", "tool", "component", "components", "course", "intro", "introduction"]);

function norm(s) {
	return (s || "").toLowerCase().replace(/[^\w\s.'&-]/g, " ").replace(/\s+/g, " ").trim();
}

function daysSince(iso) {
	if (!iso) return 9999;
	return (Date.now() - new Date(iso).getTime()) / 86400000;
}

const STOP = new Set(["what", "does", "with", "that", "this", "from", "have", "into", "your", "when", "which", "should", "where", "about", "using", "like", "look", "make", "need", "want", "them", "they", "there", "their", "will", "just", "really", "much", "more", "some", "than", "then", "also", "been", "being", "were", "would", "could", "know", "help", "show", "give", "tell", "find", "resources", "added", "website", "site"]);

function askWords(ask) {
	return norm(ask)
		.split(" ")
		.map((w) => w.replace(/[.'&-]+$/g, ""))
		.filter((w) => w.length > 3 && !STOP.has(w));
}

const GENERIC_TERMS = new Set(["design-system", "design-systems", "figma", "ai", "artificial-intelligence", "component", "agent", "code", "design"]);

export function matchTerms(ask, terms) {
	const q = norm(ask);
	if (!q) return [];
	const hits = [];
	for (const t of terms) {
		const names = [t.term, ...(t.aliases || [])].map(norm).filter(Boolean);
		if (names.some((n) => n.length > 2 && q.includes(n))) hits.push(t);
	}
	// Longest term match first — "generative ui" beats "ui". Umbrella terms
	// ("Design System", "Figma", "AI") only surface when nothing sharper did.
	const sorted = hits.sort((a, b) => b.term.length - a.term.length);
	const specific = sorted.filter((t) => !GENERIC_TERMS.has(t.slug));
	return (specific.length ? specific : sorted).slice(0, 3);
}

export function detectTopics(ask) {
	const q = norm(ask);
	return TOPICS.filter(t => t.words.some(w => {
		const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		return new RegExp(`(?:^|\\W)${escaped}(?:s|ing)?(?=\\W|$)`).test(q);
	}));
}

export function scoreLessons({ ask, topics, lessons, termLessonUrls = new Set() }) {
	const q = norm(ask);
	const words = askWords(ask);
	const topicTags = new Set(topics.flatMap((t) => t.tags));
	const wantsTJ = /\btj\b|pitre|southleft/.test(q);
	const phrases = PHRASES.filter((ph) => q.includes(ph));
	// Rarity-weighted tags: "generative ui" on two lessons says far more than
	// "mcp" on forty. Weight runs from ~5.5 (rare) down to 1.5 (everywhere).
	const tagFreq = new Map();
	for (const l of lessons) for (const t of l.tags || []) tagFreq.set(norm(t), (tagFreq.get(norm(t)) || 0) + 1);
	const tagWeight = (t) => 1.5 + 4 * (1 - Math.min(1, (tagFreq.get(t) || 0) / 25));
	return lessons
		.map((l) => {
			let score = 0;
			const why = [];
			const title = norm(l.title);
			const summary = norm(l.summary || "");
			const tags = (l.tags || []).map(norm);
			if (topics.some(t => t.id === 'tokens')) {
				// Design tokens are not authentication credentials or language-model tokens.
				if (/personal access token|tokenization/.test(title)) return {l, score:0, why};
				if (/variables|dark mode|theming|token|code and storybook/.test(title)) score += 6;
				if (/design tokens|token architecture|token system|theming/.test(summary)) score += 3;
			}
			if (q.length > 6 && title.includes(q)) { score += 8; why.push("title matches the ask"); }
			// Named phrases beat everything: the ask says "Figma Make", the title says "Figma Make".
			for (const ph of phrases) if (title.includes(ph)) { score += 10; why.push(ph); }
			// The glossary says this term is taught here — the strongest link we have.
			if (termLessonUrls.has(l.url)) { score += 5; why.push("taught in (glossary)"); }
			for (const w of words) {
				const weight = GENERIC.has(w) ? 0.5 : 1;
				if (title.includes(w)) score += 3 * weight;
				else if (tags.some((t) => t.includes(w))) score += 2 * weight;
				else if (summary.includes(w)) score += 1 * weight;
			}
			// Topic-specific words in the title (one hit per topic), then topic tags.
			for (const topic of topics) {
				if ((topic.titleWords || []).some((tw) => title.includes(tw))) { score += 4; why.push(topic.id); }
			}
			for (const t of tags) if (topicTags.has(t)) score += tagWeight(t);
			if (wantsTJ && (l.presenters || []).some((p) => /tj/i.test(p))) { score += 3; why.push("TJ's lesson"); }
			return { l, score, why };
		})
		.filter((s) => s.score >= 3)
		.sort((a, b) => b.score - a.score);
}

export function scoreResources({ ask, lens, topics, resources, wantLatest }) {
	const q = norm(ask);
	const words = askWords(ask);
	const topicTags = new Set(topics.flatMap((t) => t.tags));
	const boost = (lens && LENSES[lens]?.boostTags) || {};

	const scored = resources.map((r) => {
		let score = 0;
		let lensBoost = 0;
		const why = [];
		for (const tag of r.tags) {
			if (topicTags.has(tag)) { score += 3; why.push(tag); }
			if (boost[tag]) lensBoost += boost[tag];
			if (tag.length > 2 && q.includes(tag)) { score += 3; why.push(tag); }
		}
		const title = norm(r.title);
		const summary = norm(r.summary || "");
		for (const w of words) {
			if (title.includes(w)) score += 2;
			else if (summary.includes(w)) score += 1;
		}
		// A perspective, timestamp, or essential badge cannot create a topic match.
		if (score === 0) return {r, score:0, why};
		score += lensBoost;
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

export function chartFor(ask, intel) {
	const q = norm(ask);
	const yearMatch = q.match(/\b(20\d\d)\b/);
	const year = yearMatch ? Number(yearMatch[1]) : null;
	const topics = detectTopics(ask);
	const items = intel.resources.filter(r => Number.isFinite(Date.parse(r.created)) && (!year || new Date(r.created).getUTCFullYear() === year)
		&& (!topics.length || topics.some(topic => r.tags?.some(tag => topic.tags.includes(tag)) || (topic.titleWords || []).some(word => norm(r.title).includes(word)))));
	const scope = topics.length ? `Dated resources matching ${topics.map(t => t.label).join(', ')}` : 'All dated resources in the collection';
	const scopeLabel = topics.length ? topics.map(t => t.label).join(' / ') : 'Collection';

	if (q.includes("by tag") || q.includes("per tag") || q.includes("topic")) {
		const counts = new Map();
		for (const r of items) for (const t of r.tags) counts.set(t, (counts.get(t) || 0) + 1);
		const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
		return {
			heading: `${scopeLabel}: resources by tag${year ? ` in ${year}` : ""}`,
			scope,
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
			heading: `${scopeLabel}: resources by type${year ? ` in ${year}` : ""}`,
			scope,
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
		const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
		counts.set(key, (counts.get(key) || 0) + 1);
	}
	const keys = [...counts.keys()].sort();
	return {
		heading: `${scopeLabel}: resources added${year ? ` in ${year}` : ""}, month by month`,
		scope,
		chartLabel: `Number of resources added to the collection per month${year ? ` in ${year}` : ""}`,
		orientation: "vertical",
		labels: keys.map((k) => `${MONTHS[Number(k.slice(5)) - 1]}${year ? "" : ` ${k.slice(2, 4)}`}`),
		datasets: [{ label: "Resources added", values: keys.map((k) => counts.get(k)) }],
	};
}

