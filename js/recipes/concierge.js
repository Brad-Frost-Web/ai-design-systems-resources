/**
 * <ed-r-c-concierge> — project-local recipe: the ask panel.
 *
 * "Describe what you're wrestling with" + a lens for who you are. Submitting
 * runs the on-device intent engine over the machine-readable corpus and
 * emits a `concierge-spec` event carrying the declarative UI spec that
 * <ed-r-c-adaptive-stage> renders. The Felix ask (problem → matched options
 * with a fit score) and the Vincent ask (pick your profile, filter to it)
 * from #ai-and-design-systems, made real.
 *
 * Light-DOM Lit composition: ed-search-form, ed-radio-field, ed-button.
 */
import { LitElement, html } from "lit";
import { loadIntel } from "../intel-store.js";
import { composeSpec, LENSES, SUGGESTED_ASKS } from "../intent-engine.js";

export class EdRCConcierge extends LitElement {
	static properties = {
		_lens: { state: true },
		_busy: { state: true },
	};

	createRenderRoot() {
		return this;
	}

	constructor() {
		super();
		this._lens = null;
		this._busy = false;
	}

	connectedCallback() {
		super.connectedCallback();
		// Clear the no-JS fallback content (light-DOM Lit appends, not replaces).
		this.replaceChildren();
	}

	async _ask(text) {
		const ask = (text || "").trim();
		this._busy = true;
		try {
			const intel = await loadIntel();
			const spec = composeSpec({ ask, lens: this._lens, intel });
			this.dispatchEvent(
				new CustomEvent("concierge-spec", {
					detail: { spec, intel },
					bubbles: true,
				})
			);
		} catch (err) {
			console.error("concierge:", err);
		} finally {
			this._busy = false;
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
		if (!field) return;
		field.addEventListener("keydown", (e) => {
			if (e.key === "Enter") this._onSubmit(e);
		});
		field.addEventListener("click", (e) => {
			const hit = e
				.composedPath()
				.find((el) => el.classList?.contains("ed-c-search-form__button"));
			if (hit) this._onSubmit(e);
		});
		this._watchLens();
	}

	_setLens(key) {
		this._lens = key || null;
		// A lens change re-runs the current ask so the stage stays honest.
		const field = this.querySelector("ed-search-form");
		if (field?.value) this._ask(field.value);
	}

	_watchLens() {
		// ed-radio-field-item doesn't re-dispatch its shadow change event
		// (upstream gap — filed): detect selection by reading checked state.
		const onInteract = () => {
			requestAnimationFrame(() => {
				const checked = [
					...this.querySelectorAll('ed-radio-field-item[name="concierge-lens"]'),
				].find((item) => item.checked);
				const value = checked?.getAttribute("value") ?? "";
				if (value !== (this._lens || "")) this._setLens(value);
			});
		};
		const lenses = this.querySelector(".ed-r-c-concierge__lenses");
		lenses?.addEventListener("click", onInteract);
		lenses?.addEventListener("keyup", onInteract);
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
					variant="display"
				></ed-search-form>

				<div class="ed-r-c-concierge__lenses">
					<ed-radio-field label="Looking through the lens of…">
						<ed-radio-field-item
							name="concierge-lens"
							fieldId="lens-none"
							value=""
							?checked=${!this._lens}
						>
							No particular lens
						</ed-radio-field-item>
						${Object.entries(LENSES).map(
							([key, lens]) => html`
								<ed-radio-field-item
									name="concierge-lens"
									fieldId="lens-${key}"
									value=${key}
									?checked=${this._lens === key}
								>
									${lens.label}
								</ed-radio-field-item>
							`
						)}
					</ed-radio-field>
				</div>

				<div class="ed-r-c-concierge__suggestions">
					<ed-text-passage size="sm">
						<p>Or start from what the community keeps asking:</p>
					</ed-text-passage>
					<ul class="ed-r-c-concierge__suggestion-list" role="list">
						${SUGGESTED_ASKS.map(
							(s) => html`<li>
								<ed-button
									variant="bare"
									size="sm"
									text=${s}
									?isLoading=${this._busy}
									@click=${() => this._suggest(s)}
								></ed-button>
							</li>`
						)}
					</ul>
				</div>
			</form>
		`;
	}
}

customElements.define("ed-r-c-concierge", EdRCConcierge);
