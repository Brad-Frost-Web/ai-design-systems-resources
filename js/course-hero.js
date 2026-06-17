/**
 * Pre-compiled course-hero recipe for the AI & Design Systems course website.
 * Source: @brad-frost-web/eddie-recipes/recipes/ai-and-design-systems-course-website/course-hero
 *
 * This is a build-time compiled version with inlined CSS.
 * The canonical source lives in the eddie-design-system monorepo.
 */
import { EdElement } from '@brad-frost-web/eddie-web-components/components/EdElement';
import { html, unsafeCSS, svg } from 'lit';

const styles = `:root,:host{--size-base-unit: 0.5rem}*,::slotted(*),*:before,*:after{box-sizing:border-box}h1,h2,h3,h4,h5,h6{margin:0}.ed-r-c-course-hero{display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--ed-theme-color-background-knockout);height:50vh;font-family:var(--ed-theme-typography-headline-default-font-family);position:relative;overflow:hidden;text-align:center;color:var(--ed-theme-color-text-knockout)}.ed-r-c-course-hero--compact{height:32vh}.ed-r-c-course-hero__container{pointer-events:none;position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;padding:calc(.5rem*2)}::slotted(ed-heading),::slotted(h1),::slotted(h2){font-size:clamp(4rem,15vw,20rem) !important;line-height:1.1 !important;margin:0 0 -1rem !important;text-transform:uppercase;color:var(--ed-theme-color-text-knockout)}.ed-r-c-course-hero__eyebrow{margin-block-end:calc(.5rem*1);font-family:var(--ed-theme-typography-body-default-font-family);font-size:calc(.5rem*2);opacity:.8}.ed-r-c-course-hero__logos{display:flex;align-items:center;gap:calc(.5rem*2);margin-block-start:calc(.5rem*1)}.ed-r-c-course-hero__bg{position:absolute;height:calc(100% + 80vh);left:-10vw;top:-40vh;width:calc(100% + 20vw)}.ed-r-c-course-hero__bg path{transition:fill .05s ease-in-out}.ed-r-c-course-hero__triangle{fill:var(--ed-r-course-hero-triangle-default, #eae1b3)}.ed-r-c-course-hero__triangle-dark{fill:var(--ed-r-course-hero-triangle-secondary, #dfd18b)}.ed-r-c-course-hero__triangle--highlight{fill:var(--ed-r-course-hero-triangle-highlight, rgba(162, 158, 94, 0.15))}`;

export class EdRCourseHero extends EdElement {
  static get styles() {
    return unsafeCSS(styles);
  }

  static get properties() {
    return {
      compact: { type: Boolean, reflect: true }
    };
  }

  static _accentColors = [
    'var(--ed-theme-color-background-accent-1)',
    'var(--ed-theme-color-background-accent-2)',
    'var(--ed-theme-color-background-accent-3)',
    'var(--ed-theme-color-background-accent-4)',
    'var(--ed-theme-color-background-accent-5)',
    'var(--ed-theme-color-background-accent-6)',
    'var(--ed-theme-color-background-accent-7)',
    'var(--ed-theme-color-background-accent-8)',
  ];

  constructor() {
    super();
    this.compact = false;
  }

  /**
   * Resolve a CSS custom property to its computed RGB value.
   * Needed because inline style.fill can't use CSS variables directly.
   */
  _resolveColor(cssVar) {
    const el = document.createElement('div');
    el.style.setProperty('color', cssVar);
    document.body.appendChild(el);
    const resolved = getComputedStyle(el).color;
    document.body.removeChild(el);
    return resolved;
  }

  /**
   * After first render, attach mouseenter/mouseleave hover handlers
   * to each SVG triangle path for the interactive color animation.
   */
  firstUpdated() {
    const bg = this.shadowRoot?.querySelector('.ed-r-c-course-hero__bg');
    if (!bg) return;

    const paths = bg.querySelectorAll('path');
    const colors = EdRCourseHero._accentColors;

    paths.forEach((path) => {
      const originalFill = getComputedStyle(path).fill || '#EAE1B3';
      const randomCssVar = colors[Math.floor(Math.random() * colors.length)];
      const resolvedColor = this._resolveColor(randomCssVar);

      path.addEventListener('mouseenter', () => {
        path.style.fill = resolvedColor;
      });

      path.addEventListener('mouseleave', () => {
        path.style.fill = originalFill;
      });
    });
  }

  _renderBackground() {
    return svg`
      <svg
        class="ed-r-c-course-hero__bg"
        width="6019"
        height="8015"
        viewBox="0 0 6019 8015"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path class="ed-r-c-course-hero__triangle" d="M3007.22 4009H7.2207L3007.22 8009V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3007.22 4009H7.2207L3007.22 7809V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3007.22 4009H7.2207L3007.22 7609V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3007.22 4009H7.2207L3007.22 7409V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3007.22 4009H7.2207L3007.22 7209V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3007.22 4009H7.2207L3007.22 7009V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle ed-r-c-course-hero__triangle--highlight" d="M3007.22 4009H7.2207L3007.22 6809V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3007.22 4009H7.2207L3007.22 6609V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3007.22 4009H7.2207L3007.22 6409V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3007.22 4009H7.2207L3007.22 6209V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3007.22 4009H7.2207L3007.22 6009V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3007.22 4009H7.2207L3007.22 5809V4009Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 5609L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 5409L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 5209L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 5009L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 4809L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 4609L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 4409L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 4209L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle ed-r-c-course-hero__triangle--highlight" d="M3008.22 4008.5L3.7207 4002.5L3007.22 4009L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 3809L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 3609L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 3409L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 3209L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 3009L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 2809L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 2609L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.22 4008.5L3.7207 4002.5L3007.22 2209L3008.22 4008.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3011.72 4007L6011.72 4007L3011.72 2007L3011.72 4007Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3011.72 4007L6011.72 4007L3011.72 2207L3011.72 4007Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6015.22 4013.5L3011.72 2407L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6015.22 4013.5L3011.72 2607L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6015.22 4013.5L3011.72 2807L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6015.22 4013.5L3011.72 3007L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6015.22 4013.5L3011.72 3207L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6015.22 4013.5L3011.72 3407L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6015.22 4013.5L3011.72 3607L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6015.22 4013.5L3011.72 3807L3010.72 4007.5Z"/>
        <path d="M3010.72 4007.5L3011.72 3807L6015.22 4013.5M6015.22 4013.5L3010.72 4007.5L3011.72 3807L6015.22 4013.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.72 4006H8.7207L3008.72 6V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.72 4006H8.7207L3008.72 206V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.72 4006H8.7207L3008.72 406V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path d="M3008.72 4006H8.7207L3008.72 606V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.72 4006H8.7207L3008.72 806V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.72 4006H8.7207L3008.72 1006V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle ed-r-c-course-hero__triangle--highlight" d="M3008.72 4006H8.7207L3008.72 1206V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.72 4006H8.7207L3008.72 1406V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.72 4006H8.7207L3008.72 1606V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.72 4006H8.7207L3008.72 1806V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.72 4006H8.7207L3008.72 2006V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3008.72 4006H8.7207L3008.72 2206V4006Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3009.72 4006.5L5.2207 4012.5L3008.72 2406L3009.72 4006.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3009.72 4006.5L5.2207 4012.5L3008.72 2606L3009.72 4006.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3009.72 4006.5L5.2207 4012.5L3008.72 2806L3009.72 4006.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3009.72 4006.5L5.2207 4012.5L3008.72 3006L3009.72 4006.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3009.72 4006.5L5.2207 4012.5L3008.72 3206L3009.72 4006.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3009.72 4006.5L5.2207 4012.5L3008.72 3406L3009.72 4006.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3009.72 4006.5L5.2207 4012.5L3008.72 3606L3009.72 4006.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle" d="M3009.72 4006.5L5.2207 4012.5L3008.72 3806L3009.72 4006.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path d="M3009.72 4006.5L3008.72 3806L5.2207 4012.5M5.2207 4012.5L3009.72 4006.5L3008.72 3806L5.2207 4012.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6010.72 4007.5L3010.72 8007.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6010.72 4007.5L3010.72 7807.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6010.72 4007.5L3010.72 7607.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6010.72 4007.5L3010.72 7407.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6010.72 4007.5L3010.72 7207.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark ed-r-c-course-hero__triangle--highlight" d="M3010.72 4007.5L6010.72 4007.5L3010.72 7007.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6010.72 4007.5L3010.72 6807.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6010.72 4007.5L3010.72 6607.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6010.72 4007.5L3010.72 6407.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6010.72 4007.5L3010.72 6207.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6010.72 4007.5L3010.72 6007.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3010.72 4007.5L6010.72 4007.5L3010.72 5807.5L3010.72 4007.5Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3011.72 4007L6015.22 4013.5L3010.72 5607.5L3011.72 4007Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3011.72 4007L6015.22 4013.5L3010.72 5407.5L3011.72 4007Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3011.72 4007L6015.22 4013.5L3010.72 5207.5L3011.72 4007Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3011.72 4007L6015.22 4013.5L3010.72 5007.5L3011.72 4007Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3011.72 4007L6015.22 4013.5L3010.72 4807.5L3011.72 4007Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3011.72 4007L6015.22 4013.5L3010.72 4607.5L3011.72 4007Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3011.72 4007L6015.22 4013.5L3010.72 4407.5L3011.72 4007Z" stroke="#A29E5E" stroke-width="4"/>
        <path class="ed-r-c-course-hero__triangle-dark" d="M3011.72 4007L6015.22 4013.5L3010.72 4207.5L3011.72 4007Z" stroke="#A29E5E" stroke-width="4"/>
      </svg>
    `;
  }

  render() {
    const componentClassName = this.componentClassNames('ed-r-c-course-hero', {
      'ed-r-c-course-hero--compact': this.compact,
    });

    return html`
      <div class="${componentClassName}">
        <div class="ed-r-c-course-hero__container">
          <slot></slot>
          <div class="ed-r-c-course-hero__eyebrow">
            <slot name="eyebrow"></slot>
          </div>
          <div class="ed-r-c-course-hero__logos">
            <slot name="logos"></slot>
          </div>
        </div>
        ${this._renderBackground()}
      </div>
    `;
  }
}

if (customElements.get('ed-r-course-hero') === undefined) {
  customElements.define('ed-r-course-hero', EdRCourseHero);
}
