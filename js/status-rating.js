/**
 * ed-r-status-rating — project-local Eddie recipe.
 *
 * A single-select traffic-light rating: green / yellow / red, where
 * re-selecting the active option clears it. This is the interactive heart of
 * the /checklist/ inspection tool.
 *
 * Built from Eddie primitives and semantic feedback tokens
 * (--ed-theme-color-*-utility-{success,warning,error}) — no hardcoded colors.
 * Encapsulates all of its own a11y: a proper `radiogroup` with roving
 * tabindex, arrow-key navigation, `aria-checked`, and text labels so color is
 * never the only signal. Emits a composed `status-change` CustomEvent so the
 * page's central state layer (js/checklist.js) stays simple.
 *
 * Filed upstream as a recipe request: Brad-Frost-Web/eddie-design-system#943.
 * Built project-local first per AGENTS.md §2.1.1; promote when a 2nd project
 * needs it.
 */
import { EdElement } from '@brad-frost-web/eddie-web-components/components/EdElement';
import { html, unsafeCSS } from 'lit';

const STATUSES = [
  { key: 'red', token: 'error', label: 'Broken or missing — the light is ON' },
  { key: 'yellow', token: 'warning', label: 'Drift or gaps — schedule a fix' },
  { key: 'green', token: 'success', label: 'Healthy — no action needed' },
];

const styles = `
  :host { display: inline-block; }
  .ed-r-c-status-rating {
    display: inline-flex;
    gap: var(--ed-theme-spacing-xs, 0.5rem);
    padding: var(--ed-theme-spacing-xxs, 0.25rem);
  }
  .ed-r-c-status-rating__dot {
    inline-size: 1.85rem;
    block-size: 1.85rem;
    padding: 0;
    border-radius: 50%;
    border: var(--ed-theme-border-width-sm, 2px) solid var(--dot-border);
    background-color: var(--dot-bg);
    opacity: 0.55;
    cursor: pointer;
    transition:
      opacity var(--ed-theme-animation-fade-quick, 0.15s) ease,
      transform var(--ed-theme-animation-fade-quick, 0.15s) ease;
  }
  .ed-r-c-status-rating__dot--green {
    --dot-bg: var(--ed-theme-color-background-utility-success-knockout);
    --dot-border: var(--ed-theme-color-border-utility-success);
  }
  .ed-r-c-status-rating__dot--yellow {
    /* Interim: the -warning-knockout token renders muddy brown (not yellow) in
       the bfw theme — see eddie-design-system#961. Use the lighter warning
       fill until that's fixed, then restore the knockout for consistency. */
    --dot-bg: var(--ed-theme-color-background-utility-warning);
    --dot-border: var(--ed-theme-color-border-utility-warning);
  }
  .ed-r-c-status-rating__dot--red {
    --dot-bg: var(--ed-theme-color-background-utility-error-knockout);
    --dot-border: var(--ed-theme-color-border-utility-error);
  }
  .ed-r-c-status-rating__dot:hover { opacity: 0.75; }
  .ed-r-c-status-rating__dot[aria-checked='true'] {
    opacity: 1;
    transform: scale(1.1);
    box-shadow: 0 0 0 var(--ed-theme-border-width-sm, 2px) var(--dot-border);
  }
  .ed-r-c-status-rating__dot:focus-visible {
    outline: var(--ed-theme-border-width-lg, 3px) solid
      var(--ed-theme-focus-ring-color-border-default, var(--dot-border));
    outline-offset: var(--ed-theme-offset-focus-ring, 0.25rem);
  }
  .ed-u-visually-hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;

export class EdRStatusRating extends EdElement {
  static get styles() {
    return unsafeCSS(styles);
  }

  static get properties() {
    return {
      station: { type: String, reflect: true },
      value: { type: String, reflect: true },
      label: { type: String },
    };
  }

  constructor() {
    super();
    this.station = '';
    this.value = '';
    this.label = 'Station health';
  }

  _select(key) {
    // Re-selecting the active status clears it.
    this.value = this.value === key ? '' : key;
    this.dispatchEvent(
      new CustomEvent('status-change', {
        detail: { station: this.station, value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onKeydown(e) {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const dots = Array.from(
      this.shadowRoot.querySelectorAll('.ed-r-c-status-rating__dot'),
    );
    const currentIndex = dots.findIndex((d) => d.getAttribute('aria-checked') === 'true');
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const base = currentIndex === -1 ? (dir === 1 ? -1 : 0) : currentIndex;
    const next = (base + dir + dots.length) % dots.length;
    this._select(STATUSES[next].key);
    // Focus after the render settles.
    this.updateComplete.then(() => dots[next].focus());
  }

  render() {
    // Roving tabindex: the checked dot is tabbable; if none, the first is.
    const checkedIndex = STATUSES.findIndex((s) => s.key === this.value);
    const tabbableIndex = checkedIndex === -1 ? 0 : checkedIndex;

    return html`
      <div
        class="ed-r-c-status-rating"
        role="radiogroup"
        aria-label="${this.label}"
        @keydown="${this._onKeydown}"
      >
        ${STATUSES.map((s, i) => {
          const checked = this.value === s.key;
          return html`
            <button
              type="button"
              class="ed-r-c-status-rating__dot ed-r-c-status-rating__dot--${s.key}"
              role="radio"
              aria-checked="${checked ? 'true' : 'false'}"
              tabindex="${i === tabbableIndex ? '0' : '-1'}"
              title="${s.label}"
              @click="${() => this._select(s.key)}"
            >
              <span class="ed-u-visually-hidden">${s.label}</span>
            </button>
          `;
        })}
      </div>
    `;
  }
}

if (customElements.get('ed-r-status-rating') === undefined) {
  customElements.define('ed-r-status-rating', EdRStatusRating);
}
