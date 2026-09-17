# Overridable design system as a core deliverable

> Decision record for [#64](https://github.com/bstoppel/html.style/issues/64).
> Status: Accepted.

[`docs/design-system.md`](../design-system.md) documents the mechanics of
the token and override system thoroughly but never argues for any of it as
a decision: no stated alternatives, no reasoning for why overridability is a
product commitment rather than an implementation detail, nothing tying it
to an issue. This record states the decision; `design-system.md` stays the
reference for how it works.

## What's already true

196 `--hs-*` custom properties exist across the 15 shipped components. A
six-layer cascade (`reset, tokens, atoms, molecules, organisms, templates`)
exists so overrides land predictably instead of winning or losing a
specificity fight. 18 places derive state tokens with `oklch(from ...)`
relative color syntax rather than hand-authoring them. And it's one override
mechanism for the whole framework, not one for components and another for
everything else: light-DOM components use the same `--hs-*` convention as
shadow-DOM ones, per `design-system.md`, even though light DOM doesn't
strictly need it.

## Decision

The design system is fully overridable by construction. Every configurable
value is a CSS custom property with a token-backed default. Nothing requires
a build step or JavaScript to change. This is a core deliverable of the
project, not an implementation detail of the component layer.

## Alternatives rejected

1. **Sass/Less build-time variables** — the classic approach (Bootstrap's
   `$primary`, etc.). Rejected because overriding a build-time variable
   requires a build step, which contradicts the no-build-step vanilla path
   directly.
2. **A JS theming API** (`HtmlStyle.configure({...})`) — rejected because it
   would require JavaScript to theme even zero-JS atoms and layout
   primitives, and couldn't apply before the script runs.
3. **Utility classes as the override mechanism** — already rejected
   directly: CLAUDE.md's "Do NOT... use utility-first/atomic CSS patterns."
4. **`!important` / specificity wars as the sanctioned override path** —
   already rejected directly: the variant pattern in `design-system.md`
   (an internal `--_alert-bg`-style property) exists specifically so an
   author override wins over a variant's higher specificity without needing
   either.
5. **Leaving some values hardcoded rather than tokenized** — already
   rejected directly: CLAUDE.md's "never hardcode a duration, focus ring, or
   border width" rule.

## What this changes

Nothing in the code — the token system and the 196 `--hs-*` properties
already work this way. What changes is that "why" has a citable home
instead of living only as a how-to guide.

## Revisit when

A concrete case for a build-time or JS-based override mechanism arises with
evidence this record doesn't already address. None has, so far.
