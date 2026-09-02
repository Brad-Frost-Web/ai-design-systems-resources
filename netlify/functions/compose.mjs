/**
 * Netlify Function: compose
 *
 * The model-backed agent for the adaptive resources stage. Receives an ask
 * (+ optional lens), hands Claude the component catalog (generated from
 * eddie-brain) and a compact digest of the corpus (lesson pointers, glossary
 * terms, resources — titles, tags, dates, never transcripts), and returns an
 * A2UI-shaped spec in exactly the contract the on-device heuristics use.
 * The client hydrates the data model from its own copy of the corpus, so
 * Claude only ever emits structure and ids.
 *
 * With `useBrain: true` the request also attaches eddie-brain
 * (https://ds.bradfrost.com/mcp) through the Messages API MCP connector, so
 * Claude can call eddie_search / eddie_get_component mid-ask; those calls
 * come back as a trace the stage renders under "Why am I seeing this?".
 *
 * Environment:
 *   ANTHROPIC_API_KEY   required
 *   COMPOSE_MODEL       default claude-sonnet-5
 *   COMPOSE_DAILY_CAP   default 400 asks per function instance per day
 *   COMPOSE_PER_MINUTE  default 8 asks per IP per minute
 *   URL                 set by Netlify; used to fetch /intel.json
 */
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.COMPOSE_MODEL || "claude-sonnet-5";
// Routing + JSON is a low-effort job; effort is the latency lever (Netlify
// sync functions must answer well inside 26s).
const EFFORT = process.env.COMPOSE_EFFORT || "low";
const DAILY_CAP = Number(process.env.COMPOSE_DAILY_CAP || 400);
const PER_MINUTE = Number(process.env.COMPOSE_PER_MINUTE || 8);
const BRAIN_URL = process.env.EDDIE_BRAIN_URL || "https://ds.bradfrost.com/mcp";
const INTEL_TTL_MS = 10 * 60 * 1000;

/* ------------------------------------------------------------------------ */
/* Abuse limits — in-memory, per function instance. Honest floor, not a wall. */
/* ------------------------------------------------------------------------ */
const perIp = new Map();
let daily = { day: "", count: 0 };

function limited(ip) {
	const today = new Date().toISOString().slice(0, 10);
	if (daily.day !== today) daily = { day: today, count: 0 };
	if (daily.count >= DAILY_CAP) return "daily cap reached";
	const now = Date.now();
	const hits = (perIp.get(ip) || []).filter((t) => now - t < 60_000);
	if (hits.length >= PER_MINUTE) return "too many asks this minute";
	hits.push(now);
	perIp.set(ip, hits);
	daily.count += 1;
	return null;
}

/* ------------------------------------------------------------------------ */
/* Corpus digest — compact, cacheable, no transcripts                        */
/* ------------------------------------------------------------------------ */
let intelCache = { at: 0, intel: null, digest: null };

async function loadIntel(origin) {
	if (intelCache.intel && Date.now() - intelCache.at < INTEL_TTL_MS) return intelCache;
	const res = await fetch(`${origin}/intel.json`);
	if (!res.ok) throw new Error(`intel.json ${res.status}`);
	const intel = await res.json();
	intelCache = { at: Date.now(), intel, digest: digestOf(intel) };
	return intelCache;
}

function digestOf(intel) {
	const lessons = intel.lessons
		.map((l) => `${l.id} | ${l.number} | ${l.title} | ${l.chapter} | ${(l.presenters || []).join("+") || "?"} | ${(l.tags || []).join(",")} | ${(l.summary || "").slice(0, 140)}`)
		.join("\n");
	const terms = intel.terms
		.map((t) => `${t.slug} | ${t.term}${t.aliases?.length ? ` (${t.aliases.join(", ")})` : ""} | ${(t.definition || "").slice(0, 110)}`)
		.join("\n");
	const resources = intel.resources
		.map((r) => `${r.id} | ${r.title} | ${r.type || "-"} | ${(r.tags || []).join(",")} | ${(r.created || "").slice(0, 10)}${r.essential ? " | ESSENTIAL" : ""}`)
		.join("\n");
	const catalog = intel.catalog.nodes
		.map((n) => `- ${n.node} → ${n.components.join(", ")}\n  use: ${n.use}\n  props: ${JSON.stringify(n.props)}\n  eddie says: ${n.eddie.intent}${n.eddie.dontUse?.length ? `\n  don't: ${n.eddie.dontUse.join(" / ")}` : ""}`)
		.join("\n");
	return { lessons, terms, resources, catalog, stats: statsOf(intel), generated: intel.catalog.generated, server: intel.catalog.server };
}

/**
 * Pre-aggregated numbers about the collection, so a quantitative ask is a
 * lookup rather than the model counting 300 dates by hand (slow, and off by
 * one). Month, type, and tag counts, overall and per year.
 */
function statsOf(intel) {
	const byMonth = new Map();
	const byType = new Map();
	const byTag = new Map();
	const byYear = new Map();
	for (const r of intel.resources) {
		if (!r.created) continue;
		const d = new Date(r.created);
		if (Number.isNaN(d.getTime())) continue;
		const y = d.getFullYear();
		const m = `${y}-${String(d.getMonth() + 1).padStart(2, "0")}`;
		byMonth.set(m, (byMonth.get(m) || 0) + 1);
		byYear.set(y, (byYear.get(y) || 0) + 1);
		byType.set(r.type || "untyped", (byType.get(r.type || "untyped") || 0) + 1);
		for (const t of r.tags || []) byTag.set(t, (byTag.get(t) || 0) + 1);
	}
	const fmt = (map, limit) => [...map.entries()].sort((a, b) => (typeof a[0] === "string" && /^\d{4}-\d\d$/.test(a[0]) ? a[0].localeCompare(b[0]) : b[1] - a[1])).slice(0, limit).map(([k, v]) => `${k}: ${v}`).join(", ");
	const lessonsByChapter = new Map();
	for (const l of intel.lessons) lessonsByChapter.set(l.chapter || "?", (lessonsByChapter.get(l.chapter || "?") || 0) + 1);
	return [
		`Resources added per month (YYYY-MM: count): ${fmt(byMonth, 40)}`,
		`Resources per year: ${[...byYear.entries()].sort().map(([k, v]) => `${k}: ${v}`).join(", ")}`,
		`Resources by type: ${fmt(byType, 20)}`,
		`Top tags (tag: count): ${fmt(byTag, 25)}`,
		`Lessons per chapter: ${[...lessonsByChapter.entries()].sort().map(([k, v]) => `${k}: ${v}`).join(", ")}`,
		`Totals: ${intel.counts.resources} resources (${intel.counts.essential} essential), ${intel.counts.lessons} lessons, ${intel.counts.terms} terms`,
	].join("\n");
}

function systemPrompt(d) {
	return `You are the composing agent for the AI & Design Systems resources site — a companion to Brad Frost's course. A visitor types what they're wrestling with; you answer by composing a small user interface from a fixed catalog of design-system components. You never write code or markup. You emit a JSON spec: which components, in what order, bound to which records by id. The renderer maps your spec onto the Eddie design system and refuses anything outside the catalog.

THE CATALOG (generated from ${d.server} — the design system's own knowledge of each component):
${d.catalog}

RULES
- The question leads the way. Pick the shape that fits the ask: a quantitative question gets barChart; a comparison gets table; a learning-path question gets tabs by chapter; a "what's new" ask gets resourceTimeline newest first; a term the visitor names gets definition. Don't reach for the same shape every time.
- Always start with exactly one "summary" component: one short paragraph (2–4 sentences) framing everything the visitor is about to see. Never more than one paragraph. Speak plainly, no hype.
- Weighting: course lessons outrank everything (surface them whenever they genuinely answer the ask — as videoGrid, or tabs when they span chapters); glossary terms rank next; resources marked ESSENTIAL rank above other resources. TJ Pitre presents the Figma Console MCP, FigmaLint, Company Docs, and testing lessons — when the ask is about those, lead with his lessons.
- Only use ids that appear in the digests below. Never invent records. 3–9 items per component; fewer, better.
- For barChart, take the numbers from COLLECTION STATS below (already aggregated — never recount the digest by hand) and put them in props.labels / props.datasets. Filter to the year or slice the ask implies. Set chartLabel to a full accessible sentence.
- End with one "statRow" ({"stats":"result","counts":{"lessons":N,"terms":N,"resources":N}}) unless the view is a chart, in which case use {"stats":"collection"}.
- If nothing fits with confidence, say so with a "note" and a low confidence — honesty over hallucination.
- Give 2–4 "reasoning" bullets in the second person ("You asked about… so…"), each under 20 words. If you consulted eddie-brain, say what you learned in one bullet.
- Be fast: decide the shape, pick the ids, write the JSON. No deliberation in the output.
- Confidence is 0–1.

OUTPUT: respond with ONLY a JSON object, no prose, no code fence:
{"summary": "...", "shape": "default|chart|compare|path|latest|none", "confidence": 0.0, "reasoning": ["..."], "components": [{"id": "summary", "component": "summary", "props": {"text": "..."}}, {"id": "...", "component": "<catalog node>", "props": {...}}]}
Component props follow the catalog: videoGrid {heading, items:[lesson ids]}; definition {terms:[slugs]}; resourceTimeline {heading, items:[resource ids]}; table {heading, items:[resource ids]}; tabs {heading, groups:[{label, items:[lesson ids]}]}; barChart {heading, chartLabel, orientation, labels:[...], datasets:[{label, values:[...]}]}; statRow as above; note {heading, text}.

COLLECTION STATS (pre-aggregated; use these for any chart or count):
${d.stats}

COURSE LESSONS (id | number | title | chapter | presenters | tags | summary):
${d.lessons}

GLOSSARY TERMS (slug | term (aliases) | definition):
${d.terms}

RESOURCES (id | title | type | tags | added | ESSENTIAL?):
${d.resources}`;
}

function extractJson(text) {
	const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
	const start = trimmed.indexOf("{");
	const end = trimmed.lastIndexOf("}");
	if (start < 0 || end < 0) throw new Error("no JSON object in model output");
	return JSON.parse(trimmed.slice(start, end + 1));
}

function json(statusCode, body) {
	return { statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) };
}

export const handler = async (event) => {
	if (event.httpMethod !== "POST") return json(405, { error: "POST only" });
	if (!process.env.ANTHROPIC_API_KEY) return json(503, { error: "ANTHROPIC_API_KEY is not configured" });

	let body;
	try {
		body = JSON.parse(event.body || "{}");
	} catch {
		return json(400, { error: "invalid JSON" });
	}
	const ask = String(body.ask || "").trim().slice(0, 400);
	const lens = body.lens ? String(body.lens).slice(0, 40) : null;
	const useBrain = Boolean(body.useBrain);
	if (!ask) return json(400, { error: "ask is required" });

	const ip = event.headers["x-nf-client-connection-ip"] || event.headers["client-ip"] || "anon";
	const limit = limited(ip);
	if (limit) return json(429, { error: limit });

	const origin = process.env.URL || `http://${event.headers.host}`;
	const started = Date.now();
	let intel;
	try {
		intel = await loadIntel(origin);
	} catch (err) {
		return json(502, { error: `corpus unavailable: ${err.message}` });
	}

	const client = new Anthropic();
	const system = [{ type: "text", text: systemPrompt(intel.digest), cache_control: { type: "ephemeral" } }];
	const user = `Lens: ${lens || "none"}\nAsk: ${ask}`;

	let response;
	try {
		if (useBrain) {
			response = await client.beta.messages.create({
				model: MODEL,
				max_tokens: 4000,
				output_config: { effort: EFFORT },
				betas: ["mcp-client-2025-11-20"],
				system,
				mcp_servers: [{ type: "url", url: BRAIN_URL, name: "eddie-brain" }],
				tools: [{ type: "mcp_toolset", mcp_server_name: "eddie-brain" }],
				messages: [
					{
						role: "user",
						content: `${user}\n\nCall eddie-brain exactly once (eddie_search with a short phrase describing the shape you're considering, e.g. "compare tabular data") to check the fit, then answer with the JSON object only.`,
					},
				],
			});
		} else {
			response = await client.messages.create({
				model: MODEL,
				max_tokens: 4000,
				output_config: { effort: EFFORT },
				system,
				messages: [{ role: "user", content: user }],
			});
		}
	} catch (err) {
		const status = err instanceof Anthropic.APIError ? err.status : 502;
		return json(status || 502, { error: `model error: ${err.message}` });
	}

	if (response.stop_reason === "refusal") return json(200, { error: "the model declined this ask" });

	const trace = [];
	let text = "";
	for (const block of response.content) {
		if (block.type === "text") text += block.text;
		else if (block.type === "mcp_tool_use") trace.push({ tool: block.name, input: block.input, result: null });
		else if (block.type === "mcp_tool_result") {
			const last = trace[trace.length - 1];
			const content = Array.isArray(block.content) ? block.content.map((c) => c.text || "").join(" ") : String(block.content || "");
			if (last) last.result = content.slice(0, 400);
		}
	}

	let parsed;
	try {
		parsed = extractJson(text);
	} catch (err) {
		return json(502, { error: `model returned no spec: ${err.message}` });
	}

	const components = Array.isArray(parsed.components) ? parsed.components : [];
	const spec = {
		version: "a2ui-eddie/0.2",
		engine: {
			kind: "claude",
			label: `Claude${useBrain ? " + eddie-brain" : ""}`,
			detail: `${MODEL} composed this view from the same catalog, in one round trip. ${trace.length ? `It consulted eddie-brain ${trace.length} time${trace.length === 1 ? "" : "s"}. ` : ""}Nothing is stored.`,
			model: response.model || MODEL,
			latencyMs: Date.now() - started,
			trace,
			usage: {
				input: response.usage?.input_tokens,
				cached: response.usage?.cache_read_input_tokens,
				output: response.usage?.output_tokens,
			},
		},
		ask,
		lens,
		shape: parsed.shape || "default",
		confidence: typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
		reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning.slice(0, 6) : [],
		messages: [
			{ beginRendering: { surfaceId: "results", root: "root" } },
			{
				surfaceUpdate: {
					surfaceId: "results",
					components: [{ id: "root", component: "Column", children: components.map((c) => c.id) }, ...components],
				},
			},
		],
	};
	return json(200, spec);
};
