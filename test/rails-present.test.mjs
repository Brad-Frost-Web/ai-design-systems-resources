import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
	buildSteps, shownAt, newAt, firstStepOfLevel, clampStep,
	presentFromSearch, stepForKey, visiblePipeline, visibleLoops, visibleUses,
} from "../js/recipes/rails-present-state.mjs";

const lab = createRequire(import.meta.url)("../_data/railsLab.js");
const { presentation } = lab;
const steps = buildSteps(presentation.levels, presentation.flowLabel);
const nodes = presentation.lanes.flatMap(lane => lane.nodes);
const pipeline = presentation.lanes.find(lane => lane.id === "pipeline").nodes;
const last = steps.length - 1;

test("every level has beats and ends on a flow beat", () => {
	assert.equal(presentation.levels.length, lab.rungs.length);
	for (let level = 0; level < presentation.levels.length; level++) {
		const own = steps.filter(s => s.level === level);
		assert.ok(own.length >= 2, `level ${level} has no beats`);
		assert.equal(own.at(-1).kind, "flow");
		assert.ok(own.slice(0, -1).every(s => s.kind === "add" && s.add.length > 0));
	}
});

test("every node arrives on exactly one beat, and every beat names real nodes", () => {
	const ids = new Set(nodes.map(n => n.id));
	assert.equal(ids.size, nodes.length, "duplicate node id");
	const arrivals = steps.flatMap(s => s.add);
	for (const id of arrivals) assert.ok(ids.has(id), `beat adds unknown ${id}`);
	assert.equal(new Set(arrivals).size, arrivals.length, "a node arrives twice");
	for (const id of ids) assert.ok(arrivals.includes(id), `${id} never arrives`);
});

test("nodes arrive at the same level the lab shows them", () => {
	const labLevel = new Map([
		...lab.concepts.map(c => [c.id, c.rungIn]),
		...lab.stations.map(s => [s.id, s.in]),
		...lab.files.map(f => [f.id, f.rungIn]),
		...lab.packages.map(p => [p.id, p.rungIn]),
		["specification", 5], ["output-final", 5], ["feedback", 6], ["cfg-process", 5],
		["entry", 0], ["generate", 0], ["output-preview", 0],
	]);
	for (const s of steps) for (const id of s.add) {
		if (labLevel.has(id)) assert.equal(s.level, labLevel.get(id), `${id} arrives at level ${s.level + 1}`);
	}
});

test("Generate gives way to Compose, and the last step shows everything else", () => {
	const compose = steps.findIndex(s => s.add.includes("s4"));
	assert.ok(shownAt(steps, compose - 1).has("generate"));
	assert.ok(!shownAt(steps, compose).has("generate"));
	const end = shownAt(steps, last);
	assert.equal(end.size, nodes.length - 1);
});

test("newAt is only what the beat adds; flow beats add nothing", () => {
	assert.deepEqual([...newAt(steps, 0)], ["entry"]);
	for (const [i, s] of steps.entries()) if (s.kind === "flow") assert.equal(newAt(steps, i).size, 0);
});

test("URL and keys", () => {
	assert.deepEqual(presentFromSearch("?present&step=3", steps), { present: true, step: 3 });
	assert.deepEqual(presentFromSearch("?rung=2", steps), { present: false, step: 0 });
	assert.equal(presentFromSearch("?present&step=999", steps).step, last);
	assert.equal(clampStep("x", steps), 0);
	assert.equal(stepForKey("ArrowRight", 0, steps), 1);
	assert.equal(stepForKey(" ", 0, steps), 1);
	assert.equal(stepForKey("ArrowLeft", 0, steps), 0);
	assert.equal(stepForKey("End", 0, steps), last);
	assert.equal(stepForKey("3", 0, steps), firstStepOfLevel(steps, 2));
	assert.equal(stepForKey("8", 0, steps), null);
	assert.equal(stepForKey("a", 0, steps), null);
});

test("edges only join nodes that are both on screen", () => {
	const order = pipeline.map(n => n.id);
	const early = shownAt(steps, firstStepOfLevel(steps, 1) - 1);
	assert.deepEqual(visiblePipeline(order, early), ["entry", "generate", "output-preview", "s7"]);
	assert.deepEqual(visibleLoops(presentation.loops, early).map(l => `${l.from}>${l.to}`), ["s7>generate"]);
	const end = shownAt(steps, last);
	assert.deepEqual(visibleLoops(presentation.loops, end).map(l => `${l.from}>${l.to}`), ["s5>s4", "s7>s4", "s8>s4", "feedback>s1"]);
	const ids = new Set(nodes.map(n => n.id));
	for (const edge of visibleUses(nodes, end)) assert.ok(ids.has(edge.to), `${edge.from} uses unknown ${edge.to}`);
	assert.equal(visibleUses(nodes, early).length, 0);
});
