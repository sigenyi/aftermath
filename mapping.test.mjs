import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mapTask,occupationConstraints} from './dist/mapping.js';
import {prepareOccupation} from './dist/profile.js';
const onet=JSON.parse(readFileSync(new URL('./dist/data/onet.json',import.meta.url)));
const physicalIds=new Set(['dexterity','perception','mobility','hardware']);
const physical=m=>[...m.matches.keys()].filter(id=>physicalIds.has(id));
const map=(label,occupation={})=>mapTask({id:'task:one',label},0,occupation);

test('word-prefix, virtual-object and computer-interface language does not invent physical work',()=>{
  for(const label of [
    'Design, build, or maintain Web sites, using authoring or scripting languages, content creation tools, management tools, and digital media.',
    'Provide clear descriptions of Web site specifications, including operating systems software and hardware.',
    'Design and implement Web site security measures, such as firewalls and message encryption.',
    'Recommend data-driven solutions to key stakeholders.',
    'Create graphs or other visualizations to convey results of data analysis using software.',
    'Prepare adjusting journal entries.',
    'Load data into a database.',
    'Train a machine learning model.',
    'Install software on computer hardware.',
    'Configure a search engine using digital tools.',
    'Simulate driving a truck through virtual terrain.',
    'Create a physical data model for a database.',
    'Operate computer equipment and GPS systems.',
    'Plan or adjust routes using computer equipment.',
    'Maintain current electrician license or identification card.',
    'Prepare sketches and blueprints showing electrical equipment.',
    'Supervise workers who install and repair electrical equipment.',
    'Train workers to install, maintain, or repair electrical equipment.',
    'Design test control apparatus or develop procedures for testing products.',
    'Obtain receipts or signatures for delivered goods.',
    'Collect fuel consumption data.',
    'Inspect cargo records and prepare reports.',
  ])assert.deepEqual(physical(map(label)),[],label);
});

test('mixed digital and physical tasks keep actual manipulation and movement',()=>{
  for(const [label,expected] of [
    ['Repair computer hardware and update software.','dexterity'],
    ['Install electrical sensors and configure software.','dexterity'],
    ['Load machines with paper, cards, disks, tape, or Braille media.','dexterity'],
    ['Repair a cabinet using hand tools.','dexterity'],
    ['Administer medications to patients.','dexterity'],
    ['Perform emergency surgery.','dexterity'],
    ['Install, calibrate, operate, or maintain robots.','dexterity'],
    ['Supply machine with appropriate tools.','dexterity'],
    ['Remove inadequate workpieces.','dexterity'],
    ['Monitor automated machines.','perception'],
    ['Inspect quality of products.','perception'],
    ['Drive trucks and use scheduling software.','mobility'],
    ['Operate forklift.','mobility'],
    ['Operate machinery.','hardware'],
  ])assert.ok(map(label).matches.has(expected),`${label}: expected ${expected}`);
  assert.ok(!map('Operate machinery.').matches.has('dexterity'),'Operating equipment alone does not prove adaptive hand manipulation.');
});

test('reviewed digital and analytical O*NET profiles have no unsupported physical effects',()=>{
  for(const code of ['15-1254.00','15-1255.00','15-1252.00','15-2051.00','13-2011.00']) {
    const role=onet.roles.find(r=>r.sourceCode===code);
    const mapped=role.tasks.map((task,i)=>mapTask(task,i,role));
    assert.deepEqual(mapped.flatMap(physical),[],role.title);
    assert.ok(!occupationConstraints(role,mapped).constraints.some(c=>physicalIds.has(c.id)),role.title);
  }
});

test('reviewed clinical, trades, transport and mixed computing occupations retain physical effects',()=>{
  for(const [code,expected] of [['29-1141.00','dexterity'],['47-2111.00','dexterity'],['53-3032.00','mobility'],['17-2199.08','dexterity'],['43-9021.00','dexterity']]) {
    const role=onet.roles.find(r=>r.sourceCode===code),mapped=role.tasks.map((task,i)=>mapTask(task,i,role));
    assert.ok(mapped.some(task=>task.matches.has(expected)),`${role.title}: ${expected}`);
  }
});

test('human motor ratings cannot create a robot requirement without a physical task',()=>{
  const occupation={iscoCode:'9',features:{'1.A.2.a.2:LV':7,'1.A.2.a.3:LV':7,'1.A.2.b.1:LV':7,'4.C.2.d.1.g:CX':5,'4.A.3.a.4:LV':7}};
  const result=occupationConstraints(occupation,[map('Enter invoice records in software.')]);
  assert.equal(result.structuredFeatureCount,5);
  assert.equal(result.constraints.length,0);
  assert.equal(result.suppressedConstraints.length,5);
  const actual=occupationConstraints(occupation,[map('Load paper into machines.')]);
  assert.ok(actual.constraints.some(c=>c.id==='dexterity'));
  assert.ok(!actual.constraints.some(c=>c.id==='mobility'));
});

test('routine technical writing and idea-generation ratings do not require artistic direction',()=>{
  for(const label of [
    'Write supporting code for Web applications or Web sites.',
    'Design, build, or maintain Web sites, using authoring or scripting languages, content creation tools, management tools, and digital media.',
    'Write and edit technical documentation, user manuals, testing protocols, and reports.',
    'Represent clients before taxing authorities.',
  ])assert.ok(!map(label).matches.has('creative'),label);
  assert.ok(map('Write original novels and stories.').matches.has('creative'));
  const general=occupationConstraints({features:{'1.A.1.b.2:LV':7}},[map('Analyze records')]);
  assert.ok(!general.constraints.some(c=>c.id==='creative'));
  assert.ok(general.constraints.some(c=>c.id==='reasoning'&&c.key==='1.A.1.b.2:LV'));
  const artistic=occupationConstraints({features:{'1.A.1.b.2:LV':7}},[map('Write original novels and stories.')]);
  assert.ok(artistic.constraints.some(c=>c.id==='creative'));
});

test('servers, information, references and place nouns do not become interpersonal actions',()=>{
  for(const label of [
    'Establish appropriate server directory trees.',
    'Document technical factors such as server load, bandwidth and database performance.',
    'Evaluate or recommend server hardware or software.',
    'Install and configure HTTP servers and associated operating systems.',
    'Analyze information and review reference documentation.',
    'Drive trucks along public roads.',
    'Water trees in nurseries.',
  ])assert.ok(!map(label).matches.has('social'),label);
  for(const label of ['Serve customers and answer questions.','Inform staff of changes.','Refer employees to appropriate services.'])assert.ok(map(label).matches.has('social'),label);
});

test('continuing one’s own education is distinct from teaching other people',()=>{
  const learning=map('Maintain understanding of current Web technologies or programming practices through continuing education, reading, or participation in professional conferences, workshops, or groups.');
  assert.ok(!learning.matches.has('social'));
  assert.ok(learning.matches.has('reasoning'));
  for(const label of ['Teach chemistry to students.','Train workers to repair electrical equipment.','Provide instruction to students.'])assert.ok(map(label).matches.has('social'),label);
});

test('building and regulatory codes do not imply software development',()=>{
  const cases=[
    'Prepare sketches or follow blueprints to determine wiring locations and ensure conformance to building and safety codes.',
    'Plan layout and installation of electrical wiring, based on job specifications and local codes.',
    'Inspect electrical systems and equipment for hazards and compliance with codes.',
    'Review tax and revenue codes.',
  ];
  for(const label of cases)assert.ok(!map(label).matches.has('digital'),label);
  assert.ok(map(cases[0]).matches.has('reasoning'));
  assert.ok(map(cases[2]).matches.has('perception'));
  assert.ok(map('Write supporting code for a software application.').matches.has('digital'));
});

test('source-classified knowledge and truly unexplained work remain honest proxies',()=>{
  const knowledge=mapTask({id:'k',label:'surgery and mechanical engineering',sourceId:'esco:skill',type:'essential-skill',skillType:'knowledge'});
  assert.deepEqual([...knowledge.matches.keys()],['reasoning']);
  assert.ok(knowledge.details.some(d=>d.basis==='ESCO knowledge type'));
  assert.deepEqual([...map('Frobnicate the zibbles.').matches.keys()],['unknown']);
  assert.ok(map('Frobnicate the zibbles.').matches.get('unknown').requirements[0].includes('more task detail'));
  for(const label of ['Renew domain name registrations.','Give constructive feedback.','Handle financial transactions.','Accept own accountability.','Monitor stock level.','Liaise with engineers.'])assert.ok(!map(label).matches.has('unknown'),label);
});

test('physical inspection and operative execution are recognized without treating supervision as execution',()=>{
  for(const [label,expected] of [
    ['Assess sites to determine suitability for solar equipment, using equipment such as tape measures, compasses, and computer software.','perception'],
    ['Set and verify parts clearances.','dexterity'],
    ['Follow established surgical techniques during the operation.','dexterity'],
    ['Perform transplantation operations, such as organ transplants, on fetuses, infants, children, and adolescents.','dexterity'],
    ['Examine fetuses, infants, children, and adolescents, and diagnose health issues to determine need for intervention, such as surgery.','perception'],
    ['Provide consultation and surgical assistance to other physicians and surgeons.','dexterity'],
    ['Inspect loads to ensure that cargo is secure.','perception'],
    ['Check conditions of trailers after contents have been unloaded to ensure that there has been no damage.','perception'],
    ['Inventory and inspect goods to be moved to determine quantities and conditions.','perception'],
    ['Perform basic vehicle maintenance tasks, such as adding oil, fuel, or radiator fluid, performing minor repairs, or washing trucks.','dexterity'],
    ['Follow special cargo-related procedures, such as checking refrigeration systems for frozen foods or providing food or water for livestock.','perception'],
    ['Operate idle reduction systems or auxiliary power systems to generate power from alternative sources, such as fuel cells.','hardware'],
  ])assert.ok(map(label).matches.has(expected),`${label}: expected ${expected}`);
  for(const label of ['Teach students to follow surgical techniques during the operation.','Supervise transplantation operations on patients.','Conduct research to develop and test surgical techniques.'])assert.ok(!map(label).matches.has('dexterity'),label);
});

test('mapping preserves task provenance and records independent research disagreements',()=>{
  const task={id:'t',label:'Repair electrical wiring.',sourceId:'onet:test',type:'Core',importance:4.7,automationEvidence:{physical:false,exposureTier:'E0',sourceId:'robot-task-evidence'}};
  const before=structuredClone(task),mapped=mapTask(task);
  assert.deepEqual(task,before);assert.deepEqual(mapped.original,before);
  assert.ok(mapped.matches.has('dexterity'));
  assert.ok(mapped.details.some(d=>d.basis==='published task assessment'&&d.disagreement));
  const opaque=mapTask({...task,label:'Frobnicate the zibbles.',automationEvidence:{...task.automationEvidence,physical:true}});
  assert.deepEqual(physical(opaque),[],'Source physical=true cannot itself mean adaptable robotic hands.');
  const edited=mapTask({...task,sourceId:undefined});
  assert.ok(!edited.details.some(d=>d.basis==='published task assessment'),'Edited text cannot inherit source evidence.');
});

test('all current catalog physical mappings and ratings expose an explicit effect basis',()=>{
  let requirements=0;
  for(const source of ['onet','esco','isco']) {
    const {roles}=JSON.parse(readFileSync(new URL(`./dist/data/${source}.json`,import.meta.url)));
    for(const occupation of roles) {
      const mapped=prepareOccupation(occupation).tasks.map((task,index)=>mapTask(task,index,occupation));
      requirements+=mapped.length;
      for(const task of mapped)for(const id of physical(task))assert.ok(task.details.some(d=>d.capabilityId===id&&d.physicalEvidence),`${occupation.id} ${task.original.id} ${id}`);
      const physicalKinds=new Set(mapped.flatMap(physical));
      for(const c of occupationConstraints(occupation,mapped).constraints)if(physicalIds.has(c.id))assert.ok(physicalKinds.has(c.id)||(c.id==='hardware'&&physicalKinds.size),`${occupation.id}: unsupported rating ${c.key}`);
    }
  }
  assert.equal(requirements,86967);
});
