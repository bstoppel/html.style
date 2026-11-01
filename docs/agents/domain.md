# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root.
- **`docs/adr/`**: read the ADRs that touch the area you're about to work in. The index is `docs/adr/README.md`. ADR-0005 (positioning floating elements) is the one exception: it lives at `docs/positioning.md`, not in `docs/adr/`.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## Layout

Single-context: one `GLOSSARY.md` at the repo root and one `docs/adr/` directory. There are no per-context glossaries or ADR directories.

## Writing a new ADR or the glossary

Follow the shape set by [ADR-0001](../adr/0001-use-architecture-decision-records.md), not a generic ADR template:

- Number it after the highest existing ADR.
- Tie it to a GitHub issue and give it a `Status` line.
- Add a row to the index table in `docs/adr/README.md`.
- Add the file to the `DOCS` array in `check-docs.js`, which `npm run docs:check` reads. Register `GLOSSARY.md` there too when it is first created.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
