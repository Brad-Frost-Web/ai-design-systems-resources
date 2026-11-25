import { test } from "node:test";
import assert from "node:assert/strict";
import {
	clampRung,
	rungFromSearch,
	pieceState,
	isShown,
	rungForKey,
} from "../js/recipes/rails-stage-state.mjs";


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
