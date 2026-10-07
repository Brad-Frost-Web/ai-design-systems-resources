/**
 * Keep AI on the Rails (#33): the rungs of the story and the diagram pieces
 * each one adds. A piece is on screen from `rungIn` until (not including)
 * `rungOut`, when it has one. Beat copy is a draft for Brad's edit; the
 * diagram copy comes from his edited artifact
 * (_data/resources/keep-ai-on-the-rails-claude.html).
 */

const rungs = [
	{
		short: "Prompt",
		title: "Just prompt it",
		adds: "Nothing. You type “Build me a pricing page” and hit enter.",
		now: "You get a pricing page! It just isn’t yours: AI-default gradients, a font you didn’t pick, cards nobody designed.",
		breaks: "The model has never heard of your design system, so it makes one up.",
	},
	{
		short: "Settings",
		title: "Tell it your preferences",
		adds: "Always-on agent settings: use our brand blue, use our typeface, meet WCAG AA.",
		now: "Closer! The colors and type drift toward your brand.",
		breaks: "Describing your brand isn’t using your design system. The components are still invented, and the hex codes are guesses.",
	},
	{
		short: "Rules",
		title: "Write the rules down",
		adds: "Project rule files (AGENTS.md, CLAUDE.md) plus a DESIGN.md that describes your design language in prose.",
		now: "More consistent output, project after project.",
		breaks: "A description of a system is a copy of it, and copies drift. The model still writes .my-card CSS and hardcodes values it read in the prose.",
	},
	{
		short: "Install",
		title: "Install the real design system",
		adds: "Your tokens and web components, installed as real packages.",
		now: "Real components show up on the page.",
		breaks: "The model remembers their API and guesses wrong: invented slots, fake properties, content that silently disappears.",
	},
	{
		short: "MCP",
		title: "Give the agent the brain",
		adds: "eddie-brain over MCP. The agent checks the live design system before writing anything, then looks up real props, slots and tokens.",
		now: "The right components, used the right way.",
		breaks: "Correct parts, assembled from scratch: stacked card grids, hand-rolled page chrome.",
	},
	{
		short: "Compose",
		title: "Compose from ingredients",
		adds: "Skills that carry the workflow, plus recipes and page templates to start from.",
		now: "Pages composed the way someone on your team would build them.",
		breaks: "Nothing checks the work. One slip, and it ships quietly.",
	},
	{
		short: "Validate",
		title: "Check the work automatically",
		adds: "A hook validates every file the moment it’s written, and a render check proves the markup actually displays.",
		now: "Token, naming, slot and accessibility mistakes get caught and fixed in the loop.",
		breaks: "Correct isn’t the same as good.",
	},
	{
		short: "Review",
		title: "You review it",
		adds: "You look at the rendered result and approve it, reject it, or ask for tweaks.",
		now: "Taste and product intent stay human.",
		breaks: "It’s one-off judgment. No spec, no phases, nothing that says what “done” means.",
	},
	{
		short: "Process",
		title: "Put a process underneath",
		adds: "bfw-process: a versioned rulebook installed into the repo, with a spec gate, six phases and nine checklists.",
		now: "Every piece of work starts from an approved spec and moves through the same phases.",
		breaks: "Good work still needs a wall before it reaches main.",
	},
	{
		short: "Steel Curtain",
		title: "The Steel Curtain",
		adds: "CI runs the whole gauntlet on every pull request: tests, accessibility, responsive, user flows, performance, then a two-axis AI eval. A person approves the merge.",
		now: "Nothing gets past the gates, and no agent merges its own work.",
		breaks: "It works, but the system learns nothing from what shipped.",
	},
	{
		short: "Loop",
		title: "Close the loop",
		adds: "eddie-reporter scans shipped products and reports what they actually use back to eddie-brain. Gaps become GitHub issues.",
		now: "The front of the line gets smarter from the end of it.",
		breaks: null,
	},
];

const groups = [
	{
		id: "concepts",
		label: "AI dev concepts & techniques",
		pieces: [
			{ id: "cfg-standing", label: "Agent settings", rungIn: 1 },
			{ id: "cfg-project", label: "Rule files + DESIGN.md", rungIn: 2 },
			{ id: "cfg-mcp", label: "MCP connection", rungIn: 4 },
			{ id: "cfg-skills", label: "Skills", rungIn: 5 },
			{ id: "cfg-hook", label: "Hooks & CI gates", rungIn: 6 },
		],
	},
	{
		id: "pipeline",
		label: "The pipeline",
		pieces: [
			{ id: "prompt", label: "You enter a prompt", kind: "terminal", rungIn: 0 },
			{ id: "s1", num: 1, label: "Check the live design system first", rungIn: 4 },
			{ id: "s2", num: 2, label: "Learn rules & standards", rungIn: 2 },
			{ id: "s3", num: 3, label: "Look up real components & tokens", rungIn: 4 },
			{ id: "gen", label: "AI generates UI", rungIn: 0, rungOut: 5 },
			{ id: "s4", num: 4, label: "Compose using design system ingredients", rungIn: 5 },
			{ id: "s5", num: 5, label: "Validate the generated code", rungIn: 6 },
			{ id: "s6", num: 6, label: "Render & check the output", rungIn: 6 },
			{ id: "s7", num: 7, label: "You review the rendered results", kind: "human", rungIn: 7 },
			{ id: "s8", num: 8, label: "Run CI gates, tests & evals", kicker: "The Steel Curtain", kind: "steel", rungIn: 9 },
			{ id: "s9", num: 9, label: "You approve to merge the work", kind: "human", rungIn: 9 },
			{ id: "out", label: "The UI", kind: "terminal", rungIn: 0 },
			{ id: "loop", label: "Product ↔ design system feedback loop", kind: "loop", rungIn: 10 },
		],
	},
	{
		id: "eddie",
		label: "Eddie Design System",
		pieces: [
			{ id: "pkg-design-tokens", label: "eddie-design-tokens", rungIn: 3 },
			{ id: "pkg-web-components", label: "eddie-web-components", rungIn: 3 },
			{ id: "pkg-recipes", label: "eddie-recipes", rungIn: 3 },
			{ id: "pkg-pages", label: "eddie-pages", rungIn: 3 },
			{ id: "pkg-icons", label: "eddie-icons", rungIn: 3 },
			{ id: "pkg-charts", label: "eddie-charts", rungIn: 3 },
			{ id: "pkg-brain", label: "eddie-brain", rungIn: 4 },
			{ id: "brain-components", label: "components.json", kind: "file", rungIn: 4 },
			{ id: "brain-tokens", label: "tokens.json", kind: "file", rungIn: 4 },
			{ id: "brain-recipes", label: "recipes.json", kind: "file", rungIn: 4 },
			{ id: "pkg-reporter", label: "eddie-reporter", rungIn: 10 },
			{ id: "brain-learning", label: "learning.json", kind: "file", rungIn: 10 },
			{ id: "brain-adoption", label: "adoption.json", kind: "file", rungIn: 10 },
			{ id: "brain-activity", label: "activity.json", kind: "file", rungIn: 10 },
		],
	},
	{
		id: "process",
		label: "bfw-process",
		pieces: [
			{ id: "phase-1", label: "1 Understand & scope", rungIn: 8 },
			{ id: "phase-2", label: "2 Specification", rungIn: 8 },
			{ id: "gate-spec", label: "FEATURE-SPEC.md approved", kind: "gate", rungIn: 8 },
			{ id: "phase-3", label: "3 Architecture & planning", rungIn: 8 },
			{ id: "phase-4", label: "4 Build", rungIn: 8 },
			{ id: "phase-5", label: "5 Test & verify", rungIn: 8 },
			{ id: "gate-ship", label: "npm run bfw:ship", kind: "gate", rungIn: 8 },
			{ id: "phase-6", label: "6 Ship & document", rungIn: 8 },
		],
	},
];

// A group is on screen from the first rung any of its pieces is.
for (const group of groups) {
	group.rungIn = Math.min(...group.pieces.map((piece) => piece.rungIn));
}

module.exports = { rungs, groups, lastRung: rungs.length - 1 };
