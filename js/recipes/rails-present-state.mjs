/**
 * Pure state for the Rails presentation view (#33). No DOM, unit tested.
 * A level is a list of beats; every level ends with a flow beat that runs
 * the pipeline. Steps are numbered across all levels from 0.
 */

/** Flatten levels of beats into numbered steps, adding a flow beat per level. */
export function buildSteps(levels, flowLabel = "See it run") {
	const steps = [];
	levels.forEach((beats, level) => {
		beats.forEach((beat, index) => {
			steps.push({ level, beat: index, kind: "add", label: beat.label, add: beat.add || [], remove: beat.remove || [] });
		});
		steps.push({ level, beat: beats.length, kind: "flow", label: flowLabel, add: [], remove: [] });
	});
	return steps;
}

/** Ids on screen at `step`: everything added so far, minus what was removed. */
export function shownAt(steps, step) {
	const shown = new Set();
	for (const s of steps.slice(0, step + 1)) {
		s.add.forEach(id => shown.add(id));
		s.remove.forEach(id => shown.delete(id));
	}
	return shown;
}

/** Ids that arrive on `step` (the ones that get the slash sweep). */
export function newAt(steps, step) {
	return new Set(steps[step]?.add || []);
}

/** The first step of a level, for number-key jumps and entering from the lab. */
export function firstStepOfLevel(steps, level) {
	const index = steps.findIndex(s => s.level === level);
	return index === -1 ? 0 : index;
}

export function clampStep(value, steps) {
	const n = Math.round(Number(value));
	if (!Number.isFinite(n)) return 0;
	return Math.min(Math.max(n, 0), steps.length - 1);
}

/** `?present&step=4` → { present: true, step: 4 }. */
export function presentFromSearch(search, steps) {
	const params = new URLSearchParams(search);
	return { present: params.has("present"), step: clampStep(params.get("step") ?? 0, steps) };
}

/** The step a key moves to, or null when the key isn't the presentation's. */
export function stepForKey(key, step, steps) {
	if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(key)) return clampStep(step + 1, steps);
	if (["ArrowLeft", "ArrowUp", "PageUp"].includes(key)) return clampStep(step - 1, steps);
	if (key === "Home") return 0;
	if (key === "End") return steps.length - 1;
	const levels = Math.max(...steps.map(s => s.level)) + 1;
	if (/^[1-9]$/.test(key) && Number(key) <= levels) return firstStepOfLevel(steps, Number(key) - 1);
	return null;
}

/** The pipeline ids, in order, that are on screen. */
export function visiblePipeline(order, shown) {
	return order.filter(id => shown.has(id));
}

/**
 * Retry loops whose ends are both on screen. `to` lists candidates; the
 * first one shown is used, so a loop can retarget as the pipeline grows.
 */
export function visibleLoops(loops, shown) {
	return loops.flatMap(loop => {
		const to = loop.to.find(id => shown.has(id));
		return shown.has(loop.from) && to ? [{ ...loop, to }] : [];
	});
}

/** Uses edges ("station uses ingredient") whose ends are both on screen. */
export function visibleUses(nodes, shown) {
	return nodes.flatMap(node => shown.has(node.id)
		? (node.uses || "").split(" ").filter(id => id && shown.has(id)).map(to => ({ from: node.id, to }))
		: []);
}
