/**
 * Resource filtering logic
 * Listens to ed-select-field change events and filters the card grid + category list
 */
(function () {
	const filterType = document.getElementById("filter-type");
	const filterTag = document.getElementById("filter-tag");
	const filterSource = document.getElementById("filter-source");
	const grid = document.getElementById("resource-grid");
	const categoryList = document.querySelector(".resource-category-list");

	if (!filterType || !filterTag || !grid) return;

	function applyFilters() {
		const selectedType = filterType.value || "";
		const selectedTag = filterTag.value || "";
		const selectedSource = filterSource ? filterSource.value || "" : "";

		// Filter card grid
		const items = grid.querySelectorAll(".resource-grid-item");
		items.forEach((item) => {
			const itemType = item.dataset.type || "";
			const itemTags = item.dataset.tags || "";
			const itemSource = item.dataset.source || "";

			const matchesType = !selectedType || itemType === selectedType;
			const matchesTag =
				!selectedTag || itemTags.split(",").includes(selectedTag);
			const matchesSource = !selectedSource || itemSource === selectedSource;

			item.style.display = matchesType && matchesTag && matchesSource ? "" : "none";
		});

		// Filter category sections (show only the selected tag's section, or all)
		if (categoryList) {
			const sections = categoryList.querySelectorAll("ed-grid-item");
			sections.forEach((section) => {
				if (!selectedTag) {
					section.style.display = "";
				} else {
					const heading = section.querySelector("ed-heading");
					const sectionTag = heading
						? heading.textContent.trim().toLowerCase()
						: "";
					section.style.display =
						sectionTag === selectedTag.toLowerCase() ? "" : "none";
				}
			});
		}
	}

	// ed-select-field fires standard 'change' events
	filterType.addEventListener("change", applyFilters);
	filterTag.addEventListener("change", applyFilters);
	if (filterSource) filterSource.addEventListener("change", applyFilters);
})();

/**
 * Mobile nav toggle for the site header.
 * On small screens the primary nav is hidden until the menu button is tapped,
 * which toggles `.is-active` on the header (CSS reveals the nav container).
 * At ≥48rem the nav is always visible and the button is hidden.
 */
(function () {
	const header = document.getElementById("site-header");
	const button = document.getElementById("site-header-menu-button");

	if (!header || !button) return;

	button.addEventListener("click", () => {
		const isActive = header.classList.toggle("is-active");
		button.setAttribute("aria-expanded", String(isActive));
	});
})();

/**
 * Inspection wizard → sticky status bar → filtered work order (/stations/).
 *
 * Two-step model:
 *   1. A wizard sets a red/yellow/green light per station — either by hand or by
 *      pasting a report from the `ds-inspection` skill (we parse its inspection
 *      sheet). Confirming saves the profile to localStorage.
 *   2. A sticky status bar summarizes the profile; the page shows a prioritized
 *      work order of resources for the flagged stations. Reds outrank yellows,
 *      weighted by our classification confidence.
 */
(function () {
	const form = document.getElementById("diagnose");
	const wizard = document.getElementById("wizard");
	const out = document.getElementById("work-order");
	const list = document.getElementById("work-order-list");
	const lead = document.getElementById("work-order-lead");
	const startPanel = document.getElementById("inspection-start");
	const bar = document.getElementById("inspection-bar");
	if (!form || !wizard || !out || !list) return;

	const startBtn = document.getElementById("start-btn");
	const closeBtn = document.getElementById("wizard-close");
	const cancelBtn = document.getElementById("wizard-cancel");
	const confirmBtn = document.getElementById("wizard-confirm");
	const editBtn = document.getElementById("bar-edit");
	const clearBtn = document.getElementById("bar-clear");
	const modeManual = document.getElementById("mode-manual");
	const modePaste = document.getElementById("mode-paste");
	const panelManual = document.getElementById("panel-manual");
	const panelPaste = document.getElementById("panel-paste");
	const parseBtn = document.getElementById("parse-report");
	const reportInput = document.getElementById("report-input");
	const parseMsg = document.getElementById("parse-msg");
	const barTally = document.getElementById("bar-tally");
	const barChips = document.getElementById("bar-chips");
	const browseAll = document.getElementById("browse-all");

	const STORE_KEY = "ds-inspection-profile";
	const SEVERITY = { red: 3, yellow: 1, green: 0 };
	const CONFIDENCE = { high: 1, medium: 0.7, low: 0.4 };
	const MAX_RESULTS = 24;

	const resources = readJSON("resource-data") || [];
	const stationMeta = readJSON("station-meta") || [];
	const stationName = Object.fromEntries(stationMeta.map((s) => [s.slug, s.name]));
	const byId = Object.fromEntries(stationMeta.map((s) => [s.id, s.slug]));
	const byName = Object.fromEntries(stationMeta.map((s) => [s.name.toLowerCase(), s.slug]));

	function readJSON(id) {
		const el = document.getElementById(id);
		if (!el) return null;
		try { return JSON.parse(el.textContent); } catch (e) { return null; }
	}
	function esc(s) {
		return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
			{ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
		));
	}

	// --- profile persistence -------------------------------------------------
	function loadProfile() {
		try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
		catch (e) { return {}; }
	}
	function saveProfile(p) {
		try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) {}
	}
	function currentSelections() {
		const sel = {};
		form.querySelectorAll('input[type="radio"]:checked').forEach((input) => {
			sel[input.name.replace(/^s-/, "")] = input.value;
		});
		return sel;
	}
	function setRadios(profile) {
		form.querySelectorAll('input[type="radio"]').forEach((i) => { i.checked = false; });
		Object.entries(profile).forEach(([slug, value]) => {
			const input = form.querySelector(`input[name="s-${slug}"][value="${value}"]`);
			if (input) input.checked = true;
		});
	}

	// --- report parsing (the "let the agent set it" path) --------------------
	// Reads the ds-inspection "Inspection sheet" markdown table:
	//   |  3 | Accessibility | Sound | 🟡 | 6/10 |
	// Matches each row to a station by number (or name), maps its light/score to
	// red/yellow/green (Red 0–3, Yellow 4–7, Green 8–10).
	function parseReport(text) {
		const map = {};
		for (const line of String(text).split(/\r?\n/)) {
			if (!line.includes("|")) continue;
			const cells = line.split("|").map((c) => c.trim());
			const num = parseInt(cells[1], 10);
			let slug = null;
			if (num >= 1 && num <= stationMeta.length && byId[num]) slug = byId[num];
			else {
				const nm = (cells[2] || "").toLowerCase();
				if (byName[nm]) slug = byName[nm];
			}
			if (!slug) continue;
			const row = cells.join(" ");
			let light = null;
			if (/🔴|(^|\s)red(\s|$)/i.test(row)) light = "red";
			else if (/🟡|yellow/i.test(row)) light = "yellow";
			else if (/🟢|green/i.test(row)) light = "green";
			else {
				const sm = row.match(/(\d+)\s*\/\s*10/);
				if (sm) { const s = +sm[1]; light = s <= 3 ? "red" : s <= 7 ? "yellow" : "green"; }
			}
			if (light) map[slug] = light;
		}
		return map;
	}

	// --- ranking -------------------------------------------------------------
	function rank(profile) {
		const flagged = Object.entries(profile).filter(([, v]) => v === "red" || v === "yellow");
		if (!flagged.length) return { items: [], flagged: [] };
		const scored = resources.map((r) => {
			let score = 0; const hits = [];
			for (const [slug, sev] of flagged) {
				if (r.stations.includes(slug)) {
					score += SEVERITY[sev] * (CONFIDENCE[r.confidence] ?? 0.6);
					hits.push({ slug, sev });
				}
			}
			return { r, score, hits };
		}).filter((x) => x.score > 0);
		scored.sort((a, b) => {
			const aRed = a.hits.some((h) => h.sev === "red") ? 1 : 0;
			const bRed = b.hits.some((h) => h.sev === "red") ? 1 : 0;
			if (aRed !== bRed) return bRed - aRed;
			return b.score - a.score;
		});
		return { items: scored.slice(0, MAX_RESULTS), flagged };
	}

	// --- rendering -----------------------------------------------------------
	const SENTIMENT = { excited: "🔥", useful: "💡", question: "❓", cautious: "🤔", discussion: "💬" };

	function card({ r, hits }) {
		const reasons = hits.sort((a, b) => (a.sev === "red" ? -1 : 1))
			.map((h) => `<span class="wo-reason wo-reason--${h.sev}">${esc(stationName[h.slug] || h.slug)}</span>`).join("");
		const summary = r.summary
			? `<ed-text-passage size="sm"><p>${SENTIMENT[r.sentiment] || "💬"} ${esc(r.summary)}</p>${
				r.slackUrl ? `<p><a href="${esc(r.slackUrl)}" target="_blank" rel="noopener">View in Slack →</a></p>` : ""}</ed-text-passage>`
			: "";
		return `<ed-card class="wo-card">
			<ed-heading variant="title-sm"><a href="${esc(r.href)}" target="_blank" rel="noopener">${esc(r.title)}</a></ed-heading>
			<div class="wo-reasons"><span class="wo-reasons__label">Helps with:</span> ${reasons}</div>
			${summary}</ed-card>`;
	}

	function reflectOnBrowse(profile) {
		document.querySelectorAll(".station__flag").forEach((el) => el.remove());
		document.querySelectorAll(".station").forEach((s) => s.classList.remove("is-flagged-red", "is-flagged-yellow"));
		for (const [slug, sev] of Object.entries(profile)) {
			if (sev !== "red" && sev !== "yellow") continue;
			const sec = document.getElementById("station-" + slug);
			if (!sec) continue;
			sec.classList.add("is-flagged-" + sev);
			const head = sec.querySelector(".station__head");
			if (head) {
				const flag = document.createElement("span");
				flag.className = "station__flag station__flag--" + sev;
				flag.textContent = sev === "red" ? "You marked this red" : "You marked this yellow";
				head.appendChild(flag);
			}
		}
	}

	function renderBar(profile) {
		const vals = Object.values(profile);
		const red = vals.filter((v) => v === "red").length;
		const yellow = vals.filter((v) => v === "yellow").length;
		const green = vals.filter((v) => v === "green").length;
		const total = stationMeta.length || 10;
		if (barTally) {
			barTally.innerHTML =
				`<span class="tally tally--red">${red} red</span>` +
				`<span class="tally tally--yellow">${yellow} yellow</span>` +
				`<span class="tally tally--rest">${total - red - yellow - green} unset</span>`;
		}
		if (barChips) {
			const flagged = Object.entries(profile).filter(([, v]) => v === "red" || v === "yellow")
				.sort((a, b) => (a[1] === "red" ? -1 : 1));
			barChips.innerHTML = flagged
				.map(([slug, sev]) => `<span class="wo-reason wo-reason--${sev}">${esc(stationName[slug] || slug)}</span>`).join("");
		}
	}

	function updateStartPanel(configured) {
		const title = document.getElementById("start-title");
		const btn = document.getElementById("start-btn");
		if (configured) {
			if (title) title.textContent = "No lights flagged yet";
			if (btn) btn.textContent = "Edit inspection";
		} else {
			if (title) title.textContent = "Start your inspection";
			if (btn) btn.textContent = "Start inspection";
		}
	}

	function render(profile) {
		const configured = Object.keys(profile).length > 0;
		const { items, flagged } = rank(profile);
		// "Actionable" = at least one red/yellow to prescribe against. Only then do
		// we show the compact bar + work order; otherwise the prominent CTA panel.
		const actionable = flagged.length > 0;

		reflectOnBrowse(profile);
		renderBar(profile);
		updateStartPanel(configured);

		if (startPanel) startPanel.hidden = actionable;
		if (bar) bar.hidden = !actionable;
		out.hidden = !actionable;
		if (!actionable) { list.innerHTML = ""; return; }

		const reds = flagged.filter(([, v]) => v === "red").length;
		const yellows = flagged.filter(([, v]) => v === "yellow").length;
		lead.textContent = items.length
			? `${items.length} recommended resource${items.length === 1 ? "" : "s"} for your ${reds} red and ${yellows} yellow station${reds + yellows === 1 ? "" : "s"}, reds first.`
			: "No classified resources match your flagged stations yet — a content gap worth filling.";
		list.innerHTML = items.map(card).join("");
	}

	// --- wizard control ------------------------------------------------------
	function openWizard() {
		setRadios(loadProfile());
		setMode("manual");
		if (typeof wizard.showModal === "function") wizard.showModal();
		else wizard.setAttribute("open", "");
	}
	function closeWizard() {
		if (typeof wizard.close === "function") wizard.close();
		else wizard.removeAttribute("open");
	}
	function setMode(mode) {
		const manual = mode === "manual";
		panelManual.hidden = !manual;
		panelPaste.hidden = manual;
		modeManual.classList.toggle("is-active", manual);
		modePaste.classList.toggle("is-active", !manual);
		modeManual.setAttribute("aria-selected", String(manual));
		modePaste.setAttribute("aria-selected", String(!manual));
	}

	// --- wire up -------------------------------------------------------------
	if (startBtn) startBtn.addEventListener("click", openWizard);
	if (editBtn) editBtn.addEventListener("click", openWizard);
	if (closeBtn) closeBtn.addEventListener("click", closeWizard);
	if (cancelBtn) cancelBtn.addEventListener("click", closeWizard);
	if (modeManual) modeManual.addEventListener("click", () => setMode("manual"));
	if (modePaste) modePaste.addEventListener("click", () => setMode("paste"));

	if (parseBtn) parseBtn.addEventListener("click", () => {
		const map = parseReport(reportInput ? reportInput.value : "");
		const n = Object.keys(map).length;
		if (!n) {
			if (parseMsg) parseMsg.textContent = "Couldn't find an inspection sheet in that text. Paste the report's table (with the 🟢/🟡/🔴 lights or n/10 scores).";
			return;
		}
		setRadios(map);
		setMode("manual");
		if (parseMsg) parseMsg.textContent = `Set ${n} station${n === 1 ? "" : "s"} from your report — review and confirm.`;
	});

	if (confirmBtn) confirmBtn.addEventListener("click", () => {
		const profile = currentSelections();
		saveProfile(profile);
		closeWizard();
		render(profile);
		if (bar && !bar.hidden) bar.scrollIntoView({ behavior: "smooth", block: "start" });
	});

	if (clearBtn) clearBtn.addEventListener("click", () => {
		saveProfile({});
		setRadios({});
		render({});
	});

	// Close on backdrop click.
	wizard.addEventListener("click", (e) => { if (e.target === wizard) closeWizard(); });

	render(loadProfile());
})();
