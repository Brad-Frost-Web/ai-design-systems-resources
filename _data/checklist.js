/**
 * AI-ready design system inspection — interactive, student-facing checklist.
 *
 * Source of truth: Brad's Notion doc "DS inspection checklist" (Chapter 3 of
 * the AI & Design Systems course), tightened here into short, scannable copy
 * for the /checklist/ page. The longer teaching notes live in the course;
 * this page is the hands-on inspection tool.
 *
 * String fields may contain light inline HTML (<strong>, <em>, <code>, <a>)
 * and are rendered with the `safe` filter in the template. Each quality's
 * `accent` is a fixed brand color (evoking an automotive inspection station)
 * set as a CSS custom property so it reads consistently across themes.
 */

module.exports = {
	meta: {
		sourceUrl:
			"https://app.notion.com/p/bradfrost/DS-inspection-checklist-3803c9323e86804b80e4d80bf86d51c4",
	},

	overviewIntro:
		"The first four are table stakes for any high-quality design system. The fifth&mdash;AI-Ready&mdash;packages the rest so machines can use it too.",

	howToUse: {
		heading: "Key",
		body: "Rate each station red, yellow, or green&mdash;then fix the reds, schedule the yellows, and count your greens for a quick health score. Scale the frame to your team.",
		legend: [
			{ status: "red", label: "Red", desc: "Broken or missing; the light is ON." },
			{ status: "yellow", label: "Yellow", desc: "Drift or gaps; schedule a fix." },
			{ status: "green", label: "Green", desc: "Healthy, no action needed." },
		],
	},

	qualities: [
		{
			id: "complete",
			number: 1,
			name: "Complete",
			question: "Is it all there?",
			accent: "#c0502a",
			intro:
				"Before you can judge quality, find what's simply missing. This is where AI's generative power shines&mdash;building what never got built.",
			stations: [
				{
					number: 1,
					id: "coverage-gaps",
					name: "Coverage & gaps",
					question:
						"Does your design system contain the necessary ingredients your products need&mdash;present across design, code, and docs?",
					examples:
						"For instance, whole missing components, or existing ones missing states, variants, tokens, or docs.",
					warningLights: [
						"Design components with no code counterpart (or vice versa)",
						"Whole categories missing, so teams roll their own",
						"Partial token set (color but no spacing/type, or no semantic tier)",
						"Hardcoded hex/px values where tokens should be",
						"Components missing states or variants",
						"Thin or missing docs&mdash;no descriptions, guidelines, or onboarding",
						"No published, distributed artifact",
					],
					aiHelps:
						"Point AI at your Figma library to scaffold missing components, draft docs, and stub token tiers&mdash;then <em>you</em> decide which holes are worth filling. Run a token audit (e.g. FigmaLint) to catch every hardcoded value.",
				},
			],
		},
		{
			id: "sound",
			number: 2,
			name: "Sound",
			question: "Is what's there actually good?",
			accent: "#e0a020",
			intro:
				"Existence isn't enough. Four checks: best practices, accessibility, shared language, and testing.",
			stations: [
				{
					number: 2,
					id: "best-practices",
					name: "Best practices",
					question: "Do design system assets embody industry, organization, and format best practices?",
					examples:
						"For instance, auto-layout and real component properties in Figma, semantic markup and modern layout in code, or clear examples in docs.",
					warningLights: [
						"Absolute positioning where auto-layout belongs; detached instances",
						"Meaningless layer names (Frame 22)",
						"Div soup, magic numbers, brittle fixed layouts",
						"No logical properties, so RTL and vertical writing break",
						"Docs that are walls of text with no examples",
					],
					aiHelps:
						"Have AI scan for non-semantic markup, missing auto-layout, and un-idiomatic patterns&mdash;against your house conventions, not a generic bar. FigmaLint surfaces a lot of this automatically.",
				},
				{
					number: 3,
					id: "accessibility",
					name: "Accessibility",
					question: "Do design system assets embody accessibility best practices and deliver inclusive experiences?",
					examples:
						"For instance, WCAG 2.1 AA, keyboard support, screen readers, contrast across themes, and correct ARIA.",
					warningLights: [
						"No automated a11y checks (e.g. axe-core) in CI",
						"No keyboard navigation tests",
						"Theme colors never validated for contrast",
						"Few or no per-component a11y notes",
						"No screen reader test plan",
					],
					aiHelps:
						"Wire automated a11y scanning into CI so every component is checked on every change. Use AI to draft per-component guidance and audit token contrast.",
				},
				{
					number: 4,
					id: "shared-language",
					name: "Shared language",
					question: "Is language applied consistently and coherently across every asset&mdash;token names, component props, API patterns, layers, and docs?",
					examples:
						"For instance, consistent prop names and patterns, a coherent token naming scheme, and a single API convention.",
					warningLights: [
						"Different prop names for the same concept across components",
						"Token names with no coherent scheme",
						"<code>size</code> vs <code>scale</code> vs <code>sz</code> for the same idea",
						"Naming drift, old and new with no migration",
						"No naming validator or drift detection",
					],
					aiHelps:
						"Have AI scan the whole library for naming and API inconsistencies at once&mdash;exactly the tedious pattern-matching it's great at. Standardize, rename, add a naming validator.",
				},
				{
					number: 5,
					id: "testing-validation",
					name: "Testing & validation",
					question: "Is it verified to actually work, with coverage running automatically in CI?",
					examples:
						"For instance, meaningful unit, integration, and visual-regression tests, plus linting and drift detection running automatically in CI.",
					warningLights: [
						"No CI; tests and linting are local-only",
						"Silent component bugs that don't fail loudly",
						"No visual regression testing",
						"Tests exist but key behaviors (keyboard, states) aren't asserted",
					],
					aiHelps:
						"Use AI to find untested surfaces, generate test cases, and diagnose silent failures. Stand up CI so build/test/lint runs on every change.",
				},
			],
		},
		{
			id: "synchronized",
			number: 3,
			name: "Synchronized",
			question: "Do the assets agree with each other?",
			accent: "#23456b",
			intro:
				"Your Figma button, coded button, and docs should describe the same button. The moment they drift, every downstream decision is built on a lie.",
			stations: [
				{
					number: 6,
					id: "source-of-truth-parity",
					name: "Source of truth & parity",
					question: "Do Figma, code, docs, and the published artifact all agree with each other?",
					examples:
						"For instance, one canonical source per layer, with Figma, code, docs, and the published artifact in sync, instances attached, and no competing forks.",
					warningLights: [
						"Figma and code have visibly drifted",
						"Published/CDN artifact is stale vs. the source repo",
						"Docs describe an older version than what ships",
						"Detached instances cut off from their source",
						"Multiple competing libraries",
					],
					aiHelps:
						"Point AI at two copies and have it diff them&mdash;Figma vs. code, source vs. bundle, docs vs. behavior, tokens across platforms. Then pick and document the canonical source.",
				},
			],
		},
		{
			id: "extensible",
			number: 4,
			name: "Extensible",
			question: "Can you keep growing it, repeatably and safely?",
			accent: "#2e7d46",
			intro:
				"Growth should be repeatable, not heroic. Orderly change (governance) plus signal flowing back (feedback).",
			stations: [
				{
					number: 7,
					id: "governance-version-control",
					name: "Governance & version control",
					question: "Is there a sane, documented process for how change flows in?",
					examples:
						"For instance, a release flow, a changelog, a contribution path (CONTRIBUTING, PR template), clear ownership, and a healthy issue tracker.",
					warningLights: [
						"No CONTRIBUTING guide or PR template",
						"No changelog&mdash;changes live only in git history",
						"Duplicate/stale issues; blockers open past your threshold",
						"No branch protection or clear release process",
						"Backlog overdue by 30+ days with no triage",
					],
					aiHelps:
						"Use AI to triage and dedupe the backlog and draft the missing process docs. Set thresholds so stale items trip the warning light automatically.",
				},
				{
					number: 8,
					id: "feedback-adoption",
					name: "Feedback & adoption",
					question: "Is signal flowing back&mdash;adoption data, a feedback loop, a recurring review cadence?",
					examples:
						"For instance, adoption and usage data, a real feedback mechanism, and a recurring review cadence rather than one-and-done audits.",
					warningLights: [
						"No adoption/usage analytics",
						"A feedback mechanism that exists but is empty",
						"No deprecation/migration announcements",
						"Reviews are ad hoc; inspection treated as one-and-done",
						"No regular cadence for this inspection",
					],
					aiHelps:
						"Even a simple AI-assisted grep across consumer projects shows which components are actually used. Activate the loop, announce breaking changes, and schedule this inspection on a cadence.",
				},
			],
		},
		{
			id: "ai-ready",
			number: 5,
			name: "AI-Ready",
			question: "Can AI actually use it?",
			accent: "#3a7bb5",
			intro:
				"The capstone: package everything above so machines can understand and reach it&mdash;and generate great output instead of garbage.",
			stations: [
				{
					number: 9,
					id: "machine-readable-docs",
					name: "Machine-readable docs & context",
					question: "Can a machine actually consume the system's knowledge, not just a human?",
					examples:
						"For instance, structured component metadata, usage rules, and an AI-facing context surface like llms.txt or schemas.",
					warningLights: [
						"Docs that read fine for humans but have no machine-readable structure",
						"No AI-facing context surface (no llms.txt, schemas, or metadata)",
						"Component metadata that confuses agents",
						"Agents misuse components because rules aren't machine-readable",
					],
					aiHelps:
						"Use AI to author machine-readable descriptions, metadata, and context files&mdash;then self-test by generating with your components and seeing where it goes wrong.",
				},
				{
					number: 10,
					id: "agent-access",
					name: "Agent access (MCP & integrations)",
					question: "Is the system exposed to agents&mdash;MCP, knowledge graph, Code Connect, reachable from the IDE and design tool?",
					examples:
						"For instance, exposure via MCP or a knowledge graph, a design-to-code bridge like Code Connect, and reachability from the IDE and the design tool.",
					warningLights: [
						"No MCP or knowledge-graph surface to query",
						"No design-to-code bridge (no Code Connect)",
						"Not reachable from the IDE or design tool",
						"Agents produce weak, generic results",
					],
					aiHelps:
						"Stand up the interfaces: an MCP server or knowledge graph, plus Code Connect. Test it by asking an agent to rebuild a page with your components&mdash;weak output is your warning light.",
				},
			],
		},
	],

	results: {
		scoreNote:
			"It's a conversation starter, not a grade. Fix the reds first, schedule the yellows, re-run on a cadence.",
		example:
			"Scored honestly, the Eddie design system came back <strong>53/100</strong>: excellent primitives, thin middle layer. Strong tokens and components; weak docs, accessibility, and feedback. Not a failure&mdash;a map of where to spend the next month.",
	},

	maintenance: {
		heading: "Keep the light off",
		intro: "Not a one-time event. Run it on two cadences:",
		cadences: [
			{
				lead: "Deep inspection.",
				body: "A thorough sweep across all ten stations at a set interval&mdash;quarterly is a good start.",
			},
			{
				lead: "Everyday checks.",
				body: "Wire the high-value checks (coverage, best practices, accessibility, sync, tests) into CI so problems surface the moment they appear.",
			},
		],
		outro:
			"The goal: a design system that tells you when something's wrong, instead of finding out the hard way on the side of the road.",
	},

	crosswalk: {
		heading: "Appendix: crosswalk to the 10-criteria scorecard",
		intro:
			"How these stations map to the canonical design-system scorecard criteria:",
		rows: [
			{
				station: "1. Coverage & gaps",
				criteria: "Comprehensive Component Library + Single Source of Truth + Documentation (existence)",
			},
			{
				station: "2. Best practices",
				criteria: "Quality / craft across Figma, code, and docs",
			},
			{ station: "3. Accessibility", criteria: "Focus on Accessibility" },
			{
				station: "4. Shared language",
				criteria: "Component Library / Clear Guidelines (naming)",
			},
			{ station: "5. Testing & validation", criteria: "Quality / Testing" },
			{ station: "6. Source of truth & parity", criteria: "Single Source of Truth" },
			{
				station: "7. Governance & version control",
				criteria: "Version Control & Governance + Collaboration Across Teams",
			},
			{ station: "8. Feedback & adoption", criteria: "Continuous Feedback & Iteration" },
			{
				station: "9. Machine-readable docs & context",
				criteria: "Documentation & Tutorials (machine-readable side)",
			},
			{
				station: "10. Agent access (MCP & integrations)",
				criteria: "Integration with Dev Tools (extended for the AI era)",
			},
		],
	},
};
