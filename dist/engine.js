/** Full automation scenario explorer. All year ranges are authored assumptions,
 * not empirically validated predictions or year estimates from the cited sources. */
export const MODEL_VERSION = '0.2.0';
export const REVIEWED_AT = '2026-10-30';

const task = (label, exposure, mechanism, capability, barriers) => ({label, exposure, mechanism, requirements: `Autonomous systems must ${capability.charAt(0).toLowerCase()}${capability.slice(1)}`, barriers});
const role = (id, title, aliases, sector, soc, tasks) => ({id, title, aliases, sector, soc, tasks: tasks.map((t, i) => ({...t, id: `${id}-${i + 1}`, sourceIds: [`onet-${id}`], confidence: 'Speculative scenario · not a validated prediction', timeShare: null}))});

export const catalog = [
  role('software', 'Software Developer', ['software engineer', 'software developers', 'web developer', 'frontend developer', 'front end developer', 'backend developer', 'full stack developer', 'programmer', 'developer'], 'Technology', '15-1252.00', [
    task('Write and modify routine application code', 'high', 'Code assistants can propose implementations from a well-defined specification.', 'Check correctness, security, and whether the result solves the actual problem.', 'Repository context, hidden requirements, and regression risk.'),
    task('Create tests and technical documentation', 'high', 'Assistants can draft test cases, summaries, and documentation.', 'Choose meaningful coverage and verify that explanations match behavior.', 'Generated tests can reproduce the same mistakes as the code.'),
    task('Investigate production defects', 'medium', 'Log analysis and suggested fixes can narrow an investigation.', 'Understand the wider system and approve recovery actions.', 'Incomplete telemetry and unpredictable interactions.'),
    task('Design systems and clarify user needs', 'low', 'Tools can outline alternatives and summarize requirements.', 'Resolve tradeoffs, negotiate scope, and own architectural decisions.', 'Ambiguous goals, business context, and accountability.'),
    task('Coordinate releases and engineering decisions', 'low', 'Workflow tools can organize status and release checklists.', 'Coordinate every release dependency and establish production readiness without manual intervention.', 'Organizational dependencies and high-impact decisions.')
  ]),
  role('support', 'Customer Service Representative', ['customer service', 'customer support', 'customer support representative', 'support agent', 'call center agent', 'call center representative'], 'Customer service', '43-4051.00', [
    task('Answer routine product and account questions', 'high', 'A grounded assistant can retrieve approved answers and draft replies.', 'Check unusual cases and ensure the answer fits the customer.', 'Incorrect policies, stale information, and unavailable account access.'),
    task('Record and summarize customer interactions', 'high', 'Transcription and summarization can prepare interaction records.', 'Correct omissions and protect confidential information.', 'Consent, privacy, and transcription mistakes.'),
    task('Process standard account changes', 'medium', 'Workflow automation can execute approved, repeatable requests.', 'Authorize exceptions and verify sensitive changes.', 'Identity checks, permissions, and system integration.'),
    task('Resolve complex complaints and escalations', 'low', 'Tools can assemble case history and suggest next steps.', 'Exercise judgment, negotiate, and rebuild trust.', 'Emotional context and exceptions outside established policy.')
  ]),
  role('accounting', 'Accountant', ['accountants', 'auditor', 'cpa', 'financial accountant', 'accounting specialist'], 'Finance', '13-2011.00', [
    task('Process invoices and reconcile routine entries', 'high', 'Extraction and matching software can compare structured transactions.', 'Resolve discrepancies and approve adjustments.', 'Data quality, exceptions, and internal controls.'),
    task('Draft financial reports', 'high', 'Templates and analysis tools can assemble reports from clean records.', 'Validate the underlying figures and explain material changes.', 'Incomplete records and misleading summaries.'),
    task('Investigate unusual transactions', 'medium', 'Pattern detection can flag anomalies for review.', 'Determine meaning and gather corroborating evidence.', 'False positives and missing business context.'),
    task('Assess controls and advise stakeholders', 'low', 'Tools can organize evidence and draft questions.', 'Resolve context-specific exceptions and satisfy accountability requirements autonomously.', 'Confidentiality, governance, and context-specific decisions.')
  ]),
  role('nursing', 'Registered Nurse', ['nurse', 'registered nurses', 'rn', 'staff nurse'], 'Healthcare', '29-1141.00', [
    task('Document observations and care activities', 'medium', 'Documentation assistants can prepare notes from recorded information.', 'Verify accuracy and record clinically meaningful context.', 'Patient privacy, omissions, and system integration.'),
    task('Monitor changing patient conditions', 'medium', 'Monitoring systems can surface readings and alerts.', 'Interpret the whole patient and respond to deterioration.', 'Alarm fatigue, incomplete signals, and clinical accountability.'),
    task('Deliver hands-on patient care', 'low', 'Specialized equipment can assist selected physical actions.', 'Adapt physical care to each patient and respond autonomously in the real environment.', 'Physical variability, safety, and patient dignity.'),
    task('Support patients and coordinate care', 'low', 'Tools can summarize information and organize handoffs.', 'Provide reliable patient communication and coordinate the complete care workflow.', 'Emotional context and shared clinical responsibility.')
  ]),
  role('electrical', 'Electrician', ['electricians', 'journeyman electrician', 'maintenance electrician', 'industrial electrician'], 'Skilled trades', '47-2111.00', [
    task('Prepare estimates and routine job records', 'medium', 'Software can assemble estimates and organize work documentation.', 'Confirm site conditions and accurate scope.', 'Incomplete measurements and local requirements.'),
    task('Diagnose electrical faults', 'low', 'Diagnostic tools can help interpret measurements.', 'Inspect the real installation and identify safe remedies.', 'Unstructured sites, hidden faults, and hazardous conditions.'),
    task('Install or repair wiring and fixtures', 'low', 'Specialized tools can assist repetitive physical operations.', 'Perform precise work in varied buildings and confined spaces.', 'Dexterity, access, and safety requirements.'),
    task('Inspect systems and verify safe operation', 'low', 'Tools can organize checklists and measurement records.', 'Make site-specific safety judgments and take responsibility.', 'Physical inspection and context-specific standards.')
  ]),
  role('design', 'Graphic Designer', ['graphic designers', 'visual designer', 'brand designer', 'graphic design'], 'Creative', '27-1024.00', [
    task('Produce initial visual concepts', 'high', 'Generative tools can propose images and layout directions.', 'Choose concepts that serve the brief and audience.', 'Originality, rights, and inconsistent visual control.'),
    task('Adapt layouts for different formats', 'high', 'Templates can resize and generate routine asset variants.', 'Review hierarchy, readability, and brand consistency.', 'Complex layouts and platform-specific requirements.'),
    task('Refine final artwork and typography', 'medium', 'Editing tools can accelerate production and cleanup.', 'Apply visual judgment and check final quality.', 'Small errors and production specifications.'),
    task('Interpret client needs and establish direction', 'low', 'Tools can organize feedback and generate alternatives.', 'Define the creative intent and negotiate competing goals.', 'Taste, cultural context, and stakeholder trust.')
  ]),
  role('teaching', 'Elementary School Teacher', ['teacher', 'elementary teacher', 'primary school teacher', 'school teacher'], 'Education', '25-2021.00', [
    task('Prepare lesson materials and activities', 'medium', 'Assistants can draft exercises and differentiated material.', 'Check accuracy, age suitability, and learning objectives.', 'Curriculum fit and individual learning needs.'),
    task('Review routine assignments', 'medium', 'Tools can assist with structured answers and feedback drafts.', 'Assess reasoning and review context-sensitive judgments.', 'Bias, student privacy, and errors in evaluation.'),
    task('Guide students and manage the classroom', 'low', 'Tools can support planning and organization.', 'Build relationships and respond to students in real time.', 'Child wellbeing, social context, and in-person responsibility.'),
    task('Adapt teaching and support individual students', 'low', 'Learning tools can suggest resources and surface patterns.', 'Recognize changing needs and coordinate with families.', 'Incomplete learning signals and personal context.')
  ]),
  role('driving', 'Truck Driver', ['truck drivers', 'trucker', 'heavy truck driver', 'tractor trailer driver', 'cdl driver'], 'Transport', '53-3032.00', [
    task('Maintain delivery paperwork and logs', 'high', 'Digital workflows can populate records and process delivery documents.', 'Resolve discrepancies and confirm actual events.', 'Data integration and unusual deliveries.'),
    task('Plan routes and delivery sequences', 'medium', 'Routing software can optimize journeys using available constraints.', 'Adapt to real conditions and customer requirements.', 'Incomplete road information and last-minute changes.'),
    task('Drive and maneuver in varied conditions', 'medium', 'Vehicle automation is a possible mechanism in defined operating settings.', 'Handle exceptions and unstructured environments.', 'Operating limits, weather, infrastructure, and safety validation.'),
    task('Inspect vehicles and secure cargo', 'low', 'Sensors can assist checks and flag some issues.', 'Inspect physical conditions and perform corrective work.', 'Physical access and variable freight.')
  ]),
  role('legal', 'Paralegal', ['paralegals', 'legal assistant', 'legal assistants'], 'Legal services', '23-2011.00', [
    task('Organize and summarize case documents', 'high', 'Search and extraction tools can sort and summarize records.', 'Verify completeness and preserve context.', 'Confidentiality and omitted or misread evidence.'),
    task('Draft routine legal correspondence', 'high', 'Templates and assistants can prepare initial drafts.', 'Verify every statement and applicable authority with auditable autonomous validation.', 'Fabricated references and jurisdiction-specific requirements.'),
    task('Research facts and relevant authorities', 'medium', 'Retrieval tools can help locate and compare materials.', 'Verify primary sources and their applicability.', 'Outdated information and unsupported citations.'),
    task('Coordinate cases and speak with clients', 'low', 'Tools can schedule work and prepare case summaries.', 'Understand sensitive circumstances and coordinate the entire case workflow.', 'Trust, confidentiality, and case-specific judgment.')
  ]),
  role('culinary', 'Chef', ['chefs', 'head chef', 'head cook', 'executive chef', 'sous chef'], 'Hospitality', '35-1011.00', [
    task('Plan menus and order supplies', 'medium', 'Tools can propose menus and calculate purchasing needs.', 'Judge taste, local demand, and ingredient quality.', 'Variable ingredients and customer preferences.'),
    task('Prepare and finish dishes', 'low', 'Specialized equipment can assist repeatable preparation steps.', 'Adapt technique and assess texture and flavor.', 'Dexterity, ingredient variation, and kitchen layout.'),
    task('Inspect food and sanitation practices', 'low', 'Sensors and checklists can support monitoring.', 'Make physical checks and correct unsafe practices.', 'Incomplete sensing and responsibility for food safety.'),
    task('Lead kitchen staff during service', 'low', 'Scheduling tools can help allocate work.', 'Coordinate all kitchen operations and react autonomously to service disruptions.', 'Team dynamics and unpredictable service demands.')
  ]),
  role('marketing', 'Marketing Analyst', ['market research analyst', 'marketing specialist', 'market analyst', 'content strategist', 'marketing analyst'], 'Marketing', '13-1161.00', [
    task('Compile market data and routine reports', 'high', 'Data pipelines and assistants can gather permitted data and draft summaries.', 'Validate sources and identify misleading interpretations.', 'Source quality, permissions, and measurement consistency.'),
    task('Analyze customer and campaign patterns', 'medium', 'Statistical tools can surface segments and performance patterns.', 'Distinguish association from causes and choose useful measures.', 'Biased samples and incomplete attribution.'),
    task('Design research and interview customers', 'low', 'Tools can propose questions and organize responses.', 'Choose research methods and understand customer context.', 'Representativeness and interpersonal insight.'),
    task('Recommend strategy to stakeholders', 'low', 'Tools can compare alternatives and prepare supporting material.', 'Set priorities and accept responsibility for decisions.', 'Business goals and uncertain competitive conditions.')
  ]),
  role('data-entry', 'Data Entry Clerk', ['data entry', 'data entry keyer', 'data entry operator', 'data entry specialist'], 'Administration', '43-9021.00', [
    task('Transfer information from standard documents', 'high', 'Optical recognition and extraction can populate structured fields.', 'Verify difficult documents and sensitive fields.', 'Poor scans, handwriting, and unfamiliar formats.'),
    task('Sort records and check field consistency', 'high', 'Rules can classify records and flag missing or inconsistent values.', 'Resolve ambiguous records and revise rules.', 'Changing formats and incorrect source material.'),
    task('Maintain records and completion logs', 'high', 'Workflow software can file records and track completed operations.', 'Check access, retention, and completeness.', 'Integration and information governance.'),
    task('Investigate unclear or contradictory source data', 'medium', 'Tools can highlight inconsistencies and suggest matches.', 'Contact the source and establish the correct meaning.', 'Missing context and unresolved conflicting evidence.')
  ])
];

// Year ranges below are design assumptions. No cited publication supplies them.
// Pairs describe full autonomous completion of each task, including exceptions.
export const horizonAssumptions = {
  software: [[2,8],[2,8],[5,20],[10,40],[10,35]],
  support: [[2,8],[2,6],[5,15],[10,35]],
  accounting: [[3,10],[3,12],[8,25],[12,40]],
  nursing: [[3,12],[8,25],[20,60],[15,50]],
  electrical: [[5,15],[20,60],[20,80],[20,70]],
  design: [[2,10],[2,8],[5,15],[10,35]],
  teaching: [[3,12],[5,20],[20,60],[15,50]],
  driving: [[2,8],[3,12],[10,40],[15,50]],
  legal: [[2,10],[3,12],[8,25],[15,45]],
  culinary: [[5,20],[15,50],[15,45],[20,60]],
  marketing: [[2,10],[5,20],[10,35],[15,40]],
  'data-entry': [[2,8],[2,8],[2,10],[5,20]]
};

export const frontierDefinitions = {
  intelligence: {label: 'Software intelligence', requirements: 'Autonomous reasoning, reliable tool use, long-context decisions, and recovery from exceptions.'},
  dexterity: {label: 'Robotic dexterity', requirements: 'Precise manipulation of varied objects and materials outside controlled factory settings.'},
  navigation: {label: 'Physical perception & navigation', requirements: 'Understand changing real-world scenes and move or position equipment safely.'},
  social: {label: 'Social interaction', requirements: 'Interpret intent and emotional context, negotiate, and communicate effectively across unusual situations.'},
  reliability: {label: 'Reliability & safety', requirements: 'Demonstrate robust autonomous operation, detect failures, and recover safely in consequential settings.'},
  unclassified: {label: 'Discoveries to be mapped', requirements: 'Identify all cognitive and physical capabilities required by this custom task; one or several discovery fronts may be needed.'}
};

// Each row maps one task to the discoveries it requires. Fronts develop in
// parallel. A single front can support many tasks; it is never counted twice.
const frontierMap = {
  software: [['intelligence'],['intelligence'],['intelligence'],['intelligence'],['intelligence']],
  support: [['intelligence'],['intelligence'],['intelligence'],['intelligence','social']],
  accounting: [['intelligence'],['intelligence'],['intelligence'],['intelligence','reliability']],
  nursing: [['intelligence'],['intelligence','reliability'],['dexterity','navigation','reliability'],['intelligence','social','reliability']],
  electrical: [['intelligence'],['intelligence','navigation','reliability'],['dexterity','navigation','reliability'],['navigation','reliability']],
  design: [['intelligence'],['intelligence'],['intelligence'],['intelligence']],
  teaching: [['intelligence'],['intelligence'],['social','navigation','reliability'],['intelligence','social']],
  driving: [['intelligence'],['intelligence'],['navigation','reliability'],['dexterity','navigation']],
  legal: [['intelligence'],['intelligence'],['intelligence','reliability'],['intelligence','social']],
  culinary: [['intelligence'],['dexterity','navigation'],['navigation','reliability'],['intelligence','dexterity','navigation']],
  marketing: [['intelligence'],['intelligence'],['intelligence','social'],['intelligence']],
  'data-entry': [['intelligence'],['intelligence'],['intelligence'],['intelligence']]
};

// Relative difficulty within multi-front tasks is also an authored assumption.
// All fronts remain explicit; fractions are not probabilities.
const frontierDifficulty = {intelligence: 0.65, dexterity: 1, navigation: 0.85, social: 1, reliability: 1, unclassified: 1};
for (const entry of catalog) entry.tasks.forEach((t, i) => { t.frontierIds = frontierMap[entry.id][i]; });

export const sources = [
  {id: 'ilo', title: 'Generative AI and jobs: A 2025 update', publisher: 'International Labour Organization', date: '20 May 2025', reviewedAt: REVIEWED_AT, url: 'https://www.ilo.org/publications/generative-ai-and-jobs-2025-update', note: 'Background research on task exposure. Does not supply or validate any full-automation year shown here.'},
  {id: 'bls', title: 'Employment Projections: Frequently Asked Questions', publisher: 'U.S. Bureau of Labor Statistics', date: 'Accessed 30 October 2026', reviewedAt: REVIEWED_AT, url: 'https://www.bls.gov/emp/frequently-asked-questions.htm', note: 'Explains projection uncertainty. Does not support the speculative years in this model.'},
  ...catalog.map(r => ({id: `onet-${r.id}`, title: `O*NET occupation profile: ${r.title}`, publisher: 'O*NET OnLine', date: 'Accessed 30 October 2026', reviewedAt: REVIEWED_AT, url: `https://www.onetonline.org/link/summary/${r.soc}`, note: 'Supports the occupational task descriptions only. Full-automation dates are separately authored assumptions.'}))
];

export const scenarios = {
  conservative: {label: 'Conservative', multiplier: 1.75, description: 'Slow breakthroughs: the complete workflow takes longer to automate.', assumptions: ['Task horizons are multiplied by 1.75 relative to the central scenario.', 'Reliability, physical capability, and affordable deployment develop slowly.', 'The endpoint still requires complete autonomous operation, including exceptions.']},
  central: {label: 'Central', multiplier: 1, description: 'The baseline hypothetical path to complete end-to-end automation.', assumptions: ['Uses hand-authored task horizons, not a calibrated forecast.', 'Technical capability, reliability, integration, and permissions eventually align.', 'The endpoint is all selected tasks operating autonomously, including exception handling.']},
  accelerated: {label: 'Accelerated', multiplier: 0.55, description: 'Rapid breakthroughs bring complete automation forward in this hypothetical scenario.', assumptions: ['Task horizons are multiplied by 0.55 relative to the central scenario.', 'Autonomous reasoning and robotics improve rapidly; integration costs fall.', 'Complete automation still requires reliable exception handling and deployment acceptance.']}
};

const normalize = value => {
  const canonical = String(value ?? '').toLowerCase().normalize('NFKC').trim();
  // Keep all writing systems and meaningful combining marks. Symbol-only input
  // falls back to its original form so distinct labels cannot collapse to ''.
  return canonical.replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ').trim() || canonical;
};
const clone = value => JSON.parse(JSON.stringify(value));

export function resolveRole(input) {
  const raw = normalize(input);
  const clean = raw.replace(/^(senior|junior|lead|principal|staff)\s+/, '');
  const exact = catalog.find(r => [r.title, ...r.aliases].some(a => normalize(a) === clean));
  if (exact) return {matched: true, role: clone(exact), confidence: 'Title match', needsDetails: false, message: 'Confirm the suggested tasks; titles do not describe every workplace.'};
  const candidates = catalog.filter(r => [r.title, ...r.aliases].some(a => {
    const alias = normalize(a);
    return alias.length > 3 && ` ${raw} `.includes(` ${alias} `);
  }));
  if (candidates.length === 1) return {matched: true, role: clone(candidates[0]), confidence: 'Possible match', needsDetails: true, message: 'A possible occupation appears in your description. Confirm that it is your work and edit the tasks.'};
  return {matched: false, role: null, confidence: 'Insufficient information', needsDetails: true, candidates: candidates.map(r => ({id: r.id, title: r.title})), message: candidates.length > 1 ? 'This looks like a hybrid role. Add your actual tasks to avoid forcing a single occupation match.' : 'This role is not in the starter catalog. Add a few daily tasks; custom tasks receive an explicitly generic, speculative full-automation horizon.'};
}

const knownTasks = new Map(catalog.flatMap(r => r.tasks.map((t, i) => [t.id, {...t, baseHorizon: horizonAssumptions[r.id][i]}])));
const SPECULATIVE = 'Speculative scenario · not a validated prediction';

function windowFor(base, multiplier, year, openEnded = false, basis = '') {
  const yearsMin = Math.max(1, Math.round(base[0] * multiplier));
  const yearsMax = Math.max(yearsMin + 1, Math.round(base[1] * multiplier));
  const earliestYear = year + yearsMin;
  const latestYear = year + yearsMax;
  return {earliestYear, latestYear, yearsMin, yearsMax, openEnded, label: `${earliestYear}–${latestYear}${openEnded ? '+' : ''}`, durationLabel: `${yearsMin}–${yearsMax}${openEnded ? '+' : ''} years`, basis, confidence: SPECULATIVE};
}

export function buildReport({title = 'Custom role', tasks = [], scenario = 'central', location = 'United States', assessmentYear = new Date().getFullYear()} = {}) {
  const chosenScenario = Object.hasOwn(scenarios, scenario) ? scenario : 'central';
  const year = Number.isInteger(assessmentYear) && assessmentYear >= 2020 && assessmentYear <= 2200 ? assessmentYear : new Date().getFullYear();
  const multiplier = scenarios[chosenScenario].multiplier;
  const seen = new Set();
  const assessed = (Array.isArray(tasks) ? tasks : []).filter(t => t && t.selected !== false).map((input, i) => {
    const candidate = typeof input === 'string' ? {label: input} : input;
    const label = String(candidate.label ?? '').trim().slice(0, 500);
    if (!label || seen.has(normalize(label))) return null;
    seen.add(normalize(label));
    const known = knownTasks.get(candidate.id);
    // Edited duties use generic assumptions instead of inheriting unrelated years.
    if (known && normalize(known.label) === normalize(label)) {
      const result = clone(known);
      result.automationWindow = windowFor(known.baseHorizon, multiplier, year, false, `Authored baseline assumption: ${known.baseHorizon[0]}–${known.baseHorizon[1]} years; scenario multiplier ×${multiplier}.`);
      return result;
    }
    return {id: `custom-${i + 1}`, label, exposure: 'unassessed', mechanism: 'A hypothetical combination of autonomous software, robotics, and workflow integration; task-specific mechanism not yet classified.', requirements: 'Identify and autonomously perform every physical, cognitive, and exception-handling step to an acceptable reliability level.', barriers: 'Unclassified task: requirements and technical difficulty are unknown.', sourceIds: [], confidence: SPECULATIVE, timeShare: null, baseHorizon: [20,100], automationWindow: windowFor([20,100], multiplier, year, true, `Unclassified task; generic assumption of 20–100+ years, adjusted by ×${multiplier}. This is not individualized evidence.`)};
  }).filter(Boolean);
  const counts = {high: 0, medium: 0, low: 0, unassessed: 0, total: assessed.length};
  assessed.forEach(t => counts[t.exposure]++);
  const sourceIds = new Set(['ilo', 'bls', ...assessed.flatMap(t => t.sourceIds)]);
  const fullyUnknown = !assessed.length || counts.unassessed === assessed.length;
  const nonUS = !/^(united states|us|usa|u\.s\.|u\.s\.a\.)$/i.test(String(location).trim());
  const hasUnknown = !assessed.length || counts.unassessed > 0;
  const frontierRanges = new Map();
  for (const t of assessed) {
    const ids = t.frontierIds || ['unclassified'];
    t.frontierIds = ids;
    const dependencies = ids.map(id => {
      const factor = ids.length === 1 ? 1 : frontierDifficulty[id];
      const base = t.baseHorizon.map(v => v * factor);
      const w = windowFor(base, multiplier, year, id === 'unclassified');
      const prior = frontierRanges.get(id);
      frontierRanges.set(id, {id, ...frontierDefinitions[id], yearsMin: Math.max(w.yearsMin, prior?.yearsMin || 0), yearsMax: Math.max(w.yearsMax, prior?.yearsMax || 0), taskIds: [...(prior?.taskIds || []), t.id], status: 'Authored scenario assumption', openEnded: id === 'unclassified'});
      return w;
    });
    t.automationWindow = windowFor([Math.max(...dependencies.map(d => d.yearsMin)), Math.max(...dependencies.map(d => d.yearsMax))], 1, year, ids.includes('unclassified'), `Latest required discovery front for this task. Baseline ${t.baseHorizon[0]}–${t.baseHorizon[1]}${ids.includes('unclassified') ? '+' : ''} years, explicit difficulty factors, scenario ×${multiplier}; all are authored assumptions.`);
  }
  if (!assessed.length) {
    const w = windowFor([20,100], multiplier, year, true);
    frontierRanges.set('unclassified', {id: 'unclassified', ...frontierDefinitions.unclassified, yearsMin: w.yearsMin, yearsMax: w.yearsMax, taskIds: [], status: 'Generic assumption; no task mapping', openEnded: true});
  }
  const frontiers = [...frontierRanges.values()];
  const technicalYearsMin = Math.max(...frontiers.map(f => f.yearsMin));
  const technicalYearsMax = Math.max(...frontiers.map(f => f.yearsMax));
  const integrationYears = {min: Math.max(1, Math.round(5 * multiplier)), max: Math.max(1, Math.round(15 * multiplier))};
  const fullAutomation = windowFor([technicalYearsMin + integrationYears.min, technicalYearsMax + integrationYears.max], 1, year, hasUnknown, `MAX of the required discovery fronts (${technicalYearsMin}–${technicalYearsMax} years) + end-to-end integration (${integrationYears.min}–${integrationYears.max} years). Parallel discoveries are not summed. Deployment conditions are assumed satisfied, not separately dated.`);
  Object.assign(fullAutomation, {technicalYearsMin, technicalYearsMax, integrationYears, frontierCount: frontiers.length, bottleneckIds: frontiers.filter(f => f.yearsMax === technicalYearsMax).map(f => f.id)});
  return {
    version: MODEL_VERSION, generatedAt: new Date().toISOString(), assessmentYear: year, title: String(title).trim() || 'Custom role', location: String(location).trim() || 'United States', scenario: chosenScenario,
    scenarioLabel: scenarios[chosenScenario].label, scenarioDescription: scenarios[chosenScenario].description,
    assumptions: [...scenarios[chosenScenario].assumptions, 'Full automation means the selected workflow runs without routine manual intervention, including its exceptions.', 'Role horizon = latest required discovery front + 5–15 assumed integration years, scaled by scenario. Discovery fronts advance in parallel.', ...(hasUnknown ? ['Unclassified tasks use a generic 20–100+ year baseline; the upper end is open, not a maximum.'] : []), ...(nonUS ? ['Task references are U.S.-based. This location is recorded but does not change the speculative model.'] : [])],
    tasks: assessed, counts, fullAutomation, frontiers,
    deploymentAssumptions: ['Suitable hardware, data access, and affordable operating costs are available.', 'Applicable permissions, liability arrangements, and acceptance permit autonomous deployment.', 'These adoption conditions are separate from technical discoveries and have no independently estimated date in this model.'],
    outlook: `Full automation: ${fullAutomation.label}`,
    summary: fullyUnknown ? `A generic speculative scenario places full automation of this workflow ${fullAutomation.durationLabel} from the assessment year. Task-specific evidence has not established this horizon.` : `Under the ${scenarios[chosenScenario].label.toLowerCase()} assumptions, the complete selected workflow reaches full automation in ${fullAutomation.durationLabel}. This is a scenario to explore, not a validated prediction.`,
    confidence: SPECULATIVE,
    timeline: fullAutomation.label,
    limits: ['Every displayed year comes from explicit modeling assumptions, not a validated predictive model.', 'Cited sources support task descriptions or general research context; they do not support these dates.', 'Scenarios assume full automation is eventually achieved. They cannot establish that it will happen.', 'The estimate covers only the selected tasks; omitted duties can change the whole-role horizon.'],
    sources: sources.filter(s => sourceIds.has(s.id))
  };
}
