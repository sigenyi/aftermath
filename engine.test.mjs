import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const code = await readFile(new URL('./dist/engine.js', import.meta.url), 'utf8');
const {catalog, sources, resolveRole, buildReport} = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const report = (extra = {}) => buildReport({title: 'Software Developer', tasks: catalog[0].tasks, assessmentYear: 2026, ...extra});

test('curated data has unique IDs, provenance, and technology dependencies', () => {
  assert.equal(catalog.length, 12);
  const ids = catalog.flatMap(r => r.tasks.map(t => t.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const task of catalog.flatMap(r => r.tasks)) {
    assert.ok(task.frontierIds.length > 0);
    assert.equal('human' in task, false);
    for (const id of task.sourceIds) assert.ok(sources.some(s => s.id === id));
  }
});
test('aliases and seniority match without mutating the catalog', () => {
  const result = resolveRole('Senior Software Engineer');
  assert.equal(result.role.id, 'software');
  result.role.tasks[0].label = 'modified';
  assert.notEqual(catalog[0].tasks[0].label, 'modified');
});
test('unknown and hybrid titles are not forced into one occupation', () => {
  assert.equal(resolveRole('Quantum garden curator').matched, false);
  assert.equal(resolveRole('chef and software developer').matched, false);
  assert.equal(resolveRole('teacherpreneur').matched, false);
});
test('every known role has a speculative complete-automation horizon', () => {
  for (const role of catalog) {
    const r = report({title: role.title, tasks: role.tasks});
    assert.ok(r.fullAutomation.earliestYear > 2026);
    assert.ok(r.fullAutomation.latestYear > r.fullAutomation.earliestYear);
    assert.match(r.confidence, /not a validated prediction/);
    assert.ok(r.tasks.every(t => t.automationWindow && t.requirements));
  }
});
test('custom or edited tasks receive broad generic assumptions without borrowed evidence', () => {
  const original = catalog[0].tasks[0];
  const r = report({tasks: [{...original, label: 'Care for a newborn'}, {label: 'Read minds', exposure: 'high'}]});
  assert.equal(r.counts.unassessed, 2);
  assert.equal(r.fullAutomation.openEnded, true);
  assert.ok(r.fullAutomation.yearsMax >= 100);
  assert.ok(r.tasks.every(t => t.sourceIds.length === 0));
  assert.equal(r.frontiers[0].id, 'unclassified');
});
test('deselection and deduplication determine the actual report', () => {
  const [one, two] = catalog[0].tasks;
  const r = report({tasks: [one, one, {...two, selected: false}]});
  assert.equal(r.tasks.length, 1);
  assert.equal(r.counts.high, 1);
});
test('distinct non-Latin and symbol-only tasks survive deduplication', () => {
  const r = report({tasks: [{label: '修理电线'}, {label: '检查设备'}, {label: '修理电线'}, {label: '🔧'}, {label: '🔬'}]});
  assert.deepEqual(r.tasks.map(t => t.label), ['修理电线', '检查设备', '🔧', '🔬']);
  assert.equal(r.counts.unassessed, 4);
  assert.equal(r.fullAutomation.openEnded, true);
});
test('scenario changes alter horizons monotonically while preserving source data', () => {
  const slow = report({scenario: 'conservative'});
  const baseline = report();
  const fast = report({scenario: 'accelerated'});
  assert.ok(fast.fullAutomation.yearsMax < baseline.fullAutomation.yearsMax);
  assert.ok(baseline.fullAutomation.yearsMax < slow.fullAutomation.yearsMax);
  assert.deepEqual(slow.tasks.map(t => t.sourceIds), fast.tasks.map(t => t.sourceIds));
  assert.equal(report({scenario: 'toString'}).scenario, 'central');
});
test('single-front and multi-front occupations have distinct dependency graphs', () => {
  assert.equal(report().frontiers.length, 1);
  const nurse = catalog.find(r => r.id === 'nursing');
  const r = report({tasks: nurse.tasks});
  assert.ok(r.frontiers.length > 2);
  assert.ok(r.tasks.some(t => t.frontierIds.length > 1));
  assert.equal(r.fullAutomation.yearsMax, Math.max(...r.frontiers.map(f => f.yearsMax)) + r.fullAutomation.integrationYears.max);
  assert.ok(r.fullAutomation.yearsMax < r.frontiers.reduce((sum,f) => sum + f.yearsMax, 0));
  assert.ok(r.deploymentAssumptions.length > 0);
});
test('removing a bottleneck task cannot delay complete automation', () => {
  for (const role of catalog) {
    const full = report({tasks: role.tasks});
    const subset = report({tasks: role.tasks.slice(0, 1)});
    assert.ok(subset.fullAutomation.yearsMax <= full.fullAutomation.yearsMax);
  }
});
test('empty input still returns an explicit generic scenario', () => {
  const r = report({tasks: []});
  assert.ok(r.fullAutomation.openEnded);
  assert.ok(r.fullAutomation.yearsMax >= 100);
  assert.equal(r.frontiers[0].id, 'unclassified');
});
test('non-US settings explicitly flag absent local adjustment', () => {
  const r = report({location: 'Canada'});
  assert.ok(r.assumptions.some(a => a.includes('does not change the speculative model')));
});
