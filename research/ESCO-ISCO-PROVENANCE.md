# ESCO and ISCO catalogue provenance

This service uses the ESCO classification of the European Commission.

The catalogue is an English selection and JSON restructuring of the source data. It is not an official European Commission or International Labour Organization product, and the agencies do not supply or endorse AFTERMATH automation dates.

## Complete source coverage

- **ESCO 1.2.1**, released 10 December 2025: every one of the 3,039 released occupation concepts returned by the official version-pinned API. English preferred labels, all English alternative labels, descriptions, scope notes, all essential skill/knowledge relationships, all optional skill/knowledge relationships, classification codes, stable concept URIs and ISCO mappings are retained. Other languages and obsolete concepts are outside this English release's scope.
- **ISCO-08**: all 436 unit-group codes and titles, including armed forces groups with leading-zero codes. These are broad occupational categories, not 436 extra distinct jobs. The 10 major-group labels identify their sectors. Exact ISCO mappings link each group to its child ESCO records; a category is not merged with one arbitrarily selected job.

The downloaded releases predate the research cutoff of 30 October 2026. The retrieval timestamp may be 31 October in UTC while the local work date is 30 October in America/Los_Angeles.

Verified import totals:

| Measure | Count |
| --- | ---: |
| Released ESCO occupation concepts | 3,039 / 3,039 |
| English alternative occupation labels | 30,387 |
| Essential skill/knowledge relationships | 67,600 |
| Optional skill/knowledge relationships | 58,451 |
| Distinct referenced skill concepts | 13,475 |
| Occupations missing an English description | 0 |
| Occupations without essential relationships | 0 |
| Relationship links with unspecified source skill type | 59 |
| ISCO-08 unit groups | 436 / 436 |
| ISCO unit groups with mapped ESCO occupations | 426 |
| Source occupation/group records omitted | 0 |

Ten ISCO groups have no child occupation in this ESCO release: 1113, 2240, 3221, 4414, 6310, 6320, 6330, 6340, 7549 and 9624. They remain present as classification-only records; no ESCO link or duty is invented for them.

## Official sources

1. [ESCO download page](https://esco.ec.europa.eu/en/use-esco/download), identifying the published release, and the [official version history](https://esco.ec.europa.eu/en/about-esco/escopedia/escopedia/esco-versions), confirming the December 2025 release of 1.2.1. The site's version footer gives its update date as 10 December 2025.
2. [ESCO public API overview](https://esco.ec.europa.eu/en/use-esco/use-esco-services-api) and [API documentation](https://ec.europa.eu/esco/api/doc/esco_api_doc.html).
3. [Version-pinned first catalogue page](https://ec.europa.eu/esco/api/search?type=occupation&language=en&limit=100&offset=0&full=true&selectedVersion=v1.2.1). The importer requests pages 0–30; `offset` is the page index, not a row number. It checks each page's count, offset and global total, then verifies 3,039 unique occupation URIs. The API accepted v1.2.1 and rejected an invalid version during verification. Generated navigation links omit the selected version, so the importer constructs and pins every request explicitly.
4. [ILO ISCO classification page](https://ilostat.ilo.org/methods/concepts-and-definitions/classification-occupation/) and its [official English structure and definitions workbook](https://www.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Structure%20and%20definitions.xlsx). The importer selects level 4, preserves four-digit codes and validates 436 unique groups.

No credentials, private endpoints or registration bypass were used. The ESCO catalogue was obtained through the Commission's documented public API. The raw API responses and ILO workbook remain in the local `work/esco/` cache; published JSON includes raw-input SHA-256 digests and a canonical-payload SHA-256 digest.

## Meaning of the requirements

`esco.json` uses `tasks` as the application's common requirement container. **These entries are ESCO essential skill and knowledge proxies, not literal occupation task statements.** Each has `type: essential-skill` and a `skillType` distinguishing a skill/competence from knowledge. They indicate capabilities associated with an occupation; they do not measure frequency, importance, duration, universal necessity in each workplace, observed automation, or a research-backed automation year.

All optional links are retained separately in `optionalSkills` with `type: optional-skill`. They must not be silently treated as mandatory for every instance of a job. The importer does not truncate the essential or optional lists. Repeated relationships across different occupations are expected; a unique skill ID is not a unique duty.

A small number of source relationship links do not supply `skillType`. These are retained with `skillType: unspecified`, rather than guessed or omitted, and their count is in the metadata. The occupation import includes all linked skill identifiers and labels; it does not claim to import the separate, entire skill-concept hierarchy or skill descriptions.

`isco.json` uses `coverage: classification`, empty descriptions and empty task lists. `relatedEscoIds` supplies exact classification links for selecting or studying narrower occupations. It is **not** an instruction to assume that every member of an ISCO category must perform all skills of all its child occupations.

## Rights and deliberate omissions

[ESCO's reuse FAQ](https://esco.ec.europa.eu/en/about-esco/faq?page=1) permits download, reproduction and reuse of the classification under Commission Decision 2011/833/EU, with acknowledgement and identification of adaptations. The required service acknowledgement appears above and in the JSON metadata. The application must keep it visible in its data/source acknowledgements. The EUPL mentioned on the API page applies to API software, and is not used here as the data's licence.

The [ESCO skills copyright notice](https://esco.ec.europa.eu/uk/node/456) additionally describes upstream skill-hierarchy material from O*NET and Canada's Skills and Knowledge Checklist. This import uses occupation-to-skill links and their source labels; it does not redistribute the skill hierarchy. Preserve all source attributions when expanding that scope.

The [ILO rights policy](https://www.ilo.org/rights-and-permissions) says that data and metadata produced before 3 May 2023 do not automatically receive its newer CC BY 4.0 licence. The ISCO workbook derives from older ISCO-08 materials. Therefore the published import retains the complete factual short-code/title catalogue and links to the original, but **does not redistribute the workbook's original definition, task, example or explanatory prose**. It does not claim that these older materials are CC BY. No permissions request has been sent on the user's behalf.

Consequently, ISCO definition/task coverage is a disclosed limitation, not a missing occupational code and not permission to fabricate source duties. The raw old prose is not included in published assets. ESCO's descriptions and skill links provide finer-grained source coverage for mapped occupations under the Commission's reuse terms. Source occupation coverage does not mean every possible colloquial job name or every future occupation has an independent source entry.

## Reproduction and validation

Run `python3 scripts/import-esco.py` from the repository root. Python's standard library is sufficient. The importer caches completed raw responses, retries transient failures, limits concurrent downloads, checks counts and uniqueness, validates every ESCO ISCO code against the official 436-group set, preserves all source relationships and fails on duplicate skill links. A rerun uses the cache; removing the cache causes a new official download.

The output paths are `dist/data/esco.json` and `dist/data/isco.json`. Exact final counts, per-page input hashes and retrieval time are recorded in their `metadata` fields. The `metadata.sha256` hashes the `roles` list serialized as compact UTF-8 JSON with sorted object keys; it intentionally excludes metadata to avoid a self-referential digest.

Forecasts are a separate modeling layer. Nothing in ESCO or ISCO validates a forecast year, a narrow uncertainty range, or an assertion that undiscovered capabilities have a known completion date.
