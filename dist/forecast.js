/** Evidence-linked scenarios: measured benchmark trends, published expert forecasts,
 * and explicit task-specific transfer assumptions. No universal unknown-year fallback. */
import {mapTask,occupationConstraints} from './mapping.js';
import {estimateRequirementHorizon} from './horizons.js';
import {estimateWorkflow} from './workflow.js';
export const MODEL_AS_OF='2026-10-31';
export const PARAMETER_YEAR=2026;
const define = (id, label, description, evidenceIds, readiness, dependencies = []) =>
  Object.freeze({id,label,description,evidenceIds,readiness,dependencies,parameterStatus:'evidence-linked conditional scenario; not validated occupation prediction'});

export const capabilityDefinitions = Object.freeze({
  digital: define('digital','Reliable digital work','Complete computer workflows, verify results and recover from errors.',['metr-horizon','metr-th11','osworld','webarena','swebench','tau-bench'],'Demonstrated on bounded workflows; sustained reliability varies.'),
  reasoning: define('reasoning','Independent judgment','Resolve unfamiliar cases, plan, check evidence and correct mistakes.',['metr-horizon','tau-bench','expert-survey'],'Strong bounded results; open-ended reliability is not established.'),
  perception: define('perception','Real-world perception','Understand objects, people and changing physical scenes.',['gemini-robotics','open-x','droid','behavior'],'Demonstrated in studied environments; transfer remains a constraint.'),
  dexterity: define('dexterity','Adaptable robotic hands','Manipulate variable objects and materials with precise contact and force.',['aloha','mobile-aloha','pi05','droid','robot-exposure'],'Demonstrated on selected tasks; arbitrary work environments remain unproven.',['perception']),
  mobility: define('mobility','Autonomous movement','Navigate, drive and act through variable physical environments.',['mobile-aloha','behavior','gemini-robotics','robot-exposure'],'Useful bounded deployments and experiments; broad coverage is unresolved.',['perception']),
  social: define('social','Human interaction','Handle conversation, negotiation, teaching and interpersonal complexity.',['sotopia','tau-bench','expert-survey'],'Conversation is demonstrated; sustained social judgment and acceptance vary.'),
  creative: define('creative','Original creative direction','Create, evaluate and refine original work against changing goals.',['expert-survey','metr-horizon'],'Generation is demonstrated; independent direction and evaluation vary.'),
  discovery: define('discovery','Autonomous scientific discovery','Form hypotheses, design experiments, interpret results and validate discoveries.',['alab','alab-correction','gnome','robot-chemistry','alphafold3','expert-survey'],'Closed-loop discovery exists in bounded domains; general discovery is unproven.',['reasoning']),
  safety: define('safety','High-stakes reliability','Demonstrate safe performance, detect rare failures and recover reliably.',['nist-rmf','surgical-dissection','tau-bench','robot-exposure'],'Assurance must be validated for the actual deployment and consequences.'),
  hardware: define('hardware','Durable physical systems','Supply force, endurance, maintenance and operation in demanding conditions.',['robot-exposure','mobile-aloha','progress-history','battery-progress','vision-economics'],'Specialized hardware exists; versatility, cost and uptime differ by setting.'),
  frontier: define('frontier','Unproven scientific prerequisites','Resolve explicitly speculative physical or scientific prerequisites.',['expert-survey','progress-history','gnome'],'Feasibility and timing are unknown without comparable evidence.',['discovery']),
  unknown: define('unknown','Requirements needing clarification','Account for duties whose requirements cannot be established from the supplied description.',['expert-survey','progress-history'],'The work needs clarification; no shared future deadline is assigned.')
});

const unique=values=>[...new Set(values)];
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const maximum=values=>{const valid=values.filter(finite);return valid.length?Math.max(...valid):null;};

export function assessOccupation(occupation={},options={}){
  const scenario=options.scenario??'central',assessmentYear=Number(options.assessmentYear??PARAMETER_YEAR);
  if(!['accelerated','central','conservative'].includes(scenario))throw new RangeError(`Unknown scenario: ${scenario}`);
  if(!Number.isInteger(assessmentYear)||assessmentYear<2026||assessmentYear>3000)throw new RangeError('assessmentYear must be an integer from 2026 to 3000.');
  const sourceTasks=occupation.tasks?.length?occupation.tasks:[{id:'description-proxy',label:occupation.description||occupation.title||'Unspecified work',type:'description-proxy'}];
  const mapped=sourceTasks.map((task,index)=>mapTask(task,index,occupation)),requirements=new Map();
  function include(id,severity,reason,taskId,basis='task text'){
    const entry=requirements.get(id)??{id,severity:0,requirements:[],taskIds:[],mappingDetails:[]};
    entry.severity=Math.max(entry.severity,Math.max(0,Math.min(1,severity)));
    entry.requirements=unique([...entry.requirements,reason]);
    if(taskId!==undefined)entry.taskIds=unique([...entry.taskIds,taskId]);
    entry.mappingDetails.push({basis,reason,...(taskId!==undefined?{taskId}:{})});requirements.set(id,entry);
  }
  for(const task of mapped)for(const [id,value] of task.matches)for(const reason of value.requirements)include(id,value.severity,reason,task.original.id);
  const constraints=occupationConstraints(occupation,mapped);
  for(const entry of constraints.constraints)include(entry.id,entry.severity,entry.reason,undefined,entry.basis);
  function dependencies(id,seen=new Set()){
    if(seen.has(id))return;seen.add(id);
    const entry=requirements.get(id);
    for(const dependency of capabilityDefinitions[id].dependencies){
      const reason=`Prerequisite for ${capabilityDefinitions[id].label.toLowerCase()}`;
      if(entry.taskIds.length)for(const taskId of entry.taskIds)include(dependency,entry.severity*.85,reason,taskId,'capability dependency');
      else include(dependency,entry.severity*.85,reason,undefined,'capability dependency');
      dependencies(dependency,new Set(seen));
    }
  }
  for(const id of [...requirements.keys()])dependencies(id);
  const classificationOnly=occupation.coverage==='classification'&&sourceTasks.every(task=>task.type==='description-proxy');
  const estimate=(id,severity,tasks)=>{
    const result=estimateRequirementHorizon({capabilityId:id,severity,tasks,occupation,scenario,assessmentYear});
    return classificationOnly?{...result,baselineYear:null,basis:'Classification title only',assumptions:[...(result.assumptions||[]),'Choose a specific occupation or supply duties; a classification title is not a complete work profile.']}:result;
  };
  const capabilities=[...requirements.values()].map(entry=>{
    const definition=capabilityDefinitions[entry.id],tasks=mapped.filter(task=>entry.taskIds.includes(task.original.id)).map(task=>task.original);
    const horizon=estimate(entry.id,entry.severity,tasks.length?tasks:sourceTasks);
    return {...entry,...horizon,label:definition.label,description:definition.description,baselineYear:horizon.baselineYear??null,
      requirementLevel:Number(entry.severity.toFixed(3)),evidenceIds:unique([...definition.evidenceIds,...horizon.evidenceIds||[]]),
      readiness:definition.readiness,dependencies:[...definition.dependencies],parameterStatus:horizon.parameterStatus||definition.parameterStatus};
  }).sort((a,b)=>(b.baselineYear??-Infinity)-(a.baselineYear??-Infinity)||a.id.localeCompare(b.id));
  const tasks=mapped.map(task=>{
    const local=new Map([...task.matches].map(([id,value])=>[id,value.severity]));
    const addDependencies=(id,seen=new Set())=>{
      if(seen.has(id))return;seen.add(id);
      for(const dependency of capabilityDefinitions[id].dependencies){local.set(dependency,Math.max(local.get(dependency)??0,local.get(id)*.85));addDependencies(dependency,new Set(seen));}
    };
    for(const id of [...local.keys()])addDependencies(id);
    const physicalScopeGap=task.details.some(detail=>detail.basis==='published task assessment'&&detail.physical&&detail.disagreement);
    const horizons=[...local].map(([id,severity])=>({id,...estimate(id,severity,[task.original])}));
    return {...task.original,capabilityIds:[...local.keys()],baselineYear:maximum(horizons.map(h=>h.baselineYear)),
      physicalScopeGap,undatedCapabilityIds:unique([...horizons.filter(h=>!finite(h.baselineYear)).map(h=>h.id),...(physicalScopeGap?['physical-scope-gap']:[])]),
      horizonBasis:unique(horizons.map(h=>h.basis).filter(Boolean)).join('; '),
      milestoneIds:unique(horizons.flatMap(h=>h.milestoneIds||[])),
      requirements:unique([...task.matches.values()].flatMap(value=>value.requirements)),
      mappingBasis:task.matches.has('unknown')?'Unresolved requirement':task.details.some(d=>d.basis==='broad requirement inference')?'Broad requirement inference':'Task effects, source context and explicit dependencies',mappingDetails:task.details};
  });
  // No arbitrary integration delay or generic missing-work calendar is invented.
  // This estimate conditions on remaining integration and deployment requirements.
  const workflow=estimateWorkflow({anchors:capabilities.flatMap(cap=>cap.anchors||[]),occupation:{...occupation,tasks:sourceTasks},scenario,assessmentYear});
  // A direct full-occupation forecast already includes its unchanged source
  // duties. Keep superseded task analogies inspectable without treating them as
  // extra independent conditions or displaying contradictory requirement dates.
  const subsumed=new Set(workflow.subsumedMilestoneIds);
  const wholeAnchors=capabilities.flatMap(cap=>cap.anchors||[]).filter(anchor=>workflow.wholeOccupationMilestoneIds.includes(anchor.milestoneId));
  const wholeYear=maximum(wholeAnchors.map(anchor=>anchor.baselineYear));
  for(const cap of capabilities){
    cap.anchors=cap.anchors.map(anchor=>({...anchor,subsumedByOccupation:subsumed.has(anchor.milestoneId)}));
    if(cap.anchors.some(anchor=>anchor.subsumedByOccupation)){
      cap.standaloneBaselineYear=cap.baselineYear;
      cap.baselineYear=maximum([wholeYear,...cap.anchors.filter(anchor=>!anchor.subsumedByOccupation).map(anchor=>anchor.baselineYear)]);
      cap.basis+='; generic subtask analogies are covered by the directly surveyed full occupation';
    }
  }
  for(const task of tasks)if(task.sourceId&&task.milestoneIds.some(id=>subsumed.has(id))){
    task.standaloneBaselineYear=task.baselineYear;
    task.baselineYear=maximum([wholeYear,...capabilities.flatMap(cap=>cap.anchors).filter(anchor=>!anchor.subsumedByOccupation&&anchor.taskIds.includes(task.id)).map(anchor=>anchor.baselineYear)]);
    task.horizonBasis+='; unchanged source duty covered by the full-occupation survey rather than its generic subtask analogue';
  }
  capabilities.sort((a,b)=>(b.baselineYear??-Infinity)-(a.baselineYear??-Infinity)||a.id.localeCompare(b.id));
  const bottleneckYear=maximum(capabilities.map(cap=>cap.baselineYear));
  const technicalYear=classificationOnly?null:workflow.baselineYear,integrationYears=0;
  const unmappedTasks=mapped.filter(task=>task.matches.has('unknown')).length;
  const inferredTasks=mapped.filter(task=>task.details.some(d=>d.basis==='broad requirement inference')).length;
  const proxyTasks=mapped.filter(task=>/skill|proxy/.test(task.original.type??'')).length;
  const undatedCapabilities=capabilities.filter(cap=>!finite(cap.baselineYear)).map(cap=>cap.id);
  const undatedTasks=tasks.filter(task=>task.undatedCapabilityIds.length>0).length;
  const physicalScopeGaps=tasks.filter(task=>task.physicalScopeGap).length;
  const benchmarkComponents=capabilities.map(cap=>cap.benchmark).filter(Boolean);
  const taskResearch=tasks.filter(task=>task.sourceId&&task.automationEvidence);
  const forecastStatus=technicalYear===null?'insufficient-evidence':undatedCapabilities.length||undatedTasks?'partial':'conditional';
  const assumptions=[
    'The endpoint is autonomous completion of the supplied work profile, not worldwide adoption or disappearance of employment.',
    'Dated milestones use published expert forecast distributions and explicit transfers to the selected work. They are opinions, not demonstrated future dates.',
    `${workflow.eventCount} distinct published milestone events are combined so all must arrive. The shared-progress/independent-progress mixture weight is an explicit assumption, not an empirically fitted correlation.`,
    'Measured software benchmark progress is used only within its stated task and success-rate scope; 80% success does not establish full-job reliability.',
    'The scenario assumes compatible workflow integration, sufficient reliability, financing and permission when required capabilities arrive. No unsupported fixed integration delay is added.',
    ...(forecastStatus==='partial'?['This is a partial projection: the displayed year assumes undated requirements do not delay the mapped milestones. It is not a complete evidenced deadline for the whole job.']:[]),
    ...(forecastStatus==='insufficient-evidence'?['The supplied work cannot be dated from these sources. No generic year is substituted.']:[])
  ];
  const limitations=[
    'Whole-job automation dates have not been calibrated against observed outcomes. Empirical benchmark fit and expert elicitation are different evidence types.',
    'Task mapping remains provisional. Source ratings are not direct machine capability measurements, and transferable analogies can be wrong.',
    'Forecasts elicited in 2023 are historical judgments. Passing a forecast date does not demonstrate that its milestone was achieved.',
    'Future discoveries, safety, cost, institutions and deployment can shift or prevent automation. A single year does not imply single-year accuracy.',
    'Different source milestones can partly overlap even after exact duplicates are removed. The dependence mixture is a scenario choice; its quantiles are not calibrated real-world probabilities.',
    ...(workflow.status==='outside-source-grid'?['The selected joint scenario does not cross within the supplied source CDF grid. No later numerical deadline is fabricated.']:[]),
    ...(taskResearch.length?['Task-level robotics assessments are published AI-assisted research with cited examples, not independent trials of every task or its full workflow.']:[]),
    ...(physicalScopeGaps?[`${physicalScopeGaps} duties have a disagreement between the published physical-work assessment and the mapped effects; those requirements remain incomplete.`]:[]),
    ...(unmappedTasks?[`${unmappedTasks} requirements need clearer task descriptions; they do not receive a shared future breakthrough date.`]:[]),
    ...(undatedCapabilities.length?[`${undatedCapabilities.length} capability areas have no applicable dated evidence for this scope.`]:[]),
    ...(proxyTasks?[`${proxyTasks} inputs are skill or description proxies, rather than complete observed task inventories.`]:[])
  ];
  return {baselineYear:technicalYear,technicalYear,bottleneckYear,integrationYears,forecastStatus,capabilities,tasks,benchmarkComponents,workflow,
    evidenceIds:unique([...capabilities.flatMap(cap=>cap.evidenceIds),...(taskResearch.length?['robot-task-evidence']:[]),'ilo-exposure-2025','bls-projection-methods','diffusion-history','progress-history']),
    assumptions,limitations,suppressedConstraints:constraints.suppressedConstraints,
    confidence:{level:'low',label:forecastStatus==='insufficient-evidence'?(workflow.status==='outside-source-grid'?'Beyond modeled horizon':'More detail needed'):forecastStatus==='partial'?'Incomplete evidence':'Conditional evidence-based scenario',reason:'The numeric basis and its transfer assumptions are inspectable; full-job accuracy is not established.'},
    coverage:{totalTasks:tasks.length,mappedTasks:tasks.length-unmappedTasks,unmappedTasks,inferredTasks,proxyTasks,undatedTasks,undatedCapabilities,physicalScopeGaps,structuredFeatureCount:constraints.structuredFeatureCount,researchedTasks:taskResearch.length,linkedTaskCitations:taskResearch.reduce((n,t)=>n+t.automationEvidence.sources.length,0),sourceType:occupation.source??'custom',complete:false,note:'Every supplied requirement is retained. Missing support is disclosed without a universal unknown-year fallback.'},
    parameterStatus:'source-linked scenarios; benchmark calibration is scoped, whole-job prediction accuracy unvalidated',modelAsOf:MODEL_AS_OF,scenario};
}
