import milestoneData from './milestone-data.js';
import {estimateDigitalMilestone} from './digital-forecast.js';

const milestones=new Map(milestoneData.milestones.map(m=>[m.milestoneId,m]));
const scenarioQuantile={accelerated:'p10',central:'p50',conservative:'p90'};
const knownCapabilities=new Set(['digital','reasoning','perception','dexterity','mobility','social','creative','discovery','safety','hardware','frontier','unknown']);
const benchmarkCache=new Map();
const unique=items=>[...new Set(items)];
const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const computational=/\b(software|code|coding|programming|databases?|datasets?|data mining|machine learning|neural networks?|web\s*sites?|web\s*pages?|web applications?|web models?|web prototypes?|directory trees?|server directory|https?|operating systems?|system interaction|sequence diagrams?|cybersecurity|computer graphics)\b/;
const physicalObject=/\b(physical|robot\w*|wire\w*|circuit\w*|cabinet\w*|tissue|tools?|engine\w*|paper|metal|wood|furniture|food|vehicle\w*|printer\w*|machinery|laboratory|sensor\w*|electrical equipment|garments?|clothing|laundry|parts?|components?|patients?)\b/;
const tangibleComputingContext=/\b(hardware|physical|robot\w*|wire\w*|circuit\w*|cabinet\w*|tissue|hand tools?|power tools?|engine\w*|paper|metal|wood|furniture|food|vehicle\w*|printer\w*|machinery|laboratory|sensor\w*|electrical equipment|garments?|clothing|laundry)\b/;
const physicalAction=/\b(assembl\w*|install\w*|repair\w*|fold\w*|manipulat\w*|grasp\w*|lift\w*|carry|carrying|cut\w*|clean\w*|wash\w*|cook\w*|pack\w*|load\w*|maintain\w*|operat\w*|handle|handling|place|position\w*|sew\w*|stitch\w*|fabricat\w*|weld\w*|solder\w*|paint\w*|inspect\w*|harvest\w*|plant\w*)\b/;
const hostileEnvironment=/\b(deep.sea|deep.ocean|underwater|offshore|underground|outer space|spacewalk|radiation|reactor|explosives?|bomb disposal|extreme temperature|wildfire|firefight\w*|mine rescue|hazardous waste)\b/;
const speculative=/\b(new laws of physics|unknown physics|new physics|quantum gravity|faster.than.light|interstellar|terraform\w*|artificial consciousness|prove consciousness|universal cure|cure all diseases|room.temperature superconduct\w*|whole.brain emulat\w*|human brain emulat\w*)\b/;
const emailService=text=>/\b(e.?mail|inquir(?:y|ies))\b/.test(text)&&/\b(respond|responses?|answer|inquir(?:y|ies)|messages?)\b/.test(text);
const selection=(id,reason,matchType='transferred task proxy')=>({id,reason,matchType});

function operativeClinicalTask(text) {
  // The adjective "surgical" describes many devices; servicing a surgical
  // laser is not an operation on a patient.
  if(/\b(repair\w*|calibrat\w*|maintain\w*|manufactur\w*|assembl\w*|fabricat\w*|install\w*|test\w*|inspect\w*|service|design\w*|develop\w*)\b.{0,70}\b(products?|equipment|lasers?|devices?|instruments?|machines?|systems?|software|simulators?)\b/.test(text))return false;
  if(/\b(perform|conduct|carry out|undertake)\b.{0,45}\b(surger(?:y|ies)|surgical (?:operations?|procedures?))\b/.test(text))return true;
  if(/\b(operate|operating) on\b/.test(text))return true;
  return /\b(suture|suturing|dissect|dissecting|incise|incising|resect|resecting|excise|transplant)\b/.test(text)&&/\b(patients?|tissue|skin|wounds?|organs?|arter\w*|veins?|tumou?rs?|gallbladder|anatom\w*|body|surgical|surgery)\b/.test(text);
}

function namedOccupation(occupation={}) {
  if(!['onet','esco'].includes(occupation.source)||occupation.originalScopeRetained===false)return null;
  const title=normalize(occupation.title),code=String(occupation.sourceCode??'');
  if(/\bsurgeons?\b/.test(title)&&!/\b(assistant|technician|technologist|secretary|nurse)\b/.test(title))return selection('espai-surgeon','The survey explicitly asks about full automation of the surgeon occupation.','named occupation forecast');
  if(/\b(truck|tractor.trailer|lorry) drivers?\b/.test(title)||code==='53-3032.00')return selection('espai-truckdriver','The survey explicitly asks about full automation of truck driving.','named occupation forecast');
  if(/\b(retail salespersons?|retail sales assistants?|retail sales workers?|shop salespersons?)\b/.test(title)||code==='41-2031.00')return selection('espai-retail-salesperson','The survey explicitly asks about full automation of retail salespeople.','named occupation forecast');
  if(/\b(ai|artificial intelligence|machine learning)\b/.test(title)&&/\b(research\w*|scientists?)\b/.test(title))return selection('espai-airesearcher','The survey explicitly asks about full automation of AI researchers.','named occupation forecast');
  return null;
}

function occupationTaskMatch(anchor,capability,text) {
  if(!anchor)return false;
  if(anchor.id==='espai-surgeon')return ['reasoning','perception','dexterity','safety'].includes(capability)&&/\b(surg\w*|sutur\w*|dissect\w*|diagnos\w*|treat\w*|patients?|clinical|medical|anatom\w*)\b/.test(text)&&!/\b(invoice\w*|billing|records?|schedul\w*|insurance|administrativ\w*)\b/.test(text);
  if(anchor.id==='espai-truckdriver')return ['reasoning','perception','dexterity','mobility','safety','hardware'].includes(capability)&&/\b(trucks?|vehicles?|roads?|traffic|driv\w*|routes?|freight|cargo|deliver\w*|loading|unloading)\b/.test(text)&&!/\b(invoice\w*|billing|records?|account\w*)\b/.test(text);
  if(anchor.id==='espai-retail-salesperson')return ['reasoning','social','perception','dexterity'].includes(capability)&&/\b(sell\w*|sales?|customers?|merchandise|shop\w*|store|display\w*|product\w*)\b/.test(text)&&!/\b(invoice\w*|billing|payroll|records?|database)\b/.test(text);
  if(anchor.id==='espai-airesearcher')return ['reasoning','digital','discovery'].includes(capability)&&/\b(research|experiment\w*|hypothes\w*|novel|publish\w*|study|studies)\b/.test(text)&&/\b(ai|artificial intelligence|machine learning|model\w*|algorithm\w*|neural network)\b/.test(text);
  return false;
}

function physicalProxy(text,severity) {
  if(/\b(server directory|directory trees?|web models?|web prototypes?|sequence diagrams?|system interaction)\b/.test(text)&&!/\b(hardware|robots?|wires?|circuits?|physical machines?|hand tools?|power tools?)\b/.test(text))return null;
  if(computational.test(text)&&!tangibleComputingContext.test(text))return null;
  if(hostileEnvironment.test(text))return null;
  if(operativeClinicalTask(text))return selection('espai-surgeon','Transfer from the full-surgeon forecast to a comparable surgical manipulation requirement; other clinical roles and approval are not independently dated.','occupation-to-task proxy');
  if(/\b(electrical|wiring|wires?|circuits?)\b/.test(text)&&physicalAction.test(text))return selection('espai-task-wiring','Autonomous home wiring is the closest surveyed action/object combination; commercial or industrial scope requires a transfer assumption.');
  if(/\b(plumbing|appliance\w*|building\w*|construction|equipment|machinery|engines?|repair|maintenance)\b/.test(text)&&physicalAction.test(text))return selection('espai-task-wiring','Transfer from variable, multi-step home electrical installation to this installation/maintenance workflow; materials and failure modes differ.');
  if(/\b(laundry|fold|folding|cloth\w*|fabric\w*|garments?|textile\w*)\b/.test(text)&&physicalAction.test(text)){
    if(/\b(sew\w*|stitch\w*|cut\w*|fabricat\w*|pattern\w*)\b/.test(text))return selection('espai-task-lego','Transfer from instruction-following multi-part assembly to garment fabrication; deformable-material and tool-control differences remain assumptions.');
    return selection('espai-task-laundry','Transfer from human-speed laundry folding to related deformable-object handling; washing/cleaning processes are not separately forecast.');
  }
  if(physicalAction.test(text)||physicalObject.test(text))return selection('espai-task-lego','Transfer from arbitrary LEGO assembly with nonspecialized robotics to structured object handling; force, materials, precision and operating conditions may differ.');
  return null;
}

function choose(capability,text,severity,task) {
  if(speculative.test(text)||capability==='frontier'||capability==='unknown')return null;
  const isSoftware=computational.test(text);
  if(capability==='digital') {
    if(/\b(directory trees?|server directory)\b/.test(text))return selection('espai-task-python','Transfer a specified executable program to filesystem/directory configuration; permissions and operational verification remain conditions.');
    if(/\b(https?|hypertext transfer protocol|operating systems?|web models?|web prototypes?|system interaction|sequence diagrams?)\b/.test(text))return selection('espai-task-paymentsite','Transfer the surveyed multi-component website workflow to software infrastructure, interface/data modeling or system-interaction design; this is a software-scope analogy, not a robotics requirement.');
    if(/\b(domain names?|domain registrations?)\b/.test(text)&&/\b(renew\w*|registr\w*|register\w*|updat\w*|manage\w*)\b/.test(text))return selection('espai-task-python','Transfer a specified executable program to bounded domain-registration administration; registrar access, ownership checks and unusual cases remain conditions.');
    if(emailService(text))return selection('espai-task-phonebanking','Transfer competent responses to varied telephone-banking requests to bounded email inquiries and automated replies; communication channel and subject matter differ.');
    if(/\b(transcrib\w*|speech.to.text|dictation)\b/.test(text))return selection('espai-task-transcribe','Speech-to-text requirement maps to the surveyed transcription task.','direct or nearby task scope');
    if(/\b(translat\w*|interpret languages?|bilingual|multilingual)\b/.test(text))return selection(/\b(newly discovered|unknown language|undeciphered)\b/.test(text)?'espai-task-rosetta':/\b(subtitled|films?|movies?)\b/.test(text)?'espai-task-translatespeech':'espai-task-translatetext','Transfer the surveyed language-translation outcome to the supplied language task; specialist terminology and quality thresholds can differ.');
    if(/\b(fine.tun\w*|train\w*)\b/.test(text)&&/\b(language model|llm|machine learning|neural network|models?)\b/.test(text))return selection('espai-task-finetunellm','Transfer from autonomous language-model fine-tuning to the specified model-training workflow; model type and benchmark differ.');
    if(/\b(cybersecurity|security flaw|vulnerabilit\w*|penetration test|patch\w*|security software|network security)\b/.test(text))return selection('espai-task-findandpatch','Transfer from independently finding and repairing a software security flaw to the specified security workflow.');
    if(isSoftware&&/\b(web\s*sites?|web\s*pages?|frontend|front.end|backend|back.end|payment sites?|web applications?)\b/.test(text))return selection('espai-task-paymentsite','Transfer from building an entire specified payment website to the supplied web-development task; requirements and security scope can differ.');
    if(isSoftware){
      if(/\b(simple|small function|quicksort|sorting|algorithm implementation|routine script)\b/.test(text))return selection('espai-task-python','Comparable bounded implementation from a specified algorithm.','direct or nearby task scope');
      return selection(severity>=.6?'espai-task-paymentsite':'espai-task-python',severity>=.6?'Transfer the multi-component website-building outcome to this software workflow; this is a scope analogy, not a measured development duration.':'Transfer simple-program generation to this bounded software/data operation; system access, verification and unusual cases remain assumptions.');
    }
    if(/\b(search|retriev\w*|find|look up|research)\b/.test(text)&&/\b(information|facts?|records?|documents?|online|internet|data)\b/.test(text))return selection('espai-task-googleable','Transfer internet fact-retrieval performance to specified record/information retrieval; private-system access and record correctness are additional assumptions.');
    if(/\b(records?|data entry|spreadsheet\w*|invoices?|payroll|billing|bookkeep\w*|transactions?|accounting|calculat\w*|clerical|administrativ\w*|schedul\w*|documents?|forms?|reports?|databases?)\b/.test(text))return selection('espai-task-python','Transfer a specified, executable program outcome to structured administrative data processing; this does not measure the whole administrative workflow or its exception rate.');
    return null;
  }
  if(capability==='reasoning') {
    if(/\bstarcraft\b/.test(text))return selection('espai-task-starcraft','Comparable game-playing benchmark; winning the specified game does not establish general real-world planning.','direct or nearby task scope');
    if(/\bangry birds\b/.test(text))return selection('espai-task-angrybirds','Comparable performance on unseen game levels.','direct or nearby task scope');
    if(/\bpoker\b/.test(text))return selection('espai-task-poker','Comparable high-level poker performance; game rules differ from real-world negotiations.','direct or nearby task scope');
    if(/\batari\b/.test(text))return selection(/\b(professional|expert|every)\b/.test(text)?'espai-task-profatari':'espai-task-novatari','Comparable Atari-game competence, with the requested experience/quality level.','direct or nearby task scope');
    if(/\b(play|master|compete in)\b.{0,25}\bgo\b/.test(text))return selection('espai-task-go','Transfer the surveyed human-experience-limited Go benchmark to this Go-playing requirement.');
    if(/\b(game|games)\b/.test(text)&&/\b(explain|moves?|decisions?)\b/.test(text))return selection('espai-task-explainmove','Comparable explanation of game-playing decisions.','direct or nearby task scope');
    if(/\b(unfamiliar|new|random)\b/.test(text)&&/\b(computer game|pc game|video game)\b/.test(text))return selection('espai-task-randompcgame','Comparable rapid learning of an unfamiliar game.','direct or nearby task scope');
    if(/\b(millennium|long.standing|unsolved|open problem)\b/.test(text)&&/\b(math\w*|theorem\w*)\b/.test(text))return selection('espai-task-millenniumprize','The mathematical requirement calls for resolving an outstanding open problem.','direct or nearby task scope');
    if(/\b(prove|proving|originate|discover)\b/.test(text)&&/\b(theorem\w*|mathematical)\b/.test(text))return selection('espai-task-provemath','Transfer from autonomously proposing and proving publishable mathematical theorems.');
    if(/\b(math\w*|calculus|algebra|equations?|quantitative|statistical)\b/.test(text)&&!/\b(knowledge|principles|basic)\b/.test(text)&&severity>=.65)return selection('espai-task-putnam','Transfer high-level solved-problem mathematical reasoning to this quantitative requirement; domain and professional accountability are separate.');
    if(isSoftware)return choose('digital',text,severity,task);
    if(/\b(uncertain|ambiguous|unsettled|unfamiliar|strateg\w*|judg\w*|diagnos\w*|legal|litigat\w*|policy|policies|risk|investigat\w*|forecast\w*|novel|decision\w*|manage\w*|supervis\w*|direct\w*|plan\w*)\b/.test(text))return selection('espai-task-nodefanswer','Transfer useful answers to unsettled factual questions to judgment/planning under incomplete information; execution, accountability and domain-specific validation are not measured by the survey task.');
    if(/\b(analy[sz]\w*|assess\w*|evaluat\w*|review\w*|research|interpret\w*|audit\w*|design\w*|understand\w*|explain\w*|recommend\w*|compare\w*)\b/.test(text))return selection('espai-task-opengoogleable','Transfer open-ended information synthesis to this bounded analytical requirement; the match assumes adequate information and an assessable output.');
    if(task.skillType==='knowledge'||/\b(knowledge|principles|facts?|information|regulations?|standards?|procedures?|methods?|read|record\w*|check|verify|organis\w*|organiz\w*|coordinat\w*|support|assist|prepare|identify|determine|establish|implement|select|arrange|follow|use|apply)\b/.test(text))return selection('espai-task-googleable','Transfer factual retrieval to a knowledge/procedural requirement; knowing a procedure does not demonstrate reliable independent execution.');
    return null;
  }
  if(capability==='social') {
    if(/\b(psychotherap\w*|counsel\w*|counsell\w*|empath\w*|pastoral|childcare|child care|patient care|caregiving|social work|mediate\w*|mediat\w*|conflict resolution|teach\w*|educat\w*|mentor\w*|coach\w*)\b/.test(text))return null;
    if(/\b(translat\w*|speak different languages|interpret languages?)\b/.test(text))return selection('espai-task-translatetext','Transfer common-language translation to multilingual communication; relationship management and contextual judgment are not covered.');
    if(emailService(text))return selection('espai-task-phonebanking','Transfer competent responses to varied telephone-banking requests to bounded email inquiries; communication channel and subject matter differ.');
    if(/\b(customer\w*|client\w*|sales?|sell\w*|telephone|banking|reception\w*|answer|requests?|service|communicat\w*|correspond\w*|contact|explain|inform|discuss|consult|confer|notify|listen|rapport|business relationships|public relations)\b/.test(text))return selection('espai-task-phonebanking','Transfer telephone banking with varied requests and acceptable customer experience to bounded service communication; relationship depth and domain responsibilities can differ.');
    return null;
  }
  if(capability==='creative') {
    if(isSoftware&&!/\b(artistic|creative|graphic|visual|music|story|animation|illustration)\b/.test(text))return null;
    if(/\b(voice|speech|narrat\w*|dubbing|voiceover|voice.over)\b/.test(text))return selection('espai-task-recording','Transfer indistinguishable voice-actor recordings to the specified spoken-audio production.');
    if(/\b(song\w*|music\w*|compos\w*|sing|singing)\b/.test(text))return selection(/\b(style|imitat\w*|particular artist)\b/.test(text)?'espai-task-songartist':'espai-task-songtop40','Transfer the surveyed professional-quality song outcome to the music requirement; live physical performance is not implied.');
    if(/\b(novel\w*|fiction|story|stories|storytell\w*|screenplay|poetry|literature)\b/.test(text))return selection('espai-task-bestseller','Transfer bestseller-quality narrative writing to this original writing requirement; artistic direction and the intended market differ.');
    if(/\b(write|writing|essay\w*|report\w*|article\w*|edit\w*|author\w*|copywrit\w*|journalis\w*|publish\w*|advertis\w*)\b/.test(text))return selection('espai-task-essay','Transfer original, assessed essay writing to specified written content; professional accuracy, editorial judgment and audience goals are additional assumptions.');
    if(/\b(3d|render\w*|animat\w*|visual|graphic|illustrat\w*|photograph\w*|film|video|image\w*|design\w*)\b/.test(text))return selection('espai-task-3d','Transfer realistic scene reconstruction/rendering to visual production; inventing an artistic concept is not the same outcome.');
    return null;
  }
  if(capability==='discovery') {
    if(/\b(millennium|long.standing|unsolved|open problem)\b/.test(text)&&/\b(math\w*|theorem\w*)\b/.test(text))return selection('espai-task-millenniumprize','Comparable long-standing mathematical discovery problem.','direct or nearby task scope');
    if(/\b(math\w*|theorem\w*|proof|prove)\b/.test(text))return selection('espai-task-provemath','Transfer autonomous publishable mathematical discovery to the supplied theoretical requirement.');
    if(/\b(replicat\w*|reproduc\w*)\b/.test(text)&&/\b(machine learning|ml|artificial intelligence|neural network)\b/.test(text))return selection('espai-task-replicateml','Comparable independent replication of a machine-learning study.','direct or nearby task scope');
    if(/\b(physical laws|differential equations|simulat\w*|physics)\b/.test(text))return selection('espai-task-virtualworld','Transfer discovering symbolic laws in a simulated world to the specified modeling study; real-world experiments and genuinely new fundamental physics are not covered.');
    if(/\b(research|scientific|experiment\w*|hypothes\w*|discover\w*|study|studies|laboratory|new materials|new compounds|new treatment|new drug)\b/.test(text))return selection('espai-task-mlresearch','Transfer autonomous publishable ML research to this hypothesis/experiment/report workflow; cross-discipline validity, wet-lab equipment and independent verification remain separate assumptions.');
    return null;
  }
  if(capability==='dexterity')return physicalProxy(text,severity);
  if(capability==='hardware') {
    if(hostileEnvironment.test(text)||/\b(heavy lifting|heavy loads|crane|excavat\w*|mining|endurance|battery|uptime)\b/.test(text))return null;
    const proxy=physicalProxy(text,severity);
    return proxy?{...proxy,reason:`Physical-platform transfer: ${proxy.reason} Continuous uptime, cost and maintenance are not independently forecast.`}:null;
  }
  if(capability==='mobility') {
    if(/\b(aircraft|aviation|pilot|ship|vessel|boat|marine|subsea|space|rail|train|locomotive)\b/.test(text))return null;
    if(/\b(driv\w*|truck\w*|lorry|road|vehicle\w*|taxi|bus|delivery)\b/.test(text)&&!(isSoftware&&!physicalObject.test(text)))return selection('espai-truckdriver','Transfer the full-truck-driver forecast to road-navigation requirements; passenger interaction and vehicle-specific duties remain separate.','occupation-to-task proxy');
    if(/\b(walk\w*|run|running|navigate|navigation|move|movement|patrol|mobile robot|city streets)\b/.test(text)&&!(isSoftware&&!physicalObject.test(text)))return selection('espai-task-run','Transfer bipedal navigation in a city race to ground mobility; speed, terrain, safety and manipulation demands are not equivalent.');
    return null;
  }
  if(capability==='perception') {
    if(/\b(3d|three.dimensional|scene model|reconstruct\w*)\b/.test(text)&&/\b(video|scene|viewpoint|render\w*)\b/.test(text))return selection('espai-task-3d','Comparable scene reconstruction and viewpoint rendering.','direct or nearby task scope');
    if(/\b(image\w*|visual|photograph\w*|scan\w*|recogniz\w*|recognis\w*|detect\w*|inspect\w*|objects?|physical|robot\w*|scene\w*|equipment|machinery|materials?|patients?)\b/.test(text))return selection(/\b(new object|unfamiliar|changing|varied|robot\w*|physical|equipment|machinery|patients?)\b/.test(text)?'espai-task-oneshotlearning':'espai-task-groupimages','Transfer general object/image recognition to this perception requirement; measurement precision and domain-specific diagnosis are not established.');
    if(physicalProxy(text,severity))return selection('espai-task-oneshotlearning','Object recognition is a prerequisite for the specified physical manipulation; transfer from the surveyed one-example recognition task is assumed.');
    return null;
  }
  if(capability==='safety') {
    if(operativeClinicalTask(text))return selection('espai-surgeon','Transfer the full-surgeon feasibility forecast to assurance of this surgical task; jurisdiction-specific approval and rare-failure thresholds are not separately dated.','occupation-to-task proxy');
    if(/\b(electrical|wiring|wires?|circuits?)\b/.test(text)&&physicalAction.test(text)&&!hostileEnvironment.test(text))return selection('espai-task-wiring','Transfer competent autonomous home-wiring performance to safety of the specified electrical task; unusual hazards and certification remain conditions.');
    if(/\b(road|truck|traffic|vehicle|driving|driver)\b/.test(text)&&!/\b(air|rail|software|device driver)\b/.test(text))return selection('espai-truckdriver','Transfer full truck-driving competence to the road-safety requirement; rare-event performance and regulation remain conditions.','occupation-to-task proxy');
    return null;
  }
  return null;
}

function benchmarkContext(tasks,scenario,assessmentYear) {
  const softwareTasks=tasks.filter(t=>computational.test(normalize(t.label??t.description??t)));
  if(!softwareTasks.length)return undefined;
  const reported=softwareTasks.map(t=>Number(t.humanMinutes??t.durationMinutes)).filter(n=>Number.isFinite(n)&&n>0);
  const duration=reported.length?Math.max(...reported):480;
  const key=`${duration}|${scenario}|${assessmentYear}`;
  if(!benchmarkCache.has(key)){
    const result=estimateDigitalMilestone({durationMinutes:duration,successTarget:.8,scenario,assessmentYear});
    benchmarkCache.set(key,{pointYear:result.pointYear,crossingDate:result.crossingDate,successTarget:.8,durationMinutes:duration,
      empiricalDoublingDays:result.formula?.doublingDays,evidenceIds:result.evidenceIds,
      aboveMeasurementBoundary:result.uncertainty?.aboveMeasurementBoundary,contextOnly:true});
  }
  return {...benchmarkCache.get(key),durationBasis:reported.length?'Explicit supplied human-task duration; provenance still requires validation':'Illustrative 480-minute software benchmark; not a measured or inferred duration for this work',
    limitation:'80% benchmark success is not full workflow reliability and does not determine the occupational year.'};
}

/** Source-based conditional proxies, never a hidden universal fallback year. */
export function estimateRequirementHorizon({capabilityId,severity=.5,tasks=[],occupation={},scenario='central',assessmentYear=2026}={}) {
  if(!knownCapabilities.has(capabilityId))throw new RangeError(`Unknown capability: ${capabilityId}`);
  if(!Object.hasOwn(scenarioQuantile,scenario))throw new RangeError(`Unknown scenario: ${scenario}`);
  if(!Number.isInteger(assessmentYear)||assessmentYear<2026||assessmentYear>10000)throw new RangeError('assessmentYear must be an integer from 2026 to 10000.');
  const quantileName=scenarioQuantile[scenario];
  const items=(Array.isArray(tasks)?tasks:[]).map((task,index)=>typeof task==='string'?{id:`task:${index}`,label:task}:{...task,id:task.id??`task:${index}`});
  const directOccupation=!['frontier','unknown'].includes(capabilityId)?namedOccupation(occupation):null;
  const originalTaskIds=Array.isArray(occupation.originalTaskIds)?new Set(occupation.originalTaskIds):null;
  const chosen=new Map();
  const unmatched=[];
  for(const task of items) {
    const text=normalize(task.label??task.description??'');
    const originalTask=originalTaskIds?originalTaskIds.has(task.id):Boolean(task.sourceId)&&task.type!=='edited-task'&&!String(task.id).startsWith('added-');
    const match=speculative.test(text)?null:originalTask&&occupationTaskMatch(directOccupation,capabilityId,text)?directOccupation:choose(capabilityId,text,severity,task);
    if(!match){unmatched.push(task.id);continue;}
    const entry=chosen.get(match.id)??{...match,taskIds:[]};
    entry.taskIds.push(task.id);chosen.set(match.id,entry);
  }
  const anchors=[...chosen.values()].map(match=>{
    const milestone=milestones.get(match.id);
    if(!milestone)throw new Error(`Missing survey milestone ${match.id}`);
    const quantileYear=milestone.quantiles?.[quantileName];
    return {milestoneId:match.id,label:milestone.label,kind:milestone.kind,observableOutcome:milestone.observableOutcome,
      quantileName,quantileYear:Number.isFinite(quantileYear)?quantileYear:null,
      baselineYear:Number.isFinite(quantileYear)?Math.max(assessmentYear,Math.round(quantileYear)):null,
      pastSurveyEstimate:Number.isFinite(quantileYear)&&quantileYear<assessmentYear,
      matchType:match.matchType,reason:match.reason,taskIds:match.taskIds,sourceId:milestone.sourceId};
  });
  const missingQuantileIds=anchors.filter(a=>a.baselineYear===null).map(a=>a.milestoneId);
  const finite=anchors.filter(a=>a.baselineYear!==null);
  // A missing selected quantile cannot be silently replaced with another scenario.
  const baselineYear=anchors.length&&!missingQuantileIds.length?Math.max(...finite.map(a=>a.baselineYear)):null;
  const benchmark=capabilityId==='digital'?benchmarkContext(items,scenario,Math.min(assessmentYear,3000)):undefined;
  const physicalEvidence=items.map(t=>t.automationEvidence).filter(Boolean);
  const evidenceIds=unique([...anchors.map(a=>a.sourceId),...(anchors.length?['expert-survey']:[]),...(benchmark?.evidenceIds??[]),...(physicalEvidence.length?['robot-task-evidence']:[])]);
  const assumptions=unique(anchors.map(a=>a.reason));
  if(anchors.length)assumptions.push('The selected 2023 expert-belief milestone transfers to the supplied requirement; the numerical year is not an empirically calibrated occupation forecast.',
    'Calendar years retain the original survey anchor and are rounded to the nearest year, with past estimates displayed as the assessment year.',
    'Multiple required milestones use the latest selected quantile as a scenario marker; this is not the quantile of a fitted joint distribution.');
  if(unmatched.length&&baselineYear!==null)assumptions.push('This partial milestone assumes the unresolved requirements are solved no later; that condition is not established by the data.');
  const limitations=[
    'Survey dates represent aggregate expert beliefs and depend on elicitation framing and statistical pooling; they are not validated discovery forecasts.',
    'The semantic transfer is an explicit model assumption. Matching a nearby surveyed task does not prove complete workflow coverage.',
    'No independent completion date is assigned to integration, reliability, cost or regulatory permission beyond what the chosen milestone explicitly asks.',
    ...(anchors.some(a=>a.pastSurveyEstimate)?['A past survey estimate is not evidence that its milestone has been achieved; the assessment-year floor is a display convention only.']:[]),
    ...(unmatched.length?[`${unmatched.length} supplied requirement(s) have no selected comparable milestone for this capability.`]:[]),
    ...(missingQuantileIds.length?['The selected scenario quantile is not identifiable for at least one required anchor; no substitute year is fabricated.']:[]),
    ...(!anchors.length?['No defensible dated analogue was selected; the result remains undated instead of using a universal future year.']:[]),
    ...(physicalEvidence.length?['Current physical-task evidence includes externally model-assisted exposure assessments and citations; it is not independent field validation of complete occupational autonomy.']:[])
  ];
  return {baselineYear,evidenceIds,milestoneIds:anchors.map(a=>a.milestoneId),anchors,assumptions,limitations,
    parameterStatus:anchors.length?'survey-derived conditional task proxy':'no comparable dated evidence',
    basis:anchors.some(a=>a.matchType==='named occupation forecast')?'Surveyed named occupation, applied to a corresponding occupational requirement':anchors.length?'Semantically matched survey milestone with explicit transfer assumptions':'No defensible dated analogue',
    coverage:{inputTasks:items.length,matchedTasks:items.length-unmatched.length,unmatchedTaskIds:unmatched,missingQuantileIds,
      complete:anchors.length>0&&unmatched.length===0&&missingQuantileIds.length===0},
    ...(benchmark?{benchmark}:{}),
    ...(physicalEvidence.length?{readinessEvidence:{assessedTasks:physicalEvidence.length,exposureTiers:unique(physicalEvidence.map(e=>e.exposureTier).filter(Boolean)),
      use:'Context only; no current-year full-automation conclusion is inferred.'}}:{})};
}
