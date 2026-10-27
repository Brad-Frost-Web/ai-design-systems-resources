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
 * Light-DOM Lit composition: ed-r-search-form (a real <form> — Enter and
 * the button submit natively, typed text is read from the submit event),
 * ed-toolbar, ed-select-field, ed-toggle.
 */
import { LitElement, html, render } from "lit";
import { loadIntel } from "../intel-store.js";
import { canonicalAsk, composeSpec, hydrate, validateRemoteSpec, LENSES, SUGGESTED_ASKS } from "../intent-engine.js";

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
		_engine: { state: true },
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
		this._engine = ["device", "claude", "jev"].includes(prefs.engine) ? prefs.engine : prefs.useModel ? "claude" : "device";
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
		this._controller?.abort();
		this._requestId++;
		this._prompterHost?.remove();
		this._prompterHost = null;
	}

	/**
	 * The demo script: presentation-only, hover to reveal, click to COPY the
	 * ask to the clipboard. The person recording pastes it into the field like
	 * anyone else would — the engine matches the typed text, which is the
	 * honest demonstration.
	 */
	_prompterTemplate() {
		const copy = async (ask, button) => {
			try {
				await navigator.clipboard.writeText(ask);
				button.dataset.copied = "true";
				setTimeout(() => delete button.dataset.copied, 1200);
			} catch (err) {
				console.warn("prompter: clipboard unavailable —", err.message);
			}
		};
		return html`<div class="ed-r-c-prompter" aria-hidden="true">
			<p class="ed-r-c-prompter__label">Click to copy</p>
			<ul class="ed-r-c-prompter__list">
				${SUGGESTED_ASKS.map(
					(ask) => html`<li>
						<button type="button" class="ed-r-c-prompter__ask" tabindex="-1" @click=${(e) => copy(ask, e.currentTarget)}>${ask}</button>
					</li>`,
				)}
			</ul>
		</div>`;
	}

	_emit(spec, intel) {
		this.dispatchEvent(new CustomEvent("concierge-spec", { detail: { spec, intel }, bubbles: true }));
	}

	async _ask(text) {
		const ask = (text || "").trim().slice(0, 400);
		this._controller?.abort();
		const controller = this._controller = new AbortController();
		const engine = this._engine;
		const requestId = ++this._requestId;
		this._busy = true;
		try {
			const intel = await loadIntel();
			if (requestId !== this._requestId) return;
			// 1. The floor: instant, on-device, private.
			const local = composeSpec({ ask, lens: this._lens, intel });
			this._emit(local, intel);

			// 2. The enhancement: same ask to Claude, same contract back.
			if (engine !== "device" && ask) {
				this.dispatchEvent(
					new CustomEvent("concierge-busy", {
						detail: { label: engine === "jev" ? "Asking Jev to choose the presentation…" : this._useBrain ? "Asking Claude — it may consult eddie-brain live…" : "Asking Claude to compose a view…" },
						bubbles: true,
					}),
				);
				const started = performance.now();
				try {
					const res = await fetch(COMPOSE_URL, {
						method: "POST",
						signal: AbortSignal.any([controller.signal, AbortSignal.timeout(35000)]),
						headers: { "Content-Type": "application/json" },
						// Claude gets the canonical ask too, so a typed variant and the
						// scripted line compose the same view on both engines.
						body: JSON.stringify({ ask: canonicalAsk(ask).ask, typed: ask, lens: this._lens, engine, useBrain: engine === "claude" && this._useBrain }),
					});
					if (requestId !== this._requestId) return; // a newer ask superseded this one
					if (!res.ok) throw new Error(`compose ${res.status}`);
					const remote = await res.json();
					if (requestId !== this._requestId) return;
					validateRemoteSpec(remote, intel);
					remote.engine = { ...remote.engine, latencyMs: Math.round(performance.now() - started) };
					this._emit(hydrate(remote, intel), intel);
				} catch (err) {
					if (requestId !== this._requestId) return;
					console.warn("concierge: model path unavailable, keeping on-device result —", err.message);
					const fallback = {
						...local,
						engine: { ...local.engine, attempted: engine, label: `On-device fallback · ${engine} unavailable`, detail: "The live request did not produce a usable view; local rules supplied this result.", },
						reasoning: [`${engine === "jev" ? "Jev" : "Claude"} was asked but didn't answer (${err.message}) — this is the on-device result.`, ...local.reasoning],
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

	/** The inner ed-single-field-form owns the typed value. */
	_form() {
		return this.querySelector("ed-r-search-form")?.shadowRoot?.querySelector("ed-single-field-form") || null;
	}

	_readField() {
		return this._form()?.value ?? this.querySelector("ed-r-search-form")?.value ?? "";
	}

	/**
	 * ed-single-field-form dispatches a `submit` custom event carrying the
	 * typed value (and, with no `action`, cancels native navigation). Read the
	 * value from the event — never from the recipe host's `value` property,
	 * which only flows downward and never reflects what was typed.
	 */
	_onSubmit(event) {
		event.preventDefault?.();
		const value = event.detail?.value ?? this._readField();
		this._ask(value);
	}

	async firstUpdated() {
		const recipe = this.querySelector("ed-r-search-form");
		if (recipe) {
			await recipe.updateComplete;
			const form = this._form();
			(form || recipe).addEventListener("submit", (e) => this._onSubmit(e));
		}
		this._watchToggles();
	}

	_onLensChange(event) {
		const value = event.target?.value ?? "";
		if (value === (this._lens || "")) return;
		this._lens = value || null;
		// A lens change re-runs the current ask so the stage stays honest.
		const current = this._readField();
		if (current) this._ask(current);
	}

	_onEngineChange(event) {
		const value = event.target?.value;
		if (!["device", "claude", "jev"].includes(value) || value === this._engine) return;
		this._engine = value;
		writePrefs({ engine: value, useBrain: this._useBrain });
		this._ask(this._readField());
	}

	_watchToggles() {
		const onInteract = () => setTimeout(() => {
			const useBrain = Boolean(this.querySelector("#engine-brain")?.checked);
			if (useBrain === this._useBrain) return;
			this._useBrain = useBrain;
			writePrefs({ engine: this._engine, useBrain });
			if (this._engine === "claude" && this._readField()) this._ask(this._readField());
		}, 0);
		const controls = this.querySelector(".ed-r-c-concierge__engine");
		controls?.addEventListener("click", onInteract);
		controls?.addEventListener("keyup", onInteract);
		controls?.addEventListener("change", onInteract);
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

	/** Programmatic ask — used by the constellation. */
	_suggest(text) {
		const recipe = this.querySelector("ed-r-search-form");
		if (recipe) recipe.value = text;
		const form = this._form();
		if (form) form.value = text;
		this._ask(text);
	}

	render() {
		return html`
			<div class="ed-r-c-concierge">
				<ed-r-search-form
					fieldId="concierge-ask"
					name="q"
					label="Search AI &amp; Design Systems resources"
					hideLabel
					placeholder="What would you like help with around AI &amp; Design Systems?"
					buttonText="Search"
					clearButtonText="Clear"
				></ed-r-search-form>

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
							<ed-select-field
								fieldId="concierge-engine" label="Engine"
								.items=${[{value:"device", label:"On-device · rules"}, {value:"claude", label:"Claude · composition"}, {value:"jev", label:"Jev · typed decisions"}].map(item => ({...item, selected:item.value === this._engine}))}
								.value=${this._engine} @change=${this._onEngineChange}
							></ed-select-field>
							${this._switch("engine-brain", "Consult eddie-brain live", this._useBrain, this._engine !== "claude")}
						</div>
					</ed-toolbar>
				</ed-show-hide>
			</div>

		`;
	}
}

customElements.define("ed-r-c-concierge", EdRCConcierge);
