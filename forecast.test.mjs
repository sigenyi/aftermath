import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assessOccupation,capabilityDefinitions,MODEL_AS_OF} from './dist/forecast.js';
const evidence=JSON.parse(fs.readFileSync(new URL('./dist/data/evidence.json',import.meta.url)));
const sourceIds=new Set(evidence.sources.map(s=>s.id));
const report=(tasks,options={})=>assessOccupation({title:'Test role',source:'custom',tasks},options);

test('all capability citations resolve to dated primary evidence before cutoff',()=>{
  assert.equal(sourceIds.size,evidence.sources.length);
  assert.ok(sourceIds.size>=25);
  for(const source of evidence.sources){
    assert.ok(source.title&&source.observation&&source.limitation&&source.forecastUse);
    assert.ok(source.url.startsWith('https://'));
    assert.ok(new Date(source.date)<=new Date(MODEL_AS_OF),source.id);
  }
  for(const cap of Object.values(capabilityDefinitions)){
    assert.equal(cap.parameterStatus,'analyst assumption; not empirically calibrated');
    for(const id of cap.evidenceIds)assert.ok(sourceIds.has(id),id);
    for(const id of cap.dependencies)assert.ok(capabilityDefinitions[id],id);
  }
  for(const id of report(['Enter invoice records']).evidenceIds)assert.ok(sourceIds.has(id),id);
});

test('simple work can have one front; physical work can require coupled fronts',()=>{
  const simple=report(['Enter invoice records']);
  assert.deepEqual(simple.capabilities.map(c=>c.id),['digital']);
  const physical=report(['Repair a cabinet using hand tools']);
  assert.ok(physical.capabilities.some(c=>c.id==='dexterity'));
  assert.ok(physical.capabilities.some(c=>c.id==='perception'));
  assert.equal(physical.technicalYear,Math.max(...physical.capabilities.map(c=>c.baselineYear)));
  assert.equal(physical.baselineYear,physical.technicalYear+physical.integrationYears);
});

test('scenario ordering is monotonic across different requirement fronts',()=>{
  for(const task of ['Enter invoices','Negotiate complex legal disputes','Perform emergency surgery','Repair machinery outdoors','Discover new laws of physics for interstellar travel','Zibble the frobnicator']){
    const outputs=['accelerated','central','conservative'].map(scenario=>report([task],{scenario}));
    assert.ok(outputs[0].baselineYear<=outputs[1].baselineYear,task);
    assert.ok(outputs[1].baselineYear<=outputs[2].baselineYear,task);
    for(const cap of outputs[0].capabilities){
      assert.ok(cap.baselineYear<=outputs[1].capabilities.find(c=>c.id===cap.id).baselineYear);
      assert.ok(outputs[1].capabilities.find(c=>c.id===cap.id).baselineYear<=outputs[2].capabilities.find(c=>c.id===cap.id).baselineYear);
    }
  }
});

test('harder requirements never average away and individual task dates stay local',()=>{
  const easy={id:'easy',label:'Analyze records'};
  const hard={id:'hard',label:'Analyze complex unfamiliar strategic problems'};
  const a=report([easy]);const b=report([easy,hard]);
  assert.ok(b.baselineYear>=a.baselineYear);
  assert.equal(b.tasks[0].baselineYear,a.tasks[0].baselineYear);
  assert.ok(b.tasks[1].baselineYear>b.tasks[0].baselineYear);
  const many=report([...Array.from({length:100},(_,i)=>({id:`routine-${i}`,label:'Enter invoice records'})),hard]);
  assert.ok(many.technicalYear>=report([hard]).technicalYear);
});

test('every supplied task and its source provenance survive assessment',()=>{
  const tasks=[{id:'real',label:'Wash instruments',sourceId:'source:1',type:'Core',importance:4.8},{id:'opaque',label:'Frobnicate zibbles',sourceId:'source:2',type:'essential-skill'}];
  const output=report(tasks);
  assert.equal(output.tasks.length,2);
  for(let i=0;i<tasks.length;i++)for(const [key,value] of Object.entries(tasks[i]))assert.equal(output.tasks[i][key],value);
  assert.equal(output.coverage.unmappedTasks,1);
  assert.equal(output.coverage.proxyTasks,1);
  assert.ok(output.capabilities.some(c=>c.id==='unknown'));
  assert.equal(output.coverage.complete,false);
});

test('explicit speculative requirements support horizons beyond a century without a cap',()=>{
  const output=report(['Discover new laws of physics for interstellar travel']);
  assert.ok(output.baselineYear>2126);
  assert.ok(output.capabilities.some(c=>c.id==='frontier'));
  assert.ok(output.capabilities.find(c=>c.id==='frontier').assumptions.some(s=>s.includes('not established')));
});

test('digital terminology is not mistaken for physical or expressive work',()=>{
  const cases=[
    ['Perform data entry in a spreadsheet',['digital']],
    ['Load data into a database',['digital']],
    ['Train a machine learning model',['digital']],
    ['Conduct data mining and analyze datasets',['digital','reasoning']],
    ['Use a single screwdriver to repair a cabinet',['dexterity','perception']],
    ['Write and debug software',['digital']],
  ];
  for(const [task,expected] of cases)assert.deepEqual(report([task]).capabilities.map(c=>c.id).sort(),expected.sort(),task);
  assert.ok(!report(['Perform emergency surgery']).capabilities.some(c=>c.id==='creative'));
});

test('role ratings constrain the role without falsely annotating individual tasks',()=>{
  const task={id:'1',label:'Analyze records'};
  const low=assessOccupation({tasks:[task],features:{'1.A.1.b.4:LV':3.5}});
  const high=assessOccupation({tasks:[task],features:{'1.A.1.b.4:LV':7}});
  assert.ok(high.baselineYear>=low.baselineYear);
  assert.equal(high.tasks[0].baselineYear,low.tasks[0].baselineYear);
  assert.ok(high.capabilities.find(c=>c.id==='reasoning').mappingDetails.some(d=>d.basis==='O*NET occupation-level rating'));
  assert.equal(high.coverage.structuredFeatureCount,1);
});

test('source-classified knowledge does not fabricate physical work or discoveries',()=>{
  const r=report([
    {id:'k1',label:'mechanics',sourceId:'esco:k1',type:'essential-skill',skillType:'knowledge'},
    {id:'k2',label:'chemistry',sourceId:'esco:k2',type:'essential-skill',skillType:'knowledge'},
    {id:'k3',label:'operation of hazardous machinery',sourceId:'esco:k3',type:'essential-skill',skillType:'knowledge'}
  ]);
  assert.deepEqual(r.capabilities.map(c=>c.id),['reasoning']);
  assert.equal(r.coverage.inferredTasks,3);
  assert.equal(r.coverage.proxyTasks,3);
  assert.equal(r.coverage.complete,false);
  assert.ok(r.tasks.every(t=>t.mappingDetails.some(d=>d.basis==='ESCO knowledge type')));
  const edited=report([{id:'k1',label:'Repair a cabinet',type:'edited-task',skillType:'knowledge'}]);
  assert.ok(edited.capabilities.some(c=>c.id==='dexterity'));
  assert.ok(!edited.tasks[0].mappingDetails.some(d=>d.basis==='ESCO knowledge type'));
});

test('missing task profiles become clearly labeled incomplete proxies',()=>{
  const r=assessOccupation({title:'Unspecified role',description:'All workers not listed separately',iscoCode:'9'});
  assert.equal(r.tasks.length,1);assert.equal(r.tasks[0].type,'description-proxy');
  assert.equal(r.coverage.proxyTasks,1);
  assert.ok(r.capabilities.some(c=>c.id==='unknown'));
  assert.ok(r.capabilities.some(c=>c.mappingDetails.some(d=>d.basis==='occupational classification prior')));
});

test('invalid settings reject and changing the calendar does not silently refresh evidence',()=>{
  assert.throws(()=>report(['Enter records'],{scenario:'magical'}),RangeError);
  assert.throws(()=>report(['Enter records'],{assessmentYear:NaN}),RangeError);
  const future=report(['Enter records'],{assessmentYear:2100});
  assert.ok(future.baselineYear>=2100);
  assert.equal(future.modelAsOf,'2026-10-30');
  assert.ok(future.limitations.some(s=>s.includes('does not update')));
});
