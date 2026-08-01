/**
 * The Design System Multi-Point Inspection taxonomy.
 *
 * Source of truth: the AI & Design Systems course "multi-point inspection" —
 * 5 qualities of a healthy, AI-ready design system, expressed as 10 stations.
 * Mirrors https://github.com/Brad-Frost-Web/ai-design-systems-inspection-kit
 * (ds-inspection). Station `question` strings are taken verbatim from each
 * station file so the site speaks the same language as the kit.
 *
 * This is the shared vocabulary the site uses to connect a resource to the
 * problem it helps solve: resources are tagged with station `id`s, and the
 * "diagnose" / browse-by-station views read this file to label and group them.
 *
 * `slug` is URL-safe and stable — treat it as the key in resource frontmatter
 * (`stations: [accessibility, orchestration]`) and in query params. `keywords`
 * seed the first-pass auto-classifier; they are hints, not the final mapping.
 */

const QUALITIES = [
	{
		id: 1,
		slug: "complete",
		name: "Complete",
		question: "Does your system have what products need?",
	},
	{
		id: 2,
		slug: "sound",
		name: "Sound",
		question: "Is what's in the system actually good?",
	},
	{
		id: 3,
		slug: "synchronized",
		name: "Synchronized",
		question: "Are assets connected and orchestrated?",
	},
	{
		id: 4,
		slug: "extensible",
		name: "Extensible",
		question: "Can you reliably improve, extend, and evolve the system?",
	},
	{
		id: 5,
		slug: "ai-ready",
		name: "AI-Ready",
		question: "Can AI successfully use the design system?",
	},
];

const STATIONS = [
	{
		id: 1,
		slug: "coverage-gaps",
		name: "Coverage & gaps",
		quality: "complete",
		question:
			"Does your design system contain the necessary ingredients your products need, present across design, code, and docs?",
		keywords: [
			"coverage",
			"gap",
			"inventory",
			"component library",
			"components",
			"props",
			"atomic design",
			"composition",
		],
	},
	{
		id: 2,
		slug: "best-practices",
		name: "Best practices",
		quality: "sound",
		question:
			"Do design system assets embody industry, organization, and format best practices?",
		keywords: [
			"best practice",
			"quality",
			"cascade of quality",
			"standards",
			"code review",
			"craft",
		],
	},
	{
		id: 3,
		slug: "accessibility",
		name: "Accessibility",
		quality: "sound",
		question:
			"Do design system assets embody accessibility best practices and deliver inclusive experiences?",
		keywords: [
			"accessibility",
			"a11y",
			"wcag",
			"contrast",
			"screen reader",
			"aria",
			"inclusive",
		],
	},
	{
		id: 4,
		slug: "shared-language",
		name: "Shared language",
		quality: "sound",
		question:
			"Is language consistent and coherent within and across system assets — tokens, props, layers, code, component APIs, docs?",
		keywords: [
			"shared language",
			"naming",
			"vocabulary",
			"terminology",
			"semantics",
			"taxonomy",
			"component api",
		],
	},
	{
		id: 5,
		slug: "testing-validation",
		name: "Testing & validation",
		quality: "sound",
		question:
			"Is quality tested and validated across the system, and is testing built into workflows?",
		keywords: [
			"testing",
			"validation",
			"eval",
			"evals",
			"lint",
			"linting",
			"visual regression",
			"unit test",
			"ci",
		],
	},
	{
		id: 6,
		slug: "orchestration",
		name: "Orchestration",
		quality: "synchronized",
		question:
			"Are design, code, and docs assets actually connected, and are workflows synchronized?",
		keywords: [
			"orchestration",
			"sync",
			"synchronize",
			"handoff",
			"pipeline",
			"design tokens",
			"tokens",
			"figma",
			"variables",
			"auto-layout",
		],
	},
	{
		id: 7,
		slug: "governance-version-control",
		name: "Governance & version control",
		quality: "extensible",
		question:
			"Are there formal, documented, and accurate processes for how system changes are made and managed?",
		keywords: [
			"governance",
			"version control",
			"versioning",
			"git",
			"branch",
			"commit",
			"contribution",
			"release",
			"changelog",
		],
	},
	{
		id: 8,
		slug: "feedback-adoption",
		name: "Feedback & adoption",
		quality: "extensible",
		question:
			"Is system adoption tracked, and is product context feeding back into the system?",
		keywords: [
			"adoption",
			"feedback",
			"advocacy",
			"culture",
			"community",
			"evangelism",
			"metrics",
		],
	},
	{
		id: 9,
		slug: "machine-readable-docs",
		name: "Machine-readable docs & context",
		quality: "ai-ready",
		question:
			"Can a machine actually consume the system's knowledge, not just a human?",
		keywords: [
			"machine-readable",
			"documentation",
			"docs",
			"context engineering",
			"context-based",
			"markdown",
			"llms.txt",
			"structured docs",
		],
	},
	{
		id: 10,
		slug: "agent-access",
		name: "Agent access",
		quality: "ai-ready",
		question:
			"Is the design system exposed to AI agents so it can be used successfully in AI-assisted product work?",
		keywords: [
			"agent",
			"mcp",
			"claude",
			"cursor",
			"ai-coding",
			"coding agent",
			"vibe coding",
			"prompting",
			"skill",
			"skills",
			"a2ui",
			"visual builder",
		],
	},
];

// Convenience lookups + a nested view (quality -> its stations) for templates.
const byQuality = QUALITIES.map((q) => ({
	...q,
	stations: STATIONS.filter((s) => s.quality === q.slug),
}));

module.exports = {
	qualities: QUALITIES,
	stations: STATIONS,
	byQuality,
};
