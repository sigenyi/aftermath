# AFTERMATH

A cinematic explorer of **full workflow automation**: search for an occupation, inspect the technologies it requires, and reveal a conditional scenario where supporting milestones are available. The interface uses a dark machine-inspired scene, live search suggestions, a staged red-eye animation and a prominent red result.

**Live site:** [sigenyi.github.io/aftermath](https://sigenyi.github.io/aftermath/) · **Research cutoff:** October 31, 2026 · **Model:** 2.0.0

The occupational catalog is sourced and reproducible. Future years are **uncalibrated conditional scenarios**, not validated occupational deadlines, measured probabilities or individual layoff forecasts. Source forecasts retain their original dates and uncertainty. A single displayed year does not imply one-year accuracy, and unsupported requirements remain undated. Horizons can exceed a century; unknown discoveries do not receive an invented deadline.

## Coverage

The catalog contains **4,491 overlapping source records**, with 88,960 alternative titles. They are not 4,491 deduplicated worldwide jobs: the three classifications describe overlapping work at different levels of detail.

| Source | Edition | Records | Imported work evidence |
| --- | --- | ---: | --- |
| O*NET | 31.0, August 2026 | 1,016 | All 18,838 task statements for 923 occupations; 93 records have descriptions only |
| ESCO | 1.2.1, December 2025, English | 3,039 | 67,600 essential skill/knowledge relationships, with English descriptions and aliases |
| ISCO | ISCO-08 | 436 | Every unit-group code and title, with links to the source and mapped ESCO children |

The **86,438 imported task/essential-skill statements** retain their source identifiers. ESCO skills are explicitly treated as proxies for work, not observed task statements. Another **58,451 optional ESCO relationships** remain in a separate field and are excluded from default requirements. O*NET's proposed emerging tasks are also retained separately from established task statements.

O*NET scalar ratings describe occupational demands and conditions; they are not automation scores. Missing or suppressed ratings are not treated as measured zeros. ISCO categories are broad groups, and their older copyrighted duty definitions are linked rather than republished. Consequently, **529 records** use a labeled description or classification proxy. Ten ISCO groups have no ESCO child in this release. All source records remain searchable, including those with limited evidence.

See [O*NET provenance](research/ONET-PROVENANCE.md), [ESCO/ISCO provenance](research/ESCO-ISCO-PROVENANCE.md) and the generated [catalog audit](research/CATALOG-AUDIT.md) for editions, licenses, hashes, exact counts and omissions.

Published [robot-task evidence](research/ROBOT-TASK-EVIDENCE.md) adds **18,796 source assessments and 56,933 citation entries**, all retained in a separate research asset. The source uses O*NET 29.3; attachments to the current 31.0 catalog require the same occupation code, task ID and normalized task statement. The current exact join covers **18,678 tasks with 56,432 citation entries**; five matching IDs have changed statements and 155 current tasks have no matching source ID. These are AI-assisted published assessments, not independently verified trials or 56,933 distinct papers. Exposure tiers do not become forecast years.

## Experience

- Live title, alias and classification-code search, with keyboard navigation and source labels. Ambiguous aliases require a choice instead of silently selecting unrelated work.
- Known occupations load their detailed requirements on demand. Custom and hybrid work can be described through the task editor; unfamiliar titles are not forced into a preset.
- A cancellable cinematic reveal with a **Show result** shortcut. Reduced-motion preferences bypass the animated delay. The animation describes use of downloaded data, not a live literature search.
- A red conditional year where evidence supports a scenario, **Faster / Baseline / Slower** sensitivity controls, and views for required breakthroughs, individual requirements and research. Undated and partially supported profiles stay explicitly labeled.
- Optional task editing and plain-text report export. Altering the original scope removes unrelated occupation-wide ratings; adding requirements while retaining the entire original scope preserves those ratings.

The intended endpoint concerns every requirement in the **selected profile**. Removing a duty narrows that scope. A partial scenario assumes undated requirements will not delay the supported milestones; it is not a complete evidential forecast of the whole job. Full automation here does not mean simultaneous adoption by every employer or the disappearance of all work sharing a title.

## How the model works

The model maps task and skill text to capability requirements using explicit, reproducible rules. Selected O*NET ratings describe occupational demands; exact-matched robot assessments add context about physical work. Neither supplies a year. Each requirement keeps its source fields, mapping explanations, dependencies and any applicable dated milestone. Classification-only records are never dated without actual duties or a more specific profile.

The 12 modeled areas cover digital work, judgment, perception, dexterity, mobility, social interaction, creativity, scientific discovery, assurance, durable hardware, speculative scientific prerequisites and unresolved work. Some workflows need one area; others depend on several. Dependencies are explicit—for example, dexterity requires perception and scientific discovery requires judgment.

**Version 2 removes handpicked capability base years, difficulty-to-year offsets, the fixed unknown-requirement year and arbitrary integration allowances.** A difficult or physical task cannot receive a later year merely by adding an authored delay. Unknown and speculative frontiers without a suitable dated outcome remain `null`.

The main dated anchors come from the October 2023 expert survey: **39 task outcomes and four named full occupations**. Two global endpoints and one heterogeneous respondent-selected occupation are retained as research context and are not generic fallbacks for arbitrary jobs. The project independently fits the source responses using the published gamma-family/CDF-pooling approach, retaining p10/p25/p50/p75/p90 and directly evaluated CDF grids. This is a reproduction of the method family, not the exact original pipeline. The [milestone evidence record](research/MILESTONE-EVIDENCE.md) explains exclusions, sample counts, framing, licensing and differences from published checkpoints.

Milestones are selected by action, object, setting and success criterion. A direct match and an analogy are different claims; transfer assumptions remain visible. Each outcome is counted once even when several duties refer to it. Combining distinct outcomes requires an explicit dependence assumption: taking the maximum of their individual medians is not generally the median date when all are complete. For distinct source events with CDFs `Fᵢ(t)`, the workflow calculation uses:

```text
F_scenario(t) = 0.5 × minᵢ Fᵢ(t) + 0.5 × productᵢ Fᵢ(t)
```

This mixes a shared-progress/comonotonic case with an independence case. The **0.5 mixture weight is an explicit, unfitted assumption**, not an estimated correlation. Faster, Baseline and Slower take the 0.1, 0.5 and 0.9 crossings of that scenario; the two dependence endpoints are retained as separate technical sensitivity results. A directly matched full-occupation event replaces its own original-source constituent events; extra custom duties retain their own events. These are assumptions about joint feasibility, not empirically calibrated job-completion probabilities.

Faster and slower scenarios use source uncertainty and disclosed model sensitivity; they are not validated confidence intervals. The original 2023 calendar anchor is retained. Flooring an elapsed source forecast at the current assessment year is a display convention, not proof that the outcome has been achieved. No interval is compressed into a fabricated 15-year uncertainty band. CDF crossings outside the exported grid remain unresolved rather than becoming a made-up tail date.

A separate [software benchmark component](research/DIGITAL-CALIBRATION.md) fits published METR measurements for bounded software, ML and cybersecurity tasks. It retains measured 50%/80% success thresholds, domain limits and retrospective holdout errors. It supplies **context**, not the whole-occupation deadline. It cannot turn an 80% benchmark success rate into reliable full automation, and it does not infer human task durations from job titles.

There is **no separately evidenced integration delay** in the displayed year. This does not mean integration is instantaneous: the scenario assumes integration, operational reliability, cost and permissions are compatible with the dated capability milestones. If requirements lack a dated analogue, the result is partial; its numerical scenario assumes those undated requirements do not become bottlenecks. If no applicable dated milestone exists, the profile remains undated. Broad classifications require specific work before a date can be offered.

The current registry contains **38 selected references**, spanning digital agents, robotics, social interaction, discovery, safety, economics, technological history and expert surveys. The separate robot asset preserves all 56,933 source citation entries; those entries are not 56,933 independently reviewed papers. Each registry entry distinguishes observations, limitations and use in forecasting. This is a selected research corpus, **not an exhaustive review of all papers or all human advances**.

Text matching remains provisional. Compound duties, jargon, unusual settings and unknown inventions can be missed or misclassified. The generated [catalog audit](research/CATALOG-AUDIT.json) reports dated/undated profiles, unmapped requirements and the distribution of calculated years. Shared source milestones can legitimately produce repeated dates; there is no random jitter to make outputs look more precise. Mapped requirements have not all received independent expert review. Actual outcomes may be decades earlier or later, or never occur.

The complete calculation and limitations are documented in [MODEL-RESEARCH.md](research/MODEL-RESEARCH.md). The [project log](EMBARKMENT.md) records the expansion and its acceptance criteria.

## Run and verify

Use Python 3 for local serving and Node.js 20 or later for catalog generation and checks. No third-party package installation or application compilation is required for the site, committed catalog build or tests. Independently refitting survey distributions additionally requires NumPy and SciPy.

```sh
npm start
```

Open [localhost:4173](http://localhost:4173). Serve the site rather than opening `index.html` directly: it uses JavaScript modules and same-origin data requests. Stop the server with Ctrl+C.

After changing imported data, research references or forecast logic, regenerate the browser assets and audit:

```sh
npm run check
npm run build:catalog
npm test
```

The catalog build creates a compact search index, detail chunks and a forecast audit snapshot. It evaluates all three scenarios for all 4,491 records—**13,473 calculations**—and checks identifiers, reference resolution, requirement preservation, valid finite or explicitly undated results, and scenario ordering where comparable. Tests cover search, custom profiles, source invalidation after edits, sparse inputs, context-sensitive mapping, sourced milestones, benchmark scope and unsupported requirements. These checks establish software consistency, not forecast accuracy. Current diagnostics are recorded in [CATALOG-AUDIT.json](research/CATALOG-AUDIT.json).

## Reproduce source imports

The occupational and robot-evidence importers use Python's standard library and public publisher sources. Normal runs use completed cached downloads; importing for the first time requires network access.

```sh
python3 scripts/import-onet.py
python3 scripts/import-esco.py
python3 scripts/import-robot-evidence.py
npm run check
npm run build:catalog
npm test
```

O*NET supports `--offline` to require cached input and `--refresh` to download the pinned edition again. Its source checksums must match the reviewed lock. ESCO supports `--workers 1` through `--workers 4` to control download concurrency and pins every API page to version 1.2.1. The ESCO importer also produces the ISCO code/title catalog from the official workbook.

Robot evidence uses its pinned public release and cached input under `work/model-revision/robot-evidence/`; its importer checks all reviewed row/citation counts. The exact task-statement join happens during catalog generation, with mismatches reported in the audit.

Survey fitting is reproduced with `python3 scripts/import-milestones.py --fit` in an environment with NumPy/SciPy; `--raw-only` exports elicited fixed-probability medians without the fitted distributions needed by the application. See [milestone reproduction](research/MILESTONE-EVIDENCE.md#reproduction) before changing that source. The software fit is reproduced with `python3 scripts/calibrate-digital.py`, using the committed numerical snapshot; `--refresh` explicitly downloads a new one. These research refits are separate from ordinary catalog builds.

O*NET and ESCO raw inputs stay in the ignored `work/onet/` and `work/esco/` caches. Versioned source JSON, the software benchmark snapshot and generated browser assets are checked into the repository. Review changed source editions, licenses, coverage and hashes before updating them. Keep essential skills, optional skills, source duties and inferred requirements distinguishable; do not add a job-specific year in place of a requirement profile.

## Architecture

The site is plain HTML, CSS and JavaScript. `dist/` contains both authored application files and generated data assets.

| File or directory | Responsibility |
| --- | --- |
| `dist/index.html`, `dist/styles.css` | Cinematic presentation, responsive layout, dialogs and motion preferences |
| `dist/app.js` | Accessible search, reveal, task editor, reports, scenarios and export |
| `dist/search.js` | Title/alias/code ranking and exact-match helpers |
| `dist/catalog.js` | Initial catalog/evidence loading, title resolution and cached detail-chunk requests |
| `dist/profile.js` | Default requirement selection and explicit sparse-profile proxies |
| `dist/mapping.js` | Context-sensitive action/object mapping and occupational-demand constraints |
| `dist/horizons.js`, `dist/milestone-data.js` | Semantic milestone selection and generated survey-distribution constants |
| `dist/workflow.js` | Distinct milestone events, explicit dependence mixture and joint scenario crossings |
| `dist/forecast.js` | Capability dependencies, dated/undated requirement handling and workflow calculations |
| `dist/digital-forecast.js`, `dist/digital-calibration-data.js` | Bounded software benchmark calculations and generated measurements |
| `dist/engine.js` | Report assembly, source attribution and customized-profile handling |
| `dist/data/{onet,esco,isco}.json` | Complete imported source records and provenance metadata |
| `dist/data/catalog-index.json`, `dist/data/occupations/` | Search metadata and detailed occupation chunks loaded on demand |
| `dist/data/evidence.json` | Versioned research registry with observations and limitations |
| `dist/data/milestone-evidence.json` | Derived survey quantiles, aggregate CDFs, source scopes and fitting diagnostics |
| `dist/data/robot-task-evidence.json` | All published robot assessments and citations, including rows unmatched to current tasks |
| `dist/data/digital-calibration.json`, `research/digital-source/` | Software-fit diagnostics and the committed source measurements |
| `dist/data/forecast-index.json` | Catalog-wide precomputed audit snapshot; interactive profiles are recalculated in the browser |
| `scripts/` | Reproducible imports and catalog/audit generation |
| `research/` | Source provenance, model specification and coverage audit |
| `*.test.mjs` | Model, report and search checks using Node's test runner |
| `dist/assets/` | Locally served artwork and favicon |
| `.github/workflows/pages.yml` | Checks, catalog build and deployment to GitHub Pages |

The browser first fetches the search index and research registry, then the chunk containing the chosen occupation. It does not require visitors to download every full source dataset before searching. Calculations use that local snapshot; there is no runtime AI model, live evidence retrieval service or application backend.

## Hosting and privacy

The public website is deployed **only through this GitHub repository and GitHub Pages**. Pushing to `main` runs syntax checks, rebuilds the catalog from the committed source data and model, runs tests, then publishes `dist/`. The build does not download new occupational data or research. Generated indexes remain committed for local use and review; rebuild them when source data, evidence or forecast rules change.

There is no OpenAI runtime, authentication, API or hosting dependency. The artwork is a static project asset, so viewing it does not call an image-generation service. This repository does not control deletion or retention of any historical project on another provider.

Job titles, descriptions, edited requirements and reports stay in JavaScript memory in the browser. The application does not send these inputs to an AI service or application backend and does not store them in cookies, local storage or a database. Refreshing clears the active analysis; closing only the report dialog leaves its in-memory state available.

GitHub may process ordinary hosting access logs, including data-asset requests. Google Fonts receives font-loading requests. Opening a reference visits its external publisher; exported reports are saved through the browser. Self-host the fonts to remove that font-service request.

## Attribution

This project includes information from the **O*NET 31.0 Database**, U.S. Department of Labor/Employment and Training Administration, used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). O*NET® is a trademark of USDOL/ETA. AFTERMATH restructures the data and adds independent model interpretations; USDOL/ETA has not approved, endorsed or tested those modifications.

**This service uses the ESCO classification of the European Commission.** Its English data has been restructured as described in the [provenance record](research/ESCO-ISCO-PROVENANCE.md). ISCO-08 factual unit-group codes and titles are credited to the International Labour Organization; no CC BY license is asserted for the older duty definitions that are not redistributed here.

The robot-task asset adapts Legate-Yang and Massenkoff / Anthropic's *What work can robots do?* dataset under CC BY 4.0, including its O*NET 29.3 source attribution. Survey distributions credit Grace et al. / AI Impacts and the author-linked public reanalysis repository by Tom Adamczewski. Detailed licenses and transformations are recorded in the linked provenance documents.

AFTERMATH has original branding and generated artwork. It is not affiliated with the Terminator franchise. None of the occupational-data publishers endorses its forecast years.
