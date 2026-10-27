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
const conceptLevels = [1, 1, 2, 3, 4];
const conceptIcons = ["settings", "file-text", "link", "book-open", "check-square"];
const concepts = base.groups[0].pieces.map((piece, i) => {
	const source = originalItem(piece.id);
	return { ...piece, rungIn: conceptLevels[i], icon: conceptIcons[i], description: content(source, "cfg__meta"), example: content(source, "cfg__mine") };
});
// Workshop wording: DESIGN.md is a possible prose format, not Brad's setup.
const ruleFiles = concepts.find(concept => concept.id === "cfg-project");
ruleFiles.presentationLabel = "Rule files";
ruleFiles.presentationDescription = `${ruleFiles.description} Design guidance can also live in a <code>DESIGN.md</code> file.`;
const stations = [
	{ id: "s1", icon: "search", in: 2, kind: "ai", uses: "cfg-standing cfg-project cfg-mcp pkg-brain brain-components brain-tokens brain-recipes" },
	{ id: "s2", icon: "file-text", in: 1, kind: "ai", uses: "cfg-standing cfg-project cfg-process" },
	{ id: "s3", icon: "link", in: 2, kind: "ai", uses: "cfg-mcp pkg-brain pkg-web-components pkg-design-tokens brain-components brain-tokens brain-recipes" },
	{ id: "s4", icon: "layers", in: 3, kind: "ai", uses: "cfg-skills pkg-pages pkg-recipes pkg-web-components pkg-design-tokens pkg-icons pkg-charts brain-components brain-tokens brain-recipes" },
	{ id: "s5", icon: "check-square", in: 4, kind: "check", uses: "cfg-hook cfg-mcp pkg-brain pkg-web-components pkg-design-tokens brain-components brain-tokens" },
	{ id: "s6", icon: "eye", in: 4, kind: "ai", uses: "cfg-skills pkg-pages pkg-recipes pkg-web-components brain-components brain-recipes" },
	{ id: "s7", icon: "user", in: 0, kind: "human", uses: "" },
	{ id: "s8", icon: "lock", in: 5, kind: "check", uses: "cfg-hook cfg-process pkg-brain brain-components brain-tokens brain-recipes" },
	{ id: "s9", icon: "thumbs-up", in: 5, kind: "human", uses: "cfg-process" },
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
const packages = [...original.matchAll(/<li class="pkg" data-id="([^"]+)"/g)].map(([, id]) => ({
	id, rungIn: id === "pkg-reporter" ? 6 : ["pkg-recipes", "pkg-pages"].includes(id) ? 3 : 2,
	label: content(originalItem(id), "pkg__name"), icon: packageIcons[id.slice(4)], description: content(originalItem(id), "pkg__meta"),
}));
const files = base.groups[2].pieces.filter(piece => piece.kind === "file").map(piece => ({
	...piece, rungIn: piece.rungIn === 10 ? 6 : 2, label: content(originalItem(piece.id), "file__name"), description: content(originalItem(piece.id), "file__meta"),
}));
// Page templates share the component index; recipes.json describes compositions.
files.find(file => file.id === "brain-components").presentationDescription = "Components, recipe components, and page templates (ed-p-*), with their real props, slots, and guidelines. Page templates are discovered with list_pages and read with get_component.";
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
process.presentationDescription = "<strong>A versioned rulebook installed in the repo.</strong> It defines the workflow, Eddie standards, and required checks. <strong>People approve the specification and the release;</strong> automated gates verify the work between them.";
// Levels describe infrastructure, not chronological steps in a single run.
const rungs = [
	{ reviewDescription: "You inspect the result, but getting what you want can be frustrating. You keep rewording prompts and correcting guesses, with no guarantee the next attempt will be closer.", short: "Prompted", title: "Prompted", adds: "A human’s request and the model’s existing knowledge.",
		outputTitle: "An exploratory implementation",
		outputCaption: "The model invents the implementation. Judge whether it expresses your idea; connection to your design system is incidental.",
		generation: "The agent generates and renders UI from your request and its existing knowledge." },
	{ reviewDescription: "You check whether the agent followed your instructions. There is less to explain each time, but you still spot drift, clarify the rules, and prompt it to revise the result.", short: "Instructed", title: "Instructed", adds: "Preferences, project rules, examples, and design guidance.",
		outputTitle: "UI guided by your instructions",
		outputCaption: "The result has more direction from your stated intent. The agent still interprets the guidance and invents implementation details.",
		generation: "The agent generates and renders UI using your request, preferences, examples, and project rules." },
	{ reviewDescription: "You review UI built with real components and tokens. There is less invention to untangle, but you still check their use and ask for changes where the design misses your intent.", short: "System-grounded", title: "System-grounded", adds: "Installed components and tokens, plus authoritative knowledge through Eddie Brain.",
		outputTitle: "UI built with your actual ingredients",
		outputCaption: "The agent can consult real component contracts and tokens. Check both its use of the ingredients and the design decisions it makes with them.",
		generation: "The agent generates and renders UI with real components and tokens, consulting their documented contracts." },
	{ reviewDescription: "You review familiar patterns assembled for this task. Less time goes into correcting layout basics; more goes into judging whether the composition serves the people using it.", short: "System-composed", title: "System-composed", adds: "Approved recipes, page templates, and skills that guide their use.",
		outputTitle: "UI assembled from established patterns",
		outputCaption: "Approved compositions guide more of the layout and interactions. Judge whether those patterns serve this particular task." },
	{ reviewDescription: "You review a result after automated checks and correction loops. Routine errors should be caught earlier, so your feedback can focus on usability, intent, and design quality.", short: "Automatically checked", title: "Automatically checked", adds: "Validation hooks, render checks, and automatic correction loops.",
		outputTitle: "UI checked against explicit requirements",
		outputCaption: "The agent corrects detected implementation problems before handing over the result. Your review still determines whether it works well and serves its purpose." },
	{ reviewDescription: "You compare the result with the specification you approved. Request changes where it falls short; your review and the required delivery checks together determine readiness to ship.", short: "Process-governed", title: "Process-governed", adds: "An approved specification, organizational workflow, CI tests and evaluations, and human release approval.",
		outputTitle: "UI built against an agreed purpose",
		outputCaption: "Review against the approved specification and product intent. Required delivery checks and a separate human approval still stand between this result and release." },
	{ reviewDescription: "You review against the agreed intent and system standards. After shipping, real usage and reported gaps inform the next round of improvements to both the product and the system.", short: "Connected", title: "Connected back to the system", adds: "Usage reporting, adoption data, tracked gaps, and maintained system improvements.",
		outputTitle: "UI within a maintained product ecosystem",
		outputCaption: "Review the current result against the same standards. After shipping, usage and gaps provide evidence for people to improve the system for subsequent work." },
];
// Keep authored source copy above intact; adapt only the review wording whose
// old step-six dependency contradicted the always-present human feedback loop.
const review = stations.find(station => station.id === "s7");
review.presentationTitle = "Review the resulting UI";
review.presentationDescription = rungs[6].reviewDescription;
// Put construction and delivery on opposite sides of the visible result.
const buildStations = stations.slice(0, 6);
const deliveryStations = stations.slice(7);
module.exports = { concepts, stations, buildStations, review, deliveryStations, terminals, packages, files, eddie, process, rungs, lastRung: rungs.length - 1 };
