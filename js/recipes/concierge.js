/**
 * <ed-r-c-concierge> — project-local recipe: the ask panel.
 *
 * "Search or describe what you're working on" + a lens for who you are.
 * Submitting always runs the on-device engine first (instant, private) and
 * emits a `concierge-spec` event carrying an A2UI-shaped spec that
 * <ed-r-c-adaptive-stage> renders. With "Compose with Claude" switched on,
 * the same ask also goes to the Netlify compose function; when Claude's
 * spec comes back it replaces the on-device one — same contract, different
 * agent. If the function is unreachable the on-device result simply stands,
 * and the stage says so.
 *
 * Light-DOM Lit composition: ed-search-form, ed-radio-field, ed-toggle,
 * ed-button.
 */
import { LitElement, html } from "lit";
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
		this._watchLens();
		this._watchToggles();
	}

	_setLens(key) {
		this._lens = key || null;
		const field = this.querySelector("ed-search-form");
		if (field?.value) this._ask(field.value);
	}

	_watchLens() {
		// ed-radio-field-item doesn't re-dispatch its shadow change event
		// (upstream gap — filed): detect selection by reading checked state.
		const onInteract = () => {
			requestAnimationFrame(() => {
				const checked = [...this.querySelectorAll('ed-radio-field-item[name="concierge-lens"]')].find((item) => item.checked);
				const value = checked?.getAttribute("value") ?? "";
				if (value !== (this._lens || "")) this._setLens(value);
			});
		};
		const lenses = this.querySelector(".ed-r-c-concierge__lenses");
		lenses?.addEventListener("click", onInteract);
		lenses?.addEventListener("keyup", onInteract);
	}

	_watchToggles() {
		// Same defensive pattern for ed-toggle: read state after interaction.
		const onInteract = () => {
			requestAnimationFrame(() => {
				const model = this.querySelector("#engine-model");
				const brain = this.querySelector("#engine-brain");
				const useModel = Boolean(model?.checked);
				const useBrain = Boolean(brain?.checked);
				if (useModel !== this._useModel || useBrain !== this._useBrain) {
					this._useModel = useModel;
					this._useBrain = useBrain && useModel;
					writePrefs({ useModel: this._useModel, useBrain: this._useBrain });
				}
			});
		};
		const engine = this.querySelector(".ed-r-c-concierge__engine");
		engine?.addEventListener("click", onInteract);
		engine?.addEventListener("keyup", onInteract);
		engine?.addEventListener("change", onInteract);
	}

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

				<div class="ed-r-c-concierge__suggestions">
					<ul class="ed-r-c-concierge__suggestion-list" role="list" aria-label="Questions students actually ask">
						${SUGGESTED_ASKS.map(
							(s) => html`<li>
								<ed-button variant="bare" size="sm" text=${s} ?isLoading=${this._busy} @click=${() => this._suggest(s)}></ed-button>
							</li>`,
						)}
					</ul>
				</div>

				<ed-accordion>
					<ed-accordion-panel>
						<span slot="header">My role is…</span>
						<div class="ed-r-c-concierge__lenses">
							<ed-radio-field label="My role">
								<ed-radio-field-item name="concierge-lens" fieldId="lens-none" value="" ?checked=${!this._lens}>
									No particular lens
								</ed-radio-field-item>
								${Object.entries(LENSES).map(
									([key, lens]) => html`
										<ed-radio-field-item name="concierge-lens" fieldId="lens-${key}" value=${key} ?checked=${this._lens === key}>
											${lens.label}
										</ed-radio-field-item>
									`,
								)}
							</ed-radio-field>
						</div>
					</ed-accordion-panel>
					<ed-accordion-panel>
						<span slot="header">Engine: ${this._useModel ? (this._useBrain ? "Claude + eddie-brain live" : "Claude") : "on-device"}</span>
						<div class="ed-r-c-concierge__engine">
							<ed-text-passage size="sm" capLinelength>
								<p>
									Off, every ask is answered by deterministic heuristics in your browser — nothing leaves the
									page. On, the same ask also goes to Claude through a small function, which composes the view
									from the same catalog. One round trip; nothing is stored.
								</p>
							</ed-text-passage>
							<ed-toggle fieldId="engine-model" id="engine-model" label="Compose with Claude" ?checked=${this._useModel}></ed-toggle>
							<ed-toggle
								fieldId="engine-brain"
								id="engine-brain"
								label="Let Claude consult eddie-brain live (slower, shows the tool calls)"
								?checked=${this._useBrain}
								?disabled=${!this._useModel}
							></ed-toggle>
						</div>
					</ed-accordion-panel>
				</ed-accordion>
			</form>
		`;
	}
}

customElements.define("ed-r-c-concierge", EdRCConcierge);
