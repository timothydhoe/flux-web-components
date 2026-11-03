# Timothy - Claude Code configuration (Flux Web Components)

Flux Web Components v2: a Lit-based component library (TypeScript, Cypress, Storybook, design tokens, npm scope `@domg-wc`). My work here is the data-visualisation library(`libs/data-visualisation`). Chart terms: `ai/profiles/timothy/GLOSSARY.md`.

Before writing or changing a component, read an existing sibling of the same type.

## Roles

- The user writes production code and config, and runs install, commit and push.
- You write tests (`*.cy.ts` for components, `*.spec.ts` for plain logic) and fixtures, run them, and report the output.
- For any other file, propose the change instead of making it:
    - Read the file first. Show its path and only the changed lines.
    - Give the reason in one or two lines, with a link to official documentation or the Flux source.
    - End with the command that checks it and the output to expect.
    - Put unrelated problems you notice under a separate "Noticed" heading.


## Data visualisation

- Lives in `libs/data-visualisation/`, structured like `libs/map/`.
- Components: `vl-data-figure` (the frame around a chart), `vl-chart-line`, `vl-chart-bar`.
- Unit and source come from the data (`meta`), not from attributes. Without them the chart shows its error state and warns in the console.
- Five data states: data, partial, empty, error, loading. The furniture stays in place; only the visual changes
- A gap breaks the line, is never interpolated, and is named in text.
- The main message never depends on interaction; every visual has a table alternative.
- Opinionated about form, not about the message: show and explain the data, never tell the reader what to conclude. Explanation text is neutral.
- Charts receive prepared data and only format and draw it; statistics are computed server-side.
- Plotly.js renders. The value axis starts at 0 for every chart type. No zoom.
- The look comes from the spec: colours from `colors.json`, spacing and type from design tokens. A component never sets its own colour or font.
- Series are told apart by direct labels as well as colour; lines reach 3:1 contrast against the background (WCAG 2.2 AA).
- Text the reader sees is Dutch; numbers use `nl-BE` formatting with the unit after a non-breaking space.

## Component patterns

Components extend base classes from `@domg-wc/common`, not `LitElement` directly:

- **BaseLitElement**: see `libs/components/src/atom/button/vl-button.component.ts`
- **Defaults pattern**: see `libs/components/src/atom/button/vl-button.defaults.ts`

- Register with `@webComponent()` from `@domg-wc/common`, not Lit's `@customElement()`.
- Use Lit decorators (`@property`, `@state`, `@query`) where possible.
- Custom events are prefixed `vl-` and dispatched with `bubbles: true, composed: true`.
- Shadow DOM always. Styles as css-in-ts in `vl-name.flux-css.ts`, see `libs/components/src/block/progress-bar/vl-progress-bar.flux-css.ts`.
- Colours and spacing are CSS custom properties (`var(--vl-…)`), never raw values.
- Shared drawing lives in `VlChart` as a Template Method: `#draw()` is fixed; chart types fill hooks under `// --- hooks for chart types` (required hooks are `abstract`, optional ones have a default).
- A reactive controller (`*.controller.ts`) only when it needs Lit's lifecycle; otherwise a plain class.
- Every visual reports its data state with the event `vl-data-change`; event details are typed as `<Subject><Verb>EventDetail`.
- CSS classes inside the shadow DOM are plain kebab-case: no `vl-` prefix, no BEM.

## Code style

- Data state is a discriminated union on `status`: `data`, `partial`, `empty`, `error`, `loading`.
- `render()` only arranges markup; derived values come from named getters or methods.
- Group class members under `// --- attributes`, `// --- properties`, `// --- states and fields`;
  internals are `#private`.
- Comments are in Dutch and explain why, with a source link when a platform quirk drives the code.

## Naming
| Item           | Pattern                                                                   |
|----------------|---------------------------------------------------------------------------|
| Tag            | `vl-chart-line` (kebab-case, `vl-` prefix)                                |
| Class          | `VlChartLine` or `VlChartLineComponent`                                   |
| Component file | `vl-chart-line.component.ts`                                              |
| Defaults       | `vl-chart-line.defaults.ts`                                               |
| Styles         | `vl-chart-line.flux-css.ts`                                               |
| Tests          | `vl-chart-line.component.cy.ts`                                           |
| Stories        | `stories/vl-chart-line.stories.ts`, `.stories-arg.ts`, `.stories-doc.mdx` |

File naming follows the table above (`.component.ts`), not `libs/map/`.

- Identifiers are English and read as a sentence in domain terms: `averageOverMeasurementPeriod`, `#openTooltipAt(point)`. Long names are fine, abbreviations are not.
- Methods are verbs (`build…`, `render…`, `load…`); values are nouns.
- Booleans in code ask a question: `isStale`, `hasCoverage`.
- Boolean attributes are on when present. Use `hide-`/`disable-` to switch off a default; never `is-`/`has-`.
- Constants carry their meaning: `STALE_AFTER_MINUTES`, not `TIMEOUT`.
- A name says what something is, not where it sits (`controls`, not `toolbar`).
- Event details are named `<Subject><Verb>EventDetail`.


## Tests

Components get Cypress component tests (`*.component.cy.ts`). Plain logic such as input adapters, number formats and scales gets Jest (`*.spec.ts`), next to the file it tests.

- Test names are English and start with "should". Test rendered output, not internal methods.
- Use fixtures from `apps/storybook-e2e/src/fixtures`.
- Accessibility: `cy.injectAxe()` + `cy.checkA11y('vl-chart-line')`; keyboard with
  `cy.press(Cypress.Keyboard.Keys.TAB)`.
- A feature gets a test per new attribute, property, event or slot; a bugfix starts with a test that fails
  for the right reason.
- Run one spec: `pnpm run libs:component-tests:run --spec
  "../../libs/{lib}/src/{path}/vl-{name}.component.cy.ts"`
  (relative to `resources/cypress-component`, no `--` before `--spec`).
- A test that only passes at `(Attempt 2 of 5)` or later is flaky; report it as flaky, not passed.
- Every chart type has a test for each data state, and a gap test: the line breaks and the text names the gap.
- Run one Jest spec from the lib folder: `cd libs/{lib} && ../../node_modules/.bin/jest src/{path}.spec.ts`.
- A new lib needs its own `jest.config.ts` (copy `libs/map/`) and a block in `libs-jest.sh`, otherwise CI skips its specs.

## Storybook

- Three files per component in `stories/`; reference: `libs/components/src/atom/button/stories/`.
- Use the `story()` helper from `@resources/utils-storybook`. Boolean attributes `?disabled=${…}`,
  properties `.data=${…}`, events `@vl-change=${…}`.
- New component: add an entry in `apps/storybook/.storybook/flux-meta-data/json/`. Map has its own file (`map-components.meta-data.json`); a data visualisation lib will need one too, to agree with Flux.
- Every chart story has one variant per data state (data, partial, empty, error, loading), and one variant with a gap.
- The docs page (`.stories-doc.mdx`) shows the table alternative next to the chart.
- Check it in Storybook before a commit: `pnpm run apps:storybook:dev`, http://localhost:8080.

## Git  

- Branches: `feature-v2/FLUX-XXX-short-description` from `develop-v2`; PRs target `develop-v2`.
- `origin` is my fork, `upstream` is Flux. Rebase on `upstream/develop-v2`; the PR goes from the fork to `upstream`.
- Commits: `feat|fix|docs|chore: FLUX-XXX - component name - beschrijving in het Nederlands`. The subject lands in the public changelog.
- Without a ticket, leave out `FLUX-XXX -` (as in `chore: code-connect - vl-step - …`).
- When AI contributed, sign with `Co-Authored-By: <model actually used> <noreply@anthropic.com>`; a purely manual commit gets no trailer (team rule, see `ai/profiles/README.md`).
- Never commit generated `libs/**/*.web-types.json`.

## Working agreements

- Write a plain hyphen `-`, never an em dash, in all text.
- Plans go in `.claude/plans/`, not `docs/plans/`.
- One item per answer: one file, one section or one decision. Keep it short, then stop and wait.
- Check facts in the repo before claiming them (paths, scripts, versions); say what was checked.
- When a rule here conflicts with the Flux code, say so instead of following either one silently.

## Sessions

- One topic per session. When it drifts to a second topic, say so and suggest a new session.
- When the topic is done, suggest `/wrap-up`.

## Sources

Link to these when you give a reason: lit.dev/docs, developer.mozilla.org, typescriptlang.org/docs, plotly.com/javascript, w3.org/WAI/WCAG22/quickref, docs.cypress.io, storybook.js.org/docs, and the Flux Storybook (flux.omgeving.vlaanderen.be/release-v2/latest/storybook).

For chart design, in this order:
1. EU Data Visualisation Guide: data.europa.eu/apps/data-visualisation-guide (with its Chartability page for accessibility).
2. House style: Flux Web Components (design tokens, the Flux Storybook) and the graph specific palettes in `colors.json`.
3. Tie-breakers: Atlassian data charts (atlassian.com/data/charts) and ONS (service-manual.ons.gov.uk/data-visualisation). For which chart type fits which question: FT Visual Vocabulary (ft-interactive.github.io/visual-vocabulary).

## Skills

- `/new-component vl-name type`: scaffold with every file you would otherwise forget
- `/chart-review path`: check a chart against the data-visualisation rules above
- `/refactor path`: object-oriented design and readability review, proposals only
- `/wcag-audit vl-name`: WCAG 2.2 AA audit of one component
- `/flux-check`: convention check of the branch diff
- `/new-attribute name`: the five-question test for where a new setting belongs
- `/wrap-up`: close a session with decisions, outdated docs and the next topic
