import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assessOccupation,capabilityDefinitions,MODEL_AS_OF} from './dist/forecast.js';
const evidence=JSON.parse(fs.readFileSync(new URL('./dist/data/evidence.json',import.meta.url)));
const sourceIds=new Set(evidence.sources.map(s=>s.id));
const report=(tasks,options={})=>assessOccupation({title:'Test role',source:'custom',tasks},options);

test('capability citations resolve to versioned evidence metadata before the review cutoff',()=>{
  assert.equal(sourceIds.size,evidence.sources.length);
  assert.ok(sourceIds.size>=25);
  for(const source of evidence.sources){
    assert.ok(source.title&&source.observation&&source.limitation&&source.forecastUse);
    assert.ok(source.url.startsWith('https://'));
    assert.ok(new Date(source.date)<=new Date(MODEL_AS_OF),source.id);
  }
  for(const cap of Object.values(capabilityDefinitions)){
    assert.match(cap.parameterStatus,/not validated occupation prediction/);
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
  assert.ok(Number.isInteger(physical.baselineYear));
  assert.ok(physical.baselineYear>=Math.max(...physical.capabilities.map(c=>c.baselineYear).filter(Number.isFinite)));
  assert.equal(physical.integrationYears,0,'An unsupported fixed integration delay must not return.');
});

test('scenario ordering is monotonic across different requirement fronts',()=>{
  for(const task of ['Enter invoices','Negotiate complex legal disputes','Perform emergency surgery','Repair machinery outdoors','Discover new laws of physics for interstellar travel','Zibble the frobnicator']){
    const outputs=['accelerated','central','conservative'].map(scenario=>report([task],{scenario}));
    for(const output of outputs) {
      assert.ok(output.baselineYear===null||Number.isInteger(output.baselineYear),task);
      if(output.baselineYear===null)assert.equal(output.forecastStatus,'insufficient-evidence',task);
    }
    const dated=outputs.map(r=>r.baselineYear).filter(Number.isFinite);
    for(let i=1;i<dated.length;i++)assert.ok(dated[i-1]<=dated[i],task);
    for(const cap of outputs[0].capabilities) {
      const years=outputs.map(r=>r.capabilities.find(c=>c.id===cap.id).baselineYear).filter(Number.isFinite);
      for(let i=1;i<years.length;i++)assert.ok(years[i-1]<=years[i],`${task}: ${cap.id}`);
    }
  }
});

test('additional dated requirements do not average away and individual task dates stay local',()=>{
  const easy={id:'easy',label:'Analyze records'};
  const hard={id:'hard',label:'Analyze complex unfamiliar strategic problems'};
  const a=report([easy]);const b=report([easy,hard]);
  assert.ok(b.baselineYear>=a.baselineYear);
  assert.equal(b.tasks[0].baselineYear,a.tasks[0].baselineYear);
  assert.ok(b.baselineYear>=b.tasks[1].baselineYear);
  assert.ok(b.tasks[1].milestoneIds.length,'The demanding task needs a real source anchor, not a severity-only year offset.');
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

test('speculative and unexplained requirements remain undated instead of receiving an invented century',()=>{
  const output=report(['Discover new laws of physics for interstellar travel']);
  assert.equal(output.baselineYear,null);
  assert.equal(output.forecastStatus,'insufficient-evidence');
  assert.ok(output.capabilities.some(c=>c.id==='frontier'));
  assert.ok(output.capabilities.every(c=>c.baselineYear===null));
  assert.ok(output.tasks[0].undatedCapabilityIds.includes('frontier'));
  const unexplained=report(['Frobnicate the zibbles']);
  assert.equal(unexplained.baselineYear,null);
  assert.equal(unexplained.capabilities.find(c=>c.id==='unknown').baselineYear,null);
  assert.equal(unexplained.forecastStatus,'insufficient-evidence');
});

test('known work plus unresolved or speculative work is explicitly partial',()=>{
  for(const label of ['Frobnicate the zibbles','Discover new laws of physics for interstellar travel']) {
    const mixed=report([{id:'known',label:'Enter invoice records'},{id:'gap',label}]);
    assert.equal(mixed.forecastStatus,'partial');
    assert.ok(Number.isInteger(mixed.baselineYear));
    assert.equal(mixed.tasks.find(t=>t.id==='gap').baselineYear,null);
    assert.ok(mixed.coverage.undatedTasks>0);
    assert.ok(mixed.assumptions.some(s=>s.includes('partial')));
    assert.equal(mixed.coverage.complete,false);
  }
});

test('published physical work without an identified physical effect is an explicit evidence gap',()=>{
  const task={id:'source:1',sourceId:'onet:task',label:'Enter invoice records',automationEvidence:{physical:true,sourceId:'robot-task-evidence',sources:[],instances:[]}};
  const r=report([task]);
  assert.equal(r.tasks[0].physicalScopeGap,true);
  assert.ok(r.tasks[0].undatedCapabilityIds.includes('physical-scope-gap'));
  assert.equal(r.coverage.physicalScopeGaps,1);
  assert.equal(r.forecastStatus,'partial');
  assert.ok(!r.capabilities.some(c=>['dexterity','mobility','hardware'].includes(c.id)),'A source label alone must not invent an embodiment requirement.');
  assert.ok(r.limitations.some(s=>s.includes('disagreement')));
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

test('missing task profiles and broad classification titles cannot fabricate a full-job date',()=>{
  const r=assessOccupation({title:'Unspecified role',description:'All workers not listed separately',iscoCode:'9'});
  assert.equal(r.tasks.length,1);assert.equal(r.tasks[0].type,'description-proxy');
  assert.equal(r.coverage.proxyTasks,1);
  assert.ok(r.capabilities.some(c=>c.id==='unknown'));
  assert.equal(r.baselineYear,null);
  assert.ok(!r.capabilities.some(c=>['dexterity','mobility','hardware'].includes(c.id)));
  const named=assessOccupation({source:'isco',coverage:'classification',title:'Database Administrators',iscoCode:'2521',tasks:[]});
  assert.equal(named.baselineYear,null,'A recognizable category title still has no detailed task inventory.');
  assert.equal(named.forecastStatus,'insufficient-evidence');
  assert.equal(named.tasks[0].type,'description-proxy');
});

test('invalid settings reject and changing the calendar does not silently refresh evidence',()=>{
  assert.throws(()=>report(['Enter records'],{scenario:'magical'}),RangeError);
  assert.throws(()=>report(['Enter records'],{assessmentYear:NaN}),RangeError);
  const current=report(['Enter records'],{assessmentYear:2026});
  const future=report(['Enter records'],{assessmentYear:2100});
  assert.ok(future.baselineYear>=2100);
  assert.equal(future.modelAsOf,MODEL_AS_OF);
  const anchors=r=>r.capabilities.flatMap(c=>c.anchors||[]).map(a=>[a.milestoneId,a.quantileYear]);
  assert.deepEqual(anchors(future),anchors(current),'Changing the display year does not change the historical survey data.');
  assert.ok(future.limitations.some(s=>s.includes('historical judgments')));
});
