# Timothy - Claude Code configuration (Flux Web Components)

Flux Web Components v2: a Lit-based component library (TypeScript, Cypress, Storybook, design tokens, npm
scope `@domg-wc`). My work here is the data-visualisation library. Chart terms: `ai/profiles/timothy/GLOSSARY.md`.

Before writing or changing a component, read an existing sibling of the same type.

## Roles

- The user writes production code and config, and runs install, commit and push.
- You write Cypress tests (`*.cy.ts`) and fixtures, run them, and report the output.
- For any other file, propose the change instead of making it:
    - Read the file first. Show its path and only the changed lines.
    - Give the reason in one or two lines, with a link to official documentation or the Flux source.
    - End with the command that checks it and the output to expect.
    - Put unrelated problems you notice under a separate "Noticed" heading.


## Data visualisation

- Lives in `@domg-wc/data-visualisation` (`libs/data-visualisation/`), structured like `libs/map/`.
- Components: `vl-data-figure` (the frame around a chart), `vl-chart-line`, `vl-chart-bar`.
- A figure without a unit or a source shows its error state instead of a chart.
- Opinionated about form, not about the message: show and explain the data, never tell the reader what to
  conclude. Explanation text is neutral.
- Charts receive prepared data and only format and draw it; statistics are computed server-side.
- Plotly.js renders. The value axis starts at 0. No zoom.
- The look comes from one theme: colours from the palettes, spacing and type from design tokens. A component
  never sets its own colour or font.
- Series are told apart by direct labels as well as colour; lines reach 3:1 contrast against the background
  (WCAG 2.2 AA).
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

## Code style

- Names read as a sentence in domain terms: `averageOverMeasurementPeriod`, `shouldFadeOthersOnHover`,
      `#openTooltipAt(point)`. Long names are fine, abbreviations are not.
- Booleans ask a question (`isStale`, `hasCoverage`); methods start with a verb (`build…`, `render…`,
  `load…`).
- Constants carry their meaning: `STALE_AFTER_MINUTES`, not `TIMEOUT`.
- Model states as a discriminated union on `status` (`loading`, `empty`, `error`, `ready`).
- A family of components shares an abstract base class with template methods; other concerns go into
  reactive controllers the class composes.
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


## Tests (Cypress component tests)

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

## Storybook

- Three files per component in `stories/`; reference: `libs/components/src/atom/button/stories/`.
- Use the `story()` helper from `@resources/utils-storybook`. Boolean attributes `?disabled=${…}`,
  properties `.data=${…}`, events `@vl-change=${…}`.
- New component: add an entry in
      `apps/storybook/.storybook/flux-meta-data/json/components-{type}.meta-data.json`.
- Check it in Storybook before a commit: `pnpm run apps:storybook:dev`, http://localhost:8080.

## Git

- Branches: `feature-v2/FLUX-XXX-short-description` from `develop-v2`; PRs target `develop-v2`.
- Commits: `feat|fix|docs|chore: FLUX-XXX - component name - beschrijving in het Nederlands`. The subject lands in the public changelog.
- When AI contributed, sign with `Co-Authored-By: <model actually used> <noreply@anthropic.com>`; a purely manual commit gets no trailer (team rule, see `ai/profiles/README.md`).
- Never commit generated `libs/**/*.web-types.json`.

## Working agreements

- Write a plain hyphen `-`, never an em dash, in all text.
- Plans go in `.claude/plans/`, not `docs/plans/`.

## Sources

Link to these when you give a reason: lit.dev/docs, developer.mozilla.org, typescriptlang.org/docs,
plotly.com/javascript, w3.org/WAI/WCAG22/quickref, docs.cypress.io, storybook.js.org/docs, and the Flux Storybook (flux.omgeving.vlaanderen.be/release-v2/latest/storybook).

## Skills

- `/new-component vl-name type`: scaffold with every file you would otherwise forget
- `/chart-review path`: check a chart against the data-visualisation rules above
- `/refactor path`: object-oriented design and readability review, proposals only
- `/wcag-audit vl-name`: WCAG 2.2 AA audit of one component
- `/flux-check`: convention check of the branch diff
