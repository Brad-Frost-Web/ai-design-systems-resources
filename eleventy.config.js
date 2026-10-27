import { build } from "esbuild";
import dotenv from "dotenv";
import { createRequire } from "node:module";
import { readFile, mkdir, writeFile } from "node:fs/promises";

dotenv.config();

const require = createRequire(import.meta.url);
const { buildThemes } = require("./scripts/build-themes.js");

export default async function (eleventyConfig) {
	// Use Nunjucks for HTML files
	eleventyConfig.setTemplateFormats(["njk", "html", "md"]);
	eleventyConfig.addExtension("html", { key: "njk" });

	// Sentiment emoji filter for Slack-sourced resources
	eleventyConfig.addFilter("sentimentEmoji", (sentiment) => {
		const map = {
			excited: "🔥",
			useful: "💡",
			question: "❓",
			cautious: "🤔",
			discussion: "💬",
		};
		return map[sentiment] || "💬";
	});

	eleventyConfig.addPassthroughCopy("css/*");
	eleventyConfig.addPassthroughCopy("css/theme-fonts");
	// Eddie 0.60 self-hosts its fonts; the token CSS references ../../core/fonts
	eleventyConfig.addPassthroughCopy({
		"node_modules/@brad-frost-web/eddie-design-tokens/core/fonts": "core/fonts",
	});
	eleventyConfig.addWatchTarget("js/");
	eleventyConfig.addPassthroughCopy("images");
	eleventyConfig.addPassthroughCopy("favicon.svg");
	eleventyConfig.addPassthroughCopy("favicon.ico");
	eleventyConfig.addPassthroughCopy("favicon-96x96.png");
	eleventyConfig.addPassthroughCopy("site.webmanifest");
	eleventyConfig.addPassthroughCopy("apple-touch-icon.png");

	// Build JavaScript with esbuild before Eleventy processes
	eleventyConfig.on("eleventy.before", async () => {
		// Extend Eddie's sprite with the requested provider brand asset; never fork components.
		const sprite = await readFile("node_modules/@brad-frost-web/eddie-icons/icons/ed-icons.svg", "utf8");
		const claude = await readFile("images/claude-symbol.svg", "utf8");
		const symbol = claude.replace(/<svg\b/, '<symbol id="claude"').replace(/<\/svg>\s*$/, "</symbol>");
		await mkdir("_site/icons", { recursive: true });
		await writeFile("_site/icons/resources.svg", sprite.replace(/<\/svg>\s*$/, `${symbol}</svg>`));
		// Rescope Eddie's alternate theme tokens for runtime theme switching
		try {
			buildThemes();
		} catch (error) {
			console.error("theme build error:", error);
		}
		try {
			const result = await build({
				entryPoints: ["js/components.js", "js/scripts.js"],
				bundle: true,
				format: "esm",
				target: "es2020",
				outdir: "_site/js",
				write: true,
				external: [],
				platform: "browser",
				minify: true,
				sourcemap: false,
			});
			console.log("JavaScript bundled successfully");
		} catch (error) {
			console.error("esbuild error:", error);
			throw error;
		}
	});
}
