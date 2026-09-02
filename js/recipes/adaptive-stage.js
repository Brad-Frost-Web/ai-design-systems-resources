/**
 * <ed-r-c-adaptive-stage> — project-local recipe: the generative UI surface.
 *
 * Renders an A2UI-shaped message list (beginRendering → surfaceUpdate →
 * dataModelUpdate) emitted by whichever agent composed it: the on-device
 * heuristics or Claude behind the Netlify compose function. The renderer
 * doesn't care which. It walks the surface's flat adjacency list from the
 * root, binds each component to the data model, and maps it onto Eddie —
 * and only Eddie. Anything outside the catalog (which itself came from
 * eddie-brain) is named and refused, visibly. An agent can only ask for
 * what the design system offers; that constraint is the whole trick.
 *
 * Good manners: a one-paragraph summary always leads; the stage shows its
 * reasoning ("why am I seeing this?"), wears its engine and confidence on
 * its sleeve, and the raw messages + the catalog are one disclosure away.
 */
import { LitElement, html, nothing } from "lit";
import { FALLBACK_CATALOG, freshness } from "../intent-engine.js";

const CHAPTER_VARIANT = ["accent-1", "accent-2", "accent-3", "accent-4", "accent-5", "accent-6", "accent-7", "accent-8"];

function domainOf(url) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return "";
	}
}

function shortDate(iso) {
	if (!iso) return "";
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function clip(text, n = 160) {
	if (!text) return "";
	return text.length > n ? `${text.slice(0, n).replace(/\s+\S*$/, "")}…` : text;
}

export class EdRCAdaptiveStage extends LitElement {
	static properties = {
		_spec: { state: true },
		_settling: { state: true },
		busy: { type: Boolean, reflect: true },
		busyLabel: { type: String },
	};

	createRenderRoot() {
		return this;
	}

	constructor() {
		super();
		this._spec = null;
		this._intel = null;
		this._data = { lessons: {}, resources: {}, terms: {} };
		this._settling = false;
		this.busy = false;
		this.busyLabel = "Asking Claude to compose a view…";
	}

	/** Public entry: hand the stage a spec (A2UI messages) + the corpus. */
	show(spec, intel) {
		this._intel = intel;
		this._catalog = intel?.catalog?.nodes?.length ? intel.catalog.nodes.map((n) => n.node) : FALLBACK_CATALOG;
		const dm = spec.messages?.find((m) => m.dataModelUpdate)?.dataModelUpdate?.contents;
		this._data = { lessons: {}, resources: {}, terms: {}, ...(dm || {}) };
		// Diffusion-flavored settle: content arrives displaced, then resolves.
		// Pure CSS (see _adaptive.scss); reduced-motion gets an instant render.
		this._settling = true;
		this._spec = spec;
		this.busy = false;
		this.hidden = false;
		// setTimeout rather than requestAnimationFrame: rAF never fires in a
		// hidden tab, which would leave the nodes parked at opacity 0.
		setTimeout(() => {
			this._settling = false;
		}, 40);
		setTimeout(() => this.querySelector(".ed-r-c-stage__heading")?.focus(), 60);
	}

	/* ---------------------------------------------------------------------- */
	/* Data binding                                                            */
	/* ---------------------------------------------------------------------- */

	_lesson(id) {
		return this._data.lessons[id];
	}
	_resource(id) {
		return this._data.resources[id];
	}
	_term(slug) {
		return this._data.terms[slug];
	}
	_surface() {
		return this._spec?.messages?.find((m) => m.surfaceUpdate)?.surfaceUpdate;
	}
	_component(id) {
		return this._surface()?.components?.find((c) => c.id === id);
	}

	/* ---------------------------------------------------------------------- */
	/* Shared pieces                                                           */
	/* ---------------------------------------------------------------------- */

	_freshnessTag(created) {
		const f = freshness(created);
		if (!f.label) return nothing;
		return html`<ed-tag text=${f.label} variant=${f.hot ? "success" : nothing} size="sm"></ed-tag>`;
	}

	_lessonCard(id) {
		const l = this._lesson(id);
		if (!l) return nothing;
		const presenters = (l.presenters || []).join(" & ");
		return html`
			<ed-grid-item>
				<ed-card class="ed-r-c-lesson">
					<p class="ed-r-c-lesson__eyebrow">
						<span>Course lesson</span>
						${l.chapter ? html`<ed-tag text=${l.chapter} size="sm" variant=${CHAPTER_VARIANT[(l.chapterNumber ?? 0) % 8] ? nothing : nothing}></ed-tag>` : nothing}
						<span class="ed-r-c-lesson__number">${l.number}</span>
					</p>
					<ed-heading variant="title-sm" tagName="h4">
						<a href=${l.url} target="_blank" rel="noopener">${l.title}</a>
					</ed-heading>
					${presenters ? html`<p class="ed-r-c-lesson__meta">with ${presenters}</p>` : nothing}
					${l.summary ? html`<ed-text-passage size="sm"><p>${clip(l.summary, 170)}</p></ed-text-passage>` : nothing}
					<p class="ed-r-c-lesson__meta ed-r-c-lesson__meta--footer">Opens on courses.bradfrost.com ↗</p>
				</ed-card>
			</ed-grid-item>
		`;
	}

	/* ---------------------------------------------------------------------- */
	/* Nodes                                                                   */
	/* ---------------------------------------------------------------------- */

	_renderNode(node) {
		if (!node) return nothing;
		if (node.component === "Column") {
			return html`${(node.children || []).map(
				(id) => html`<div class="ed-r-c-stage__node">${this._renderNode(this._component(id))}</div>`,
			)}`;
		}
		if (!this._catalog.includes(node.component)) {
			// The guardrail, visibly enforced: unknown components don't render,
			// they get named and refused.
			return html`<ed-alert variant="warning" tagName="h3" heading="“${node.component}” is not in the catalog">
				<ed-text-passage size="sm">
					<p>
						The renderer only speaks the design system. Whatever asked for this got politely
						declined — that's the point.
					</p>
				</ed-text-passage>
			</ed-alert>`;
		}
		const p = node.props || {};
		switch (node.component) {
			case "summary":
				return this._renderSummary(p);
			case "videoGrid":
				return this._renderVideoGrid(p);
			case "definition":
				return this._renderDefinition(p);
			case "resourceTimeline":
				return this._renderTimeline(p);
			case "table":
				return this._renderTable(p);
			case "tabs":
				return this._renderTabs(p);
			case "barChart":
				return this._renderChart(p);
			case "statRow":
				return this._renderStats(p);
			case "note":
				return html`<ed-alert tagName="h3" heading=${p.heading || "A note"}>
					<ed-text-passage size="sm"><p>${p.text}</p></ed-text-passage>
				</ed-alert>`;
		}
		return nothing;
	}

	_renderSummary(p) {
		const e = this._spec.engine || {};
		return html`
			<div class="ed-r-c-summary">
				<ed-text-passage size="lg" capLinelength>
					<p>${p.text}</p>
				</ed-text-passage>
				<p class="ed-r-c-summary__engine">
					<ed-tag text=${e.label || "Engine"} variant=${e.kind === "claude" ? "brand" : "info"} size="sm"></ed-tag>
					${e.kind === "claude" && e.trace?.length
						? html`<ed-tag text="${e.trace.length} eddie-brain call${e.trace.length === 1 ? "" : "s"}" size="sm"></ed-tag>`
						: nothing}
					<span>${e.latencyMs != null ? `${(e.latencyMs / 1000).toFixed(e.latencyMs < 1000 ? 2 : 1)}s` : ""}</span>
				</p>
			</div>
		`;
	}

	_renderVideoGrid(p) {
		const items = (p.items || []).filter((id) => this._lesson(id));
		if (!items.length) return nothing;
		return html`
			<ed-heading variant="title" tagName="h3">${p.heading || "Course lessons"}</ed-heading>
			<ed-grid variant="3up">${items.map((id) => this._lessonCard(id))}</ed-grid>
		`;
	}

	_renderDefinition(p) {
		const terms = (p.terms || []).map((s) => this._term(s)).filter(Boolean);
		if (!terms.length) return nothing;
		return html`${terms.map(
			(t) => html`
				<article class="ed-r-c-definition">
					<p class="ed-r-c-definition__eyebrow">
						<span>From the course glossary</span>
						${t.status === "in-progress" ? html`<ed-tag variant="info" text="In progress" size="sm"></ed-tag>` : nothing}
					</p>
					<ed-heading variant="headline-sm" tagName="h3">${t.term}</ed-heading>
					${t.aliases?.length ? html`<p class="ed-r-c-definition__aliases">also: ${t.aliases.join(", ")}</p>` : nothing}
					<ed-text-passage capLinelength><p>${t.definition}</p></ed-text-passage>
					${t.lessons?.length
						? html`<p class="ed-r-c-definition__label">Taught in</p>
								<ed-tag-list>
									${t.lessons.map(
										(l) => html`<ed-tag behavior="link"
											><a href=${l.url} target="_blank" rel="noopener">${l.number ? `${l.number} · ` : ""}${l.title}</a></ed-tag
										>`,
									)}
								</ed-tag-list>`
						: nothing}
				</article>
			`,
		)}`;
	}

	_renderTimeline(p) {
		const items = (p.items || []).filter((id) => this._resource(id));
		if (!items.length) return nothing;
		return html`
			<ed-heading variant="title" tagName="h3">${p.heading || "From the collection"}</ed-heading>
			<ed-timeline>
				${items.map((id) => {
					const r = this._resource(id);
					return html`<ed-r-timeline-node-link
						text=${r.title}
						href=${r.url}
						datetime=${r.created ?? nothing}
						date=${shortDate(r.created) || nothing}
						meta=${domainOf(r.url) || nothing}
						headingTagName="h4"
					>
						<div class="resource-tags">
							${r.essential ? html`<ed-tag text="Essential reading" variant="brand" size="sm"></ed-tag>` : nothing}
							${this._freshnessTag(r.created)}
							${r.type ? html`<ed-tag text=${r.type} size="sm"></ed-tag>` : nothing}
							${(r.tags || []).slice(0, 3).map((t) => html`<ed-tag text=${t} size="sm"></ed-tag>`)}
						</div>
						${r.summary ? html`<ed-text-passage size="sm"><p>${clip(r.summary, 220)}</p></ed-text-passage>` : nothing}
					</ed-r-timeline-node-link>`;
				})}
			</ed-timeline>
		`;
	}

	_renderTable(p) {
		const items = (p.items || []).filter((id) => this._resource(id));
		if (!items.length) return nothing;
		return html`
			<ed-heading variant="title" tagName="h3">${p.heading || "Side by side"}</ed-heading>
			<ed-table variant="zebra" hoverRows fullWidth label=${p.heading || "Comparison"}>
				<ed-table-header>
					<ed-table-row>
						<ed-table-header-cell>Resource</ed-table-header-cell>
						<ed-table-header-cell>Type</ed-table-header-cell>
						<ed-table-header-cell>Topics</ed-table-header-cell>
						<ed-table-header-cell>Added</ed-table-header-cell>
						<ed-table-header-cell>Essential</ed-table-header-cell>
					</ed-table-row>
				</ed-table-header>
				<ed-table-body>
					${items.map((id) => {
						const r = this._resource(id);
						return html`<ed-table-row>
							<ed-table-cell><a href=${r.url} target="_blank" rel="noopener">${r.title}</a></ed-table-cell>
							<ed-table-cell>${r.type || "—"}</ed-table-cell>
							<ed-table-cell>${(r.tags || []).slice(0, 4).join(", ") || "—"}</ed-table-cell>
							<ed-table-cell>${shortDate(r.created) || "—"}</ed-table-cell>
							<ed-table-cell>${r.essential ? "★ yes" : ""}</ed-table-cell>
						</ed-table-row>`;
					})}
				</ed-table-body>
			</ed-table>
		`;
	}

	_renderTabs(p) {
		const groups = (p.groups || []).map((g) => ({ ...g, items: (g.items || []).filter((id) => this._lesson(id)) })).filter((g) => g.items.length);
		if (!groups.length) return nothing;
		return html`
			<ed-heading variant="title" tagName="h3">${p.heading || "By chapter"}</ed-heading>
			<ed-tabs>
				${groups.map(
					(g, i) => html`<ed-tab href="tab-${i}" label=${g.label}>
						<ed-grid variant="3up">${g.items.map((id) => this._lessonCard(id))}</ed-grid>
					</ed-tab>`,
				)}
			</ed-tabs>
		`;
	}

	_renderChart(p) {
		const data = { labels: p.labels || [], datasets: (p.datasets || []).map((d) => ({ label: d.label, values: d.values })) };
		if (!data.labels.length) return nothing;
		return html`
			<ed-heading variant="title" tagName="h3">${p.heading || "By the numbers"}</ed-heading>
			<ed-r-bar-chart
				.data=${data}
				orientation=${p.orientation || "vertical"}
				chartLabel=${p.chartLabel || p.heading || "Chart"}
			></ed-r-bar-chart>
		`;
	}

	_renderStats(p) {
		const counts = this._intel?.counts || {};
		const e = this._spec.engine || {};
		const remote = e.kind === "claude";
		let stats;
		if (p.stats === "collection" || !p.counts) {
			stats = [
				{ label: "Resources", value: counts.resources ?? 0, meta: `${counts.essential ?? 0} flagged essential reading` },
				{ label: "Course lessons", value: counts.lessons ?? 0, meta: "pointers to published videos" },
				{ label: "Glossary terms", value: counts.terms ?? 0, meta: "wired back to lessons" },
			];
		} else {
			stats = [
				{ label: "Lessons matched", value: p.counts.lessons ?? 0, meta: "course videos, weighted first" },
				{ label: "Resources matched", value: p.counts.resources ?? 0, meta: `of ${counts.resources ?? 0} in the collection` },
				{ label: "Round trips", value: remote ? 1 : 0, meta: remote ? "your ask went to Claude; nothing stored" : "no server saw your ask" },
			];
		}
		return html`<ed-grid variant="3up">
			${stats.map(
				(s) => html`<ed-grid-item>
					<ed-r-stat-card label=${s.label} meta=${s.meta} headingTagName="h4">${s.value}</ed-r-stat-card>
				</ed-grid-item>`,
			)}
		</ed-grid>`;
	}

	/* ---------------------------------------------------------------------- */
	/* Disclosure panels                                                       */
	/* ---------------------------------------------------------------------- */

	_renderTrace() {
		const e = this._spec.engine || {};
		if (!e.trace?.length) return nothing;
		return html`<li>
			Claude consulted eddie-brain live:
			<ul>
				${e.trace.map(
					(t) => html`<li><code>${t.tool}</code>(${t.input ? JSON.stringify(t.input) : ""})${t.result ? html` → ${clip(t.result, 140)}` : ""}</li>`,
				)}
			</ul>
		</li>`;
	}

	_renderCatalogPanel() {
		const cat = this._intel?.catalog;
		if (!cat?.nodes?.length) return nothing;
		return html`<ed-accordion-panel>
			<span slot="header">The catalog — what the engine may ask for (from eddie-brain)</span>
			<ed-text-passage size="sm">
				<p>
					These are the only shapes the renderer will build. The list wasn't typed by hand: it was generated by
					asking <strong>${cat.server}</strong> at <code>${cat.source}</code> for each component's intent and
					guidelines (${shortDate(cat.generated)}). The design system defines the vocabulary; the agent chooses
					from it.
				</p>
			</ed-text-passage>
			<ed-table variant="zebra" fullWidth label="Component catalog">
				<ed-table-header>
					<ed-table-row>
						<ed-table-header-cell>Node</ed-table-header-cell>
						<ed-table-header-cell>Eddie components</ed-table-header-cell>
						<ed-table-header-cell>When the engine reaches for it</ed-table-header-cell>
					</ed-table-row>
				</ed-table-header>
				<ed-table-body>
					${cat.nodes.map(
						(n) => html`<ed-table-row>
							<ed-table-cell><code>${n.node}</code></ed-table-cell>
							<ed-table-cell>${n.components.join(", ")}</ed-table-cell>
							<ed-table-cell>${n.use}</ed-table-cell>
						</ed-table-row>`,
					)}
				</ed-table-body>
			</ed-table>
		</ed-accordion-panel>`;
	}

	render() {
		if (this.busy && !this._spec) {
			return html`<div class="ed-r-c-stage__busy" role="status">
				<ed-loading-indicator></ed-loading-indicator>
				<span>${this.busyLabel}</span>
			</div>`;
		}
		if (!this._spec) return nothing;

		const spec = this._spec;
		const root = this._component("root");
		const e = spec.engine || {};
		return html`
			<div class="ed-r-c-stage ${this._settling ? "ed-r-c-stage--settling" : "ed-r-c-stage--settled"}">
				<div aria-live="polite" class="ed-u-is-vishidden">Assembled a view for “${spec.ask || "your lens"}”.</div>
				<h2 class="ed-r-c-stage__heading" tabindex="-1">
					<ed-heading variant="headline-sm" tagName="span">Assembled for you, just now</ed-heading>
				</h2>

				${this.busy
					? html`<div class="ed-r-c-stage__busy" role="status">
							<ed-loading-indicator></ed-loading-indicator>
							<span>${this.busyLabel}</span>
					  </div>`
					: nothing}

				<div class="ed-r-c-stage__surface">${this._renderNode(root)}</div>

				<ed-accordion class="ed-r-c-stage__meta">
					<ed-accordion-panel>
						<span slot="header">Why am I seeing this?</span>
						<ed-text-passage size="sm">
							<ul>
								<li>Engine: ${e.label}${e.model ? ` (${e.model})` : ""} — ${e.detail || ""}</li>
								${spec.reasoning.map((r) => html`<li>${r}</li>`)}
								${this._renderTrace()}
								<li>
									Confidence: ${Math.round(spec.confidence * 100)}% — under 50% the engine says so instead of
									guessing.
								</li>
								<li>
									This view is ephemeral: composed for this ask and never stored. Everything in it also lives in
									<a href="#collection">the whole collection</a> below.
								</li>
							</ul>
						</ed-text-passage>
					</ed-accordion-panel>
					<ed-accordion-panel>
						<span slot="header">The messages — the agent speaks JSON, not code (A2UI-shaped)</span>
						<ed-text-passage size="sm">
							<p>
								Three messages, in A2UI's own vocabulary: <code>beginRendering</code> names the surface,
								<code>surfaceUpdate</code> is a flat adjacency list of components and ids, and
								<code>dataModelUpdate</code> carries the records those components bind to. The agent emitted
								structure and ids; the corpus supplied the data; Eddie supplied the rendering. Swap the engine
								and this contract doesn't change.
							</p>
						</ed-text-passage>
						<ed-code language="json">${JSON.stringify(spec.messages, null, 2)}</ed-code>
					</ed-accordion-panel>
					${this._renderCatalogPanel()}
				</ed-accordion>
			</div>
		`;
	}
}

customElements.define("ed-r-c-adaptive-stage", EdRCAdaptiveStage);
