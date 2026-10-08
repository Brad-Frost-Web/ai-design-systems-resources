/**
 * ed-r-c-rails-stage — project-local recipe for Keep AI on the Rails (#33).
 *
 * An HTML Web Component (AGENTS.md §2.12): the server renders every rung and
 * the whole diagram as readable light-DOM HTML, so the page tells the full
 * story with JavaScript off. This element enhances it in place into a
 * stepper: one rung at a time, the diagram assembling itself as pieces are
 * added, a range input, arrow/Home/End/number keys, and a ?rung= URL that
 * always matches the screen. Rung changes animate with the
 * View Transitions API where it exists and motion is allowed.
 *
 * Markup contract (see demos/keep-ai-on-the-rails.njk):
 *   [data-rails-controls]  hidden until enhanced
 *   [data-rails-range]     <input type="range">
 *   [data-rails-live]      polite live region
 *   [data-rails-rung]      one per rung, in order
 *   [data-rails-piece]     diagram pieces with data-rung-in / data-rung-out
 *   [data-rails-group]     diagram groups with data-rung-in
 */
import {
	clampRung,
	rungFromSearch,
	pieceState,
	isShown,
	rungForKey,
} from "./rails-stage-state.mjs";

const reducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

class EdRCRailsStage extends HTMLElement {
	connectedCallback() {
		if (this._enhanced) return;
		this._enhanced = true;

		this.rungs = [...this.querySelectorAll("[data-rails-rung]")];
		this.pieces = [...this.querySelectorAll("[data-rails-piece]")];
		this.groups = [...this.querySelectorAll("[data-rails-group]")];
		this.range = this.querySelector("[data-rails-range]");
		this.live = this.querySelector("[data-rails-live]");
		this.ticks = [...this.querySelectorAll("[data-rails-tick]")];
		this.lastRung = this.rungs.length - 1;
		if (this.lastRung < 0 || !this.range) return;

		// Each piece keeps one identity across rungs, so a View Transition can
		// move it rather than cross-fade it.
		for (const piece of this.pieces) {
			piece.style.viewTransitionName = `rails-${piece.dataset.railsPiece}`;
		}

		this.querySelector("[data-rails-controls]")?.removeAttribute("hidden");
		this.classList.add("is-enhanced");

		this.range.addEventListener("input", () => this.go(this.range.value));
		for (const tick of this.ticks) {
			tick.addEventListener("click", () => this.go(tick.dataset.railsTick));
		}
		this._onKey = (event) => this.onKey(event);
		document.addEventListener("keydown", this._onKey);

		this.rung = rungFromSearch(window.location.search, this.lastRung);
		this.render({ announce: false });
	}

	disconnectedCallback() {
		document.removeEventListener("keydown", this._onKey);
		this._enhanced = false;
	}

	onKey(event) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		// The range input steps itself with arrows; leave typing alone.
		const target = event.target;
		if (target === this.range) return;
		if (target.closest?.("input, textarea, select, [contenteditable]")) return;
		const rung = rungForKey(event.key, this.rung, this.lastRung);
		if (rung === null) return;
		event.preventDefault();
		this.go(rung);
	}

	go(value) {
		const rung = clampRung(value, this.lastRung);
		if (rung === this.rung) return;
		this.rung = rung;
		const url = new URL(window.location.href);
		url.searchParams.set("rung", String(rung));
		window.history.replaceState(null, "", url);

		if (document.startViewTransition && !reducedMotion()) {
			document.startViewTransition(() => this.render());
		} else {
			this.render();
		}
	}

	render({ announce = true } = {}) {
		const rung = this.rung;
		this.dataset.rung = String(rung);

		this.rungs.forEach((el, i) => {
			el.hidden = i !== rung;
		});

		for (const piece of this.pieces) {
			const state = pieceState(
				Number(piece.dataset.rungIn),
				piece.dataset.rungOut === undefined ? undefined : Number(piece.dataset.rungOut),
				rung,
			);
			piece.dataset.state = state;
			piece.hidden = !isShown(state);
		}
		for (const group of this.groups) {
			group.hidden = rung < Number(group.dataset.rungIn);
		}
		// Ticks are pointer shortcuts beside the range input, which carries
		// the same choice for keyboards and assistive technology.
		this.ticks.forEach((tick, i) => {
			tick.dataset.state = i < rung ? "past" : i === rung ? "current" : "future";
		});

		const title = this.rungs[rung]?.dataset.railsTitle ?? "";
		const valuetext = `Step ${rung} of ${this.lastRung}: ${title}`;
		this.range.value = String(rung);
		this.range.style.setProperty("--_ratio", String(this.lastRung ? rung / this.lastRung : 0));
		this.range.setAttribute("aria-valuetext", valuetext);
		if (announce && this.live) this.live.textContent = valuetext;
	}
}

if (!customElements.get("ed-r-c-rails-stage")) {
	customElements.define("ed-r-c-rails-stage", EdRCRailsStage);
}
