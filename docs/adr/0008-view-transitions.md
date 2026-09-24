# View Transitions

> Decision record for [#71](https://github.com/bstoppel/html.style/issues/71).
> Evidence: caniuse (mdn-css_at-rules_view-transition,
> mdn-api_document_startviewtransition), checked 2026-09-24.
> Status: Accepted.

One of this framework's stated jobs is showcasing what's newly possible on the
web platform, not just using what's safely old (#72). View Transitions is the
first candidate out of that backlog. The question this spike answers: does it
become a systemic part of html.style, and if so, how much of it.

## What the data says

Support against the floor in [CLAUDE.md](../../CLAUDE.md) — Chrome 131,
Firefox 133, Safari 18:

| Feature | Chrome | Firefox | Safari | At floor |
|---|---|---|---|---|
| `@view-transition` (cross-document) | 126 | Not shipped | 18.2 | No (Firefox) |
| `document.startViewTransition()` (same-document) | 111 | 144 | 18.0 | No (Firefox) |

Same-document sits *above* the 133 floor in Firefox specifically (144), the
same shape as the anchor-positioning gap [ADR-0005](../positioning.md)
documented — one engine behind is enough to disqualify a hard dependency, but
not enough to disqualify a feature-detected enhancement.

Cross-document is the easier case regardless of the Firefox gap: an
unsupported engine sees an at-rule it doesn't recognize and ignores it, and
the page just navigates the way it always has. There's no fallback to write
because there's nothing to fall back *from* — unlike anchor positioning's
~40-line script fallback, or even same-document's one-line feature check.

**A real constraint, not a version gap:** `view-transition-name` set inside a
shadow root does not reliably cross the shadow boundary
([w3c/csswg-drafts#11273](https://github.com/w3c/csswg-drafts/issues/11273)),
open and unresolved at the spec level, not pending a browser fix. That maps
directly onto the light/shadow split [ADR-0002](0002-web-components-as-delivery-mechanism.md)
already drew: safe to rely on for the 11 light-DOM components, not safe to
lean on for the 4 shadow-DOM ones (`hs-combobox`, `hs-menu`, `hs-tabs`,
`hs-toggle`) until the spec gap closes.

## Decision

1. **Cross-document transitions ship on, framework-wide, by default:**
   `@view-transition { navigation: auto; }` in the reset layer. Zero risk,
   zero fallback, and it's the one shape of site — no-router, static,
   multi-page HTML, this framework's entire primary delivery model — that
   has never had transition polish before. SPA frameworks have had this for
   years via router-level libraries; this is the equivalent for the pages
   this framework actually ships.

2. **The transition duration and easing come from `--motion-duration` and
   `--motion-ease`, not the browser default:**
   `::view-transition-group(*) { animation-duration: var(--motion-duration);
   animation-timing-function: var(--motion-ease); }`. The browser's own
   default under `prefers-reduced-motion` is already fairly considerate
   (cross-fade only, no position/size animation), but it's a *second*,
   different reduced-motion policy from the one the framework already runs
   everywhere else (`--motion-duration` collapsing to near-zero, e.g.
   `hs-tooltip`'s `@starting-style`/`allow-discrete` pattern). Routing the
   transition through the token means there's exactly one reduced-motion
   policy on the page, not two running side by side, with no new media
   query — the existing one already collapses the token.

3. **`document.startViewTransition()` for same-document, component-level
   state changes is not wired into the framework now.** It stays a
   documented consumer recipe — feature-detect
   (`if (document.startViewTransition)`), else call the update function
   directly, one `if`, not a fallback to build — rather than framework-owned
   JS, for three reasons:
   - The shadow-DOM constraint above rules out `hs-combobox`, `hs-menu`,
     `hs-tabs`, `hs-toggle` outright. Wiring the other 7 light-DOM
     components in while those 4 stay unsupported is the kind of partial,
     inconsistent coverage this framework avoids elsewhere.
   - It's a clear win only where something actually repositions or resizes
     (`hs-sortable` reordering, a list item collapsing) — not obviously one
     for a state change that only fades (a toggle flipping), which the
     component's own CSS transition already handles.
   - New JS across roughly seven components for a payoff that's proven in
     one of them and speculative in the rest fails the reversibility test
     [ADR-0007](0007-convenience-component-test.md) already applies here:
     shipping the recipe and promoting one component later on concrete
     evidence is cheap to reverse; wiring seven now and walking parts of it
     back is not.

## Alternatives rejected

1. **Ship nothing.** Rejected — cross-document transitions cost nothing to
   add, cost nothing for an unsupported engine, and directly serve the
   "showcase what's newly possible" mandate #72 exists to track.

2. **Wire `startViewTransition()` into every component's internal state
   changes now** (accordion expand, dialog open/close, toast enter/exit,
   sortable reorder). Rejected per point 3 above — the shadow-DOM spec gap
   blocks 4 of 11 components outright, the payoff is unproven outside
   reposition/resize cases, and it doesn't pass the reversibility test this
   project already uses for exactly this kind of call.

3. **Leave the transition at the browser's default duration/easing.**
   Rejected — the framework already has one considered reduced-motion
   policy everywhere else in the stylesheet; leaving the browser's own
   separate default in place means two different reduced-motion behaviors
   on one page instead of one.

4. **Move the floor to reach Firefox parity before shipping anything.**
   Rejected on the same grounds as ADR-0005: reaching Firefox 144 (or
   shipped cross-document support, whenever that lands) excludes most of the
   installed base to gain a feature that costs the unsupported engine
   nothing to begin with. No reason to wait for parity that isn't needed.

## What this changes

- `src/css/html.style.css`: adds `@view-transition { navigation: auto; }`
  and a `::view-transition-group(*)` rule matching `--motion-duration` /
  `--motion-ease`, both in the reset layer. No new custom properties, no new
  layer.
- No component source changes, no new JS ships.
- Consumers who want shared-element morphs across navigations (a card and
  its detail-page hero sharing a `view-transition-name`) get a documented
  recipe, not a framework-owned naming convention — already out of scope for
  this spike per #71.

## Revisit when

- CSSWG resolves #11273 (shadow-DOM `view-transition-name` scoping) —
  re-open the same-document question specifically for `hs-combobox`,
  `hs-menu`, `hs-tabs`, `hs-toggle`, the four components point 3 above
  currently excludes.
- A concrete case shows one component-level transition earning its
  complexity — most likely `hs-sortable` reordering, the strongest
  reposition candidate named above. Wire that one component in on the
  evidence, not all seven speculatively.
- Firefox ships `@view-transition` — nothing to change; the rule is already
  additive. Update the support table above.
