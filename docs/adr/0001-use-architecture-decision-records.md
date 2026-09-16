# Use Architecture Decision Records

> Decision record for [#63](https://github.com/bstoppel/html.style/issues/63).
> Status: Accepted.

Decisions were getting made and either not recorded at all — most of
CLAUDE.md and CONTRIBUTING.md states things as flat fact with no recoverable
reasoning — or recorded as ad hoc `docs/*.md` files with no consistent
shape, no index, and no way to tell a current decision from a superseded
one.

## Decision

Architecture Decision Records are a foundational knowledge mechanism in
this repository, not an occasional artifact.

- Homed at `docs/adr/`, one file per decision, numbered sequentially
  (`0001-title-slug.md`).
- Indexed at [`docs/adr/README.md`](README.md) — number, title, status,
  linked issue.
- Every ADR ties to a GitHub issue and carries a `Status` line (Accepted, or
  Superseded by a later ADR number), so supersession is traceable instead of
  silently overwriting history.
- Shape: a decision-record header with status, context, the decision
  itself, alternatives rejected, what it changes, and when to revisit it.
- Registered in `check-docs.js`'s `DOCS` array like every other doc, so an
  ADR that never gets linked from the index fails the check.

## Alternatives rejected

1. **Keep using flat, ad hoc `docs/*.md` files** — what this repository was
   doing until this record. Works for a single document, but nothing ties
   them together, orders them, or shows status once one supersedes another.
2. **A wiki** — lives outside the versioned source, drifts from the code it
   describes, no PR review on changes.
3. **Issue threads as the only record** — not a stable, citable artifact;
   the reasoning is buried in a closed issue's comment history instead of a
   file anyone can read top to bottom.
4. **No formal mechanism** — the status quo this record replaces.

## What this changes

New foundational and technical decisions are written as numbered ADRs under
`docs/adr/`, not as standalone `docs/*.md` files.
[`docs/positioning.md`](../positioning.md) predates this record and has real
cross-references — README, several component source files, a test file — so
it stays at its current path rather than being moved, and is indexed as
ADR-0005 there. Future decisions go straight into `docs/adr/`.

## Revisit when

A specific ADR needs to record that it supersedes an earlier one. That's
handled by the `Status` line on the newer record, not by a change to this
one.
