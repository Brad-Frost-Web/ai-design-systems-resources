/**
 * <ed-r-c-adaptive-stage> — project-local recipe: the generative UI surface.
 *
 * Renders the declarative spec emitted by the concierge. This is the
 * A2UI idea in miniature: the "agent" (here, an on-device intent engine —
 * swap in a real model later, same contract) speaks JSON, never code, and
 * the renderer only honors components from a trusted catalog. Eddie is the
 * catalog. An agent can only ask for what the design system offers — that
 * constraint is the whole trick.
 *
 * Good manners: the stage shows its reasoning ("why am I seeing this?"),
 * wears its confidence on its sleeve, and the raw spec is one disclosure
 * away. The interface is ephemeral by design — nothing is stored, nothing
 * leaves the browser, and it dissolves when you do.
 */
import { LitElement, html, nothing } from "lit";
import { CATALOG, freshness } from "../intent-engine.js";

export class EdRCAdaptiveStage extends LitElement {
	static properties = {
		_spec: { state: true },
		_intel: { state: true },
		_settling: { state: true },
	};

	createRenderRoot() {
		return this;
	}

	constructor() {
		super();
		this._spec = null;
		this._intel = null;
		this._settling = false;
		this._byId = new Map();
	}

	/** Public entry: hand the stage a spec + corpus. */
	show(spec, intel) {
		this._intel = intel;
		this._byId = new Map(intel.resources.map((r) => [r.id, r]));
		this._byTerm = new Map(intel.terms.map((t) => [t.slug, t]));
		// Diffusion-flavored settle: content arrives blurred/noisy, then
		// resolves. Pure CSS (see _adaptive.scss); reduced-motion gets an
		// instant render.
		this._settling = true;
		this._spec = spec;
		this.hidden = false;
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				this._settling = false;
			})
		);
		// Move focus to the stage heading so keyboard/screen-reader users
		// land on the result they just asked for.
		setTimeout(() => this.querySelector(".ed-r-c-stage__heading")?.focus(), 60);
	}

	_resource(id) {
		return this._byId.get(id);
	}

	_renderFreshness(created) {
		const f = freshness(created);
		if (!f.label) return nothing;
		return html`<ed-badge
			text=${f.label}
			variant=${f.hot ? "success" : nothing}
			size="sm"
		></ed-badge>`;
	}

	_renderResourceCard({ id, fit }) {
		const r = this._resource(id);
		if (!r) return nothing;
		return html`
			<ed-grid-item>
				<ed-card>
					<ed-heading variant="title-sm" tagName="h4">
						<a href=${r.url} target="_blank" rel="noopener">${r.title}</a>
					</ed-heading>
					<div class="resource-tags">
						${fit != null
							? html`<ed-badge text="${fit}% fit" variant="success"></ed-badge>`
							: nothing}
						${this._renderFreshness(r.created)}
						${r.type ? html`<ed-badge text=${r.type}></ed-badge>` : nothing}
						${r.tags.slice(0, 3).map((t) => html`<ed-badge text=${t}></ed-badge>`)}
					</div>
					${r.summary
						? html`<ed-text-passage size="sm"><p>${r.summary}</p></ed-text-passage>`
						: nothing}
				</ed-card>
			</ed-grid-item>
		`;
	}

	_renderNode(node) {
		if (!CATALOG.includes(node.component)) {
			// The guardrail, visibly enforced: unknown components don't render,
			// they get named and refused.
			return html`<ed-alert
				variant="warning"
				tagName="h4"
				heading="Component “${node.component}” is not in the catalog"
			>
				<ed-text-passage size="sm">
					<p>
						The renderer only speaks the design system. Whatever asked for
						this got politely declined — that's the point.
					</p>
				</ed-text-passage>
			</ed-alert>`;
		}
		switch (node.component) {
			case "note":
				return html`<ed-alert tagName="h4" heading="Low confidence, high honesty">
					<ed-text-passage size="sm"><p>${node.props.text}</p></ed-text-passage>
				</ed-alert>`;

			case "termCards":
				return html`
					<ed-heading variant="title" tagName="h3">From the course glossary</ed-heading>
					<ed-grid variant="2up">
						${node.props.terms.map((slug) => {
							const t = this._byTerm.get(slug);
							if (!t) return nothing;
							return html`<ed-grid-item>
								<ed-card>
									<ed-heading variant="title-sm" tagName="h4">${t.term}</ed-heading>
									<ed-text-passage size="sm"><p>${t.definition}</p></ed-text-passage>
									${t.lessons.length
										? html`<ed-text-passage size="sm">
												<p>
													Revisit:
													${t.lessons.map(
														(l, i) => html`${i ? " · " : ""}<a
																href=${l.url}
																target="_blank"
																rel="noopener"
																>${l.chapter}: ${l.title}</a
															>`
													)}
												</p>
										  </ed-text-passage>`
										: nothing}
								</ed-card>
							</ed-grid-item>`;
						})}
					</ed-grid>
				`;

			case "timeline":
				return html`
					<ed-heading variant="title" tagName="h3">${node.props.heading}</ed-heading>
					<ed-timeline>
						${node.props.items.map((id) => {
							const r = this._resource(id);
							if (!r) return nothing;
							const d = r.created ? new Date(r.created) : null;
							return html`<ed-timeline-node
								text=${r.title}
								href=${r.url}
								date=${d
									? d.toLocaleDateString(undefined, {
											year: "numeric",
											month: "short",
											day: "numeric",
									  })
									: nothing}
								datetime=${r.created ?? nothing}
								headingTagName="h4"
							>
								${r.type ? html`<span slot="eyebrow">${r.type}</span>` : nothing}
								<div class="resource-tags">
									${this._renderFreshness(r.created)}
									${r.tags.slice(0, 3).map((t) => html`<ed-badge text=${t} size="sm"></ed-badge>`)}
								</div>
								${r.summary
									? html`<ed-text-passage size="sm"><p>${r.summary}</p></ed-text-passage>`
									: nothing}
							</ed-timeline-node>`;
						})}
					</ed-timeline>
				`;

			case "cardGrid":
				return html`
					<ed-heading variant="title" tagName="h3">${node.props.heading}</ed-heading>
					<ed-grid variant="3up">
						${node.props.items.map((item) => this._renderResourceCard(item))}
					</ed-grid>
				`;

			case "statRow": {
				const stats =
					node.props.stats === "collection"
						? [
								{ label: "Resources", value: this._intel.counts.resources, meta: "curated by humans in Slack" },
								{ label: "Glossary terms", value: this._intel.counts.terms, meta: "linked back to course lessons" },
								{ label: "Trackers", value: 0, meta: "none. zero. it's a static site." },
						  ]
						: [
								{ label: "Matches", value: node.props.count, meta: "ranked on-device, in your browser" },
								{ label: "Corpus", value: this._intel.counts.resources, meta: "resources considered" },
								{ label: "Round trips", value: 0, meta: "no server saw your ask" },
						  ];
				// Composed per the ed-r-stat-card canonical pattern — the recipe
				// isn't shipped in the published package yet (upstream gap).
				return html`<ed-grid variant="3up">
					${stats.map(
						(s) => html`<ed-grid-item>
							<ed-card>
								<ed-heading variant="title-sm" tagName="h4">${s.label}</ed-heading>
								<ed-heading variant="display-sm" tagName="h5">${s.value}</ed-heading>
								<ed-text-passage size="sm"><p>${s.meta}</p></ed-text-passage>
							</ed-card>
						</ed-grid-item>`
					)}
				</ed-grid>`;
			}
		}
		return nothing;
	}

	render() {
		// Empty until the concierge composes a view; then results appear.
		if (!this._spec) return nothing;

		const spec = this._spec;
		return html`
			<div
				class="ed-r-c-stage ${this._settling ? "ed-r-c-stage--settling" : "ed-r-c-stage--settled"}"
			>
				<div aria-live="polite" class="ed-u-is-vishidden">
					Assembled a view for “${spec.ask || "your lens"}”.
				</div>
				<h2 class="ed-r-c-stage__heading" tabindex="-1">
					<ed-heading variant="headline-sm" tagName="span">
						Assembled for you, just now
					</ed-heading>
				</h2>

				<div class="ed-r-c-stage__surface">
					${spec.surface.map(
						(node) => html`<div class="ed-r-c-stage__node">${this._renderNode(node)}</div>`
					)}
				</div>

				<ed-accordion class="ed-r-c-stage__meta">
					<ed-accordion-panel>
						<span slot="header">Why am I seeing this?</span>
						<ed-text-passage size="sm">
							<ul>
								${spec.reasoning.map((r) => html`<li>${r}</li>`)}
								<li>
									Confidence: ${Math.round(spec.confidence * 100)}% — under 50%
									the engine says so instead of guessing.
								</li>
								<li>
									This view is ephemeral: it was composed for this ask, in your
									browser, and is never stored. Everything in it also lives in
									<a href="#collection">the whole collection</a> below.
								</li>
							</ul>
						</ed-text-passage>
					</ed-accordion-panel>
					<ed-accordion-panel>
						<span slot="header">View the UI spec (the agent speaks JSON, not code)</span>
						<ed-text-passage size="sm">
							<p>
								The engine emitted this declarative payload — an A2UI-style
								message. The renderer maps it onto Eddie components and refuses
								anything outside the catalog
								(<code>${CATALOG.join(", ")}</code>). Swap the heuristics for a
								real model tomorrow; this contract doesn't change.
							</p>
						</ed-text-passage>
						<ed-code language="json">${JSON.stringify(spec, null, 2)}</ed-code>
					</ed-accordion-panel>
				</ed-accordion>
			</div>
		`;
	}
}

customElements.define("ed-r-c-adaptive-stage", EdRCAdaptiveStage);
