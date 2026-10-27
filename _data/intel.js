const resources = require('./resources');
const glossary = require('./glossary');
const lessons = require('./lessons');

// A public, credential-free index. Full transcripts and private Notion IDs stay out.
module.exports = () => ({
  resources: resources().map(r => ({
    id: r.id, title: r.title, url: r.href, type: r.type || 'Resource',
    created: r.created, tags: r.tags.map(t => t.name.toLowerCase()),
    summary: r.slackSummary || '', source: r.source || 'curated', essential: r.essential,
  })),
  terms: glossary().map(({slug, term, aliases, definition, lessons, references}) =>
    ({id: slug, slug, term, aliases, definition, lessons, references})),
  lessons: lessons().map(({notionId, ...lesson}) => ({...lesson, id: lesson.slug})),
});
