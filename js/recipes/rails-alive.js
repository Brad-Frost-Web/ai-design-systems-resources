/**
 * <aids-rails-alive>: Keep AI on the Rails, alive (#56). A playable,
 * Flash-era stage drawn on a 2D canvas, wired to Eddie chrome (level
 * buttons, a prompt form, stat cards, toggles). The world is
 * rails-alive-sim.mjs; this file only draws it, plays it and listens.
 *
 * Every color the stage draws comes from Eddie tokens, read at runtime,
 * except the hallucinated pieces: those are deliberately off-system,
 * because being off-system is what the lesson is about.
 */
import * as Sim from "./rails-alive-sim.mjs";

const { STAGE, PLACES, LEVELS, FEATURES } = Sim;
const W = STAGE.width;
const H = STAGE.height;

/** The hallucinations' palette. Off-system on purpose; never reuse these. */
const WILD = ["#ff2bd6", "#39ff14", "#8a2bff", "#00e5ff", "#ffe600", "#ff5f1f"];
const WILD_FONT = "'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', cursive";

const TOKENS = {
	bg: "--ed-theme-color-background-default",
	surface: "--ed-theme-color-background-surface",
	subtle: "--ed-theme-color-background-subtle",
	ink: "--ed-theme-color-content-default",
	brand: "--ed-theme-color-background-brand",
	orange: "--ed-theme-color-background-accent-1",
	blue: "--ed-theme-color-background-accent-2",
	navy: "--ed-theme-color-background-accent-3",
	mustard: "--ed-theme-color-background-accent-4",
	cream4: "--ed-theme-color-background-accent-6",
	cream5: "--ed-theme-color-background-accent-7",
	cream8: "--ed-theme-color-background-accent-8",
	onDark: "--ed-theme-color-content-knockout",
	display: "--ed-theme-typography-display-default-font-family",
	body: "--ed-theme-typography-body-default-font-family",
};

const COPY = {
	system: {
		signup: { heading: ["Create your account"], button: ["Sign up"], field: ["Email", "Password"] },
		pricing: { heading: ["Simple pricing"], button: ["Compare plans"], price: ["$9", "$29", "$99"] },
		dashboard: { heading: ["This week"], stat: ["1,204", "87%", "3.2s"] },
	},
	tinted: { heading: ["Create You’re Account", "Sign Up Today!"], button: ["Sign Up Now!", "Get Started!"], field: ["E-mail address", "Pass word"], price: ["$29/mo*", "$9.99!", "Call us"], stat: ["1.2K", "87.0%", "fast"] },
	wild: { heading: ["Welcom 2 our site!!", "BEST APP EVER", "Lorem Ipsum Dolar"], button: ["CLICK HERE", "Sing up!!", "Submt"], field: ["Emale", "Pasword?"], price: ["$$$", "FREE?!", "$29.9999"], stat: ["∞", "9000+", "???"] },
};

const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

class Synth {
	constructor() { this.on = false; this.ctx = null; this.last = {}; }
	enable(on) {
		this.on = on;
		if (!on) return;
		if (!this.ctx) {
			const AC = window.AudioContext || window.webkitAudioContext;
			if (!AC) { this.on = false; return; }
			this.ctx = new AC();
			this.master = this.ctx.createGain();
			this.master.gain.value = 0.3;
			this.master.connect(this.ctx.destination);
		}
		this.ctx.resume();
	}
	tone({ type = "sine", f = 440, f2 = f, dur = 0.15, vol = 0.3, delay = 0 }) {
		const c = this.ctx;
		const t = c.currentTime + delay;
		const o = c.createOscillator();
		const g = c.createGain();
		o.type = type;
		o.frequency.setValueAtTime(f, t);
		o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
		g.gain.setValueAtTime(0.0001, t);
		g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
		g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
		o.connect(g).connect(this.master);
		o.start(t);
		o.stop(t + dur + 0.05);
	}
	noise({ dur = 0.2, vol = 0.3, f = 1200, q = 1, kind = "bandpass", delay = 0 }) {
		const c = this.ctx;
		const t = c.currentTime + delay;
		const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
		const src = c.createBufferSource();
		src.buffer = buffer;
		const filter = c.createBiquadFilter();
		filter.type = kind;
		filter.frequency.value = f;
		filter.Q.value = q;
		const g = c.createGain();
		g.gain.setValueAtTime(vol, t);
		g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
		src.connect(filter).connect(g).connect(this.master);
		src.start(t);
	}
	play(name, x = 0) {
		if (!this.on || !this.ctx) return;
		const now = performance.now();
		if (now - (this.last[name] || 0) < 35) return;
		this.last[name] = now;
		const r = Math.random();
		switch (name) {
		case "pop": this.tone({ f: 520 + r * 300, f2: 900 + r * 300, dur: 0.09, vol: 0.18 }); break;
		case "wild": this.tone({ type: "square", f: 300 + r * 600, f2: 80 + r * 900, dur: 0.12, vol: 0.08 }); break;
		case "thud": this.tone({ f: 140, f2: 45, dur: 0.16, vol: clamp(x / 2000, 0.05, 0.35) }); break;
		case "boing": this.tone({ type: "triangle", f: 160, f2: 620, dur: 0.28, vol: 0.2 }); break;
		case "splat": this.noise({ dur: 0.12, vol: 0.25, f: 700 + r * 400, q: 2 }); break;
		case "snap": this.tone({ type: "square", f: 1100, f2: 900, dur: 0.035, vol: 0.08 }); this.tone({ f: 660 + x * 60, dur: 0.18, vol: 0.16, delay: 0.03 }); break;
		case "zap": this.tone({ type: "sawtooth", f: 1600, f2: 70, dur: 0.32, vol: 0.18 }); this.noise({ dur: 0.25, vol: 0.2, f: 3000, q: 0.7 }); break;
		case "retry": this.tone({ f: 260, f2: 980, dur: 0.3, vol: 0.14 }); break;
		case "stamp": this.noise({ dur: 0.28, vol: 0.6, f: 260, kind: "lowpass" }); this.tone({ f: 90, f2: 40, dur: 0.3, vol: 0.4 }); break;
		case "clang": [220, 331, 467, 589].forEach((f, i) => this.tone({ type: "square", f, f2: f * 0.98, dur: 0.7 - i * 0.1, vol: 0.05 })); this.noise({ dur: 0.15, vol: 0.3, f: 2400 }); break;
		case "fanfare": [523, 659, 784, 1047].forEach((f, i) => this.tone({ type: "triangle", f, dur: 0.3, vol: 0.18, delay: i * 0.09 })); break;
		case "shimmer": [1047, 1319, 1568, 2093, 2637].forEach((f, i) => this.tone({ f, dur: 0.4, vol: 0.06, delay: i * 0.07 })); break;
		case "consult": [392, 523, 659].forEach((f, i) => this.tone({ f, dur: 0.14, vol: 0.12, delay: i * 0.08 })); break;
		case "blip": this.tone({ type: "square", f: 700 + r * 200, dur: 0.05, vol: 0.06 }); break;
		case "whoosh": this.noise({ dur: 0.22, vol: 0.22, f: 1800, q: 0.5, kind: "highpass" }); break;
		case "title": this.noise({ dur: 0.35, vol: 0.25, f: 900, q: 0.6 }); this.tone({ type: "triangle", f: 200, f2: 800, dur: 0.3, vol: 0.12 }); break;
		default: break;
		}
	}
}

class RailsAlive extends HTMLElement {
	connectedCallback() {
		if (this.started) return;
		this.started = true;
		this.data = JSON.parse(this.querySelector("[data-alive-data]").textContent);
		this.canvas = this.querySelector("[data-alive-canvas]");
		this.ctx = this.canvas.getContext("2d");
		this.live = this.querySelector("[data-alive-live]");
		this.querySelectorAll("[data-alive-js]").forEach(el => { el.hidden = false; });
		this.querySelectorAll("[data-alive-nojs]").forEach(el => { el.hidden = true; });

		this.synth = new Synth();
		this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const motion = this.querySelector("[data-alive-motion]");
		if (motion) motion.checked = !this.reduced;

		const params = new URLSearchParams(location.search);
		const level = clamp(Number(params.get("level") || 1) - 1, 0, LEVELS.length - 1) || 0;
		this.sim = Sim.createSim({ seed: (Date.now() % 100000) | 0, level: 0 });
		this.fx = {
			particles: [], bubbles: new Map(), shake: 0, flash: 0, bolts: [], title: null, appear: {},
			robot: { squash: 0, jump: 0, jumpV: 0, recoil: 0, talk: 0, aim: -0.2, glow: 0, blink: 0, flutter: 0 },
			brain: { glow: 0, wiggle: 0 }, gate: { light: 0, zap: 0 }, spec: 0, beads: [], dots: [], stamp: null,
			cheer: 0, lineIndex: {}, snaps: 0,
		};
		this.pending = [];
		this.pointer = { x: W / 2, y: H / 2, vx: 0, vy: 0, t: 0, inside: false };
		this.lastPrompt = this.data.suggestions[0];
		this.lastStats = "";
		this.now = performance.now() / 1000;
		this.readPalette();
		this.makeDots();
		this.clouds = [{ x: 260, y: 120, s: 1 }, { x: 1180, y: 90, s: 0.8 }, { x: 1650, y: 150, s: 0.65 }];

		this.resize = this.resize.bind(this);
		this.resizeObserver = new ResizeObserver(this.resize);
		this.resizeObserver.observe(this.canvas);
		this.resize();
		document.fonts?.ready.then(() => this.readPalette());

		this.bindStage();
		this.bindChrome();
		this.applyLevel(level, true);

		this.tick = this.tick.bind(this);
		this.frame = requestAnimationFrame(this.tick);
	}

	disconnectedCallback() {
		cancelAnimationFrame(this.frame);
		this.resizeObserver?.disconnect();
		document.removeEventListener("keydown", this.onKey);
	}

	/* ---------- setup ---------- */

	readPalette() {
		const style = getComputedStyle(this);
		const read = name => style.getPropertyValue(name).trim();
		this.c = {};
		for (const [key, name] of Object.entries(TOKENS)) this.c[key] = read(name);
		this.fonts = { display: this.c.display || "Impact, sans-serif", body: this.c.body || "system-ui, sans-serif" };
		this.tinted = WILD.map(color => this.mix(color, this.c.brand, 0.62));
	}

	mix(a, b, k) {
		const ca = this.rgb(a);
		const cb = this.rgb(b);
		return `rgb(${ca.map((v, i) => Math.round(lerp(v, cb[i], k))).join(",")})`;
	}

	rgb(color) {
		const ctx = this.ctx;
		ctx.fillStyle = "#000";
		ctx.fillStyle = color;
		const s = ctx.fillStyle;
		if (s.startsWith("#")) return [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
		return (s.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
	}

	makeDots() {
		this.dots = [];
		for (let y = 60; y < STAGE.floor - 20; y += 52) {
			for (let x = 40; x < W; x += 52) this.dots.push({ x, y, ox: 0, oy: 0, vx: 0, vy: 0 });
		}
	}

	resize() {
		const rect = this.canvas.getBoundingClientRect();
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
		this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
		this.scale = (rect.width * dpr) / W;
	}

	bindStage() {
		const canvas = this.canvas;
		const toStage = e => {
			const r = canvas.getBoundingClientRect();
			return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
		};
		canvas.addEventListener("pointerdown", e => {
			const p = toStage(e);
			this.audioWake();
			const piece = Sim.grab(this.sim, p.x, p.y);
			if (piece) {
				this.held = piece;
				canvas.setPointerCapture(e.pointerId);
				canvas.style.cursor = "grabbing";
				return;
			}
			const spot = this.hotspotAt(p.x, p.y);
			if (spot) this.poke(spot);
			else this.ripple(p.x, p.y);
		});
		canvas.addEventListener("pointermove", e => {
			const p = toStage(e);
			const t = performance.now() / 1000;
			const dt = Math.max(1 / 240, t - this.pointer.t);
			const vx = (p.x - this.pointer.x) / dt;
			const vy = (p.y - this.pointer.y) / dt;
			this.pointer = { x: p.x, y: p.y, vx: lerp(this.pointer.vx, vx, 0.5), vy: lerp(this.pointer.vy, vy, 0.5), t, inside: true };
			if (this.held) { Sim.drag(this.sim, this.held, p.x, p.y); return; }
			if (this.pointer.t && Math.hypot(vx, vy) < 8000) {
				Sim.stir(this.sim, p.x, p.y, this.pointer.vx, this.pointer.vy);
				if (this.motionOn) this.stirDots(p.x, p.y, this.pointer.vx, this.pointer.vy, 150, 0.012);
			}
			canvas.style.cursor = this.pieceAt(p.x, p.y) ? "grab" : this.hotspotAt(p.x, p.y) ? "pointer" : "crosshair";
		});
		const up = () => {
			if (!this.held) return;
			Sim.release(this.sim, this.held);
			this.held = null;
			canvas.style.cursor = "grab";
		};
		canvas.addEventListener("pointerup", up);
		canvas.addEventListener("pointercancel", up);
		canvas.addEventListener("pointerleave", () => { this.pointer.inside = false; });

		this.onKey = e => {
			if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
			const target = e.composedPath()[0];
			if (target?.closest?.("input, textarea, select, button, a, [contenteditable]")) return;
			if (e.key === " ") { e.preventDefault(); this.prompt(this.nextSuggestion()); }
			else if (/^[1-7]$/.test(e.key)) this.applyLevel(Number(e.key) - 1);
			else if (e.key === "ArrowRight") this.applyLevel(this.sim.level + 1);
			else if (e.key === "ArrowLeft") this.applyLevel(this.sim.level - 1);
			else if (e.key === "a" || e.key === "A") this.approve();
		};
		document.addEventListener("keydown", this.onKey);
	}

	bindChrome() {
		this.levelButtons = [...this.querySelectorAll("[data-alive-level]")];
		this.levelButtons.forEach(button => button.addEventListener("click", () => {
			this.audioWake();
			this.applyLevel(Number(button.dataset.aliveLevel));
		}));
		const form = this.querySelector("[data-alive-prompt]");
		form?.addEventListener("submit", e => {
			e.preventDefault?.();
			this.audioWake();
			this.prompt(e.detail?.value ?? form.value);
		});
		this.querySelectorAll("[data-alive-suggestion]").forEach(button => button.addEventListener("click", () => {
			this.audioWake();
			if (form) form.value = button.dataset.prompt;
			this.prompt(button.dataset.prompt);
		}));
		this.approveButton = this.querySelector("[data-alive-approve]");
		this.approveButton?.addEventListener("click", () => this.approve());
		this.querySelector("[data-alive-sound]")?.addEventListener("change", e => {
			this.synth.enable(Boolean(e.currentTarget.checked));
			this.synth.play("blip");
		});
		this.querySelector("[data-alive-motion]")?.addEventListener("change", e => {
			this.reduced = !e.currentTarget.checked;
		});
		this.statCards = Object.fromEntries([...this.querySelectorAll("[data-alive-stat]")].map(el => [el.dataset.aliveStat, el]));
	}

	audioWake() { if (this.synth.on) this.synth.ctx?.resume(); }

	get motionOn() { return !this.reduced; }

	/* ---------- actions ---------- */

	applyLevel(level, initial = false) {
		level = clamp(Math.round(level), 0, LEVELS.length - 1);
		if (!initial && level === this.sim.level) return;
		const before = initial ? {} : LEVELS[this.sim.level];
		const after = LEVELS[level];
		Sim.setLevel(this.sim, level);
		this.pending = [];
		this.fx.bubbles.clear();
		const t = this.now;
		let stagger = 0;
		for (const feature of FEATURES) {
			if (after[feature] && !before[feature]) {
				const isNew = initial ? false : true;
				this.fx.appear[feature] = { at: t + (this.motionOn ? 1.1 + stagger * 0.22 : 0) - (isNew ? 0 : 0), isNew: isNew || initial };
				stagger++;
			}
			if (!after[feature]) delete this.fx.appear[feature];
		}
		if (this.motionOn) {
			this.fx.title = { at: t, level };
			this.synth.play("title");
		}
		const copy = this.data.levels[level];
		this.updateCaption(level);
		this.later(this.motionOn ? 1.5 : 0.05, () => this.say("robot", this.line("robot")));
		this.later(this.motionOn ? 1.9 : 0.1, () => this.prompt(this.lastPrompt));
		const url = new URL(location.href);
		url.searchParams.set("level", level + 1);
		history.replaceState(null, "", url);
		this.announce(`Level ${level + 1} of ${LEVELS.length}: ${copy.title}. ${copy.lines.stage}`);
	}

	prompt(text) {
		text = (text || "").trim() || this.nextSuggestion();
		if (!Sim.generate(this.sim, text)) return;
		this.lastPrompt = text;
		this.say("you", text);
		if (!this.motionOn) this.handle(Sim.settle(this.sim, 12), true);
	}

	approve() {
		if (Sim.approve(this.sim) && !this.motionOn) this.handle(Sim.settle(this.sim, 4), true);
	}

	nextSuggestion() {
		const list = this.data.suggestions;
		const i = (list.indexOf(this.lastPrompt) + 1) % list.length;
		return list[i];
	}

	later(seconds, fn) { this.pending.push({ at: this.now + seconds, fn }); }

	line(who) {
		const lines = this.data.levels[this.sim.level].lines[who] || [];
		if (!lines.length) return "";
		const key = `${this.sim.level}:${who}`;
		const i = this.fx.lineIndex[key] || 0;
		this.fx.lineIndex[key] = i + 1;
		return lines[i % lines.length];
	}

	say(who, text, ttl = 2.8) {
		if (!text) return;
		this.fx.bubbles.set(who, { text, at: this.now, ttl: Math.max(ttl, 1.4 + text.length * 0.045) });
		if (who === "robot") this.fx.robot.talk = 1;
	}

	announce(text) {
		if (!this.live) return;
		this.live.textContent = "";
		requestAnimationFrame(() => { this.live.textContent = text; });
	}

	hotspotAt(x, y) {
		const rules = this.sim.rules;
		if (x > 150 && x < 450 && y > 280 && y < STAGE.floor) return "robot";
		if (rules.rules && x > 40 && x < 230 && y > 600 && y < 860) return "rules";
		if (rules.brain && Math.hypot(x - PLACES.brain.x, y - PLACES.brain.y) < 120) return "brain";
		const g = Sim.railPoint(PLACES.gateT);
		if (rules.gate && Math.abs(x - g.x) < 95 && y > g.y - 230 && y < g.y + 60) return "gate";
		const b = PLACES.booth;
		if (rules.curtain && x > b.x - 10 && x < b.x + b.width + 10 && y > b.y - 60 && y < STAGE.floor + 30) return "curtain";
		return null;
	}

	pieceAt(x, y) {
		return this.sim.pieces.some(p => !["swept", "shipping", "queued", "retry"].includes(p.state)
			&& Math.abs(x - p.x) < p.width / 2 + 12 && Math.abs(y - p.y) < p.height / 2 + 12);
	}

	poke(spot) {
		const fx = this.fx;
		this.synth.play("blip");
		if (spot === "robot") { fx.robot.jumpV = -900; this.say("robot", this.line("robot")); }
		if (spot === "brain") { fx.brain.wiggle = 1; fx.brain.glow = 1; this.say("brain", this.line("brain") || "Ask me anything."); }
		if (spot === "rules") { fx.robot.flutter = 1; this.say("rules", this.line("rules") || "Follow the rules."); }
		if (spot === "gate") { fx.gate.light = 1; this.say("gate", this.line("gate") || "Checking."); }
		if (spot === "curtain") {
			if (this.sim.phase === "awaiting") this.approve();
			else this.say("curtain", this.line("curtain") || "Closed until approved.");
		}
	}

	ripple(x, y) {
		this.synth.play("whoosh");
		for (const piece of this.sim.pieces) {
			if (piece.state !== "flying" && piece.state !== "resting") continue;
			const dx = piece.x - x;
			const dy = piece.y - y;
			const d = Math.hypot(dx, dy) || 1;
			if (d > 260) continue;
			const f = (1 - d / 260) * 1400;
			piece.vx += (dx / d) * f;
			piece.vy += (dy / d) * f - 300;
			piece.vrot += (Math.random() - 0.5) * 10;
			piece.state = "flying";
		}
		if (!this.motionOn) return;
		for (const dot of this.dots) {
			const dx = dot.x - x;
			const dy = dot.y - y;
			const d = Math.hypot(dx, dy) || 1;
			if (d > 320) continue;
			const f = (1 - d / 320) * 900;
			dot.vx += (dx / d) * f;
			dot.vy += (dy / d) * f;
		}
		this.burst(x, y, 10, "ring");
	}

	stirDots(x, y, vx, vy, radius, k) {
		for (const dot of this.dots) {
			const d = Math.hypot(dot.x + dot.ox - x, dot.y + dot.oy - y);
			if (d > radius) continue;
			const f = (1 - d / radius) * k;
			dot.vx += vx * f;
			dot.vy += vy * f;
		}
	}

	/* ---------- events from the world ---------- */

	handle(events, quiet = false) {
		const fx = this.fx;
		const sound = name => { if (!quiet) this.synth.play(name); };
		for (const e of events) {
			const piece = this.sim.pieces.find(p => p.id === e.id);
			switch (e.type) {
			case "prompt": fx.robot.squash = 1; fx.robot.glow = 1; sound("blip"); fx.snaps = 0; break;
			case "consult":
				fx.brain.glow = 1;
				for (let i = 0; i < 6; i++) fx.beads.push({ t: -i * 0.09 });
				sound("consult");
				break;
			case "spawn":
				fx.robot.recoil = 1;
				fx.robot.aim = this.sim.rules.rails ? 0.55 : clamp(e.angle, -1.1, 0.6);
				sound(e.onSystem ? "pop" : "wild");
				if (!quiet) this.burst(PLACES.hand.x + 20, PLACES.hand.y, 4, "puff");
				break;
			case "land":
				if (e.speed > 300) { sound("thud"); if (!quiet) this.burst(e.x, e.y, 5, "dust"); }
				break;
			case "stick": sound("splat"); if (piece && !quiet) this.burst(piece.x, piece.y, 6, piece.onSystem ? "star" : "wild"); break;
			case "bounce": sound("boing"); break;
			case "snap":
				fx.snaps++;
				if (!quiet) { this.synth.play("snap", fx.snaps); this.burst(e.x, e.y, 7, e.onSystem ? "star" : "wild"); }
				break;
			case "spec": fx.spec = 1; sound("blip"); break;
			case "pass": fx.gate.light = 1; break;
			case "zap":
				fx.gate.zap = 1;
				if (!quiet) {
					fx.shake = Math.max(fx.shake, 16);
					fx.flash = 0.6;
					const g = Sim.railPoint(PLACES.gateT);
					fx.bolts.push({ from: { x: g.x, y: g.y - 170 }, to: { x: e.x, y: e.y }, at: this.now });
					this.burst(e.x, e.y, 14, "spark");
				}
				sound("zap");
				if (Math.random() < 0.5) this.say("gate", this.line("gate"), 1.8);
				break;
			case "retry": sound("retry"); break;
			case "done": this.announceBuild(); break;
			case "ready":
				this.say("curtain", this.line("curtain") || "Your call.");
				this.announceBuild(" The build is waiting behind the Steel Curtain. Approve the release to ship it.");
				break;
			case "approve":
				fx.stamp = { at: this.now };
				fx.shake = Math.max(fx.shake, 12);
				sound("stamp");
				this.later(0.4, () => this.synth.play("clang"));
				break;
			case "shipped":
				fx.cheer = 1;
				sound("fanfare");
				this.later(0.05, () => this.synth.play("clang"));
				if (!quiet) this.burst(PLACES.booth.x + PLACES.booth.width / 2, PLACES.booth.y + 120, 40, "confetti");
				this.say("robot", "Shipped!", 1.6);
				if (!this.sim.rules.feedback) this.later(2.2, () => this.prompt(this.nextSuggestion()));
				this.announce(`Shipped release ${e.releases}.`);
				break;
			case "feedback":
				fx.feedback = { at: this.now };
				sound("shimmer");
				break;
			case "learn":
				fx.brain.glow = 1;
				fx.brain.wiggle = 1;
				this.say("brain", this.line("brain"));
				this.later(2.4, () => this.prompt(this.nextSuggestion()));
				this.announce(`The system learned from release ${this.sim.releases}. The agent now invents about ${Math.round(e.rate * 100)}% of pieces.`);
				break;
			case "grab": sound("blip"); break;
			case "throw": if (e.speed > 900) sound("whoosh"); break;
			default: break;
			}
		}
	}

	announceBuild(extra = "") {
		const s = Sim.stats(this.sim);
		this.announce(`Build finished: ${s.onSystem} on-system pieces and ${s.hallucinated} hallucinated pieces in the product; validation caught ${s.caught}.${extra}`);
	}

	burst(x, y, n, kind) {
		if (!this.motionOn) return;
		const colors = [this.c.brand, this.c.blue, this.c.mustard, this.c.navy, this.c.orange];
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const speed = kind === "confetti" ? 500 + Math.random() * 900 : kind === "spark" ? 400 + Math.random() * 700 : kind === "ring" ? 0 : 120 + Math.random() * 300;
			this.fx.particles.push({
				kind, x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - (kind === "confetti" ? 600 : 0),
				rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14, life: 0,
				ttl: kind === "confetti" ? 2.2 : kind === "ring" ? 0.5 : 0.6 + Math.random() * 0.3,
				size: kind === "confetti" ? 10 + Math.random() * 8 : 6 + Math.random() * 8,
				color: kind === "wild" ? WILD[i % WILD.length] : colors[i % colors.length],
			});
			if (kind === "ring") break;
		}
	}

	/* ---------- the loop ---------- */

	tick(ms) {
		const t = ms / 1000;
		const dt = Math.min(0.05, Math.max(0, t - this.now));
		this.now = t;
		for (const job of [...this.pending]) {
			if (job.at <= t) { this.pending.splice(this.pending.indexOf(job), 1); job.fn(); }
		}
		this.handle(Sim.step(this.sim, dt));
		this.updateFx(dt);
		this.draw();
		this.updateChrome();
		this.frame = requestAnimationFrame(this.tick);
	}

	updateFx(dt) {
		const fx = this.fx;
		const decay = k => Math.exp(-dt * k);
		const r = fx.robot;
		r.squash *= decay(8); r.recoil *= decay(14); r.talk = Math.max(0, r.talk - dt * 0.6); r.glow *= decay(2.5); r.flutter *= decay(4);
		r.jumpV += 2600 * dt; r.jump += r.jumpV * dt;
		if (r.jump > 0) { r.jump = 0; r.jumpV = r.jumpV > 300 ? -r.jumpV * 0.25 : 0; }
		r.blink = (this.now % 3.7) < 0.12 ? 1 : 0;
		fx.brain.glow *= decay(2); fx.brain.wiggle *= decay(3);
		fx.gate.light *= decay(5); fx.gate.zap *= decay(4); fx.spec *= decay(4);
		fx.shake *= decay(10); fx.flash *= decay(9); fx.cheer *= decay(1.2);
		if (!this.motionOn) { fx.shake = 0; fx.flash = 0; }
		for (const bead of fx.beads) bead.t += dt / 0.85;
		fx.beads = fx.beads.filter(b => b.t < 1);
		fx.bolts = fx.bolts.filter(b => this.now - b.at < 0.28);
		for (const p of fx.particles) {
			p.life += dt;
			p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
			if (p.kind === "confetti" || p.kind === "dust") p.vy += 1400 * dt;
			p.vx *= decay(p.kind === "confetti" ? 1.5 : 4); p.vy *= decay(p.kind === "confetti" ? 0.6 : 3);
		}
		fx.particles = fx.particles.filter(p => p.life < p.ttl);
		for (const [who, b] of fx.bubbles) if (this.now - b.at > b.ttl) fx.bubbles.delete(who);
		if (this.motionOn) {
			for (const d of this.dots) {
				d.vx += -d.ox * 90 * dt; d.vy += -d.oy * 90 * dt;
				d.vx *= decay(5); d.vy *= decay(5);
				d.ox += d.vx * dt; d.oy += d.vy * dt;
			}
			for (const p of this.sim.pieces) {
				if (p.state !== "flying" && p.state !== "riding" && p.state !== "held") continue;
				this.stirDots(p.x, p.y, p.vx || 0, p.vy || 0, 70, 0.006);
			}
			for (const c of this.clouds) { c.x += dt * 14 * c.s; if (c.x > W + 200) c.x = -200; }
		}
	}

	updateChrome() {
		const s = Sim.stats(this.sim);
		const key = `${s.hallucinated}|${s.caught}|${s.onSystem}|${s.releases}|${this.sim.phase}|${this.sim.level}`;
		if (key === this.lastStats) return;
		this.lastStats = key;
		const set = (name, value, meta) => {
			const card = this.statCards?.[name];
			if (!card) return;
			card.textContent = String(value);
			if (meta) card.setAttribute("meta", meta);
		};
		set("hallucinated", s.hallucinated);
		set("caught", s.caught);
		set("onSystem", s.onSystem, this.sim.rules.curtain ? `Real components in this build · ${s.releases} shipped` : "Real components in this build");
		if (this.approveButton) {
			this.approveButton.hidden = !this.sim.rules.curtain;
			if (this.sim.phase === "awaiting") this.approveButton.removeAttribute("disabled");
			else this.approveButton.setAttribute("disabled", "");
		}
		const copy = this.data.levels[this.sim.level];
		this.canvas.setAttribute("aria-label", `Level ${this.sim.level + 1}, ${copy.title}. ${copy.lines.stage} In the product now: ${s.onSystem} on-system and ${s.hallucinated} hallucinated pieces. Caught: ${s.caught}.${this.sim.rules.curtain ? ` Releases shipped: ${s.releases}.` : ""}`);
	}

	updateCaption(level) {
		const copy = this.data.levels[level];
		const text = (selector, value) => { const el = this.querySelector(selector); if (el) el.textContent = value; };
		text("[data-alive-eyebrow]", `Level ${level + 1} of ${LEVELS.length}`);
		text("[data-alive-title]", copy.title);
		text("[data-alive-adds]", copy.adds);
		text("[data-alive-stage]", copy.lines.stage);
		text("[data-alive-result]", copy.resultTitle);
		text("[data-alive-caption]", copy.caption);
		this.levelButtons?.forEach((button, i) => {
			button.setAttribute("aria-pressed", String(i === level));
			button.setAttribute("variant", i === level ? "primary" : "secondary");
		});
	}

	/* ---------- drawing ---------- */

	draw() {
		const ctx = this.ctx;
		const fx = this.fx;
		this.boilFrame = this.motionOn ? Math.floor(this.now * 8) : 0;
		ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
		ctx.save();
		if (fx.shake > 0.5) ctx.translate((Math.random() - 0.5) * fx.shake, (Math.random() - 0.5) * fx.shake);
		this.drawBackground(ctx);
		if (this.has("feedback")) this.drawFeedback(ctx);
		if (this.has("brain")) this.drawCable(ctx);
		if (this.has("gate")) this.drawRetry(ctx);
		if (this.has("rails")) this.drawRails(ctx);
		if (this.has("gate")) this.drawGate(ctx, "back");
		this.drawWindow(ctx);
		if (this.has("curtain")) this.drawBooth(ctx);
		if (this.has("brain")) this.drawBrain(ctx);
		this.drawRobot(ctx);
		if (this.has("rules")) this.drawRules(ctx);
		if (this.has("spec")) this.drawSpec(ctx);
		const order = ["resting", "stuck", "placed", "snapping", "riding", "retry", "flying", "shipping", "swept", "held"];
		const pieces = [...this.sim.pieces].sort((a, b) => order.indexOf(a.state) - order.indexOf(b.state));
		for (const piece of pieces) this.drawPiece(ctx, piece);
		if (this.has("gate")) this.drawGate(ctx, "front");
		this.drawStamp(ctx);
		this.drawBolts(ctx);
		this.drawParticles(ctx);
		this.drawSlash(ctx);
		this.drawBubbles(ctx);
		ctx.restore();
		this.drawTitle(ctx);
		if (fx.flash > 0.02) {
			ctx.globalAlpha = fx.flash * 0.35;
			ctx.fillStyle = this.c.surface;
			ctx.fillRect(0, 0, W, H);
			ctx.globalAlpha = 1;
		}
	}

	has(feature) { return Boolean(this.sim.rules[feature] && this.fx.appear[feature] && this.now >= this.fx.appear[feature].at - 0.001); }

	/** 0→1 build-in progress for a feature that just arrived (elastic). */
	grow(feature, duration = 0.8) {
		const a = this.fx.appear[feature];
		if (!a || !this.motionOn || !a.isNew) return 1;
		return Sim.easeOutElastic(clamp((this.now - a.at) / duration));
	}

	jit(seed, amp = 1.8) {
		if (!this.motionOn) return 0;
		return (hash(seed * 13.37 + this.boilFrame * 7.1) - 0.5) * 2 * amp;
	}

	ink(ctx, width = 6, color = this.c.ink) {
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
	}

	rr(ctx, x, y, w, h, r, seed = 0) {
		const j = seed ? this.jit(seed) : 0;
		ctx.beginPath();
		ctx.roundRect(x + j, y - j * 0.6, w - j * 0.5, h + j * 0.4, Math.max(0, Math.min(r, w / 2, h / 2)));
	}

	text(ctx, value, x, y, { size = 28, font = this.fonts.body, color = this.c.ink, align = "center", base = "middle", max = 0, weight = "" } = {}) {
		ctx.font = `${weight} ${size}px ${font}`;
		if (max) {
			const w = ctx.measureText(value).width;
			if (w > max) ctx.font = `${weight} ${size * (max / w)}px ${font}`;
		}
		ctx.fillStyle = color;
		ctx.textAlign = align;
		ctx.textBaseline = base;
		ctx.fillText(value, x, y);
	}

	drawBackground(ctx) {
		const c = this.c;
		ctx.fillStyle = c.bg;
		ctx.fillRect(0, 0, W, H);
		for (const cloud of this.clouds) this.drawCloud(ctx, cloud);
		ctx.strokeStyle = c.ink;
		ctx.globalAlpha = 0.13;
		ctx.lineCap = "round";
		ctx.lineWidth = 7;
		ctx.beginPath();
		for (const d of this.dots) {
			ctx.moveTo(d.x, d.y);
			ctx.lineTo(d.x + d.ox + 0.01, d.y + d.oy);
		}
		ctx.stroke();
		ctx.globalAlpha = 1;
		ctx.fillStyle = c.cream4;
		ctx.fillRect(0, STAGE.floor, W, H - STAGE.floor);
		ctx.strokeStyle = c.cream8;
		ctx.lineWidth = 4;
		ctx.globalAlpha = 0.5;
		ctx.beginPath();
		for (let x = 10; x < W; x += 46) { ctx.moveTo(x, STAGE.floor + 18); ctx.lineTo(x - 18, STAGE.floor + 44); }
		ctx.stroke();
		ctx.globalAlpha = 1;
		this.ink(ctx, 7);
		ctx.beginPath();
		ctx.moveTo(0, STAGE.floor + this.jit(1, 1));
		ctx.lineTo(W, STAGE.floor + this.jit(2, 1));
		ctx.stroke();
	}

	drawCloud(ctx, cloud) {
		ctx.save();
		ctx.translate(cloud.x, cloud.y);
		ctx.scale(cloud.s, cloud.s);
		const lobes = [[-70, 10, 42], [-20, -18, 56], [40, -4, 46], [85, 14, 32], [0, 18, 40]];
		this.ink(ctx, 12);
		for (const [x, y, r] of lobes) { ctx.beginPath(); ctx.arc(x, y + this.jit(x, 1), r, 0, Math.PI * 2); ctx.stroke(); }
		ctx.fillStyle = this.c.surface;
		for (const [x, y, r] of lobes) { ctx.beginPath(); ctx.arc(x, y + this.jit(x, 1), r, 0, Math.PI * 2); ctx.fill(); }
		ctx.restore();
	}

	path(ctx, fn, from = 0, to = 1, steps = 60) {
		ctx.beginPath();
		for (let i = 0; i <= steps; i++) {
			const p = fn(lerp(from, to, i / steps));
			if (i === 0) ctx.moveTo(p.x, p.y);
			else ctx.lineTo(p.x, p.y);
		}
	}

	sign(ctx, label, x, y, { rot = -0.04, color = this.c.surface, ink = this.c.ink, size = 30, grow = 1 } = {}) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(rot + this.jit(x, 0.008));
		ctx.scale(grow, grow);
		ctx.font = `${size}px ${this.fonts.display}`;
		const w = ctx.measureText(label).width + 28;
		this.rr(ctx, -w / 2, -size * 0.75, w, size * 1.5, 8, x + 3);
		ctx.fillStyle = color;
		ctx.fill();
		this.ink(ctx, 4, ink);
		ctx.stroke();
		this.text(ctx, label, 0, 2, { size, font: this.fonts.display, color: ink });
		ctx.restore();
	}

	drawRobot(ctx) {
		const r = this.fx.robot;
		const c = this.c;
		const t = this.now;
		const bob = this.motionOn ? Math.sin(t * 2.2) * 5 : 0;
		const sx = 1 + 0.07 * r.squash;
		const sy = 1 - 0.09 * r.squash;
		ctx.save();
		ctx.translate(300, STAGE.floor);
		ctx.scale(sx, sy);
		ctx.translate(-300, -STAGE.floor + r.jump);

		// legs and feet
		ctx.fillStyle = c.ink;
		for (const x of [250, 350]) {
			ctx.fillRect(x - 14, 780, 28, 175);
			this.rr(ctx, x - 44, 945, 88, 36, 16, x);
			ctx.fill();
		}
		// body
		this.rr(ctx, 190, 555 + bob, 220, 240, 34, 11);
		ctx.fill();
		this.rr(ctx, 235, 600 + bob, 130, 92, 14, 12);
		ctx.fillStyle = c.surface;
		ctx.fill();
		this.text(ctx, `L${this.sim.level + 1}`, 300, 648 + bob, { size: 64, font: this.fonts.display, color: c.brand });
		ctx.fillStyle = c.brand;
		ctx.beginPath();
		ctx.arc(300, 740 + bob, 14 + 6 * r.glow, 0, Math.PI * 2);
		ctx.fill();

		// arms
		const aim = r.aim;
		const recoil = r.recoil * 16;
		ctx.save();
		ctx.translate(395, 615 + bob);
		ctx.rotate(aim);
		ctx.fillStyle = c.ink;
		this.rr(ctx, -10 - recoil, -17, 112, 34, 17, 21);
		ctx.fill();
		this.rr(ctx, 86 - recoil, -27, 40, 54, 10, 22);
		ctx.fill();
		ctx.fillStyle = c.brand;
		this.rr(ctx, 114 - recoil, -17, 12, 34, 4, 23);
		ctx.fill();
		ctx.restore();
		ctx.save();
		ctx.translate(205, 615 + bob);
		const wave = this.sim.rules.rules ? 0.95 + Math.sin(t * 3) * 0.05 + r.flutter * 0.3 : 1.25 + Math.sin(t * 2.4) * 0.15;
		ctx.rotate(wave + Math.PI / 2);
		ctx.fillStyle = c.ink;
		this.rr(ctx, -10, -17, 112, 34, 17, 24);
		ctx.fill();
		ctx.restore();

		// head, after the course robot's proportions (images/course-robot.svg)
		const s = 2.8;
		const hx = 300;
		const hy = 360 + bob * 1.4;
		const at = (u, v) => [hx + (u - 48) * s, hy + (v - 28.5) * s];
		ctx.fillStyle = c.ink;
		const [ax, ay] = at(46.05, 6.06);
		ctx.fillRect(ax, ay, 3.9 * s, 15.5 * s);
		ctx.beginPath();
		const [bx, by] = at(48, 5.77);
		if (r.glow > 0.05 || this.sim.phase === "generating" || this.sim.phase === "consulting") {
			ctx.save();
			ctx.globalAlpha = 0.35 + 0.3 * Math.sin(t * 20);
			ctx.fillStyle = c.mustard;
			ctx.beginPath();
			ctx.arc(bx, by, 36, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
			ctx.fillStyle = c.brand;
		}
		ctx.beginPath();
		ctx.arc(bx, by, 5.76 * s + this.jit(31, 0.8), 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = c.ink;
		const [hx0, hy0] = at(0, 28.55);
		this.rr(ctx, hx0, hy0, 96 * s, 67.45 * s, 2 * s, 33);
		ctx.fill();
		const [fx0, fy0] = at(28.49, 20.87);
		this.rr(ctx, fx0, fy0, 39 * s, 67.2 * s, 16 * s, 34);
		ctx.fill();
		const look = this.pointer.inside ? this.pointer : { x: 1300, y: 500 };
		for (const u of [28.49, 66.93]) {
			const [ex, ey] = at(u, 54.65);
			ctx.save();
			ctx.translate(ex, ey);
			ctx.scale(1, r.blink ? 0.12 : 1);
			ctx.fillStyle = c.surface;
			ctx.beginPath();
			ctx.arc(0, 0, 17 * s + this.jit(u, 1), 0, Math.PI * 2);
			ctx.fill();
			const a = Math.atan2(look.y - ey, look.x - ex);
			const d = Math.min(18, Math.hypot(look.x - ex, look.y - ey) / 20);
			ctx.fillStyle = this.sim.level === 0 ? c.brand : c.orange;
			ctx.beginPath();
			ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 9.1 * s * (this.sim.level === 0 ? 0.8 + 0.15 * Math.sin(t * 9) : 1), 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		const [mx, my] = at(29.85, 79.58);
		const talk = r.talk > 0 ? Math.abs(Math.sin(t * 22)) * 14 * Math.min(1, r.talk * 3) : 0;
		ctx.fillStyle = c.surface;
		this.rr(ctx, mx, my - talk / 2, 36.4 * s, 5.3 * s + talk, 2.6 * s, 35);
		ctx.fill();
		ctx.restore();
	}

	drawRules(ctx) {
		const k = this.grow("rules");
		const r = this.fx.robot;
		ctx.save();
		ctx.translate(135, 750 - (1 - k) * 500);
		ctx.rotate(-0.16 + Math.sin(this.now * 9) * 0.06 * r.flutter + this.jit(41, 0.01));
		ctx.scale(k, k);
		this.rr(ctx, -80, -105, 160, 200, 10, 42);
		ctx.fillStyle = this.c.surface;
		ctx.fill();
		this.ink(ctx, 6);
		ctx.stroke();
		this.rr(ctx, -80, -105, 160, 48, 10, 0);
		ctx.fillStyle = this.c.brand;
		ctx.fill();
		this.ink(ctx, 6);
		ctx.stroke();
		this.text(ctx, "AGENTS.md", 0, -80, { size: 32, font: this.fonts.display, color: this.c.onDark, max: 140 });
		this.ink(ctx, 6, this.c.ink);
		ctx.globalAlpha = 0.45;
		for (let i = 0; i < 5; i++) {
			ctx.beginPath();
			ctx.moveTo(-58, -30 + i * 26);
			ctx.lineTo(40 - (i % 2) * 34, -30 + i * 26);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
		ctx.restore();
		this.slashOn("rules", 50, 620, 170, 260);
	}

	drawCable(ctx) {
		const k = clamp(this.grow("brain", 1.1));
		const sway = this.motionOn ? Math.sin(this.now * 1.7) * 14 : 0;
		const pts = Sim.CABLE.map((p, i) => (i === 1 || i === 2 ? { x: p.x + sway, y: p.y - sway * 0.5 } : p));
		const point = t => {
			const u = 1 - t;
			return {
				x: u ** 3 * pts[0].x + 3 * u * u * t * pts[1].x + 3 * u * t * t * pts[2].x + t ** 3 * pts[3].x,
				y: u ** 3 * pts[0].y + 3 * u * u * t * pts[1].y + 3 * u * t * t * pts[2].y + t ** 3 * pts[3].y,
			};
		};
		this.path(ctx, point, 0, k);
		this.ink(ctx, 16);
		ctx.stroke();
		this.ink(ctx, 7, this.c.navy);
		ctx.stroke();
		for (const bead of this.fx.beads) {
			if (bead.t < 0) continue;
			const p = point(bead.t);
			ctx.beginPath();
			ctx.arc(p.x, p.y, 13, 0, Math.PI * 2);
			ctx.fillStyle = this.c.mustard;
			ctx.fill();
			this.ink(ctx, 4);
			ctx.stroke();
		}
	}

	drawBrain(ctx) {
		const b = this.fx.brain;
		const k = this.grow("brain", 1);
		const a = this.fx.appear.brain;
		const drop = a?.isNew && this.motionOn ? (1 - clamp((this.now - a.at) / 0.5)) * -420 : 0;
		const grow = 1 + Math.min(0.3, this.sim.learned * 0.07);
		const { x, y } = PLACES.brain;
		ctx.save();
		ctx.translate(x, y + drop + (this.motionOn ? Math.sin(this.now * 1.6) * 6 : 0));
		ctx.rotate(Math.sin(this.now * 14) * 0.08 * b.wiggle);
		ctx.scale(grow * (0.6 + 0.4 * k), grow * (0.6 + 0.4 * k));
		if (b.glow > 0.03) {
			ctx.globalAlpha = b.glow * 0.45;
			ctx.fillStyle = this.c.mustard;
			ctx.beginPath();
			ctx.arc(0, 0, 150, 0, Math.PI * 2);
			ctx.fill();
			ctx.globalAlpha = 1;
		}
		const lobes = [[-62, -6, 50], [-24, -44, 54], [34, -42, 52], [70, 0, 46], [36, 36, 48], [-24, 36, 50], [0, 0, 56]];
		this.ink(ctx, 14);
		for (const [lx, ly, r] of lobes) { ctx.beginPath(); ctx.arc(lx, ly, r + this.jit(lx + ly, 1.2), 0, Math.PI * 2); ctx.stroke(); }
		ctx.fillStyle = this.c.blue;
		for (const [lx, ly, r] of lobes) { ctx.beginPath(); ctx.arc(lx, ly, r + this.jit(lx + ly, 1.2), 0, Math.PI * 2); ctx.fill(); }
		this.ink(ctx, 5, this.c.navy);
		for (const [lx, ly, r] of lobes.slice(0, 6)) { ctx.beginPath(); ctx.arc(lx, ly, r * 0.55, 0.4, 2.2); ctx.stroke(); }
		ctx.fillStyle = this.c.surface;
		for (const ex of [-24, 24]) { ctx.beginPath(); ctx.arc(ex, 6, 15, 0, Math.PI * 2); ctx.fill(); }
		ctx.fillStyle = this.c.ink;
		for (const ex of [-24, 24]) { ctx.beginPath(); ctx.arc(ex + 4, 8, 7, 0, Math.PI * 2); ctx.fill(); }
		this.ink(ctx, 5);
		ctx.beginPath();
		ctx.arc(0, 26, 14, 0.2, Math.PI - 0.2);
		ctx.stroke();
		ctx.restore();
		this.sign(ctx, "eddie-brain", x + 150, y + 92, { rot: 0.05, grow: k, size: 30 });
		this.slashOn("brain", x - 130, y - 120, 260, 240);
	}

	drawRails(ctx) {
		const a = this.fx.appear.rails;
		const k = a?.isNew && this.motionOn ? clamp((this.now - a.at) / 1.1) : 1;
		const samples = [];
		let length = 0;
		let prev = Sim.railPoint(0);
		for (let i = 0; i <= 120; i++) {
			const t = i / 120;
			const p = Sim.railPoint(t);
			length += Math.hypot(p.x - prev.x, p.y - prev.y);
			samples.push({ ...p, t, length });
			prev = p;
		}
		const total = length * k;
		ctx.strokeStyle = this.c.cream8;
		ctx.lineWidth = 12;
		ctx.lineCap = "round";
		for (let d = 18; d < total; d += 34) {
			const i = samples.findIndex(s => s.length >= d);
			const p = samples[i];
			const q = samples[Math.min(samples.length - 1, i + 1)];
			const ang = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI / 2;
			const pop = Math.min(1, (total - d) / 60);
			ctx.beginPath();
			ctx.moveTo(p.x - Math.cos(ang) * 30 * pop, p.y - Math.sin(ang) * 30 * pop);
			ctx.lineTo(p.x + Math.cos(ang) * 30 * pop, p.y + Math.sin(ang) * 30 * pop);
			ctx.stroke();
		}
		for (const side of [-1, 1]) {
			ctx.beginPath();
			let started = false;
			for (let i = 0; i < samples.length - 1; i++) {
				if (samples[i].length > total) break;
				const p = samples[i];
				const q = samples[i + 1];
				const ang = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI / 2;
				const x = p.x + Math.cos(ang) * 18 * side + this.jit(i * side, 0.7);
				const y = p.y + Math.sin(ang) * 18 * side;
				if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
			}
			this.ink(ctx, 8);
			ctx.stroke();
		}
		if (k > 0.98) this.sign(ctx, "Recipes + templates", 1035, 478, { rot: -0.05, size: 26, color: this.c.mustard, grow: this.grow("rails") });
		this.slashOn("rails", 520, 420, 620, 420);
	}

	drawRetry(ctx) {
		const g = Sim.railPoint(PLACES.gateT);
		const k = this.grow("gate");
		this.path(ctx, t => Sim.retryPoint(t, g), 0, clamp(k));
		ctx.setLineDash([22, 18]);
		ctx.lineDashOffset = this.motionOn ? this.now * 60 : 0;
		this.ink(ctx, 8, this.c.navy);
		ctx.stroke();
		ctx.setLineDash([]);
		const end = Sim.retryPoint(1, g);
		const before = Sim.retryPoint(0.96, g);
		const ang = Math.atan2(end.y - before.y, end.x - before.x);
		ctx.save();
		ctx.translate(end.x, end.y);
		ctx.rotate(ang);
		ctx.fillStyle = this.c.navy;
		ctx.beginPath();
		ctx.moveTo(10, 0);
		ctx.lineTo(-22, -16);
		ctx.lineTo(-22, 16);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
		this.sign(ctx, "Retry loop", 690, 935, { rot: 0.02, color: this.c.blue, grow: k, size: 28 });
	}

	drawGate(ctx, layer) {
		const g = Sim.railPoint(PLACES.gateT);
		const a = this.fx.appear.gate;
		const k = a?.isNew && this.motionOn ? Sim.easeOutElastic(clamp((this.now - a.at) / 0.9)) : 1;
		const lift = (1 - k) * 420;
		const fx = this.fx.gate;
		ctx.save();
		ctx.translate(0, lift);
		if (layer === "back") {
			ctx.globalAlpha = 0.16 + fx.zap * 0.5;
			ctx.fillStyle = fx.zap > 0.1 ? this.c.mustard : this.c.blue;
			ctx.fillRect(g.x - 60, g.y - 170, 120, 220);
			ctx.globalAlpha = 1;
			const scan = g.y - 170 + ((this.motionOn ? this.now * 160 : 60) % 220);
			this.ink(ctx, 4, this.c.blue);
			ctx.beginPath();
			ctx.moveTo(g.x - 58, scan);
			ctx.lineTo(g.x + 58, scan);
			ctx.stroke();
			ctx.fillStyle = this.c.ink;
			ctx.fillRect(g.x + 44, g.y - 175, 26, 240);
		} else {
			ctx.fillStyle = this.c.ink;
			ctx.fillRect(g.x - 70, g.y - 175, 26, 240);
			this.rr(ctx, g.x - 100, g.y - 228, 200, 62, 12, 51);
			ctx.fillStyle = this.c.navy;
			ctx.fill();
			this.ink(ctx, 6);
			ctx.stroke();
			this.text(ctx, this.sim.rules.spec ? "VALIDATE + CI" : "VALIDATE", g.x, g.y - 196, { size: 38, font: this.fonts.display, color: this.c.onDark, max: 180 });
			ctx.fillStyle = fx.zap > 0.1 ? this.c.brand : fx.light > 0.1 ? this.c.blue : this.c.mustard;
			ctx.beginPath();
			ctx.arc(g.x, g.y - 244, 13 + fx.zap * 10 + fx.light * 5, 0, Math.PI * 2);
			ctx.fill();
			this.ink(ctx, 5);
			ctx.stroke();
		}
		ctx.restore();
		if (layer === "front") this.slashOn("gate", g.x - 110, g.y - 260, 220, 330);
	}

	drawSpec(ctx) {
		const p = Sim.railPoint(PLACES.specT);
		const k = this.grow("spec");
		ctx.save();
		ctx.translate(p.x - 6, p.y - 150);
		ctx.rotate(0.06 + this.jit(61, 0.01));
		ctx.scale(k * (1 + this.fx.spec * 0.12), k * (1 + this.fx.spec * 0.12));
		this.ink(ctx, 8);
		ctx.beginPath();
		ctx.moveTo(0, 60);
		ctx.lineTo(0, 120);
		ctx.stroke();
		this.rr(ctx, -55, -70, 110, 140, 10, 62);
		ctx.fillStyle = this.c.navy;
		ctx.fill();
		ctx.stroke();
		this.rr(ctx, -44, -52, 88, 112, 4, 63);
		ctx.fillStyle = this.c.surface;
		ctx.fill();
		this.rr(ctx, -22, -82, 44, 24, 6, 64);
		ctx.fillStyle = this.c.mustard;
		ctx.fill();
		this.ink(ctx, 5);
		ctx.stroke();
		this.text(ctx, "SPEC", 0, -26, { size: 30, font: this.fonts.display });
		this.ink(ctx, 9, this.c.brand);
		ctx.beginPath();
		ctx.moveTo(-22, 16);
		ctx.lineTo(-6, 34);
		ctx.lineTo(26, -2);
		ctx.stroke();
		ctx.restore();
		this.slashOn("spec", p.x - 70, p.y - 240, 140, 200);
	}

	drawWindow(ctx) {
		const w = PLACES.window;
		const c = this.c;
		const box = Sim.contentBox();
		ctx.fillStyle = c.ink;
		this.rr(ctx, w.x + 14, w.y + 14, w.width, w.height, 18, 71);
		ctx.fill();
		this.rr(ctx, w.x, w.y, w.width, w.height, 18, 72);
		ctx.fillStyle = c.surface;
		ctx.fill();
		this.ink(ctx, 7);
		ctx.stroke();
		ctx.save();
		this.rr(ctx, w.x, w.y, w.width, w.bar, 18, 0);
		ctx.fillStyle = c.cream4;
		ctx.fill();
		ctx.restore();
		this.ink(ctx, 6);
		ctx.beginPath();
		ctx.moveTo(w.x, w.y + w.bar);
		ctx.lineTo(w.x + w.width, w.y + w.bar);
		ctx.stroke();
		[c.brand, c.mustard, c.blue].forEach((color, i) => {
			ctx.beginPath();
			ctx.arc(w.x + 30 + i * 30, w.y + w.bar / 2, 9, 0, Math.PI * 2);
			ctx.fillStyle = color;
			ctx.fill();
			this.ink(ctx, 3);
			ctx.stroke();
		});
		this.rr(ctx, w.x + 130, w.y + 10, w.width - 160, w.bar - 20, 14, 0);
		ctx.fillStyle = c.surface;
		ctx.fill();
		this.text(ctx, this.sim.rules.curtain ? "staging.example.com" : "localhost:8080", w.x + 150, w.y + w.bar / 2 + 1, { size: 18, align: "left", color: c.ink });
		if (this.sim.rules.rails) {
			const slots = Sim.TEMPLATES[this.sim.template].slots;
			ctx.setLineDash([10, 8]);
			slots.forEach((slot, i) => {
				if (this.sim.filled.has(i)) return;
				const r = Sim.slotRect(this.sim.template, i);
				this.rr(ctx, r.x - r.width / 2, r.y - r.height / 2, r.width, r.height, 8, 0);
				this.ink(ctx, 3);
				ctx.globalAlpha = 0.35;
				ctx.stroke();
				ctx.globalAlpha = 0.45;
				this.text(ctx, slot[0], r.x, r.y, { size: 18, color: c.ink });
				ctx.globalAlpha = 1;
			});
			ctx.setLineDash([]);
		}
		if (!this.sim.pieces.some(p => p.state === "stuck" || p.state === "placed" || p.state === "snapping") && this.sim.phase === "idle") {
			ctx.globalAlpha = 0.4;
			this.text(ctx, "Your product goes here", box.x + box.width / 2, box.y + box.height / 2, { size: 40, font: this.fonts.display });
			ctx.globalAlpha = 1;
		}
		this.sign(ctx, "Your product", w.x + w.width / 2, w.y - 32, { rot: 0.02, size: 30 });
	}

	drawBooth(ctx) {
		const b = PLACES.booth;
		const c = this.c;
		const k = this.grow("curtain");
		const sim = this.sim;
		ctx.save();
		ctx.translate(b.x + b.width / 2, STAGE.floor);
		ctx.scale(1, k);
		ctx.translate(-(b.x + b.width / 2), -STAGE.floor);
		this.rr(ctx, b.x, b.y, b.width, b.height, 14, 81);
		ctx.fillStyle = c.navy;
		ctx.fill();
		this.ink(ctx, 7);
		ctx.stroke();
		for (let i = 0; i < Math.min(sim.releases, 6); i++) {
			const x = b.x + 22 + (i % 3) * 48;
			const y = b.y + 26 + Math.floor(i / 3) * 44;
			this.rr(ctx, x, y, 38, 32, 5, 0);
			ctx.fillStyle = c.surface;
			ctx.fill();
			this.ink(ctx, 3);
			ctx.stroke();
			ctx.fillStyle = c.brand;
			ctx.fillRect(x + 4, y + 4, 30, 6);
		}
		const cheer = this.fx.cheer;
		[c.mustard, c.blue, c.surface].forEach((color, i) => {
			const px = b.x + 40 + i * 50;
			const jump = cheer > 0.05 ? Math.abs(Math.sin(this.now * 12 + i * 1.3)) * 40 * cheer : 0;
			const py = b.y + b.height - 70 - jump;
			ctx.fillStyle = color;
			this.rr(ctx, px - 18, py, 36, 60, 14, 0);
			ctx.fill();
			this.ink(ctx, 4);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(px, py - 18, 17, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		});
		const phase = sim.phase;
		const t = sim.phaseT;
		let open = 0;
		if (phase === "shipping") open = t < 0.4 ? 0 : t < 0.75 ? Sim.easeInOut((t - 0.4) / 0.35) : t < 1.4 ? 1 : 1 - clamp((t - 1.4) / 0.25);
		const top = b.y + 52;
		const fullHeight = b.height - 52;
		const height = fullHeight * (1 - open);
		ctx.save();
		ctx.beginPath();
		ctx.rect(b.x - 8, top - 4, b.width + 16, height + 8);
		ctx.clip();
		this.rr(ctx, b.x - 6, top, b.width + 12, fullHeight, 6, 82);
		ctx.fillStyle = c.cream8;
		ctx.fill();
		ctx.strokeStyle = c.ink;
		ctx.globalAlpha = 0.35;
		ctx.lineWidth = 4;
		const shift = fullHeight - height;
		for (let y = top + 18 - (shift % 22); y < top + height; y += 22) {
			ctx.beginPath();
			ctx.moveTo(b.x + 4, y);
			ctx.lineTo(b.x + b.width - 4, y);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
		this.text(ctx, "STEEL", b.x + b.width / 2, top + height - fullHeight / 2 - 34, { size: 54, font: this.fonts.display, color: c.surface });
		this.text(ctx, "CURTAIN", b.x + b.width / 2, top + height - fullHeight / 2 + 22, { size: 54, font: this.fonts.display, color: c.surface, max: b.width - 24 });
		ctx.restore();
		this.ink(ctx, 7);
		ctx.beginPath();
		ctx.moveTo(b.x - 6, top + height);
		ctx.lineTo(b.x + b.width + 6, top + height);
		ctx.stroke();
		ctx.restore();
		this.sign(ctx, "Production", b.x + b.width / 2, b.y - 34, { rot: 0.03, size: 32, grow: k });

		const awaiting = phase === "awaiting";
		const bx = b.x + b.width / 2;
		const by = STAGE.floor + 46;
		const pulse = awaiting && this.motionOn ? 1 + Math.sin(this.now * 7) * 0.06 : 1;
		ctx.save();
		ctx.translate(bx, by);
		ctx.scale(pulse * k, pulse * k);
		this.rr(ctx, -92, -30, 184, 60, 30, 83);
		ctx.fillStyle = awaiting ? c.brand : c.cream5;
		ctx.fill();
		this.ink(ctx, 6);
		ctx.stroke();
		this.text(ctx, awaiting ? "APPROVE?" : "APPROVAL", 0, 2, { size: 36, font: this.fonts.display, color: awaiting ? c.onDark : c.ink });
		ctx.restore();
		this.slashOn("curtain", b.x - 20, b.y - 70, b.width + 40, b.height + 160);
	}

	drawFeedback(ctx) {
		const k = this.grow("feedback");
		this.path(ctx, Sim.feedbackPoint, 0, clamp(k));
		ctx.setLineDash([24, 18]);
		ctx.lineDashOffset = this.motionOn ? -this.now * 50 : 0;
		this.ink(ctx, 8, this.c.mustard);
		ctx.stroke();
		ctx.setLineDash([]);
		const f = this.fx.feedback;
		if (f) {
			const labels = ["usage", "adoption", "gaps"];
			for (let i = 0; i < 9; i++) {
				const t = (this.now - f.at) / 1.6 - i * 0.07;
				if (t < 0 || t > 1) continue;
				const p = Sim.feedbackPoint(Sim.easeInOut(t));
				ctx.beginPath();
				ctx.arc(p.x, p.y, 12 + (i % 3) * 3, 0, Math.PI * 2);
				ctx.fillStyle = [this.c.mustard, this.c.blue, this.c.brand][i % 3];
				ctx.fill();
				this.ink(ctx, 4);
				ctx.stroke();
				if (i < 3) this.text(ctx, labels[i], p.x, p.y + 32, { size: 22, weight: "600" });
			}
		}
		this.sign(ctx, "Feedback loop", 1330, 64, { rot: -0.02, color: this.c.mustard, grow: k });
		this.slashOn("feedback", 900, 0, 960, 140);
	}

	drawPiece(ctx, p) {
		const c = this.c;
		ctx.save();
		ctx.globalAlpha = clamp(p.alpha);
		const born = this.now - (p.drawBorn ??= this.now);
		const popIn = this.motionOn ? Sim.easeOutBack(clamp(born / 0.18)) : 1;
		ctx.translate(p.x, p.y);
		if (p.state === "held") {
			ctx.save();
			ctx.globalAlpha = 0.18;
			ctx.fillStyle = c.ink;
			ctx.beginPath();
			ctx.roundRect(-p.width / 2 + 16, -p.height / 2 + 22, p.width, p.height, 10);
			ctx.fill();
			ctx.restore();
		}
		ctx.rotate(p.rot);
		const sq = p.squash;
		ctx.scale((1 + 0.2 * sq) * p.scale * popIn * (p.state === "held" ? 1.08 : 1), (1 - 0.2 * sq) * p.scale * popIn * (p.state === "held" ? 1.08 : 1));
		const look = p.look;
		const w = p.width;
		const h = p.height;
		if (look !== "system") ctx.transform(1, 0, (p.warp - 0.5) * (look === "wild" ? 0.6 : 0.25), 1, 0, 0);
		const wi = Math.floor(p.warp * 97) % WILD.length;
		const wild = look === "wild" ? WILD : this.tinted;
		const fill = look === "system" ? null : wild[wi];
		const fill2 = look === "system" ? null : wild[(wi + 2) % wild.length];
		const radius = look === "system" ? 10 : p.warp < 0.4 ? 0 : p.warp < 0.7 ? h / 2 : 26;
		const font = look === "wild" ? WILD_FONT : this.fonts.display;
		const kindIndex = p.slot === null ? 0 : Sim.TEMPLATES[this.sim.template].slots.slice(0, p.slot).filter(s => s[0] === p.kind).length;
		const words = kind => {
			if (look === "system") return (COPY.system[this.sim.template]?.[kind] || [""])[kindIndex] ?? "";
			const list = COPY[look][kind] || [""];
			return list[(kindIndex + Math.floor(p.warp * 7)) % list.length];
		};
		const outline = (width = 4) => {
			if (look === "wild") { ctx.setLineDash([8, 6]); this.ink(ctx, width, wild[(wi + 4) % wild.length]); ctx.stroke(); ctx.setLineDash([]); return; }
			this.ink(ctx, width);
			ctx.stroke();
		};
		const gradient = () => {
			const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
			g.addColorStop(0, fill);
			g.addColorStop(1, fill2);
			return g;
		};
		const box = (bg, r = radius) => { this.rr(ctx, -w / 2, -h / 2, w, h, r, p.id); ctx.fillStyle = bg; ctx.fill(); outline(); };
		const lines = (n, x0, y0, width, gap, alpha = 0.35) => {
			ctx.globalAlpha *= alpha;
			this.ink(ctx, Math.max(4, gap * 0.4), look === "system" ? c.ink : fill2);
			for (let i = 0; i < n; i++) {
				ctx.beginPath();
				const wave = look === "wild" ? Math.sin(i * 2 + p.warp * 9) * 8 : 0;
				ctx.moveTo(x0, y0 + i * gap + wave);
				ctx.lineTo(x0 + width * (i === n - 1 ? 0.6 : 1), y0 + i * gap - wave);
				ctx.stroke();
			}
			ctx.globalAlpha /= alpha;
		};
		switch (p.kind) {
		case "nav":
			box(look === "system" ? c.ink : gradient(), look === "system" ? 8 : radius);
			ctx.fillStyle = look === "system" ? c.brand : fill2;
			ctx.beginPath(); ctx.arc(-w / 2 + h * 0.55, 0, h * 0.24, 0, Math.PI * 2); ctx.fill();
			for (let i = 0; i < 3; i++) { ctx.fillStyle = look === "system" ? c.surface : c.ink; this.rr(ctx, w / 2 - (i + 1) * 70, -5, 50, 10, 5, 0); ctx.fill(); }
			break;
		case "heading":
			if (look !== "system") box(gradient());
			this.text(ctx, words("heading"), look === "system" ? -w / 2 : 0, 2, { size: h * 0.9, font, color: look === "system" ? c.ink : c.ink, align: look === "system" ? (this.sim.template === "pricing" ? "center" : "left") : "center", max: w - 10 });
			if (look === "system" && this.sim.template === "pricing") { /* centred heading */ }
			break;
		case "text":
			if (look !== "system") box(fill);
			lines(2, -w / 2 + 6, -h / 4, w - 12, h / 2.2);
			break;
		case "field":
			if (look === "system") {
				this.text(ctx, words("field"), -w / 2, -h / 2 + h * 0.18, { size: h * 0.26, font: this.fonts.body, align: "left", weight: "600" });
				this.rr(ctx, -w / 2, -h / 2 + h * 0.38, w, h * 0.6, 6, p.id);
				ctx.fillStyle = c.surface; ctx.fill(); outline(3);
			} else {
				box(gradient());
				this.text(ctx, words("field"), 0, 0, { size: h * 0.34, font: look === "wild" ? WILD_FONT : this.fonts.body, color: c.ink, max: w - 20 });
			}
			break;
		case "button":
			box(look === "system" ? c.brand : gradient(), look === "system" ? h / 2 : radius);
			this.text(ctx, words("button"), 0, 2, { size: h * 0.62, font, color: look === "system" ? c.onDark : c.ink, max: w - 24 });
			break;
		case "image":
			box(look === "system" ? c.blue : gradient());
			ctx.save();
			ctx.clip();
			if (look === "system") {
				ctx.fillStyle = c.mustard; ctx.beginPath(); ctx.arc(w * 0.18, -h * 0.22, h * 0.12, 0, Math.PI * 2); ctx.fill();
				ctx.fillStyle = c.navy; ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(-w * 0.1, -h * 0.05); ctx.lineTo(w * 0.15, h * 0.2); ctx.lineTo(w * 0.32, h * 0.02); ctx.lineTo(w / 2, h / 2); ctx.fill();
			} else {
				this.star(ctx, 0, 0, Math.min(w, h) * 0.38, Math.min(w, h) * 0.16, 5 + Math.floor(p.warp * 4));
				ctx.fillStyle = fill2; ctx.fill(); outline(3);
			}
			ctx.restore();
			break;
		case "price":
			box(look === "system" ? c.surface : gradient());
			this.text(ctx, words("price"), 0, -h * 0.2, { size: h * 0.22, font, color: c.ink, max: w - 20 });
			lines(3, -w / 2 + 18, h * 0.02, w - 36, h * 0.08);
			this.rr(ctx, -w * 0.35, h * 0.3, w * 0.7, h * 0.11, h * 0.055, 0);
			ctx.fillStyle = look === "system" ? c.brand : fill2; ctx.fill(); outline(3);
			break;
		case "stat":
			box(look === "system" ? c.surface : gradient());
			lines(1, -w / 2 + 14, -h * 0.26, w * 0.5, h * 0.12);
			this.text(ctx, words("stat"), -w / 2 + 14, h * 0.12, { size: h * 0.42, font, align: "left", color: c.ink, max: w - 28 });
			break;
		case "chart": {
			box(look === "system" ? c.surface : gradient());
			const n = 7;
			const colors = look === "system" ? [c.brand, c.blue, c.mustard, c.navy] : WILD;
			for (let i = 0; i < n; i++) {
				const bh = (0.25 + hash(i + p.warp * 3) * 0.6) * h * 0.8;
				const bw = (w - 60) / n - 10;
				const x = -w / 2 + 30 + i * ((w - 60) / n);
				this.rr(ctx, x, h / 2 - 22 - bh, bw, bh, look === "system" ? 4 : bw / 2, 0);
				ctx.fillStyle = colors[i % colors.length];
				ctx.fill();
				outline(3);
			}
			break;
		}
		case "junk":
		default: {
			const shape = Math.floor(p.warp * 4);
			ctx.fillStyle = look === "system" ? c.surface : gradient();
			if (shape === 0) this.star(ctx, 0, 0, Math.min(w, h) * 0.6, Math.min(w, h) * 0.26, 5);
			else if (shape === 1) this.blob(ctx, 0, 0, Math.min(w, h) * 0.55, p.id);
			else if (shape === 2) { this.rr(ctx, -w / 2, -h / 2, w, h, 0, p.id); }
			else { ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2.6, 0, 0, Math.PI * 2); }
			ctx.fill();
			outline(4);
			if (shape === 2) this.text(ctx, "Lorem ipsm", 0, 0, { size: Math.min(28, h * 0.4), font: WILD_FONT, color: c.ink, max: w - 8 });
			if (shape === 3) {
				ctx.fillStyle = c.surface;
				for (const ex of [-0.18, 0.18]) { ctx.beginPath(); ctx.arc(ex * w, -h * 0.05, Math.min(w, h) * 0.12, 0, Math.PI * 2); ctx.fill(); }
				ctx.fillStyle = c.ink;
				for (const ex of [-0.18, 0.18]) { ctx.beginPath(); ctx.arc(ex * w + Math.sin(this.now * 8 + p.id) * 4, -h * 0.05, Math.min(w, h) * 0.05, 0, Math.PI * 2); ctx.fill(); }
			}
			break;
		}
		}
		ctx.restore();
	}

	star(ctx, x, y, r1, r2, n) {
		ctx.beginPath();
		for (let i = 0; i < n * 2; i++) {
			const r = i % 2 ? r2 : r1;
			const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
			ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
		}
		ctx.closePath();
	}

	blob(ctx, x, y, r, seed) {
		ctx.beginPath();
		const n = 9;
		for (let i = 0; i <= n; i++) {
			const a = (i / n) * Math.PI * 2;
			const rr = r * (0.75 + hash(seed + i) * 0.5) + this.jit(seed + i, 1.5);
			ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
		}
		ctx.closePath();
	}

	drawStamp(ctx) {
		const s = this.fx.stamp;
		if (!s) return;
		const t = this.now - s.at;
		if (t > 1.1) { this.fx.stamp = null; return; }
		const w = PLACES.window;
		const k = Sim.easeOutBack(clamp(t / 0.22));
		ctx.save();
		ctx.globalAlpha = t > 0.75 ? 1 - (t - 0.75) / 0.35 : 1;
		ctx.translate(w.x + w.width / 2, w.y + w.height / 2);
		ctx.rotate(-0.2);
		ctx.scale(2.6 - 1.6 * k, 2.6 - 1.6 * k);
		this.rr(ctx, -210, -70, 420, 140, 18, 91);
		ctx.fillStyle = this.c.surface;
		ctx.fill();
		this.ink(ctx, 12, this.c.brand);
		ctx.stroke();
		this.text(ctx, "APPROVED", 0, 6, { size: 112, font: this.fonts.display, color: this.c.brand });
		ctx.restore();
	}

	drawBolts(ctx) {
		for (const bolt of this.fx.bolts) {
			ctx.beginPath();
			ctx.moveTo(bolt.from.x, bolt.from.y);
			for (let i = 1; i < 7; i++) {
				const k = i / 7;
				ctx.lineTo(lerp(bolt.from.x, bolt.to.x, k) + (Math.random() - 0.5) * 50, lerp(bolt.from.y, bolt.to.y, k) + (Math.random() - 0.5) * 30);
			}
			ctx.lineTo(bolt.to.x, bolt.to.y);
			this.ink(ctx, 16);
			ctx.stroke();
			this.ink(ctx, 7, this.c.mustard);
			ctx.stroke();
		}
	}

	drawParticles(ctx) {
		for (const p of this.fx.particles) {
			const k = 1 - p.life / p.ttl;
			ctx.save();
			ctx.globalAlpha = clamp(k * 1.4);
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rot);
			ctx.fillStyle = p.color;
			if (p.kind === "confetti") ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
			else if (p.kind === "spark") { this.ink(ctx, 5, this.c.mustard); ctx.beginPath(); ctx.moveTo(-p.size * 2, 0); ctx.lineTo(p.size * 2, 0); ctx.stroke(); }
			else if (p.kind === "star" || p.kind === "wild") { this.star(ctx, 0, 0, p.size * 1.3, p.size * 0.5, 4); ctx.fill(); }
			else if (p.kind === "ring") { this.ink(ctx, 6); ctx.globalAlpha = k * 0.5; ctx.beginPath(); ctx.arc(0, 0, (1 - k) * 260, 0, Math.PI * 2); ctx.stroke(); }
			else { ctx.fillStyle = this.c.cream5; ctx.beginPath(); ctx.arc(0, 0, p.size * (1.5 - k), 0, Math.PI * 2); ctx.fill(); }
			ctx.restore();
		}
	}

	/** Brad's slash: a bright diagonal sweep across whatever just arrived. */
	slashOn(feature, x, y, w, h) {
		const a = this.fx.appear[feature];
		if (!a?.isNew || !this.motionOn) return;
		const t = (this.now - a.at - 0.35) / 0.55;
		if (t < 0 || t > 1) return;
		(this.slashes ||= []).push({ x, y, w, h, t });
	}

	drawSlash(ctx) {
		for (const s of this.slashes || []) {
			ctx.save();
			ctx.beginPath();
			ctx.rect(s.x, s.y, s.w, s.h);
			ctx.clip();
			const span = s.w + s.h;
			const pos = s.x - s.h + span * Sim.easeInOut(s.t) * 1.1;
			ctx.globalAlpha = 0.75 * Math.sin(s.t * Math.PI);
			ctx.fillStyle = this.c.mustard;
			ctx.beginPath();
			ctx.moveTo(pos, s.y + s.h);
			ctx.lineTo(pos + 50, s.y + s.h);
			ctx.lineTo(pos + 50 + s.h, s.y);
			ctx.lineTo(pos + s.h, s.y);
			ctx.fill();
			ctx.restore();
		}
		this.slashes = [];
	}

	drawBubbles(ctx) {
		const anchors = {
			you: { x: 300, y: 250, label: "YOU" },
			robot: { x: 400, y: 330 },
			brain: { x: PLACES.brain.x + 90, y: PLACES.brain.y - 60 },
			rules: { x: 160, y: 620 },
			gate: { ...Sim.railPoint(PLACES.gateT), dy: -270 },
			curtain: { x: PLACES.booth.x + 40, y: PLACES.booth.y - 70 },
		};
		for (const [who, b] of this.fx.bubbles) {
			const anchor = anchors[who];
			if (!anchor) continue;
			const age = this.now - b.at;
			if (age < 0) continue;
			const k = this.motionOn ? Sim.easeOutBack(clamp(age / 0.28)) : 1;
			const fade = clamp((b.ttl - age) / 0.3);
			const size = 30;
			ctx.font = `${size}px ${this.fonts.body}`;
			const words = b.text.split(" ");
			const lines = [];
			let line = "";
			for (const word of words) {
				const next = line ? `${line} ${word}` : word;
				if (ctx.measureText(next).width > 380 && line) { lines.push(line); line = word; } else line = next;
			}
			lines.push(line);
			const width = Math.max(...lines.map(l => ctx.measureText(l).width)) + 48;
			const height = lines.length * 38 + 30 + (anchor.label ? 30 : 0);
			const ax = anchor.x;
			const ay = anchor.y + (anchor.dy || 0);
			const bx = clamp(ax - width * (who === "curtain" ? 0.8 : who === "brain" ? 0.1 : 0.5), 16, W - width - 16);
			const by = who === "you" ? 24 : Math.max(16, ay - height - 34);
			ctx.save();
			ctx.globalAlpha = fade;
			ctx.translate(ax, ay);
			ctx.scale(k, k);
			ctx.translate(-ax, -ay);
			ctx.beginPath();
			const tailX = clamp(ax, bx + 30, bx + width - 30);
			ctx.moveTo(tailX - 18, by + height - 2);
			ctx.lineTo(who === "you" ? tailX + 10 : ax, who === "you" ? by + height + 50 : ay);
			ctx.lineTo(tailX + 18, by + height - 2);
			ctx.fillStyle = who === "you" ? this.c.mustard : this.c.surface;
			this.ink(ctx, 5);
			ctx.fill();
			ctx.stroke();
			this.rr(ctx, bx, by, width, height, 22, bx);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(tailX - 15, by + height - 3);
			ctx.lineTo(tailX + 15, by + height - 3);
			this.ink(ctx, 7, ctx.fillStyle);
			ctx.stroke();
			let y = by + 34;
			if (anchor.label) { this.text(ctx, anchor.label, bx + 24, y, { size: 26, font: this.fonts.display, align: "left", color: this.c.ink }); y += 32; }
			lines.forEach((l, i) => this.text(ctx, l, bx + 24, y + i * 38, { size, align: "left" }));
			ctx.restore();
		}
	}

	drawTitle(ctx) {
		const title = this.fx.title;
		if (!title) return;
		const t = this.now - title.at;
		if (t > 1.6) { this.fx.title = null; return; }
		const copy = this.data.levels[title.level];
		const inK = Sim.easeInOut(clamp(t / 0.32));
		const outK = Sim.easeInOut(clamp((t - 1.2) / 0.4));
		const x = (1 - inK) * -2400 + outK * 2600;
		ctx.save();
		ctx.translate(x, 0);
		const band = (y0, y1, color, skew = 160) => {
			ctx.beginPath();
			ctx.moveTo(-200, y1);
			ctx.lineTo(W + 200 - skew, y1);
			ctx.lineTo(W + 200, y0);
			ctx.lineTo(-200 + skew, y0);
			ctx.closePath();
			ctx.fillStyle = color;
			ctx.fill();
		};
		band(350, 400, this.c.mustard);
		band(390, 700, this.c.brand);
		band(690, 735, this.c.navy);
		this.ink(ctx, 8);
		ctx.beginPath();
		ctx.moveTo(-200, 390); ctx.lineTo(W + 200, 390);
		ctx.moveTo(-200, 700); ctx.lineTo(W + 200, 700);
		ctx.stroke();
		const pop = Sim.easeOutElastic(clamp((t - 0.15) / 0.7));
		ctx.save();
		ctx.translate(W / 2, 560);
		ctx.scale(pop, pop);
		ctx.rotate(-0.03);
		this.text(ctx, `LEVEL ${title.level + 1}`, 6, -108, { size: 64, font: this.fonts.display, color: this.c.ink });
		this.text(ctx, `LEVEL ${title.level + 1}`, 0, -114, { size: 64, font: this.fonts.display, color: this.c.onDark });
		this.text(ctx, copy.title.toUpperCase(), 10, 26, { size: 190, font: this.fonts.display, color: this.c.ink, max: 1700 });
		this.text(ctx, copy.title.toUpperCase(), 0, 16, { size: 190, font: this.fonts.display, color: this.c.onDark, max: 1700 });
		ctx.restore();
		ctx.restore();
	}
}

if (!customElements.get("aids-rails-alive")) customElements.define("aids-rails-alive", RailsAlive);
