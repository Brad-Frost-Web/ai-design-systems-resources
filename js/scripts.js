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
 * Vertical "git-graph" timeline (issue #5). Newest day at top; resources on the
 * same day cluster underneath it, branching off the day node like commits off a
 * branch. Shows recent days by default and reveals older days as you scroll.
 */
(function () {
	const root = document.getElementById("gt");
	const list = document.getElementById("gt-list");
	const sentinel = document.getElementById("gt-sentinel");
	const moreBtn = document.getElementById("gt-more");
	const dataEl = document.getElementById("timeline-data");
	if (!root || !list || !dataEl) return;

	let items;
	try { items = JSON.parse(dataEl.textContent); } catch (e) { return; }
	if (!items || !items.length) return;

	const SENT = { excited: "🔥", useful: "💡", question: "❓", cautious: "🤔", discussion: "💬" };
	const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const BATCH = 8; // days revealed per step
	let lastMonth = null; // tracks month boundaries across batched renders

	function esc(s) {
		return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
			{ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
		));
	}

	// Group by day, newest day first (items within a day keep source order).
	const map = new Map();
	for (const it of items) {
		if (!map.has(it.day)) map.set(it.day, []);
		map.get(it.day).push(it);
	}
	const days = [...map.entries()]
		.map(([day, list]) => ({ day, t: Date.parse(day), list }))
		.sort((a, b) => b.t - a.t);

	let shown = 0;

	function dayHtml(d) {
		const dt = new Date(d.t);
		const dateLabel = `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
		const rows = d.list.map((it) => `
			<li class="gt-item">
				<div class="gt-card">
					<ed-heading variant="title-sm"><a href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.title)}</a></ed-heading>
					${it.summary ? `<ed-text-passage size="sm"><p>${SENT[it.sentiment] || "💬"} ${esc(it.summary)}</p></ed-text-passage>` : ""}
					${it.tags && it.tags.length ? `<div class="resource-tags">${it.tags.map((t) => `<ed-badge text="${esc(t)}"></ed-badge>`).join("")}</div>` : ""}
				</div>
			</li>`).join("");
		return `
			<li class="gt-day">
				<div class="gt-day__head">
					<span class="gt-day__dot" aria-hidden="true"></span>
					<h2 class="gt-day__date">${dateLabel}</h2>
					<span class="gt-day__count">${d.list.length}</span>
				</div>
				<ul class="gt-items">${rows}</ul>
			</li>`;
	}

	function monthHtml(t) {
		const d = new Date(t);
		return `
			<li class="gt-month">
				<span class="gt-month__marker" aria-hidden="true"></span>
				<h2 class="gt-month__label">${MONTHS_FULL[d.getUTCMonth()]} ${d.getUTCFullYear()}</h2>
			</li>`;
	}

	function renderNext() {
		const next = days.slice(shown, shown + BATCH);
		if (!next.length) return;
		let html = "";
		for (const d of next) {
			const dt = new Date(d.t);
			const mk = dt.getUTCFullYear() + "-" + dt.getUTCMonth();
			if (mk !== lastMonth) { html += monthHtml(d.t); lastMonth = mk; }
			html += dayHtml(d);
		}
		list.insertAdjacentHTML("beforeend", html);
		shown += next.length;
		const done = shown >= days.length;
		if (moreBtn) moreBtn.hidden = done;
		if (sentinel) sentinel.hidden = done;
	}

	renderNext(); // recent days by default

	// Reveal older days as the sentinel scrolls into view.
	if ("IntersectionObserver" in window && sentinel) {
		const io = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) renderNext();
		}, { rootMargin: "400px 0px" });
		io.observe(sentinel);
	}
	if (moreBtn) moreBtn.addEventListener("click", renderNext);
})();
