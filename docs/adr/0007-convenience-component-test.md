# When a convenience component earns its own element

> Decision record for [#57](https://github.com/bstoppel/html.style/issues/57).
> Status: Accepted.

CONTRIBUTING already forbids an `<hs-*>` that duplicates an already-styled
*atom* — `<hs-button>`, `<hs-table>`, and others were rejected on that
ground. It says nothing about the level above: whether a *component* that
largely repeats another component (same platform primitive, same
interaction model, different CSS) earns a separate element or should be a
variant of the one that exists. `<hs-sheet>` — a dialog anchored to a screen
edge instead of centered — is the case that surfaced the gap, not the
subject of this record.

## Decision

The test is not duplication, which is CONTRIBUTING's atom-level reasoning.
It's reversibility of the decision itself.

1. If a proposed element wraps the same platform primitive and the same
   interaction model as an existing component, and the difference is
   expressible as CSS plus an attribute, it's a variant of the existing
   component, not a new one — same logic as the atom rule, one level up.
2. Naming and discoverability are real costs of choosing "variant," not
   dismissed ones. But they're the cheap side of the asymmetry: adding a
   dedicated element later, once real demand shows the variant isn't
   discoverable enough, costs nothing if the new element is defined as a
   thin, zero-new-behavior alias over the mechanism that already exists.
   Removing an already-shipped, already-depended-on element costs a
   migration.
3. So: ship the variant. Don't guess at demand up front. Promote to a
   dedicated element only on concrete evidence — repeated confusion, a
   documented pattern of agent-generated markup missing it, actual
   discoverability complaints — not speculation at design time.

## Worked example: hs-sheet

Applying the test: a sheet is a `<dialog>` positioned at an edge instead of
centered, with the same top-layer, focus-trap, backdrop and Escape handling
`hs-dialog` already wraps. No new platform behavior, no new interaction
model — it fails the bar for a new element under point 1. Resolution: a
`placement` attribute on `hs-dialog` (`center` default, `start`/`end`/`top`/
`bottom` for edge-anchored), CSS and an entry animation doing the rest, no
new JS. `<hs-sheet>` stays available as a future thin wrapper
(`<hs-sheet>` = `<hs-dialog placement="end">`) if point 3's evidence bar is
ever met.

## Alternatives rejected

1. **Decide every convenience-component proposal case by case, with no
   general test.** What #57 itself flagged as not scaling — each future
   proposal would re-argue the same ground from scratch.
2. **Apply CONTRIBUTING's atom-duplication rule to components unmodified.**
   Rejected: an atom is static styling, a component carries a JS behavior
   layer and its own naming/discoverability surface. DRY alone undercounts
   the naming cost, which is why reversibility, not duplication, is the
   deciding lens here.
3. **Ship dedicated elements liberally, to maximize discoverability.**
   Rejected: the irreversible cost of a name people come to depend on
   outweighs the discoverability benefit at the point where demand is still
   a guess. Ship the reversible option; promote on evidence.

## What this changes

`<hs-sheet>` does not ship. `hs-dialog` gains a `placement` attribute
instead. Future convenience-component proposals are checked against the
test in "Decision" rather than argued from scratch, per #57's own
out-of-scope note.

## Revisit when

Concrete evidence a shipped variant is hurting discoverability — repeated
"where's hs-sheet"-shaped requests, or an audit showing agent-generated
markup consistently misses the `placement` attribute for sheet-shaped asks.
Then promote to the thin wrapper described above.
