# AFTERMATH

A cinematic explorer of **full workflow automation**: search for an occupation, inspect the technologies it requires, and reveal a conditional automation year. The interface uses a dark machine-inspired scene, live search suggestions, a staged red-eye animation and a prominent red result.

**Live site:** [sigenyi.github.io/aftermath](https://sigenyi.github.io/aftermath/) · **Research cutoff:** October 30, 2026 · **Model:** 1.0.0

The occupational catalog is sourced and reproducible. The future years are **uncalibrated model scenarios**, not published occupational deadlines, measured probabilities or individual layoff forecasts. A single displayed year does not imply one-year accuracy. The model permits horizons beyond a century; it does not establish when an undiscovered capability will become feasible.

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

## Experience

- Live title, alias and classification-code search, with keyboard navigation and source labels. Ambiguous aliases require a choice instead of silently selecting unrelated work.
- Known occupations load their detailed requirements on demand. Custom and hybrid work can be described through the task editor; unfamiliar titles are not forced into a preset.
- A cancellable cinematic reveal with a **Show result** shortcut. Reduced-motion preferences bypass the animated delay. The animation describes use of downloaded data, not a live literature search.
- A red conditional year, **Faster / Baseline / Slower** sensitivity controls, and views for required breakthroughs, individual requirements and research.
- Optional task editing and plain-text report export. Altering the original scope removes unrelated occupation-wide ratings; adding requirements while retaining the entire original scope preserves those ratings.

The result concerns every requirement in the **selected profile**, including its modeled reliability needs. Removing a duty narrows that scope. Full automation here does not mean simultaneous adoption by every employer or the disappearance of all work sharing a title.

## How the model works

The model maps task and skill text to capability requirements using explicit, reproducible rules. Selected O*NET ratings add occupation-level constraints. Sparse profiles may use a labeled broad classification prior. Each requirement keeps its source fields and gains mapping explanations, dependencies and a conditional milestone.

The 12 modeled areas cover digital work, judgment, perception, dexterity, mobility, social interaction, creativity, scientific discovery, assurance, durable hardware, speculative scientific prerequisites and unresolved work. Some workflows need one area; others depend on several. Dependencies are explicit—for example, dexterity requires perception and scientific discovery requires judgment.

For each required capability, the model uses its maximum demand across the selected workflow. With demand `r` between 0 and 1:

```text
capability year = max(assessment year,
                      2026 + ceil((base years + difficulty years × r²)
                                  × scenario factor))
technical year  = latest required capability year
result year     = technical year + integration allowance
```

Capabilities can progress in parallel. The slowest required capability sets the technical date; easier tasks cannot average it away. Integration adds an allowance for connecting systems, testing, infrastructure and deployment. Task-specific milestones use the task's own demands and dependencies, while occupation-wide ratings constrain the overall role.

**Every future offset, demand weight, scenario factor and integration allowance is an authored assumption.** The equations have not been fitted to historical full-occupation automation outcomes. Faster and slower scenarios explore assumptions; they are not confidence bounds. The 2026 research snapshot does not refresh itself as the calendar advances.

The current registry contains **32 references**: 30 research, technical-report and framework sources, plus ILO exposure research and BLS employment-projection context from the project foundations. It spans digital agents, robotics, social interaction, scientific work, safety, economics, historical technological progress and expert surveys. Entries distinguish observations from limitations and include publication dates and direct links. They inform the choice of requirements and constraints; they do not validate the model's precise years. This is a selected research corpus, not an exhaustive review of all papers or all human advances.

Text matching remains provisional. Compound duties, jargon, unusual settings and unknown inventions can be missed or misclassified. The current audit identifies **2,893 source profiles with at least one explicitly unmapped requirement**. These requirements remain visible and receive a disclosed unresolved-requirement scenario; the model does not pretend to have researched their missing breakthroughs. Even mapped requirements have not all received independent expert review. Actual outcomes may be decades earlier or later, or never occur.

The full equations, parameter table, evidence ledger and scientific limitations are in [MODEL-RESEARCH.md](research/MODEL-RESEARCH.md). The [project log](EMBARKMENT.md) records the expansion and its acceptance criteria.

## Run and verify

Use Python 3 for local serving and imports, and Node.js 20 or later for catalog generation and checks. No third-party package installation or application compilation is required.

```sh
npm start
```

Open [localhost:4173](http://localhost:4173). Serve the site rather than opening `index.html` directly: it uses JavaScript modules and same-origin data requests. Stop the server with Ctrl+C.

After changing imported data, research references or forecast logic, regenerate the browser assets and audit:

```sh
npm run build:catalog
npm test
npm run check
```

The catalog build creates a compact search index, detail chunks and a forecast audit snapshot. It calculates all three scenarios for all 4,491 records—**13,473 calculations**—and checks identifiers, reference resolution, requirement preservation, finite years, scenario ordering and dependency consistency. The tests also cover search, custom profiles, profile edits, sparse inputs, context-sensitive mapping, task-local milestones and horizons beyond 100 years. These checks establish software consistency, not forecast accuracy. Current mapping diagnostics are recorded in [CATALOG-AUDIT.json](research/CATALOG-AUDIT.json).

## Reproduce source imports

The importers use Python's standard library and official public sources. Normal runs use completed cached downloads; importing for the first time requires network access.

```sh
python3 scripts/import-onet.py
python3 scripts/import-esco.py
npm run build:catalog
npm test
npm run check
```

O*NET supports `--offline` to require cached input and `--refresh` to download the pinned edition again. Its source checksums must match the reviewed lock. ESCO supports `--workers 1` through `--workers 4` to control download concurrency and pins every API page to version 1.2.1. The ESCO importer also produces the ISCO code/title catalog from the official workbook.

Raw input stays in the ignored `work/onet/` and `work/esco/` caches. The versioned source JSON under `dist/data/` and generated browser assets are checked into the repository. Review changed source editions, licenses, coverage and hashes before updating them. Keep essential skills, optional skills, source duties and inferred requirements distinguishable; do not add a job-specific year in place of a requirement profile.

## Architecture

The site is plain HTML, CSS and JavaScript. `dist/` contains both authored application files and generated data assets.

| File or directory | Responsibility |
| --- | --- |
| `dist/index.html`, `dist/styles.css` | Cinematic presentation, responsive layout, dialogs and motion preferences |
| `dist/app.js` | Accessible search, reveal, task editor, reports, scenarios and export |
| `dist/search.js` | Title/alias/code ranking and exact-match helpers |
| `dist/catalog.js` | Initial catalog/evidence loading, title resolution and cached detail-chunk requests |
| `dist/profile.js` | Default requirement selection and explicit sparse-profile proxies |
| `dist/forecast.js` | Capability rules, dependencies, source-rating constraints and conditional calculations |
| `dist/engine.js` | Report assembly, source attribution and customized-profile handling |
| `dist/data/{onet,esco,isco}.json` | Complete imported source records and provenance metadata |
| `dist/data/catalog-index.json`, `dist/data/occupations/` | Search metadata and detailed occupation chunks loaded on demand |
| `dist/data/evidence.json` | Versioned research registry with observations and limitations |
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

AFTERMATH has original branding and generated artwork. It is not affiliated with the Terminator franchise. None of the occupational-data publishers endorses its forecast years.
