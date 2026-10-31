# Catalog-wide audit

Reference date: October 31, 2026.

4,491 source records; 13,473 scenario calculations.

| Source | Records |
| --- | ---: |
| ONET | 1,016 |
| ESCO | 3,039 |
| ISCO | 436 |

- 86,438 imported required task/skill statements.
- 58,451 optional skills retained separately, not silently treated as universal requirements.
- 529 source records require a description or classification proxy.
- 38 published research references in the registry.
- 2682 profiles contain explicitly unmapped requirements.
- All input requirements retained in model output; no occupation is dropped.
- Every reference ID resolves; numeric estimates are finite integers; insufficiently supported profiles remain undated.
- Faster ≤ baseline ≤ slower wherever all three are dated; dated endpoints never precede a dated required capability.
- 18,678 tasks joined to published physical-work assessments with 56,432 cited references.
- 3,990 conditional numeric estimates; 501 profiles without a supported numeric estimate.
- 54 distinct central years. No random jitter or title-based offsets are added.
- Evidence status: 3943 partial, 47 conditional without a detected mapping gap, 501 undated. None is a validated occupational prediction.

## What this does not validate

These checks establish software consistency and source coverage, not accuracy of future dates. Whole-role full-automation outcomes are not available as a calibrated validation set. Overlapping source records are not unique jobs. Missing requirements, occupational variation, unobserved future discoveries, and economic adoption can materially change the outputs.
