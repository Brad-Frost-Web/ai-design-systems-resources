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
 * Adaptive layer plumbing: the concierge emits declarative UI specs, the
 * adaptive stage renders them, and the constellation feeds asks back into
 * the concierge. All wiring is event-based so each recipe stays a
 * self-contained composition.
 */
(function () {
	const stage = document.querySelector("ed-r-c-adaptive-stage");
	if (!stage) return;

	document.addEventListener("concierge-spec", (event) => {
		stage.show(event.detail.spec, event.detail.intel);
	});

	document.addEventListener("constellation-ask", (event) => {
		const concierge = document.querySelector("ed-r-c-concierge");
		if (!concierge) return;
		concierge.scrollIntoView({ behavior: "smooth", block: "center" });
		concierge._suggest(event.detail.ask);
	});
})();
