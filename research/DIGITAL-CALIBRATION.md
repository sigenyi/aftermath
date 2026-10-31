# Empirical calibration of software-task horizons

Review and evidence cutoff: **2026-10-31**.

This component replaces invented software-capability offsets with a reproducible fit to published numerical measurements **where the task matches the benchmark domain**. It estimates a software-task benchmark milestone. It does not turn an 80% successful agent into reliable full occupational automation.

## Data and provenance

The primary input is METR's [official numerical results](https://metr.org/assets/benchmark_results_1_1.yaml), linked from its [time-horizon dashboard](https://metr.org/time-horizons/). The dashboard was last updated September 8, 2026 and is no longer actively maintained. Its measurements concern human-expert completion time for well-specified software, ML and cybersecurity problems; they are not the AI's runtime. The dashboard states that measurements above 16 hours are unreliable and does not publish 99% horizons.

The downloaded YAML is preserved in `research/digital-source/benchmark_results_1_1.yaml`. Its SHA-256, byte count, complete extracted observations and inclusion decisions are recorded in `dist/data/digital-calibration.json`. A snapshot contains 26 models: 23 TH1.1 and three legacy TH1.0 observations. We retain all for inspection but fit only comparable TH1.1 data. The latest included source model release is April 7, 2026; that observation is excluded from fitting because its p50 estimate exceeds 16 hours. Fourteen source-labeled frontier observations remain in the primary fit; the last is February 5, 2026.

The companion GitHub commit metadata identifies the latest public [analysis repository](https://github.com/METR/eval-analysis-public) commit observed before the cutoff. It is **not** claimed to be the exact revision of the later dashboard YAML. The YAML content hash pins the actual numerical input used here.

## What is fitted

For each published success threshold, 50% and 80%, fit an unweighted ordinary least squares regression:

```text
x = calendar days since 2023-01-01
y = log2(published human-minute horizon)
y = intercept + slope × x

doubling_days = 1 / slope
threshold_crossing_days = (log2(requested_minutes) − intercept) / slope
```

The numeric coefficients are computed directly from the observations. There is no hand-selected digital offset, severity-to-year conversion or blanket multiplicative progress factor in this component. The primary p50 result reproduces METR's published 128.744-day doubling time to within 0.001 day. This checks the parsing, units, selection and regression implementation against an independent published result.

Primary selection: `benchmark=METR-Horizon-v1.1`, source `is_sota=true`, source `p50<=960 minutes`, release date at or before the cutoff. The source frontier flag is based on its published model selection and is used consistently for both thresholds. It is not relabeled as an independently determined p80 frontier. Additional fits use every comparable model and frontier models released since 2024, so the dependence on model/window selection is visible.

The fit uses published model-level logistic-horizon point estimates. It does **not** refit the original task runs or reproduce METR's task-family bootstrap. Original measurement bounds are retained, but are not treated as independent weights: models share tasks, uncertainty and potentially related training/scaffolds. Ignoring those correlations in a weighted regression would manufacture apparent precision.

## Validation rather than just curve fitting

The primary validation trains on seven models released before January 2025 and evaluates seven later models. A no-progress forecast using the final training observation is also evaluated. Expanding-window predictions with at least six prior models provide a second check.

This is a **retrospective release-date holdout**, not a historical real-time forecast. Old and new models were evaluated on the common later task suite; those measurements were not all available at their release dates. The check establishes how this functional form predicts held-out model-level measurements, not its accuracy for future discoveries or employment dates.

| Threshold | Fitted doubling time | In-sample R² | Holdout RMSE in log2 units | Equivalent multiplicative error factor | No-progress RMSE in log2 units |
|---|---:|---:|---:|---:|---:|
| 50% success | 128.744 days | 0.934 | 1.848 | 3.60× | 2.712 |
| 80% success | 133.405 days | 0.903 | 2.193 | 4.57× | 2.634 |

The trend beats the constant baseline in this split, but errors remain substantial. The R² values do not justify narrow future confidence intervals. Rolling prediction RMSE is 0.864 log2 units for p50 and 1.034 for p80. Every held-out observation, prediction and error is retained in the JSON.

## Scenarios and extrapolation

Central uses the primary OLS crossing. Accelerated and conservative use the 10th and 90th percentiles of crossing dates from 1,000 deterministic resamples of model observations. These are **fit-sensitivity scenarios**, not 80% predictive intervals. The models are not independent experimental samples, measurement covariance is not modeled, and future research can change regime. Alternative window/model fits are returned separately.

| Human-expert task duration | Central p50 crossing | Central p80 crossing | Scope |
|---|---|---|---|
| 1 hour | February 2025 | January 2026 | Within task-duration measurement boundary |
| 8 hours | March 2026 | February 2027 | Within boundary; p80 crossing extrapolates in calendar time |
| 40 hours | December 2026 | December 2027 | Outside the 16-hour measurement boundary |
| 160 hours | September 2027 | September 2028 | Outside the measurement boundary; increasingly speculative |

These dates are mathematical trend crossings, not guaranteed delivery dates. A 40-hour task is not interchangeable with five independently specified eight-hour tasks. The caller must supply a defensible human-time estimate; source occupation labels and difficulty ratings do not measure task duration. If the application estimates that duration, it must label it as an assumption.

The [October 2026 statistical reanalysis by Nguyen and Fithian](https://arxiv.org/abs/2610.12466) fits alternative models to the task measurements. It finds that the relation between human time and AI difficulty is not uniformly linear in log time, including a comparatively flat region around 2–30 minutes. Its improved scoring under alternative models adds model-form uncertainty to any simple exponential extrapolation. This is a research preprint, not a resolved consensus or a replacement occupational forecast.

## Application contract

Import `estimateDigitalMilestone` from `dist/digital-forecast.js`:

```javascript
estimateDigitalMilestone({
  durationMinutes: 480, // Human-expert completion time; source or assumption required.
  successTarget: 0.8,   // Only published 0.5 and 0.8 are supported.
  scenario: 'central',
  assessmentYear: 2026
});
```

Returns `pointYear` and `baselineYear`, the mathematical `crossingDate`, numeric `formula`, measured `empirical` inputs/validation, separate `assumptions`, `limitations`, citation IDs and `uncertainty`. `pointYear` uses the calendar year containing the crossing, floored at the assessment year. Exact crossing dates are for auditability, not a claim of daily predictive accuracy.

For 99%, 99.9%, 100% or any unmeasured reliability threshold the return is `supported:false` with `pointYear:null`. There is no invented conversion from p80 to near-perfect success. Thresholds above 960 minutes remain computable but are explicitly marked outside the measured task-duration range. The module must not silently replace a full-automation requirement with an 80% benchmark success target.

Appropriate integration requires a compatible software/ML/cybersecurity task and a duration assumption or observation. The module does not calibrate generic managerial judgment, legal decisions, relationships, creativity, physical work, organizational adoption, cost or regulation. Those require other evidence and explicit assumptions. A job can need several of these additional fronts even when its software subtask is covered by this benchmark.

`dist/digital-calibration-data.js` contains generated browser-safe constants; no runtime network request or external AI service is needed. `dist/data/digital-evidence.json` contains two additional primary-source records for merging into the site's registry. Existing numerical horizon parameters elsewhere have not been edited by this work.

## Reproduction and tests

```text
python3 scripts/calibrate-digital.py
node --test digital-forecast.test.mjs
```

The Python script uses only the standard library and the checked-in snapshot. `--refresh` explicitly downloads a new official snapshot and guards that the primary p50 fit still reproduces METR's reported trend. Regenerating the files from the same snapshot is deterministic. Seven tests verify hashes and source cutoff, exclusions, published-fit reproduction, duration/reliability monotonicity, refusal of unsupported reliability, extrapolation flags, scenario ordering, temporal holdout boundaries and invalid inputs.

## Work log

- 2026-10-31: Located and downloaded official METR TH1.1 per-model observations; verified both p50 and p80 values, confidence bounds, source frontier flags, release dates and task-suite identifiers.
- 2026-10-31: Excluded legacy-suite and saturated p50 measurements; reproduced the official 128.744-day doubling time with an independent standard-library regression.
- 2026-10-31: Added model-release holdout and rolling checks, including the no-progress comparator; recorded material errors rather than relying on in-sample fit alone.
- 2026-10-31: Added deterministic model-resampling sensitivity, separate p50/p80 functions, unsupported-reliability handling and explicit duration/domain assumptions.
- 2026-10-31: Reviewed the October 2026 statistical validity preprint; documented model-form and external-validity limits. Added source registry entries and seven passing tests.
