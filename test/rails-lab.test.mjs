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

test("human judgment stays separate from automatic validation and merge gates", () => {
	const byId = Object.fromEntries(lab.stations.map(station => [station.id, station]));
	assert.equal(byId.s5.kind, "check");
	assert.equal(byId.s7.kind, "human");
	assert.equal(byId.s8.kind, "check");
	assert.equal(byId.s9.kind, "human");
	assert.ok(byId.s7.in < byId.s9.in);
	assert.equal(lab.packages.find(p => p.id === "pkg-reporter").rungIn, lab.lastRung);
	assert.equal(lab.rungs.length, 11);
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
