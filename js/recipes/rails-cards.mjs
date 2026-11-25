/**
 * What the lab and its presentation view both do to the shared Rails cards
 * (_includes/rails-cards.njk, rails-pipeline.njk), kept in one place so the
 * two can't drift (#33).
 */

/** How long each example prompt shows in the chat composer. */
export const PROMPT_INTERVAL_MS = 4500;

/** Put a level's copy into the cards that change with the level. */
export function applyCardCopy(root, { review, resultTitle, resultCaption, generation }) {
	const copy = {
		"[data-review-copy]": review,
		"[data-output-title]": resultTitle,
		"[data-output-caption]": resultCaption,
		"[data-generation-copy]": generation,
	};
	for (const [selector, text] of Object.entries(copy)) {
		root.querySelectorAll(selector).forEach(el => { el.textContent = text; });
	}
}

/** Number the visible cards' step badges in order, from 1. */
export function renumberCards(root) {
	[...root.querySelectorAll(".ed-r-rails-lab__pipeline > li")].filter(li => !li.hidden)
		.flatMap(li => [...li.querySelectorAll("[data-process-number]")])
		.forEach((badge, index) => { badge.textContent = index + 1; });
}
