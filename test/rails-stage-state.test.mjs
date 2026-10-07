import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
	clampRung,
	rungFromSearch,
	pieceState,
	isShown,
	rungForKey,
} from "../js/recipes/rails-stage-state.mjs";

const rails = createRequire(import.meta.url)("../_data/rails.js");

test("clampRung keeps rungs whole and in range", () => {
	assert.equal(clampRung(4, 10), 4);
	assert.equal(clampRung("7", 10), 7);
	assert.equal(clampRung(-3, 10), 0);
	assert.equal(clampRung(42, 10), 10);
	assert.equal(clampRung(2.6, 10), 3);
	assert.equal(clampRung("nope", 10), 0);
});

test("rungFromSearch reads ?rung= and defaults to 0", () => {
	assert.equal(rungFromSearch("?rung=4", 10), 4);
	assert.equal(rungFromSearch("?rung=99", 10), 10);
	assert.equal(rungFromSearch("", 10), 0);
	assert.equal(rungFromSearch("?rung=", 10), 0);
	assert.equal(rungFromSearch("?other=2", 10), 0);
});

test("pieceState walks future → new → present", () => {
	assert.equal(pieceState(4, undefined, 3), "future");
	assert.equal(pieceState(4, undefined, 4), "new");
	assert.equal(pieceState(4, undefined, 9), "present");
});

test("a piece with rungOut is gone from that rung on", () => {
	assert.equal(pieceState(0, 5, 4), "present");
	assert.equal(pieceState(0, 5, 5), "gone");
	assert.equal(isShown(pieceState(0, 5, 5)), false);
});

test("rungForKey steps, jumps and ignores other keys", () => {
	assert.equal(rungForKey("ArrowRight", 3, 10), 4);
	assert.equal(rungForKey("ArrowLeft", 0, 10), 0);
	assert.equal(rungForKey("ArrowRight", 10, 10), 10);
	assert.equal(rungForKey("Home", 6, 10), 0);
	assert.equal(rungForKey("End", 2, 10), 10);
	assert.equal(rungForKey("7", 2, 10), 7);
	assert.equal(rungForKey("a", 2, 10), null);
});

test("the rung data tells a complete story", () => {
	assert.equal(rails.rungs.length, 11);
	assert.equal(rails.lastRung, 10);
	rails.rungs.forEach((rung, i) => {
		assert.ok(rung.title && rung.adds && rung.now, `rung ${i} is missing a beat`);
		// Only the last rung has nothing left that breaks.
		assert.equal(rung.breaks === null, i === rails.lastRung, `rung ${i} breaks`);
	});
});

test("every rung adds at least one piece, and every piece is reachable", () => {
	const pieces = rails.groups.flatMap((group) => group.pieces);
	const ids = new Set();
	for (const piece of pieces) {
		assert.ok(!ids.has(piece.id), `duplicate piece id ${piece.id}`);
		ids.add(piece.id);
		assert.ok(piece.rungIn >= 0 && piece.rungIn <= rails.lastRung, `${piece.id} rungIn`);
	}
	for (let rung = 1; rung <= rails.lastRung; rung++) {
		assert.ok(
			pieces.some((piece) => piece.rungIn === rung),
			`rung ${rung} adds nothing to the diagram`,
		);
	}
	// At the last rung, everything except replaced pieces is on screen.
	const shown = pieces.filter((p) => isShown(pieceState(p.rungIn, p.rungOut, rails.lastRung)));
	assert.equal(shown.length, pieces.filter((p) => p.rungOut === undefined).length);
});
