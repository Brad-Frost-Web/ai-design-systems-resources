/**
 * Primary navigation for the site chrome.
 *
 * Items with a `url` render as live nav links. Items flagged `placeholder: true`
 * render dimmed and non-interactive — they signal pages that are planned
 * (see issue #2) but don't exist yet. To promote a placeholder to a real page,
 * give it a `url` and drop the `placeholder` flag.
 */
module.exports = {
	primary: [
		{ text: "Resources", url: "/" },
		{ text: "Links", placeholder: true },
		{ text: "Glossary", url: "/glossary/" },
		{ text: "Timeline", placeholder: true },
	],
};
