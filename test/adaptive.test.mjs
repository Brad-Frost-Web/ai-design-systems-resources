import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import intelLoader from '../_data/intel.js';
import {localPlan, retrieve, validateInput, validatePlan, EXAMPLES} from '../js/adaptive/plan.mjs';
import {compile} from '../js/adaptive/compile.mjs';
import {chartFor} from '../js/adaptive/ranking.mjs';
import {compose} from '../scripts/demo/providers.mjs';

const intel = intelLoader();
const catalog = JSON.parse(readFileSync(new URL('../_data/renderCatalog.json', import.meta.url)));
const deps = {intel, catalog, env:{}};
const response = data => ({ok:true,json:async()=>data});
const claudeResponse = plan => response({model:'test-model',content:[{type:'text',text:JSON.stringify(plan)}]});

test('five user intentions produce distinct, validated Eddie trees', () => {
  const expected = ['Timeline','Table','Tabs','Heading','BarChart'];
  EXAMPLES.forEach((query, i) => {
    const message = compile(localPlan(query,'',intel),intel,query,catalog);
    assert.ok(message.createSurface.components.some(c => c.component === expected[i]), query);
  });
});

test('freeform terms and unknown topics are handled without scripted matching', () => {
  assert.ok(localPlan('Please explain model context protocol to me','engineer',intel).sections.length);
  const plan = localPlan('aardvark veterinary dentistry','designer',intel);
  assert.equal(plan.sections.length, 0);
  assert.match(plan.summary,/No strong match/);
  assert.equal(localPlan('How many cats are there?','',intel).sections.length,0);
  for (const query of ['Chart MCP resources by type', 'Count resources by month in 2026']) {
    const plan = localPlan(query,'',intel);
    assert.deepEqual(plan.sections[0].ids,[]);
    assert.doesNotThrow(()=>compile(plan,intel,query,catalog));
  }
});

test('input rejects malformed requests and unbounded prompts', () => {
  for (const input of [null, {}, {query:''}, {query:'x'.repeat(1001)}, {query:'MCP', lens:'__proto__'}, {query:'MCP',engine:'other'}]) assert.throws(()=>validateInput(input));
});

test('untrusted plans cannot add nodes, props, URLs, or fabricated IDs', () => {
  const base = {summary:'Test',sections:[{kind:'table',heading:'Test',ids:[intel.resources[0].id]}]};
  for (const mutate of [p=>p.html='<script/>', p=>p.sections[0].kind='script', p=>p.sections[0].href='https://evil.example', p=>p.sections[0].ids=['fabricated']]) {
    const plan = structuredClone(base); mutate(plan); assert.throws(()=>validatePlan(plan,intel));
  }
  const unsafeIntel = structuredClone(intel); unsafeIntel.resources[0].url='javascript:alert(1)';
  assert.throws(()=>compile(base,unsafeIntel,'MCP',catalog), /unsafe/);
});

test('chart values are computed from dated source records and ignore invalid dates', () => {
  const chart = chartFor('Count resources by type in 2026',{resources:[
    {created:'2026-02-01',type:'Article'}, {created:'2026-02-02',type:'Article'},
    {created:'2025-02-01',type:'Video'}, {created:'broken',type:'Video'},
  ]});
  assert.deepEqual(chart.labels,['Article']); assert.deepEqual(chart.datasets[0].values,[2]);
});

test('recency paraphrases sort the collection even when its newest record is old', () => {
  const oldIntel={...intel,resources:intel.resources.map(r=>({...r,created:'2000-01-01'}))};
  for (const query of ['latest resources','Show me the latest resources','What resources were added most recently?','Catch me up on recent additions']) {
    assert.equal(retrieve(query,'',oldIntel).resources.length,24,query);
    assert.equal(localPlan(query,'',oldIntel).sections[0].kind,'resourceTimeline');
  }
});

test('topic charts filter records and use UTC at year boundaries', () => {
  const before=process.env.TZ;
  process.env.TZ='America/New_York';
  try {
    const chart=chartFor('Chart MCP resources by type in 2026',{resources:[
      {created:'2026-01-01',type:'Article',tags:['mcp'],title:'MCP'},
      {created:'2026-01-01',type:'Video',tags:['tokens'],title:'Tokens'},
    ]});
    assert.deepEqual(chart.labels,['Article']); assert.deepEqual(chart.datasets[0].values,[1]);
    assert.match(chart.heading,/MCP/);
  } finally { if(before === undefined) delete process.env.TZ; else process.env.TZ=before; }
});

test('timeline records are chronological, and text stays text in wire output', () => {
  const message = compile({summary:'<img src=x onerror=alert(1)>',sections:[{kind:'resourceTimeline',heading:'Recent',ids:intel.resources.slice(-3).map(r=>r.id)}]},intel,'recent',catalog);
  assert.ok(message.createSurface.components.some(c=>c.component==='Text' && c.text.startsWith('<img')));
  assert.ok(!message.createSurface.components.some(c=>c.component==='img'));
});

test('on-device composition never calls a provider', async () => {
  const result = await compose({query:'MCP',engine:'device'},{...deps,fetchImpl:()=>{throw new Error('Network forbidden');}});
  assert.equal(result.provenance.engine,'device'); assert.equal(result.provenance.fallback,null);
});

test('Claude uses real provider output and records provenance', async () => {
  const plan = {summary:'A grounded comparison',sections:[{kind:'table',heading:'MCP links',ids:[intel.resources[0].id]}]};
  const result = await compose({query:'Compare MCP',engine:'claude'}, {...deps,env:{ANTHROPIC_API_KEY:'test'},fetchImpl:async(url,request)=>{
    assert.equal(url,'https://api.anthropic.com/v1/messages'); assert.equal(request.headers['x-api-key'],'test'); return claudeResponse(plan);
  }});
  assert.deepEqual(result.plan,plan); assert.equal(result.provenance.engine,'claude'); assert.equal(result.provenance.modelConfidence,null);
});

test('missing key, invalid JSON, invented IDs, HTTP failure, and timeout retain local view', async () => {
  const attempts = [
    {env:{}},
    {fetchImpl:async()=>response({content:[{type:'text',text:'not json'}]})},
    {fetchImpl:async()=>claudeResponse({summary:'Wrong',sections:[{kind:'table',heading:'Fake',ids:['fake']}]})},
    {fetchImpl:async()=>({ok:false,status:429})},
    {signal:AbortSignal.abort(),fetchImpl:async()=>{throw new Error('abort');}},
  ];
  for (const attempt of attempts) {
    const result = await compose({query:'MCP',engine:'claude'}, {...deps,env:{ANTHROPIC_API_KEY:'test'},...attempt});
    assert.equal(result.provenance.engine,'device'); assert.ok(result.provenance.fallback); assert.ok(result.plan.sections.length);
  }
});

test('Jev uses JEV_API_KEY and explicit lens wins over inferred perspective', async () => {
  const result = await compose({query:'MCP',engine:'jev',lens:'engineer'}, {...deps,env:{JEV_API_KEY:'test-jev'},fetchImpl:async(url,request)=>{
    assert.equal(request.headers.Authorization,'Bearer test-jev');
    return response({model:'jev-test',answers:{presentation:{choice:'table',confidence:0.9},perspective:{choice:'designer',confidence:1}}});
  }});
  assert.equal(result.provenance.engine,'jev'); assert.equal(result.provenance.effectiveLens,'engineer');
  assert.equal(result.plan.sections[0].kind,'table');
});

test('Auto falls from low-confidence Jev through Claude and exposes both steps', async () => {
  const result = await compose({query:'MCP',engine:'auto'}, {...deps,env:{JEV_API_KEY:'test',ANTHROPIC_API_KEY:'test'},fetchImpl:async url=>url.includes('typesafe')
    ? response({model:'jev-test',answers:{presentation:{choice:'table',confidence:0.2}}})
    : claudeResponse(localPlan('MCP','',intel))});
  assert.equal(result.provenance.engine,'claude'); assert.deepEqual(result.provenance.path,['device','jev','claude']);
  assert.match(result.provenance.fallback,/confidence/);
});

test('real local server serves site, validates input, fences origins, and supports device API', async () => {
  const port = 18988;
  const child = spawn(process.execPath,['scripts/demo/server.mjs'], {cwd:new URL('../',import.meta.url),env:{...process.env,DEMO_PORT:String(port),ANTHROPIC_API_KEY:'',JEV_API_KEY:''},stdio:['ignore','pipe','pipe']});
  try {
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('Server startup timed out')),8000);
      child.stdout.on('data',data=>{if(data.toString().includes('Resources demo:')) {clearTimeout(timeout);resolve();}});
      child.on('error',reject); child.on('exit',code=>{clearTimeout(timeout);reject(new Error(`Server exited ${code}`));});
    });
    const url=`http://127.0.0.1:${port}`;
    assert.equal((await fetch(url)).status,200);
    assert.deepEqual(await (await fetch(`${url}/api/capabilities`)).json(),{claude:false,jev:false});
    const post = (body,headers={})=>fetch(`${url}/api/compose`,{method:'POST',headers:{'content-type':'application/json',...headers},body});
    assert.equal((await post('{}')).status,400);
    assert.equal((await post('x')).status,400);
    assert.equal((await post('x'.repeat(9000))).status,413);
    assert.equal((await post('{}',{origin:'https://other.example'})).status,403);
    const result=await (await post(JSON.stringify({query:'MCP',engine:'device'}))).json();
    assert.equal(result.provenance.engine,'device'); assert.ok(result.message.createSurface.components.length);
  } finally { child.kill(); }
});
