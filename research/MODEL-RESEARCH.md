# AFTERMATH model research and assumption register

Evidence cutoff and review date: **2026-10-30**. Model version: **1.0.0**.

This file records the research, assumptions and limitations behind `dist/forecast.js`. The machine-readable bibliography is `dist/data/evidence.json`; every source has an observation, limitation, date, publisher and direct link. This is a documented selection of research across relevant disciplines, not an exhaustive study of all human knowledge. No one can validate a precise year for every undiscovered technology by collecting more papers alone.

## What the year means

The output is a **conditional full-workflow scenario**, not a measured probability or calibrated prediction. Full automation means autonomous completion of every requirement in the selected work profile at acceptable quality, including recovery from errors. It does not mean global adoption, disappearance of an occupation, or automation of every possible future duty. The calculation assumes continued development, feasible solutions, funding, infrastructure and eventual permission to deploy. These assumptions can fail.

The interface presents one integer year. That avoids an unsupported tight confidence interval: the apparent precision of one calendar year does not mean the model can distinguish neighboring years. Actual outcomes can be decades earlier or later, or never occur. Accelerated and conservative scenarios are assumption sensitivity checks, **not** statistical quantiles. There is no 100-year ceiling.

## Research findings that change the model

- **Reliability is separate from occasional success.** METR measures human-time task horizons in software; OSWorld, WebArena and SWE-bench cover different bounded digital environments. τ-bench tests repeated successful interactions. These support a digital-work capability and a judgment/reliability distinction. They do not license extrapolating a software benchmark doubling time into robotic dexterity, surgery or entire occupations.
- **Physical work has several coupled requirements.** Open X-Embodiment, DROID, ALOHA, Mobile ALOHA, π0.5, Gemini Robotics and BEHAVIOR-1K address different combinations of transfer, contact, perception, mobility and long-horizon execution. A manipulation task can need both adaptable hands and scene understanding; laboratory research can additionally require scientific decisions. These capabilities develop in parallel, and the slowest necessary one gates the workflow.
- **Scientific assistance is not unrestricted discovery.** GNoME concerns material-structure prediction; AlphaFold 3 concerns biomolecular structure prediction; autonomous laboratories integrate domain-specific hypotheses, equipment and measurements. Experimental validation remains separate. The A-Lab paper's January 2026 correction narrows novelty claims and revises successful synthesis to 36 of 57 targets. The registry includes both the paper and correction rather than repeating the earlier 41-of-57 claim.
- **Social simulation is partial evidence.** SOTOPIA evaluates interactions in simulated scenarios, while service-agent benchmarks cover rule-based transactions. Neither proves sustained care, negotiated agreement, acceptance or legal authorization in the real world.
- **High consequences require deployment-specific assurance.** NIST AI RMF identifies reliability, validity, safety and governance concerns. Experimental autonomous dissection in ex vivo tissue demonstrates a bounded capability; it does not establish unrestricted clinical autonomy. The model treats assurance as a distinct requirement where source tasks or ratings indicate consequences.
- **Cost and deployment matter.** The MIT vision-economics study models technical feasibility separately from cost attractiveness. Anthropic's September 2026 physical-task exposure study distinguishes demonstrations in restricted settings from economic deployment and uses language-model ratings with explicit assumptions. Both motivate a separate deployment allowance; their estimates are not adopted as a universal occupational clock.
- **Historical progress is heterogeneous.** Comin and Hobijn study diffusion across countries and technologies. Nagy and colleagues compare technology cost laws; Farmer and Lafond study forecast errors and horizon dependence. Ziegler and Trancik show battery progress estimates depend on the metric. Bloom and colleagues document declining research productivity in multiple historical cases. Together they support domain-specific assumptions and wide uncertainty, not one exponential curve for all discoveries.
- **Expert opinion is context, not ground truth.** The Grace survey reports different aggregate answers for all-task performance (50% by 2047) and all occupations being fully automatable (50% by 2116). These are survey opinions under distinct framings, not occupation-specific predictions or direct model inputs. The disparity is a reason to avoid presenting task scores as job elimination dates.

The PDF’s ILO and BLS references ground the interpretation of labor data. The [ILO 2025 update](https://www.ilo.org/publications/generative-ai-and-jobs-2025-update) measures task-level GenAI exposure; the [BLS methodology FAQ](https://www.bls.gov/emp/frequently-asked-questions.htm) describes ten-year national employment projections and technology effects. Neither supplies a full-automation date. Both are attached to every report as context, without changing any numerical milestone parameter. The BLS source date is explicitly a review date, not an invented publication date.

## Mapping source requirements

Every input task is returned with its original source fields, source ID, label and type. The model adds capability IDs, an integer task milestone and mapping provenance. It does not replace the occupation with a preset job. The engine passes the selected profile: ESCO essential skills are marked skill proxies, optional skills are included only when explicitly selected by the application, and description-only occupations retain a labeled description proxy.

Task text is matched against documented capability rules. Context guards distinguish such phrases as loading a database, data mining, machine-learning training and writing software from manipulating objects, mineral extraction, teaching people or creative writing. This is reproducible lexical inference, not expert semantic annotation. A broad procedural/knowledge match is explicitly counted as inferred. Unrecognized requirements retain an `unknown` capability and an uncertainty warning; they are never silently discarded.

ESCO explicitly marks knowledge concepts separately from skills. An unedited, source-backed knowledge concept maps to a broad knowledge/judgment requirement, with its application difficulty left uncertain. Knowledge of mechanics does not itself imply robotic manipulation; knowledge of chemistry does not itself imply autonomous scientific discovery. This source-type inference is counted separately as inferred, and is not applied to edited/custom tasks merely because they retained a `skillType` field.

O*NET source ratings add **occupation-level constraints**. The mapping uses 18 source keys for reasoning, originality, dexterity, control precision, strength, vehicles, conflict, hazardous conditions, consequences, responsibility for safety and outdoor/manual work. `LV` uses the source's 0–7 scale. `CX` uses 1–5 and is normalized as `(value − 1)/4`. Suppressed or missing values do not become zero observations. Feature names and raw values appear in the result. These ratings measure current occupational demands, not future machine capability or time to automation.

When an input is sparse, an available ISCO major group may add a clearly labeled broad sector prior. The model never assigns a year from an occupation title. An unknown future role requires its actual duties to give a useful estimate.

Task importance/relevance is retained but does not average away a difficult requirement. The selected full-workflow scope includes all selected tasks. Different employers can legitimately select a different set; supplementary O*NET tasks and optional ESCO skills can substantially change the scenario.

## Equations and numerical assumptions

For a required capability `c`, let `r_c` be the largest rule demand or normalized relevant source rating, constrained to `[0,1]`. Let `m_c,s` be the chosen scenario multiplier. The technical capability milestone is:

```text
capability_year(c,s) = max(assessment_year,
                          2026 + ceil((b_c + d_c × r_c²) × m_c,s))
technical_year      = max over all required capability years
baseline_year       = technical_year + integration_years
```

**All `b`, `d`, rule-demand values and scenario multipliers below are authored priors. They are not fitted, calibrated, or numerically derived from the cited papers.** The quadratic demand curve represents the assumption that difficult cases add more delay. It is an explicit monotonic modeling choice, not a discovered law of progress. More equations would not establish accuracy in the absence of calibration outcomes.

| Capability | `b` years | `d` years | Accelerated | Central | Conservative |
|---|---:|---:|---:|---:|---:|
| Digital work | 5 | 14 | 0.60 | 1 | 1.65 |
| Independent judgment | 8 | 28 | 0.65 | 1 | 1.80 |
| Physical perception | 10 | 27 | 0.65 | 1 | 1.80 |
| Robotic dexterity | 16 | 36 | 0.65 | 1 | 1.90 |
| Autonomous movement | 12 | 33 | 0.65 | 1 | 1.80 |
| Human interaction | 6 | 34 | 0.65 | 1 | 1.80 |
| Creative direction | 8 | 30 | 0.65 | 1 | 1.70 |
| Scientific discovery | 15 | 60 | 0.60 | 1 | 2.00 |
| High-stakes assurance | 14 | 42 | 0.70 | 1 | 1.80 |
| Durable hardware | 18 | 38 | 0.70 | 1 | 1.90 |
| Speculative scientific prerequisite | 65 | 65 | 0.65 | 1 | 2.10 |
| Unresolved requirement | 25 | 45 | 0.70 | 1 | 2.00 |

The ordering expresses broad assumptions: bounded digital work can progress before arbitrary contact-rich work; independent discovery and explicitly speculative science warrant greater delay. Exact offsets remain judgment calls. For the speculative and unknown fronts, eventual feasibility itself is an assumption. A finite year is not evidence that an unknown law of physics will be discovered.

Dependencies are explicit: dexterity requires perception; movement requires perception; discovery requires reasoning; speculative scientific prerequisites require discovery. Dependency demand is at least 85% of its parent demand. These are structural assumptions rather than independent discoveries that must occur in sequence. Closure propagates task provenance. No task is allowed to erase another task's harder demand.

Each task's own milestone is calculated from **its local demand and dependencies**. It does not inherit the hardest unrelated task simply because both mention reasoning. Occupation-level ratings still constrain the aggregate role. This distinction is tested.

Deployment is kept separate:

```text
integration_base = 2 + ceil(log2(number_of_required_fronts))
                   + 4 if physical execution is required
                   + 3 if high-stakes assurance is required
                   + 2 if complex interpersonal interaction is required
integration_years = ceil(integration_base × scenario_integration_multiplier)
```

Integration multipliers are 0.65, 1 and 1.8. The allowance represents system coupling, testing, infrastructure, economics and permission to deploy. It is not a measured capital-cost model, legal timetable or universal historical adoption lag. Independent capabilities develop in parallel; summing every research delay would double-count development. Using a weighted average would conceal difficult requirements. The chosen maximum plus nonnegative integration allowance avoids both problems.

Evidence stays anchored to 2026. Advancing the calendar does not automatically assert new discoveries or refresh the literature.

## Verification and remaining limits

`node --test forecast.test.mjs` checks citation resolution and cutoff dates, preservation of source tasks, scenario ordering, single-front versus coupled-front work, the critical path, harder-task monotonicity, local versus role-level task dates, a speculative horizon beyond a century, incomplete inputs, invalid settings, and adversarial digital/physical language examples.

Final direct-model diagnostic on the current catalogs: 4,491 source records and 86,967 default inputs. There are 6,906 unresolved inputs and 28,425 broadly inferred inputs; 2,893 records contain at least one unresolved input. By source: O*NET has 1,016 records, 18,931 inputs (18,838 task statements plus 93 description proxies), 741 unresolved and 1,561 broadly inferred; ESCO has 3,039 records, 67,600 essential skill/knowledge relationships, 5,991 unresolved and 26,855 broadly inferred; ISCO has 436 title/description proxies, 174 unresolved and 9 broadly inferred. These are **mapping diagnostics, not validation accuracy**. The application's separate whole-catalog audit is authoritative after profile filtering/deduplication or later changes. Remaining unresolved inputs stay visible rather than being advertised as fully researched task decompositions.

Known limitations:

1. Task descriptions omit context, rare exceptions and quality thresholds. Skills are weaker evidence than observed tasks. National occupation taxonomies overlap and do not enumerate every possible employer-specific job.
2. Text rules can confuse literal versus figurative language, compound duties, negation, jargon and emerging work. The model cannot establish all required inventions from a brief title.
3. Many requirements may be solved through workflow redesign or direct digital access rather than physical imitation. The current profile can overstate physical prerequisites, especially when legacy paper/media tasks are included.
4. The model's years have no demonstrated forecast accuracy. There is no historical labeled dataset of fully automated occupations used to fit or backtest these numerical priors.
5. Real deployment depends on location, regulation, economics, institutions and preferences. The assumptions permit full automation; they do not assert that legal or social changes will occur on schedule.
6. Technical evidence is uneven across domains. Research papers, vendor demonstrations, expert surveys, frameworks and historical economic estimates have different evidential strength; the registry labels those distinctions.
7. New discoveries can accelerate several fronts at once; physical constraints, stalled research, cost or coordination can delay them. Scenario multipliers are a sensitivity device, not a quantified joint probability distribution.

The next scientific improvement would be independently labeled task requirements, verified deployment case histories, specified reliability/cost thresholds, measured domain-specific capability trajectories, and prospective evaluation against preregistered milestones. These are research needs, not hidden claims that the current model has already met them.

## Work log

- 2026-10-30: Reviewed primary digital-agent, social, robotics, scientific, safety, economics and historical-progress sources; separated observed findings from future assumptions.
- 2026-10-30: Verified publication dates and source links; incorporated A-Lab's 2026 correction and a current September 2026 robotics economics report with its assessment limitations.
- 2026-10-30: Implemented full input preservation, explicit unresolved requirements, role-level O*NET constraints, dependencies, scenario sensitivity and a single conditional baseline.
- 2026-10-30: Corrected task-local dates after integration review; fixed adversarial words including data loading/mining, machine-learning training, generic “perform” and “single”. Added regression tests.
- 2026-10-30: Expanded historical/physical evidence to energy-storage progress and biomedical structure prediction. Registry now contains 30 primary sources/reports.
- 2026-10-30: Audited unknown mappings in all 4,491 records. Used authoritative ESCO knowledge/skill distinctions and narrowly supported missing speech/listening/safety verbs to improve mapping; retained unresolved requirements and explicit inference counts. Guarded edited tasks from inheriting source-only knowledge mapping. All eleven model tests pass.

- 2026-10-30: Added the PDF’s ILO 2025 exposure brief and BLS projections methodology as interpretation-only context. Registry now contains 32 sources; milestone parameters unchanged.

## Source ledger

See the following table and `dist/data/evidence.json` for the distinction between what each source observed and what the model assumes. No source is cited as predicting an occupational year unless it actually contains a forecast; the expert-survey dates are kept separate from this model's parameters.

| ID | Publication | Date | Type |
|---|---|---|---|
| `metr-horizon` | [Measuring AI Ability to Complete Long Software Tasks](https://arxiv.org/abs/2503.14499) | 2025-03-18 | research paper |
| `metr-th11` | [Time Horizon 1.1](https://metr.org/blog/2026-01-29-time-horizon-1-1/) | 2026-01-29 | technical research report |
| `osworld` | [OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments](https://arxiv.org/abs/2404.07972) | 2024-04-11 | research paper |
| `webarena` | [WebArena: A Realistic Web Environment for Building Autonomous Agents](https://arxiv.org/abs/2307.13854) | 2023-07-25 | research paper |
| `swebench` | [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770) | 2023-10-10 | research paper |
| `tau-bench` | [τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains](https://arxiv.org/abs/2406.12045) | 2024-06-17 | research paper |
| `open-x` | [Open X-Embodiment: Robotic Learning Datasets and RT-X Models](https://arxiv.org/abs/2310.08864) | 2023-10-13 | research paper |
| `pi05` | [π0.5: a Vision-Language-Action Model with Open-World Generalization](https://arxiv.org/abs/2504.16054) | 2025-04-22 | research paper |
| `gemini-robotics` | [Gemini Robotics: Bringing AI into the Physical World](https://arxiv.org/abs/2503.20020) | 2025-03-25 | research paper |
| `aloha` | [Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware](https://arxiv.org/abs/2304.13705) | 2023-04-23 | research paper |
| `mobile-aloha` | [Mobile ALOHA: Learning Bimanual Mobile Manipulation with Low-Cost Whole-Body Teleoperation](https://arxiv.org/abs/2401.02117) | 2024-01-04 | research paper |
| `droid` | [DROID: A Large-Scale In-The-Wild Robot Manipulation Dataset](https://arxiv.org/abs/2403.12945) | 2024-03-19 | research paper |
| `behavior` | [BEHAVIOR-1K: A Human-Centered, Embodied AI Benchmark with 1,000 Everyday Activities and Realistic Simulation](https://arxiv.org/abs/2403.09227) | 2024-03-14 | research paper |
| `sotopia` | [SOTOPIA: Interactive Evaluation for Social Intelligence in Language Agents](https://arxiv.org/abs/2310.11667) | 2023-10-18 | research paper |
| `surgical-dissection` | [Autonomous Dissection in Robotic Cholecystectomy](https://arxiv.org/abs/2503.00666) | 2025-03-01 | research paper |
| `nist-rmf` | [Artificial Intelligence Risk Management Framework (AI RMF 1.0)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf) | 2023-01-26 | official framework |
| `alab` | [An autonomous laboratory for the accelerated synthesis of inorganic materials](https://www.nature.com/articles/s41586-023-06734-w) | 2023-11-29 | research paper |
| `alab-correction` | [Author Correction: An autonomous laboratory for the accelerated synthesis of inorganic materials](https://www.nature.com/articles/s41586-025-09992-y) | 2026-01-19 | author correction |
| `gnome` | [Scaling deep learning for materials discovery](https://www.nature.com/articles/s41586-023-06735-9) | 2023-11-29 | research paper |
| `robot-chemistry` | [Autonomous mobile robots for exploratory synthetic chemistry](https://www.nature.com/articles/s41586-024-08173-7) | 2024-11-06 | research paper |
| `robot-exposure` | [What work can robots do?](https://www.anthropic.com/research/what-work-can-robots-do) | 2026-09-30 | industry research report |
| `vision-economics` | [Beyond AI Exposure: Which Tasks are Cost-Effective to Automate with Computer Vision?](https://ide.mit.edu/wp-content/uploads/2024/01/Beyond-AI-Exposure-Which-Tasks-are-Cost-Effective-to-Automate-with-Computer-Vision.pdf) | 2024-01 | working paper |
| `productivity-paradox` | [Artificial Intelligence and the Modern Productivity Paradox: A Clash of Expectations and Statistics](https://www.nber.org/papers/w24001) | 2017-11 | working paper |
| `diffusion-history` | [An Exploration of Technology Diffusion](https://www.aeaweb.org/articles?id=10.1257/aer.100.5.2031) | 2010-12 | research paper |
| `progress-history` | [How predictable is technological progress?](https://arxiv.org/abs/1502.05274) | 2015-02-18 | research paper |
| `progress-regularities` | [Statistical Basis for Predicting Technological Progress](https://doi.org/10.1371/journal.pone.0052669) | 2013-02-28 | research paper |
| `ideas-productivity` | [Are Ideas Getting Harder to Find?](https://www.aeaweb.org/articles?id=10.1257/aer.20180338) | 2020-04 | research paper |
| `expert-survey` | [Thousands of AI Authors on the Future of AI](https://arxiv.org/abs/2401.02843) | 2024-01-05 | research paper |
| `battery-progress` | [Re-examining rates of lithium-ion battery technology improvement and cost decline](https://pubs.rsc.org/en/content/articlehtml/2021/ee/d0ee02681f) | 2021-03-23 | research paper |
| `alphafold3` | [Accurate structure prediction of biomolecular interactions with AlphaFold 3](https://www.nature.com/articles/s41586-024-07487-w) | 2024-05-08 | research paper |
| `ilo-exposure-2025` | [Generative AI and jobs: A 2025 update](https://www.ilo.org/publications/generative-ai-and-jobs-2025-update) | 2025-05-20 | official research brief |
| `bls-projection-methods` | [Employment Projections Frequently Asked Questions](https://www.bls.gov/emp/frequently-asked-questions.htm) | 2026-10-30 (reviewed) | official methodology FAQ |
