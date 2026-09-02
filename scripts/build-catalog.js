#!/usr/bin/env node
/**
 * Build the component catalog from eddie-brain.
 *
 * The adaptive stage may only compose UI from a trusted catalog. Rather than
 * hand-typing that catalog, this script asks eddie-brain (the design
 * system's own MCP server, https://ds.bradfrost.com/mcp) for each Eddie
 * component the stage knows how to render, and writes the result to
 * _data/catalog.json — intent, when-to-use, when-not-to-use, props — so the
 * engine (heuristic or model) chooses shapes from the design system's own
 * knowledge, and the "View the catalog" panel can show where it came from.
 *
 * Usage: node scripts/build-catalog.js   (npm run build:catalog)
 *
 * The output is committed. Re-run when Eddie ships new components or when a
 * new node is added to NODES below. Talks plain MCP over Streamable HTTP —
 * no SDK, ~60 lines.
 */
const fs = require("fs");
const path = require("path");

const MCP_URL = process.env.EDDIE_BRAIN_URL || "https://ds.bradfrost.com/mcp";
const OUT = path.join(__dirname, "..", "_data", "catalog.json");

/**
 * The stage's node vocabulary. Each node maps to the Eddie components that
 * render it; `primary` is the one whose eddie-brain record defines the node's
 * intent. `use` is the routing hint the engine reads — written in the same
 * register as eddie-brain's own guidelines so the two read as one document.
 */
const NODES = [
	{
		node: "summary",
		primary: "ed-text-passage",
		components: ["ed-text-passage"],
		use: "Always first: one short paragraph framing everything the reader is about to see. Never more than one paragraph.",
		props: { text: "string" },
	},
	{
		node: "videoGrid",
		primary: "ed-card",
		components: ["ed-grid", "ed-card", "ed-tag"],
		use: "Course video lessons that answer the ask. A grid of cards, each opening the lesson in a new tab. Lead with this whenever lessons match — lessons outrank everything else.",
		props: { heading: "string", items: "lesson ids (3–9)" },
	},
	{
		node: "definition",
		primary: "ed-text-passage",
		components: ["ed-heading", "ed-text-passage", "ed-tag-list", "ed-tag"],
		use: "A glossary term the ask names or clearly circles. Dictionary-entry treatment: the term, its definition, the lessons where it's taught. Distinct from a link card on purpose.",
		props: { terms: "term slugs (1–3)" },
	},
	{
		node: "resourceTimeline",
		primary: "ed-timeline",
		components: ["ed-timeline", "ed-r-timeline-node-link"],
		use: "Articles, tools, and links from the collection, newest first, with essential reading marked. The default shape for resources — a dated list, not a grid of identical cards. Also the shape for 'what's new' asks.",
		props: { heading: "string", items: "resource ids (4–12)" },
	},
	{
		node: "table",
		primary: "ed-table",
		components: ["ed-table", "ed-table-header", "ed-table-body", "ed-table-row", "ed-table-cell"],
		use: "Comparison asks — 'which tools', 'compare X and Y', 'what are my options'. Rows are resources, columns are the facts that separate them (type, tags, added). Never for layout.",
		props: { heading: "string", items: "resource ids (3–12)", columns: "optional column keys" },
	},
	{
		node: "tabs",
		primary: "ed-tabs",
		components: ["ed-tabs", "ed-tab", "ed-card"],
		use: "Lessons that span several chapters, or an ask about a learning path — one tab per chapter so the reader can see the shape of the course.",
		props: { heading: "string", groups: "[{label, items: lesson ids}]" },
	},
	{
		node: "barChart",
		primary: "ed-r-bar-chart",
		components: ["ed-r-bar-chart"],
		use: "Quantitative asks about the collection itself — counts per month, per tag, per type. The chart carries its own accessible data table. Only when the ask is genuinely about numbers.",
		props: { heading: "string", labels: "string[]", datasets: "[{label, values}]", chartLabel: "string" },
	},
	{
		node: "statRow",
		primary: "ed-r-stat-card",
		components: ["ed-grid", "ed-r-stat-card"],
		use: "Three headline numbers about the result or the collection. Closes a view; never opens one.",
		props: { stats: "[{label, value, meta}] (exactly 3)" },
	},
	{
		node: "note",
		primary: "ed-alert",
		components: ["ed-alert"],
		use: "Low confidence, or an ask the collection genuinely can't answer. Say so plainly instead of guessing.",
		props: { heading: "string", text: "string" },
	},
];

let sessionId = null;
let nextId = 1;

async function rpc(method, params) {
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json, text/event-stream",
	};
	if (sessionId) headers["Mcp-Session-Id"] = sessionId;
	const res = await fetch(MCP_URL, {
		method: "POST",
		headers,
		body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
	});
	if (!sessionId && res.headers.get("mcp-session-id")) sessionId = res.headers.get("mcp-session-id");
	if (!res.ok) throw new Error(`${method}: HTTP ${res.status}`);
	const text = await res.text();
	// Streamable HTTP may answer as JSON or as an SSE stream of JSON-RPC messages
	const payloads = text.trim().startsWith("{")
		? [JSON.parse(text)]
		: text.split("\n").filter((l) => l.startsWith("data:")).map((l) => JSON.parse(l.slice(5)));
	const reply = payloads.find((p) => p.id !== undefined);
	if (!reply) throw new Error(`${method}: no JSON-RPC reply`);
	if (reply.error) throw new Error(`${method}: ${reply.error.message}`);
	return reply.result;
}

async function getComponent(name) {
	const result = await rpc("tools/call", { name: "eddie_get_component", arguments: { name } });
	const text = result?.content?.find((c) => c.type === "text")?.text;
	if (!text) throw new Error(`eddie_get_component(${name}) returned no text`);
	return JSON.parse(text);
}

function trim(list, n) {
	return (list || []).slice(0, n);
}

async function main() {
	const init = await rpc("initialize", {
		protocolVersion: "2025-03-26",
		capabilities: {},
		clientInfo: { name: "ai-design-systems-resources/build-catalog", version: "0.1" },
	});
	console.log(`eddie-brain ${init.serverInfo?.version} at ${MCP_URL}`);

	const nodes = [];
	for (const n of NODES) {
		const record = await getComponent(n.primary);
		nodes.push({
			node: n.node,
			components: n.components,
			primary: n.primary,
			use: n.use,
			props: n.props,
			eddie: {
				displayName: record.displayName,
				atomicLevel: record.atomicLevel,
				package: record.package,
				intent: record.intent,
				use: trim(record.guidelines?.use, 3),
				dontUse: trim(record.guidelines?.dontUse, 3),
				properties: trim(record.properties, 8).map((p) => ({ name: p.name, type: p.type, options: p.options })),
			},
		});
		console.log(`  ✓ ${n.node} ← ${n.primary} (${record.atomicLevel})`);
	}

	const out = {
		source: MCP_URL,
		server: `eddie-brain ${init.serverInfo?.version}`,
		generated: new Date().toISOString(),
		nodes,
	};
	fs.writeFileSync(OUT, JSON.stringify(out, null, "\t") + "\n");
	console.log(`✅ wrote ${path.relative(process.cwd(), OUT)} (${nodes.length} nodes)`);
}

main().catch((err) => {
	console.error("build-catalog failed:", err.message);
	process.exit(1);
});
