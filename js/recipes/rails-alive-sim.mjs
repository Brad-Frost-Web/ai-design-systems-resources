/**
 * Keep AI on the Rails, alive (#56): the pure simulation. No DOM, unit tested.
 *
 * A prompt makes the agent emit UI pieces at a product window. Each level of
 * guidance changes the physics: with none, pieces are hallucinated and flung
 * ballistically, landing crooked or in a heap on the floor. Rules tint them.
 * The design system makes them real. Recipes lay rails that carry each piece
 * into its slot. Validation zaps strays round a retry loop. A human approval
 * holds the Steel Curtain shut until someone says yes. Feedback teaches the
 * brain, so the next build hallucinates less.
 *
 * Coordinates are a fixed 1920×1080 stage; the renderer scales it.
 */

export const STAGE = { width: 1920, height: 1080, floor: 980, gravity: 2200 };

export const PLACES = {
	hand: { x: 510, y: 600 },
	head: { x: 300, y: 430 },
	brain: { x: 820, y: 190 },
	window: { x: 1130, y: 230, width: 540, height: 660, bar: 48, pad: 22 },
	booth: { x: 1715, y: 400, width: 180, height: 490 },
	gateT: 0.55,
	specT: 0.14,
};

/** What each level switches on. `hallucinate` is the chance a piece is invented. */
export const LEVELS = [
	{ hallucinate: 1, look: "wild", extra: 0.9, spread: 330, stick: 0.45, spin: 9, cadence: 0.075 },
	{ hallucinate: 1, look: "tinted", extra: 0.4, spread: 170, stick: 0.75, spin: 5, cadence: 0.1, rules: true },
	{ hallucinate: 0.35, look: "tinted", extra: 0.1, spread: 70, stick: 0.95, spin: 2, cadence: 0.12, rules: true, brain: true },
	{ hallucinate: 0.3, look: "tinted", extra: 0, cadence: 0.24, rules: true, brain: true, rails: true },
	{ hallucinate: 0.3, look: "tinted", extra: 0, cadence: 0.24, rules: true, brain: true, rails: true, gate: true },
	{ hallucinate: 0.2, look: "tinted", extra: 0, cadence: 0.24, rules: true, brain: true, rails: true, gate: true, spec: true, curtain: true },
	{ hallucinate: 0.2, look: "tinted", extra: 0, cadence: 0.24, rules: true, brain: true, rails: true, gate: true, spec: true, curtain: true, feedback: true },
];

export const FEATURES = ["rules", "brain", "rails", "gate", "spec", "curtain", "feedback"];

/** Layouts the agent can be asked for. Slots are fractions of the window's content box. */
export const TEMPLATES = {
	signup: {
		label: "signup page",
		slots: [
			["nav", 0, 0, 1, 0.09], ["heading", 0.04, 0.13, 0.62, 0.1], ["text", 0.04, 0.25, 0.5, 0.07],
			["field", 0.04, 0.36, 0.5, 0.11], ["field", 0.04, 0.5, 0.5, 0.11], ["button", 0.04, 0.65, 0.3, 0.09],
			["image", 0.6, 0.25, 0.36, 0.49], ["text", 0.04, 0.84, 0.92, 0.07],
		],
	},
	pricing: {
		label: "pricing page",
		slots: [
			["nav", 0, 0, 1, 0.09], ["heading", 0.19, 0.13, 0.62, 0.1], ["text", 0.25, 0.25, 0.5, 0.06],
			["price", 0.03, 0.36, 0.3, 0.44], ["price", 0.35, 0.36, 0.3, 0.44], ["price", 0.67, 0.36, 0.3, 0.44],
			["button", 0.35, 0.85, 0.3, 0.09],
		],
	},
	dashboard: {
		label: "dashboard",
		slots: [
			["nav", 0, 0, 1, 0.09], ["heading", 0.04, 0.13, 0.5, 0.09],
			["stat", 0.04, 0.26, 0.28, 0.17], ["stat", 0.36, 0.26, 0.28, 0.17], ["stat", 0.68, 0.26, 0.28, 0.17],
			["chart", 0.04, 0.48, 0.92, 0.44],
		],
	},
};

const PRODUCT = new Set(["stuck", "placed", "snapping"]);
const GONE = new Set(["swept", "shipping"]);

/** Small, seedable PRNG (mulberry32) so tests and replays are deterministic. */
export function rng(seed = 1) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function gauss(random) {
	return (random() + random() + random() - 1.5) * 1.15;
}

export function templateFor(prompt = "") {
	const p = prompt.toLowerCase();
	if (/pric|plan|tier|subscri/.test(p)) return "pricing";
	if (/dash|stat|metric|chart|analytic|admin|report/.test(p)) return "dashboard";
	return "signup";
}

/** The window's content box. */
export function contentBox() {
	const w = PLACES.window;
	return { x: w.x + w.pad, y: w.y + w.bar + w.pad, width: w.width - w.pad * 2, height: w.height - w.bar - w.pad * 2 };
}

export function slotRect(template, index) {
	const [kind, fx, fy, fw, fh] = TEMPLATES[template].slots[index];
	const box = contentBox();
	const width = fw * box.width - 8;
	const height = fh * box.height - 8;
	return { kind, width, height, x: box.x + fx * box.width + 4 + width / 2, y: box.y + fy * box.height + 4 + height / 2 };
}

function cubic(p0, p1, p2, p3, t) {
	const u = 1 - t;
	return {
		x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
		y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
	};
}

/** The rails from the agent's hand to the window. */
export const RAIL = [PLACES.hand, { x: 660, y: 800 }, { x: 930, y: 400 }, { x: PLACES.window.x - 8, y: 560 }];
/** The retry loop from the validation gate back under the rails to the hand. */
export const RETRY = [null, { x: 960, y: 990 }, { x: 560, y: 1000 }, { x: PLACES.hand.x - 10, y: PLACES.hand.y + 40 }];
/** The feedback loop from production, over the top, back to the brain. */
export const FEEDBACK = [{ x: PLACES.booth.x + 90, y: PLACES.booth.y - 10 }, { x: 1760, y: 30 }, { x: 1080, y: 20 }, { x: PLACES.brain.x + 70, y: PLACES.brain.y - 40 }];
/** The cable from the brain down to the agent's head. */
export const CABLE = [{ x: PLACES.brain.x - 20, y: PLACES.brain.y + 78 }, { x: 760, y: 430 }, { x: 520, y: 220 }, { x: 410, y: 360 }];

export const railPoint = t => cubic(...RAIL, t);
export const retryPoint = (t, from = railPoint(PLACES.gateT)) => cubic(from, RETRY[1], RETRY[2], RETRY[3], t);
export const feedbackPoint = t => cubic(...FEEDBACK, t);
export const cablePoint = t => cubic(...CABLE, t);

export function createSim({ seed = 7, level = 0 } = {}) {
	const state = {
		random: rng(seed), level: 0, rules: LEVELS[0], time: 0, nextId: 1,
		pieces: [], queue: [], phase: "idle", phaseT: 0, template: "signup", prompt: "",
		filled: new Set(), caught: 0, releases: 0, learned: 0, emitT: 0, events: [],
	};
	setLevel(state, level);
	return state;
}

/** Change level: the stage clears and the new guardrails take effect. */
export function setLevel(state, level) {
	state.level = Math.max(0, Math.min(LEVELS.length - 1, Math.round(level)));
	state.rules = LEVELS[state.level];
	for (const piece of state.pieces) if (!GONE.has(piece.state)) sweep(piece);
	state.queue = [];
	state.filled = new Set();
	state.caught = 0;
	state.phase = "idle";
	state.phaseT = 0;
	return state;
}

export function hallucinationRate(state) {
	const base = state.rules.hallucinate;
	if (!state.rules.feedback) return base;
	return Math.max(0.03, base * 0.5 ** state.learned);
}

function sweep(piece) {
	piece.state = "swept";
	piece.alpha = 1;
	piece.vy = -200 - Math.random() * 300;
	piece.vx = (Math.random() - 0.5) * 300;
}

function makePiece(state, kind, slot, onSystem) {
	const rules = state.rules;
	const r = slot === null ? null : slotRect(state.template, slot);
	const width = r ? r.width : 50 + state.random() * 90;
	const height = r ? r.height : 40 + state.random() * 80;
	return {
		id: state.nextId++, kind, slot, onSystem,
		look: onSystem ? "system" : rules.look, warp: state.random(),
		x: PLACES.hand.x, y: PLACES.hand.y, vx: 0, vy: 0, rot: 0, vrot: 0,
		width, height, scale: 1, alpha: 1, squash: 0,
		state: "queued", t: 0, born: state.time,
		sticky: state.random() < (rules.stick ?? 1),
	};
}

/** Prompt the agent: sweep the last build and queue a new one. */
export function generate(state, prompt = "") {
	if (state.phase === "shipping" || state.phase === "learning") return false;
	state.prompt = prompt;
	state.template = templateFor(prompt);
	for (const piece of state.pieces) if (PRODUCT.has(piece.state) || piece.state === "queued") sweep(piece);
	state.filled = new Set();
	state.caught = 0;
	const rate = hallucinationRate(state);
	const slots = TEMPLATES[state.template].slots;
	let queue = slots.map(([kind], index) => makePiece(state, kind, index, state.random() >= rate));
	const extra = Math.round(slots.length * (state.rules.extra || 0));
	for (let i = 0; i < extra; i++) queue.push(makePiece(state, "junk", null, false));
	if (!state.rules.rails) queue = queue.sort(() => state.random() - 0.5);
	state.queue = queue;
	state.emitT = 0;
	state.phase = state.rules.brain ? "consulting" : "generating";
	state.phaseT = 0;
	state.events.push({ type: "prompt", prompt, template: state.template });
	if (state.rules.brain) state.events.push({ type: "consult" });
	return true;
}

function launch(state, piece) {
	const rules = state.rules;
	piece.state = rules.rails ? "riding" : "flying";
	piece.x = PLACES.hand.x;
	piece.y = PLACES.hand.y;
	piece.t = 0;
	if (!rules.rails) {
		const box = contentBox();
		const target = piece.slot === null
			? { x: box.x + state.random() * box.width, y: box.y + state.random() * box.height }
			: slotRect(state.template, piece.slot);
		const tx = target.x + gauss(state.random) * rules.spread;
		const ty = target.y + gauss(state.random) * rules.spread * 0.6;
		const time = 0.75 + state.random() * 0.45;
		piece.vx = (tx - piece.x) / time;
		piece.vy = (ty - piece.y - 0.5 * STAGE.gravity * time * time) / time;
		piece.vrot = (state.random() - 0.5) * rules.spin;
	}
	state.pieces.push(piece);
	state.events.push({ type: "spawn", id: piece.id, angle: Math.atan2(piece.vy || -200, piece.vx || 400), onSystem: piece.onSystem });
}

function inWindow(piece) {
	const box = contentBox();
	return piece.x > box.x && piece.x < box.x + box.width && piece.y > box.y && piece.y < box.y + box.height;
}

/** Half the height and width of a piece's rotated bounding box. */
export function halfH(p) { return Math.abs(Math.sin(p.rot)) * p.width / 2 + Math.abs(Math.cos(p.rot)) * p.height / 2; }
export function halfW(p) { return Math.abs(Math.cos(p.rot)) * p.width / 2 + Math.abs(Math.sin(p.rot)) * p.height / 2; }

function supportBelow(state, piece) {
	let top = STAGE.floor;
	for (const other of state.pieces) {
		if (other === piece || other.state !== "resting") continue;
		if (Math.abs(other.x - piece.x) > halfW(other) + halfW(piece) - 6) continue;
		const otherTop = other.y - halfH(other);
		if (otherTop >= piece.y - 2 && otherTop < top) top = otherTop;
	}
	return top;
}

function freeSlotFor(state, piece) {
	let best = null;
	let bestDistance = Infinity;
	TEMPLATES[state.template].slots.forEach(([kind], index) => {
		if (kind !== piece.kind || state.filled.has(index)) return;
		const r = slotRect(state.template, index);
		const d = Math.hypot(r.x - piece.x, r.y - piece.y);
		if (d < bestDistance) { best = index; bestDistance = d; }
	});
	return best;
}

function zap(state, piece) {
	piece.state = "retry";
	piece.t = 0;
	piece.slotFrom = piece.slot;
	piece.from = { x: piece.x, y: piece.y, rot: piece.rot };
	state.caught++;
	state.events.push({ type: "zap", id: piece.id, x: piece.x, y: piece.y });
}

function startSnap(state, piece, slot) {
	piece.slot = slot;
	piece.state = "snapping";
	piece.t = 0;
	piece.from = { x: piece.x, y: piece.y, rot: piece.rot };
	const r = slotRect(state.template, slot);
	piece.width = r.width;
	piece.height = r.height;
	state.filled.add(slot);
}

function bounce(piece) {
	piece.vx = -Math.abs(piece.vx) * 0.45 - 120;
	piece.vy = -Math.abs(piece.vy) * 0.3 - 200;
	piece.bounced = true;
}

function hitWindow(state, piece) {
	const rules = state.rules;
	if (piece.thrown && rules.gate && !piece.onSystem) return zap(state, piece);
	if (rules.rails) {
		const slot = piece.kind === "junk" ? null : freeSlotFor(state, piece);
		if (slot === null) { bounce(piece); state.events.push({ type: "bounce", id: piece.id }); return; }
		startSnap(state, piece, slot);
		return;
	}
	if (piece.sticky || piece.thrown) {
		piece.state = "stuck";
		piece.vx = piece.vy = piece.vrot = 0;
		if (state.level >= 2) piece.rot *= 0.15;
		piece.squash = 1;
		state.events.push({ type: "stick", id: piece.id, onSystem: piece.onSystem });
	} else {
		bounce(piece);
		state.events.push({ type: "bounce", id: piece.id });
	}
}

function productSlotsDone(state) {
	return state.queue.length === 0
		&& TEMPLATES[state.template].slots.every((_, i) => state.filled.has(i))
		&& !state.pieces.some(p => p.state === "riding" || p.state === "retry" || p.state === "snapping");
}

function settled(state) {
	return state.queue.length === 0 && !state.pieces.some(p => ["queued", "flying", "riding", "retry", "snapping"].includes(p.state));
}

/** Advance the world by `dt` seconds. Returns (and clears) the events it raised. */
export function step(state, dt) {
	dt = Math.min(dt, 1 / 20);
	state.time += dt;
	state.phaseT += dt;
	const rules = state.rules;

	if (state.phase === "consulting" && state.phaseT > 0.9) { state.phase = "generating"; state.phaseT = 0; }
	if (state.phase === "generating") {
		state.emitT -= dt;
		while (state.emitT <= 0 && state.queue.length) {
			launch(state, state.queue.shift());
			state.emitT += rules.cadence;
		}
		if (!state.queue.length) {
			if (rules.rails && productSlotsDone(state)) finishBuild(state);
			else if (!rules.rails && settled(state)) finishBuild(state);
		}
	}

	for (const piece of state.pieces) stepPiece(state, piece, dt);
	state.pieces = state.pieces.filter(p => p.alpha > 0);

	const resting = state.pieces.filter(p => p.state === "resting");
	if (resting.length > 70) resting.slice(0, resting.length - 70).forEach(sweep);

	if (state.phase === "shipping") stepShipping(state, dt);
	if (state.phase === "learning" && state.phaseT >= 1.8) {
		state.learned++;
		state.phase = "idle";
		state.events.push({ type: "learn", learned: state.learned, rate: hallucinationRate(state) });
	}

	const events = state.events;
	state.events = [];
	return events;
}

function finishBuild(state) {
	if (state.rules.curtain) {
		state.phase = "awaiting";
		state.events.push({ type: "ready" });
	} else {
		state.phase = "idle";
		state.events.push({ type: "done" });
	}
	state.phaseT = 0;
}

function stepPiece(state, piece, dt) {
	piece.squash *= Math.exp(-dt * 9);
	switch (piece.state) {
	case "flying": {
		piece.vy += STAGE.gravity * dt;
		piece.x += piece.vx * dt;
		piece.y += piece.vy * dt;
		piece.rot += piece.vrot * dt;
		if (!piece.bounced && inWindow(piece)) {
			hitWindow(state, piece);
			if (piece.state !== "flying") return;
		}
		if (piece.x < piece.width / 2) { piece.x = piece.width / 2; piece.vx = Math.abs(piece.vx) * 0.6; }
		if (piece.x > STAGE.width - piece.width / 2) { piece.x = STAGE.width - piece.width / 2; piece.vx = -Math.abs(piece.vx) * 0.6; }
		if (piece.y < -400) piece.vy = Math.abs(piece.vy) * 0.3;
		const support = supportBelow(state, piece);
		if (piece.y + halfH(piece) >= support && piece.vy > 0) {
			const speed = piece.vy;
			piece.y = support - halfH(piece);
			piece.vy = -speed * 0.32;
			piece.vx *= 0.7;
			piece.vrot *= 0.5;
			piece.squash = Math.min(1, speed / 1200);
			if (Math.abs(piece.vy) < 140) {
				piece.state = "resting";
				piece.vy = 0;
				piece.vrot = 0;
			}
			state.events.push({ type: "land", id: piece.id, speed, x: piece.x, y: piece.y + halfH(piece) });
		}
		break;
	}
	case "resting": {
		piece.vx *= Math.exp(-dt * 6);
		piece.x += piece.vx * dt;
		piece.x = Math.max(piece.width / 2, Math.min(STAGE.width - piece.width / 2, piece.x));
		const flat = Math.round(piece.rot / Math.PI) * Math.PI;
		piece.rot += (flat - piece.rot) * Math.min(1, dt * 5);
		const support = supportBelow(state, piece);
		if (piece.y + halfH(piece) < support - 3) { piece.state = "flying"; piece.vy = 0; }
		else piece.y = support - halfH(piece);
		break;
	}
	case "riding": {
		const was = piece.t;
		piece.t = Math.min(1, piece.t + dt * 0.62);
		const p = railPoint(piece.t);
		piece.x = p.x;
		piece.y = p.y - piece.height / 2 - 14 + Math.sin(state.time * 14 + piece.id) * 3;
		piece.rot = Math.sin(state.time * 6 + piece.id) * 0.04;
		if (state.rules.spec && was < PLACES.specT && piece.t >= PLACES.specT) state.events.push({ type: "spec", id: piece.id, x: p.x, y: p.y });
		if (state.rules.gate && was < PLACES.gateT && piece.t >= PLACES.gateT) {
			if (!piece.onSystem) { zap(state, piece); return; }
			state.events.push({ type: "pass", id: piece.id, x: p.x, y: p.y });
		}
		if (piece.t >= 1) {
			const slot = piece.slot !== null && !state.filled.has(piece.slot) ? piece.slot : freeSlotFor(state, piece);
			if (slot === null) { piece.state = "flying"; piece.vx = 300; piece.vy = -300; piece.bounced = true; return; }
			startSnap(state, piece, slot);
		}
		break;
	}
	case "retry": {
		piece.t = Math.min(1, piece.t + dt / 1.3);
		const p = retryPoint(piece.t, piece.from);
		piece.x = p.x;
		piece.y = p.y;
		piece.rot += dt * 8;
		if (piece.t >= 1) {
			piece.onSystem = true;
			piece.look = "system";
			piece.warp = 0;
			piece.rot = 0;
			piece.thrown = false;
			piece.bounced = false;
			piece.t = 0;
			piece.slot = piece.slotFrom ?? piece.slot;
			if (piece.kind === "junk") { piece.alpha = 0; return; }
			if (state.rules.rails) piece.state = "riding";
			else { piece.state = "flying"; piece.vx = 0; piece.vy = 0; }
			state.events.push({ type: "retry", id: piece.id });
		}
		break;
	}
	case "snapping": {
		piece.t = Math.min(1, piece.t + dt / 0.38);
		const r = slotRect(state.template, piece.slot);
		const k = easeOutBack(piece.t);
		piece.x = piece.from.x + (r.x - piece.from.x) * k;
		piece.y = piece.from.y + (r.y - piece.from.y) * k;
		piece.rot = piece.from.rot * (1 - piece.t);
		if (piece.t >= 1) {
			piece.state = "placed";
			piece.squash = 0.8;
			state.events.push({ type: "snap", id: piece.id, x: r.x, y: r.y, onSystem: piece.onSystem });
		}
		break;
	}
	case "held": {
		const k = Math.min(1, dt * 24);
		const nx = piece.x + (piece.hold.x - piece.x) * k;
		const ny = piece.y + (piece.hold.y - piece.y) * k;
		piece.vx = (nx - piece.x) / dt;
		piece.vy = (ny - piece.y) / dt;
		piece.x = nx;
		piece.y = ny;
		piece.rot += (Math.max(-0.6, Math.min(0.6, piece.vx / 2500)) - piece.rot) * Math.min(1, dt * 10);
		break;
	}
	case "swept": {
		piece.vy += STAGE.gravity * dt;
		piece.x += piece.vx * dt;
		piece.y += piece.vy * dt;
		piece.rot += dt * 3;
		piece.alpha -= dt * 1.6;
		break;
	}
	default:
		break;
	}
}

function stepShipping(state, dt) {
	const t = state.phaseT;
	const booth = PLACES.booth;
	const target = { x: booth.x + booth.width / 2, y: booth.y + booth.height * 0.55 };
	const win = PLACES.window;
	const centre = { x: win.x + win.width / 2, y: win.y + win.height / 2 };
	const k = easeInOut(Math.max(0, Math.min(1, (t - 0.65) / 0.7)));
	for (const piece of state.pieces) {
		if (piece.state !== "shipping") continue;
		const sx = target.x + (piece.home.x - centre.x) * 0.22;
		const sy = target.y + (piece.home.y - centre.y) * 0.22;
		piece.x = piece.home.x + (sx - piece.home.x) * k - Math.sin(k * Math.PI) * 30;
		piece.y = piece.home.y + (sy - piece.home.y) * k - Math.sin(k * Math.PI) * 220;
		piece.scale = 1 - 0.78 * k;
		if (t > 1.45) piece.alpha = Math.max(0, piece.alpha - dt * 6);
	}
	if (t >= 1.75) {
		state.releases++;
		state.pieces = state.pieces.filter(p => p.state !== "shipping");
		state.filled = new Set();
		state.events.push({ type: "shipped", releases: state.releases });
		if (state.rules.feedback) {
			state.phase = "learning";
			state.events.push({ type: "feedback" });
		} else state.phase = "idle";
		state.phaseT = 0;
	}
}

/** The human's yes. Only means something while a finished build waits behind the curtain. */
export function approve(state) {
	if (state.phase !== "awaiting") return false;
	state.phase = "shipping";
	state.phaseT = 0;
	for (const piece of state.pieces) {
		if (piece.state === "placed") { piece.state = "shipping"; piece.home = { x: piece.x, y: piece.y }; }
	}
	state.events.push({ type: "approve" });
	return true;
}

/** Pick up the topmost piece under a point. Lifting a piece out of the product frees its slot. */
export function grab(state, x, y) {
	for (let i = state.pieces.length - 1; i >= 0; i--) {
		const piece = state.pieces[i];
		if (GONE.has(piece.state) || piece.state === "queued" || piece.state === "retry") continue;
		const pad = 12;
		if (Math.abs(x - piece.x) > piece.width / 2 + pad || Math.abs(y - piece.y) > piece.height / 2 + pad) continue;
		if (piece.state === "placed" || piece.state === "snapping") state.filled.delete(piece.slot);
		if (state.phase === "awaiting" && (piece.state === "placed")) state.phase = "generating";
		piece.state = "held";
		piece.hold = { x, y };
		piece.bounced = false;
		state.pieces.splice(i, 1);
		state.pieces.push(piece);
		state.events.push({ type: "grab", id: piece.id });
		return piece;
	}
	return null;
}

export function drag(state, piece, x, y) {
	if (piece && piece.state === "held") piece.hold = { x, y };
}

export function release(state, piece) {
	if (!piece || piece.state !== "held") return;
	const cap = 3200;
	piece.vx = Math.max(-cap, Math.min(cap, piece.vx || 0));
	piece.vy = Math.max(-cap, Math.min(cap, piece.vy || 0));
	piece.vrot = piece.vx / 400;
	piece.state = "flying";
	piece.thrown = true;
	piece.sticky = true;
	state.events.push({ type: "throw", id: piece.id, speed: Math.hypot(piece.vx, piece.vy) });
}

/** The pointer as wind: loose pieces near it get pushed along. */
export function stir(state, x, y, vx, vy, radius = 170) {
	for (const piece of state.pieces) {
		if (piece.state !== "flying" && piece.state !== "resting") continue;
		const d = Math.hypot(piece.x - x, piece.y - y);
		if (d > radius) continue;
		const f = (1 - d / radius) * 0.05;
		piece.vx += vx * f;
		piece.vy += vy * f;
		piece.vrot += (vx * f) / 300;
		if (piece.state === "resting" && Math.hypot(vx, vy) * f > 60) { piece.state = "flying"; piece.vy = Math.min(piece.vy, -150); }
	}
}

/** What is in the product right now, plus what validation caught and what shipped. */
export function stats(state) {
	let hallucinated = 0;
	let onSystem = 0;
	for (const piece of state.pieces) {
		if (!PRODUCT.has(piece.state)) continue;
		if (piece.onSystem) onSystem++;
		else hallucinated++;
	}
	return { hallucinated, onSystem, caught: state.caught, releases: state.releases, learned: state.learned };
}

/** Run the world forward quickly (reduced motion, tests). */
export function settle(state, seconds = 8, dt = 1 / 60) {
	const events = [];
	for (let t = 0; t < seconds; t += dt) events.push(...step(state, dt));
	return events;
}

export function easeOutBack(t) {
	const c = 1.70158;
	return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
}

export function easeInOut(t) {
	return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

export function easeOutElastic(t) {
	if (t <= 0) return 0;
	if (t >= 1) return 1;
	return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}
