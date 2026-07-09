/**
 * Interactive design-system inspection checklist — state + scoring layer.
 *
 * The presentation is pure Eddie: the traffic light is the `ed-r-status-rating`
 * recipe, notes are `ed-textarea-field`, and the scoreboard is a row of
 * `ed-r-score-gauge` recipes (one per quality plus an overall).
 *
 * Scoring is Lighthouse-inspired. Each station scores by its rating —
 * green 100, yellow 50, red 0. A quality's score is the mean of its rated
 * stations; the overall score is the mean of every rated station. Unrated
 * stations are excluded from the denominator so a partial inspection still
 * reads sensibly (with an "N of 10 rated" note). Everything persists to
 * localStorage so an inspection survives a reload.
 *
 * Progressive enhancement: without JS the page is a fully readable checklist;
 * this script only adds the interactive scoring layer on top.
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
	const STATUS_SCORE = { green: 100, yellow: 50, red: 0 };

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

	// quality id -> [station ids], read off the station cards.
	const qualityStations = {};
	cards.forEach((el, id) => {
		const q = el.dataset.quality;
		if (!q) return;
		(qualityStations[q] = qualityStations[q] || []).push(id);
	});

	const overallGauge = root.querySelector("ed-r-score-gauge[data-overall]");
	const qualityGauges = new Map(
		Array.from(root.querySelectorAll("ed-r-score-gauge[data-quality]")).map(
			(el) => [el.dataset.quality, el],
		),
	);

	const totalStations = cards.size;

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

	function statusOf(stationId) {
		return state[stationId] && state[stationId].status;
	}

	function mean(nums) {
		if (!nums.length) return null;
		return nums.reduce((a, b) => a + b, 0) / nums.length;
	}

	// Mean score across a set of station ids, ignoring unrated ones.
	function scoreFor(stationIds) {
		const scored = stationIds
			.map((id) => {
				const s = statusOf(id);
				return s ? STATUS_SCORE[s] : null;
			})
			.filter((n) => n !== null);
		return mean(scored);
	}

	// ── Rendering ────────────────────────────────────────────────────────
	function renderResult(stationId) {
		const status = statusOf(stationId);
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

	function renderScore() {
		const counts = { green: 0, yellow: 0, red: 0, unset: 0 };
		cards.forEach((_, stationId) => {
			const status = statusOf(stationId);
			if (status && counts[status] !== undefined) counts[status]++;
			else counts.unset++;
		});

		root.querySelectorAll("[data-count]").forEach((el) => {
			el.textContent = counts[el.dataset.count];
		});
		root.querySelectorAll("[data-score]").forEach((el) => {
			el.textContent = counts.green;
		});
		const ratedEl = root.querySelector("[data-rated-count]");
		if (ratedEl) ratedEl.textContent = totalStations - counts.unset;

		// Overall gauge = mean across every rated station.
		if (overallGauge) overallGauge.value = scoreFor(Array.from(cards.keys()));

		// Per-quality gauges.
		qualityGauges.forEach((gauge, qualityId) => {
			gauge.value = scoreFor(qualityStations[qualityId] || []);
		});
	}

	// ── Status ratings ───────────────────────────────────────────────────
	root.addEventListener("status-change", (e) => {
		const { station, value } = e.detail;
		if (!station) return;
		if (!state[station]) state[station] = {};
		state[station].status = value || null;
		save();
		renderResult(station);
		renderScore();
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

	// ── Scoreboard actions ───────────────────────────────────────────────
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
				renderScore();
			}
		});
	}

	// ── Initial paint ────────────────────────────────────────────────────
	ratings.forEach((el, id) => {
		const saved = statusOf(id);
		if (saved) el.value = saved;
		renderResult(id);
	});
	root.querySelectorAll("ed-textarea-field[data-notes]").forEach((field) => {
		const saved = state[field.dataset.notes] && state[field.dataset.notes].notes;
		if (saved) field.value = saved;
	});
	renderScore();
})();
