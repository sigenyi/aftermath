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
test('report joins source references and presents its conditional point with evidence status',async()=>{
  const occupation=await loadOccupation('onet:47-2111.00',localRead),profile=prepareOccupation(occupation);
  const report=buildReport({title:occupation.title,occupation,tasks:profile.tasks,assessmentYear:2026});assert.equal(report.fullAutomation.label,String(report.baselineYear));assert.ok(Number.isInteger(report.baselineYear));assert.ok(report.sources.length>3);assert.equal(report.sourceRecord.url,occupation.sourceUrl);assert.equal(report.tasks.length,profile.tasks.length);assert.ok(report.capabilities.length>1);
  assert.ok(['partial','conditional'].includes(report.forecastStatus));
  assert.equal(report.coverage.complete,false);
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
  assert.equal(edited.sourceRatingsOmitted,true);
});

test('actual Web Developers profile has digital work without invented robotic prerequisites',async()=>{
  const occupation=await loadOccupation('onet:15-1254.00',localRead),tasks=prepareOccupation(occupation).tasks;
  const r=buildReport({title:occupation.title,occupation,tasks,assessmentYear:2026});
  assert.equal(r.tasks.length,29);
  assert.ok(r.capabilities.some(cap=>cap.id==='digital'));
  assert.ok(!r.capabilities.some(cap=>['dexterity','mobility','hardware','perception'].includes(cap.id)));
  const registration=r.tasks.find(task=>task.label==='Renew domain name registrations.');
  assert.ok(registration);
  assert.ok(!registration.capabilityIds.includes('unknown'),'A routine domain renewal is not an unknown scientific breakthrough.');
  assert.equal(r.sourceCode,'15-1254.00');
});

test('replacing surgeon or truck-driver work removes stale named-occupation anchors',async()=>{
  const tasks=[{id:'added-invoice',label:'Enter invoices into a spreadsheet',type:'custom-task'}];
  const plain=buildReport({title:'Invoice processing',tasks,assessmentYear:2026});
  for(const id of ['onet:29-1022.00','onet:53-3032.00']) {
    const occupation=await loadOccupation(id,localRead);
    const adapted=buildReport({title:occupation.title,occupation,tasks,assessmentYear:2026});
    assert.equal(adapted.profileCustomized,true);
    assert.equal(adapted.sourceRatingsOmitted,true);
    assert.equal(adapted.baselineYear,plain.baselineYear,occupation.title);
    assert.deepEqual(adapted.capabilities.map(c=>c.id),plain.capabilities.map(c=>c.id));
    assert.ok(!adapted.capabilities.flatMap(c=>c.anchors||[]).some(a=>a.matchType==='named occupation forecast'));
    assert.match(adapted.sourceRecord.observation,/adapted/);
  }
  const titleOnly=buildReport({title:'Surgeon',tasks,assessmentYear:2026});
  assert.equal(titleOnly.baselineYear,plain.baselineYear,'A custom title is not evidence of the named occupation work scope.');
});

test('replacing digital source work does not retain its old description as inference context',async()=>{
  const occupation=await loadOccupation('onet:15-1254.00',localRead);
  const tasks=[{id:'added-monitor',label:'Monitor functioning of equipment',type:'custom-task'}];
  const edited=buildReport({title:occupation.title,occupation,tasks,assessmentYear:2026});
  const independent=buildReport({title:'Equipment monitoring',tasks,assessmentYear:2026});
  assert.equal(edited.sourceRatingsOmitted,true);
  assert.deepEqual(edited.tasks[0].capabilityIds,independent.tasks[0].capabilityIds);
  assert.ok(!edited.tasks[0].mappingDetails.some(d=>d.basis==='source description context'));
});

test('changed source wording loses task research while untouched requirements preserve provenance',async()=>{
  const occupation=await loadOccupation('onet:29-1022.00',localRead),tasks=prepareOccupation(occupation).tasks;
  const researched=tasks.filter(t=>t.automationEvidence);
  assert.ok(researched.length>=2,'The generated occupation detail must retain joined task research.');
  const changedId=researched[0].id,untouchedId=researched[1].id;
  const modified=tasks.map(t=>t.id===changedId?{...t,label:'Enter invoices into a spreadsheet'}:t);
  const r=buildReport({title:occupation.title,occupation,tasks:modified,assessmentYear:2026});
  assert.equal(r.tasks.find(t=>t.id===changedId).automationEvidence,undefined,'The engine must catch changed text even if a caller forgets to delete sourceId.');
  assert.deepEqual(r.tasks.find(t=>t.id===untouchedId).automationEvidence,researched[1].automationEvidence);
  assert.ok(occupation.tasks.find(t=>t.id===changedId).automationEvidence,'The source object must not be mutated by a report edit.');
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
  assert.equal(expanded.coverage.structuredFeatureCount,base.coverage.structuredFeatureCount);
  for(const task of base.tasks)assert.ok(expanded.tasks.some(t=>t.id===task.id&&t.label===task.label));
});

test('an appended unrelated duty does not inherit the retained named-occupation forecast',async()=>{
  const occupation=await loadOccupation('onet:29-1022.00',localRead),tasks=prepareOccupation(occupation).tasks;
  const r=buildReport({title:occupation.title,occupation,tasks:[...tasks,{id:'added-truck',label:'Drive a truck along public roads',type:'custom-task'}],assessmentYear:2026});
  assert.equal(r.profileCustomized,true);
  assert.equal(r.sourceRatingsOmitted,false);
  assert.ok(r.capabilities.flatMap(cap=>cap.milestoneIds||[]).includes('espai-surgeon'),'Unchanged source duties retain their named-occupation evidence.');
  const extra=r.tasks.find(task=>task.id==='added-truck');
  assert.ok(!extra.milestoneIds.includes('espai-surgeon'),'A surgeon survey does not date newly added truck driving.');
  assert.ok(extra.milestoneIds.includes('espai-truckdriver'));
});
