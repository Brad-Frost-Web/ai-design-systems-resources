import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
	LEVELS, FEATURES, TEMPLATES, createSim, setLevel, generate, step, settle, approve,
	grab, drag, release, stats, templateFor, hallucinationRate, slotRect, contentBox, railPoint, PLACES,
} from "../js/recipes/rails-alive-sim.mjs";

const lab = createRequire(import.meta.url)("../_data/railsLab.js");
const alive = createRequire(import.meta.url)("../_data/railsAlive.js");

function build(level, { seed = 3, prompt = "Make me a signup page", seconds = 10 } = {}) {
	const sim = createSim({ seed, level });
	generate(sim, prompt);
	const events = settle(sim, seconds);
	return { sim, events, totals: stats(sim) };
}

test("one simulated level per lesson level, and guardrails only ever accumulate", () => {
	assert.equal(LEVELS.length, lab.rungs.length);
	for (let i = 1; i < LEVELS.length; i++) {
		for (const feature of FEATURES) if (LEVELS[i - 1][feature]) assert.ok(LEVELS[i][feature], `level ${i + 1} drops ${feature}`);
	}
	assert.ok(LEVELS.every((l, i) => i === 0 || l.hallucinate <= LEVELS[i - 1].hallucinate));
});

test("the page data carries a line for every character at every level", () => {
	assert.equal(alive.levels.length, LEVELS.length);
	for (const level of alive.levels) {
		assert.ok(level.title && level.adds && level.caption, "level copy missing");
		assert.ok(level.lines.robot.length > 0, `${level.title}: robot has nothing to say`);
	}
	const client = JSON.parse(alive.clientJSON);
	assert.equal(client.levels.length, LEVELS.length);
	assert.ok(client.suggestions.length >= 3);
});

test("prompts pick a layout", () => {
	assert.equal(templateFor("A pricing page with three tiers"), "pricing");
	assert.equal(templateFor("analytics dashboard"), "dashboard");
	assert.equal(templateFor("anything else"), "signup");
});

test("every slot sits inside the window", () => {
	const box = contentBox();
	for (const [name, template] of Object.entries(TEMPLATES)) {
		template.slots.forEach((_, i) => {
			const r = slotRect(name, i);
			assert.ok(r.x - r.width / 2 >= box.x - 1 && r.x + r.width / 2 <= box.x + box.width + 1, `${name} slot ${i} spills sideways`);
			assert.ok(r.y - r.height / 2 >= box.y - 1 && r.y + r.height / 2 <= box.y + box.height + 1, `${name} slot ${i} spills vertically`);
		});
	}
});

test("level 1, prompted: everything is invented and much of it misses", () => {
	const { sim, totals } = build(0);
	assert.equal(totals.onSystem, 0);
	assert.ok(totals.hallucinated > 0, "nothing landed in the product");
	assert.ok(sim.pieces.some(p => p.state === "resting"), "nothing ended up on the floor");
	assert.equal(totals.caught, 0);
});

test("level 3, system-grounded: real ingredients reach the product", () => {
	let onSystem = 0;
	for (let seed = 1; seed <= 6; seed++) onSystem += build(2, { seed }).totals.onSystem;
	assert.ok(onSystem > 12, `only ${onSystem} on-system pieces over six builds`);
});

test("level 4, system-composed: the rails fill every slot and nothing lands on the floor", () => {
	const { sim, events } = build(3);
	const slots = TEMPLATES.signup.slots.length;
	assert.equal(sim.pieces.filter(p => p.state === "placed").length, slots);
	assert.ok(!sim.pieces.some(p => p.state === "resting"));
	assert.ok(events.some(e => e.type === "done"));
});

test("level 5, automatically checked: validation catches what composition let through", () => {
	let caught = 0;
	for (let seed = 1; seed <= 6; seed++) {
		const { totals } = build(4, { seed });
		assert.equal(totals.hallucinated, 0, `seed ${seed} shipped a hallucination past validation`);
		caught += totals.caught;
	}
	assert.ok(caught > 0, "validation never caught anything");
});

test("level 6, process-governed: nothing ships until a human approves", () => {
	const { sim, events } = build(5);
	assert.equal(sim.phase, "awaiting");
	assert.ok(events.some(e => e.type === "ready"));
	settle(sim, 5);
	assert.equal(stats(sim).releases, 0, "shipped without approval");
	assert.ok(approve(sim));
	const after = settle(sim, 3);
	assert.ok(after.some(e => e.type === "shipped"));
	assert.equal(stats(sim).releases, 1);
	assert.equal(stats(sim).onSystem, 0, "the shipped build should leave the window");
	assert.equal(approve(sim), false, "approve with nothing waiting");
});

test("level 7, connected: shipping teaches the system, so it hallucinates less", () => {
	const sim = createSim({ seed: 5, level: 6 });
	const before = hallucinationRate(sim);
	generate(sim, "signup");
	settle(sim, 10);
	approve(sim);
	const events = settle(sim, 5);
	assert.ok(events.some(e => e.type === "learn"));
	assert.ok(hallucinationRate(sim) < before);
});

test("lifting a piece out of the product frees its slot; throwing a fake past validation gets it caught", () => {
	const sim = createSim({ seed: 9, level: 4 });
	generate(sim, "signup");
	settle(sim, 10);
	const placed = sim.pieces.find(p => p.state === "placed");
	const held = grab(sim, placed.x, placed.y);
	assert.equal(held, placed);
	assert.ok(!sim.filled.has(placed.slot));
	held.onSystem = false;
	const box = contentBox();
	drag(sim, held, box.x + box.width / 2, box.y + box.height / 2);
	settle(sim, 0.3);
	held.vx = 400; held.vy = 0;
	const caughtBefore = sim.caught;
	release(sim, held);
	settle(sim, 0.2);
	assert.equal(sim.caught, caughtBefore + 1);
});

test("changing level clears the stage; stepping never leaves a piece somewhere impossible", () => {
	const sim = createSim({ seed: 2, level: 0 });
	generate(sim, "pricing");
	for (let i = 0; i < 400; i++) {
		step(sim, 1 / 60);
		for (const p of sim.pieces) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), "non-finite position");
	}
	setLevel(sim, 3);
	settle(sim, 2);
	assert.equal(sim.pieces.length, 0);
	assert.ok(railPoint(0).x === PLACES.hand.x && railPoint(1).x < PLACES.window.x);
});
