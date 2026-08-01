/**
 * Flat dated resource list for the zoomable /timeline/ view (issue #5).
 *
 * Emits one lightweight entry per resource with a `day` key so the client can
 * plot them on a real time axis (positioned by date, clustered per day) and
 * zoom in/out. Reuses the resource data model.
 */

const resources = require("./resources.js");

module.exports = function () {
	return resources()
		.filter((r) => r.created)
		.map((r) => {
			const d = new Date(r.created);
			return {
				title: r.title,
				url: r.href,
				day: d.toISOString().slice(0, 10), // YYYY-MM-DD for same-day clustering
				datetime: r.created,
				summary: r.slackSummary || "",
				sentiment: r.slackSentiment || "",
				tags: (r.tags || []).map((t) => t.name),
			};
		});
};
