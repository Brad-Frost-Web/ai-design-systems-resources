import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import syncModule from '../scripts/sync-notion.js';
const {sync,pageToResource}=syncModule;
const page={id:'source-id',created_time:'2026-10-19T18:06:00Z',properties:{Name:{title:[{plain_text:'Fresh resource'}]},URL:{url:'https://example.com/new'},Type:{multi_select:[{name:'article'}]},Tags:{multi_select:[]},Essential:{checkbox:false}}};
test('Notion multi-select type and created_time are supported',()=>{
  assert.equal(pageToResource(page).type,'article');
  assert.equal(pageToResource(page).created,page.created_time);
});
test('pull-only refresh preserves a human editorial correction',async()=>{
  const dir=mkdtempSync(path.join(tmpdir(),'resources-editorial-'));
  try {
    const filename=path.join(dir,'original-id.md');
    const corrected='---\ntitle: "Design Systems Collective"\nurl: "https://example.com/new"\nnotionId: "source-id"\nsource: "editorial"\ntags:\n  - "community|red"\n  - "publication|blue"\n---\n';
    writeFileSync(filename,corrected);
    const notionClient={databases:{query:async()=>({results:[page],has_more:false})}};
    await sync({pullOnly:true,notionClient,resourcesDir:dir,syncPath:path.join(dir,'receipt.json')});
    assert.equal(readFileSync(filename,'utf8'),corrected);
    assert.equal(readdirSync(dir).filter(f=>f.endsWith('.md')).length,1);
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test('pull-only refresh writes source receipt and never pushes local records',async()=>{
  const dir=mkdtempSync(path.join(tmpdir(),'resources-sync-'));
  try {
    writeFileSync(path.join(dir,'existing.md'),'---\ntitle: "Local"\nurl: "https://example.com/local-only"\n---\n');
    let pushes=0;
    const notionClient={databases:{query:async()=>({results:[page],has_more:false})},pages:{create:async()=>{pushes++;throw new Error('Not authorized');}}};
    const syncPath=path.join(dir,'receipt.json');
    await sync({pullOnly:true,notionClient,resourcesDir:dir,syncPath});
    assert.equal(pushes,0);
    assert.ok(readdirSync(dir).includes('2026-10-19-fresh-resource.md'));
    const receipt=JSON.parse(readFileSync(syncPath));
    assert.equal(receipt.direction,'pull-only');
    assert.equal(receipt.newestSourceEntry,page.created_time);
    assert.equal(receipt.sourceCount,1);
  } finally {rmSync(dir,{recursive:true,force:true});}
});
import resourcesModule from '../_data/resources.js';
test('public corpus deduplicates URLs, combines metadata, and excludes email links',()=>{
  const base={id:'original',href:'https://example.com',created:'2026-08-01',title:'A resource',tags:[{name:'mcp'}]};
  const records=resourcesModule.uniqueResources([base,{...base,id:'copy',href:'https://example.com/',created:'2026-09-01',essential:true,tags:[{name:'figma'}],slackSummary:'Useful context'},{...base,id:'private',href:'https://mail.google.com/mail/u/0/#drafts/private'},{...base,id:'bad',href:'javascript:alert(1)'}]);
  assert.equal(records.length,1);
  assert.equal(records[0].id,'original');
  assert.equal(records[0].created,'2026-08-01');
  assert.equal(records[0].essential,true);
  assert.equal(records[0].slackSummary,'Useful context');
  assert.deepEqual(records[0].tags.map(t=>t.name),['mcp','figma']);
});
