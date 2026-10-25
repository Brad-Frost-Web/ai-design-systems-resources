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
