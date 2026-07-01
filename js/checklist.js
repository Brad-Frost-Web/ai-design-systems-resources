/**
 * Interactive design-system inspection checklist.
 *
 * Drives the /checklist/ page: each of the ten stations gets a green/yellow/red
 * health rating plus a free-text note, all persisted to localStorage so a
 * student's inspection survives a reload. A sticky dashboard tallies the score
 * live, and the results table at the bottom mirrors every rating.
 *
 * Progressive enhancement: without JS the page is a fully readable checklist;
 * this script only adds the interactive scoring layer on top.
 */
(function () {
	const root = document.querySelector("[data-checklist]");
	if (!root) return;

	const STORAGE_KEY = "ds-inspection:v1";
	const STATUSES = ["green", "yellow", "red"];
	const STATUS_LABELS = {
		green: "Healthy",
		yellow: "Needs attention",
		red: "The light is ON",
	};

	const state = load();

	const controls = Array.from(root.querySelectorAll(".status-control"));
	const cards = new Map(
		Array.from(root.querySelectorAll("[data-station-card]")).map((el) => [
			el.dataset.stationCard,
			el,
		]),
	);
	const totalStations = controls.length;

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

	// ── Status ratings ──────────────────────────────────────────────────
	function setStatus(stationId, status) {
		if (!state[stationId]) state[stationId] = {};
		// Clicking the active status again clears it.
		state[stationId].status =
			state[stationId].status === status ? null : status;
		save();
		renderStation(stationId);
		renderDashboard();
	}

	function renderStation(stationId) {
		const status = state[stationId] && state[stationId].status;

		const control = root.querySelector(
			`.status-control[data-station="${stationId}"]`,
		);
		if (control) {
			control.querySelectorAll(".status-dot").forEach((dot) => {
				dot.setAttribute(
					"aria-checked",
					String(dot.dataset.status === status),
				);
				dot.classList.toggle("is-selected", dot.dataset.status === status);
			});
		}

		const card = cards.get(stationId);
		if (card) {
			if (status) card.setAttribute("data-state", status);
			else card.removeAttribute("data-state");
		}

		// Results-table mirror.
		const resultDot = root.querySelector(`[data-result="${stationId}"]`);
		const resultLabel = root.querySelector(
			`[data-result-label="${stationId}"]`,
		);
		if (resultDot) {
			STATUSES.forEach((s) =>
				resultDot.classList.remove(`status-dot--${s}`),
			);
			resultDot.classList.toggle("is-selected", Boolean(status));
			if (status) resultDot.classList.add(`status-dot--${status}`);
		}
		if (resultLabel) {
			resultLabel.textContent = status
				? STATUS_LABELS[status]
				: "Not yet rated";
		}
	}

	function renderDashboard() {
		const counts = { green: 0, yellow: 0, red: 0, unset: 0 };
		cards.forEach((_, stationId) => {
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
	}

	// ── Notes ───────────────────────────────────────────────────────────
	function renderNotes() {
		root.querySelectorAll("[data-notes]").forEach((field) => {
			const id = field.dataset.notes;
			field.value = (state[id] && state[id].notes) || "";
		});
	}

	// ── Wiring ──────────────────────────────────────────────────────────
	controls.forEach((control) => {
		control.addEventListener("click", (e) => {
			const dot = e.target.closest(".status-dot");
			if (!dot) return;
			setStatus(control.dataset.station, dot.dataset.status);
		});
		// Keyboard: arrow keys move through the three options.
		control.addEventListener("keydown", (e) => {
			if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key))
				return;
			e.preventDefault();
			const dots = Array.from(control.querySelectorAll(".status-dot"));
			const current = dots.findIndex(
				(d) => d.getAttribute("aria-checked") === "true",
			);
			const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
			const next = (current + dir + dots.length) % dots.length;
			dots[next].focus();
			setStatus(control.dataset.station, dots[next].dataset.status);
		});
	});

	root.querySelectorAll("[data-notes]").forEach((field) => {
		field.addEventListener("input", () => {
			const id = field.dataset.notes;
			if (!state[id]) state[id] = {};
			state[id].notes = field.value;
			save();
		});
	});

	// Dashboard actions.
	const dashboard = root.querySelector("[data-dashboard]");
	if (dashboard) {
		dashboard.hidden = false;
		dashboard.addEventListener("click", (e) => {
			const btn = e.target.closest("[data-action]");
			if (!btn) return;
			const action = btn.dataset.action;

			if (action === "expand" || action === "collapse") {
				root
					.querySelectorAll(".station__details")
					.forEach((d) => (d.open = action === "expand"));
			} else if (action === "print") {
				window.print();
			} else if (action === "reset") {
				if (
					!window.confirm(
						"Clear all ratings and notes for this inspection?",
					)
				)
					return;
				for (const key of Object.keys(state)) delete state[key];
				save();
				cards.forEach((_, id) => renderStation(id));
				renderNotes();
				renderDashboard();
			}
		});
	}

	// ── Initial paint ───────────────────────────────────────────────────
	cards.forEach((_, id) => renderStation(id));
	renderNotes();
	renderDashboard();
})();
