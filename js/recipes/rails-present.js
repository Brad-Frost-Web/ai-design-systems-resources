import "@brad-frost-web/eddie-web-components/components/dot/dot.js";
import "@brad-frost-web/eddie-web-components/components/kbd/kbd.js";
import "@brad-frost-web/eddie-web-components/components/icon/icon.js";
import {
	buildSteps, shownAt, newAt, firstStepOfLevel, presentFromSearch, stepForKey,
	visiblePipeline, visibleLoops, visibleUses,
} from "./rails-present-state.mjs";

const SVG = "http://www.w3.org/2000/svg";
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const SEGMENT_MS = 320;

/**
 * aids-rails-present — the Rails lab as a one-frame, step-built diagram (#33).
 * Lives inside a native <dialog>. P (or a [data-present-open] control) enters,
 * Escape exits, ←/→ step, 1–7 jump to a level, ?present&step=N deep-links.
 * Each beat adds pieces with a left-to-right slash sweep; each level ends on a
 * flow beat that runs a pulse through the pipeline and its retry loops.
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
		this.svg = this.querySelector(".ed-r-rails-present__edges");
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
		on(this, "pointerover", e => this.focusNode(e.target.closest?.("[data-present-node]")));
		on(this, "pointerout", () => this.focusNode(null));

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
		e.stopImmediatePropagation();
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
		this.render({ arriving: true });
	}

	onClose() {
		this.flowToken = null;
		if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
		const url = new URL(location.href);
		url.searchParams.delete("present");
		url.searchParams.delete("step");
		history.replaceState(null, "", url);
		// Hand the level back so the lab shows where the talk ended.
		const lab = document.querySelector("aids-rails-lab");
		lab?.setRung?.(this.steps[this.step].level);
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
		this.scale = scale;
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

	render({ arriving = false } = {}) {
		this.flowToken = null;
		this.pulse.hidden = true;
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
		this.renderHud(step, arriving);
		this.shown = shown;
		this.fresh = fresh;
		this.setSweepDelays(fresh);
		this.flip(before);
		this.drawEdges();

		const url = new URL(location.href);
		url.searchParams.set("present", "");
		url.searchParams.set("step", String(this.step));
		history.replaceState(null, "", url.toString().replace("present=&", "present&").replace(/present=$/, "present"));

		this.querySelector("[data-present-live]").textContent =
			`Level ${step.level + 1}, ${this.data.rungs[step.level].title}. ${step.label}.`;
		if (step.kind === "flow") this.runFlow();
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
		const width = this.offsetWidth || 1;
		for (const id of fresh) {
			const el = this.nodes.get(id);
			const x = this.boxOf(el).x / width;
			el.style.setProperty("--_sweep-delay", `${Math.round(x * 600)}ms`);
		}
	}

	// ---- geometry: offsets within the stage, which transforms don't affect ----

	boxOf(el) {
		let x = 0, y = 0, node = el;
		while (node && node !== this) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
		return { x, y, width: el.offsetWidth, height: el.offsetHeight };
	}

	/** The circle for pipeline nodes, the pill for everything else. */
	anchorOf(id) {
		const el = this.nodes.get(id);
		const target = el.querySelector("ed-dot") || el;
		const b = this.boxOf(target);
		return { ...b, cx: b.x + b.width / 2, cy: b.y + b.height / 2, lane: el.closest("[data-present-lane]") };
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
			el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 450, easing: "cubic-bezier(.2,.7,.2,1)" });
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
		return new Map(sorted.map((loop, i) => [loop.key, 40 + i * 42]));
	}

	pathFor(edge, height) {
		const a = this.anchorOf(edge.from);
		const b = this.anchorOf(edge.to);
		const r = a.width / 2;
		if (edge.kind === "flow") {
			return `M ${a.cx + r} ${a.cy} L ${b.cx - b.width / 2 - 4} ${b.cy}`;
		}
		if (edge.kind === "loop") {
			const top = Math.min(a.y, b.y) - height;
			return `M ${a.cx} ${a.y} C ${a.cx} ${top}, ${b.cx} ${top}, ${b.cx} ${b.y - 4}`;
		}
		// uses: vertical curve from the node (dot plus its kind label) to the pill
		const node = this.boxOf(this.nodes.get(edge.from));
		const above = b.y < a.y;
		const y1 = above ? a.y : node.y + node.height;
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
			const loop = loops.find(l => l.from === here && !taken.has(l.key ?? `${l.from}>${l.to}`) && l.from !== "feedback");
			if (loop) {
				taken.add(loop.key ?? `${loop.from}>${loop.to}`);
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
		await new Promise(resolve => setTimeout(resolve, 500));
		this.pulse.hidden = false;
		for (const key of this.route()) {
			if (this.flowToken !== token) return;
			const path = this.edgeLayer.querySelector(`[data-key="${CSS.escape(key)}"]`);
			if (!path) continue;
			this.arrive(path.dataset.from);
			await this.travel(path, key.startsWith("loop") ? SEGMENT_MS * 2.4 : SEGMENT_MS, token);
		}
		if (this.flowToken !== token) return;
		const order = visiblePipeline(this.data.pipeline, this.shown);
		this.arrive(order.at(-1));
		this.pulse.hidden = true;
		this.classList.remove("is-flowing");
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
			setTimeout(() => path.classList.remove("is-active"), 900);
		});
	}
}

if (!customElements.get("aids-rails-present")) customElements.define("aids-rails-present", RailsPresent);
