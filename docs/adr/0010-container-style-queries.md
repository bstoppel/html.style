# Container style queries

> Decision record for [#75](https://github.com/bstoppel/html.style/issues/75).
> Evidence: MDN browser-compat-data (`css/at-rules/container.json`),
> cross-checked against caniuse (`css-container-queries-style`), checked
> 2026-09-24.
> Status: Accepted.

`@container style(--foo: bar)` lets a container query match on a custom
property's *value*, not its size — the same container-query machinery this
project already leans on throughout the organism and template layers
(`.site-header`, `.card-grid`, `.hero`, `.feature-grid`), extended from
"how wide is it" to "what does it say."

The size-query precedent made this look like a natural next step, but #75
named the real open question up front: every existing container query here
answers a layout question. Nothing in the codebase currently needs a
*style* answer. This record is that search, and its conclusion.

## What the evidence says

Support against the floor in [CLAUDE.md](../../CLAUDE.md) — Chrome 131,
Firefox 133, Safari 18 — for `style()` matching a custom property:

| Engine | Version | At floor |
|---|---|---|
| Chrome / Edge | 111 | **Yes** |
| Safari | 18.0 | **Yes** |
| Firefox | 151 | No |

Chrome and Safari have had this since before the floor. Firefox is the gap,
and — same reasoning as [ADR-0005](../positioning.md) — one engine missing
it is enough to disqualify baseline use regardless of how close the other
two are. Safari carries one unrelated limitation (the document element
can't be a container, per WebKit bug 271040); irrelevant here, since no
component makes `<html>` a query container.

Range comparisons inside `style()` (`style(--n > 4)`) are a separate,
narrower feature: Chrome/Edge 142, Firefox 151, Safari not yet implemented.
Notably, 142 is *above* the 131 floor even in the engine that leads on the
rest of this feature — a second reason to scope any future use to equality
checks (`style(--foo: bar)`), not comparisons.

**No `@supports` guard is actually needed, in either direction.** The issue
asked which `@supports` test correctly targets style-query support
specifically. There isn't one, and it turns out not to matter: a `style()`
condition a browser doesn't recognize makes the whole `@container` prelude
fail to parse, and an at-rule with an invalid prelude is dropped entirely,
per how conditional group rules degrade in CSS. Firefox today simply never
applies the block — no half-applied state, nothing to feature-detect
around. That is a materially different shape than
[ADR-0005](../positioning.md)'s anchor-positioning case, which needed an
explicit `@supports (position-anchor: --x)` guard specifically *because* the
ungated failure mode was a popover left with no position at all, in the top
layer, with no containing block to fall back to. A style query's ungated
failure mode is just "the enhancement doesn't apply" — which is what
"guarded" would have produced anyway.

## What's open, and the answer

**Where would this actually be used?** Searched the codebase for the shape
of problem style queries solve — a component whose appearance should
switch between distinct declaration blocks based on a custom property set
by whatever contains it — and didn't find one:

- Every discrete variant already shipped (`hs-alert[variant]`,
  `hs-toast[variant]`) is an HTML attribute, not a custom property. Attributes
  are simpler, visible in DevTools without inspecting computed styles, and
  need no `container-type` on an ancestor at all. Nothing about their use
  case calls for moving to a property a container sets.
- The "one signal, many dependents" shape does exist in this codebase —
  `--p-brand-hue` driving 21 `oklch()` declarations
  ([ADR-0009](0009-register-property-brand-hue.md)) — but plain custom-property
  inheritance and `var()` already solve it. A style query is for
  *conditionally switching a block of otherwise-unrelated declarations*;
  `--p-brand-hue` needs the opposite, the same formula recomputed
  everywhere it's referenced. `@property` was the fitting mechanism there,
  not this one.
- `hs-card`'s only per-instance layout switch (`.card > *` in the atoms
  layer) is deliberately *not* a container query — it uses the intrinsic
  `flex-basis: calc((var(--hs-card-threshold) - 100%) * 999)` trick
  specifically to sidestep the documented container-query bug in
  [CLAUDE.md](../../CLAUDE.md) ("an element is never its own query
  container"). Adding a style-query override on top would reintroduce the
  exact container machinery that trick exists to avoid, for a hypothetical
  ("force this layout when auto-detection misfires") that no issue or user
  has raised.
- No template or component defines a density, tenant-theme, or mode custom
  property today that an ancestor sets and multiple descendants would need
  to react to with genuinely different rules, rather than a substituted
  value.

The mechanism is sound and cheap (Chrome and Safari already have it, no
guard needed even for Firefox's gap). What's missing is a real case to
design it around, exactly as #75 flagged before any research started.

## Decision

Do not adopt container style queries now. No component, template, or token
changes.

## Alternatives rejected

1. **Adopt speculatively for a plausible future case** (density mode,
   tenant theme flag — the shapes #75 itself named as candidates). Rejected
   — building the mechanism ahead of a concrete consumer repeats the
   dead-weight outcome [ADR-0009](0009-register-property-brand-hue.md)
   already rejected for `@property`: a demonstrated need earns the token
   dependency's cost, not a plausible one.
2. **Retrofit `hs-card`'s layout switch to a style-query override**, so an
   ancestor could force stacked/side-by-side regardless of measured width.
   Rejected — no report of the automatic switch misfiring, and it would
   undo the specific choice that already avoids `container-type` there.
3. **Ship the `@supports`-guarded scaffolding anyway, so it's ready when a
   case appears.** Rejected on the evidence above: there is no working
   `@supports` test for style-query support specifically, and none is
   needed — the guard the issue asked for doesn't exist because the
   platform's own parsing already does its job. Shipping unused scaffolding
   would document a guard that isn't real.

## What this changes

Nothing in CLAUDE.md, no code. [#72](https://github.com/bstoppel/html.style/issues/72)'s
backlog is updated to point here instead of carrying this as an open
question.

## Revisit when

A component or template needs to switch between distinct declaration
blocks based on a custom property an ancestor sets — not a value
substitution, an attribute would fit better — with a real consumer behind
it. `--hs-card-density` or a tenant-theme flag are the shapes named in
[#72](https://github.com/bstoppel/html.style/issues/72); either would
qualify the moment something concrete needs one. Firefox reaching 151 also
removes the only support gap, at which point adopting it needs no
`@supports` question at all — there was never a guard to write, only a
case to wait for.
