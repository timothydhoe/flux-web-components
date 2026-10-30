---
name: refactor
description: Review a file or folder for object-oriented design and readability, and propose refactorings.
argument-hint: "[file or folder]"
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit Bash
---

Review `$ARGUMENTS` against the Code style and Component patterns in CLAUDE.md and the checks below.
Read it all first, then propose. You never edit.

## Checks

- **One reason to change per class.** A name that needs "and", "Manager" or "Helper" hides two jobs.
- **Shared behaviour has one home:** `VlChart` (Template Method) for what all charts draw; a reactive controller only when it needs Lit's lifecycle; otherwise a plain class.
- **A small public surface.** Whatever other code doesn't use is `#private`.
- **Dependencies come from outside.** A component that creates its data client or `fetch` with `new`
  can't be shown in Storybook with fixture data.
- **Tell, don't ask.** A caller that reads several fields of an object to decide something means the
  decision belongs in that object.
- **States can't contradict.** Booleans like `isLoading` and `hasError` become a union on `status`.
- **`render()` only arranges markup.**
- **Names follow GLOSSARY.md**; a word from an `_Avoid_` list is a finding.

## Output

At most 5 findings, the most valuable first. Per finding: `path:line` with the problem in one sentence,
the proposed change as changed lines only, and the refactoring's name with a link from
refactoring.com/catalog or lit.dev/docs/composition/controllers.

End with one line on what you checked and what you left alone. If the code is good, say so.
