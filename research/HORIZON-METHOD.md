# Requirement horizons from source forecasts

Review date: **2026-10-31**.

`dist/horizons.js` replaces the former capability-specific fixed future offsets. Its calendar values come from identified expert-survey milestones. The assumptions concern **which surveyed outcome is a reasonable analogue for a work requirement**, rather than a hidden number of years added to a job. The module does not claim that an expert survey is a calibrated scientific prediction.

## Numeric sources

The primary calendar anchors are in `dist/data/milestone-evidence.json`. They cover 39 elicited tasks and four named occupations from the 2023 ESPAI survey associated with [Grace et al., Thousands of AI Authors on the Future of AI](https://arxiv.org/html/2401.02843v3). Additional general-intelligence, all-occupation and heterogeneous respondent-selected outcomes are retained in the source data but **never used as fallback dates** by this module.

The probabilities were independently reconstructed from the public response data using gamma-distribution fitting and equal-weight pooling of fixed-probability and fixed-year framing groups. They are **derived estimates, not copied published point estimates**. See `research/MILESTONE-EVIDENCE.md` for data provenance, sample-count distinctions, exact fitting, uncertainty and differences from the published aggregate results. In particular, raw median responses and pooled CDF quantiles are different statistics and are not silently interchanged.

`dist/milestone-data.js` is a generated, browser-compatible snapshot of the needed records. Its metadata stores a hash of the source JSON. Original dates retain the 2023 survey anchor: the present year is never added to an already dated forecast.

The constants also preserve the source's direct fitted CDF arrays: 441 calendar points per outcome, annually from 2023 through 2323 and then every five years through 3023. These are evaluated gamma mixtures, not curves invented by interpolating three quantiles. Their tails remain functional-form extrapolations; no probabilities outside the exported grid or dependence between milestones are inferred by this requirement-mapping module. A separate workflow aggregation layer must make any joint-event assumptions explicit.

The [METR numerical software-task calibration](DIGITAL-CALIBRATION.md) remains a separate empirical component. It is attached only as benchmark context for software requirements. An 80%-successful benchmark is not treated as a full-automation deadline.

## Selection and transfer

The input specifies a capability, task labels, available source metadata and occupation context. Selection examines the task's action and object. A numerical difficulty score can help select between a simple program and a multi-component software workflow; it is never multiplied by years or used to manufacture distinct dates.

Examples of source-based mappings:

| Supplied requirement | Selected milestone | Interpretation |
|---|---|---|
| Build a specified payment website | Entire payment website | Close software-task match; not every future web-development duty |
| Transform spreadsheet or invoice records | Simple algorithm implementation | Explicit transfer from executable program generation to a specified structured-data operation; access and exceptions remain conditions |
| Renew a domain-name registration | Simple algorithm implementation | Bounded digital-administration transfer; registrar access and ownership checks remain conditions |
| Configure server directories | Simple algorithm implementation | Bounded filesystem operation; permissions and verification remain conditions |
| Configure HTTP infrastructure or design web/system models | Entire payment website | Explicit software-system scope transfer; “physical” data models and sequence diagrams do not imply robotic manipulation |
| Find and patch software vulnerabilities | Find and repair a popular-project flaw | Security-workflow analogue |
| Fold laundry | Human-speed laundry folding | Close physical action/object match |
| Assemble objects from instructions | Arbitrary LEGO assembly | Explicit transfer across objects, materials, forces and tools |
| Install electrical wiring | New-home electrical installation | Close residential task match; industrial scope is a transfer assumption |
| Other installation and repair | New-home electrical installation | Explicit multi-step physical-workflow analogue, not an observation of every trade |
| Handle bounded service conversations | Telephone banking | Transfer across transaction domains; not proof of counseling or relationship competence |
| Respond to bounded user email inquiries | Telephone banking | Explicit communication-channel and subject-matter transfer; automated email replies are not a new measured benchmark |
| Retrieve and synthesize information | Searchable factual/open questions | Transfer to bounded knowledge work; execution and accountability are additional conditions |
| Judge unsettled information or plan under uncertainty | Useful answers to unsettled factual questions | Explicit judgment proxy; not proven professional decision reliability |
| Write original assessed content | School essay or bestseller-quality fiction | Select according to output type and creative demand |
| Conduct a hypothesis/experiment/report workflow | Publishable ML study | Cross-discipline transfer; wet-lab equipment and domain validation remain separate |

A nearby benchmark is not silently promoted into evidence of complete autonomy. Every selected anchor returns its original outcome, match type, transfer explanation, source ID and selected quantile. Cross-domain proxies are conditional assumptions even though their calendar values have a real numerical source.

Surgical terminology alone does not select the surgeon milestone. Performing an operation or acting on patient tissue can justify that explicit proxy; repairing, calibrating or manufacturing surgical lasers/instruments does not. Those equipment tasks use a maintenance analogue where applicable, with undated assurance if no comparable safety outcome is available. Similarly, authoring or management software “tools” are not evidence of robotic manipulation.

The four named occupation forecasts are restricted to source-backed O*NET/ESCO profiles whose original scope is retained. Even then, a task must concern the corresponding core work **and belong to the original source task IDs** (or be an unedited source-backed task when that inventory is unavailable). Surgeon-related clinical requirements can cite the surgeon forecast; invoice processing inside a surgeon's job still uses an administrative task proxy. Editing the role or changing it to a custom profile disables direct title-based occupation matching. Added duties do not silently become original duties. A custom surgical task may still cite the surgeon outcome as an explicitly labeled occupation-to-task analogy.

## Unsupported requirements stay visible

The following do not receive invented universal years:

- Opaque or unmapped duties.
- Speculative new laws of physics, interstellar prerequisites, consciousness or universal cures.
- Psychotherapy, deep caregiving and other relationship requirements without a selected defensible analogue.
- High-consequence assurance for which the selected task/occupation does not supply a relevant outcome.
- Extreme environments, heavy-duty endurance and similar hardware demands not covered by the physical milestones.

These yield `baselineYear:null`, a reason and the unresolved task IDs. A mixed capability can return the latest dated matched requirement with explicit partial coverage. That partial date assumes the unresolved work is solved no later; the data do not establish that assumption. The application must display this unresolved condition alongside any partial year.

This preserves the requested full-automation scope without claiming that every necessary discovery already has a research-supported deadline. A request for an educated assumption does not make physically unknown feasibility measurable.

## Scenario calculation

```text
accelerated   → selected milestone p10
central       → selected milestone p50
conservative  → selected milestone p90

anchor_year = max(assessment_year, round(original_survey_quantile_year))
capability_year = maximum required anchor_year
```

The probabilities describe the survey's aggregate beliefs for each elicited outcome. Individual capability dates retain the maximum-quantile convention above; they are diagnostic markers, **not** joint completion probabilities. The full workflow now uses the separate CDF aggregation below. The requirement module adds no fabricated deployment lag, no arbitrary percentage speed-up, no occupation-title hash and no artificial year differences between equivalent requirements.

If any selected anchor lacks the scenario quantile, the capability result is undated. It is not replaced with a median or an invented far-future number. Current source tails can extend centuries; those values are retained and are marked method-sensitive expert beliefs, not evidence of precise century-scale prediction.

Past survey estimates are shown no earlier than the assessment year. This is a display convention, not a claim that the milestone was achieved. An explicit limitation accompanies such anchors.

## Full-workflow dependence scenario

`dist/workflow.js` treats completion as the event that every selected milestone has occurred. It first deduplicates repeated source milestone IDs. If a directly matched whole-occupation forecast covers the retained original role, that event replaces the original-role subtask events; custom-added task anchors and undated gaps remain outside that substitution.

Let `F_i(t)` be the supplied marginal CDF for milestone `i`. The implemented default is:

```text
F_workflow(t) = 0.5 × min_i F_i(t) + 0.5 × product_i F_i(t)
```

This is mathematically coherent. One generative interpretation first selects one of two progress scenarios: with probability 0.5, all milestone times use the same uniform quantile rank in their respective marginal distributions; otherwise, their quantile ranks are independent. The shared-rank case gives `min(F_i)`, while independence gives `product(F_i)`. Mixing these cases preserves the supplied marginal CDFs and gives a nondecreasing CDF for completion of all events.

The **0.5 mixture weight is an explicit analyst assumption**, not an estimated correlation, fitted probability of a scientific regime or calibrated confidence level. The accelerated, central and conservative workflow markers find the 0.1, 0.5 and 0.9 crossings of this constructed scenario CDF. The module validates aligned, monotone CDF inputs, interpolates only between exported points and returns no year if the crossing lies beyond the available grid. Empty or missing evidence also returns no year. It exposes separate shared-rank and independent-scenario dates as sensitivity diagnostics.

Important interpretation limits:

- **Independence is not a worst-case bound.** Other dependence structures, including negatively dependent outcomes, can yield lower joint completion probabilities. The two diagnostics are model scenarios, not universal bounds or a confidence interval.
- **Milestone events can overlap or be logically nested.** Simple coding and complete website creation, or ML-paper replication and full AI-researcher automation, are not established independent inventions. Exact-ID deduplication and whole-occupation substitution reduce obvious double counting, but do not estimate or fully resolve remaining overlap. Transferring one event to several duties additionally assumes that the same advance suffices for all of them.
- **The weight matters more as the number of distinct anchors grows.** Combining many events can move a workflow median far into the upper tails of the marginal forecasts. This is a consequence of the dependence assumption, not newly observed empirical precision. Sparse, method-sensitive century-scale tails can amplify the effect.
- **Historical survey beliefs are not a current posterior.** New robot demonstrations and software benchmarks provide context, but this mixture does not statistically update the 2023 survey distributions using those observations.
- **Undefined work stays undefined.** A conditional year for the dated subset assumes unmatched or undated requirements do not delay it. A valid mathematical CDF for selected proxies is not evidence that all real tasks, reliability, deployment and legal requirements have been solved.

The method is useful as an inspectable scenario for several necessary advances, and improves on silently averaging their dates or treating a maximum of marginal medians as a joint median. It does not establish that the selected 50/50 scenario is more predictively accurate than other plausible dependence models. Independent task mapping, observed milestone outcomes and prospective calibration remain necessary to assess that.

## Current evidence and software benchmarks

Where supplied, `task.automationEvidence` contributes a compact current-readiness summary and citation ID. These external physical-task assessments include model-assisted classifications and references with different maturity and autonomy levels. The module does not infer full current automation from a demonstration, exposure tier, commercial listing or majority vote. Such material informs interpretation; it does not override the dated milestone.

For software work, an explicitly supplied human-task duration can be evaluated against the empirical METR model. When no duration is supplied, the returned benchmark is a clearly labeled **illustrative 480-minute task**, not an estimated duration of that job. Neither value alters the survey-derived requirement date. Benchmark calculations are cached by duration, scenario and assessment year, so all-catalog evaluation does not rerun bootstrap sensitivity for every task.

Generic clerical work is not presented as a software benchmark just because it uses a computer. Its program-generation analogue is labeled separately as a transfer assumption.

## Return contract and tests

`estimateRequirementHorizon` returns:

- `baselineYear`, nullable; source IDs and milestone IDs.
- `anchors` with the original outcome, selected quantile, rounded year, match type, reason and supporting task IDs.
- `parameterStatus`, `basis`, assumptions and limitations.
- `coverage` with input/matched counts, unresolved task IDs and missing quantile IDs. `complete` means all supplied inputs received a selected anchor; it does not mean scientific validation or exhaustive occupational coverage.
- Optional software benchmark context and physical-readiness context.

`node --test horizons.test.mjs` checks source-hash/CDF preservation, action/object differentiation, digital/physical separation, administrative versus web-work anchors, actual O*NET Web Developer wording and infrastructure duties, domain/email administration, surgical equipment versus clinical action, scenario ordering, original date anchoring, absence of universal fallbacks, partial coverage, missing quantiles, named-occupation scope, edited and added duties, readiness evidence, and past-date warnings. Eighteen tests pass. The joint aggregation has its own tests maintained with `workflow.js`.

## Work log

- 2026-10-31: Selected task-level and named-occupation numerical anchors from the final reconstructed survey dataset; excluded global and heterogeneous outcomes from the mapping.
- 2026-10-31: Implemented explicit analogue explanations, original-date quantiles, unresolved requirements and null missing-quantile handling. Removed the need for capability-specific year offsets in this module.
- 2026-10-31: Kept empirical software horizons as cached context only, with measured versus illustrative duration labels and no conversion from 80% reliability to full autonomy.
- 2026-10-31: Corrected named-occupation matching after review: edited/custom roles and local invoice duties no longer inherit surgeon/truck-driver full-occupation dates.
- 2026-10-31: Regenerated browser constants from final source data and metadata; added twelve passing regression tests.
- 2026-10-31: Regenerated the version 1.1 source snapshot with direct fitted CDF arrays for a separate joint-event aggregation layer; verified source hash, all 46 records and 20,286 CDF values. Thirteen tests pass.
- 2026-10-31: Independently reviewed the implemented shared-rank/independent-progress mixture, verified its mathematical interpretation, and documented overlap, weighting, sparse-tail and current-evidence limitations.
- 2026-10-31: Restricted direct named-occupation anchors to original source duties; added a regression for extra clinical duties in an otherwise unchanged surgeon profile. Added actual O*NET “Web sites”/“Web applications” wording tests and excluded software tools from robotic manipulation. Fifteen horizon tests pass.
- 2026-10-31: Added bounded domain-registration and email-inquiry analogues for actual Web Developer duties; tightened surgical transfer after a Photonics Technician equipment-repair false positive. No new calendar parameters were introduced. Seventeen horizon tests pass.
- 2026-10-31: Added exact source wording for server directory trees, HTTP/operating-system configuration, web models/prototypes and sequence diagrams. These use existing software proxies and explicitly avoid robotic manipulation. Eighteen tests pass; horizon changes frozen for final integration.
