import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const lab = require("../_data/railsLab.js");
const original = readFileSync(new URL("../_data/resources/keep-ai-on-the-rails-claude.html", import.meta.url), "utf8");

test("the sibling preserves every original concept explanation and example", () => {
	assert.equal(lab.concepts.length, 5);
	for (const concept of lab.concepts) {
		assert.ok(concept.description.trim().length > 40);
		assert.ok(concept.example.trim().length > 40);
		assert.ok(original.includes(concept.description), `${concept.id} description was rewritten`);
		assert.ok(original.includes(concept.example), `${concept.id} example was rewritten`);
	}
});

test("pipeline relationships resolve to actual diagram ingredients", () => {
	const ids = new Set([...lab.concepts, ...lab.packages].map(piece => piece.id));
	ids.add("cfg-process");
	for (const station of lab.stations) {
		for (const id of station.uses.split(" ").filter(Boolean)) {
			assert.ok(ids.has(id), `${station.id} points to nonexistent ${id}`);
		}
	}
});

test("system sections retain all authored files, packages, and process copy", () => {
	assert.equal(lab.files.length, 6);
	assert.equal(lab.packages.length, 10);
	for (const item of [...lab.files, ...lab.packages]) {
		assert.ok(item.label.trim().length > 0);
		assert.ok(item.description.trim().length > 0);
		assert.ok(original.includes(item.label), `${item.id} label was rewritten`);
		assert.ok(original.includes(item.description), `${item.id} description was rewritten`);
	}
	for (const value of [...Object.values(lab.eddie), lab.process.label, lab.process.title, lab.process.description, lab.process.phases, ...lab.process.chips]) {
		assert.ok(value.trim().length > 0);
		assert.ok(original.includes(value), "Authored system section copy changed");
	}
	assert.equal((lab.process.phases.match(/<li\b/g) || []).length, 8);
	assert.equal(lab.process.chips.length, 8);
});

test("human judgment stays separate from automatic validation and merge gates", () => {
	const byId = Object.fromEntries(lab.stations.map(station => [station.id, station]));
	assert.equal(byId.s5.kind, "check");
	assert.equal(byId.s7.kind, "human");
	assert.equal(byId.s8.kind, "check");
	assert.equal(byId.s9.kind, "human");
	assert.ok(byId.s7.in < byId.s9.in);
	assert.equal(lab.packages.find(p => p.id === "pkg-reporter").rungIn, lab.lastRung);
	assert.equal(lab.rungs.length, 7);
});

test("timeline cards preserve all authored copy and iteration boundaries", () => {
	const sources = [...original.matchAll(/<article class="node(?: [^"]*)?"[^>]*>([\s\S]*?)<\/article>/g)]
		.map(match => match[1]).filter(html => html.includes('class="node__name"'));
	assert.equal(lab.stations.length, 9);
	lab.stations.forEach((station, index) => {
		for (const field of ["kicker", "title", "description", "prevents"]) {
			assert.ok(station[field].length > 0);
			assert.ok(sources[index].includes(station[field]), `${station.id}: authored ${field} changed`);
		}
		assert.deepEqual(station.tools, [...sources[index].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => match[1]));
		assert.equal(station.connector, index >= 4 ? "refresh-cw" : "arrow-forward");
	});
	for (const text of [...lab.terminals.entry.prompts, lab.terminals.output.description, lab.terminals.feedback.description]) {
		assert.ok(original.includes(text), "Authored terminal copy changed");
	}
});


test("spectrum levels keep human review universal and delivery governed", () => {
	assert.deepEqual(lab.rungs.map(rung => rung.title), ["Prompted", "Instructed", "System-grounded", "System-composed", "Automatically checked", "Process-governed", "Connected back to the system"]);
	assert.equal(lab.review.in, 0);
	assert.equal(lab.review.presentationTitle, "Review the resulting UI");
	assert.ok(lab.deliveryStations.every(station => station.in === 5));
	assert.ok(lab.buildStations.every(station => station.in <= 4));
	assert.deepEqual(lab.concepts.map(concept => concept.rungIn), [1, 1, 2, 3, 4]);
	assert.equal(new Set(lab.rungs.map(rung => rung.outputCaption)).size, 7);
	for (const rung of lab.rungs) assert.ok(rung.outputTitle && rung.outputCaption && rung.adds);
	assert.ok(lab.packages.every(piece => piece.rungIn <= lab.lastRung));
	assert.ok(lab.files.every(piece => piece.rungIn <= lab.lastRung));
});


test("every rendered level puts resulting UI before human review and release", () => {
	const nunjucks = require("nunjucks");
	const template = readFileSync(new URL("../demos/keep-ai-on-the-rails-lab.njk", import.meta.url), "utf8");
	const html = nunjucks.renderString(template, { railsLab: lab });
	const cards = [...html.matchAll(/<li class="ed-r-rails-lab__(?:station|endpoint)[^"]*"([^>]*)>/g)].map(([, attrs]) => ({
		id: attrs.match(/data-piece="([^"]+)"/)?.[1] || "prompt",
		start: Number(attrs.match(/data-in="([^"]+)"/)?.[1] || 0),
		end: Number(attrs.match(/data-out="([^"]+)"/)?.[1] || Infinity),
	}));
	for (let level = 0; level <= lab.lastRung; level++) {
		const visible = cards.filter(card => card.start <= level && level < card.end).map(card => card.id);
		assert.ok(visible.indexOf("output-preview") > visible.indexOf(level < 3 ? "generate" : "s4"));
		assert.equal(visible.indexOf("s7"), visible.indexOf("output-preview") + 1);
		assert.equal(visible.includes("specification"), level >= 5);
		assert.equal(visible.includes("output-final"), level >= 5);
		assert.equal(visible.includes("feedback"), level === 6);
		if (level >= 5) {
			assert.ok(visible.indexOf("specification") < visible.indexOf("s4"));
			assert.ok(visible.indexOf("s8") > visible.indexOf("s7"));
			assert.ok(visible.indexOf("output-final") > visible.indexOf("s9"));
		}
	}
});
