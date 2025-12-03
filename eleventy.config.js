import { build } from "esbuild";

export default async function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("css/*");
	eleventyConfig.addPassthroughCopy("images");
	eleventyConfig.addPassthroughCopy("favicon.svg");
	eleventyConfig.addPassthroughCopy("favicon.ico");
	eleventyConfig.addPassthroughCopy("favicon-96x96.png");
	eleventyConfig.addPassthroughCopy("site.webmanifest");
	eleventyConfig.addPassthroughCopy("apple-touch-icon.png");

	// Build JavaScript with esbuild before Eleventy processes
	eleventyConfig.on("eleventy.before", async () => {
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
		}
	});
}
