/** Sibling lesson data. The original artifact remains the source of its descriptions. */
const fs = require("node:fs");
const path = require("node:path");
const base = require("./rails.js");
const original = fs.readFileSync(path.join(__dirname, "resources/keep-ai-on-the-rails-claude.html"), "utf8");

function originalItem(id) {
	const match = original.match(new RegExp(`<li[^>]*data-id="${id}"[^>]*>([\\s\\S]*?)<\\/li>`));
	if (!match) throw new Error(`Missing original Rails description: ${id}`);
	return match[1];
}
function content(html, className) {
	const match = html.match(new RegExp(`<(?:p|div)[^>]*class="${className}"[^>]*>([\\s\\S]*?)<\\/(?:p|div)>`));
	if (!match) throw new Error(`Missing original Rails field: ${className}`);
	return match[1];
}
const conceptIcons = ["settings", "file-text", "link", "book-open", "check-square"];
const concepts = base.groups[0].pieces.map((piece, i) => {
	const source = originalItem(piece.id);
	return { ...piece, icon: conceptIcons[i], description: content(source, "cfg__meta"), example: content(source, "cfg__mine") };
});
const stations = [
	{ id: "s1", title: "Ground", detail: "Check the live catalog", icon: "search", in: 4, kind: "ai", uses: "cfg-standing cfg-project cfg-mcp pkg-brain", body: "Start with check_health. Read what exists now, rather than generating from memory or a previous session." },
	{ id: "s2", title: "Read the rules", detail: "Learn the constraints", icon: "file-text", in: 2, kind: "ai", uses: "cfg-standing cfg-project cfg-process", body: "Load the project’s rules and organizational standards. Instructions describe how to work; they do not enforce themselves." },
	{ id: "s3", title: "Consult", detail: "Ask what is real", icon: "link", in: 4, kind: "ai", uses: "cfg-mcp pkg-brain pkg-web-components pkg-design-tokens", body: "Ask eddie-brain for real components, props, slots and tokens. MCP connects the agent to the system’s machine-readable knowledge." },
	{ id: "s4", title: "Compose", detail: "Use system ingredients", icon: "layers", in: 5, kind: "ai", uses: "cfg-skills pkg-pages pkg-recipes pkg-web-components pkg-design-tokens pkg-icons pkg-charts", body: "Begin with a page template. Compose its recipes and components using their actual contracts, instead of inventing the interface from primitives." },
	{ id: "s5", title: "Validate", detail: "Check the code", icon: "check-square", in: 6, kind: "check", uses: "cfg-hook cfg-mcp pkg-brain pkg-web-components pkg-design-tokens", body: "Run validate_file, return violations to the agent and correct them. Hooks trigger the check; the validator checks the generated code." },
	{ id: "s6", title: "Render", detail: "Inspect the actual UI", icon: "eye", in: 6, kind: "ai", uses: "cfg-skills pkg-pages pkg-recipes pkg-web-components", body: "Open the result in a browser. Check that content appears, layouts work and real interactions succeed. Valid markup alone is not proof." },
	{ id: "s7", title: "Human review", detail: "Is this actually good?", icon: "user", in: 7, kind: "human", uses: "", body: "You review the rendered interface. Approve it, reject it or request changes. Taste, intent and the decision to proceed stay human." },
	{ id: "s8", title: "Steel Curtain", detail: "Gates before main", icon: "lock", in: 9, kind: "check", uses: "cfg-hook cfg-process pkg-brain", body: "CI runs deterministic tests for accessibility, responsive behavior, flows and performance. Separate AI reviews assess standards and spec alignment. Failed required gates block the merge." },
	{ id: "s9", title: "Approve merge", detail: "A person makes the call", icon: "thumbs-up", in: 9, kind: "human", uses: "cfg-process", body: "Green checks are evidence, not approval. A person reviews the diff and decides whether to merge the work." },
];
const packageIcons = { "design-tokens": "palette", "web-components": "grid", recipes: "layers", pages: "file-text", icons: "star", charts: "trending-up", brain: "command", reporter: "refresh-cw" };
const packages = base.groups[2].pieces.filter(p => p.id.startsWith("pkg-")).map(p => ({
	...p, icon: packageIcons[p.id.slice(4)], description: content(originalItem(p.id), "pkg__meta"),
}));
const headlines = [
	"A prompt is not a system.", "Preferences give direction.", "Rules make intent explicit.",
	"Use the real ingredients.", "Give AI a source of truth.", "Compose. Don’t reinvent.",
	"Make checking part of making.", "Keep judgment human.", "Make the process repeatable.",
	"Put a gate before production.", "Every product strengthens the system.",
];
const rungs = base.rungs.map((r, i) => ({ ...r, headline: headlines[i] }));
rungs[9].now = "Required checks can block a merge; a person still decides whether the work should ship.";
module.exports = { concepts, stations, packages, rungs, lastRung: 10 };
