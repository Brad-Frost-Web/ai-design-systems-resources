/**
 * Pure state for ed-r-c-rails-stage (#33): which rung is showing, and where
 * each diagram piece stands relative to it. No DOM, so it is unit-tested.
 */

/** Clamp any input to a whole rung between 0 and lastRung. */
export function clampRung(value, lastRung) {
	const n = Math.round(Number(value));
	if (!Number.isFinite(n)) return 0;
	return Math.min(Math.max(n, 0), lastRung);
}

/** The rung a URL asks for (`?rung=4`), or 0 when it asks for none. */
export function rungFromSearch(search, lastRung) {
	const raw = new URLSearchParams(search).get("rung");
	return raw === null || raw.trim() === "" ? 0 : clampRung(raw, lastRung);
}

/**
 * Where a piece stands at `rung`:
 * - "future"  not added yet
 * - "new"     added by this rung
 * - "present" added by an earlier rung
 * - "gone"    replaced by a later piece (`rungOut` reached)
 */
export function pieceState(rungIn, rungOut, rung) {
	if (rung < rungIn) return "future";
	if (rungOut !== undefined && rungOut !== null && rung >= rungOut) return "gone";
	return rung === rungIn ? "new" : "present";
}

/** Whether a piece in this state is on screen. */
export function isShown(state) {
	return state === "new" || state === "present";
}

/** The rung reached from `rung` by a key press, or null if the key isn't ours. */
export function rungForKey(key, rung, lastRung) {
	if (key === "ArrowRight" || key === "PageDown") return clampRung(rung + 1, lastRung);
	if (key === "ArrowLeft" || key === "PageUp") return clampRung(rung - 1, lastRung);
	if (key === "Home") return 0;
	if (key === "End") return lastRung;
	if (/^[0-9]$/.test(key)) return clampRung(Number(key), lastRung);
	return null;
}
