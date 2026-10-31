# Published robot-task evidence

Review date: **31 October 2026**. This import adds task-specific published assessments and their cited examples. It does **not** convert robot exposure into an automation year.

## Source and license

The source is Russell Legate-Yang and Maxim Massenkoff's [*What work can robots do?*](https://www.anthropic.com/research/what-work-can-robots-do), published by Anthropic on 30 September 2026, and its [public task dataset](https://huggingface.co/datasets/Anthropic/EconomicIndex/tree/430f214c438dd25e0e26a3e5b84dc502d6894997/robot_exposure). The import pins Hugging Face commit `430f214c438dd25e0e26a3e5b84dc502d6894997` and [the task CSV at that revision](https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/430f214c438dd25e0e26a3e5b84dc502d6894997/robot_exposure/robot_exposure_tasks.csv).

The source documentation explicitly releases the data under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution: Russell Legate-Yang and Maxim Massenkoff / Anthropic, *What work can robots do?* (2026). This release also incorporates the O*NET 29.3 Database, U.S. Department of Labor/Employment and Training Administration, under CC BY 4.0. O*NET® is a trademark of USDOL/ETA. Anthropic modified the O*NET material, and AFTERMATH further restructures the published assessment data. USDOL/ETA has not approved, endorsed or tested these modifications.

The reviewed CSV SHA-256 is:

```text
28b17551a913fd0d0bad1deb0d1c83584d9a936270e6e545eefb3a8aee081586
```

The generated `dist/data/robot-task-evidence.json` records the source URL, commit, actual input hash, source occupation edition, publication/review dates, license and transformations. The importer pins the source commit and checks reviewed counts and unique task identifiers; it records the hash but does not independently enforce an expected checksum lock.

## Complete source retention

All **18,796 source task rows** and **56,933 source citation entries** are retained. These tasks describe 923 occupations in the source's O*NET 29.3 release. They are not a new collection of 18,796 independent robot trials. Repeated citations can refer to the same system, URL or demonstration across multiple tasks; 56,933 entries must not be described as 56,933 independent studies.

The source used Claude with web search to assess physical work, find relevant examples and judge their transfer to task instances. AFTERMATH labels each attached record as a **published AI-assisted research assessment, not an independently observed task trial**. It has not independently rerun every linked demonstration or verified every generated claim, maturity classification or autonomy assessment.

| Source classification | Task rows | Meaning of the published assessment |
| --- | ---: | --- |
| Nonphysical / no tier | 11,202 | Outside the source's final physical-task set |
| E0 | 2,419 | No cited system judged capable even in a purpose-built setting |
| E1 | 3,967 | Capability judged feasible in an environment arranged for robots |
| E2 | 1,103 | Capability judged feasible in a predictable facility used by people |
| E3 | 105 | Capability judged feasible in an unstructured setting |
| **Total** | **18,796** | **7,594 classified physical** |

These are unweighted row counts. The source derives a task tier from assessed task instances and their generated prevalence weights; a tier is not proof that every instance or exception is handled. E0 is an absence of qualifying evidence in that assessment, not proof of technological impossibility. The source definition also excludes fully teleoperated systems from autonomous robot capability.

## What the import keeps

Each task preserves its original statement and a stable identifier, `onet:{occupation code}:task:{task ID}`. Imported fields include the physical flag, exposure tier and assessment type; instance descriptions, capability/setting tiers and citation-number links; and every citation's system, developer, date, maturity, autonomy status, title, URL, claim and transfer justification.

The importer deliberately omits generated task time shares, generated instance prevalence weights, direct quotation fields and extended generated reasoning. It does not recompute the source's occupational exposure index. Therefore the resulting asset supports inspection of examples and source judgments, not reconstruction of every weighted statistic in the publication.

## Exact join to the current catalog

The current occupation catalog uses **O*NET 31.0**, while this research uses **29.3**. Matching identifiers alone can attach an old assessment to a changed task. The catalog builder therefore requires all three of:

1. The same O*NET occupation code.
2. The same O*NET task ID.
3. The same task statement after Unicode NFKC normalization, whitespace collapse, trimming and lowercasing.

There is no fuzzy wording match, title-only match or automatic transfer to ESCO/ISCO equivalents. All source rows remain in the source asset, even when they cannot join the current catalog. Editing a duty invalidates an attachment whose assessed wording no longer matches; task-specific evidence must not survive as if the changed duty had been assessed.

The current generated [catalog audit](CATALOG-AUDIT.json) records:

| Join result | Count |
| --- | ---: |
| Source task rows retained | 18,796 |
| Current O*NET tasks with exact matches | 18,678 |
| Matching IDs rejected because statements differ | 5 |
| Current O*NET tasks with no source ID match | 155 |
| Citation entries attached to matching current tasks | 56,432 |

The last three task counts sum to the current catalog's 18,838 task statements. Looking in the opposite direction, 118 source rows are not attached to a current task: five statement mismatches and 113 source IDs absent from the current task set. Their 501 citation entries remain in the source asset. This difference is a version-join limitation, not silently dropped source research. Regenerate the audit after changing either source; the audit is authoritative if a later reviewed release changes these counts.

## How the model may use this evidence

The physical flag and concrete instances provide context for mapping a duty to physical requirements. They can help distinguish manipulating real objects from operating software, and expose differences between a factory cell, a predictable facility and an uncontrolled environment. Any disagreement with another mapping rule must stay visible; an AI-assisted classification is not ground truth.

**No exposure tier, citation count, physical flag, maturity label or robot example is converted into a calendar year.** A laboratory demonstration does not measure commercial economics, rare-failure reliability, full workflow integration or all remaining job duties. These observations remain distinct from the independently elicited future milestone distributions in [MILESTONE-EVIDENCE.md](MILESTONE-EVIDENCE.md) and the bounded software measurements in [DIGITAL-CALIBRATION.md](DIGITAL-CALIBRATION.md).

## Reproduction

From the repository root, with Python 3 and Node.js available:

```sh
python3 scripts/import-robot-evidence.py
npm run build:catalog
```

The importer uses the Python standard library. It downloads the pinned public CSV only when it is absent from `work/model-revision/robot-evidence/`; subsequent runs use the cached file. It rejects duplicate composite task IDs and any source count other than 18,796 rows / 56,933 citation entries. The generated source asset and browser catalog chunks are committed; ordinary CI builds and site visitors do not fetch this dataset from its publisher. The audit exposes exact-join counts and statement mismatches rather than treating unmatched records as successful evidence coverage.
