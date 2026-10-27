import chameleon from '../../_data/chameleonCatalog.json' with {type:'json'};
import {detectTopics, matchTerms, scoreLessons, scoreResources, LENSES} from './ranking.mjs';

const SHAPE_LABELS = {
  resourceTimeline: 'Recent resources in date order',
  table: 'Compare known resource facts in a table',
  tabs: 'Course learning path grouped by chapter',
  videoGrid: 'Relevant course lesson cards',
  definition: 'Explain a glossary term using its recorded definition',
  barChart: 'Count collection records by month, type, or tag',
};
// Names must exist in the pinned served profile; the adapter only implements this subset.
export const SHAPES = Object.fromEntries(Object.entries(SHAPE_LABELS).map(([name, label]) => {
  if (!Object.hasOwn(chameleon.components, name)) throw new Error(`Catalog no longer contains ${name}`);
  return [name, label];
}));
export const EXAMPLES = [
  'What’s new in generative UI?',
  'Compare MCP resources',
  'Give me a learning path for design tokens',
  'What is context engineering?',
  'Chart resources by type',
];

export function retrieve(query, lens, intel) {
  const topics = detectTopics(query);
  const terms = matchTerms(query, intel.terms);
  const latest = /latest|recent|newest|what.s new|catch (?:me )?up|lately/i.test(query);
  const lessons = scoreLessons({ask: query, topics, lessons: intel.lessons,
    termLessonUrls: new Set(terms.flatMap(t => (t.lessons || []).map(l => l.url)))}).slice(0, 18);
  // Lens and freshness rank relevant records; neither creates relevance itself.
  const relevant = scoreResources({ask: query, lens: null, topics, resources: intel.resources, wantLatest: false});
  const ids = new Set(relevant.map(x => x.r.id));
  const recencyRemainder = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(word => word && !new Set('show me please the latest recent recently newest what s is new catch up on additions added resources resource collection most were has been this week month anything lately in to our your'.split(' ')).has(word));
  const generalLatest = latest && topics.length === 0 && recencyRemainder.length === 0;
  const candidates = generalLatest ? intel.resources : intel.resources.filter(r => ids.has(r.id));
  const resources = latest
    ? [...candidates].sort((a,b) => (Date.parse(b.created)||0) - (Date.parse(a.created)||0)).slice(0,24)
    : scoreResources({ask:query, lens, topics, resources:candidates, wantLatest:false}).slice(0,24).map(x=>x.r);
  return {terms, lessons: lessons.map(x => x.l), resources,
    confidence: terms.length || lessons.length || resources.length ? 'matched' : 'no match', topics: topics.map(t => t.id)};
}

export function localPlan(query, lens, intel, choice) {
  const found = retrieve(query, lens, intel);
  const q = query.toLowerCase();
  const shape = choice || (/chart|graph|how many|count|breakdown|per month|by type|by tag/.test(q) && /resources|collection|by type|by tag|per month/.test(q) ? 'barChart'
    : /compare|comparison|versus|\bvs\b|which tools|options/.test(q) ? 'table'
    : /learning path|chapter|curriculum|start|beginner/.test(q) ? 'tabs'
    : /latest|recent|newest|what.s new|catch (?:me )?up|lately/.test(q) ? 'resourceTimeline'
    : found.terms.length && /what|define|explain|mean/.test(q) ? 'definition' : 'videoGrid');
  const ids = shape === 'barChart' ? [] : (shape === 'definition' ? found.terms : ['tabs','videoGrid'].includes(shape) ? found.lessons : found.resources).slice(0, 9).map(x => x.id);
  let sections = [];
  if (shape === 'barChart' || ids.length) sections.push({kind: shape, heading: SHAPES[shape], ids});
  if (!sections.length && found.resources.length) sections.push({kind: 'resourceTimeline', heading: 'Resources to explore', ids: found.resources.slice(0, 8).map(x => x.id)});
  if (sections.length && !['table','resourceTimeline','barChart'].includes(shape) && found.resources.length) sections.push({kind: 'table', heading: 'Continue exploring', ids: found.resources.slice(0, 5).map(x => x.id)});
  return {summary: sections.length ? `A view of the collection for “${query}”.${lens ? ` Perspective: ${LENSES[lens].label}.` : ''}` : 'No strong match in this collection. Try a specific topic such as MCP, design tokens, or generative UI.', sections};
}

export function validateInput({query, lens = '', engine = 'device'} = {}) {
  if (typeof query !== 'string' || !query.trim() || query.length > 1000) throw new Error('Enter a question between 1 and 1,000 characters.');
  if (typeof lens !== 'string' || (lens && !Object.hasOwn(LENSES, lens))) throw new Error('Unknown perspective.');
  if (!['device', 'claude', 'jev', 'auto'].includes(engine)) throw new Error('Unknown engine.');
  return {query: query.trim(), lens, engine};
}

export function validatePlan(plan, intel) {
  const only = (obj, keys) => obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).every(k => keys.includes(k));
  if (!only(plan, ['summary','sections']) || typeof plan.summary !== 'string' || plan.summary.length > 1200 || !Array.isArray(plan.sections) || plan.sections.length > 6) throw new Error('Invalid composition.');
  for (const section of plan.sections) {
    if (!only(section, ['kind','heading','ids']) || !Object.hasOwn(SHAPES, section.kind) || typeof section.heading !== 'string' || !section.heading.trim() || section.heading.length > 160 || !Array.isArray(section.ids) || section.ids.length > 12 || new Set(section.ids).size !== section.ids.length) throw new Error('Invalid section.');
    const records = section.kind === 'definition' ? intel.terms : ['videoGrid','tabs'].includes(section.kind) ? intel.lessons : intel.resources;
    if (section.kind === 'barChart' && section.ids.length) throw new Error('Chart counts come from code.');
    if (section.kind !== 'barChart' && !section.ids.length) throw new Error('Empty section.');
    if (section.ids.some(id => typeof id !== 'string' || !records.some(r => r.id === id))) throw new Error('Unknown record.');
  }
  return plan;
}
