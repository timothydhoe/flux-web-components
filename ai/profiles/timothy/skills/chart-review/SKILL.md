---
name: chart-review
description: Review a chart component against the data-visualisation rules and report findings, without changing files.
argument-hint: "<libs/data-visualisation/src/line/>"
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit Bash
---

Review `$ARGUMENTS`. Read the component, its defaults, styles, stories and tests first.

Check each rule below and cite `file:line` as evidence. Mark every rule pass, fail or not
applicable. Don't guess: if the code doesn't show it, say "not visible in code".

## Data
- Unit and source come from `meta`; a missing value gives the error state and a console warning.
- All five data states are handled: data, partial, empty, error, loading.
- A gap (NaN) breaks the line, is never interpolated, and is named in text.

## Visual
- The value axis starts at 0. No zoom.
- Colours come from the spec (`colors.json`), never from values set on a trace.
- Number format is Dutch: `1.020,7`.
- Years are a numeric or date axis, never a category axis.

## Chart furniture
- The headline states a checkable fact; the subtitle gives unit and period.
- The source row names the source; a caveat explains a gap or partial data.

## Interaction and accessibility
- The main message never depends on hover or another interaction.
- Tooltips can be hovered and close with Escape (WCAG 1.4.13).
- Direct labels where possible; a legend only when they don't fit.

## Alternatives
- A table alternative with the same numbers as the chart.

## Output
A table: rule | pass/fail/n.a. | `file:line` | one-line finding. Then at most three fixes,
most important first, each with its source (EU guide, WCAG, house style).
