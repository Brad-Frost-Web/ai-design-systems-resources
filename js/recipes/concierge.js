/**
 * <ed-r-c-concierge> — project-local recipe: the ask panel.
 *
 * "Search or describe what you're working on", plus one compact control
 * row: a lens for who you are, and the engine switches. Submitting always
 * runs the on-device engine first (instant, private) and emits a
 * `concierge-spec` event carrying an A2UI-shaped spec that
 * <ed-r-c-adaptive-stage> renders. With "Compose with Claude" switched on,
 * the same ask also goes to the Netlify compose function; when Claude's
 * spec comes back it replaces the on-device one — same contract, different
 * agent. If the function is unreachable the on-device result simply stands,
 * and the stage says so.
 *
 * The panel is deliberately short: the composed view is the point, and it
 * has to land above the fold. The suggested asks (SUGGESTED_ASKS, the demo
 * script) render as a presentation-only prompter fixed to the bottom-right
 * of the viewport, invisible until hovered — an affordance for the person
 * recording, not part of the page's accessible content.
 *
 * Light-DOM Lit composition: ed-search-form, ed-toolbar, ed-select-field,
 * ed-toggle.
 */
import { LitElement, html, render } from "lit";
import { loadIntel } from "../intel-store.js";
import { composeSpec, hydrate, LENSES, SUGGESTED_ASKS } from "../intent-engine.js";

const COMPOSE_URL = "/.netlify/functions/compose";
const STORAGE_KEY = "resources-concierge-engine";

function readPrefs() {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
	} catch {
		return {};
	}
}

function writePrefs(prefs) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
	} catch {
		/* private mode etc. — preferences are a convenience, not state */
	}
}

const LENS_ITEMS = [
	{ value: "", label: "No particular lens" },
	...Object.entries(LENSES).map(([value, lens]) => ({ value, label: lens.label })),
];

export class EdRCConcierge extends LitElement {
	static properties = {
		_lens: { state: true },
		_busy: { state: true },
		_useModel: { state: true },
		_useBrain: { state: true },
	};

	createRenderRoot() {
		return this;
	}

	constructor() {
		super();
		const prefs = readPrefs();
		this._lens = null;
		this._busy = false;
		this._useModel = Boolean(prefs.useModel);
		this._useBrain = Boolean(prefs.useBrain);
		this._requestId = 0;
	}

	connectedCallback() {
		super.connectedCallback();
		// Clear the no-JS fallback content (light-DOM Lit appends, not replaces).
		this.replaceChildren();
		// The prompter is fixed to the viewport, so it renders at the end of
		// <body>: inside the hero band it would sit in the band's stacking
		// context (isolation: isolate) and later, transformed stage nodes would
		// paint over it.
		if (!this._prompterHost) {
			this._prompterHost = document.createElement("div");
			this._prompterHost.className = "ed-r-c-prompter-host";
			document.body.appendChild(this._prompterHost);
		}
		render(this._prompterTemplate(), this._prompterHost);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._prompterHost?.remove();
		this._prompterHost = null;
	}

	/** The demo script: presentation-only, hover to reveal, click to ask. */
	_prompterTemplate() {
		return html`<div class="ed-r-c-prompter" aria-hidden="true">
			<p class="ed-r-c-prompter__label">Try asking</p>
			<ul class="ed-r-c-prompter__list">
				${SUGGESTED_ASKS.map(
					(ask) => html`<li>
						<button type="button" class="ed-r-c-prompter__ask" tabindex="-1" @click=${() => this._suggest(ask)}>${ask}</button>
					</li>`,
				)}
			</ul>
		</div>`;
	}

	_emit(spec, intel) {
		this.dispatchEvent(new CustomEvent("concierge-spec", { detail: { spec, intel }, bubbles: true }));
	}

	async _ask(text) {
		const ask = (text || "").trim();
		const requestId = ++this._requestId;
		this._busy = true;
		try {
			const intel = await loadIntel();
			// 1. The floor: instant, on-device, private.
			const local = composeSpec({ ask, lens: this._lens, intel });
			this._emit(local, intel);

			// 2. The enhancement: same ask to Claude, same contract back.
			if (this._useModel && ask) {
				this.dispatchEvent(
					new CustomEvent("concierge-busy", {
						detail: { label: this._useBrain ? "Asking Claude — it may consult eddie-brain live…" : "Asking Claude to compose a view…" },
						bubbles: true,
					}),
				);
				const started = performance.now();
				try {
					const res = await fetch(COMPOSE_URL, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ ask, lens: this._lens, useBrain: this._useBrain }),
					});
					if (requestId !== this._requestId) return; // a newer ask superseded this one
					if (!res.ok) throw new Error(`compose ${res.status}`);
					const remote = await res.json();
					if (!remote?.messages) throw new Error("compose returned no messages");
					remote.engine = { ...remote.engine, latencyMs: Math.round(performance.now() - started) };
					this._emit(hydrate(remote, intel), intel);
				} catch (err) {
					if (requestId !== this._requestId) return;
					console.warn("concierge: model path unavailable, keeping on-device result —", err.message);
					const fallback = {
						...local,
						reasoning: [`Claude was asked but didn't answer (${err.message}) — this is the on-device result.`, ...local.reasoning],
					};
					this._emit(fallback, intel);
				}
			}
		} catch (err) {
			console.error("concierge:", err);
		} finally {
			if (requestId === this._requestId) this._busy = false;
		}
	}

	_onSubmit(event) {
		event.preventDefault();
		const field = this.querySelector("ed-search-form");
		this._ask(field?.value ?? "");
	}

	firstUpdated() {
		// ed-search-form doesn't wrap a native <form>, so Enter and its
		// internal Search button need explicit wiring (per its guidelines:
		// "handle submission in JavaScript").
		const field = this.querySelector("ed-search-form");
		if (field) {
			field.addEventListener("keydown", (e) => {
				if (e.key === "Enter") this._onSubmit(e);
			});
			field.addEventListener("click", (e) => {
				const hit = e.composedPath().find((el) => el.classList?.contains("ed-c-search-form__button"));
				if (hit) this._onSubmit(e);
			});
		}
		this._watchToggles();
	}

	_onLensChange(event) {
		const value = event.target?.value ?? "";
		if (value === (this._lens || "")) return;
		this._lens = value || null;
		// A lens change re-runs the current ask so the stage stays honest.
		const field = this.querySelector("ed-search-form");
		if (field?.value) this._ask(field.value);
	}

	_watchToggles() {
		// ed-toggle: read state after interaction. setTimeout, not
		// requestAnimationFrame — rAF never fires in a hidden tab.
		const onInteract = () => {
			setTimeout(() => {
				const model = this.querySelector("#engine-model");
				const brain = this.querySelector("#engine-brain");
				const useModel = Boolean(model?.checked);
				const useBrain = Boolean(brain?.checked);
				if (useModel !== this._useModel || useBrain !== this._useBrain) {
					this._useModel = useModel;
					this._useBrain = useBrain && useModel;
					writePrefs({ useModel: this._useModel, useBrain: this._useBrain });
				}
			}, 0);
		};
		const engine = this.querySelector(".ed-r-c-concierge__engine");
		engine?.addEventListener("click", onInteract);
		engine?.addEventListener("keyup", onInteract);
		engine?.addEventListener("change", onInteract);
	}

	/**
	 * ed-toggle keeps its label inside the switch as an accessible name only,
	 * so the visible text sits beside it and forwards clicks to the input.
	 */
	_switch(id, text, checked, disabled) {
		const flip = () => {
			if (disabled) return;
			this.querySelector(`#${id}`)?.shadowRoot?.querySelector("input")?.click();
		};
		return html`<div class="ed-r-c-concierge__switch ${disabled ? "ed-r-c-concierge__switch--disabled" : ""}">
			<ed-toggle fieldId=${id} id=${id} label=${text} ?checked=${checked} ?disabled=${disabled}></ed-toggle>
			<span class="ed-r-c-concierge__switch-text" aria-hidden="true" @click=${flip}>${text}</span>
		</div>`;
	}

	/** Programmatic ask — used by the constellation and the demo script. */
	_suggest(text) {
		const field = this.querySelector("ed-search-form");
		if (field) field.value = text;
		this._ask(text);
	}

	render() {
		return html`
			<form class="ed-r-c-concierge" @submit=${this._onSubmit}>
				<ed-search-form
					label="Search AI &amp; Design Systems resources"
					hideLabel
					placeholder="Search or describe what you're working on"
					clearButtonText="Clear"
				></ed-search-form>

				<ed-show-hide
					class="ed-r-c-concierge__more"
					buttonText="More options"
					hideButtonText="Fewer options"
					buttonVariant="link"
					size="sm"
					iconName="chevron-down"
					iconPosition="after"
				>
					<ed-toolbar behavior="responsive" class="ed-r-c-concierge__controls">
						<div slot="left" class="ed-r-c-concierge__lens">
							<ed-select-field
								fieldId="concierge-lens"
								label="My role"
								.items=${LENS_ITEMS}
								value=${this._lens || ""}
								@change=${this._onLensChange}
							></ed-select-field>
						</div>
						<div slot="right" class="ed-r-c-concierge__engine">
							${this._switch("engine-model", "Compose with Claude", this._useModel, false)}
							${this._switch("engine-brain", "Consult eddie-brain live", this._useBrain, !this._useModel)}
						</div>
					</ed-toolbar>
				</ed-show-hide>
			</form>

		`;
	}
}

customElements.define("ed-r-c-concierge", EdRCConcierge);
