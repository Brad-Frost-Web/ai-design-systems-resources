/**
 * Interactive design-system inspection checklist — state layer.
 *
 * Drives the /checklist/ page. The presentation is pure Eddie: the traffic
 * light is the `ed-r-status-rating` recipe, notes are `ed-textarea-field`, the
 * score is `ed-progress`, tallies are `ed-badge`. This module owns only the
 * state: it seeds each control from localStorage, listens for the components'
 * events, aggregates the score, and mirrors results — so an inspection
 * survives a reload.
 *
 * Progressive enhancement: without JS the page is a fully readable checklist;
 * this script only adds the scoring layer on top.
 */
(function () {
	const root = document.querySelector("[data-checklist]");
	if (!root) return;

	const STORAGE_KEY = "ds-inspection:v1";
	const STATUS_VARIANT = { green: "success", yellow: "warning", red: "error" };
	const STATUS_LABELS = {
		green: "Healthy",
		yellow: "Needs attention",
		red: "The light is ON",
	};

	const state = load();

	const ratings = new Map(
		Array.from(root.querySelectorAll("ed-r-status-rating[data-rating]")).map(
			(el) => [el.getAttribute("station"), el],
		),
	);
	const cards = new Map(
		Array.from(root.querySelectorAll("[data-station-card]")).map((el) => [
			el.dataset.stationCard,
			el,
		]),
	);

	function load() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
		} catch {
			return {};
		}
	}

	function save() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch {
			/* storage unavailable (private mode); stay in-memory */
		}
	}

	// ── Rendering ────────────────────────────────────────────────────────
	function renderResult(stationId) {
		const status = state[stationId] && state[stationId].status;
		const card = cards.get(stationId);
		if (card) {
			if (status) card.setAttribute("data-state", status);
			else card.removeAttribute("data-state");
		}

		const badge = root.querySelector(`ed-badge[data-result="${stationId}"]`);
		if (badge) {
			badge.setAttribute("text", status ? STATUS_LABELS[status] : "Not yet rated");
			if (status) badge.setAttribute("variant", STATUS_VARIANT[status]);
			else badge.removeAttribute("variant");
		}
	}

	function renderDashboard() {
		const counts = { green: 0, yellow: 0, red: 0, unset: 0 };
		ratings.forEach((_, stationId) => {
			const status = state[stationId] && state[stationId].status;
			if (status && counts[status] !== undefined) counts[status]++;
			else counts.unset++;
		});

		root.querySelectorAll("[data-count]").forEach((el) => {
			el.textContent = counts[el.dataset.count];
		});
		root.querySelectorAll("[data-score]").forEach((el) => {
			el.textContent = counts.green;
		});
		const bar = root.querySelector("[data-score-bar]");
		if (bar) bar.value = counts.green;
	}

	// ── Status ratings ───────────────────────────────────────────────────
	root.addEventListener("status-change", (e) => {
		const { station, value } = e.detail;
		if (!station) return;
		if (!state[station]) state[station] = {};
		state[station].status = value || null;
		save();
		renderResult(station);
		renderDashboard();
	});

	// ── Notes ────────────────────────────────────────────────────────────
	root.addEventListener("input", (e) => {
		const field = e.target.closest("ed-textarea-field[data-notes]");
		if (!field) return;
		const id = field.dataset.notes;
		if (!state[id]) state[id] = {};
		state[id].notes = field.value;
		save();
	});

	// ── Dashboard actions ────────────────────────────────────────────────
	const dashboard = root.querySelector("[data-dashboard]");
	if (dashboard) {
		dashboard.hidden = false;
		dashboard.addEventListener("click", (e) => {
			const btn = e.target.closest("[data-action]");
			if (!btn) return;
			const action = btn.dataset.action;

			if (action === "expand" || action === "collapse") {
				root
					.querySelectorAll("details[data-details]")
					.forEach((d) => (d.open = action === "expand"));
			} else if (action === "print") {
				window.print();
			} else if (action === "reset") {
				if (!window.confirm("Clear all ratings and notes for this inspection?"))
					return;
				for (const key of Object.keys(state)) delete state[key];
				save();
				ratings.forEach((el) => (el.value = ""));
				root
					.querySelectorAll("ed-textarea-field[data-notes]")
					.forEach((f) => (f.value = ""));
				cards.forEach((_, id) => renderResult(id));
				renderDashboard();
			}
		});
	}

	// ── Initial paint ────────────────────────────────────────────────────
	ratings.forEach((el, id) => {
		const saved = state[id] && state[id].status;
		if (saved) el.value = saved;
		renderResult(id);
	});
	root.querySelectorAll("ed-textarea-field[data-notes]").forEach((field) => {
		const saved = state[field.dataset.notes] && state[field.dataset.notes].notes;
		if (saved) field.value = saved;
	});
	renderDashboard();
})();
