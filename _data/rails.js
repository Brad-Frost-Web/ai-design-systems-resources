/**
 * Keep AI on the Rails (#33): the diagram's pieces, grouped. The lab
 * (_data/railsLab.js) reads these groups and maps each piece's `rungIn`
 * onto its own seven levels; the eleven-rung stepper they were written
 * for is gone. Copy comes from Brad's edited artifact
 * (_data/resources/keep-ai-on-the-rails-claude.html).
 */

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

module.exports = { groups };
