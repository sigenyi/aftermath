import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {installCatalog,loadOccupation,catalog} from './dist/catalog.js';
import {buildReport,resolveRole} from './dist/engine.js';
import {prepareOccupation} from './dist/profile.js';
const read=async file=>JSON.parse(await readFile(new URL(file,import.meta.url),'utf8'));
const index=await read('./dist/data/catalog-index.json'),evidence=await read('./dist/data/evidence.json');
installCatalog(index,evidence);
const localRead=path=>read(`./dist/${path}`);
test('complete source index retains all three source populations and distinct IDs',()=>{
  assert.equal(catalog.length,index.metadata.totalRecords);assert.equal(new Set(catalog.map(r=>r.id)).size,catalog.length);
  assert.equal(catalog.filter(r=>r.source==='onet').length,1016);assert.equal(catalog.filter(r=>r.source==='esco').length,3039);assert.equal(catalog.filter(r=>r.source==='isco').length,436);
});
test('known title and code resolve without forcing unknown jobs into nearest records',()=>{
  assert.equal(resolveRole('15-1252.00').role.sourceCode,'15-1252.00');assert.equal(resolveRole('Registered Nurses').role.sourceCode,'29-1141.00');assert.equal(resolveRole('Orbital memory gardener').matched,false);
});
test('detail loading retains full source profile and returns independent copies',async()=>{
  const first=await loadOccupation('onet:29-1141.00',localRead),second=await loadOccupation('onet:29-1141.00',localRead);assert.ok(first.tasks.length>4);assert.ok(Object.keys(first.features).length>0);first.tasks[0].label='changed';assert.notEqual(second.tasks[0].label,'changed');
});
test('description-only records are explicit proxies, not invented duty lists',()=>{
  const profile=prepareOccupation({id:'isco:0000',source:'isco',title:'Broad classification',tasks:[]});assert.equal(profile.tasks.length,1);assert.equal(profile.tasks[0].type,'description-proxy');
});
test('optional skills do not silently become mandatory and Unicode duties remain distinct',()=>{
  const profile=prepareOccupation({id:'custom:one',tasks:[{label:'修理电线'},{label:'检查设备'},{label:'检查设备'},{label:'Optional activity',type:'optional-skill'}]});assert.equal(profile.tasks.length,2);
});
test('report joins real references and computes an integer single-year endpoint',async()=>{
  const occupation=await loadOccupation('onet:47-2111.00',localRead),profile=prepareOccupation(occupation);
  const report=buildReport({title:occupation.title,occupation,tasks:profile.tasks,assessmentYear:2026});assert.equal(report.fullAutomation.label,String(report.baselineYear));assert.ok(Number.isInteger(report.baselineYear));assert.ok(report.sources.length>3);assert.equal(report.sourceRecord.url,occupation.sourceUrl);assert.equal(report.tasks.length,profile.tasks.length);assert.ok(report.capabilities.length>1);
});
test('custom profiles keep all requirements and do not inherit false occupational provenance',()=>{
  const report=buildReport({title:'Hybrid role',tasks:[{label:'Write software and resolve failures'},{label:'Repair delicate underwater machinery'}],assessmentYear:2026});assert.equal(report.tasks.length,2);assert.equal(report.sourceRecord,null);assert.equal(report.source,'custom');assert.ok(report.capabilities.some(c=>c.id==='dexterity'));assert.ok(report.capabilities.some(c=>c.id==='digital'));
});
test('empty work profile cannot fabricate a forecast',()=>{assert.throws(()=>buildReport({title:'Unknown',tasks:[]}),/at least one/);});
test('missing detail records fail with a useful error',async()=>{await assert.rejects(loadOccupation('not-a-real-id',localRead),/not in the current catalog/);});
test('replacing source duties does not keep unrelated original physical demands',async()=>{
  const occupation=await loadOccupation('onet:47-2111.00',localRead),tasks=[{id:'added-1',label:'Enter invoices in a spreadsheet',type:'custom-task'}];
  const edited=buildReport({title:occupation.title,occupation,tasks,assessmentYear:2026}),custom=buildReport({title:'Data entry',tasks,assessmentYear:2026});
  assert.equal(edited.profileCustomized,true);assert.equal(edited.baselineYear,custom.baselineYear);assert.deepEqual(edited.capabilities.map(c=>c.id),custom.capabilities.map(c=>c.id));
});

test('canonical title outranks aliases and ambiguous aliases require a choice',()=>{
  assert.equal(resolveRole('data scientist').role.title.toLowerCase(),'data scientist');
  assert.equal(resolveRole('doctor').ambiguous,true);
});

test('adding duties preserves source-wide demands and cannot bring automation forward',async()=>{
  const occupation=await loadOccupation('onet:11-1021.00',localRead),tasks=prepareOccupation(occupation).tasks;
  const base=buildReport({title:occupation.title,occupation,tasks,assessmentYear:2026});
  const expanded=buildReport({title:occupation.title,occupation,tasks:[...tasks,{id:'added-one',label:'Enter invoices in a spreadsheet'}],assessmentYear:2026});
  assert.equal(expanded.profileCustomized,true);assert.equal(expanded.sourceRatingsOmitted,false);assert.ok(expanded.baselineYear>=base.baselineYear);
});
