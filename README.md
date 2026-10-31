# AFTERMATH

A cinematic, Terminator-inspired explorer of **full job automation**. Enter an occupation, confirm its tasks, and explore the discoveries and development required for the complete workflow to run autonomously.

This is a working browser prototype with original branding and artwork. It is not affiliated with the Terminator franchise. Its dates are **speculative scenarios based on authored assumptions**, not validated forecasts, source-derived predictions, or individual layoff estimates.

## What is implemented

- A responsive occupation scanner and a searchable-by-title starter catalog of 12 occupations and 49 tasks.
- Task editing, adding and removal, plus reference-location selection.
- A technology dependency model: some occupations use one discovery front, while others require several fronts to converge.
- Full-automation horizons for every selected workflow, including broad, open-ended assumptions for custom work.
- Accelerated, central, and conservative scenarios that change the modeled dates.
- Report sections for technology fronts, tasks, scenario assumptions, and evidence limits.
- A downloadable plain-text report containing the model assumptions and references.
- Keyboard-operable report tabs, a modal analysis flow, and reduced-motion styling.

There is no live AI service, evidence retrieval, database, account system, or custom-task classifier. Known titles resolve against local aliases. Unfamiliar or hybrid roles ask for their actual tasks; those tasks use a generic scenario until someone maps their requirements.

## Run locally

Requirements: Python 3 to serve the site. Node.js 20 or later is recommended for the checks and tests. No dependency installation or compilation is needed.

From this project directory:

```sh
npm start
```

Or run the equivalent server directly:

```sh
python3 -m http.server 4173 --directory dist
```

Open [http://localhost:4173](http://localhost:4173). Use a local server rather than opening `index.html` as a file, because the app uses JavaScript modules. Stop the server with Ctrl+C.

```sh
npm test
npm run check
```

The tests cover source IDs, title matching, generic custom scenarios, task selection, monotonic scenario changes, single-front versus multi-front dependencies, and the bottleneck calculation. Syntax checks validate the two JavaScript modules.

## Architecture

The deployable site is the `dist/` directory, which contains authored static files rather than generated build output:

| File | Responsibility |
| --- | --- |
| `dist/index.html` | Landing page, forms, and dialog containers |
| `dist/styles.css` | Responsive visual design, interaction states, and motion preferences |
| `dist/app.js` | Browser state, task editor, report views, scenario selection, and export |
| `dist/engine.js` | Occupations, task mapping, source metadata, assumptions, and pure report calculations |
| `dist/assets/` | Original visual assets and favicon |
| `engine.test.mjs` | Node-based model tests |
| `.openai/hosting.json` | Sites hosting identity and static-directory configuration |

`resolveRole(input)` returns a title match, a possible match requiring confirmation, or a request for task details. `buildReport({title, tasks, scenario, location})` creates the report without network access. Changing a known task's wording invalidates its original mapping; the edited task receives a generic scenario rather than silently retaining unrelated assumptions.

## How the speculative model works

The endpoint is the complete **selected task profile** operating autonomously, including exceptions. It is not the date at which all employers adopt the technology. Leaving out duties changes the scope of the result.

The named discovery fronts are software intelligence, robotic dexterity, physical perception and navigation, social interaction, and reliability and safety. Custom work receives an unclassified placeholder; its actual fronts remain to be researched.

Each known task has an authored baseline range in `horizonAssumptions` and a list of required fronts in `frontierMap`. A task depending on one front uses the full baseline range. For tasks depending on multiple fronts, `frontierDifficulty` applies explicit relative assumptions: software intelligence uses 0.65, physical navigation uses 0.85, and the other fronts use 1. These are modeling choices, not measured difficulty or probability estimates.

The model scales those ranges by the selected scenario, rounds them to whole years, and takes the longest requirement for each shared front. Fronts are assumed to develop in parallel. The complete workflow therefore uses:

```text
technical horizon = MAX(required technology-front horizons)
full automation horizon = technical horizon + integration allowance
calendar window = assessment year + full automation horizon
```

Minimum and maximum endpoints are computed separately. The model does **not** add all discovery timelines together. Its baseline integration allowance is 5–15 years, scaled by the same scenario multiplier.

| Scenario | Multiplier applied to task-front ranges and integration |
| --- | ---: |
| Accelerated | 0.55 |
| Central | 1.00 |
| Conservative | 1.75 |

Custom or edited tasks use a generic 20–100+ year technical baseline. With the central integration allowance, a wholly unclassified workflow receives a 25–115+ year horizon. The `+` means the upper end is open; it is not a maximum, confidence interval, or assurance that the necessary discoveries will occur.

The UI shows the basis of each calculation. Sources support occupational descriptions and general research context; **none validate these dates, multipliers, or difficulty factors**. The model currently assumes that discoveries eventually occur. It does not estimate the probability of success, correlations between discoveries, or the risk that a capability is never achieved.

Deployment conditions appear separately from technical discoveries: affordable operation, data and hardware access, permissions, liability arrangements, and acceptance. They are assumed satisfied for the scenario rather than independently dated. Selecting a non-U.S. location records context and displays a limitation; it does not currently change the calculation.

## Add or improve an occupation

1. Add a stable occupation ID, display title, aliases, sector, O*NET code, and task descriptions to `catalog` in `dist/engine.js`.
2. Check the occupational source and document what it actually supports. The existing helper links each task to its occupation source.
3. Add a `[minimumYears, maximumYears]` baseline for every task to `horizonAssumptions`, keeping the same task order.
4. Add the required front IDs for every task to `frontierMap`, again preserving order. Add a front definition and difficulty assumption if a new capability is needed.
5. Review the generated complete-automation calculation and verify that source references are not presented as evidence for the authored years.
6. Add an occupation icon in `dist/app.js` and include the ID in its `physical` set if it belongs in the physical/on-site filter.
7. Update catalog-count expectations in the tests and run both test and syntax-check commands.

Task IDs currently include their position in the occupation. Preserve order when possible; a production catalog should use permanent semantic task IDs and explicit data migrations.

## Privacy

Job titles, descriptions, edited tasks, and reports are held in JavaScript memory in the browser. The application does not transmit those inputs to an AI service or application backend and does not use cookies, local storage, or a database for them. Refreshing the page clears the active analysis; closing just the analysis dialog does not erase its in-memory state.

The hosting provider may process ordinary access logs. Google Fonts receives font-loading requests. Clicking a reference opens an external website, and downloaded reports remain in the location selected by the browser. Self-host the fonts if third-party font requests are undesirable.

## Reference foundations

- [O*NET OnLine](https://www.onetonline.org/): the engine links directly to the profile for each supported occupation. These profiles ground the condensed task descriptions.
- [ILO: Generative AI and jobs, a 2025 update](https://www.ilo.org/publications/generative-ai-and-jobs-2025-update), published 20 May 2025: background on task-level exposure research.
- [BLS: Employment Projections FAQs](https://www.bls.gov/emp/frequently-asked-questions.htm): context on uncertainty and the distinction between exposure and employment projections.

The source registry records review dates and explains the limits of each reference. These are static references, not a live evidence feed.

## Next development steps

- Replace the generic custom-task placeholder with a reviewed resolver that maps actual work to explicit capability requirements, including hybrid roles.
- Add permitted evidence retrieval with dated snapshots, geographic scope, claim-level provenance, and explicit separation between observed capability and hypothetical development.
- Research and calibrate discovery assumptions instead of treating the current hand-authored ranges as empirical estimates.
- Model dependencies between fronts, integration complexity, possible stalled progress, and alternatives to the parallel-development assumption.
- Separate technical feasibility, economic deployment, and widespread adoption into independently documented scenarios.
- Add expert review, retrospective evaluation, and versioned reports before making claims about forecast accuracy.
- Expand occupation coverage, international evidence, and language handling with representative tests.

These capabilities are planned work; they are not implemented in this release.
