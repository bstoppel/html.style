# Nav collapse without a width media query

> Decision record for [#56](https://github.com/bstoppel/html.style/issues/56).
> Status: Accepted.
> Evidence: `popovertarget` implicit `aria-expanded`/`aria-details` wiring,
> checked against current WHATWG HTML spec discussion and Chrome/Firefox/Safari
> behavior, 2026-09-14. Prior art: Adrian Roselli, "Link + Popover Navigation"
> (2026-07) and "Disclosure Widgets" (2020-05); Cloud Four, "A details element
> as a burger menu is not accessible."

CLAUDE.md is explicit that width-based `@media` is not used anywhere in the
framework. A hamburger breakpoint is the textbook case for one, so collapsing
navigation into a toggle has to come from somewhere else: a container query,
or the intrinsic switch (`flex-basis: calc(...)`) `.switcher` and `.card`
already use. Nothing had decided which, or what "collapsed" even means for a
list of navigation links as opposed to `<hs-menu>`'s list of commands.

## What the evidence says

The intrinsic switch is built for continuous reflow — items that are all
present and just wrap differently as space changes. Nav collapse isn't
continuous: at any given width, either the inline links show and the toggle
doesn't, or the reverse. That's a discrete state, which is what `@container`
is for, not the flex-basis trick.

`<hs-menu>` implements the ARIA *menu-button* pattern: `role="menu"`, roving
tabindex, arrow-key and typeahead navigation, `menuitem` buttons that fire an
action and close. Site navigation is the ARIA *disclosure* pattern: plain
`<a>` links, normal Tab order, no roving tabindex, `aria-current="page"`
instead of a selected state. These are different widgets by specification,
not two configurations of one — using `role="menu"` for links that navigate
is a documented anti-pattern.

`popovertarget`/`popover` wire `aria-expanded` and `aria-details` between a
toggle and its panel automatically, implemented across Chrome, Firefox and
Safari at this project's floor. That removes the historical objection to a
JS-free toggle (a checkbox-hack toggle has no accessible state at all):
this isn't a CSS hack standing in for a missing platform feature, it *is*
the platform feature. `<details>/<summary>` is the other native disclosure
primitive and has a documented accessibility problem specifically when
repurposed as a burger toggle — its generic disclosure-triangle semantics
don't match what a nav toggle needs.

## Decision

1. **Mechanism: a container query, not the intrinsic switch.** The `<nav>`
   sets `container-type: inline-size`; the inline link list and the toggle
   live below it and query it. An element is never its own query container,
   so neither queries the nav itself — the same rule CLAUDE.md's own
   container-query incident already establishes.
2. **A new CSS-only `<hs-*>` element, not `<hs-menu>`.** No shadow root, no
   JS — the same tier as `<hs-card>`, and consistent with "prefer an element
   over a class where both would work." Reusing or extending `<hs-menu>`
   would mean either misusing `role="menu"` for links or forking so much of
   its behavior that nothing is actually shared.
3. **The toggle is native `popovertarget`/`popover`.** No hand-rolled JS —
   there's nothing left for it to do once the browser wires the ARIA state.
   `<details>` is ruled out for the reason above.
4. **One link list, not two.** The list itself carries `popover`; the
   container query forces it into normal flow (`display: flex; position:
   static`) at wide widths, and the browser's own popover mechanics —
   hidden, then shown in the top layer, light-dismiss — take over at narrow
   ones. A consumer writes their nav links once.
5. **A11y model:** a real `<nav>` landmark, plain `<a>` links,
   `aria-current="page"` for the active page, no `role="menu"` or
   `menuitem`, no roving tabindex.

## Alternatives rejected

1. **The intrinsic switch** (`.switcher`/`.card`'s `flex-basis: calc(...)`
   trick) — built for continuous reflow, not a discrete show-toggle-XOR-show-
   links state.
2. **Reusing or extending `<hs-menu>`** — implements the wrong ARIA pattern
   for navigation; menus are for actions, not links that navigate.
3. **`<details>`/`<summary>` as the toggle primitive** — documented
   accessibility problems when repurposed as a burger menu.
4. **A hand-rolled JS toggle** — redundant once native `popovertarget`/
   `popover` supplies the accessible state for free.
5. **Duplicate markup** (a separate inline `<ul>` and a separate popover
   `<ul>`) — works, but doubles what every consumer maintains and duplicates
   a navigation landmark's links, a minor a11y smell of its own.

## Out of scope

Multi-level or mega-menu navigation with nested submenus, and sticky or
scroll-aware headers — unchanged from the epic's original scope. This record
covers the collapse mechanism for one row of top-level items only.

## What this changes

Nothing shipped yet. This unblocks #56: stories can now be cut against a
settled mechanism instead of an open question.

## Revisit when

`popovertarget`/`popover` implicit ARIA support regresses or is found
incomplete in a supported engine, or a real multi-level nav requirement
arrives that this record's out-of-scope note deferred.
