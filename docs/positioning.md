# Positioning floating elements

> Decision record for [#28](https://github.com/bstoppel/html.style/issues/28).
> Evidence: MDN browser-compat-data 8.1.1, checked 2026-09-12.

`<hs-menu>`, `<hs-tooltip>` and the `<hs-combobox>` listbox all need an element
placed against an anchor and moved when it would leave the viewport. CSS Anchor
Positioning is the platform answer to that. It is not available at this project's
browser floor, and will not be for some time.

## What the data says

Support against the floor in [CLAUDE.md](../CLAUDE.md) — Chrome 131, Firefox 133,
Safari 18:

| Feature | Chrome | Firefox | Safari | At floor |
|---|---|---|---|---|
| `anchor-name` | 125 | 147 | 26 | No |
| `position-anchor` | 125 | 147 | 26 | No |
| `position-area` | 129 | 147 | 26 | No |
| `position-try-fallbacks` | 128 | 147 | 26 | No |
| `anchor()` | 125 | 147 | 26 | No |
| `anchor-size()` | 125 | 147 | 26 | No |
| `popover` attribute | 114 | 125 | 17 | **Yes** |
| `showPopover()` | 114 | 125 | 17 | **Yes** |
| `togglePopover()` | 114 | 125 | 17 | **Yes** |
| `:popover-open` | 114 | 125 | 17 | **Yes** |

Those are the versions where each feature *places a box correctly*.
browser-compat-data records `position-anchor` as fully supported only from
Chrome 151, Firefox 151 and Safari 27, and partial before that. The partial part
is the property's initial value — `implicit`, then `auto`, then `none`, instead
of the specified `normal`. Anything that sets `position-anchor` explicitly, as
both paths in `src/components/position.js` do, is unaffected.

Two things follow.

The Popover API sits comfortably below the floor in every engine. The top layer
and light dismiss are free, and reimplementing either would break the rule in
CONTRIBUTING.

Anchor positioning is a Firefox and Safari problem specifically. Chrome has
placed anchored boxes correctly since 125, which is *below* the floor, so the
engine most readers test in already has the feature. Firefox needs 147 and
Safari needs 26. Both are far above the floor, and one engine missing it is
enough: a component that positions itself only in Chrome is not a component.

## Decision

Do not make CSS Anchor Positioning a baseline requirement, and do not move the
floor to reach it. Reaching it means Firefox 147 and Safari 26, which excludes
most of the installed base to gain one convenience.

Instead:

1. **The Popover API carries the top layer and light dismiss** in every floating
   component at every supported version. That part the platform already does.
2. **Position declaratively where anchor positioning exists**, behind a single
   `@supports (position-anchor: --x)`. Guard on the property actually relied on
   rather than on `anchor-name`; both gate at the same versions today, and the
   one named in the guard is the one that would break if that stopped being
   true.
3. **At the floor, compute the position in script.** A popover lives in the top
   layer, so it has no containing block to be `position: absolute` against.
   Script is the only remaining option: measure the anchor, place the box, flip
   when it would overflow. Roughly forty lines.

Point 3 is neither a polyfill nor a reimplementation. It supplies a value the
platform does not yet compute at this floor, and it deletes the day the floor
passes anchor positioning. Keep it in one shared module so there is one thing to
delete rather than three.

## The combobox does not need any of this

An `<hs-combobox>` listbox sits directly beneath its input, always. Ordinary
`position: absolute` inside a positioned host is enough. No top layer, no popover,
no script, no feature query.

Accessibility pushes the same way. The listbox stays in the same shadow root as
the input, so `aria-activedescendant` and `aria-controls` reference ids in one
tree. Moving it to the top layer would not change that, but it would add a
dismissal model that fights the combobox's own Escape handling.

The limitation worth documenting for consumers: an `overflow: hidden` ancestor
clips the listbox. The consumer controls that, and the alternative costs more than
it returns.

## What this changes

Nothing in CLAUDE.md. The floor stays at Chrome 131, Firefox 133, Safari 18, and
no new required feature joins the list.

## Revisit when

Firefox 147 and Safari 26 both sit at or below the floor. At that point the
script fallback and its `@supports` guard both delete, and the components keep
working unchanged.
