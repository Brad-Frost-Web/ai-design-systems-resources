import "@brad-frost-web/eddie-web-components/components/layout/layout.js";
import "@brad-frost-web/eddie-web-components/components/layout-section/layout-section.js";
import "@brad-frost-web/eddie-web-components/components/icon/icon.js";
import "@brad-frost-web/eddie-web-components/components/toggle/toggle.js";
import "@brad-frost-web/eddie-web-components/components/cluster/cluster.js";
import "@brad-frost-web/eddie-web-components/components/button-group/button-group.js";
import { clampRung, rungFromSearch, pieceState, rungForKey } from "./rails-stage-state.mjs";

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
		this.all("[data-controls], [data-present], [data-settings-button]").forEach(el => el.hidden = false);
		this.readURL();
		on(this.one("[data-range]"), "input", e => this.setRung(e.target.value));
		this.all("[data-step]").forEach(el => on(el, "click", () => this.setRung(el.dataset.step)));
		on(this.one("[data-settings-button]"), "click", () => {
			const panel = this.one("[data-settings]");
			panel.hidden = !panel.hidden;
			this.one("[data-settings-button]").setAttribute("aria-expanded", String(!panel.hidden));
		});
		for (const name of ["descriptions", "future"]) {
			on(this.one(`[data-${name}]`), "change", e => {
				this[name] = e.currentTarget.checked;
				this.render(); this.writeURL();
			});
		}
		on(this.one("[data-present]"), "click", () => { this.present = !this.present; this.render(); this.writeURL(); });
		this.all("[data-station]").forEach(button => {
			on(button, "click", () => {
				this.selected = this.selected === button.dataset.station ? null : button.dataset.station;
				this.showConnections(this.selected);
			});
		});
		on(window, "popstate", () => this.readURL());
		on(document, "keydown", e => {
			if (e.key === "Escape") { this.present = false; this.render(); this.writeURL(); return; }
			if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
			if (e.composedPath().some(el => el instanceof Element && el.matches("input,select,textarea,[contenteditable=true],ed-toggle,[data-pipeline-scroll]"))) return;
			const next = rungForKey(e.key, this.rung, 10);
			if (next !== null) { e.preventDefault(); this.setRung(next); }
		});
	}
	disconnectedCallback() { cancelAnimationFrame(this.frame); this.abort?.abort(); this.ready = false; }
	readURL() {
		const params = new URLSearchParams(location.search);
		this.rung = rungFromSearch(location.search, 10);
		for (const key of ["descriptions", "future", "present"]) this[key] = params.get(key) === "1";
		this.selected = null;
		this.render();
	}
	writeURL() {
		const url = new URL(location.href);
		url.searchParams.set("rung", this.rung);
		for (const key of ["descriptions", "future", "present"]) {
			if (this[key]) url.searchParams.set(key, "1"); else url.searchParams.delete(key);
		}
		history.replaceState(null, "", url);
	}
	setRung(value) { this.rung = clampRung(value, 10); this.selected = null; this.render(); this.writeURL(); }
	render() {
		this.dataset.rung = this.rung;
		this.toggleAttribute("data-presenting", this.present);
		this.toggleAttribute("data-upcoming-visible", this.future);
		this.one("[data-present]").setAttribute("text", this.present ? "Exit presentation" : "Present");
		this.one("[data-present]").setAttribute("aria-pressed", String(this.present));
		const range = this.one("[data-range]");
		range.value = this.rung;
		const beat = this.one(`[data-beat="${this.rung}"]`);
		range.setAttribute("aria-valuetext", `${this.rung} of 10: ${beat.dataset.title}`);
		this.all("[data-beat]").forEach(el => el.hidden = Number(el.dataset.beat) !== this.rung);
		this.all("[data-step]").forEach(el => {
			el.setAttribute("aria-current", Number(el.dataset.step) === this.rung ? "step" : "false");
			el.dataset.reached = Number(el.dataset.step) <= this.rung;
		});
		this.all("[data-piece]").forEach(el => {
			const state = pieceState(Number(el.dataset.in), el.dataset.out === undefined ? undefined : Number(el.dataset.out), this.rung);
			el.dataset.state = state;
			el.hidden = state === "gone" || (state === "future" && !this.future);
			if (el.matches("button")) el.disabled = state === "future";
			el.querySelectorAll("button").forEach(button => button.disabled = state === "future");
		});
		this.all("[data-description]").forEach(el => el.hidden = !this.descriptions);
		for (const key of ["descriptions", "future"]) this.one(`[data-${key}]`).checked = this[key];
		this.one("[data-empty-concepts]").hidden = this.rung >= 1 || this.future;
		this.one("[data-empty-packages]").hidden = this.rung >= 3 || this.future;
		const outputs = this.rung >= 9 ? ["A reviewed, system-built interface.", "Required gates + human approval before main."] : this.rung >= 7 ? ["A system-built UI, with human judgment.", "Review the result. Send changes back through the loop."] : this.rung >= 5 ? ["Your ingredients. An increasingly reliable result.", "Composition is repeatable; quality still needs checking."] : this.rung >= 3 ? ["Real ingredients. Uneven results.", "Access to the system is only the beginning."] : ["A UI. Not necessarily your UI.", "The model fills in the design decisions."];
		this.one("[data-output-title]").textContent = outputs[0];
		this.one("[data-output-caption]").textContent = outputs[1];
		this.one("[data-live]").textContent = `Step ${this.rung} of 10. ${beat.dataset.title}`;
		this.showConnections(this.selected);
	}
	showConnections(id) {
		const station = this.all("[data-station]").find(el => el.dataset.station === id);
		const uses = new Set(station?.closest("[data-piece]").dataset.uses.split(" ") || []);
		this.all("[data-piece]").forEach(el => {
			el.toggleAttribute("data-connected", uses.has(el.dataset.piece));
			el.toggleAttribute("data-selected", el.dataset.piece === id);
		});
		this.all("[data-station]").forEach(el => el.setAttribute("aria-expanded", String(el.dataset.station === id)));
		this.all("[data-detail]").forEach(el => el.hidden = el.dataset.detail !== id);
		this.one("[data-details]").hidden = !id;
	}
}
if (!customElements.get("aids-rails-lab")) customElements.define("aids-rails-lab", RailsLab);
