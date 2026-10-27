import "@brad-frost-web/eddie-web-components/components/band/band.js";
import "@brad-frost-web/eddie-web-components/components/layout-section/layout-section.js";
import "@brad-frost-web/eddie-web-components/components/icon/icon.js";
import "@brad-frost-web/eddie-web-components/components/accordion/accordion.js";
import "@brad-frost-web/eddie-web-components/components/accordion-panel/accordion-panel.js";
import "@brad-frost-web/eddie-web-components/components/cluster/cluster.js";
import { clampRung, rungFromSearch, pieceState, isShown, rungForKey } from "./rails-stage-state.mjs";

/** Product-local teaching diagram; all application chrome is Eddie. */
class RailsLab extends HTMLElement {
	connectedCallback() {
		// Eleventy's live reload reconnects the shell before its child elements.
		// Let that DOM update finish before collecting controls and binding events.
		this.frame = requestAnimationFrame(() => {
			if (this.isConnected) this.enhance();
		});
	}
	enhance() {
		if (this.ready) return;
		this.ready = true;
		this.abort = new AbortController();
		const on = (target, event, handler) => target.addEventListener(event, handler, { signal: this.abort.signal });
		this.all = selector => [...this.querySelectorAll(selector)];
		this.one = selector => this.querySelector(selector);
		this.all("[data-controls]").forEach(el => el.hidden = false);
		this.lastRung = Number(this.one("[data-range]").max);
		this.readURL();
		this.setupPrompts(on);
		on(this.one("[data-range]"), "input", e => this.setRung(e.target.value));
		this.all("[data-step]").forEach(el => on(el, "click", () => this.setRung(el.dataset.step)));
		this.all("[data-concept-toggle]").forEach(button => on(button, "click", () => {
			this.descriptions = !this.descriptions;
			this.render(); this.writeURL();
		}));
		this.all("[data-station]").forEach(button => {
			on(button, "click", () => {
				this.selected = this.selected === button.dataset.station ? null : button.dataset.station;
				this.showConnections(this.selected);
			});
		});
		on(window, "popstate", () => this.readURL());
		on(document, "keydown", e => {
			if (e.key === "Escape") { this.promptPaused = true; this.renderPrompt(); return; }
			if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
			if (e.composedPath().some(el => el instanceof Element && el.matches("input,select,textarea,[contenteditable=true],[data-pipeline-scroll]"))) return;
			const next = rungForKey(/^[1-7]$/.test(e.key) ? String(Number(e.key) - 1) : e.key, this.rung, this.lastRung);
			if (next !== null) { e.preventDefault(); this.setRung(next); }
		});
	}
	disconnectedCallback() { cancelAnimationFrame(this.frame); this.abort?.abort(); clearTimeout(this.promptTimer); this.ready = false; }
	setupPrompts(on) {
		this.prompts = this.all("[data-prompt-example]");
		this.promptIndex = 0;
		this.promptMotion = matchMedia("(prefers-reduced-motion: reduce)");
		this.promptPaused = this.promptMotion.matches;
		this.composer = this.one(".ed-r-rails-lab__composer");
		this.composer.setAttribute("role", "button");
		this.composer.setAttribute("tabindex", "0");
		const toggle = () => { this.promptPaused = !this.promptPaused; this.renderPrompt(); };
		on(this.composer, "click", toggle);
		on(this.composer, "keydown", e => {
			if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
		});
		on(this.promptMotion, "change", () => {
			if (this.promptMotion.matches) this.promptPaused = true;
			this.renderPrompt();
		});
		on(document, "visibilitychange", () => this.renderPrompt());
		this.renderPrompt();
	}
	advancePrompt() {
		this.promptIndex = (this.promptIndex + 1) % this.prompts.length;
		this.renderPrompt();
	}
	renderPrompt() {
		clearTimeout(this.promptTimer);
		this.composer.setAttribute("aria-label", this.promptPaused ? "Resume prompt examples" : "Pause prompt examples");
		this.composer.setAttribute("aria-describedby", `lab-prompt-${this.promptIndex} lab-motion-help`);
		this.composer.setAttribute("title", this.promptPaused ? "Resume prompt examples" : "Pause prompt examples");
		this.one("[data-prompt-examples]").setAttribute("data-enhanced", "");
		this.prompts.forEach((prompt, index) => {
			prompt.toggleAttribute("data-active", index === this.promptIndex);
			prompt.setAttribute("aria-hidden", String(index !== this.promptIndex));
		});
		if (!this.promptPaused && !document.hidden && this.isConnected) {
			this.promptTimer = setTimeout(() => this.advancePrompt(), 4500);
		}
	}

	readURL() {
		const params = new URLSearchParams(location.search);
		this.rung = rungFromSearch(location.search, this.lastRung);
		this.descriptions = params.get("descriptions") === "1";
		this.selected = null;
		this.render();
		this.writeURL();
	}
	writeURL() {
		const url = new URL(location.href);
		url.searchParams.delete("future");
		url.searchParams.delete("present");
		url.searchParams.set("rung", this.rung);
		for (const key of ["descriptions"]) {
			if (this[key]) url.searchParams.set(key, "1"); else url.searchParams.delete(key);
		}
		history.replaceState(null, "", url);
	}
	setRung(value) { this.rung = clampRung(value, this.lastRung); this.selected = null; this.render(); this.writeURL(); }
	render() {
		this.dataset.rung = this.rung;
		const range = this.one("[data-range]");
		range.value = this.rung;
		const step = this.one(`[data-step="${this.rung}"]`);
		range.setAttribute("aria-valuetext", `Level ${this.rung + 1} of ${this.lastRung + 1}: ${step.dataset.title}`);
		this.all("[data-step]").forEach(el => {
			el.setAttribute("aria-current", Number(el.dataset.step) === this.rung ? "step" : "false");
			el.dataset.reached = Number(el.dataset.step) <= this.rung;
		});
		this.all("[data-piece]").forEach(el => {
			const state = pieceState(Number(el.dataset.in), el.dataset.out === undefined ? undefined : Number(el.dataset.out), this.rung);
			el.dataset.state = state;
			el.hidden = !isShown(state);
			if (el.matches("button")) el.disabled = state === "future";
			el.querySelectorAll("button").forEach(button => button.disabled = state === "future");
		});
		this.all("[data-description]").forEach(el => el.hidden = !this.descriptions);
		this.all("[data-concept-toggle]").forEach(button => button.setAttribute("aria-expanded", String(this.descriptions)));
		this.all("[data-piece-group]").forEach(group => {
			group.hidden = ![...group.querySelectorAll("[data-piece]")].some(piece => !piece.hidden);
		});
		this.one("[data-output-title]").textContent = step.dataset.resultTitle;
		this.one("[data-output-caption]").textContent = step.dataset.resultCaption;
		this.one("[data-generation-copy]").textContent = step.dataset.generation;
		this.all(".ed-r-rails-lab__pipeline > li").filter(el => !el.hidden)
			.flatMap(el => [...el.querySelectorAll("[data-process-number]")])
			.forEach((badge, index) => badge.textContent = index + 1);
		this.all("[data-station-reference]").forEach(reference => {
			reference.textContent = this.one(`[data-piece="${reference.dataset.stationReference}"] [data-process-number]`).textContent;
		});
		this.one("[data-live]").textContent = `Level ${this.rung + 1} of ${this.lastRung + 1}. ${step.dataset.title}`;
		this.showConnections(this.selected);
	}
	showConnections(id) {
		const station = this.all("[data-station]").find(el => el.dataset.station === id);
		const uses = new Set(station?.closest("[data-piece]").dataset.uses.split(" ") || []);
		this.all("[data-piece]").forEach(el => {
			el.toggleAttribute("data-connected", uses.has(el.dataset.piece));
			el.toggleAttribute("data-selected", el.dataset.piece === id);
		});
		this.all("[data-station]").forEach(el => el.setAttribute("aria-pressed", String(el.dataset.station === id)));
	}
}
if (!customElements.get("aids-rails-lab")) customElements.define("aids-rails-lab", RailsLab);
