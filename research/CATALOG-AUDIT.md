# Catalog-wide audit

Reference date: October 30, 2026.

4,491 source records; 13,473 scenario calculations.

| Source | Records |
| --- | ---: |
| ONET | 1,016 |
| ESCO | 3,039 |
| ISCO | 436 |

- 86,438 imported required task/skill statements.
- 58,451 optional skills retained separately, not silently treated as universal requirements.
- 529 source records require a description or classification proxy.
- 32 published research references in the registry.
- 2893 profiles contain explicitly unmapped requirements.
- All input requirements retained in model output; no occupation is dropped.
- Every reference ID resolves; all baseline years are finite integers.
- Faster ≤ baseline ≤ slower for every profile; endpoint never precedes a required capability.

## What this does not validate

These checks establish software consistency and source coverage, not accuracy of future dates. Whole-role full-automation outcomes are not available as a calibrated validation set. Overlapping source records are not unique jobs. Missing requirements, occupational variation, unobserved future discoveries, and economic adoption can materially change the outputs.
