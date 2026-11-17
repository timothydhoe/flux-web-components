---
name: wrap-up
description: Close a focused session - list what was decided and changed, and propose the documentation that needs updating.
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Close this session. Look only at what happened in it, and at `git diff` / `git log` since it started.

1. **Topic**: one line on what this session was about.
2. **Decided**: each decision in one line. A decision someone would later ask "why?" about gets an explanation page in `libs/data-visualisation/docs/`: what was chosen, why, and what was rejected. Propose its text.
3. **Changed**: which doc is now out of date or missing. Changed lines only.
- `README.md`: what the project is, how to start it, and links to the docs.
- `CLAUDE.md` and `GLOSSARY.md`: rules or terms this session changed.
- `docs/`, per Diátaxis kind (tutorial, how-to, reference, explanation). Source: diataxis.fr
4. **Open**: what is unfinished, and the one topic for the next session.

Keep it under 30 lines. I write the docs; you propose.

It needs a line in CLAUDE.md, so Claude reminds you of it:
