const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const loadGlossary = require("../_data/glossary.js");

const glossaryDir = path.join(__dirname, "..", "_data", "glossary");
const SOURCE_TYPES = ["course", "jam-session", "community", "industry"];
const LESSON_URL = "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/";

const entries = fs
	.readdirSync(glossaryDir)
	.filter((file) => file.endsWith(".md"))
	.map((file) => ({
		file,
		...matter(fs.readFileSync(path.join(glossaryDir, file), "utf8")),
	}));

test("every term has a term name and a definition", () => {
	for (const { file, data, content } of entries) {
		assert.ok(data.term, `${file}: missing term`);
		assert.ok(content.trim().length > 0, `${file}: missing definition`);
	}
});

test("every term is traceable to a lesson or a public reference", () => {
	for (const { file, data } of entries) {
		const lessons = data.lessons || [];
		const references = data.references || [];
		assert.ok(lessons.length + references.length > 0, `${file}: cites nothing`);
	}
});

test("source types come from the known set", () => {
	for (const { file, data } of entries) {
		assert.ok(SOURCE_TYPES.includes(data.source?.type), `${file}: source.type "${data.source?.type}"`);
	}
});

test("lessons carry a number and title; a url, when present, is a course lesson", () => {
	for (const { file, data } of entries) {
		for (const lesson of data.lessons || []) {
			assert.ok(lesson.number && lesson.title, `${file}: lesson missing number or title`);
			if (lesson.url) assert.ok(lesson.url.startsWith(LESSON_URL), `${file}: unexpected lesson url ${lesson.url}`);
		}
	}
});

test("references carry a label and an https url", () => {
	for (const { file, data } of entries) {
		for (const ref of data.references || []) {
			assert.ok(ref.label, `${file}: reference missing label`);
			assert.match(ref.url || "", /^https:\/\//, `${file}: reference url must be https`);
		}
	}
});

test("no citation points at private material (Slack, Notion, Descript, Zoom)", () => {
	const PRIVATE = /(^|\.)(slack\.com|notion\.so|notion\.site|descript\.com|zoom\.us)$/;
	for (const { file, data } of entries) {
		for (const { url } of [...(data.lessons || []), ...(data.references || [])]) {
			if (url) assert.ok(!PRIVATE.test(new URL(url).hostname), `${file}: private url ${url}`);
		}
	}
});

test("term names are unique", () => {
	const seen = new Map();
	for (const { file, data } of entries) {
		const key = data.term.toLowerCase();
		assert.ok(!seen.has(key), `${file}: duplicates ${seen.get(key)}`);
		seen.set(key, file);
	}
});

test("the loader passes references through and defaults them to []", () => {
	const terms = loadGlossary();
	assert.strictEqual(terms.length, entries.length);
	for (const term of terms) assert.ok(Array.isArray(term.references), `${term.slug}: references not an array`);
});
