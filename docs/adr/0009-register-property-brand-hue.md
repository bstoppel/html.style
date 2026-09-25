# Register @property for --p-brand-hue

> Decision record for [#73](https://github.com/bstoppel/html.style/issues/73).
> Evidence: caniuse (mdn-css_at-rules_property), checked 2026-09-24.
> Status: Accepted.

`@property` (Chrome 85, Firefox 128, Safari 16.4 — all below the current
floor) registers a custom property's syntax, initial value, and whether it
inherits. Unregistered, a custom property is text substitution: the browser
can't interpolate it, so anything driven by it snaps instantly instead of
transitioning. The concrete case already in the codebase: `--p-brand-hue`
drives the entire brand ramp (10 colors), the entire neutral ramp (11
colors, "carries a trace of the brand hue"), and `--color-action-primary` —
21 `oklch()` declarations recompute the instant it changes. `website/style.
html` and `website/index.html` both ship a live hue slider and brand-preset
buttons already wired to it (`website/js/site.js`); today both snap.

## What's open, and the answer

**Scope — just `--p-brand-hue`, or the broader primitive set
(`--p-space-*`, `--p-duration-*`, others)?** Just `--p-brand-hue`. No other
primitive has a demonstrated runtime-interpolation use case. Spacing and
duration values aren't things a consumer transitions the *value* of at
runtime — components already animate rendered properties (`transform`,
`opacity`) directly, which are natively animatable without registration.
Registering a token nobody transitions is the "dead weight" the issue itself
warned against.

**Failure mode — `@property` resets to `initial-value` on an invalid
override instead of silently no-op'ing. Feature or footgun against
[ADR-0003](0003-overridable-design-system.md)'s override-everything
commitment?** Feature, specifically *because* of the fan-out. Today,
unregistered, a bad value (`--p-brand-hue: banana`) doesn't fail cleanly —
each of the 21 dependent `oklch()` declarations invalidates independently
and falls back to whatever it would otherwise inherit, which differs
declaration by declaration. The visible result is a ramp that breaks
*inconsistently*: some colors keep an old value, others fall through to a
default, depending on inheritance at that specific declaration. Registered,
the one token resets to a known-good `initial-value` and all 21 dependents
recompute from that, together. ADR-0003 commits to overridability, not to a
specific failure mode when an override is malformed — a bad value failing
coherently serves that commitment better than failing incoherently, which is
what happens without registration.

## Decision

1. Register only `--p-brand-hue`:

   ```css
   @property --p-brand-hue {
     syntax: '<number>';
     inherits: true;
     initial-value: 58;
   }
   ```

   `syntax: '<number>'`, not `<angle>` — every override already written, in
   this codebase and on the live site, is a bare number
   (`--p-brand-hue: 210`, no `deg`). `<angle>` would invalidate all of them
   the day this ships. `inherits: true` is required, not a preference —
   `website/extend.html`'s scoped-subtree demo depends on a descendant
   override cascading down, and registered properties default to
   non-inherited unless stated.

2. Transition the token itself, once registered, rather than each dependent
   color:

   ```css
   :root {
     transition: --p-brand-hue var(--motion-duration) var(--motion-ease);
   }
   ```

   Every `oklch()` that references `var(--p-brand-hue)` recomputes on each
   animation frame as the token interpolates, so the 21 dependent
   declarations need no transition of their own. Duration and easing come
   from the existing motion tokens, so this collapses under
   `prefers-reduced-motion` the same way everything else does — one policy,
   not a second one for this token.

3. No component or JS changes. `website/js/site.js`'s existing
   `style.setProperty('--p-brand-hue', ...)` calls (the slider's `input`
   handler and the preset buttons) need nothing new — they already just set
   the property; the framework stylesheet now makes what receives that
   set interpolate instead of snap.

## Alternatives rejected

1. **Register the broader primitive set now** (`--p-space-*`,
   `--p-duration-*`, and others). Rejected — no concrete use case exists for
   transitioning any of them, and registering ahead of demonstrated need is
   exactly the dead-weight outcome the issue flagged.
2. **Leave `--p-brand-hue` unregistered; accept the snap.** Rejected —
   registration costs nothing (below floor in every engine), directly
   upgrades a demo already live on the site, and — per the failure-mode
   analysis above — produces a *more* consistent failure than today's
   unregistered behavior, not a less forgiving one.
3. **Treat the stricter failure mode as disqualifying under ADR-0003.**
   Rejected for the reason stated above: coherent failure across a
   21-declaration fan-out serves "overridable by construction" better than
   the incoherent, declaration-by-declaration failure that happens without
   registration.
4. **`syntax: '<angle>'`, to be technically precise about what a hue
   component is.** Rejected — it would invalidate every override already
   written against the current, unitless convention, breaking the
   framework's own already-published demo pages the same day this lands.

## What this changes

- `src/css/html.style.css` (tokens layer): the `@property` rule and one
  `transition` declaration on `:root`. No new custom properties, no new
  layer, no component source changes.
- The already-shipped hue slider and brand-preset buttons on
  `website/style.html` and `website/index.html` transition instead of
  snapping, once `website/css/html.style.css` is remirrored.

## Revisit when

- A second primitive gets an actual runtime-interpolation use case — a
  demo, a component need. Register that one token on that evidence, same
  bar as this one, not speculatively ahead of it.
- Hue wraparound becomes a real complaint: `<number>` interpolates linearly,
  not by shortest angular path, so a transition crossing the 0/360 seam
  (350 → 10) travels the long way through 180 rather than the short way
  through 0. Known limitation, not fixed here — nothing in the current
  slider/preset range demonstrates it as a problem.
