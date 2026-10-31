/**
 * AFTERMATH conditional full-workflow model, evidence reviewed 2026-10-30.
 * The numeric horizon parameters below are analyst assumptions, NOT fitted
 * breakthrough forecasts or dates supplied by the cited publications.
 * See research/MODEL-RESEARCH.md and data/evidence.json for provenance/limits.
 */
export const MODEL_AS_OF = '2026-10-30';
export const PARAMETER_YEAR = 2026;
const define = (id, label, description, baseYears, difficultyYears, evidenceIds, readiness, dependencies = []) =>
  Object.freeze({id,label,description,baseYears,difficultyYears,evidenceIds,readiness,dependencies,parameterStatus:'analyst assumption; not empirically calibrated'});

export const capabilityDefinitions = Object.freeze({
  digital: define('digital','Reliable digital work','Complete computer workflows, verify results and recover from errors.',5,14,['metr-horizon','metr-th11','osworld','webarena','swebench','tau-bench'],'Demonstrated on bounded workflows; sustained reliability varies.'),
  reasoning: define('reasoning','Independent judgment','Resolve unfamiliar cases, plan, check evidence and correct mistakes.',8,28,['metr-horizon','tau-bench','expert-survey'],'Strong bounded results; open-ended reliability is not established.'),
  perception: define('perception','Real-world perception','Understand objects, people and changing physical scenes.',10,27,['gemini-robotics','open-x','droid','behavior'],'Demonstrated in studied environments; transfer remains a constraint.'),
  dexterity: define('dexterity','Adaptable robotic hands','Manipulate variable objects and materials with precise contact and force.',16,36,['aloha','mobile-aloha','pi05','droid','robot-exposure'],'Demonstrated on selected tasks; arbitrary work environments remain unproven.',['perception']),
  mobility: define('mobility','Autonomous movement','Navigate, drive and act through variable physical environments.',12,33,['mobile-aloha','behavior','gemini-robotics','robot-exposure'],'Useful bounded deployments and experiments; broad coverage is unresolved.',['perception']),
  social: define('social','Human interaction','Handle conversation, negotiation, teaching and interpersonal complexity.',6,34,['sotopia','tau-bench','expert-survey'],'Conversation is demonstrated; sustained social judgment and acceptance vary.'),
  creative: define('creative','Original creative direction','Create, evaluate and refine original work against changing goals.',8,30,['expert-survey','metr-horizon'],'Generation is demonstrated; independent direction and evaluation vary.'),
  discovery: define('discovery','Autonomous scientific discovery','Form hypotheses, design experiments, interpret results and validate discoveries.',15,60,['alab','alab-correction','gnome','robot-chemistry','alphafold3','expert-survey'],'Closed-loop discovery exists in bounded domains; general discovery is unproven.',['reasoning']),
  safety: define('safety','High-stakes reliability','Demonstrate safe performance, detect rare failures and recover reliably.',14,42,['nist-rmf','surgical-dissection','tau-bench','robot-exposure'],'Assurance must be validated for the actual deployment and consequences.'),
  hardware: define('hardware','Durable physical systems','Supply force, endurance, maintenance and operation in demanding conditions.',18,38,['robot-exposure','mobile-aloha','progress-history','battery-progress','vision-economics'],'Specialized hardware exists; versatility, cost and uptime differ by setting.'),
  frontier: define('frontier','Unproven scientific prerequisites','Resolve explicitly speculative physical or scientific prerequisites.',65,65,['expert-survey','progress-history','gnome'],'Feasibility and timing are unknown; the year is only a scenario assumption.',['discovery']),
  unknown: define('unknown','Unresolved work requirements','Account for duties whose requirements cannot be established from the supplied description.',25,45,['expert-survey','progress-history'],'Insufficient task evidence; no validated breakthrough timeline exists.')
});

// Domain-specific scenario sensitivity: these are sensitivity assumptions, not probabilities.
const scenarioFactors = Object.freeze({
  accelerated:{digital:.60,reasoning:.65,perception:.65,dexterity:.65,mobility:.65,social:.65,creative:.65,discovery:.60,safety:.70,hardware:.70,frontier:.65,unknown:.70,integration:.65},
  central:{digital:1,reasoning:1,perception:1,dexterity:1,mobility:1,social:1,creative:1,discovery:1,safety:1,hardware:1,frontier:1,unknown:1,integration:1},
  conservative:{digital:1.65,reasoning:1.8,perception:1.8,dexterity:1.9,mobility:1.8,social:1.8,creative:1.7,discovery:2,safety:1.8,hardware:1.9,frontier:2.1,unknown:2,integration:1.8}
});
const clamp = n => Math.max(0,Math.min(1,n));
const textOf = task => String(typeof task==='string'?task:(task.label??task.description??task.name??'')).normalize('NFKC').toLowerCase();
const unique = values => [...new Set(values)];

// Each rule describes an observable requirement, not a prediction for a job title.
// Broad words such as "work", "use", "development", or "electrical" alone are not rules.
const rules = [
  ['digital',.32,'Records and routine information processing',/\b(record|document|file|enter|input|process|update|compile|retrieve|transcrib|schedul|invoice|billing|payroll|bookkeep|spreadsheet|database|data entry|clerical|administrative|accounting|calculate|type|typist)\w*\b/],
  ['digital',.55,'Software, systems or technical information workflows',/\b(software|programming|programmer|code|coding|computer|cybersecurity|network security|algorithm|application development|debug|configure|web(site)?|digital|information technolog)\w*\b/],
  ['digital',.60,'Data science and computational models',/\b(machine learning|data mining|neural network|statistical model|mathematical model|simulation model|datasets?|data collection|data processing|flow charts?|logical operational)\b/],
  ['digital',.35,'Financial transactions and administrative records',/\b(receipts?|payments?|cash registers?|count money|bank deposits?|order supplies|order materials|order equipment|purchase|procure|procurement|buy merchandise|requisition|inventory|register|registration|keep track|daily reports?|accident reports?)\b/],
  ['reasoning',.48,'Analysis, planning and decisions',/\b(analy[sz]|evaluat|assess|investigat|diagnos|interpret|audit|review|plan|design|strateg|decid|decision|judg|troubleshoot|optimi[sz]|forecast|budget|manage|direct|coordinat|supervis|policy|policies|legal|advise|recommend|resolv|problem.solv)\w*\b/],
  ['reasoning',.72,'Complex or unfamiliar decisions',/\b(unfamiliar|unprecedented|ambiguous|complex|novel problems?|strategic|differential diagnos|litigat|adjudicat|arbitrat)\w*\b/],
  ['reasoning',.55,'Abstract problem solving and delivery constraints',/\b(think abstractly|address problems critically|meet deadlines|demonstrate disciplinary expertise|execute analytical mathematical calculations|comprehend financial|product comprehension)\b/],
  ['perception',.48,'Inspection and physical measurement',/\b(inspect|measure|survey|examine|observ|detect|scan|quality control|quality assur|visual|sensory|recognize|recognise|monitor)\w*\b/],
  ['dexterity',.53,'Physical manipulation, preparation or repair',/\b(assembl|disassembl|weld|solder|sew|stitch|carv|sculpt|cut|drill|grind|polish|paint|repair|clean|wash|cook|bake|prepare food|food prepar|harvest|plant crops|prun|massage|groom|dress wounds|handle materials|packag|pack|load|unload|fit|fasten|fabricat|machin|mold|mould|construct|build structures|plumb|carpentr|lay brick|hand tools|power tools)\w*\b/],
  ['dexterity',.50,'Handling materials, objects or tools',/\b(brew|wrap|replenish|garnish|decorate|haul|spread|dig|shovel|sweep|vacuum|rinse|buff|clamp|stretch|wind|unwind|attach|detach|tie|trim|mix|spray|brush|pour|dispense|insert|remove|replace|position|align|calibrat|adjust|lift|lower|raise|turn valves|pull levers|mark and tag|sort mail|distribute mail|collect artifacts|collect soiled|place new merchandise|stock supplies|stock bar|fill containers|handle objects|move pieces|bond wood|sever jugular|make incisions|shape eyebrows|resurface|reel extruded|lay out pavement|coat)\w*\b/],
  ['dexterity',.83,'Delicate or variable contact manipulation',/\b(surg|sutur|dissect|operate on|tissue|microscop|delicate|fragile|dental|dentist|dentistry|root canal|tooth|teeth|intravenous|inject|venipuncture|blood sampl|biological sampl|deformable|tangle|intricate)\w*\b/],
  ['mobility',.55,'Travel, navigation or vehicle operation',/\b(driv(e|ing|er)|pilot|navigat|transport|deliver (goods|food|packages|mail|parcels)|delivery vehicle|vehicle|forklift|truck|locomotiv|vessel|aircraft|flight|patrol|walk|climb|swim|dive|diving|sail|fly|flying|move patients)\w*\b/],
  ['social',.30,'Communication and routine service interaction',/\b(communicat|correspond|contact|answer|telephone|reception|customer|client|guest|interview|present|explain|inform|discuss|consult|sell|sales|serve|service users|public relations)\w*\b/],
  ['social',.35,'Coordination and participation with people',/\b(confer|collaborat|notify|announce|ask speakers|meetings?|conferences?|community events?|campus|recruitment|reprimand|warn persons|public|teamwork|work as part of a team|work as a member of a team|refer|referral|accommodate|attend to special needs)\w*\b/],
  ['social',.45,'Language, listening and relationship skills',/\b(speak different languages|listen actively|build business relationships|build rapport|promote inclusion|recruit employees|multicultural environment|encourage students|disseminate results|promote social change)\b/],
  ['social',.68,'Teaching, negotiation, leadership or care',/\b(teach|train|instruct|educat|mentor|coach|counsel|counsell|psychotherap|therap|empath|persuad|negotiat|mediate|motivat|leadership|lead teams|pastoral|clergy|chaplain|minister|childcare|child care|nurs|care for|caregiving|social work|resolve conflicts|conflict resolution)\w*\b/],
  ['creative',.60,'Original expressive work',/\b(choreograph\w*|perform music|live performance|theatrical\w*|entertain\w*|music\w*|artistic|creative|creativity|illustrat\w*|graphic design|fashion design|interior design|fiction|poetry|screenwrit\w*|novel writing|storytell\w*|scenograph\w*|acting|actors?|actress\w*|dance|dancing|sing|singing|sculpt\w*|compose music|compose songs|new cuisines|create jewelry)\b/],
  ['creative',.42,'Writing and visual creation',/\b(write|writing|edit|author|photograph|video production|film production|advertis|copywrit|journalis|publish)\w*\b/],
  ['creative',.55,'Visual animation and applied artistic creation',/\b(animate|animation|3d organic forms|costume design|dye fabrics)\b/],
  ['discovery',.57,'Experimental or scientific research',/\b(scientific research|scientific investigat|research stud|conduct research|fundamental research|basic research|hypothes|experiment|discover|laboratory research|clinical research|chemical research|theoretical|new materials|new compounds|new treatment|new drug|scientific theor|research and develop)\w*\b/],
  ['safety',.66,'Clinical, emergency or other consequential interventions',/\b(patient|clinical|medical|medication|pharmac|prescrib|surg|dental|dentist|diagnos|emergency|rescue|firefight|police|law enforcement|prison|correctional|child safety|aviation safety|air traffic|nuclear|toxic|hazardous|high.voltage|life.threat|health and safety|occupational safety)\w*\b/],
  ['safety',.88,'Critical interventions and rare-failure recovery',/\b(emergency surg|critical care|intensive care|trauma|life.support|resuscitat|crisis intervention|disaster response|explosive|bomb disposal|radiation|reactor|air traffic control)\w*\b/],
  ['safety',.55,'Protective measures and applied safety procedures',/\b(protective gear|work ergonomically|students' safety|food safety|work safely|harmful movements|animal illness|disability care|legislation related to health care)\b/],
  ['hardware',.60,'Heavy or exposed physical operations',/\b(heavy equipment|heavy loads|heavy lifting|excavat|mining|miner|underground|offshore|construction site|logging|forestry|outdoor|all.weather|extreme temperatur|harsh environment|firefight|agricultur|farm|livestock|ranch|wind turbine|oil rig|ship repair|building maintenance)\w*\b/],
  ['frontier',1,'Explicitly speculative scientific prerequisite',/\b(new laws of physics|unknown physics|new physics|quantum gravity|faster.than.light|interstellar colon|interstellar travel|terraform|artificial consciousness|prove consciousness|cure all diseases|universal cure|unproven physical principle|room.temperature superconduct|whole.brain emulat|human brain emulat)\w*\b/]
];

const featureRules = [
  ['1.A.1.b.2:LV','creative',7,.50,'Originality'],
  ['1.A.1.b.4:LV','reasoning',7,.50,'Deductive reasoning'],
  ['1.A.1.b.5:LV','reasoning',7,.50,'Inductive reasoning'],
  ['1.A.2.a.2:LV','dexterity',7,.36,'Manual dexterity'],
  ['1.A.2.a.3:LV','dexterity',7,.43,'Finger dexterity'],
  ['1.A.2.b.1:LV','dexterity',7,.43,'Control precision'],
  ['1.A.3.a.1:LV','hardware',7,.40,'Static strength'],
  ['2.B.4.e:LV','reasoning',7,.50,'Judgment and decision making'],
  ['4.A.2.b.1:LV','reasoning',7,.50,'Making decisions and solving problems'],
  ['4.A.3.a.4:LV','mobility',7,.36,'Operating vehicles'],
  ['4.A.4.a.7:LV','social',7,.40,'Resolving conflicts'],
  ['4.C.2.c.1.d:CX','hardware',5,.50,'Hazardous conditions'],
  ['4.C.2.c.1.e:CX','safety',5,.60,'Hazardous equipment'],
  ['4.C.3.a.1:CX','safety',5,.65,'Consequence of error'],
  ['4.C.1.c.1:CX','safety',5,.70,'Responsibility for health and safety'],
  ['4.C.1.d.3:CX','safety',5,.50,'Violent or physically aggressive people'],
  ['4.C.2.a.1.c:CX','hardware',5,.65,'Outdoors in weather'],
  ['4.C.2.d.1.g:CX','dexterity',5,.75,'Using hands to handle or control objects']
];

function taskMapping(task, index) {
  const original = typeof task==='string'?{id:`task:${index}`,label:task}:{...task};
  const text = textOf(original);
  const computational=/\b(software|code|coding|data|database|datasets?|machine learning|data mining|neural network|computer program|web(site)?|digital|cybersecurity)\b/.test(text);
  const physicalObjects=/\b(hardware|physical|robot|robotic|wires?|circuit|tissue|tools?|engine|paper|metal|wood|furniture|food|vehicle|printer|machinery|laboratory|sensor)\b/.test(text);
  const matches = new Map();
  const details=[];
  const add=(id,severity,reason,basis='task text')=>{
    const previous=matches.get(id);
    matches.set(id,{severity:Math.max(severity,previous?.severity??0),requirements:unique([...(previous?.requirements??[]),reason])});
    details.push({capabilityId:id,basis,reason,severity});
  };
  // ESCO explicitly distinguishes knowledge concepts from execution skills.
  // Knowing mechanics is not evidence of manipulating a mechanism, and knowing
  // chemistry is not evidence of inventing a new chemical theory.
  if(original.skillType==='knowledge' && original.sourceId && ['essential-skill','optional-skill'].includes(original.type)) {
    add('reasoning',.40,`Source-classified knowledge requirement: ${original.label??original.name??text}`,'broad requirement inference');
    details.push({basis:'ESCO knowledge type',reason:'Knowledge domain is specified, but application difficulty, execution environment and full workflow are not.'});
    details.push({basis:'skill proxy',reason:'A knowledge requirement is not an observed task or a complete workflow.'});
    return {original:{...original,id:original.id??`task:${index}`,label:original.label??original.description??original.name??''},matches,details};
  }
  for(const [id,severity,reason,pattern] of rules) {
    if(!pattern.test(text))continue;
    // Avoid interpreting software repair/installation as robotic manipulation.
    if(id==='dexterity' && computational && !physicalObjects)continue;
    // Monitoring financial/software information is not evidence of physical vision.
    if(id==='perception' && /\b(data|budget|financial|software|information|reports?|records?|accounts?|performance|compliance)\b/.test(text) && !/\b(physical|equipment|machin|patient|specimen|sample|material|site|building|visual|sensor)\w*\b/.test(text))continue;
    if(id==='creative' && /\b(software|code|coding|programming|database|computer program)\w*\b/.test(text) && !/\b(artistic|creative|music|graphic|fiction|story|poetry|illustrat)\w*\b/.test(text))continue;
    if(id==='mobility' && /\b(software|device driver|computer|website|web page)\w*\b/.test(text) && !/\b(vehicle|robot|truck|physical|equipment|aircraft)\w*\b/.test(text))continue;
    if(id==='hardware' && /\b(data mining|machine learning)\b/.test(text) && !physicalObjects)continue;
    if(id==='social' && /\b(train|training)\w*\b/.test(text) && /\b(machine learning|neural network|models?|algorithms?)\b/.test(text) && !/\b(people|students?|staff|employees?|workers?|clients?)\b/.test(text))continue;
    add(id,severity,reason);
  }
  // Installation and maintenance need an object, so "install software" stays digital.
  if(/\b(install\w*|maintain\w*|maintenance|operate|operating)\b/.test(text) && /\b(equipment|machinery|machines|hardware|plumbing|electrical|instrument|appliance|engine|pump|motor|furniture|fixture|plant|robotic)\w*\b/.test(text) && !(computational&&!physicalObjects))add('dexterity',.58,'Installation, maintenance or operation of physical equipment');
  if(/\b(treat|treatment|therapy|therapies)\w*\b/.test(text)&&/\b(disorder|disease|patient|health|brain|heart|lung|kidney|cancer|diabetes|hypertension|medical)\w*\b/.test(text))add('safety',.70,'Treatment of health conditions');
  if(/\b(agent|trustee|guardian|executor|subpoena|oath|hearing|courtroom|enforce|traffic laws)\w*\b/.test(text))add('reasoning',.60,'Institutional judgment and rule application');
  if(/\b(research|study|studies|knowledge|understand|principles|standards|regulations|procedures|methods|practices|ensure|organis|organiz|develop|support|assist|control|prepare|provide|apply|perform|conduct|identify|determine|establish|implement|maintain|check|test|testing|select|arrange|follow|use|utili[sz]|read|define|formulate|devise|participate|complete|submit|verify|oversee|find|locate|count|estimate|start|claim|create|acquire|distribute|store)\w*\b/.test(text) && !matches.size) {
    add('reasoning',.40,'General knowledge or procedural requirement; specific execution details are missing','broad requirement inference');
  }
  if(!matches.size) add('unknown',.65,'No sufficiently specific capability mapping for this supplied requirement','unresolved requirement');
  const demanding=/\b(unstructured|unpredictable|unfamiliar|unprecedented|high.precision|delicate|extreme|complex|novel|critical|emergency|changing environments|without supervision|independently)\w*\b/.test(text);
  if(demanding)for(const [id,value] of matches) {
    value.severity=Math.max(value.severity,id==='frontier'?1:.78);
    value.requirements.push('Variable, demanding or consequential execution specified in the task');
  }
  if(original.type==='description-proxy')details.push({basis:'description proxy',reason:'An occupational summary is not an exhaustive task inventory.'});
  if(/skill/.test(original.type??''))details.push({basis:'skill proxy',reason:'A skill requirement is not an observed work task or a complete workflow.'});
  return {original:{...original,id:original.id??`task:${index}`,label:original.label??original.description??original.name??''},matches,details};
}

/**
 * Return a reproducible conditional scenario for all supplied requirements.
 * Adding a harder requirement cannot bring the result forward: only maxima
 * and nonnegative integration additions determine the result.
 */
export function assessOccupation(occupation={},options={}) {
  const scenario=options.scenario??'central';
  if(!Object.hasOwn(scenarioFactors,scenario))throw new RangeError(`Unknown scenario: ${scenario}`);
  const assessmentYear=Number(options.assessmentYear??PARAMETER_YEAR);
  if(!Number.isInteger(assessmentYear)||assessmentYear<2026||assessmentYear>3000)throw new RangeError('assessmentYear must be an integer from 2026 to 3000.');
  const factors=scenarioFactors[scenario];
  let sourceTasks=Array.isArray(occupation.tasks)?occupation.tasks:[];
  if(!sourceTasks.length)sourceTasks=[{id:'description-proxy',label:String(occupation.description||occupation.title||'Unspecified work'),type:'description-proxy'}];
  const mapped=sourceTasks.map(taskMapping);
  const requirements=new Map();
  function include(id,severity,reason,taskId,basis='task text') {
    const entry=requirements.get(id)??{id,severity:0,requirements:[],taskIds:[],mappingDetails:[]};
    entry.severity=Math.max(entry.severity,clamp(severity));
    entry.requirements=unique([...entry.requirements,reason]);
    if(taskId!==undefined)entry.taskIds=unique([...entry.taskIds,taskId]);
    entry.mappingDetails.push({basis,reason,...(taskId!==undefined?{taskId}:{})});
    requirements.set(id,entry);
  }
  for(const task of mapped)for(const [id,value] of task.matches)for(const reason of value.requirements)include(id,value.severity,reason,task.original.id);

  // Role-wide O*NET observations supplement lexical mappings, not individual task annotations.
  const features=occupation.features??{};
  let structuredFeatureCount=0;
  for(const [key,id,max,threshold,label] of featureRules) {
    const raw=features[key];
    if(typeof raw!=='number'||!Number.isFinite(raw))continue;
    structuredFeatureCount++;
    const normalized=clamp(key.endsWith(':CX')?(raw-1)/(max-1):raw/max);
    if(normalized>=threshold)include(id,normalized,`${label}: ${raw} (${key}; source scale ${key.endsWith(':CX')?'1':'0'}–${max})`,undefined,'O*NET occupation-level rating');
  }

  // Sparse international occupational summaries can supply a broad sector prior.
  // This never assigns a title-specific date and is explicitly marked inference.
  const isco=String(occupation.iscoCode??'').replace(/[^0-9]/g,'');
  const sparse=mapped.every(t=>t.original.type==='description-proxy'||t.matches.has('unknown'));
  if(sparse&&isco) {
    const sector=isco.slice(0,1);
    const prior={1:['reasoning',.62],2:['reasoning',.58],3:['reasoning',.50],4:['digital',.38],5:['social',.45],6:['hardware',.58],7:['dexterity',.60],8:['dexterity',.50],9:['dexterity',.45],0:['safety',.70]}[sector];
    if(prior)include(prior[0],prior[1],`Broad ISCO major group ${sector} prior; task details are incomplete`,undefined,'occupational classification prior');
  }

  // Dependency closure preserves each task's provenance through coupled fronts.
  function addDependencies(id,seen=new Set()) {
    if(seen.has(id))return;seen.add(id);
    const entry=requirements.get(id);
    for(const dependency of capabilityDefinitions[id].dependencies) {
      const strength=entry.severity*.85;
      const reason=`Prerequisite for ${capabilityDefinitions[id].label.toLowerCase()}`;
      if(entry.taskIds.length)for(const taskId of entry.taskIds)include(dependency,strength,reason,taskId,'capability dependency');
      else include(dependency,strength,reason,undefined,'capability dependency');
      addDependencies(dependency,new Set(seen));
    }
  }
  for(const id of [...requirements.keys()])addDependencies(id);

  const capabilities=[...requirements.values()].map(entry=>{
    const definition=capabilityDefinitions[entry.id];
    const remainingYears=(definition.baseYears+definition.difficultyYears*entry.severity**2)*factors[entry.id];
    // The evidence does not refresh itself when the calendar advances.
    const baselineYear=Math.max(assessmentYear,PARAMETER_YEAR+Math.ceil(remainingYears));
    return {...entry,label:definition.label,description:definition.description,baselineYear,
      requirementLevel:Number(entry.severity.toFixed(3)),evidenceIds:[...definition.evidenceIds],
      readiness:definition.readiness,dependencies:[...definition.dependencies],
      parameterStatus:definition.parameterStatus,
      assumptions:[`Conditional ${scenario} milestone: 2026 + ceil((${definition.baseYears} + ${definition.difficultyYears} × requirement²) × ${factors[entry.id]}).`,
        'The cited evidence supports the capability distinction and observed limitations, not this milestone year.',
        ...(entry.id==='frontier'||entry.id==='unknown'?['Eventual feasibility and a finite completion date are assumed, not established.']:[])]};
  }).sort((a,b)=>b.baselineYear-a.baselineYear||a.id.localeCompare(b.id));
  const byId=new Map(capabilities.map(cap=>[cap.id,cap]));
  const physical=capabilities.some(cap=>['dexterity','mobility','hardware'].includes(cap.id));
  const highStakes=byId.has('safety');
  const interaction=byId.has('social')&&byId.get('social').severity>=.6;
  // Independent capabilities develop in parallel; coupling is a separate deployment allowance.
  const integrationBase=2+Math.ceil(Math.log2(Math.max(1,capabilities.length)))+(physical?4:0)+(highStakes?3:0)+(interaction?2:0);
  const integrationYears=Math.ceil(integrationBase*factors.integration);
  const technicalYear=Math.max(assessmentYear,...capabilities.map(cap=>cap.baselineYear));
  const tasks=mapped.map(task=>{
    // Task dates use local demands. Occupation-wide ratings constrain the role
    // separately and must not make every simple task inherit the hardest task.
    const localRequirements=new Map([...task.matches].map(([id,value])=>[id,value.severity]));
    const addLocalDependencies=(id,seen=new Set())=>{
      if(seen.has(id))return;seen.add(id);
      for(const dependency of capabilityDefinitions[id].dependencies) {
        localRequirements.set(dependency,Math.max(localRequirements.get(dependency)??0,localRequirements.get(id)*.85));
        addLocalDependencies(dependency,new Set(seen));
      }
    };
    for(const id of [...localRequirements.keys()])addLocalDependencies(id);
    const capabilityIds=[...localRequirements.keys()];
    const taskYear=Math.max(assessmentYear,...[...localRequirements].map(([id,severity])=>{
      const def=capabilityDefinitions[id];
      return PARAMETER_YEAR+Math.ceil((def.baseYears+def.difficultyYears*severity**2)*factors[id]);
    }));
    return {...task.original,capabilityIds,baselineYear:taskYear,
      requirements:unique([...task.matches.values()].flatMap(value=>value.requirements)),
      mappingBasis:task.matches.has('unknown')?'Unresolved requirement':task.details.some(d=>d.basis==='broad requirement inference')?'Broad requirement inference':'Task text and explicit capability dependencies',
      mappingDetails:task.details};
  });
  const unmappedTasks=mapped.filter(task=>task.matches.has('unknown')).length;
  const inferredTasks=mapped.filter(task=>task.details.some(d=>d.basis==='broad requirement inference')).length;
  const proxyTasks=mapped.filter(task=>/skill|proxy/.test(task.original.type??'')).length;
  const limitations=[
    'This is an uncalibrated, conditional scenario. No validated method can date every unknown breakthrough or guarantee full automation.',
    'A single year is a scenario marker, not a confidence interval. Actual outcomes may be decades earlier or later, or never occur.',
    'Requirement mapping uses reproducible text rules and available occupation ratings; it is not an expert review of every task and can misclassify context.',
    'Published demonstrations and exposure estimates do not establish complete occupational autonomy.',
    'The scope is the supplied work profile, not every possible employer, exception, geography, future duty or new occupation.',
    'Economic, organizational and legal deployment allowances are explicit assumptions, not cost models or forecasts of regulatory approval.',
    ...(unmappedTasks?[`${unmappedTasks} supplied requirement(s) are unresolved and use an explicit unknown-requirement assumption.`]:[]),
    ...(inferredTasks?[`${inferredTasks} requirement(s) use broad knowledge/procedure inference; their execution environment is underspecified.`]:[]),
    ...(proxyTasks?[`${proxyTasks} input(s) are skill or description proxies rather than a complete observed task inventory.`]:[]),
    ...(assessmentYear>PARAMETER_YEAR?['Evidence and numerical assumptions remain anchored to 2026; changing assessmentYear does not update the research.']:[])
  ];
  return {
    baselineYear:technicalYear+integrationYears,technicalYear,integrationYears,capabilities,tasks,
    evidenceIds:unique([...capabilities.flatMap(cap=>cap.evidenceIds),'productivity-paradox','diffusion-history','progress-history','progress-regularities','ideas-productivity','vision-economics','ilo-exposure-2025','bls-projection-methods']),
    assumptions:[
      'Full automation means autonomous completion of every supplied requirement at acceptable quality, including error recovery; it does not mean worldwide adoption or that employment disappears.',
      'The technical milestone is the latest required capability, not an average of easy and difficult tasks.',
      'Capability horizons are transparent analyst priors, differentiated by domain and task demand. They have not been fitted to occupation automation dates.',
      `Deployment allowance: ceil((2 + ceil(log2(${capabilities.length})) + ${physical?4:0} physical + ${highStakes?3:0} high-stakes + ${interaction?2:0} complex interaction) × ${factors.integration}) = ${integrationYears} years.`,
      'The scenario assumes continued research, feasible solutions, infrastructure, financing, and eventual permission to deploy; none is guaranteed.',
      'Historical diffusion and cost evidence motivate separate deployment constraints; no universal historical trend is extrapolated across all technologies.'
    ],
    limitations,
    confidence:{level:'low',label:unmappedTasks||proxyTasks?'Very uncertain':'Uncertain',reason:'Years are not empirically calibrated; task coverage and future capability progress remain uncertain.'},
    coverage:{totalTasks:tasks.length,mappedTasks:tasks.length-unmappedTasks,unmappedTasks,inferredTasks,proxyTasks,structuredFeatureCount,sourceType:occupation.source??'custom',complete:false,note:'All supplied requirements are retained and considered. Catalog coverage does not prove complete occupational coverage or mapping accuracy.'},
    parameterStatus:'analyst assumptions; not calibrated',modelAsOf:MODEL_AS_OF,scenario
  };
}
