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
	{ id: "s1", icon: "search", in: 4, kind: "ai", uses: "cfg-standing cfg-project cfg-mcp pkg-brain" },
	{ id: "s2", icon: "file-text", in: 2, kind: "ai", uses: "cfg-standing cfg-project cfg-process" },
	{ id: "s3", icon: "link", in: 4, kind: "ai", uses: "cfg-mcp pkg-brain pkg-web-components pkg-design-tokens" },
	{ id: "s4", icon: "layers", in: 5, kind: "ai", uses: "cfg-skills pkg-pages pkg-recipes pkg-web-components pkg-design-tokens pkg-icons pkg-charts" },
	{ id: "s5", icon: "check-square", in: 6, kind: "check", uses: "cfg-hook cfg-mcp pkg-brain pkg-web-components pkg-design-tokens" },
	{ id: "s6", icon: "eye", in: 6, kind: "ai", uses: "cfg-skills pkg-pages pkg-recipes pkg-web-components" },
	{ id: "s7", icon: "user", in: 7, kind: "human", uses: "" },
	{ id: "s8", icon: "lock", in: 9, kind: "check", uses: "cfg-hook cfg-process pkg-brain" },
	{ id: "s9", icon: "thumbs-up", in: 9, kind: "human", uses: "cfg-process" },
];
// Read Brad's authored station copy verbatim; never maintain a second paraphrase.
const authoredStations = [...original.matchAll(/<article class="node(?: [^"]*)?"[^>]*>([\s\S]*?)<\/article>/g)]
	.map(match => match[1]).filter(html => html.includes('class="node__name"'));
if (authoredStations.length !== stations.length) throw new Error("Original Rails station count changed");
function authoredField(html, className) {
	const match = html.match(new RegExp(`<([a-z][a-z0-9]*)[^>]*class="${className}"[^>]*>([\\s\\S]*?)<\\/\\1>`));
	if (!match) throw new Error(`Missing authored Rails field: ${className}`);
	return match[2];
}
for (const [index, station] of stations.entries()) {
	const source = authoredStations[index];
	station.kicker = authoredField(source, "kicker");
	station.title = authoredField(source, "node__name");
	station.description = authoredField(source, "node__how");
	station.tools = [...authoredField(source, "tools").matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => match[1]);
	station.prevents = authoredField(source, "blocks__text");
	station.connector = index >= 4 ? "refresh-cw" : "arrow-forward";
}
function terminalSource(name) {
	return original.split(`<!-- ${name} -->`)[1].split('<!--')[0];
}
const entrySource = terminalSource("ENTRY");
const outputSource = terminalSource("OUTPUT");
const feedbackSource = terminalSource("LOOP");
const terminals = {
	entry: { title: authoredField(entrySource, "terminal__title"), prompts: [...entrySource.matchAll(/<div class="terminal__sub">([\s\S]*?)<\/div>/g)].map(match => match[1]) },
	output: { title: authoredField(outputSource, "terminal__title"), tag: authoredField(outputSource, "terminal__tag"), description: authoredField(outputSource, "terminal__sub") },
	feedback: { title: authoredField(feedbackSource, "terminal__title").replace(/<svg[\s\S]*?<\/svg>/, '<ed-icon name="refresh-cw"></ed-icon>'), description: feedbackSource.match(/<div class="terminal__sub">([\s\S]*?)<\/article>/)[1].trim() },
};
const packageIcons = { "design-tokens": "palette", "web-components": "grid", recipes: "layers", pages: "file-text", icons: "star", charts: "trending-up", brain: "command", reporter: "refresh-cw", boilerplates: "layers", website: "book-open" };
const eddiePieces = new Map(base.groups[2].pieces.map(piece => [piece.id, piece]));
const packages = [...original.matchAll(/<li class="pkg" data-id="([^"]+)"/g)].map(([, id]) => ({
	id, rungIn: eddiePieces.get(id)?.rungIn ?? 3,
	label: content(originalItem(id), "pkg__name"), icon: packageIcons[id.slice(4)], description: content(originalItem(id), "pkg__meta"),
}));
const files = base.groups[2].pieces.filter(piece => piece.kind === "file").map(piece => ({
	...piece, label: content(originalItem(piece.id), "file__name"), description: content(originalItem(piece.id), "file__meta"),
}));
const brainHeading = authoredField(original, "pkgs-head brain-head");
const packagesHeading = authoredField(original, "pkgs-head");
const eddie = {
	title: content(original, "brain__feed"),
	brainTitle: brainHeading.split("<span")[0], brainDescription: authoredField(brainHeading, "pkgs-head__note"),
	packagesTitle: packagesHeading.split("<span")[0], packagesDescription: authoredField(packagesHeading, "pkgs-head__note"),
};
const process = {
	label: authoredField(original, "proc__badge"), title: content(original, "proc__name"), description: content(original, "proc__desc"),
	phases: authoredField(original, "proc__phases"),
	chips: [...authoredField(original, "proc__chips").matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => match[1]),
};
const headlines = [
	"A prompt is not a system.", "Preferences give direction.", "Rules make intent explicit.",
	"Use the real ingredients.", "Give AI a source of truth.", "Compose. Don’t reinvent.",
	"Make checking part of making.", "Keep judgment human.", "Make the process repeatable.",
	"Put a gate before production.", "Every product strengthens the system.",
];
const rungs = base.rungs.map((r, i) => ({ ...r, headline: headlines[i] }));
rungs[9].now = "Required checks can block a merge; a person still decides whether the work should ship.";
module.exports = { concepts, stations, terminals, packages, files, eddie, process, rungs, lastRung: 10 };
