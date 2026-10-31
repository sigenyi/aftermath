import milestoneData from './milestone-data.js';

const milestones=new Map(milestoneData.milestones.map(item=>[item.milestoneId,item]));
const targets={accelerated:.1,central:.5,conservative:.9};
const cache=new Map();

/** Completion of all events, under an explicit mixture of shared and independent
 * progress. The mixture weight is an assumption, not an estimated correlation. */
export function completionProbability(probabilities,sharedWeight=.5){
  if(!Number.isFinite(sharedWeight)||sharedWeight<0||sharedWeight>1)throw new RangeError('sharedWeight must be between zero and one.');
  if(!probabilities.length||probabilities.some(p=>!Number.isFinite(p)||p<0||p>1))throw new RangeError('At least one valid event probability is required.');
  return sharedWeight*Math.min(...probabilities)+(1-sharedWeight)*probabilities.reduce((a,b)=>a*b,1);
}

function crossing(years,values,target){
  const i=values.findIndex(value=>value>=target);
  if(i<0)return null;
  if(i===0)return years[0];
  const fraction=(target-values[i-1])/(values[i]-values[i-1]);
  return years[i-1]+fraction*(years[i]-years[i-1]);
}

/** Pure numerical calculation; a bounded source grid is never extended silently. */
export function combineMilestoneCdfs(events,{target=.5,sharedWeight=.5,assessmentYear=2026}={}){
  if(!Number.isFinite(target)||target<=0||target>=1)throw new RangeError('target must be strictly between zero and one.');
  if(!Number.isFinite(assessmentYear))throw new RangeError('assessmentYear must be finite.');
  completionProbability([.5],sharedWeight);
  const unique=[...new Map(events.map(event=>[event.milestoneId,event])).values()];
  const missing=unique.filter(event=>!event.cdf?.years?.length||!event.cdf?.probabilities?.length).map(event=>event.milestoneId);
  const base={eventCount:unique.length,milestoneIds:unique.map(event=>event.milestoneId),target,sharedWeight,
    method:'Mixture of perfectly shared and independent milestone progress',formula:'w * min(F_i(t)) + (1 - w) * product(F_i(t))',
    parameterStatus:'Dependence scenario, not an empirically estimated joint forecast',missingMilestoneIds:missing};
  if(!unique.length||missing.length)return {...base,baselineYear:null,crossingYear:null,status:'missing-evidence',sensitivity:null};
  const years=unique[0].cdf.years;
  for(const event of unique){
    const cdf=event.cdf;
    if(cdf.years.length!==years.length||cdf.probabilities.length!==years.length||cdf.years.some((year,i)=>year!==years[i]))throw new Error('Milestone CDF grids must align.');
    if(cdf.probabilities.some((p,i)=>!Number.isFinite(p)||p<0||p>1||(i>0&&p<cdf.probabilities[i-1]))||years.some((y,i)=>!Number.isFinite(y)||(i>0&&y<=years[i-1])))throw new Error('Invalid milestone CDF.');
  }
  const shared=[],independent=[],mixed=[];
  for(let i=0;i<years.length;i++){
    const values=unique.map(event=>event.cdf.probabilities[i]);
    shared.push(Math.min(...values));independent.push(values.reduce((a,b)=>a*b,1));
    mixed.push(sharedWeight*shared[i]+(1-sharedWeight)*independent[i]);
  }
  const crossingYear=crossing(years,mixed,target);
  const rounded=year=>year===null?null:Math.max(assessmentYear,Math.round(year));
  return {...base,crossingYear,baselineYear:rounded(crossingYear),status:crossingYear===null?'outside-source-grid':'conditional',
    gridEnd:years.at(-1),pastSurveyCrossing:crossingYear!==null&&crossingYear<assessmentYear,
    sensitivity:{perfectlySharedYear:rounded(crossing(years,shared,target)),independentYear:rounded(crossing(years,independent,target)),
      interpretation:'Two dependence assumptions, not confidence bounds; other dependencies are possible.'},
    assumptions:['Every selected milestone must be achieved; repeated references to the same milestone count once.',
      'The default 0.5 mixture weight is an explicit modeling choice, not measured dependence between technologies.',
      'Source distributions describe historical expert beliefs; transferred tasks, integration and deployment remain conditions.',
      'Linear interpolation between evaluated CDF points locates the crossing; no projection extends beyond the supplied grid.',
      'Tail behavior depends on the fitted gamma family and sparse elicited probabilities; distant dates are especially fragile.']};
}

/** Deduplicate shared prerequisites. A directly matched whole-occupation event
 * includes its original duties, but cannot silently absorb custom added duties. */
export function selectWorkflowEvents(anchors,occupation={}){
  const named=anchors.filter(anchor=>anchor.matchType==='named occupation forecast');
  const canCover=named.length&&['onet','esco'].includes(occupation.source)&&occupation.originalScopeRetained!==false;
  const originalIds=new Set(occupation.originalTaskIds??(occupation.tasks||[]).filter(task=>task.sourceId).map(task=>task.id));
  const selected=canCover?anchors.filter(anchor=>anchor.matchType==='named occupation forecast'||(anchor.taskIds||[]).some(id=>!originalIds.has(id))):anchors;
  const ids=[...new Set(selected.map(anchor=>anchor.milestoneId))].sort();
  return {milestoneIds:ids,wholeOccupationMilestoneIds:canCover?[...new Set(named.map(anchor=>anchor.milestoneId))]:[],
    subsumedMilestoneIds:[...new Set(anchors.map(anchor=>anchor.milestoneId))].filter(id=>!ids.includes(id))};
}

export function estimateWorkflow({anchors=[],occupation={},scenario='central',assessmentYear=2026,sharedWeight=.5}={}){
  if(!Object.hasOwn(targets,scenario))throw new RangeError(`Unknown scenario: ${scenario}`);
  const selection=selectWorkflowEvents(anchors,occupation);
  const key=JSON.stringify([selection.milestoneIds,scenario,assessmentYear,sharedWeight]);
  if(!cache.has(key))cache.set(key,combineMilestoneCdfs(selection.milestoneIds.map(id=>milestones.get(id)??{milestoneId:id}),{target:targets[scenario],sharedWeight,assessmentYear}));
  return {...cache.get(key),...selection};
}
