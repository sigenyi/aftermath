import test from 'node:test';
import assert from 'node:assert/strict';
import {completionProbability,combineMilestoneCdfs,selectWorkflowEvents,estimateWorkflow} from './dist/workflow.js';
const event=(id,probabilities=[0,.5,1])=>({milestoneId:id,cdf:{years:[2026,2036,2046],probabilities}});

test('all-events mixture equals the independent and shared constructions',()=>{
  assert.equal(completionProbability([.5,.5],0),.25);
  assert.equal(completionProbability([.5,.5],1),.5);
  assert.equal(completionProbability([.5,.5],.5),.375);
  assert.ok(Math.abs(completionProbability([.2,.8],.5)-.18)<1e-12);
  assert.throws(()=>completionProbability([],0));
  assert.throws(()=>completionProbability([.5],1.1));
});

test('repeated source event does not become an independent prerequisite',()=>{
  const single=combineMilestoneCdfs([event('a')]);
  const duplicate=combineMilestoneCdfs([event('a'),event('a')]);
  assert.equal(single.crossingYear,2036);
  assert.deepEqual(single,duplicate);
  const pair=combineMilestoneCdfs([event('a'),event('b')]);
  assert.equal(pair.crossingYear,2038);
  assert.ok(pair.crossingYear>single.crossingYear);
});

test('adding a required event never advances completion under the same assumptions',()=>{
  for(const weight of [0,.5,1])for(const target of [.1,.5,.9]){
    const one=combineMilestoneCdfs([event('a')],{target,sharedWeight:weight});
    const two=combineMilestoneCdfs([event('a'),event('b',[0,.2,1])],{target,sharedWeight:weight});
    assert.ok(two.crossingYear>=one.crossingYear);
  }
});

test('scenario targets are ordered and dependence sensitivity is not a confidence interval',()=>{
  const events=[event('a'),event('b')];
  const results=[.1,.5,.9].map(target=>combineMilestoneCdfs(events,{target}));
  assert.ok(results[0].crossingYear<=results[1].crossingYear&&results[1].crossingYear<=results[2].crossingYear);
  const baseline=results[1];
  assert.ok(baseline.sensitivity.perfectlySharedYear<=baseline.baselineYear&&baseline.baselineYear<=baseline.sensitivity.independentYear);
  assert.match(baseline.sensitivity.interpretation,/not confidence bounds/);
});

test('unsupported events and distant uncrossed tails remain undated',()=>{
  assert.equal(combineMilestoneCdfs([]).baselineYear,null);
  assert.equal(combineMilestoneCdfs([{milestoneId:'missing'}]).baselineYear,null);
  const tail=combineMilestoneCdfs([event('tail',[0,.1,.4])],{target:.9});
  assert.equal(tail.baselineYear,null);
  assert.equal(tail.status,'outside-source-grid');
  assert.equal(estimateWorkflow({anchors:[{milestoneId:'not-a-source'}]}).baselineYear,null);
  assert.throws(()=>combineMilestoneCdfs([event('bad',[0,.7,.6])]));
  assert.throws(()=>combineMilestoneCdfs([event('a'),{milestoneId:'b',cdf:{years:[2026,2040],probabilities:[0,1]}}]));
});

test('whole occupation event subsumes original tasks but preserves custom additions',()=>{
  const anchors=[{milestoneId:'whole',matchType:'named occupation forecast',taskIds:['source:1']},
    {milestoneId:'subtask',taskIds:['source:2']},{milestoneId:'added',taskIds:['custom:1']}];
  const occupation={source:'onet',originalScopeRetained:true,originalTaskIds:['source:1','source:2']};
  assert.deepEqual(selectWorkflowEvents(anchors,occupation).milestoneIds,['added','whole']);
  assert.deepEqual(selectWorkflowEvents(anchors,occupation).subsumedMilestoneIds,['subtask']);
  assert.deepEqual(selectWorkflowEvents(anchors,{...occupation,originalScopeRetained:false}).milestoneIds,['added','subtask','whole']);
  assert.deepEqual(selectWorkflowEvents(anchors,{...occupation,source:'custom'}).milestoneIds,['added','subtask','whole']);
});

test('published source data gives reproducible distinct joint milestones',()=>{
  const one=estimateWorkflow({anchors:[{milestoneId:'espai-task-paymentsite'}]});
  const web=estimateWorkflow({anchors:[{milestoneId:'espai-task-paymentsite'},{milestoneId:'espai-task-findandpatch'}]});
  assert.ok(one.baselineYear>=2026);
  assert.ok(web.crossingYear>=one.crossingYear);
  assert.equal(web.eventCount,2);
  assert.deepEqual(web,estimateWorkflow({anchors:[{milestoneId:'espai-task-findandpatch'},{milestoneId:'espai-task-paymentsite'},{milestoneId:'espai-task-findandpatch'}]}));
});
