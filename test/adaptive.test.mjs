import test from 'node:test';
import assert from 'node:assert/strict';
import {composeSpec, validateRemoteSpec, hydrate, FALLBACK_CATALOG} from '../js/intent-engine.js';
import {composeWithJev, handler} from '../netlify/functions/compose.mjs';

const intel = {
  catalog:{nodes:FALLBACK_CATALOG.map(node=>({node}))},
  counts:{resources:4,lessons:3,terms:1,essential:0},
  resources:Array.from({length:4},(_,i)=>({id:`r${i}`, title:`MCP server ${i}`, tags:['mcp'], type:'tool', created:`2026-01-0${i+1}`,url:`https://example.com/${i}`})),
  lessons:Array.from({length:3},(_,i)=>({id:`l${i}`, title:`MCP lesson ${i}`, chapter:`Chapter ${i}`, tags:['mcp'], presenters:[], url:`https://example.com/lesson-${i}`})),
  terms:[{slug:'mcp',term:'MCP',definition:'A protocol',aliases:[],lessons:[]}],
};
const nodes = spec => spec.messages.find(m=>m.surfaceUpdate).surfaceUpdate.components;
const remote = (ask='Compare MCP tools') => {
  const spec = composeSpec({ask,intel});
  spec.engine={kind:'claude', label:'Claude',detail:'Test fixture'};
  spec.reasoning=spec.reasoning.slice(0,6);
  return spec;
};
test('existing local composer retains comparison, course path, chart and latest shapes',()=>{
  for (const [ask,shape] of [['Compare MCP tools','compare'],['MCP learning path','path'],['Chart resources by type','chart'],["What’s new in MCP?",'latest']]) {
    // Straight apostrophe is the original prototype vocabulary.
    assert.equal(composeSpec({ask:ask.replace('’',"'"),intel}).shape,shape);
  }
});
test('remote validator retains known shapes and hydrates only corpus records',()=>{
  const spec=remote();
  spec.messages.find(m=>m.dataModelUpdate).dataModelUpdate.contents={resources:{r0:{title:'Fake'}}};
  const result=hydrate(validateRemoteSpec(spec,intel),intel);
  assert.equal(result.messages.find(m=>m.dataModelUpdate).dataModelUpdate.contents.resources.r0.title,'MCP server 0');
});
test('unknown nodes, cyclic roots, duplicate IDs and invented records are rejected',()=>{
  for (const change of [
    s=>nodes(s)[1].component='script',
    s=>nodes(s)[0].children[0]='root',
    s=>nodes(s)[1].id='root',
    s=>nodes(s).find(n=>n.component==='table').props.items=['invented'],
    s=>nodes(s)[1].children=['root'],
  ]) { const spec=remote(); change(spec); assert.throws(()=>validateRemoteSpec(spec,intel)); }
});
test('chart numbers are recomputed, including course chapters',()=>{
  const spec=remote('How many course lessons per chapter?');
  const chart=nodes(spec).find(n=>n.component==='barChart');
  chart.props.datasets=[{values:[9999]}];
  validateRemoteSpec(spec,intel);
  assert.deepEqual(chart.props.datasets[0].values,[1,1,1]);
  assert.match(chart.props.heading,/lessons/i);
});
test('Jev uses the existing composer and explicit lens wins',async()=>{
  let request;
  const spec=await composeWithJev({ask:'MCP',lens:'skeptic',intel,fetchImpl:async(url,init)=>{
    request=JSON.parse(init.body);
    return {ok:true,json:async()=>({model:'jev-fixture',answers:{presentation:{choice:'compare',confidence:.94},perspective:{choice:'designer',confidence:.99}}})};
  }});
  assert.equal(request.state.explicitLens,'skeptic');
  assert.equal(spec.lens,'skeptic');
  assert.equal(spec.shape,'compare');
  assert.equal(spec.engine.kind,'jev');
  assert.equal(nodes(spec).filter(n=>n.component==='table').length,1);
});
test('Jev rejects low confidence, invalid choices and failed providers',async()=>{
  for(const answer of [{choice:'path',confidence:.2},{choice:'script',confidence:1},{choice:'chart',confidence:2}]){
    await assert.rejects(composeWithJev({ask:'MCP',intel,fetchImpl:async()=>({ok:true,json:async()=>({answers:{presentation:answer}})})}));
  }
  await assert.rejects(composeWithJev({ask:'MCP',intel,fetchImpl:async()=>({ok:false,status:503})}));
});
test('Jev unsupported decision yields the existing honest empty state',async()=>{
  const spec=await composeWithJev({ask:'MCP',intel,fetchImpl:async()=>({ok:true,json:async()=>({answers:{presentation:{choice:'none',confidence:.9}}})})});
  assert.equal(spec.shape,'none');
  assert.ok(nodes(spec).some(n=>n.component==='note'));
});
test('compose endpoint rejects invalid methods and malformed requests',async()=>{
  assert.equal((await handler({httpMethod:'GET'})).statusCode,405);
  assert.equal((await handler({httpMethod:'POST',body:'{'})).statusCode,400);
  assert.equal((await handler({httpMethod:'POST',body:JSON.stringify({engine:'other'})})).statusCode,400);
});

const NOW = Date.parse('2026-10-27T12:00:00Z');
const datedIntel = {...intel, revision:'fixture-revision', resources:[
  { ...intel.resources[0], id:'august', created:'2026-08-05T12:00:00Z'},
  { ...intel.resources[0], id:'before', created:'2026-09-27T23:59:59Z'},
  { ...intel.resources[0], id:'boundary', created:'2026-09-28T00:00:00Z'},
  { ...intel.resources[0], id:'october', created:'2026-10-19T12:00:00Z'},
  { ...intel.resources[0], id:'future', created:'2026-10-28T00:00:00Z'},
]};
import {resolveDateWindow, scopeIntel} from '../js/intent-engine.js';
test('screenshot question uses real last-30-days boundaries, without demo rewriting',()=>{
  const ask='What did I miss in the last month?';
  const spec=composeSpec({ask,intel:datedIntel,now:NOW});
  assert.equal(spec.ask,ask);
  assert.equal(spec.shape,'latest');
  assert.equal(spec.evaluation.window.start,'2026-09-28');
  assert.equal(spec.evaluation.window.end,'2026-10-28');
  assert.deepEqual(nodes(spec).find(n=>n.component==='resourceTimeline').props.items,['october','boundary']);
  assert.equal(spec.engine.modelCalled,false);
  assert.equal(spec.evaluation.candidates.resources,2);
  assert.equal(spec.evaluation.candidates.lessons,0);
});
test('calendar, named month, empty window and year boundaries are explicit',()=>{
  assert.equal(resolveDateWindow('What changed last month?',NOW).end,'2026-10-01');
  assert.equal(resolveDateWindow('What changed last month?',Date.parse('2027-01-10')).start,'2026-12-01');
  assert.equal(resolveDateWindow('Show entries in September 2026',NOW).start,'2026-09-01');
  assert.equal(resolveDateWindow('Resources in 2025',NOW).end,'2026-01-01');
  const empty=composeSpec({ask:'What was added today?',intel:datedIntel,now:NOW});
  assert.equal(empty.shape,'none');
  assert.match(empty.summary,/No matching entries/);
  assert.equal(scopeIntel('Resources this month',datedIntel,NOW).intel.resources.length,1);
});
test('remote date-scoped result cannot sneak an August ID into October results',()=>{
  const spec=composeSpec({ask:'What did I miss in the last month?',intel:datedIntel,now:NOW});
  spec.engine={kind:'claude',label:'Claude',detail:'Fixture'};
  validateRemoteSpec(spec,datedIntel);
  nodes(spec).find(n=>n.component==='resourceTimeline').props.items.push('august');
  assert.throws(()=>validateRemoteSpec(spec,datedIntel));
});
test('live Jev receipt preserves the literal query and filters records after typed choice',async()=>{
  let sent;
  const spec=await composeWithJev({ask:'What did I miss in the last month?',intel:datedIntel,now:NOW,runId:'fixture-run',fetchImpl:async(url,request)=>{
    sent=JSON.parse(request.body);
    return {ok:true,headers:new Headers({'x-request-id':'provider-fixture'}),json:async()=>({model:'jev-fixture',answers:{presentation:{choice:'latest',confidence:.97},perspective:{choice:'none',confidence:1}}})};
  }});
  assert.equal(sent.state.question,spec.ask);
  assert.equal(sent.state.dateWindow.start,'2026-09-28');
  assert.equal(spec.engine.modelCalled,true);
  assert.equal(spec.engine.providerResponseId,'provider-fixture');
  assert.equal(spec.evaluation.runId,'fixture-run');
  assert.equal(spec.evaluation.decisions.presentation.choice,'latest');
  assert.equal(spec.evaluation.selected.resources,2);
  assert.match(spec.evaluation.validation,/Passed/);
});
test('null and array request bodies return 400',async()=>{
  for(const body of ['null','[]']) assert.equal((await handler({httpMethod:'POST',body})).statusCode,400);
});
