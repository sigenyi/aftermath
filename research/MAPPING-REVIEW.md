# Requirement-mapping review — 31 October 2026

## Finding

The previous model assigned physical capabilities to several wholly digital task statements. This was a mapping defect, not evidence that software work needs robotic hands. The errors originated in shared lexical rules and in treating measurements of human workers as requirements for the eventual automated system.

The review covers the current 4,491 source records: 1,016 O*NET occupations, 3,039 ESCO occupations and 436 ISCO unit groups. Their prepared profiles contain 86,967 requirements, comprising 86,438 imported task/essential-skill links and 529 description or classification proxies. Source records overlap; this is not a count of unique worldwide jobs.

## Systemic causes corrected

| Defect | Example | Revised interpretation |
| --- | --- | --- |
| Unbounded verb prefixes | `digital` matched `dig`; `data-driven` matched `drive` | Physical verbs require valid word forms and a physical action/object relationship. |
| Noun/action confusion | Security measures, load measurements, installation plans | Mentioning an action or measurement does not establish execution of that action. |
| Ambiguous tools and engines | Authoring tools, search engines, virtual objects, physical data models | These phrases retain their computational meanings. |
| Distant object matching | Describing operating systems and hardware specifications | A physical noun elsewhere in the sentence cannot turn documentation into manipulation. |
| Abstract objects | Adjusting journal entries; adjusting routes | Account information and plans remain information work. |
| Supervision conflated with execution | Training workers to repair equipment | Oversight alone does not establish the trainer personally manipulating equipment. |
| Human interface conflated with required robot | Operating a computer, radio or GPS interface | Interface use can be automated digitally; hands are not assumed necessary. |
| Machine operation conflated with adaptive hands | Operating physical machinery | Physical actuation may require autonomous equipment; adaptable hands require separate manipulation evidence. |
| Human motor rating treated as machine architecture | Finger dexterity and time spent using hands | Role ratings supplement an already supported physical task; they cannot create a robot requirement alone. |
| Originality treated as artistic production | Idea generation in analytical or technical work | The rating strengthens general reasoning unless an expressive-output requirement is independently present. |
| Other noun-prefix collisions | Servers/serving, information/informing, authorities/authoring, reference/referral | Valid word forms and action context preserve the actual meaning. |
| Own learning confused with teaching | Continuing professional education | Updating one’s own knowledge is distinguished from instructing other people. |
| Regulatory codes confused with software | Building, safety, tax and local codes | Regulatory work remains reasoning or inspection; a software requirement needs computational context. |
| Classification or knowledge treated as execution | Broad ISCO group; ESCO mechanical knowledge | Classification is not a task inventory. Knowledge labels remain knowledge proxies. |
| Everyday language treated as an undiscovered breakthrough | Renewing domain registrations, constructive feedback, transactions, accountability | Ordinary requirements receive explicit semantic mappings. Unclear wording remains an information gap. |

The implementation contains no title-specific forecast dates or allowlist of occupations exempted from robotics. The same action/object rules apply to all profiles and to custom requirements. Tests name occupations only to provide reproducible regression cases.

## Source meaning

O*NET describes requirements and working conditions of human workers. Its [hand-use work-context descriptor](https://www.onetonline.org/find/descriptor/result/4.C.2.d.1.g) measures how much time workers use their hands. It does not prescribe the physical architecture an automated system must use. The [finger-dexterity descriptor](https://www.onetonline.org/find/descriptor/result/1.A.2.a.3) and [manual-dexterity descriptor](https://www.onetonline.org/find/descriptor/result/1.A.2.a.2) likewise describe human abilities. Requiring separate task-effect evidence before applying these ratings is an explicit modeling interpretation, not an O*NET automation claim.

The [Originality descriptor](https://www.onetonline.org/find/descriptor/result/1.A.1.b.2) includes producing ideas and solving problems. It does not establish that the occupation produces art or literature. Routine technical writing is treated as information work; expressive writing and visual/artistic production retain their own mapping.

The [official Web Developers profile](https://www.onetonline.org/link/summary/15-1254.00) supplies the source requirements. Its current imported task profile is about software, website infrastructure and related information work. Conversely, [Data Entry Keyers](https://www.onetonline.org/link/details/43-9021.00) include a real source duty involving physical media. The revised mapping preserves that duty; it does not remove physical work merely because an occupation usually involves computers.

O*NET 31.0 Database data are used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), with attribution to the U.S. Department of Labor/Employment and Training Administration. AFTERMATH adds independent mapping interpretations. USDOL/ETA has not approved, endorsed or tested them. O*NET is a trademark of USDOL/ETA. ESCO skill/knowledge types and source links are preserved; see [ESCO/ISCO provenance](ESCO-ISCO-PROVENANCE.md).

## Module contract

`dist/mapping.js` exports:

- `mapTask(task, index, occupation)`: returns the source-preserving `original`, a `matches` Map of capability demands, and `details` documenting the mapping basis. Physical assignments have an `explicit physical effect` basis and `physicalEvidence: true`.
- `occupationConstraints(occupation, mapped)`: returns accepted `constraints`, the number of available structured source features, and `suppressedConstraints` explaining why an observed human rating was not imposed on the automated system.

O*NET LV ratings are normalized from 0–7; CX ratings from 1–5. All 18 feature IDs, descriptor meanings and scale endpoints were checked against the pinned source metadata. A suppressed rating remains in the source record; suppression is a modeling decision, not deletion or alteration of source data.

Optional source-backed `task.automationEvidence` records are read only while `sourceId` remains present. A physical/nonphysical research assessment does not override an explicit contradictory effect silently: the mapping records a disagreement. A `physical: true` label does not automatically imply robotic hands. Task editing must invalidate the source match. Published model-generated task classifications are research assessments, not observations of complete occupational autonomy.

`unknown` means the wording is insufficient to establish a capability requirement. It does **not** mean a scientific discovery is required and must not be assigned an arbitrary distant completion year. Horizon calculation belongs to the separate forecast module.

## Verification and counts

`node --test mapping.test.mjs` passes thirteen test groups, including contrasting digital/physical sentences, complete reviewed occupation profiles, source-feature gating, creative/social/learning/code disambiguation, knowledge/proxy handling, provenance preservation, task-evidence disagreement handling, and a structural scan of every prepared source requirement.

The pre-revision snapshot compared below is the mapper present when this review began. Later horizon changes do not affect these counts.

| Measure | Previous mapping | Revised mapping |
| --- | ---: | ---: |
| Source records | 4,491 | 4,491 |
| Prepared requirements | 86,967 | 86,967 |
| Profiles with physical capability assignments | 3,451 | 2,385 |
| Requirements with physical assignments | 16,513 | 10,292 |
| Requirements with unresolved wording | 6,906 | 5,770 |
| Profiles containing unresolved wording | 2,893 | 2,682 |

An additional 271 source-rating candidates are explicitly suppressed because supporting physical task effects are absent. These counts describe changed model behavior, **not measured classification accuracy**. In particular, fewer physical assignments is not intrinsically better; missed physical tasks also matter. This comparison uses the raw occupation profiles, before joining external task-assessment records.

The reviewed digital/analytical regression profiles are Web Developers, Web and Digital Interface Designers, Software Developers, Data Scientists, and Accountants and Auditors. They have no unsupported physical assignments under the revised mapping. Positive controls include Registered Nurses, Electricians, Heavy and Tractor-Trailer Truck Drivers, Robotics Engineers, and the physical-media duty in Data Entry Keyers. Mixed statements about repairing hardware and configuring software retain both kinds of work.

A second inspection of the joined research instances identified under-mapped explicit effects: measuring solar sites with surveying instruments, setting mechanical clearances, executing surgical techniques and transplants, clinical examinations, inspecting cargo and trailers, vehicle maintenance and auxiliary power operation. Regression cases now cover these. Broad surgical research or diagnostic duties can describe office analysis as well as hands-on cases, so those source disagreements remain visible instead of automatically forcing manipulation. Supervising or teaching a physical procedure still does not itself establish physical execution. Collecting fuel-consumption data and inspecting cargo records remain information work.

Final browser-driven review also removed false creative requirements from authoring tools and generic Originality ratings, false interpersonal requirements from technical nouns, and false software requirements from regulatory codes. The increase in unresolved labels relative to intermediate audits is disclosed: a removed false positive is not automatically replaced with an unsupported capability or deadline.

## Remaining limitations

This is a deterministic, inspectable English rule system, not an expert adjudication of every task or a validated natural-language model. Narrow context, omitted objects, metaphor, negation, unusual technical language and employer variation can still produce false positives or false negatives. Source descriptions can disambiguate a narrow computational requirement but cannot fill in every missing duty. The unresolved requirements remain visible; the implementation does not claim exhaustive mapping or invent undiscovered technology to cover missing information.

These tests establish regression behavior, provenance and structural coverage. They do not establish the accuracy of any forecast year, robotic research maturity assessment, or confidence interval.
