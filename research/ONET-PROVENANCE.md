# O*NET® import provenance and coverage

## Edition and source

- Imported edition: **O*NET® 31.0 Database**, released **August 2026**.
- Reference date: **October 30, 2026**, America/Los_Angeles. This edition predates the reference date.
- [Official database](https://www.onetcenter.org/database.html).
- [Official release archive, including the August 2026 release date](https://www.onetcenter.org/db_releases.html).
- Taxonomy: O*NET-SOC 2019, based on the 2018 Standard Occupational Classification.
- Source files are the official versioned CSV downloads; no scraped profiles or third-party mirrors were used.

## License and attribution

This project includes information from the O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA), used under CC BY 4.0. O*NET® is a trademark of USDOL/ETA. AFTERMATH has restructured the data, combined aliases, selected scalar ratings, and added independent model interpretations. USDOL/ETA has not approved, endorsed, or tested these modifications.

[CC BY 4.0 license](https://creativecommons.org/licenses/by/4.0/) · [Official database license](https://www.onetcenter.org/license_db.html)

## Exact imported coverage

| Measure | Count |
|---|---:|
| occupations | 1,016 |
| withTasks | 923 |
| descriptionOnly | 93 |
| taskStatements | 18,838 |
| aliases | 58,573 |
| withNumericFeatures | 911 |
| numericFeatures | 338,665 |
| featureDefinitions | 379 |
| emergingTaskProposals | 338 |
| majorSocGroups | 23 |

The 1,016 occupation classification records are all retained. The 923 records with task data retain **every one of the 18,838 official Task Statements**. The 93 records without tasks remain searchable but are explicitly marked `coverage: "description"`; no tasks or evidence are fabricated for them. Many of these are “All Other” residual categories and military classifications.

Aliases combine every source Job Title, every nonempty Short Title, and every Sample of Reported Title. Case-insensitive duplicates and the canonical display title are removed. The 58,573 retained aliases are labels, **not additional distinct occupations**.

The 338 Emerging Tasks are retained separately as `emergingTasks`, with their source status and date. They are proposals for future data collection, and are not silently merged into established task evidence.

## Numerical features

For abilities, essential skills, transferable skills, knowledge, work activities, and work context, all non-suppressed scalar records are retained. Keys combine the original Element ID and Scale ID, such as `1.A.2.a.2:LV` (Manual Dexterity, level) and `4.C.3.a.1:CX` (Consequence of Error). Every key has a label, description, domain, and scale endpoints in `metadata.featureDefinitions`.

- `IM`: importance, source scale 1–5.
- `LV`: level, source scale 0–7.
- `CX`: context, source scale 1–5.
- `CT`: category value for work schedules/typical work week, source scale 1–3; **not a generic difficulty score**.
- Task importance and relevance are linked where an unsuppressed, category-free source rating exists.
- Rows recommended for suppression are excluded from `features`; category-distribution rows are excluded because they are not independent scalar requirements.
- Raw rating dates are retained by domain in each role’s `ratingDates`. A 2026 database release does not imply every survey was conducted in 2026.

The ratings are occupational requirements and working conditions. They are **not automation probabilities, exposure scores, or dates**. Source confidence intervals concern the occupational survey measurements, not the AFTERMATH forecasting model.

Excluded scalar/distribution row counts are recorded in `metadata.excludedRatingRows`; complete source CSVs remain in the ignored local cache for audit.

## Reproduce

From the repository root:

```sh
python3 scripts/import-onet.py
# Rebuild from already downloaded, verified input:
python3 scripts/import-onet.py --offline
# Re-download the pinned source edition:
python3 scripts/import-onet.py --refresh
```

The script uses only Python’s standard library. It caches source files in `work/onet/raw/`, emits `dist/data/onet.json`, validates pinned source SHA-256 checksums and expected occupation/task counts, rejects duplicate task IDs and scalar-rating keys, and validates feature definitions. A changed upstream checksum requires review before updating the lock.

## Source file manifest

| Official CSV | Rows | SHA-256 |
|---|---:|---|
| [occupation_data.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/occupation_data.csv) | 1,016 | `a09eae1d6609686e44e05b7290993a1c8b523d8ca224bc0eedc194c855c3ee02` |
| [job_titles.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/job_titles.csv) | 54,269 | `75a3b46d6edc5996117c10c9ed488c9a06f7495d02969e9d12873ab14a21540c` |
| [sample_of_reported_titles.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/sample_of_reported_titles.csv) | 8,189 | `5d76040b7b0602ea217660648f8363e7980edd1870f96574a2eeaa6a822d2666` |
| [task_statements.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/task_statements.csv) | 18,838 | `4568e14d8db6f05551ad37e056e909b13ebae4a26bcb5ff915bb5f281d582c57` |
| [task_ratings.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/task_ratings.csv) | 165,780 | `52ee4ad320f1ca3c3865795aefc7393d422a9bfbfea3a5b5d9eaf2928c10eafe` |
| [abilities.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/abilities.csv) | 94,640 | `7e9cd79791ce6014e1d26d0a449ae5b1e7aa7ef52d39b3934c3bb8d438104b88` |
| [essential_skills.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/essential_skills.csv) | 18,200 | `68c4d31d8c55077238395dca40cc4e6d32e6a608b5474bb8264b1f98ae415bd7` |
| [transferable_skills.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/transferable_skills.csv) | 45,500 | `f17d0419e818a3bf2f55076510c76c4aef01cc8f5aee2670d2f44f6f44ac60f7` |
| [work_activities.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/work_activities.csv) | 74,702 | `6c266205b2926c0c854a7a577aae29fe492c71bb0df7e197adca830b58fe4ea1` |
| [work_context.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/work_context.csv) | 305,389 | `599f6bff23cbc3e7d8915e25c0167324b1e00c4117bcbcd9a0c754fe47cb4fd7` |
| [knowledge.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/knowledge.csv) | 60,060 | `88092e17d16096cdebe292fee4389deb460edda24ae8b4637212c69c71562f55` |
| [content_model_reference.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/content_model_reference.csv) | 3,006 | `370033744006dbd5df048431d42a402f6741a00a229b6d0f4e4f4249b6399c04` |
| [scales_reference.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/scales_reference.csv) | 33 | `bcba23858ce21ecaacbde303a8993e35d46724b4afb8c9ec2b10e04f42adcfc9` |
| [job_zones.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/job_zones.csv) | 923 | `093f01891ac2e602a8cc6c859ecb619b5bc00eb50cd3f3c1134c05b704481944` |
| [emerging_tasks.csv](https://www.onetcenter.org/dl_files/database/db_31_0_csv/emerging_tasks.csv) | 338 | `7b7f304c456617083150cb7b09eb2be885dc11351fce1dbcc33bf0839d6dbfac` |

## Known boundaries

- U.S.-focused classification; not a census of every possible job in every country.
- All occupations in this official release are represented, including records with sparse or absent survey detail.
- O*NET occupations overlap with ESCO concepts and ISCO groups. Adding catalog counts does not yield a count of unique worldwide jobs.
- Occupation/task source data supports the description of work. Forecast years come from a separately documented model.
- Forecasting adaptations are not approved or validated by USDOL/ETA.
