import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import milestoneData from './dist/milestone-data.js';
import {estimateRequirementHorizon as horizon} from './dist/horizons.js';
const make=(capabilityId,label,options={})=>horizon({capabilityId,tasks:[{id:'task',label}],...options});

test('generated constants retain the final source hash and direct fitted CDF arrays',()=>{
  const raw=fs.readFileSync(new URL('./dist/data/milestone-evidence.json',import.meta.url));
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),milestoneData.metadata.generatedFromSha256);
  for(const milestone of milestoneData.milestones){
    assert.equal(milestone.cdf.years.length,441);
    assert.equal(milestone.cdf.probabilities.length,441);
    assert.equal(milestone.cdf.years[0],2023);
    assert.equal(milestone.cdf.years.at(-1),3023);
  }
});

test('different physical action/object requirements use relevant different source anchors',()=>{
  const laundry=make('dexterity','Fold laundry');
  const assembly=make('dexterity','Assemble robot components using hand tools');
  const wiring=make('dexterity','Install electrical wiring in a house');
  assert.deepEqual(laundry.milestoneIds,['espai-task-laundry']);
  assert.deepEqual(assembly.milestoneIds,['espai-task-lego']);
  assert.deepEqual(wiring.milestoneIds,['espai-task-wiring']);
  assert.ok(laundry.baselineYear<assembly.baselineYear&&assembly.baselineYear<wiring.baselineYear);
  assert.ok(wiring.assumptions.some(s=>s.includes('transfer')));
});

test('software is not converted to physical work and administrative work is not a payment website',()=>{
  for(const cap of ['dexterity','hardware','mobility'])assert.equal(make(cap,'Load data, train a machine learning model and repair software').baselineYear,null);
  const website=make('digital','Build a payment website');
  const clerical=make('digital','Process invoice records in a spreadsheet');
  assert.deepEqual(website.milestoneIds,['espai-task-paymentsite']);
  assert.deepEqual(clerical.milestoneIds,['espai-task-python']);
  assert.equal(website.benchmark.contextOnly,true);
  assert.equal(website.benchmark.successTarget,.8);
  assert.ok(website.benchmark.durationBasis.includes('Illustrative'));
  assert.equal(clerical.benchmark,undefined);
});

test('actual O*NET Web Developer wording uses the website anchor without robotic tool assumptions',()=>{
  const tasks=[
    'Design, build, or maintain Web sites, using authoring or scripting languages, content creation tools, management tools, and digital media.',
    'Write supporting code for Web applications or Web sites.',
    'Develop and maintain websites and webpages.'
  ];
  for(const label of tasks){
    assert.deepEqual(make('digital',label).milestoneIds,['espai-task-paymentsite']);
    for(const cap of ['dexterity','hardware'])assert.equal(make(cap,label).baselineYear,null);
  }
});

test('explicit web registration and bounded email administration use labeled existing proxies',()=>{
  const registration=make('digital','Renew domain name registrations.');
  assert.deepEqual(registration.milestoneIds,['espai-task-python']);
  assert.ok(registration.anchors[0].reason.includes('registrar access'));
  const email='Respond to user email inquiries, or set up automated systems to send responses.';
  for(const cap of ['digital','social'])assert.deepEqual(make(cap,email).milestoneIds,['espai-task-phonebanking']);
  assert.ok(make('digital',email).anchors[0].reason.includes('channel'));
});

test('actual web infrastructure and design duties map to software proxies, never robotic manipulation',()=>{
  const fixtures=[
    ['Establish appropriate server directory trees.','espai-task-python'],
    ['Create Web models or prototypes that include physical, interface, logical, or data models.','espai-task-paymentsite'],
    ['Install and configure hypertext transfer protocol (HTTP) servers and associated operating systems.','espai-task-paymentsite'],
    ['Develop system interaction or sequence diagrams.','espai-task-paymentsite']
  ];
  for(const [label,id] of fixtures){
    for(const cap of ['digital','reasoning'])assert.deepEqual(make(cap,label).milestoneIds,[id],`${cap}: ${label}`);
    for(const cap of ['dexterity','hardware'])assert.equal(make(cap,label).baselineYear,null,`${cap}: ${label}`);
  }
});

test('repairing surgical equipment is not performing surgery on patients',()=>{
  for(const label of [
    'Repair or calibrate products, such as surgical lasers.',
    'Maintain equipment used to perform surgical procedures.',
    'Manufacture surgical instruments.'
  ])for(const cap of ['dexterity','safety'])assert.ok(!make(cap,label).milestoneIds.includes('espai-surgeon'),`${cap}: ${label}`);
  assert.deepEqual(make('dexterity','Repair or calibrate products, such as surgical lasers.').milestoneIds,['espai-task-wiring']);
  assert.deepEqual(make('safety','Perform surgery on patients.').milestoneIds,['espai-surgeon']);
  assert.deepEqual(make('dexterity','Suture damaged tissue and close wounds.').milestoneIds,['espai-surgeon']);
});

test('unknown, speculative science and unsupported safety do not inherit universal dates',()=>{
  for(const [cap,text] of [['unknown','Frobnicate the wizzle'],['frontier','Discover new laws of physics'],['safety','Handle radioactive nuclear waste'],['social','Provide psychotherapy and counseling']]){
    const result=make(cap,text);
    assert.equal(result.baselineYear,null);
    assert.deepEqual(result.milestoneIds,[]);
    assert.equal(result.coverage.complete,false);
  }
});

test('forecast scenario quantiles remain ordered without arbitrary date multipliers',()=>{
  for(const [cap,text] of [['digital','Build a payment website'],['dexterity','Install home electrical wiring'],['discovery','Prove new mathematical theorems'],['social','Answer telephone banking customer requests']]){
    const r=['accelerated','central','conservative'].map(scenario=>make(cap,text,{scenario}));
    assert.ok(r[0].baselineYear<=r[1].baselineYear&&r[1].baselineYear<=r[2].baselineYear);
    for(let i=0;i<3;i++)assert.equal(r[i].anchors[0].quantileName,['p10','p50','p90'][i]);
  }
});

test('dates derive from original survey anchor and evidence IDs resolve',()=>{
  const result=make('dexterity','Install home electrical wiring');
  const source=milestoneData.milestones.find(m=>m.milestoneId==='espai-task-wiring');
  assert.equal(result.baselineYear,Math.round(source.quantiles.p50));
  assert.equal(make('dexterity','Install home electrical wiring',{assessmentYear:2030}).baselineYear,result.baselineYear);
  assert.ok(result.evidenceIds.includes(source.sourceId));
  assert.ok(!result.milestoneIds.includes('espai-hlmi'));
  assert.ok(!result.milestoneIds.includes('espai-faol'));
  assert.ok(!result.milestoneIds.includes('espai-final-occupation'));
});

test('changing severity alone does not generate artificial distinct years',()=>{
  const a=make('dexterity','Fold laundry',{severity:.1});
  const b=make('dexterity','Fold laundry',{severity:.9});
  assert.equal(a.baselineYear,b.baselineYear);
});

test('matched subset remains explicitly partial',()=>{
  const result=horizon({capabilityId:'digital',tasks:[{id:'known',label:'Build a payment website'},{id:'unknown',label:'Frobnicate the wizzle'}]});
  assert.ok(Number.isInteger(result.baselineYear));
  assert.equal(result.coverage.complete,false);
  assert.deepEqual(result.coverage.unmatchedTaskIds,['unknown']);
  assert.ok(result.assumptions.some(s=>s.includes('unresolved requirements are solved no later')));
});

test('a missing selected quantile is not filled from a different scenario',()=>{
  const source=milestoneData.milestones.find(m=>m.milestoneId==='espai-task-phonebanking');
  const previous=source.quantiles.p90;
  try{
    source.quantiles.p90=null;
    const result=make('social','Answer telephone banking customer requests',{scenario:'conservative'});
    assert.equal(result.baselineYear,null);
    assert.deepEqual(result.coverage.missingQuantileIds,['espai-task-phonebanking']);
  }finally{source.quantiles.p90=previous;}
});

test('named occupation data are used only for the corresponding role, not every medical role',()=>{
  const surgeon=make('safety','Perform surgery',{occupation:{title:'Pediatric Surgeons',source:'onet',originalTaskIds:['task']}});
  const nurse=make('safety','Administer medication and monitor patients',{occupation:{title:'Registered Nurses',source:'onet'}});
  assert.deepEqual(surgeon.milestoneIds,['espai-surgeon']);
  assert.equal(surgeon.anchors[0].matchType,'named occupation forecast');
  assert.equal(nurse.baselineYear,null);
});

test('added clinical duties do not silently become the retained whole-surgeon event',()=>{
  const occupation={title:'Surgeon',source:'onet',originalScopeRetained:true,originalTaskIds:['original']};
  const result=horizon({capabilityId:'reasoning',occupation,tasks:[
    {id:'original',label:'Diagnose patients before surgery',sourceId:'onet:original'},
    {id:'added-clinical',label:'Diagnose rare inherited diseases in patients',type:'custom'}
  ]});
  const whole=result.anchors.find(a=>a.milestoneId==='espai-surgeon');
  assert.deepEqual(whole.taskIds,['original']);
  assert.ok(result.anchors.some(a=>a.milestoneId==='espai-task-nodefanswer'&&a.taskIds.includes('added-clinical')));
  const safety=make('safety','Diagnose rare inherited diseases in patients',{occupation});
  assert.equal(safety.baselineYear,null);
});

test('edited roles and local clerical tasks do not inherit a named full-occupation date',()=>{
  for(const occupation of [
    {title:'Surgeon',source:'custom'},
    {title:'Surgeon',source:'onet',originalScopeRetained:false},
    {title:'Surgeon',source:'onet',originalScopeRetained:true},
    {title:'Heavy Truck Drivers',source:'onet',originalScopeRetained:true}
  ]){
    const r=make('digital','Process invoice records in a spreadsheet',{occupation});
    assert.deepEqual(r.milestoneIds,['espai-task-python']);
  }
  const customSurgery=make('safety','Perform surgery',{occupation:{title:'Surgeon',source:'custom'}});
  assert.equal(customSurgery.anchors[0].matchType,'occupation-to-task proxy');
});

test('current physical exposure evidence informs readiness, not a fabricated current date',()=>{
  const result=horizon({capabilityId:'dexterity',tasks:[{id:'1',label:'Fold laundry',automationEvidence:{physical:true,exposureTier:'E1',sourceId:'robot-task-evidence',sources:[{maturity:'demo',autonomyStatus:'unclear'}]}}]});
  assert.ok(result.baselineYear>2026);
  assert.equal(result.readinessEvidence.assessedTasks,1);
  assert.ok(result.evidenceIds.includes('robot-task-evidence'));
});

test('past survey dates are explicitly not treated as observed achievements',()=>{
  const result=make('digital','Process invoice records in a spreadsheet',{scenario:'accelerated'});
  assert.equal(result.baselineYear,2026);
  assert.equal(result.anchors[0].pastSurveyEstimate,true);
  assert.ok(result.limitations.some(s=>s.includes('not evidence')));
});
