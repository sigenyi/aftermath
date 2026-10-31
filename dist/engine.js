import {assessOccupation,capabilityDefinitions} from './forecast.js';
import {catalog,evidenceRegistry,catalogMetadata} from './catalog.js';
import {prepareOccupation} from './profile.js';
export {catalog,catalogMetadata,loadCatalog,loadOccupation,resolveRole} from './catalog.js';
export const MODEL_VERSION='1.0.0';
export const REVIEWED_AT='2026-10-30';
export {capabilityDefinitions};
const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
/** Model output is a conditional scenario, not a calibrated prediction. */
export function buildReport({title='Custom role',tasks=[],scenario='central',occupation=null,assessmentYear=new Date().getFullYear()}={}){
  const seen=new Set();
  const cleanTasks=tasks.filter(t=>t&&t.selected!==false).map((task,i)=>typeof task==='string'?{id:`custom:${i}`,label:task}:structuredClone(task)).map(task=>({...task,label:String(task.label??'').trim()})).filter(task=>{
    const key=normalize(task.label);if(!key||seen.has(key))return false;seen.add(key);return true;
  });
  if(!cleanTasks.length)throw new Error('Add at least one task before calculating a timeline.');
  const original=occupation?prepareOccupation(occupation).tasks:[];
  const signature=list=>JSON.stringify(list.map(task=>[task.id,normalize(task.label)]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))));
  const profileCustomized=!!occupation&&signature(original)!==signature(cleanTasks);
  const selectedKeys=new Set(cleanTasks.map(task=>`${task.id}::${normalize(task.label)}`));
  const originalScopeRetained=original.every(task=>selectedKeys.has(`${task.id}::${normalize(task.label)}`));
  const sourceRatingsOmitted=profileCustomized&&!originalScopeRetained;
  const raw={...(occupation||{}),...(sourceRatingsOmitted?{features:{},iscoCode:''}:{}),title:String(title).trim()||'Custom role',source:occupation?.source||'custom',tasks:cleanTasks};
  const result=assessOccupation(raw,{scenario,assessmentYear});
  const evidenceIds=new Set(result.evidenceIds||result.capabilities.flatMap(cap=>cap.evidenceIds||[]));
  const sources=evidenceRegistry.filter(source=>evidenceIds.has(source.id));
  const sourceRecord=occupation?{id:occupation.source, title:`${occupation.source.toUpperCase()} — ${occupation.title}`,publisher:occupation.source==='onet'?'O*NET / U.S. Department of Labor':occupation.source==='esco'?'European Commission':'International Labour Organization',url:occupation.sourceUrl,date:catalogMetadata.sources?.[occupation.source]?.version||'',kind:'occupation',observation:profileCustomized?`Base occupation reference; the user adapted this task profile. Original role-wide ratings are ${sourceRatingsOmitted?'omitted':'retained because all original requirements remain'}.`:occupation.coverage==='skills'?'Occupational skill requirements; these are proxies for work, not complete task observations.':occupation.coverage==='classification'?'Official occupation code and group title; detailed duties are not imported.':'Occupational descriptions and task requirements.',limitation:'This source does not publish the automation year shown here.'}:null;
  return {...result,profileCustomized,sourceRatingsOmitted,version:MODEL_VERSION,generatedAt:new Date().toISOString(),assessmentYear,title:raw.title,scenario,source:raw.source,sourceCode:occupation?.sourceCode||null,sourceRecord,sourceCoverage:occupation?.coverage||'custom',sources,sourceTaskCount:occupation?.tasks?.length||0,customTaskCount:cleanTasks.filter(task=>!task.sourceId||String(task.id).startsWith('added-')).length,fullAutomation:{label:String(result.baselineYear),year:result.baselineYear},frontiers:result.capabilities};
}
