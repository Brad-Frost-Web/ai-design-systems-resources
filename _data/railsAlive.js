/**
 * Keep AI on the Rails, alive (#56). The level copy is the lab's authored
 * copy (railsLab.rungs); this file adds what the characters say when poked.
 */
const lab = require("./railsLab.js");

const lines = [
	{
		robot: ["I can make ANYTHING!", "Signup page? I’ll invent one!", "Colors? I picked my favorites.", "Is that a button? It is now!"],
		stage: "No guardrails. The agent sprays invented pieces at the product. Some stick, crooked. Most end up on the floor.",
	},
	{
		robot: ["I read the rules! Mostly.", "Brand-ish colors, as instructed.", "I still made the buttons up.", "Closer! Still guessing."],
		rules: ["Use our brand colors.", "Buttons say what they do.", "Be accessible, please."],
		stage: "Rules arrive. Pieces tint toward the brand and aim better, but they’re still the agent’s inventions.",
	},
	{
		robot: ["Checking the brain first.", "These are REAL components.", "Real tokens! Real props!", "I still arrange them myself."],
		rules: ["Use our brand colors.", "Use Eddie components."],
		brain: ["ed-button: 4 variants, 3 sizes.", "Tokens, not hex codes.", "Ask me before you invent."],
		stage: "The design system and Eddie Brain plug in. Most pieces are now real components, though the agent still places them by hand.",
	},
	{
		robot: ["Recipes lay the track.", "Every piece has a place.", "Approved patterns, all aboard!", "Nothing ends up on the floor."],
		rules: ["Start from a page template."],
		brain: ["The signup recipe has 8 slots.", "Templates know the layout."],
		stage: "Recipes and templates lay rails. Every piece rides into its slot, but a fake can still ride in and look at home.",
	},
	{
		robot: ["Validation’s got my back.", "Oops — zapped. Trying again!", "Retry loop! Fixed it.", "I check my own work now."],
		brain: ["The validator reads my rules."],
		gate: ["Off-system? Back you go.", "Hex code detected. Retry!", "Checked. Pass."],
		stage: "A validation gate zaps anything off-system and sends it round the retry loop. What reaches the product passed the checks.",
	},
	{
		robot: ["Built to the spec.", "Waiting on a human.", "Your call, boss.", "I can’t open that curtain."],
		brain: ["The spec says what done means."],
		gate: ["CI checks too."],
		curtain: ["Nothing ships without a human yes.", "Approve it, and I’ll open.", "The Steel Curtain stays shut."],
		stage: "An approved spec, CI checks, and the Steel Curtain. The build waits for a human to approve the release.",
	},
	{
		robot: ["Shipped! And I learned something.", "The brain got smarter.", "Fewer guesses each release.", "Usage data, coming home."],
		brain: ["Usage noted. Gap filed.", "Next release, fewer guesses.", "I learn from what ships."],
		gate: ["Still checking. Always."],
		curtain: ["Ship it, then learn from it."],
		stage: "What ships reports back. Usage and gaps flow to the brain, and every release hallucinates less than the last.",
	},
];

const levels = lab.rungs.map((rung, i) => ({
	short: rung.short,
	title: rung.title,
	adds: rung.adds,
	resultTitle: rung.outputTitle,
	caption: rung.outputCaption,
	lines: lines[i],
}));

const suggestions = ["Make me a signup page", "A pricing page with three tiers", "An analytics dashboard"];

module.exports = {
	levels,
	suggestions,
	clientJSON: JSON.stringify({ levels, suggestions }).replace(/</g, "\\u003c"),
};
