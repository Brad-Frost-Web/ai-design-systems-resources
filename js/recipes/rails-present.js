import "@brad-frost-web/eddie-web-components/components/kbd/kbd.js";
import "@brad-frost-web/eddie-web-components/components/icon/icon.js";
import {
	buildSteps, shownAt, newAt, firstStepOfLevel, presentFromSearch, stepForKey,
	visiblePipeline, visibleLoops, visibleUses,
} from "./rails-present-state.mjs";
import { pieceState, isShown } from "./rails-stage-state.mjs";

const SVG = "http://www.w3.org/2000/svg";
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
// The choreography, in multiples of Eddie's --ed-theme-animation-move-long so
// a theme that retimes motion retimes the whole presentation with it.
const CHOREOGRAPHY = { segment: 0.8, sweepSpread: 1.5, flowLead: 1.25, highlightHold: 2.25, camera: 2, prompt: 11.25 };
// What the camera keeps around a focus, in canvas pixels, so new pieces
// arrive with their neighbours in view rather than filling the frame alone.
const FRAME_MARGIN = 96;
const FRAME_MIN_WIDTH = 1200;

/**
 * aids-rails-present — the Rails lab, built step by step for presenting (#33).
 * Lives inside a native <dialog>. P (or a [data-present-open] control) enters,
 * Escape exits, ←/→ step, 1–7 jump to a level, ?present&step=N deep-links.
 * The pipeline is the lab's own cards on a canvas; a camera frames what each
 * beat adds (with a left-to-right slash sweep) and pulls back to the whole
 * system on each level's flow beat, which runs a pulse through the pipeline.
 */
class RailsPresent extends HTMLElement {
	connectedCallback() {
		this.frame = requestAnimationFrame(() => { if (this.isConnected) this.enhance(); });
	}

	disconnectedCallback() {
		cancelAnimationFrame(this.frame);
		this.abort?.abort();
		this.resize?.disconnect();
		this.flowToken = null;
		this.ready = false;
	}

	enhance() {
		if (this.ready) return;
		this.ready = true;
		this.abort = new AbortController();
		const on = (target, type, handler) => target.addEventListener(type, handler, { signal: this.abort.signal });
		this.data = JSON.parse(this.querySelector("[data-present-data]").textContent);
		this.steps = buildSteps(this.data.levels, this.data.flowLabel);
		this.dialog = this.closest("dialog");
		this.viewport = this.querySelector("[data-present-viewport]");
		this.canvas = this.querySelector("[data-present-canvas]");
		this.svg = this.querySelector(".ed-r-rails-present__edges");
		// The pipeline's cards are the nodes; the prompt card carries no piece id.
		const cards = [...this.querySelectorAll(".ed-r-rails-lab__pipeline > li")];
		cards.forEach(li => { li.dataset.presentNode = li.dataset.piece || "entry"; });
		// Pieces inside cards (the Rules card's early and governed copy) follow the level.
		this.levelPieces = cards.flatMap(li => [...li.querySelectorAll("[data-piece][data-in]")]);
		this.edgeLayer = this.querySelector("[data-present-edges]");
		this.pulse = this.querySelector("[data-present-pulse]");
		this.nodes = new Map([...this.querySelectorAll("[data-present-node]")].map(el => [el.dataset.presentNode, el]));
		this.step = 0;
		this.shown = new Set();
		this.edgeKeys = new Set();

		this.resize = new ResizeObserver(() => this.fit());
		this.resize.observe(this.dialog);

		on(document, "click", e => {
			if (e.target.closest?.("[data-present-open]")) this.open();
		});
		on(document, "keydown", e => this.onKey(e));
		on(this.dialog, "close", () => this.onClose());
		// Pointer and touch get the same moves as the keyboard.
		on(this, "click", e => {
			// A card's own control pins its connections, as it highlights them in the lab.
			const station = e.target.closest?.("[data-station]");
			if (station) {
				const node = station.closest("[data-present-node]");
				this.pinned = this.pinned === node ? null : node;
				station.setAttribute("aria-pressed", String(this.pinned === node));
				this.focusNode(this.pinned);
				return;
			}
			const control = e.target.closest?.("[data-present-prev], [data-present-next], [data-present-exit]");
			if (!control) return;
			if (control.matches("[data-present-exit]")) this.dialog.close();
			else this.go(stepForKey(control.matches("[data-present-next]") ? "ArrowRight" : "ArrowLeft", this.step, this.steps));
		});
		on(this, "pointerover", e => this.focusNode(e.target.closest?.("[data-present-node]") || this.pinned));
		on(this, "pointerout", () => this.focusNode(this.pinned));
		this.setupComposer();

		const url = presentFromSearch(location.search, this.steps);
		if (url.present) this.open(url.step);
	}

	onKey(e) {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (!this.dialog.open) {
			const typing = e.composedPath().some(el => el instanceof Element && el.matches("input,select,textarea,[contenteditable=true]"));
			if ((e.key === "p" || e.key === "P") && !typing) { e.preventDefault(); this.open(); }
			return;
		}
		if (e.key === "f" || e.key === "F") { e.preventDefault(); this.toggleFullscreen(); return; }
		const next = stepForKey(e.key, this.step, this.steps);
		if (next === null) return;
		e.preventDefault();
		this.go(next);
	}

	/** Enter at `step`, or at the start of the lab's current level. */
	open(step) {
		if (this.dialog.open) return;
		const labLevel = Number(document.querySelector("aids-rails-lab")?.dataset.rung || 0);
		this.step = step ?? firstStepOfLevel(this.steps, labLevel);
		this.shown = new Set();
		this.edgeKeys = new Set();
		this.dialog.showModal();
		this.dialog.requestFullscreen?.().catch(() => {});
		this.fit();
		this.canvas.dataset.cameraInstant = "";
		this.render({ arriving: true });
		// showModal focused the first control on the canvas, which the first
		// beat may hide; keep focus on the deck's own control instead.
		this.querySelector("[data-present-next]")?.focus();
		requestAnimationFrame(() => delete this.canvas.dataset.cameraInstant);
		this.cyclePrompts();
	}

	onClose() {
		this.stopFlow();
		clearTimeout(this.promptTimer);
		if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
		const url = new URL(location.href);
		url.searchParams.delete("present");
		url.searchParams.delete("step");
		history.replaceState(null, "", url);
		// Hand the level back so the lab shows where the talk ended.
		const lab = document.querySelector("aids-rails-lab");
		lab?.setRung(this.steps[this.step].level);
		document.querySelector("[data-present-open]")?.focus();
	}

	toggleFullscreen() {
		if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
		else this.dialog.requestFullscreen?.().catch(() => {});
	}

	/** Letterbox the fixed 16:9 stage into whatever the dialog measures. */
	fit() {
		const width = this.offsetWidth || 1;
		const height = this.offsetHeight || 1;
		const scale = Math.min(this.dialog.clientWidth / width, this.dialog.clientHeight / height);
		this.style.setProperty("--_scale", String(scale));
		this.style.setProperty("--_offset-x", `${(this.dialog.clientWidth - width * scale) / 2}px`);
		this.style.setProperty("--_offset-y", `${(this.dialog.clientHeight - height * scale) / 2}px`);
	}

	go(step) {
		if (step === this.step) return;
		const forward = step === this.step + 1;
		this.step = step;
		this.render({ arriving: forward });
	}

	/** Stop a pulse mid-run; its marching loops stop with it. */
	stopFlow() {
		this.flowToken = null;
		this.pulse.hidden = true;
		this.classList.remove("is-flowing");
	}

	/** A CHOREOGRAPHY timing, in ms, scaled from the theme's motion token. */
	motion(name) {
		return this.ms("--ed-theme-animation-move-long") * CHOREOGRAPHY[name];
	}

	/** A CSS time token's computed value, in ms. */
	ms(name) {
		const value = getComputedStyle(this).getPropertyValue(name).trim();
		const n = parseFloat(value);
		return value.endsWith("ms") ? n : n * 1000;
	}

	render({ arriving = false } = {}) {
		this.stopFlow();
		this.pinned = null;
		this.canvas.querySelectorAll("[data-station]").forEach(button => button.setAttribute("aria-pressed", "false"));
		const step = this.steps[this.step];
		const shown = shownAt(this.steps, this.step);
		// Only animate arrivals when stepping forward; a jump just shows the state.
		const fresh = arriving ? newAt(this.steps, this.step) : new Set();
		const before = this.measureAll();

		for (const [id, el] of this.nodes) {
			el.hidden = !shown.has(id);
			el.toggleAttribute("data-new", fresh.has(id));
		}
		this.querySelectorAll("[data-present-lane]").forEach(lane => {
			lane.toggleAttribute("data-empty", ![...lane.querySelectorAll("[data-present-node]")].some(n => !n.hidden));
		});
		this.renderCards(step.level);
		this.renderHud(step, arriving);
		this.shown = shown;
		this.fresh = fresh;
		this.setSweepDelays(fresh);
		this.flip(before);
		this.drawEdges();
		this.aim(step, fresh);
		if (step.kind === "flow") this.runFlow();

		const url = new URL(location.href);
		url.searchParams.set("present", "");
		url.searchParams.set("step", String(this.step));
		history.replaceState(null, "", url.toString().replace("present=&", "present&").replace(/present=$/, "present"));

		this.querySelector("[data-present-live]").textContent =
			`Level ${step.level + 1}, ${this.data.rungs[step.level].title}. ${step.label}.`;
	}

	/** The cards' level-dependent copy and step numbers, as the lab sets them. */
	renderCards(level) {
		for (const el of this.levelPieces) {
			el.hidden = !isShown(pieceState(Number(el.dataset.in), el.dataset.out === undefined ? undefined : Number(el.dataset.out), level));
		}
		const rung = this.data.rungs[level];
		const copy = { "[data-review-copy]": rung.reviewDescription, "[data-output-title]": rung.outputTitle, "[data-output-caption]": rung.outputCaption, "[data-generation-copy]": rung.generation };
		for (const [selector, text] of Object.entries(copy)) this.canvas.querySelectorAll(selector).forEach(el => { el.textContent = text; });
		[...this.canvas.querySelectorAll(".ed-r-rails-lab__pipeline > li")].filter(li => !li.hidden)
			.flatMap(li => [...li.querySelectorAll("[data-process-number]")])
			.forEach((badge, index) => { badge.textContent = index + 1; });
	}

	/**
	 * Point the camera: on a flow beat, the whole system; otherwise what this
	 * beat added, plus the cards it connects to, with room around it.
	 */
	aim(step, fresh) {
		let ids = [...this.shown];
		if (step.kind !== "flow" && fresh.size) {
			const order = visiblePipeline(this.data.pipeline, this.shown);
			const focus = new Set(fresh);
			for (const [from, uses] of Object.entries(this.data.uses)) {
				const targets = uses.split(" ");
				if (fresh.has(from)) targets.filter(id => this.shown.has(id)).forEach(id => focus.add(id));
				if (this.shown.has(from) && targets.some(id => fresh.has(id))) focus.add(from);
			}
			// A new card arrives beside the one before it.
			for (const id of fresh) { const i = order.indexOf(id); if (i > 0) focus.add(order[i - 1]); }
			ids = [...focus];
		}
		const boxes = ids.map(id => this.boxOf(this.nodes.get(id)));
		let left = Math.min(...boxes.map(b => b.x)) - FRAME_MARGIN;
		let right = Math.max(...boxes.map(b => b.x + b.width)) + FRAME_MARGIN;
		const top = Math.min(...boxes.map(b => b.y)) - FRAME_MARGIN;
		const bottom = Math.max(...boxes.map(b => b.y + b.height)) + FRAME_MARGIN;
		if (right - left < FRAME_MIN_WIDTH) { const grow = (FRAME_MIN_WIDTH - (right - left)) / 2; left -= grow; right += grow; }
		const view = { width: this.viewport.offsetWidth, height: this.viewport.offsetHeight };
		const scale = Math.min(1, view.width / (right - left), view.height / (bottom - top));
		const x = view.width / 2 - ((left + right) / 2) * scale;
		const y = view.height / 2 - ((top + bottom) / 2) * scale;
		this.canvas.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
		this.canvas.style.setProperty("--_camera-scale", String(scale));
		// Keep the pulse the same size on screen however far the camera pulls back.
		this.pulse.setAttribute("r", String(12 / scale));
	}

	/** The prompt card's examples cycle while presenting, as they do in the lab. */
	setupComposer() {
		this.prompts = [...this.canvas.querySelectorAll("[data-prompt-example]")];
		this.promptIndex = 0;
		this.canvas.querySelector("[data-prompt-examples]")?.setAttribute("data-enhanced", "");
		this.showPrompt();
	}

	showPrompt() {
		this.prompts.forEach((prompt, index) => {
			prompt.toggleAttribute("data-active", index === this.promptIndex);
			prompt.setAttribute("aria-hidden", String(index !== this.promptIndex));
		});
	}

	cyclePrompts() {
		clearTimeout(this.promptTimer);
		if (!this.dialog.open || reducedMotion() || this.prompts.length < 2) return;
		this.promptTimer = setTimeout(() => {
			this.promptIndex = (this.promptIndex + 1) % this.prompts.length;
			this.showPrompt();
			this.cyclePrompts();
		}, this.motion("prompt"));
	}

	renderHud(step, arriving) {
		const rung = this.data.rungs[step.level];
		this.querySelectorAll("[data-present-level]").forEach(el => {
			const level = Number(el.dataset.presentLevel);
			el.dataset.state = level < step.level ? "past" : level === step.level ? "current" : "future";
			el.toggleAttribute("data-new", arriving && level === step.level && step.beat === 0);
		});
		const beats = this.steps.filter(s => s.level === step.level).length;
		this.querySelector("[data-present-eyebrow]").textContent =
			`Level ${step.level + 1} of ${this.data.rungs.length} · ${rung.title} · ${step.beat + 1}/${beats}`;
		this.querySelector("[data-present-beat]").textContent = step.label;
		this.querySelector("[data-present-adds]").textContent = rung.adds;
	}

	/** The sweep crosses the diagram left to right: delay by horizontal position. */
	setSweepDelays(fresh) {
		const width = this.canvas.offsetWidth || 1;
		for (const id of fresh) {
			const el = this.nodes.get(id);
			const x = this.boxOf(el).x / width;
			el.style.setProperty("--_sweep-delay", `${Math.round(x * this.motion("sweepSpread"))}ms`);
		}
	}

	// ---- geometry: offsets within the canvas, which transforms don't affect ----

	boxOf(el) {
		let x = 0, y = 0, node = el;
		while (node && node !== this.canvas) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
		return { x, y, width: el.offsetWidth, height: el.offsetHeight };
	}

	/** A node's box on the canvas, with its centre. */
	anchorOf(id) {
		const b = this.boxOf(this.nodes.get(id));
		return { ...b, cx: b.x + b.width / 2, cy: b.y + b.height / 2 };
	}

	measureAll() {
		const boxes = new Map();
		for (const [id, el] of this.nodes) if (!el.hidden) boxes.set(id, this.boxOf(el));
		return boxes;
	}

	/** Nodes already on screen glide to their new place as the row re-centres. */
	flip(before) {
		if (reducedMotion()) return;
		for (const [id, el] of this.nodes) {
			if (el.hidden || !before.has(id)) continue;
			const from = before.get(id);
			const to = this.boxOf(el);
			const dx = from.x - to.x, dy = from.y - to.y;
			if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
			el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
				duration: this.ms("--ed-theme-animation-move-long"),
				easing: getComputedStyle(this).getPropertyValue("--ed-theme-animation-ease").trim() || "ease",
			});
		}
	}

	// ---- edges ----

	drawEdges() {
		const shown = this.shown;
		const order = visiblePipeline(this.data.pipeline, shown);
		const edges = [];
		order.slice(1).forEach((id, i) => edges.push({ key: `flow:${order[i]}>${id}`, kind: "flow", from: order[i], to: id }));
		visibleLoops(this.data.loops, shown).forEach(loop => edges.push({ key: `loop:${loop.from}>${loop.to}`, kind: "loop", ...loop }));
		const usesNodes = Object.entries(this.data.uses).map(([id, uses]) => ({ id, uses }));
		visibleUses(usesNodes, shown).forEach(edge => edges.push({ key: `uses:${edge.from}>${edge.to}`, kind: "uses", ...edge }));

		const loopHeights = this.loopHeights(edges.filter(e => e.kind === "loop"), order);
		const fragment = document.createDocumentFragment();
		const keys = new Set();
		for (const edge of edges) {
			const path = document.createElementNS(SVG, "path");
			path.setAttribute("d", this.pathFor(edge, loopHeights.get(edge.key)));
			path.classList.add("ed-r-rails-present__edge", `ed-r-rails-present__edge--${edge.kind}`);
			path.dataset.from = edge.from;
			path.dataset.to = edge.to;
			path.dataset.key = edge.key;
			if (edge.kind !== "uses") path.setAttribute("marker-end", "url(#rails-present-arrow)");
			const touchesNew = this.fresh.has(edge.from) || this.fresh.has(edge.to);
			if (!this.edgeKeys.has(edge.key) && !reducedMotion()) {
				// Draw in by dash offset; pathLength=1 would also flatten the
				// loops' dash pattern, so it comes off once the line is drawn.
				path.setAttribute("pathLength", "1");
				path.classList.add("is-drawing");
				path.addEventListener("animationend", () => {
					path.classList.remove("is-drawing");
					path.removeAttribute("pathLength");
				}, { once: true });
			}
			if (edge.kind === "uses" && touchesNew) path.classList.add("is-lit");
			fragment.append(path);
			if (edge.kind === "loop") fragment.append(this.loopLabel(edge, loopHeights.get(edge.key)));
			keys.add(edge.key);
		}
		this.edgeLayer.replaceChildren(fragment);
		this.edgeKeys = keys;
	}

	/** Longer loops arc higher so nested loops never overlap. */
	loopHeights(loops, order) {
		const span = loop => Math.abs(order.indexOf(loop.from) - order.indexOf(loop.to));
		const sorted = [...loops].sort((a, b) => span(a) - span(b));
		return new Map(sorted.map((loop, i) => [loop.key, 48 + i * 56]));
	}

	pathFor(edge, height) {
		const a = this.anchorOf(edge.from);
		const b = this.anchorOf(edge.to);
		if (edge.kind === "flow") {
			return `M ${a.x + a.width} ${a.cy} L ${b.x - 4} ${b.cy}`;
		}
		if (edge.kind === "loop") {
			const top = Math.min(a.y, b.y) - height;
			return `M ${a.cx} ${a.y} C ${a.cx} ${top}, ${b.cx} ${top}, ${b.cx} ${b.y - 4}`;
		}
		// uses: vertical curve from the card to the pill above or below it
		const above = b.y < a.y;
		const y1 = above ? a.y : a.y + a.height;
		const y2 = above ? b.y + b.height : b.y;
		const mid = (y1 + y2) / 2;
		return `M ${a.cx} ${y1} C ${a.cx} ${mid}, ${b.cx} ${mid}, ${b.cx} ${y2}`;
	}

	loopLabel(edge, height) {
		const a = this.anchorOf(edge.from);
		const b = this.anchorOf(edge.to);
		const text = document.createElementNS(SVG, "text");
		text.classList.add("ed-r-rails-present__loop-label");
		// Sit the label 30% along the arc from its source, where nested arcs
		// are furthest apart; their midpoints all crowd over the loop target.
		const top = Math.min(a.y, b.y) - height;
		const t = 0.3, u = 1 - t;
		const x = u ** 3 * a.cx + 3 * u ** 2 * t * a.cx + 3 * u * t ** 2 * b.cx + t ** 3 * b.cx;
		const y = u ** 3 * a.y + 3 * u ** 2 * t * top + 3 * u * t ** 2 * top + t ** 3 * b.y;
		text.setAttribute("x", String(x));
		text.setAttribute("y", String(y - 12));
		text.setAttribute("text-anchor", "middle");
		text.textContent = edge.label;
		return text;
	}

	focusNode(el) {
		const id = el?.dataset.presentNode;
		this.edgeLayer.querySelectorAll(".ed-r-rails-present__edge--uses").forEach(path => {
			const hit = id && (path.dataset.from === id || path.dataset.to === id);
			path.classList.toggle("is-hovered", Boolean(hit));
		});
	}

	// ---- flow: a pulse travels the pipeline, taking each retry loop once ----

	route() {
		const order = visiblePipeline(this.data.pipeline, this.shown);
		const loops = visibleLoops(this.data.loops, this.shown);
		const route = [];
		const taken = new Set();
		let i = 0;
		while (i < order.length - 1) {
			const here = order[i];
			const loop = loops.find(l => l.from === here && !taken.has(l.from) && l.from !== "feedback");
			if (loop) {
				taken.add(loop.from);
				route.push(`loop:${loop.from}>${loop.to}`);
				i = order.indexOf(loop.to);
				continue;
			}
			route.push(`flow:${here}>${order[i + 1]}`);
			i += 1;
		}
		const back = loops.find(l => l.from === "feedback");
		if (back) route.push(`loop:${back.from}>${back.to}`);
		return route;
	}

	async runFlow() {
		if (reducedMotion()) return;
		const token = {};
		this.flowToken = token;
		this.classList.add("is-flowing");
		await new Promise(resolve => setTimeout(resolve, this.motion("flowLead")));
		this.pulse.hidden = false;
		for (const key of this.route()) {
			if (this.flowToken !== token) return;
			const path = this.edgeLayer.querySelector(`[data-key="${CSS.escape(key)}"]`);
			if (!path) continue;
			this.arrive(path.dataset.from);
			const segment = this.motion("segment");
			await this.travel(path, key.startsWith("loop") ? segment * 2.4 : segment, token);
		}
		if (this.flowToken !== token) return;
		const order = visiblePipeline(this.data.pipeline, this.shown);
		this.arrive(order.at(-1));
		this.stopFlow();
	}

	travel(path, duration, token) {
		const length = path.getTotalLength();
		const start = performance.now();
		return new Promise(resolve => {
			const tick = now => {
				if (this.flowToken !== token) return resolve();
				const t = Math.min((now - start) / duration, 1);
				const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
				const point = path.getPointAtLength(eased * length);
				this.pulse.setAttribute("cx", String(point.x));
				this.pulse.setAttribute("cy", String(point.y));
				if (t < 1) requestAnimationFrame(tick); else resolve();
			};
			requestAnimationFrame(tick);
		});
	}

	/** The pulse reaches a node: ring it, and light what it uses for a moment. */
	arrive(id) {
		const el = this.nodes.get(id);
		if (!el) return;
		el.classList.remove("is-pulsed");
		void el.offsetWidth;
		el.classList.add("is-pulsed");
		this.edgeLayer.querySelectorAll(`.ed-r-rails-present__edge--uses[data-from="${CSS.escape(id)}"]`).forEach(path => {
			path.classList.add("is-active");
			setTimeout(() => path.classList.remove("is-active"), this.motion("highlightHold"));
		});
	}
}

if (!customElements.get("aids-rails-present")) customElements.define("aids-rails-present", RailsPresent);
