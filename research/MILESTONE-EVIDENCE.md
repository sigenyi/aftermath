# Quantitative milestone evidence

Research review: 31 October 2026. This register replaces an unsupported universal capability clock with **dated, outcome-specific expert elicitation and separate observed benchmark results**. It does not establish accurate full-occupation automation dates.

## Inventory and provenance

The principal quantitative forecast source is [Grace and colleagues, *Thousands of AI Authors on the Future of AI*, paper v3](https://arxiv.org/html/2401.02843v3), reporting the October 2023 Expert Survey on Progress in AI. It covers **39 task milestones, four named full occupations, and two global endpoints**. A 46th record, the respondent-selected final occupation, is retained for completeness but must not be mapped to a specific job because respondents selected different occupations.

The paper links a [public cleaned response spreadsheet](https://docs.google.com/spreadsheets/d/1aOydfhZHuVwU_fwTgE0_O_-8p-uMrRDYV5R5QnwOMGI/edit). The [author-linked open-source reanalysis](https://github.com/tadamcz/espai) includes a CSV copy. This import pins repository commit `5bea2ed3014d5360d1599bad989d3252d3b8ba3c`, dated 15 December 2024. On 31 October 2026, the current public spreadsheet export was compared cell by cell with the pinned CSV: **zero changed cells**, across 3,270 rows and 461 columns. Byte hashes differ because of line endings. The response file includes incomplete/administrative rows; it does not mean the paper surveyed 3,270 participating researchers. The reported survey sample was 2,778, with much smaller randomized subsets answering each milestone.

`dist/data/milestone-evidence.json` retains stable IDs, scope-preserving outcome descriptions, source column names, survey-date anchors, per-framing sample counts, exclusions, raw elicited medians, respondent disagreement, independently fitted quantiles, diagnostic information and links. It publishes aggregate statistics, not respondent records. The paper is CC BY 4.0; the linked repository's [MIT license](https://github.com/tadamcz/espai/blob/5bea2ed3014d5360d1599bad989d3252d3b8ba3c/LICENSE) is copyright Tom Adamczewski 2024. No separate original-response dataset license was identified, so we do not claim the underlying raw responses are independently MIT licensed. Published outputs contain derived numerical facts and original paraphrases of the CC BY paper's scopes, not raw response records or copied third-party analysis code. Attribution: Grace et al. and AI Impacts for the survey; Tom Adamczewski for the public reanalysis and data repository.

## What is actually forecast

Task questions ask when a well-resourced laboratory could implement a precisely specified outcome within one year if it chose to. This is **feasibility**, not routine production reliability, universal deployment, affordability at every firm, regulatory approval or automation of an entire occupation. The four occupation questions instead ask when machines could do the whole occupation better and more cheaply than humans. They exclude intrinsic advantages of being human. The global all-task and all-occupation questions differ in framing and produced very different estimates.

The outcomes matter. Simple algorithm implementation is not maintaining arbitrary software. A fully built payment website is not every software-development duty. Telephone banking is not open-ended psychotherapy or long-term care. Folding laundry is not dexterous handling of all materials. Installing wiring in a new home is not troubleshooting every existing building. A surgeon occupation forecast is much broader than an autonomous clipping-and-cutting experiment. Transfer to other work must be explicit and cannot silently inherit the source's probability interpretation.

## Reproducible numerical method

The source elicited two formats:

- Fixed probabilities: elapsed years until 10%, 50% and 90% belief in feasibility.
- Fixed years: belief in feasibility within 10, 20 and 50 years; the HLMI question uses 40 rather than 50 for its last point.

The importer reads the authors' `*_clean` columns. It retains complete, finite, nonnegative, nondecreasing triples; probabilities must lie in 0–100%. Missing/nonnumeric, negative, nonmonotonic and out-of-range exclusions are counted separately. No failed response is silently converted to a short horizon. The source's very large numbers encoding responses such as never/infinity are preserved; those are elicited beliefs, not evidence that a physical technology takes a specified enormous duration.

The main `quantiles` are **our independent reproduction of the published gamma-family / squared-probability-error / arithmetic-CDF-pooling approach**, not exact values copied from the paper. For each triple, a gamma CDF with zero location and positive shape/scale minimizes mean squared probability error. Four deterministic initializations and log-space optimization are used. Unique triples are fitted once. Within each elicitation framing, individual CDF probabilities are averaged; the two framing aggregates receive equal weight. The aggregate CDF is inverted at 10%, 25%, 50%, 75% and 90%. Calendar-year numbers are `2023 + elapsed years`; October is the base month. Decimal precision is for reproducibility, not a claim of forecasting calendar days.

`fixedProbabilityMedians` separately preserves the median respondent's answer at each elicited probability. `respondentDisagreement` describes the middle half of respondents' elicited years; it is **not** a confidence interval for the event. `fixedYearResponses` retains the other framing's mean and median probabilities. These quantities are different and must not be interchanged.

Boundary responses receive explicit diagnostics. A respondent assigning 0% through 50 years has **not** said never; the later tail is underidentified. Our fitting keeps these in the gamma family and identifies them as boundary cases. Extrapolating the tail is a functional-form assumption. High quantiles can extend many centuries and are highly sensitive to fitting choices. They must not be presented as calibrated physical discovery deadlines. A null quantile means the numerical inversion did not reach the requested probability within its search domain, not impossibility.

Version 1.1.0 also exports an aggregate `cdf` for each of the 46 scopes. Its aligned `years` and `probabilities` arrays contain **441 direct evaluations of the same fitted gamma mixture**: annually from 2023 through 2323, then every five years from 2328 through 3023. Probabilities are retained to ten decimal places for reproducibility, not predictive accuracy. These curves are not reconstructed from three quantiles, and no respondent-level coefficients are published. `boundaryUnidentifiedResponses` records the number of boundary fits in each framing; `metadata.cdfGrid` describes the shared grid.

The grid is a computational domain, not a declaration that all outcomes occur by 3023. A downstream joint-distribution crossing beyond it must remain **null**; do not clamp to its final year or fabricate a tail date. Separately retained source quantiles can exceed that grid. Values within the grid but beyond elicited points are still gamma functional-form extrapolations, including underidentified boundary tails. Multiplying different milestone CDFs requires an explicitly assumed independence model; a common-factor alternative requires a separately disclosed dependence assumption. Neither is empirically calibrated here. Repeated references to the same outcome must be deduplicated, and a directly matched full-occupation outcome must not be counted again as independent completion of its own constituent duties.

This implementation does not reproduce every original R fitting/exclusion decision. Published Table 6 gives HLMI p10/p50 of **2027/2047**, and FAOL p10/p50 of **2037/2116**. Our reproduction gives approximately **2027.2/2047.4** and **2036.6/2109.4**, respectively. The FAOL difference of about seven years is disclosed and the exact published checks are retained separately. It would be inaccurate to label every derived number as the paper's published estimate.

The [2024 methodological reanalysis](https://aiimpacts.org/how-should-we-analyse-survey-forecasts-of-ai-timelines/) independently shows that framing and aggregation decisions matter greatly. Its combined median/interpolation estimate gives p20/p50/p80 of 2048/2073/2103; that is a different estimand and method from the paper's separate mean-CDF curves. Its publication argues for showing distributions and disagreement. We do not select whichever aggregation produces the desired year.

## Observations kept separate from forecast distributions

Three numerical primary-source observations are included under `observations`, with `quantiles: null`:

- [SRT-H, paper v3, July 2025](https://arxiv.org/abs/2505.10251v3): eight successful trials on eight unseen ex vivo gallbladders for selected surgical steps. This establishes a bounded demonstration, not a clinical failure rate or automation of surgeons' complete work.
- [2025 BEHAVIOR Challenge winning team](https://robot-learning-collective.github.io/winning-behavior-1k-challenge), with its [December 2025 paper](https://arxiv.org/abs/2512.06951v2): on 50 household simulation tasks, the private full-task success was 0.124 and q-score including partial progress was 0.260. Confusing the two doubles the apparent completion rate. Average demonstrated task duration was 6.6 minutes. These results support separate manipulation, navigation, sequencing and recovery requirements; they do not provide a year for general household automation.
- [MIT vision-economics working paper, January 2024](https://ide.mit.edu/wp-content/uploads/2024/01/Beyond-AI-Exposure-Which-Tasks-are-Cost-Effective-to-Automate-with-Computer-Vision.pdf): under its model, 23% of wages paid for vision tasks were economically attractive to automate at the studied costs. This is neither 23% of jobs nor observed displacement, and cannot justify a universal deployment-delay constant.

These measurements and the elicited milestone distributions address different outcomes. Benchmark success rates, cost shares and respondent beliefs must not be averaged into one numerical clock.

## Use in the application

1. Select a milestone by its **observable action, object, setting and success criterion**, not merely a shared word or occupational title.
2. Keep the survey's October 2023 anchor. Do not restart the clock in 2026. An elapsed forecast date does not prove the milestone occurred; an updated capability evaluation is required.
3. Distinguish direct scope matches from analogies. Any transfer to broader work, increased reliability, rare exceptions, physical integration, cost or legal deployment adds a separately labeled model assumption.
4. Use every necessary capability and preserve bottlenecks. These correlated milestone forecasts are not independent draws, so multiplying their probabilities is unjustified without a dependence model.
5. Keep unsupported work explicitly unanchored. No forecast distribution was established here for all future breakthroughs, arbitrary engineering discoveries, every care setting or every possible job.
6. Do not manufacture a ≤15-year confidence band. The point display can stay simple while the evidence section retains the actual uncertainty and methodological limits.

## Reproduction

`python3 scripts/import-milestones.py --raw-only` exports the source's fixed-probability median answers without fitting. For the fitted version, use Python with NumPy and SciPy installed and run `python3 scripts/import-milestones.py --fit`. The numerical environment and input SHA-256 are recorded in the output. Raw source files and fit caches remain under ignored `work/milestones/`. The source snapshot is pinned, and caches allow reproducible reruns without new downloads.

Validation checks all 46 unique milestone IDs, all 39 task definitions, sample counts, finite ordered quantiles where available, source references, base-year anchoring and comparisons with the published global checkpoints. The CDF export was checked for 441 aligned points per record, strictly increasing calendar years, finite nondecreasing probabilities bounded by zero and one, and grid brackets around available quantiles. These checks establish extraction and computation consistency, **not predictive calibration**.

## Quantitative inventory

The following values are derived aggregate belief quantiles, rounded here to one decimal. FP/FY are the retained sample counts for each framing. The machine-readable file preserves more numerical precision and all method notes.

| Milestone | FP/FY | p10 year | p50 year | p90 year |
| --- | ---: | ---: | ---: | ---: |
| Translate a newly discovered language | 147/100 | 2,023.5 | 2,030.6 | 2,082.8 |
| Learn speech translation from subtitled films | 121/119 | 2,023.1 | 2,027.9 | 2,064.0 |
| Translate common languages | 135/106 | 2,023.0 | 2,026.5 | 2,040.2 |
| Provide telephone banking | 136/124 | 2,023.1 | 2,028.1 | 2,054.6 |
| Classify unseen object categories | 130/110 | 2,023.0 | 2,026.7 | 2,048.5 |
| Recognize objects after one example | 142/118 | 2,023.1 | 2,028.6 | 2,058.5 |
| Reconstruct a scene from video | 118/115 | 2,023.1 | 2,028.2 | 2,050.2 |
| Transcribe noisy accented speech | 141/125 | 2,023.0 | 2,026.2 | 2,040.6 |
| Produce indistinguishable voice recordings | 135/121 | 2,023.0 | 2,025.9 | 2,040.8 |
| Originate publishable mathematical theorems | 119/138 | 2,025.6 | 2,044.7 | 2,280.3 |
| Match top Putnam competitors | 111/123 | 2,023.8 | 2,031.1 | 2,090.0 |
| Master Go with human-scale experience | 114/121 | 2,023.6 | 2,032.4 | 2,119.2 |
| Beat top StarCraft II players from video | 126/121 | 2,023.0 | 2,027.4 | 2,048.8 |
| Learn an unfamiliar computer game rapidly | 116/110 | 2,023.2 | 2,030.1 | 2,061.9 |
| Beat humans on new Angry Birds levels | 121/103 | 2,023.0 | 2,025.1 | 2,033.7 |
| Beat professional Atari testers | 147/132 | 2,023.2 | 2,029.2 | 2,059.4 |
| Learn half of Atari games quickly | 121/121 | 2,023.1 | 2,028.2 | 2,058.7 |
| Fold laundry at worker speed and quality | 129/107 | 2,023.3 | 2,030.0 | 2,067.1 |
| Win a five-kilometre city race | 152/129 | 2,023.6 | 2,031.8 | 2,069.9 |
| Assemble arbitrary LEGO sets | 122/130 | 2,023.6 | 2,030.9 | 2,070.3 |
| Generalize a sorting procedure | 137/106 | 2,023.2 | 2,029.8 | 2,081.9 |
| Write simple algorithm implementations | 138/119 | 2,023.0 | 2,024.7 | 2,037.7 |
| Answer searchable fact questions | 117/106 | 2,023.0 | 2,025.8 | 2,044.6 |
| Answer searchable open questions | 140/112 | 2,023.0 | 2,026.5 | 2,048.7 |
| Answer unsettled factual questions | 131/129 | 2,023.0 | 2,027.2 | 2,058.3 |
| Write high-scoring school history essays | 127/128 | 2,023.0 | 2,025.0 | 2,036.3 |
| Compose a chart-quality song | 125/136 | 2,023.0 | 2,028.7 | 2,067.5 |
| Compose indistinguishable artist-style songs | 139/115 | 2,023.0 | 2,027.0 | 2,051.2 |
| Write bestseller-quality fiction | 118/114 | 2,023.2 | 2,030.3 | 2,085.9 |
| Explain game-playing decisions | 139/108 | 2,023.5 | 2,031.2 | 2,113.7 |
| Win the World Series of Poker | 138/116 | 2,023.0 | 2,025.8 | 2,044.6 |
| Discover simulated physical laws | 136/135 | 2,024.2 | 2,034.5 | 2,143.9 |
| Install a new home electrical system | 117/127 | 2,025.7 | 2,039.8 | 2,119.5 |
| Fine-tune a language model autonomously | 118/102 | 2,023.1 | 2,028.6 | 2,073.6 |
| Solve a long-standing mathematics problem | 121/128 | 2,027.4 | 2,049.4 | 2,336.8 |
| Conduct a publishable machine-learning study | 135/134 | 2,025.5 | 2,042.7 | 2,273.4 |
| Replicate a machine-learning paper | 129/124 | 2,024.7 | 2,035.3 | 2,132.1 |
| Build an entire payment website | 142/121 | 2,023.1 | 2,028.1 | 2,056.3 |
| Find and repair a popular-project security flaw | 126/118 | 2,024.5 | 2,032.9 | 2,112.0 |
| Full automation: Truck driver | 408/376 | 2,024.9 | 2,034.7 | 2,082.4 |
| Full automation: Surgeon | 409/379 | 2,029.7 | 2,056.4 | 2,353.7 |
| Full automation: Retail salesperson | 409/379 | 2,024.3 | 2,032.9 | 2,101.2 |
| Full automation: AI researcher | 408/378 | 2,029.4 | 2,064.2 | 3,522.3 |
| All-task human-level machine intelligence | 890/867 | 2,027.2 | 2,047.4 | 2,198.1 |
| Full automation of every occupation | 413/379 | 2,036.6 | 2,109.4 | 4,734.1 |
| Respondent-selected final occupation | 413/375 | 2,028.0 | 2,080.4 | 4,357.3 |
