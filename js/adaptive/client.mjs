import {createSurfaceHost} from '@brad-frost-web/eddie-render';
import catalog from '../../_data/renderCatalog.json';
import {compile} from './compile.mjs';
import {localPlan, retrieve, SHAPES, EXAMPLES, validateInput} from './plan.mjs';
import {LENSES} from './ranking.mjs';

export async function initAdaptiveResources() {
  const form = document.getElementById('resource-question');
  if (!form) return;
  const status = document.getElementById('generation-status');
  const region = document.getElementById('generated-resources');
  const details = document.getElementById('generation-details');
  const engine = document.getElementById('generation-engine');
  const lens = document.getElementById('generation-lens');
  const debug = document.getElementById('generation-json');
  const reset = document.getElementById('generation-reset');
  const examples = document.getElementById('generation-examples');
  let generation = 0, controller, query = '';
  let intel;
  try {
    const response = await fetch('/intel.json', {signal:AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error();
    intel = await response.json();
    await Promise.all(['ed-single-field-form','ed-select-field','ed-button'].map(tag => customElements.whenDefined(tag)));
  } catch {
    status.textContent = 'The dynamic view could not load. Browse the full collection below.';
    return;
  }
  const host = createSurfaceHost(region, {catalog, scripts:false, surfaceId:'resources'});
  await host.ready;
  lens.items = [{value:'',label:'Any perspective'}, ...Object.entries(LENSES).map(([value, item]) => ({value,label:item.label}))];
  engine.items = [{value:'device',label:'On-device · rules'}];
  engine.value = 'device';
  function render(plan, provenance) {
    const message = compile(plan, intel, query, catalog, provenance);
    const result = host.apply(message);
    if (result.outcome !== 'committed') throw new Error('The composition was refused.');
    region.hidden = false;
    details.hidden = false;
    debug.textContent = JSON.stringify({provenance, plan, message}, null, 2);
  }
  async function run(value) {
    const turn = ++generation;
    controller?.abort();
    controller = new AbortController();
    let input;
    try { input = validateInput({query:value, lens:lens.value || '', engine:engine.value || 'device'}); }
    catch (error) {status.textContent = error.message; region.removeAttribute('aria-busy'); return;}
    query = input.query;
    form.value = query;
    const start = performance.now();
    try {
      const plan = localPlan(query,input.lens,intel);
      render(plan, {engine:'device', requestedEngine:input.engine, elapsedMs:Math.round(performance.now()-start), modelConfidence:null, retrieval:retrieve(query,input.lens,intel).confidence, path:['device'], fallback:null, effectiveLens:input.lens, catalogVersion:catalog.eddieVersion, contract:'a2ui-eddie/1.0'});
      reset.hidden = false;
      const kinds = plan.sections.map(s => SHAPES[s.kind]).join(' · ') || 'no matching records';
      status.textContent = `On-device view ready · ${kinds} · ${Math.round(performance.now()-start)} ms.`;
      if (input.engine === 'device') {region.removeAttribute('aria-busy'); return;}
      region.setAttribute('aria-busy','true');
      status.textContent = `On-device view ready. Waiting for ${input.engine === 'auto' ? 'Jev / Claude' : input.engine}…`;
      const response = await fetch('/api/compose', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(input), signal:AbortSignal.any([controller.signal, AbortSignal.timeout(35000)])});
      const result = await response.json();
      if (turn !== generation) return;
      if (!response.ok) throw new Error(result.error || 'The live request failed.');
      render(result.plan,result.provenance);
      const p = result.provenance;
      status.textContent = `${p.engine === 'device' ? 'On-device' : p.engine === 'claude' ? 'Claude' : 'Jev'} view ready · ${p.elapsedMs} ms${p.modelConfidence !== null ? ` · model confidence ${Math.round(p.modelConfidence*100)}%` : ''}.${p.fallback ? ` ${p.fallback} ${p.engine === 'device' ? 'The on-device view is available.' : ''}` : ''}`;
    } catch (error) {
      if (turn !== generation || error.name === 'AbortError') return;
      status.textContent = `${error.message} The on-device view remains available; you can also browse below.`;
    } finally { if (turn === generation) region.removeAttribute('aria-busy'); }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    run(typeof event.detail?.value === 'string' ? event.detail.value : form.value || '');
  });
  for (const example of EXAMPLES) {
    const button = document.createElement('ed-button');
    button.variant = 'secondary'; button.textContent = example;
    button.addEventListener('click', () => run(example));
    examples.append(button);
  }
  for (const select of [engine, lens]) select.addEventListener('change', () => { if (form.value?.trim()) run(form.value); });
  reset.addEventListener('click', () => {
    generation++; controller?.abort(); host.reset(); query = ''; form.value = '';
    region.hidden = true; details.hidden = true; reset.hidden = true;
    region.removeAttribute('aria-busy'); debug.textContent = '';
    status.textContent = 'Ready for another question. The full collection is below.';
    form.focusField();
  });
  document.getElementById('adaptive-controls').hidden = false;
  status.textContent = 'Ask a question or try an example. The presentation adapts to what you need.';
  try {
    const response = await fetch('/api/capabilities', {signal:AbortSignal.timeout(1500)});
    const available = response.ok ? await response.json() : {};
    engine.items = [...engine.items,
      ...(available.claude ? [{value:'claude',label:'Claude · composition'}] : []),
      ...(available.jev ? [{value:'jev',label:'Jev · typed decisions'}] : []),
      ...(available.jev || available.claude ? [{value:'auto',label:'Auto · Jev → Claude'}] : [])];
    document.getElementById('engine-availability').textContent = `On-device uses local rules; no model request. Claude ${available.claude ? 'available' : 'unavailable'}. Jev ${available.jev ? 'available' : 'unavailable'}.`;
  } catch {
    document.getElementById('engine-availability').textContent = 'On-device uses local rules. Start the local demo server to enable Claude and Jev.';
  }
}

initAdaptiveResources().catch(() => {
  const status = document.getElementById('generation-status');
  if (status) status.textContent = 'The dynamic view is unavailable. Browse the full collection below.';
});
