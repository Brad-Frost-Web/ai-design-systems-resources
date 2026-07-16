/**
 * <ed-r-c-constellation> — project-local recipe: the supercharged tag cloud.
 *
 * The relationship graph Brad and Felix sketched in the resource-page
 * huddle: every tag in the corpus becomes a star sized by how many
 * resources reference it; co-occurrence draws the constellation lines.
 * Built at runtime from /intel.json — no manual curation, quality floats
 * to the top by reference weight.
 *
 * Accessibility-first rendering: the "stars" are real <button> elements
 * (keyboard, focus, screen-reader names for free) positioned over a purely
 * decorative SVG line layer. Activating a star asks the concierge about
 * that topic.
 */
import { LitElement, html, nothing } from "lit";
import { loadIntel } from "../intel-store.js";

const MAX_NODES = 22;
const MIN_EDGE_WEIGHT = 3;
const MAX_EDGES = 36;

export class EdRCConstellation extends LitElement {
	static properties = {
		_nodes: { state: true },
		_edges: { state: true },
	};

	createRenderRoot() {
		return this;
	}

	constructor() {
		super();
		this._nodes = [];
		this._edges = [];
	}

	connectedCallback() {
		super.connectedCallback();
		// Clear the no-JS fallback content: light-DOM Lit appends its render
		// after existing children rather than replacing them.
		this.replaceChildren();
		this._build();
	}

	async _build() {
		const intel = await loadIntel();
		const counts = new Map();
		const pairs = new Map();

		for (const r of intel.resources) {
			const tags = [...new Set(r.tags)];
			for (const t of tags) counts.set(t, (counts.get(t) || 0) + 1);
			for (let i = 0; i < tags.length; i++) {
				for (let j = i + 1; j < tags.length; j++) {
					const key = [tags[i], tags[j]].sort().join("␟");
					pairs.set(key, (pairs.get(key) || 0) + 1);
				}
			}
		}

		const top = [...counts.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, MAX_NODES);
		const included = new Set(top.map(([t]) => t));
		const maxCount = top[0]?.[1] || 1;

		// Deterministic sunflower layout: heaviest star at the center,
		// the rest spiral outward on the golden angle. Same data, same sky.
		const GOLDEN = Math.PI * (3 - Math.sqrt(5));
		this._nodes = top.map(([tag, count], i) => {
			// Heaviest star dead center; the rest start one clear ring out so
			// the big central labels don't collide.
			const r = i === 0 ? 0 : 16 + 30 * Math.sqrt(i / top.length);
			const theta = i * GOLDEN;
			return {
				tag,
				count,
				x: 50 + r * Math.cos(theta),
				y: 50 + r * 0.86 * Math.sin(theta), // slight vertical squash
				weight: count / maxCount,
			};
		});

		const nodeByTag = new Map(this._nodes.map((n) => [n.tag, n]));
		this._edges = [...pairs.entries()]
			.map(([key, w]) => {
				const [a, b] = key.split("␟");
				return { a: nodeByTag.get(a), b: nodeByTag.get(b), w };
			})
			.filter((e) => e.a && e.b && included.has(e.a.tag) && included.has(e.b.tag) && e.w >= MIN_EDGE_WEIGHT)
			.sort((x, y) => y.w - x.w)
			.slice(0, MAX_EDGES);
	}

	_sizeClass(weight) {
		if (weight > 0.66) return "ed-r-c-constellation__star--xl";
		if (weight > 0.4) return "ed-r-c-constellation__star--lg";
		if (weight > 0.18) return "ed-r-c-constellation__star--md";
		return "";
	}

	_activate(tag) {
		this.dispatchEvent(
			new CustomEvent("constellation-ask", {
				detail: { ask: `Show me the latest on ${tag}` },
				bubbles: true,
			})
		);
	}

	render() {
		if (!this._nodes.length) {
			return html`<div class="ed-r-c-constellation" aria-hidden="true">
				<ed-skeleton size="xxl"></ed-skeleton>
			</div>`;
		}
		return html`
			<div
				class="ed-r-c-constellation"
				role="group"
				aria-label="Topic constellation: ${this._nodes.length} topics sized by how many resources reference them. Activate a topic to ask the concierge about it."
			>
				<svg class="ed-r-c-constellation__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
					${this._edges.map(
						(e) => html`<line
							x1=${e.a.x}
							y1=${e.a.y}
							x2=${e.b.x}
							y2=${e.b.y}
							style="opacity: ${Math.min(0.5, 0.08 + e.w / 40)}"
						></line>`
					)}
				</svg>
				${this._nodes.map(
					(n) => html`<button
						type="button"
						class="ed-r-c-constellation__star ${this._sizeClass(n.weight)}"
						style="left: ${n.x}%; top: ${n.y}%;"
						aria-label="${n.tag} — ${n.count} resources. Ask the concierge about this topic."
						@click=${() => this._activate(n.tag)}
					>
						${n.tag}
						<span class="ed-r-c-constellation__count">${n.count}</span>
					</button>`
				)}
			</div>
		`;
	}
}

customElements.define("ed-r-c-constellation", EdRCConstellation);
