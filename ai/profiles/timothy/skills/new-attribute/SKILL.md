---
name: new-attribute
description: Decide where a proposed chart setting belongs (HTML, spec, data contract, component, or attribute) before it becomes public API.
argument-hint: "[attribute name and what it does]"
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit Bash
---

Proposed: `$ARGUMENTS`.

Every attribute is a promise: it is public API, and in Flux removing one is a breaking change.
It only becomes an attribute if the answer to all five questions is "no". Stop at the first "yes".

1. Does HTML already have it on every element (`id`, `class`, `title`, `aria-label`, events)?
   → use that.
2. Is it a house-style choice? → **spec**.
3. Can it come from the data? → **data contract** (`meta`).
4. Is it a separate thing on the page? → a **component**, or part of the **figure**.
5. Does it only belong to form fields (`disabled`, `placeholder`)? → doesn't apply.

If all five are "no", check the name against the naming rules in the profile:

- kebab-case and English
- a boolean is on when present; use `hide-`/`disable-` to switch off a default, never `is-`/`has-`
- the name says what it is, not where it sits

Then check whether an existing attribute already covers it. Current attributes:

- on the visual: `src`, `palette`, `color-family`, `highlight`
- on the figure: `headline`, `headline-level`, `subtitle`, `highlight-control`

## Output
- The five questions, each with yes or no and one line of reasoning.
- The verdict: where it goes.
- If it becomes an attribute: the name, its type, its default, and a one-line TSDoc comment.
