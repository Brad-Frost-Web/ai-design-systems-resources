/**
 * ed-r-score-gauge — project-local Eddie recipe.
 *
 * A Lighthouse-style circular score gauge (0–100) with a colored ring and a
 * high-contrast number. Drives the /checklist/ scoreboard: one gauge per
 * quality plus an overall gauge.
 *
 * Scoring is Lighthouse-inspired: <50 red, 50–89 amber, 90–100 green. Color is
 * never the only signal — the number is always shown, and the ring is paired
 * with an aria-label. A null value renders an empty track with an em dash
 * ("not yet rated").
 *
 * Colors come from Eddie tokens. The amber band uses the accent token as an
 * interim until bfw's warning color is fixed (eddie-design-system#961). This
 * is the project-local realization of the scoring-dashboard recipe gap
 * (eddie-design-system#945); promote upstream when a 2nd project needs it.
 */
import { EdElement } from '@brad-frost-web/eddie-web-components/components/EdElement';
import { html, svg, unsafeCSS } from 'lit';

const RADIUS = 52;
const CIRC = 2 * Math.PI * RADIUS;
const SIZES = { sm: 68, md: 92, lg: 128 };

const styles = `
  :host { display: inline-block; }
  .ed-r-c-score-gauge {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  .ed-r-c-score-gauge__svg {
    inline-size: var(--gauge-size, 92px);
    block-size: var(--gauge-size, 92px);
  }
  .ed-r-c-score-gauge__track {
    fill: none;
    stroke: var(--ed-theme-color-border-subtle);
    stroke-width: 9;
  }
  .ed-r-c-score-gauge__meter {
    fill: none;
    stroke: var(--gauge-color, var(--ed-theme-color-border-default));
    stroke-width: 9;
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
  }
  .ed-r-c-score-gauge__num {
    fill: var(--ed-theme-color-content-default);
    font-family: var(--ed-theme-typography-headline-default-font-family);
    font-weight: 700;
    font-size: 36px;
  }
  .ed-r-c-score-gauge__label {
    font-family: var(--ed-theme-typography-label-default-font-family);
    font-size: 0.8rem;
    line-height: 1.2;
    text-align: center;
    color: var(--ed-theme-color-content-default);
    max-inline-size: 11ch;
  }
`;

export class EdRScoreGauge extends EdElement {
  static get styles() {
    return unsafeCSS(styles);
  }

  static get properties() {
    return {
      value: { type: Number },
      label: { type: String },
      size: { type: String },
    };
  }

  constructor() {
    super();
    this.value = null;
    this.label = '';
    this.size = 'md';
  }

  _color(v) {
    if (v == null) return 'var(--ed-theme-color-border-default)';
    if (v >= 90) return 'var(--ed-theme-color-background-utility-success-knockout)';
    if (v >= 50) return 'var(--ed-theme-color-background-accent-4)';
    return 'var(--ed-theme-color-background-utility-error-knockout)';
  }

  render() {
    const v = this.value;
    const hasValue = v != null && !Number.isNaN(v);
    const pct = hasValue ? Math.max(0, Math.min(100, v)) : 0;
    const offset = CIRC * (1 - pct / 100);
    const display = hasValue ? String(Math.round(v)) : '–';
    const px = SIZES[this.size] || SIZES.md;
    const aria = `${this.label}: ${hasValue ? Math.round(v) + ' out of 100' : 'not yet rated'}`;

    return html`
      <div
        class="ed-r-c-score-gauge"
        style="--gauge-size:${px}px; --gauge-color:${this._color(hasValue ? v : null)};"
        role="img"
        aria-label="${aria}"
      >
        ${svg`
          <svg class="ed-r-c-score-gauge__svg" viewBox="0 0 120 120" aria-hidden="true">
            <circle class="ed-r-c-score-gauge__track" cx="60" cy="60" r="${RADIUS}"></circle>
            <circle
              class="ed-r-c-score-gauge__meter"
              cx="60" cy="60" r="${RADIUS}"
              style="stroke-dasharray:${CIRC}; stroke-dashoffset:${offset};"
            ></circle>
            <text
              class="ed-r-c-score-gauge__num"
              x="60" y="60"
              text-anchor="middle"
              dominant-baseline="central"
            >${display}</text>
          </svg>
        `}
        <span class="ed-r-c-score-gauge__label">${this.label}</span>
      </div>
    `;
  }
}

if (customElements.get('ed-r-score-gauge') === undefined) {
  customElements.define('ed-r-score-gauge', EdRScoreGauge);
}
