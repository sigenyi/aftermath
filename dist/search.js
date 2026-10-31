import {catalog,getCatalogRevision} from './catalog.js';
const normalize=value=>String(value??'').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\p{M}]+/gu,' ').trim();
let cachedRevision=-1,entries=[];
function index(){if(cachedRevision!==getCatalogRevision()){entries=catalog.map((role,order)=>({role,order,title:normalize(role.title),terms:[...new Set([role.title,...role.aliases||[],role.sourceCode].map(normalize).filter(Boolean))]}));cachedRevision=getCatalogRevision();}return entries;}
export function searchOccupations(query,limit=6){
  const needle=normalize(query),words=needle.split(' ');
  if(!needle){const popular=['15-1252.00','29-1141.00','47-2111.00','13-2011.00','27-1024.00','53-3032.00'];return [...catalog].sort((a,b)=>{const rank=r=>{const i=popular.indexOf(r.sourceCode);return i<0?999:i;};return rank(a)-rank(b);}).slice(0,limit);}
  return index().map(entry=>{
    const score=entry.title===needle?-1:Math.min(...entry.terms.map(term=>term===needle?0:term.startsWith(needle)?1:term.split(' ').some(word=>word.startsWith(needle))?2:words.length>1&&words.every(word=>term.includes(word))?3:term.includes(needle)?4:Infinity));
    return {...entry,score};
  }).filter(entry=>Number.isFinite(entry.score)).sort((a,b)=>a.score-b.score||(a.role.source==='onet'?-1:0)-(b.role.source==='onet'?-1:0)||a.title.length-b.title.length||a.order-b.order).slice(0,limit).map(entry=>entry.role);
}
export function hasExactOccupation(query){const needle=normalize(query);return !!needle&&index().some(entry=>entry.terms.includes(needle));}
