/** Keep source task and skill semantics explicit; never invent a detailed task list. */
export function prepareOccupation(occupation){
  const tasks=(occupation.tasks||[]).filter(task=>task.type!=='optional-skill');
  const seen=new Set();
  const selected=tasks.filter(task=>{const key=String(task.label||'').normalize('NFKC').trim().toLowerCase();if(!key||seen.has(key))return false;seen.add(key);return true;}).map(task=>structuredClone(task));
  if(!selected.length)selected.push({id:`${occupation.id}:description`,label:occupation.description||occupation.title,sourceId:occupation.source,type:'description-proxy'});
  return {...occupation,tasks:selected};
}
