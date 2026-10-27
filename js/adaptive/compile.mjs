import {validateSpec} from '@brad-frost-web/eddie-render/validate';
import {validatePlan} from './plan.mjs';
import {chartFor} from './ranking.mjs';

// Consumer data binding, not a DOM renderer. All paint belongs to eddie-render.
export function compile(plan, intel, query, catalog, provenance = {}) {
  validatePlan(plan, intel);
  const elements = {};
  let sequence = 0;
  const node = (component, props = {}, children = [], slots) => {
    const id = `n${sequence++}`;
    elements[id] = {component, ...props, ...(children.length ? {children} : {}), ...(slots ? {slots} : {})};
    return id;
  };
  const text = value => node('Text', {text: String(value || '')});
  const passage = value => node('TextPassage', {}, [text(value)]);
  const heading = (value, level = 'h2') => node('Heading', {tagName: level}, [text(value)]);
  const safeUrl = url => {
    try { const parsed = new URL(url); if (['https:', 'http:'].includes(parsed.protocol)) return parsed.href; } catch {}
    throw new Error('A record has an unsafe or missing link.');
  };
  const link = (label, url) => node('TextLink', {href: safeUrl(url)}, [text(label)]);
  const plain = value => String(value || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`#]/g, '');
  const date = value => Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric', timeZone:'UTC'}) : 'Date not recorded';
  const lessonGrid = records => node('Grid', {variant: '3up'}, records.map(r => node('GridItem', {}, [
    node('VideoCard', {}, [passage(plain(r.summary))], {
      title: [node('Heading', {tagName:'h3'}, [link(r.title, r.url)])],
      meta: [text(`Lesson ${r.number} · ${r.chapter || 'Course'} · ${(r.presenters || []).join(', ')}`)],
    }),
  ])));
  const table = (records, label) => node('TableObject', {behavior:'overflow'}, [node('Table', {fullWidth:true, label}, [
    node('TableHeader', {}, [node('TableRow', {}, ['Resource','Type','Topics','Added'].map(t => node('TableHeaderCell', {}, [text(t)])))]),
    node('TableBody', {}, records.map(r => node('TableRow', {}, [
      node('TableCell', {}, [link(r.title, r.url)]),
      node('TableCell', {}, [text(r.type)]),
      node('TableCell', {}, [text(r.tags.join(', '))]),
      node('TableCell', {}, [text(date(r.created))]),
    ]))),
  ])]);
  const children = [node('Section', {}, [passage(plan.summary)], {header:[heading('Your view')]})];
  for (const section of plan.sections) {
    const source = section.kind === 'definition' ? intel.terms : ['tabs','videoGrid'].includes(section.kind) ? intel.lessons : intel.resources;
    const records = section.ids.map(id => source.find(r => r.id === id));
    let body = [];
    let sectionHeading = section.heading;
    switch (section.kind) {
      case 'videoGrid': body = [lessonGrid(records)]; break;
      case 'tabs': {
        const chapters = new Map();
        for (const r of [...records].sort((a,b) => a.number.localeCompare(b.number, undefined, {numeric:true}))) {
          const name = r.chapter || 'Course';
          chapters.set(name, [...(chapters.get(name) || []), r]);
        }
        body = [node('Tabs', {}, [...chapters].map(([label, lessons]) => node('Tab', {label}, [lessonGrid(lessons)])))];
        break;
      }
      case 'table': body = [table(records, section.heading)]; break;
      case 'resourceTimeline': body = [node('Timeline', {orientation:'vertical'}, [...records].sort((a,b) => (Date.parse(b.created)||0) - (Date.parse(a.created)||0)).map(r => node('TimelineNode', {}, [
        passage(date(r.created)), node('Heading', {tagName:'h3'}, [link(r.title, r.url)]), passage(r.summary || r.tags.join(' · ')),
      ])))]; break;
      case 'definition': body = records.flatMap(r => [heading(r.term, 'h3'), passage(plain(r.definition)),
        ...r.lessons.filter(l => l.url).slice(0,3).map(l => link(l.title || l.name || 'Related course lesson', l.url))]); break;
      case 'barChart': {
        const chart = chartFor(query, intel);
        sectionHeading = chart.heading;
        body = [node('BarChart', {chartLabel:chart.chartLabel, orientation:chart.orientation, dataTable:true,
          data:{labels:chart.labels, datasets:chart.datasets}}), passage(`${chart.scope}. Counts are calculated from records; tag totals can overlap. Dates use UTC.`)];
        break;
      }
    }
    children.push(node('Section', {}, body, {header:[heading(sectionHeading)]}));
  }
  const root = node('Stack', {gap:'section'}, children);
  const spec = {root, elements, dataModel:{}};
  const validation = validateSpec(spec, catalog);
  // This consumer deliberately refuses warnings too: unknown props must not slip through.
  if (!validation.ok || validation.issues.length) throw new Error(`Eddie validation: ${validation.issues.map(x => x.message).join('; ')}`);
  return {version:'v1.0', createSurface:{surfaceId:'resources', catalogId:catalog.catalogId,
    components:[root, ...Object.keys(elements).filter(id => id !== root)].map(id => ({id, ...elements[id]})),
    metadata:{extensions:{eddie_root:root, resources_provenance:provenance}}}};
}
