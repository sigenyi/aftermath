import {catalog} from './engine.js';

const normalize = value => String(value ?? '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ').trim();

/** Rank the available catalog only; unmatched text never invents a role. */
export function searchOccupations(query, limit = 6) {
  const needle = normalize(query);
  if (!needle) return catalog.slice(0, limit);
  return catalog.map((role, order) => {
    const terms = [role.title, ...role.aliases].map(normalize);
    const score = Math.min(...terms.map(term => term === needle ? 0 : term.startsWith(needle) ? 1 : term.split(' ').some(word => word.startsWith(needle)) ? 2 : term.includes(needle) ? 3 : Infinity));
    return {role, score, order};
  }).filter(entry => Number.isFinite(entry.score)).sort((a,b) => a.score-b.score || a.order-b.order).slice(0,limit).map(entry=>entry.role);
}

export function hasExactOccupation(query) {
  const needle=normalize(query);
  return !!needle && catalog.some(role=>[role.title,...role.aliases].some(term=>normalize(term)===needle));
}
