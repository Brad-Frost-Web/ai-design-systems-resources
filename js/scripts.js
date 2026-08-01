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
 * Diagnose → work order (the /stations/ recommender).
 *
 * The user sets a red/yellow/green light per inspection station. We rank the
 * classified resources by how well they address the stations flagged red/yellow,
 * weighting severity (red > yellow) by our classification confidence, and render
 * a prioritized "work order". Selections persist in localStorage — a lightweight,
 * account-free profile.
 */
(function () {
	const form = document.getElementById("diagnose");
	const out = document.getElementById("work-order");
	const list = document.getElementById("work-order-list");
	const lead = document.getElementById("work-order-lead");
	const resetBtn = document.getElementById("diagnose-reset");
	const tallyEl = document.getElementById("diagnose-tally");
	if (!form || !out || !list) return;

	const STORE_KEY = "ds-inspection-profile";
	const SEVERITY = { red: 3, yellow: 1, green: 0 };
	const CONFIDENCE = { high: 1, medium: 0.7, low: 0.4 };
	const MAX_RESULTS = 15;

	const resources = readJSON("resource-data") || [];
	const stationMeta = readJSON("station-meta") || [];
	const stationName = Object.fromEntries(stationMeta.map((s) => [s.slug, s.name]));

	function readJSON(id) {
		const el = document.getElementById(id);
		if (!el) return null;
		try { return JSON.parse(el.textContent); } catch (e) { return null; }
	}

	// --- profile persistence -------------------------------------------------
	function loadProfile() {
		try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
		catch (e) { return {}; }
	}
	function saveProfile(profile) {
		try { localStorage.setItem(STORE_KEY, JSON.stringify(profile)); } catch (e) {}
	}
	function currentSelections() {
		const sel = {};
		form.querySelectorAll('input[type="radio"]:checked').forEach((input) => {
			sel[input.name.replace(/^s-/, "")] = input.value;
		});
		return sel;
	}
	function restore(profile) {
		Object.entries(profile).forEach(([slug, value]) => {
			const input = form.querySelector(`input[name="s-${slug}"][value="${value}"]`);
			if (input) input.checked = true;
		});
	}

	// --- ranking -------------------------------------------------------------
	function rank(selections) {
		const flagged = Object.entries(selections).filter(([, v]) => v === "red" || v === "yellow");
		if (!flagged.length) return { items: [], flagged: [] };

		const scored = resources.map((r) => {
			let score = 0;
			const hits = [];
			for (const [slug, sev] of flagged) {
				if (r.stations.includes(slug)) {
					const conf = CONFIDENCE[r.confidence] ?? 0.6;
					score += SEVERITY[sev] * conf;
					hits.push({ slug, sev });
				}
			}
			return { r, score, hits };
		}).filter((x) => x.score > 0);

		// Reds first (a resource touching any red outranks yellow-only), then score.
		scored.sort((a, b) => {
			const aRed = a.hits.some((h) => h.sev === "red") ? 1 : 0;
			const bRed = b.hits.some((h) => h.sev === "red") ? 1 : 0;
			if (aRed !== bRed) return bRed - aRed;
			return b.score - a.score;
		});
		return { items: scored.slice(0, MAX_RESULTS), flagged };
	}

	// --- render --------------------------------------------------------------
	const SENTIMENT = { excited: "🔥", useful: "💡", question: "❓", cautious: "🤔", discussion: "💬" };

	function esc(s) {
		return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
			{ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
		));
	}

	function card({ r, hits }) {
		const reasons = hits
			.sort((a, b) => (a.sev === "red" ? -1 : 1))
			.map((h) => `<span class="wo-reason wo-reason--${h.sev}">${esc(stationName[h.slug] || h.slug)}</span>`)
			.join("");
		const summary = r.summary
			? `<ed-text-passage size="sm"><p>${SENTIMENT[r.sentiment] || "💬"} ${esc(r.summary)}</p>${
				r.slackUrl ? `<p><a href="${esc(r.slackUrl)}" target="_blank" rel="noopener">View in Slack →</a></p>` : ""
			}</ed-text-passage>`
			: "";
		return `<ed-card class="wo-card">
			<ed-heading variant="title-sm"><a href="${esc(r.href)}" target="_blank" rel="noopener">${esc(r.title)}</a></ed-heading>
			<div class="wo-reasons"><span class="wo-reasons__label">Helps with:</span> ${reasons}</div>
			${summary}
		</ed-card>`;
	}

	// Compact tally in the sidebar head: how many reds / yellows / unset.
	function renderTally(selections) {
		if (!tallyEl) return;
		const vals = Object.values(selections);
		const red = vals.filter((v) => v === "red").length;
		const yellow = vals.filter((v) => v === "yellow").length;
		const green = vals.filter((v) => v === "green").length;
		const total = stationMeta.length || 10;
		tallyEl.innerHTML =
			`<span class="tally tally--red">${red} red</span>` +
			`<span class="tally tally--yellow">${yellow} yellow</span>` +
			`<span class="tally tally--rest">${total - red - yellow - green} unset</span>`;
	}

	// Reflect flagged stations onto the browse list so the whole page responds.
	function reflectOnBrowse(selections) {
		document.querySelectorAll(".station__flag").forEach((el) => el.remove());
		document.querySelectorAll(".station").forEach((s) => s.classList.remove("is-flagged-red", "is-flagged-yellow"));
		for (const [slug, sev] of Object.entries(selections)) {
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

	let prevHidden = true;
	function update(fromUser) {
		const selections = currentSelections();
		saveProfile(selections);
		renderTally(selections);
		reflectOnBrowse(selections);
		const { items, flagged } = rank(selections);

		const nowHidden = !flagged.length;
		if (nowHidden) {
			out.hidden = true;
			list.innerHTML = "";
			prevHidden = true;
			return;
		}
		out.hidden = false;
		const reds = flagged.filter(([, v]) => v === "red").length;
		const yellows = flagged.filter(([, v]) => v === "yellow").length;
		lead.textContent = items.length
			? `${items.length} recommended resource${items.length === 1 ? "" : "s"} for your ${reds} red and ${yellows} yellow station${reds + yellows === 1 ? "" : "s"}, reds first.`
			: `No classified resources match your flagged stations yet — a content gap worth filling.`;
		list.innerHTML = items.map(card).join("");
		// When the work order first appears after a user action, bring it into view.
		if (fromUser && prevHidden) out.scrollIntoView({ behavior: "smooth", block: "start" });
		prevHidden = false;
	}

	// --- wire up -------------------------------------------------------------
	form.addEventListener("change", () => update(true));
	if (resetBtn) {
		resetBtn.addEventListener("click", () => {
			form.reset();
			saveProfile({});
			update(false);
		});
	}
	restore(loadProfile());
	update(false);
})();
