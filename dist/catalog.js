/** Versioned source records. Search metadata is loaded once; full task records on demand. */
export const catalog=[];
export const catalogMetadata={};
export const evidenceRegistry=[];
let ready, revision=0;
const chunkCache=new Map();
export const getCatalogRevision=()=>revision;
const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\p{M}]+/gu,' ').trim();
export function installCatalog(index,evidence={sources:[]}){
  if(!index||!Array.isArray(index.roles)||!index.roles.length)throw new Error('The occupation catalog is empty.');
  const ids=new Set();
  for(const role of index.roles){if(!role.id||!role.title||ids.has(role.id))throw new Error('The occupation catalog contains an invalid record.');ids.add(role.id);}
  catalog.splice(0,catalog.length,...index.roles);
  for(const key of Object.keys(catalogMetadata))delete catalogMetadata[key];
  Object.assign(catalogMetadata,index.metadata||{});
  const records=Array.isArray(evidence)?evidence:evidence.sources||evidence.evidence||evidence.records||[];
  evidenceRegistry.splice(0,evidenceRegistry.length,...records);
  revision++;chunkCache.clear();
  return catalog;
}
async function getJSON(path){const url=new URL(path,import.meta.url);url.searchParams.set('v',new URL(import.meta.url).searchParams.get('v')||'2.0.0');const response=await fetch(url);if(!response.ok)throw new Error(`Could not load occupation data (${response.status}).`);return response.json();}
export function loadCatalog(){
  if(!ready)ready=Promise.all([getJSON('./data/catalog-index.json'),getJSON('./data/evidence.json')]).then(([index,evidence])=>installCatalog(index,evidence)).catch(error=>{ready=null;throw error;});
  return ready;
}
export async function loadOccupation(id,readJSON=getJSON){
  const entry=catalog.find(role=>role.id===id);
  if(!entry)throw new Error('That occupation is not in the current catalog.');
  if(!chunkCache.has(entry.file))chunkCache.set(entry.file,readJSON(`./data/${entry.file}`).catch(error=>{chunkCache.delete(entry.file);throw error;}));
  const chunk=await chunkCache.get(entry.file);
  const role=(Array.isArray(chunk)?chunk:chunk.roles).find(role=>role.id===id);
  if(!role)throw new Error('The selected occupation detail is missing.');
  return structuredClone(role);
}
export function resolveRole(input){
  const raw=normalize(input), clean=raw.replace(/^(senior|junior|lead|principal|staff)\s+/,'');
  const matches=value=>catalog.filter(role=>[role.title,...(role.aliases||[]),role.sourceCode].some(term=>normalize(term)===value));
  const candidates=matches(raw).length?matches(raw):matches(clean), needle=matches(raw).length?raw:clean;
  const canonical=candidates.filter(role=>normalize(role.title)===needle||normalize(role.sourceCode)===needle);
  const ranked=(canonical.length?canonical:candidates).sort((a,b)=>(a.source==='onet'?-1:0)-(b.source==='onet'?-1:0)||normalize(a.title).length-normalize(b.title).length);
  if(!canonical.length&&ranked.length>1)return {matched:false,role:null,candidates:ranked,confidence:'Choose occupation',needsDetails:false,ambiguous:true};
  if(ranked[0])return {matched:true,role:ranked[0],confidence:'Title match',needsDetails:false};
  return {matched:false,role:null,confidence:'Needs task description',needsDetails:true};
}
