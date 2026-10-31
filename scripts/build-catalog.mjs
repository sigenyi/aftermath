import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {assessOccupation} from '../dist/forecast.js';
import {prepareOccupation} from '../dist/profile.js';
const root=new URL('../',import.meta.url),data=new URL('dist/data/',root);
const sha=contents=>createHash('sha256').update(contents).digest('hex');
const readJSON=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const sources={},roles=[],audit={sourceCounts:{},rawRequirementCount:0,selectedRequirementCount:0,descriptionOnlyCount:0,skillProfileCount:0,optionalSkillCount:0};
for(const key of ['onet','esco','isco']){
  const raw=await readFile(new URL(`${key}.json`,data),'utf8'),source=JSON.parse(raw);
  if(!source.roles?.length)throw new Error(`No ${key} roles.`);
  sources[key]={version:source.metadata.version,count:source.roles.length,urls:source.metadata.urls,license:source.metadata.license,sha256:sha(raw),retrievedAt:source.metadata.retrievedAt,sourceCounts:source.metadata.counts};
  audit.sourceCounts[key]=source.roles.length;
  for(const role of source.roles){roles.push(role);audit.rawRequirementCount+=(role.tasks||[]).length;audit.optionalSkillCount+=(role.optionalSkills||[]).length;if(!role.tasks?.length)audit.descriptionOnlyCount++;if(role.coverage==='skills')audit.skillProfileCount++;}
}
const ids=new Set();for(const role of roles){if(ids.has(role.id))throw new Error(`Duplicate ID ${role.id}`);ids.add(role.id);}
const chunkDir=new URL('occupations/',data);await mkdir(chunkDir,{recursive:true});
const index=[],forecasts=[],failures=[],capabilityCounts={};
let minYear=Infinity,maxYear=-Infinity,unmappedRoles=0,sourceRowsWithFullMapping=0;
const evidence=await readJSON('dist/data/evidence.json'),sourceIds=new Set(evidence.sources.map(source=>source.id));
for(const source of evidence.sources){if(!source.id||!source.url||!source.title)throw new Error('Invalid research reference.');if(source.date&&/^\d{4}-\d{2}-\d{2}$/.test(source.date)&&source.date>'2026-10-30')throw new Error(`Future research: ${source.id}`);}
for(const key of ['onet','esco','isco']){
  const subset=roles.filter(role=>role.source===key);
  for(let offset=0;offset<subset.length;offset+=60){
    const chunk=subset.slice(offset,offset+60),file=`occupations/${key}-${String(offset/60).padStart(3,'0')}.json`;
    await writeFile(new URL(file,data),JSON.stringify({roles:chunk}));
    for(const role of chunk){
      const profile=prepareOccupation(role);audit.selectedRequirementCount+=profile.tasks.length;
      const reports={};for(const scenario of ['accelerated','central','conservative'])reports[scenario]=assessOccupation(profile,{scenario,assessmentYear:2026});
      const r=reports.central;
      if(!Number.isInteger(r.baselineYear)||r.baselineYear<=2026)failures.push(`${role.id}: invalid baseline`);
      if(!(reports.accelerated.baselineYear<=r.baselineYear&&r.baselineYear<=reports.conservative.baselineYear))failures.push(`${role.id}: nonmonotonic scenarios`);
      if(r.tasks.length!==profile.tasks.length)failures.push(`${role.id}: omitted input requirements`);
      if(r.baselineYear<Math.max(...r.capabilities.map(cap=>cap.baselineYear)))failures.push(`${role.id}: endpoint before a required capability`);
      for(const cap of r.capabilities){capabilityCounts[cap.id]=(capabilityCounts[cap.id]||0)+1;for(const id of cap.evidenceIds||[]){if(!sourceIds.has(id))failures.push(`${role.id}: missing evidence ${id}`);}}
      minYear=Math.min(minYear,r.baselineYear);maxYear=Math.max(maxYear,r.baselineYear);
      if(r.coverage?.unmappedTasks>0)unmappedRoles++;else sourceRowsWithFullMapping++;
      index.push({id:role.id,title:role.title,aliases:role.aliases||[],sector:role.sector,source:role.source,sourceCode:role.sourceCode,sourceVersion:role.sourceVersion,coverage:role.coverage,taskCount:profile.tasks.length,file});
      forecasts.push({id:role.id,baselineYear:r.baselineYear,fasterYear:reports.accelerated.baselineYear,slowerYear:reports.conservative.baselineYear,capabilities:r.capabilities.map(cap=>({id:cap.id,year:cap.baselineYear,evidenceIds:cap.evidenceIds})),integrationYears:r.integrationYears,coverage:r.coverage});
    }
  }
}
if(failures.length)throw new Error(`Catalog model audit failed:\n${failures.slice(0,30).join('\n')}`);
const metadata={version:'1.0.0',asOf:'2026-10-30',sources,totalRecords:roles.length,aliasCount:roles.reduce((n,role)=>n+(role.aliases||[]).length,0),researchReferences:evidence.sources.length,scope:'Versioned source records, not a deduplicated census of all possible jobs. English ESCO; U.S. O*NET; ISCO unit groups.',modelSourceSha256:sha(await readFile(new URL('dist/forecast.js',root))),evidenceSha256:sha(JSON.stringify(evidence))};
await writeFile(new URL('catalog-index.json',data),JSON.stringify({metadata,roles:index}));
await writeFile(new URL('forecast-index.json',data),JSON.stringify({metadata:{asOf:metadata.asOf,modelVersion:metadata.version,modelSourceSha256:metadata.modelSourceSha256,evidenceSha256:metadata.evidenceSha256,note:'Conditional model estimates; not validated occupational automation dates.'},forecasts}));
Object.assign(audit,{totalRecords:roles.length,computedScenarios:roles.length*3,aliasCount:metadata.aliasCount,researchReferences:evidence.sources.length,baselineYearMin:minYear,baselineYearMax:maxYear,capabilityCounts,rolesWithUnmappedRequirements:unmappedRoles,rolesWithoutUnmappedRequirements:sourceRowsWithFullMapping,failures,validation:'Structural and consistency audit only; not empirical forecast accuracy.'});
await writeFile(new URL('research/CATALOG-AUDIT.json',root),JSON.stringify(audit,null,2)+'\n');
await writeFile(new URL('research/CATALOG-AUDIT.md',root),`# Catalog-wide audit\n\nReference date: October 30, 2026.\n\n${roles.length.toLocaleString()} source records; ${(roles.length*3).toLocaleString()} scenario calculations.\n\n| Source | Records |\n| --- | ---: |\n${Object.entries(audit.sourceCounts).map(([key,n])=>`| ${key.toUpperCase()} | ${n.toLocaleString()} |`).join('\n')}\n\n- ${audit.rawRequirementCount.toLocaleString()} imported required task/skill statements.\n- ${audit.optionalSkillCount.toLocaleString()} optional skills retained separately, not silently treated as universal requirements.\n- ${audit.descriptionOnlyCount} source records require a description or classification proxy.\n- ${audit.researchReferences} published research references in the registry.\n- ${unmappedRoles} profiles contain explicitly unmapped requirements.\n- All input requirements retained in model output; no occupation is dropped.\n- Every reference ID resolves; all baseline years are finite integers.\n- Faster ≤ baseline ≤ slower for every profile; endpoint never precedes a required capability.\n\n## What this does not validate\n\nThese checks establish software consistency and source coverage, not accuracy of future dates. Whole-role full-automation outcomes are not available as a calibrated validation set. Overlapping source records are not unique jobs. Missing requirements, occupational variation, unobserved future discoveries, and economic adoption can materially change the outputs.\n`);
console.log(JSON.stringify(audit,null,2));
