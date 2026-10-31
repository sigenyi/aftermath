# AFTERMATH

A cinematic, Terminator-inspired explorer of **full job automation**. A dark, full-screen scene and one search bar lead directly to an occupation’s possible automation timeline.

This is a working browser prototype with original branding and a generated photorealistic endoskeleton image. It is not affiliated with the Terminator franchise. Its dates are **speculative scenarios based on authored assumptions**, not validated forecasts, source-derived predictions, or individual layoff estimates.

## What is implemented

- A simplified cinematic homepage with one search field and the locally served `dist/assets/endoskeleton-cinema.webp` backdrop.
- Live occupation suggestions as you type, matching titles and aliases from a starter catalog of 12 occupations and 49 tasks.
- An accessible combobox: arrow-key navigation, Enter to choose, Escape to dismiss, visible focus, and screen-reader announcements. Suggestions adapt to available viewport space.
- Immediate results for a known occupation. There is no mandatory task-confirmation step.
- Optional task editing, adding, and removal. Unfamiliar or hybrid roles ask for their actual tasks before showing a broad estimate.
- A technology dependency model: some occupations use one discovery front, while others require several fronts to converge.
- Full-automation horizons for every selected workflow, including broad, open-ended assumptions for custom work.
- Three scenario controls labeled **Faster**, **Baseline**, and **Slower**.
- Two result tabs—**What needs to happen** and **The tasks**—with **Sources & assumptions** collapsed until requested.
- A downloadable plain-text report, an optional **How it works** dialog, and reduced-motion support.

There is no live AI service, evidence retrieval, database, account system, location selector, or custom-task classifier. Known titles resolve against local aliases. Unknown work uses a generic scenario until someone maps its requirements. The generated artwork is a static project asset; viewing or using the website does not call an image-generation service.

## Hosting

The public site is deployed from this repository to GitHub Pages: https://sigenyi.github.io/aftermath/

Pushing to `main` runs the syntax checks, model tests, and search tests, then publishes only `dist/`. The website has no OpenAI runtime, authentication, API, or hosting dependency. The previous Sites configuration has been removed from this checkout; removal of the old hosted project is a separate provider-side operation.

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

The model tests cover source IDs, title matching, generic custom scenarios, task selection, Unicode-safe deduplication, monotonic scenario changes, single-front versus multi-front dependencies, and the bottleneck calculation. `search.test.mjs` covers autocomplete prefixes, aliases, normalization, result limits, uniqueness, and unknown inputs. Syntax checks validate all three JavaScript modules.

Run just the autocomplete tests with `node --test search.test.mjs`.

## Architecture

The deployable site is the `dist/` directory, which contains authored static files rather than generated build output:

| File | Responsibility |
| --- | --- |
| `dist/index.html` | Single-screen search experience and dialog containers |
| `dist/styles.css` | Responsive visual design, interaction states, and motion preferences |
| `dist/app.js` | Accessible autocomplete, browser state, task editor, report views, scenario selection, and export |
| `dist/search.js` | Pure title/alias ranking and exact-match checks for suggestions |
| `dist/engine.js` | Occupations, task mapping, source metadata, assumptions, and pure report calculations |
| `dist/assets/endoskeleton-cinema.webp` | Generated photorealistic cinematic backdrop, served locally |
| `dist/assets/favicon.svg` | Site favicon |
| `engine.test.mjs` | Node-based model tests |
| `search.test.mjs` | Node-based autocomplete tests |
| `.github/workflows/pages.yml` | GitHub Pages deployment from the repository |

`searchOccupations(query)` ranks catalog titles and aliases, preferring exact and prefix matches. The UI presents up to six choices, including a custom-work option when appropriate. Selecting a known occupation or submitting an exact title opens its report immediately. Other input opens the task editor instead of forcing a catalog match.

`resolveRole(input)` and `buildReport({title, tasks, scenario, location})` run without network access. The current UI uses U.S. task references and does not offer location selection. Changing a known task’s wording invalidates its original mapping; the edited task receives a generic scenario rather than silently retaining unrelated assumptions.

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
| Faster (accelerated) | 0.55 |
| Baseline (central) | 1.00 |
| Slower (conservative) | 1.75 |

Custom or edited tasks use a generic 20–100+ year technical baseline. With the central integration allowance, a wholly unclassified workflow receives a 25–115+ year horizon. The `+` means the upper end is open; it is not a maximum, confidence interval, or assurance that the necessary discoveries will occur.

The result keeps a short uncertainty note beside the dates and puts further explanation in the collapsed **Sources & assumptions** section. The complete numeric assumptions remain visible in `dist/engine.js`. Sources support occupational descriptions and general research context; **none validate these dates, multipliers, or difficulty factors**. The model currently assumes that discoveries eventually occur. It does not estimate the probability of success, correlations between discoveries, or the risk that a capability is never achieved.

Deployment conditions—affordable operation, data and hardware access, permissions, liability arrangements, and acceptance—are assumed satisfied rather than independently dated. The current interface uses U.S. references throughout. The engine retains a location parameter for future development, but changing it does not adjust the modeled dates.

## Add or improve an occupation

1. Add a stable occupation ID, display title, aliases, sector, O*NET code, and task descriptions to `catalog` in `dist/engine.js`.
2. Check the occupational source and document what it actually supports. The existing helper links each task to its occupation source.
3. Add a `[minimumYears, maximumYears]` baseline for every task to `horizonAssumptions`, keeping the same task order.
4. Add the required front IDs for every task to `frontierMap`, again preserving order. Add a front definition and difficulty assumption if a new capability is needed.
5. Review the generated complete-automation calculation and verify that source references are not presented as evidence for the authored years.
6. Include useful everyday aliases. The autocomplete reads the catalog directly; no separate card, icon, or filter entry is needed.
7. Update catalog-count expectations and add representative search tests, then run both test and syntax-check commands.

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
