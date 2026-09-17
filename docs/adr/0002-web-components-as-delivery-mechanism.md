# Web Components as the delivery mechanism

> Decision record for [#62](https://github.com/bstoppel/html.style/issues/62).
> Status: Accepted.

Nothing in the framework states outright why molecules and organisms are
custom elements, why some are light DOM and some shadow, or why the same
component works from a plain `<script>` tag or inside a bundler. Each is
inferable from scattered evidence — the code, `docs/frameworks.md`, a few
lines in CONTRIBUTING.md — but never stated as one decision. This record
catches up to what the codebase already does.

## What's already true

Fifteen `<hs-*>` elements ship today. Eleven extend `HTMLElement` directly —
light DOM, no runtime dependency beyond the class itself. Four extend
`LitElement` — `hs-combobox`, `hs-menu`, `hs-tabs`, `hs-toggle` — the
components that genuinely need shadow encapsulation. That split matches
CLAUDE.md's "when in doubt, light DOM" rule in practice, not just in
statement.

Every component ships three ways:

| File | Format | Use it when |
|---|---|---|
| `dist/js/html.style.components.js` | ES module, Lit inlined | `<script type="module">` over `http(s)://` |
| `dist/js/html.style.components.classic.js` | Classic script, Lit inlined | Opened from `file://`, or anywhere modules can't run |
| `dist/components/*.js` | Unbundled ES modules | A consumer with their own bundler |

`docs/frameworks.md` documents what each framework needs to consume them
unmodified: React 19+ (earlier versions stringify non-string props), Vue's
`compilerOptions.isCustomElement`, Angular's `CUSTOM_ELEMENTS_SCHEMA`,
Svelte and Solid needing no configuration at all. That guide is verified
against `tests/components/framework-interop.spec.js`, not just written and
left to rot.

## Decision

Web Components are the delivery mechanism for anything with real behavior
or composition. Atoms stay semantic HTML, layout stays plain CSS classes;
only molecules and organisms become `<hs-*>` custom elements — the split
CLAUDE.md's atomic taxonomy already states.

Within that, two commitments:

1. **Lightest possible implementation, per component.** Light DOM by
   default. Shadow DOM, and the Lit dependency it brings, only for a
   component that actually needs encapsulated structure. Lit itself is the
   one sanctioned runtime dependency, chosen over hand-rolling reactive
   attributes and template diffing (CONTRIBUTING.md: "several hundred lines
   of infrastructure before the first component ships").
2. **Works with modern frameworks and vanilla HTML/CSS/JS, unmodified.** No
   fork of the component for React versus Vue versus a plain script tag —
   one implementation, three build outputs, documented per-framework setup
   where the framework requires it.

## Alternatives rejected

1. **Per-framework wrapper packages** (`@html.style/react`, `@html.style/vue`)
   — already rejected in #60's out-of-scope note, in favor of generated
   types.
2. **A CSS-only library with no component layer.** Real behavior — tabs,
   dialogs, comboboxes — can't be done accessibly in CSS alone without
   reimplementing the platform, which CONTRIBUTING.md's "Native Where Native
   Suffices" rule already forbids.
3. **Hand-rolled vanilla custom elements, no helper library.** Rejected on
   the infrastructure cost CONTRIBUTING.md already states.
4. **A component compiler, Stencil-shaped.** A comparably light runtime, but
   at the cost of a proprietary build toolchain to author against —
   conflicts with keeping the framework's own build minimal.
5. **A single framework, such as React, as the base authoring layer.**
   Needs that framework's runtime just to render, the opposite of the
   vanilla/any-framework goal.

## What this changes

Nothing in the code. The fifteen components and the three-way build already
work this way. What changes is that the reasoning has one citable home
instead of living only in scattered files.

## Revisit when

A concrete case for a per-framework wrapper package, a different base
library than Lit, or dropping vanilla/no-build support arises with evidence
this record doesn't already address. None has, so far.
