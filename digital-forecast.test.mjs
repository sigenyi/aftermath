import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {estimateDigitalMilestone as estimate,digitalCalibrationMetadata} from './dist/digital-forecast.js';
const data=JSON.parse(fs.readFileSync(new URL('./dist/data/digital-calibration.json',import.meta.url)));

test('numeric snapshot provenance and inclusion exclusions are reproducible',()=>{
  const raw=fs.readFileSync(new URL('./research/digital-source/benchmark_results_1_1.yaml',import.meta.url));
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),data.metadata.sourceSha256);
  assert.equal(data.observations.length,26);
  assert.equal(data.observations.filter(r=>r.primaryIncluded).length,14);
  assert.ok(data.observations.filter(r=>r.primaryIncluded).every(r=>r.benchmark==='METR-Horizon-v1.1'&&r.frontier&&r.p50Minutes<=960));
  assert.ok(data.observations.every(r=>r.releaseDate<=data.metadata.cutoff));
  assert.ok(Math.abs(data.fits.p50.primary.doublingDays-data.metadata.officialP50DoublingDays)<.01);
  assert.equal(digitalCalibrationMetadata.sourceSha256,data.metadata.sourceSha256);
});

test('longer tasks and higher measured reliability do not move milestones earlier',()=>{
  let previous='0000-01-01';
  for(const durationMinutes of [30,60,120,480,960,2400,9600]){
    const p80=estimate({durationMinutes,successTarget:.8});
    const p50=estimate({durationMinutes,successTarget:.5});
    assert.ok(p80.crossingDate>=previous);
    assert.ok(p80.crossingDate>=p50.crossingDate);
    assert.ok(p80.pointYear>=2026);
    previous=p80.crossingDate;
  }
});

test('unsupported high reliability returns no fabricated calendar year',()=>{
  for(const successTarget of [.9,.95,.99,.999,1]){
    const r=estimate({durationMinutes:480,successTarget});
    assert.equal(r.supported,false);
    assert.equal(r.pointYear,null);
    assert.equal(r.baselineYear,null);
  }
});

test('conditional uncertainty distinguishes fitted evidence and extrapolation',()=>{
  const a=estimate({durationMinutes:480});
  const b=estimate({durationMinutes:9600});
  assert.equal(a.uncertainty.aboveMeasurementBoundary,false);
  assert.equal(b.uncertainty.aboveMeasurementBoundary,true);
  assert.equal(b.uncertainty.calibratedOccupationForecast,false);
  assert.ok(b.uncertainty.extrapolationYears>0);
  assert.ok(b.assumptions.some(s=>s.includes('supplied duration')));
  assert.equal(a.empirical.observedModels,14);
});

test('scenarios reflect ordered empirical resampling sensitivity',()=>{
  for(const durationMinutes of [60,480,2400,9600]){
    const scenarios=['accelerated','central','conservative'].map(scenario=>estimate({durationMinutes,scenario}));
    assert.ok(scenarios[0].crossingDate<=scenarios[1].crossingDate);
    assert.ok(scenarios[1].crossingDate<=scenarios[2].crossingDate);
  }
});

test('temporal holdout contains only later releases and reports substantial errors',()=>{
  for(const metric of ['p50','p80']){
    const v=data.validation[metric];
    assert.ok(v.predictions.every(r=>r.releaseDate>=v.splitDate));
    assert.equal(v.trainingN+v.testN,14);
    assert.ok(v.rmseMultiplicativeFactor>3);
    assert.ok(v.type.includes('not a contemporaneous'));
  }
});

test('invalid inputs fail explicitly',()=>{
  for(const durationMinutes of [0,-1,NaN,Infinity,undefined])assert.throws(()=>estimate({durationMinutes}),RangeError);
  assert.throws(()=>estimate({durationMinutes:60,scenario:'magical'}),RangeError);
});
