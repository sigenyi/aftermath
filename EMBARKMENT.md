# AFTERMATH — Full-coverage forecasting expansion

Started: October 30, 2026 (America/Los_Angeles)

## Mission

Replace the twelve-occupation demo with a reproducible occupational catalog and an evidence-informed model of full workflow automation. Preserve the cinematic, simple search experience and publish only through the user's GitHub repository and GitHub Pages.

## User requirements

- Import the occupations available in the PDF's reference foundations: O*NET / U.S. SOC, ESCO, and ISCO. Use ILO exposure research and BLS projections as context, not as elimination dates.
- Accept custom and hybrid job descriptions in addition to catalog occupations.
- Identify multiple required discovery fronts where appropriate; one fast technology must not mask an unsolved dependency elsewhere.
- Estimate complete automation of the defined work, including distant possibilities beyond 100 years.
- Replace broad baseline date bands with a prominent red central year. No displayed baseline interval wider than 15 years.
- Reveal the result through a deliberate cinematic sequence with reduced-motion and cancellation support.
- Preserve the provenance, equations, assumptions, limitations, and validation record in the repository.

## Scientific boundary

A complete classification catalog is not a complete census of every possible present or future job. Research about capability, exposure, productivity, deployment, and employment describes different outcomes. None alone proves a full-automation date.

The displayed year is a conditional model estimate, not a measured date, calibrated confidence interval, or personal layoff prediction. A narrow display must not be confused with narrow scientific uncertainty. This work will not manufacture a 15-year confidence interval simply to satisfy a presentation constraint. Unknown requirements and weak evidence remain explicitly identified.

## Execution plan

1. Acquire official, versioned occupational data, aliases, descriptions, tasks/skills, and crosswalks where available.
2. Record download URLs, versions, licenses, checksums, coverage counts, and omissions; keep a reproducible import script.
3. Build a research registry spanning autonomous software, reasoning, long-horizon reliability, computer interaction, manipulation, perception/navigation, social interaction, safety, and integration/adoption.
4. Separate observations in publications from assumptions in the model. Link relevant evidence to required capabilities.
5. Calculate role-specific requirements from all available tasks and attributes, with a transparent bottleneck/dependency model. Avoid hard-coded dates for individual titles.
6. Support provisional custom-work mapping without pretending the input has received a live literature review.
7. Precompute/audit every imported occupation, test invariants and representative edge cases, and document results.
8. Add the red single-year display and cinematic reveal, test desktop/mobile/keyboard/reduced-motion behavior, then deploy to GitHub Pages.

## Initial gaps to resolve

- Source editions and accessible download formats must be verified.
- ESCO occupation concepts, ISCO groups, and O*NET occupations overlap; source records must remain distinguishable and not be counted as unique jobs without a verified crosswalk.
- Missing tasks, aggregate categories, and translation limitations need explicit coverage flags.
- Long-term discovery rates and adoption delays are not calibrated by this project. Historical progress cannot establish a universal exponential law.
- Exhaustive review of every paper or all human technological history is not a claim this release can honestly make.

## Progress

- [x] Record the undertaking and acceptance criteria.
- [x] Import and audit official catalogs.
- [x] Build the evidence registry and model specification.
- [x] Replace the preset forecast engine.
- [x] Add the cinematic result reveal and red baseline year.
- [x] Validate catalog-wide outputs and representative interactions.
- [x] Publish and document remaining research limitations.

### Milestone 1 — Catalog acquisition underway

- Verified O*NET 31.0, released August 2026, is within the research cutoff.
- Source counts: 1,016 occupation records, 18,838 task statements, 54,269 job-title rows. These are source-record counts, not unique worldwide jobs.
- Importing all task statements and available numeric occupational attributes, with CC BY 4.0 attribution and download checksums.
- ESCO/ISCO acquisition and a separate primary-literature review are running in parallel.
- The user reiterated that unknown breakthroughs need researched estimates and that this log must remain updated throughout development.
- Interface decision: display one red conditional baseline year, rather than trimming genuine uncertainty into an unjustified 15-year interval.

### Milestone 2 — International coverage and evidence structure

- Verified ESCO v1.2.1 (December 10, 2025) through its documented public API: 3,039 occupation concepts. Full descriptions, aliases, essential skills, and optional skills are being acquired.
- Obtained the official ILO ISCO workbook for level-four occupation groups and duty descriptions.
- ESCO skill statements will remain identified as skills, not mislabeled as observed duties. O*NET, ESCO, and ISCO records will retain separate provenance because their categories overlap.
- Literature review has verified the METR software time-horizon work and OSWorld, WebArena, SWE-bench, and tau-bench. These benchmarks support scoped capability observations, not whole-occupation elimination dates.
- Implementation will load a compact search index first and detailed task records on demand, so expanding coverage does not force every visitor to download all datasets.

### Milestone 3 — Complete O*NET import and new interface implemented

- O*NET import complete: 1,016 records, 18,838 task statements, 58,573 deduplicated aliases, 338,665 nonsuppressed scalar ratings, and 379 distinct feature keys.
- 923 records have task statements; 93 are description-only. Proposed emerging tasks are retained separately rather than presented as established duties.
- O*NET source data is 14.05 MB before browser chunking; the importer records source checksums and source transformations.
- The cinematic reveal is implemented with a cancellable sequence, a skip control, and immediate results for reduced-motion preferences. Its labels describe use of downloaded data, not a fictional live search.
- Results now target a red single baseline year, with detailed capability evidence and assumptions available on demand.
- ISCO permissions check: original older ILO duty text may not be freely redistributable. The import will preserve all factual codes/titles and links while omitting unlicensed verbatim definitions. This is a documented limitation, not a silent substitution.

### Milestone 4 — Model implementation and scientific review

- Implemented a 12-area capability model with explicit prerequisites, domain-specific future assumptions, occupational demand levels, and a separate integration allowance.
- Literature coverage now includes historical diffusion and technological progress (Comin/Hobijn, Farmer/Lafond, Nagy and colleagues, Bloom and colleagues), expert forecasts, autonomous software, robotics, physical perception, social interaction, scientific discovery, and safety.
- Research review identified the January 2026 A-Lab correction. The registry will use corrected results and narrowed novelty claims rather than repeating the obsolete result.
- All 18 selected O*NET numeric feature-rule IDs, labels, and scale normalizations were checked against the official imported metadata.
- The model's numerical future milestones remain explicit analyst priors. Research supports distinctions and constraints; no claim of calibrated whole-occupation date accuracy is being made.
- Auditing task-level versus occupation-level capability dates and context-sensitive text mappings before catalog-wide computation.

### Milestone 5 — Full international import and integration fixes

- ESCO complete: 3,039 occupations, 30,387 aliases, 67,600 essential and 58,451 optional skill/knowledge relationships, referencing 13,475 distinct concepts. Every ESCO occupation includes an English description and essential requirements.
- ISCO complete: all 436 unit groups; 426 have links to ESCO children, while 10 remain classification-only. Original older copyrighted duty prose is not redistributed.
- Combined source coverage is 4,491 records. This count includes overlapping classifications, not 4,491 deduplicated jobs.
- Added compact search-index and lazy detail-chunk generation, plus a three-scenario audit for every record.
- Review found and fixed a profile-editing error: changing a source job's work must not keep unrelated original physical/safety ratings. Customized profiles now omit the original occupation-wide ratings and are labeled adapted.
- Review also identified overly broad text matches (for example, data loading mistaken for physical loading). These are being corrected and regression-tested before publication.
- Standalone report exports now carry the occupational data license/attribution, not just the website's About dialog.

### Milestone 6 — Catalog audit and interaction review

- Computed all 13,473 scenarios across 4,491 source records. Structural checks passed: every input retained, citation IDs resolved, finite point estimates, ordered scenarios, and endpoints after every required capability.
- Current research registry contains 30 primary papers/reports, including occupational exposure/projection context. The registry distinguishes observations, forecast use, and limitations.
- The first audit found 3,549 profiles with at least one unresolved requirement. This is an explicit mapping limitation, not evidence that those jobs need people forever. Further contextual review is underway; unresolved inputs retain a clearly labeled scenario assumption.
- Browser verification confirms the red single-year result and the four-stage mechanical reveal. Desktop search now prioritizes exact canonical titles, and ambiguous aliases require an occupation choice.
- Review caught an addition-versus-replacement edge case: adding a duty must retain original occupation ratings, while removing/rewriting source duties must omit stale ratings. Fixed and regression-tested.
- Customized profiles and classification-only ISCO records now receive accurate source labels; no fictional published task evidence is implied.

### Milestone 7 — Final research snapshot and verification

- Final registry: 32 sources (30 research/technical/framework references plus ILO exposure and BLS projection context). ILO/BLS findings are not converted into full-automation deadlines.
- Using ESCO's source-backed knowledge/skill distinction reduced inappropriate physical inferences and unresolved mappings. Final audit: 2,893 profiles contain an unresolved requirement; 6,906 of 86,967 selected inputs are unresolved and 28,425 use broad inference. These are disclosed limitations, not validated breakthrough forecasts.
- All 29 automated checks passed, along with syntax checks and the 13,473-calculation catalog audit. Tests cover source preservation, title resolution, unknown work, multi-front prerequisites, scenario ordering, task-local dates, scope changes, and horizons beyond 100 years.
- Browser checks passed at desktop and 390 × 844 mobile dimensions: autocomplete, keyboard selection, exact-title resolution, ambiguous-title choices, custom work, cinematic reveal, skip, cancellation, report tabs, and no horizontal mobile overflow.
- A custom speculative profile produced a 2165 central scenario, confirming that the interface and model do not cap future dates at 100 years. This is a conditional example, not evidence that the breakthrough will occur then.
- Exported a 40-requirement report and checked that all requirements, source links, attribution, and uncertainty notes were retained.
- Reduced-motion bypass and CSS preferences are implemented and reviewed; OS-level motion preference was not changed during testing.
- Deployment now rebuilds and audits the complete catalog before publishing through GitHub Pages. No OpenAI hosting or runtime service is used by this deployment.

## Remaining scientific work

This release completes the catalog/interface expansion, not universal scientific forecast validation. Future work needs independent task-label review, measured capability trajectories, explicit cost/reliability thresholds, expert elicitation, and prospective calibration against observed milestones. The existing numerical dates remain authored conditional assumptions. Neither all possible jobs nor all future inventions can be exhaustively enumerated or dated by this release.

### Milestone 8 — Published and verified

- Published application revision `e85b04237c4c269b889e58e2e456c39e9efba562` to the public [GitHub repository](https://github.com/sigenyi/aftermath).
- [GitHub Pages deployment](https://github.com/sigenyi/aftermath/actions/runs/41175028145) completed successfully, including catalog rebuild, all tests, artifact upload, and deployment.
- Verified the [public website](https://sigenyi.github.io/aftermath/) loads all 4,491 records and returns live suggestions for occupations beyond the former presets.
- Verified a complete librarian result after the cinematic reveal on the deployed site, including its full requirements, red central year, multiple technology areas, and explicit unresolved-input count. No browser warning or error messages appeared.
- Saved a live report screenshot with the user-facing outputs. Closed the local preview and recorded the deployment outcome here.
- This documentation update changes no application behavior. The research limitations above remain in effect; deployment success does not validate prediction accuracy.
