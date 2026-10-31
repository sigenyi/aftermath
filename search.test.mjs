import test from 'node:test';
import assert from 'node:assert/strict';
import {searchOccupations,hasExactOccupation} from './dist/search.js';

test('title prefixes and occupation aliases produce available choices',()=>{
  assert.equal(searchOccupations('sof')[0].id,'software');
  assert.equal(searchOccupations('nurse')[0].id,'nursing');
  assert.equal(searchOccupations('RN')[0].id,'nursing');
  assert.equal(searchOccupations('cpa')[0].id,'accounting');
});
test('exact terms outrank partial terms and casing/spacing are normalized',()=>{
  assert.equal(searchOccupations('  gRaPhIc DeSiGn  ')[0].id,'design');
  assert.equal(hasExactOccupation('Software Engineer'),true);
  assert.equal(hasExactOccupation('sof'),false);
  assert.equal(hasExactOccupation(''),false);
});
test('blank input offers a bounded starter list and result limits are respected',()=>{
  assert.equal(searchOccupations('').length,6);
  assert.equal(searchOccupations('  ',3).length,3);
  assert.ok(searchOccupations('a',2).length<=2);
});
test('unknown, mixed, non-Latin, and markup inputs do not fabricate matches',()=>{
  for(const query of ['Orbital garden curator','nurse and chef','医生','<script>alert(1)</script>']){
    assert.equal(searchOccupations(query).length,0);
    assert.equal(hasExactOccupation(query),false);
  }
});
test('search results are unique catalog roles',()=>{
  const results=searchOccupations('developer');
  assert.equal(results.length,1);
  assert.equal(new Set(results.map(role=>role.id)).size,results.length);
});
