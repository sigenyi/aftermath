import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {installCatalog,catalog} from './dist/catalog.js';
import {searchOccupations,hasExactOccupation} from './dist/search.js';
installCatalog(JSON.parse(await readFile(new URL('./dist/data/catalog-index.json',import.meta.url),'utf8')));
test('full-catalog search finds occupations beyond original twelve',()=>{for(const query of ['actuary','archaeologist','plumber','welder','veterinarian','librarian','geologist'])assert.ok(searchOccupations(query).length>0,query);});
test('official aliases and source codes work in autocomplete',()=>{assert.ok(searchOccupations('15-1252.00').some(r=>r.sourceCode==='15-1252.00'));assert.ok(searchOccupations('nurse').some(r=>/nurs/i.test(r.title)));assert.equal(hasExactOccupation('Registered Nurses'),true);});
test('multiword queries match tokens without requiring exact order',()=>{assert.ok(searchOccupations('systems computer').length>0);});
test('unknown or markup input does not invent a source match',()=>{for(const query of ['orbital memory gardener','<script>alert(1)</script>','不存在的新职业'])assert.equal(searchOccupations(query).length,0);});
test('bounded results preserve stable, unique source identities',()=>{for(const query of ['', 'manager','engineer','research']){const results=searchOccupations(query,6);assert.ok(results.length<=6);assert.equal(new Set(results.map(r=>r.id)).size,results.length);assert.ok(results.every(r=>catalog.some(original=>original.id===r.id)));}});

test('canonical exact title is the first suggestion ahead of aliases',()=>{
  assert.equal(searchOccupations('data scientist')[0].title.toLowerCase(),'data scientist');
});
