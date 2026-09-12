# html.style

A CSS framework that styles the HTML you already know. Built on OKLCH, container
queries and cascade layers for 2026 and beyond.

## The Idea

Write plain HTML. It comes out styled.

```html
<h1>Settings</h1>
<form>
  <label for="email">Email</label>
  <input id="email" type="email" required>
  <button>Save</button>
</form>
<details><summary>Advanced</summary>Nothing to see yet.</details>
```

No classes, no components, no vocabulary. The stylesheet styles the elements
themselves, so a document written from nothing but the HTML spec renders themed,
accessible, and dark-mode aware. The framework targets a web where machines write
most of the HTML. A model already knows the specification, so the framework needs
no training and no configuration.

The `<hs-*>` elements extend that baseline rather than replacing it. The
framework ships eleven, each described in a generated
[custom elements manifest](#editor-and-agent-support), and three properties
govern all of them.

### The elements are additive

You never have to reach for one. `<article>` is already a styled article, and
[`<hs-card>`](#hs-card-and-hs-badge) adds container-query padding on top.
`<div class="alert">` already works, and [`<hs-alert>`](#hs-alert) adds
dismissal. Every custom element is a step up from something that already
rendered correctly, so nothing separates plain markup from framework markup.

### The elements are transparent

Where the platform already solves a problem, the component wraps it rather than
reimplementing it:

| Element | Contains | Platform does |
|---|---|---|
| [`<hs-dialog>`](#hs-dialog) | a real `<dialog>` | top layer, backdrop, focus trap, Escape, focus return |
| [`<hs-accordion>`](#hs-accordion) | real `<details>` | disclosure, keyboard, exclusive grouping via `name` |
| [`<hs-field>`](#hs-field) | a real `<input>` | `<label for>`, Constraint Validation, localized messages |
| [`<hs-copy>`](#hs-copy) | a real `<button>` | focus, activation, accessible name |
| [`<hs-sortable>`](#hs-sortable) | a real `<table>` | table semantics, row and column relationships, `aria-sort` |

Platform knowledge keeps applying inside the component. `<form method="dialog">`
still closes an `<hs-dialog>`, and `::backdrop` still styles its backdrop. Reason
through the element instead of memorizing it.

The opaque components are the ones with nothing to wrap. [`<hs-tabs>`](#hs-tabs),
[`<hs-toggle>`](#hs-toggle), [`<hs-combobox>`](#hs-combobox) and
[`<hs-menu>`](#hs-menu) use shadow DOM because the platform has no tablist, no
cross-browser switch, no combobox and no menu widget. Opaque is not the same as
self-built: `<hs-menu>` still takes its top layer, light dismiss and Escape from
the Popover API.

### They degrade rather than disappear

Guess wrong and the page gets plainer, never broken:

- `<hs-card>` and `<hs-badge>` render from CSS alone. Their scripts are empty
  registrations that exist only so editors offer completion.
- Light-DOM components look right before their JavaScript loads, because the
  global stylesheet styles the tag directly.
- The shadow components reserve their box through `hs-*:not(:defined)`, so the
  layout does not shift when the script arrives.

An unregistered custom element is normally invisible: `display: inline` with no
styles. None of these vanish.

## Getting Started

### Download

**Option 1: Direct Download**
1. Download the [latest release](https://github.com/bstoppel/html.style/releases)
2. Extract the ZIP file
3. Open `dist/index.html` in your browser
4. Start building!

**Option 2: npm**
```bash
npm install html.style
```

**Option 3: Clone the repository**
```bash
git clone https://github.com/bstoppel/html.style.git
cd html.style
open dist/index.html
```

### What's Included

```
html.style/
├── dist/                             # What you copy — everything below is generated
│   ├── css/html.style.css            # Framework styles
│   ├── js/
│   │   ├── html.style.js             # Optional enhancements
│   │   ├── html.style.components.js  # All components, one ES module bundle
│   │   └── html.style.components.classic.js  # Same, for file:// pages
│   ├── components/                   # Individual component modules
│   ├── custom-elements.json          # Manifest — editor completion for <hs-*>
│   ├── index.html                    # Starter template
│   ├── examples.html                 # Showcase of every pattern
│   ├── example-vanilla.html          # Minimal no-build page
│   ├── template-landing.html         # Landing page example
│   ├── template-blog.html            # Blog layout example
│   ├── 404.html
│   ├── favicon.svg
│   ├── site.webmanifest
│   └── robots.txt
├── src/                              # The only hand-edited tree
│   ├── css/, js/, components/        # Sources for the above
│   ├── partials/                     # Build-time HTML partials
│   └── *.html                        # Page sources
└── docs/                             # frameworks.md, design-system.md, positioning.md
```

### Quick Start: Just Open and Edit

No build process required. Open `dist/index.html` in your code editor and start building. The framework uses modern web standards that work directly in browsers.

One caveat worth knowing up front: **no build step is not the same as no server.** ES modules are blocked from `file://` by CORS, so pages using `<script type="module">` need to be served over HTTP — any static server will do (`npx http-server dist`). Stylesheets and plain HTML work fine from disk either way, and components additionally ship a classic-script build that works from `file://`. See [docs/frameworks.md](docs/frameworks.md).

## Features

- **OKLCH Color System** - Perceptually uniform colors with Display P3 wide gamut support
- **Browser-Native Theming** - Uses `light-dark()` function and `color-scheme` property
- **Container Queries** - Components adapt to their container, not the viewport
- **Semantic HTML First** - Style HTML tags directly; plain markup renders correctly with no classes and no components
- **Cascade Layers** - Predictable specificity with `@layer` (reset, tokens, atoms, molecules, organisms, templates)
- **Three-Tier Design Tokens** - Primitives → Semantic → State (derived via Relative Color Syntax)
- **Layout Primitives** - Intrinsically responsive layouts (stack, cluster, grid, center, switcher)
- **Configurable by Design** - Every component setting is a CSS custom property with a default; nothing must be set, anything can be changed
- **Machine-Readable** - A generated `custom-elements.json` gives editors and agents completion for every element, attribute, slot, event, part and setting
- **Progressive Enhancement** - Atoms and layout work with no JavaScript at all; components add behaviour on top
- **Privacy-First** - Global Privacy Control (GPC) detection and compliance
- **Additive Components** - `<hs-*>` elements extend the styled baseline rather than replacing it; shadow DOM is reserved for the few that own internal structure the platform gives no element for, so platform behaviour and your own stylesheet keep working inside the rest

## Basic Usage

The `dist/` folder contains everything you need. Copy it to your project and start editing `index.html`.

### Minimal Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <link rel="stylesheet" href="css/html.style.css">
  <title>My Project</title>
</head>
<body>
  <main>
    <h1>Hello World</h1>
    <p>Start building with semantic HTML.</p>
    <button>Click Me</button>
  </main>
  <script type="module" src="js/html.style.js"></script>
</body>
</html>
```

### Using from npm

```bash
npm install html.style
```

Then import in your project:
```javascript
import 'html.style/dist/css/html.style.css';
```

Or link directly:
```html
<link rel="stylesheet" href="node_modules/html.style/dist/css/html.style.css">
```

## Usage Examples

### Theme Switching

```html
<hs-theme-toggle></hs-theme-toggle>
```

That is the whole thing — it renders a real `<button>`, remembers the choice,
and reports its state with `aria-pressed`.

An inline `onclick` handler cannot work here: `ThemeManager` is an ES module
export, not a global, so the handler has nothing to call. Use the component, or
wire it up from a module:

```javascript
import { ThemeManager } from './js/html.style.js';

ThemeManager.setTheme('dark');  // 'light', 'dark', or 'auto'
```

### Layout Primitives

```html
<!-- Vertical stack with automatic spacing -->
<div class="stack">
  <h2>Section Title</h2>
  <p>Content here...</p>
  <button>Action</button>
</div>

<!-- Horizontal cluster with wrapping -->
<div class="cluster">
  <button>First</button>
  <button>Second</button>
  <button>Third</button>
</div>

<!-- Responsive grid (auto-fit) -->
<div class="card-grid">
  <hs-card>...</hs-card>
  <hs-card>...</hs-card>
  <hs-card>...</hs-card>
</div>

<!-- Switcher: side by side until the container is too narrow, then stacked -->
<div class="switcher">
  <div>First</div>
  <div>Second</div>
</div>
```

### Cards with Container Queries

```html
<article class="card">
  <div class="stack">
    <h3>Card Title</h3>
    <p>Card adapts to its container width, not viewport.</p>
  </div>
</article>
```

### Alerts

There is also an [`<hs-alert>`](#hs-alert) element, which adds dismissal. The
class form below stays supported and needs no JavaScript.

```html
<div class="alert alert--success" role="alert">
  <strong>Success!</strong> Your changes have been saved.
</div>

<div class="alert alert--warning" role="alert">
  <strong>Warning!</strong> Please review before proceeding.
</div>

<div class="alert alert--error" role="alert">
  <strong>Error!</strong> Unable to process request.
</div>
```

### Forms

[`<hs-field>`](#hs-field) does this wiring for you — generating the id,
associating the label, and reporting the browser's own validation message. The
manual form below stays supported.

```html
<form class="stack">
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" required>
  </div>

  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" rows="4"></textarea>
  </div>

  <button type="submit">Send</button>
</form>
```

## Components

Atoms are plain semantic HTML and layout primitives are CSS classes — neither
needs JavaScript. Components are custom elements, used where behaviour or
composed structure earns them.

**No build step required.** The bundle has everything inlined, so a plain HTML
file works:

```html
<script type="module" src="js/html.style.components.js"></script>
```

Opening the page from `file://` instead of a server? Use the classic build —
ES modules are blocked from `file://` by CORS:

```html
<script src="js/html.style.components.classic.js" defer></script>
```

Full setup for React, Vue, Angular, Svelte and Solid, plus the behaviours that
surprise people, is in **[docs/frameworks.md](docs/frameworks.md)**. A complete
working vanilla page is [src/example-vanilla.html](src/example-vanilla.html).

Or import just what you need:

```javascript
import 'html.style/components/hs-toggle.js';
```

### Editor and agent support

The package ships a [custom elements manifest](https://github.com/webcomponents/custom-elements-manifest)
at `dist/custom-elements.json`, declared via the `customElements` field in
`package.json`. Editors that read it (VS Code, JetBrains) give completion and
hover documentation for every `<hs-*>` element, its attributes, slots, events,
CSS parts, and themeable custom properties.

### hs-card and hs-badge

CSS-only elements: no JavaScript, no shadow root. The stylesheet styles the tag
directly, so they render with scripts disabled and without importing anything.

```html
<hs-card>
  <h3>Title</h3>
  <p>Content. <hs-badge>New</hs-badge></p>
</hs-card>
```

They are registered only so editors offer completion for them — rendering never
depends on it. The `.card` and `.badge` class forms stay supported.

### hs-alert

Light DOM, so the global stylesheet styles it exactly as `.alert` and it looks
right before its JavaScript loads. JavaScript only adds dismissal.

```html
<hs-alert variant="success">
  <strong>Saved.</strong> Your changes are stored.
</hs-alert>

<hs-alert variant="info" dismissible>You can close this one.</hs-alert>
```

`variant` accepts `success`, `warning`, `error`, `info`. A `dismissible` alert
fires a cancelable `hs-dismiss` event before removing itself.

### hs-toast

Light DOM, and the transient sibling of [`<hs-alert>`](#hs-alert).
`<hs-toast-region>` is the live region; toasts go into it.

```html
<hs-toast-region></hs-toast-region>
```

```javascript
document.querySelector('hs-toast-region').show('Draft saved', { variant: 'success' });
```

The region has to be light DOM and has to be in the page first: a live region
announces what arrives in it, so it has to exist before the message does and has
to be somewhere a screen reader is already watching. The message could have been
a shadow component and is not, so the announced text stays in the same tree as
the region announcing it.

It is `role="status"`, which is polite, plus `aria-atomic="false"` — `status`
implies atomic `true`, which would re-announce the whole stack every time a toast
arrived. An `error` toast carries `role="alert"` itself, raising that one message
to assertive without changing the region's politeness.

Nothing moves focus. A message you have to dismiss before carrying on is a
dialog, and this is not one — keep toast content to text, since a timeout that
takes a control away mid-interaction is worse than no control.

`duration` is milliseconds, defaulting to 5000; zero leaves the toast up.
Hovering it or focusing something inside pauses the countdown, and it resumes
when both leave. `prefers-reduced-motion` removes the entrance animation and
deliberately leaves the timeout alone, because the message needs the same time to
read either way. Dismissal removes the element outright rather than animating
out: an exit would have to wait on `animationend`, which never fires on a hidden
page, and a toast that never leaves is the bug this is built to avoid.

`show()` returns the toast. `clear()` dismisses everything showing. Both respect
a cancelled `hs-dismiss`, the same cancelable event `<hs-alert>` fires.

The region is fixed to the bottom-right corner and takes no pointer events, so it
never swallows a click meant for the page. It is light DOM, so move it by
restyling `hs-toast-region` directly. One limit worth knowing: a modal
`<dialog>` is in the top layer, which paints above any `z-index`, so a toast
raised while one is open is behind it.

### hs-toggle

Shadow DOM, because it owns its internal structure. There is no cross-browser
native switch, which is what earns it a component. It participates in forms
through `ElementInternals` — submitting, resetting, and restoring like a native
control.

```html
<form>
  <hs-toggle name="notifications" checked>Email notifications</hs-toggle>
  <hs-toggle name="digest">Weekly digest</hs-toggle>
</form>
```

Theme it with the design tokens, which inherit through the shadow boundary, or
target `::part(track)` and `::part(thumb)`.

### hs-tabs

Shadow DOM. The platform provides nothing here, so the component supplies roving
tabindex, arrow-key navigation, and the ARIA wiring. Write panels and their
labels; the tablist is derived from them.

```html
<hs-tabs>
  <hs-tab-panel label="Overview">Anything you like.</hs-tab-panel>
  <hs-tab-panel label="Details">Including markup.</hs-tab-panel>
</hs-tabs>
```

Arrow keys move between tabs and wrap; Home and End jump to the ends. Add
`activation="manual"` to move focus without selecting until Enter or Space —
useful when switching tabs is expensive. Fires `hs-tab-change` with
`{ index, label }`, and exposes `::part(tablist)`, `::part(tab)`,
`::part(tab-active)` and `::part(panel)`.

### hs-field

Light DOM, wiring a native control. `<label for>`, the Constraint Validation
API, and `aria-describedby` are all platform machinery — the component does the
wiring people get wrong.

```html
<hs-field label="Email address" hint="We never share it.">
  <input type="email" name="email" required>
</hs-field>
```

It generates the id, associates the label, points `aria-describedby` at the
hint, and on failure shows **the browser's own** `validationMessage` — so the
text stays localised rather than hand-written. An author-supplied `<label>` is
left alone; the component only fills gaps. Add `novalidate` to suppress
reporting without disabling validation.

Light DOM is mandatory here rather than preferred: `<label for>` does not cross
a shadow boundary, and a control inside one does not participate in the
surrounding form.

### hs-combobox

Shadow DOM, because it owns an input, a listbox, and the options in it. **Not a
replacement for `<select>`** — that element is already styled and already works.
The gap is filtering a long list by typing, which the platform has no element
for. `<datalist>` is the nearest native thing and does not close it: no custom
option rendering, no control over matching, and different behaviour in every
engine.

```html
<hs-combobox name="city" label="City" placeholder="Start typing…">
  <hs-option value="berlin">Berlin</hs-option>
  <hs-option value="hamburg">Hamburg</hs-option>
  <hs-option value="munich">Munich</hs-option>
</hs-combobox>
```

The `<hs-option>` elements are data, not rendering — the options you see are
built in the shadow root from their value and text. That is the same reason
[`<hs-tabs>`](#hs-tabs) builds its tablist there: `aria-activedescendant` and
`aria-controls` are IDREFs, and an IDREF cannot cross a shadow boundary.

Arrow keys move the active option and wrap; Home and End jump to the ends; Enter
commits; Escape abandons the edit in progress and keeps the last committed value.
Focus stays on the input throughout, which is what `aria-activedescendant` is
for. It participates in forms through `ElementInternals`, so it submits, resets,
and restores on back/forward navigation like a native control.

Fires `change` when the value changes, plus `hs-open` and `hs-close`. Exposes
`::part(label)`, `::part(input)`, `::part(listbox)`, `::part(option)` and
`::part(option-active)`.

The listbox is deliberately **not** a popover and not in the top layer. It sits
directly under its input, so ordinary absolute positioning reaches it, and CSS
Anchor Positioning is not available at the supported floor — see
[docs/positioning.md](docs/positioning.md). The trade is that an
`overflow: hidden` ancestor clips the list; you control that.

### hs-menu

Shadow DOM, because it owns the trigger, the menu box and the items. `<menu>` is
a list element, not a menu widget, so nothing in the platform pairs a button with
a list of commands.

```html
<hs-menu label="Actions">
  <hs-menu-item value="duplicate">Duplicate</hs-menu-item>
  <hs-menu-item value="rename">Rename</hs-menu-item>
  <hs-menu-item value="delete">Delete</hs-menu-item>
</hs-menu>
```

The `<hs-menu-item>` elements are data, not rendering, the same way
[`<hs-combobox>`](#hs-combobox) treats `<hs-option>`. The items you see are real
`<button>` elements built in the shadow root, because a menu item has to be a
button and roving tabindex means the component has to own the tab order.

The box is a popover, so the top layer, light dismiss and Escape are the
platform's. `popovertarget` on the trigger handles the case that is awkward to
hand-roll: clicking the trigger while the menu is open closes it, instead of the
dismissal closing it and the same click reopening it.

Arrow keys move focus and wrap; Home and End jump to the ends; ArrowDown and
ArrowUp on the trigger open the menu at the first or last item; typing jumps to a
matching item. **Tab closes the menu and moves on** rather than cycling inside
it — a menu is not a dialog and must not trap the keyboard. Focus returns to the
trigger on dismissal, which the component does itself because a dismissed popover
drops focus to `<body>`.

Fires `hs-menu-select` with `{ value, label, index }`, plus `hs-open` and
`hs-close`. Exposes `::part(trigger)`, `::part(menu)` and `::part(item)`.

Positioning follows [docs/positioning.md](docs/positioning.md): declarative
anchor positioning where the browser has it, computed in script at the floor.
Set `--hs-anchor-gap` to change the distance from the trigger.

### hs-tooltip

Light DOM, and mandatory rather than preferred. `aria-describedby` is an IDREF
and an IDREF cannot cross a shadow boundary — the same fact that forces
[`<hs-combobox>`](#hs-combobox) to render its options inside its shadow root,
pointing the other way. The trigger is your element, out in the light DOM, so the
bubble describing it has to be out there too.

```html
<button id="delete">Delete</button>
<hs-tooltip for="delete">Removes the file permanently</hs-tooltip>
```

The element *is* the bubble. It becomes a popover on upgrade, so the top layer
comes from the platform, and it is hidden before that because a description is
not page content.

It appears on hover and on focus, hides on mouseleave and blur, and Escape
dismisses it without moving focus off the trigger. The bubble never takes the
pointer, which is also what keeps it from becoming somewhere to put interactive
content — if your content needs a tab stop it is a popover, not a tooltip. The
description is added to `aria-describedby` rather than replacing it, so a control
can keep a hint it already had.

The popover is `manual`, not `auto`. An auto popover closes every other auto
popover that is not its ancestor, so a tooltip appearing would close an open
[`<hs-menu>`](#hs-menu). `popover="hint"` exists for exactly this case and is
above the supported floor, and an unsupported value falls back to `manual`, which
would mean light dismiss in some supported browsers and not others.

The fade runs on `--motion-duration`, so `prefers-reduced-motion` removes it
through the token rather than a per-component media query. Fires `hs-open` and
`hs-close`.

`title` is the platform's version of this and is unusable: no touch support, no
styling, a delay nobody can configure, and screen reader treatment that differs
by engine.

### hs-sortable

Light DOM, wrapping a real `<table>`. **Not an `<hs-table>`** — CONTRIBUTING
names that as a rejection example, and `<table>` is already styled and already
works. Sorting is an enhancement over a table you wrote, so your markup stays
yours.

```html
<hs-sortable>
  <table>
    <thead>
      <tr>
        <th data-sort>Name</th>
        <th data-sort="number">Size</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>…</tbody>
  </table>
</hs-sortable>
```

`data-sort` on a `<th>` opts that column in; a header without it gets no control,
which is what keeps an actions column from offering a sort that means nothing.

**The control is the header itself.** Its content is moved into a real
`<button>`, so nothing is duplicated, the `<th>` keeps its `columnheader` role
and carries `aria-sort`, and Enter, Space, focus and voice control all come from
the platform rather than from a keydown handler. Making a `<th>` activatable with
`tabindex` instead would be a button reimplemented by hand.

That also settles the no-JavaScript case: the button exists only because the
script ran, so without it you get a plain, readable, document-order table and no
affordance promising an interaction that cannot happen.

Comparison defaults to `Intl.Collator` with `numeric: true`, which handles text,
bare integers, ISO dates and "Item 2" before "Item 10" with no configuration. It
is not a number sort — negatives and decimals collate wrongly — so a numeric
column says `data-sort="number"`, and values it cannot parse sort last in both
directions rather than taking the top on the way back. Anything else supplies its
own key with `data-sort-value` on the cell:

```html
<td data-sort-value="2026-03-04">4 March 2026</td>
```

Sorting is stable, so equal keys keep the order you wrote them in, and rows are
moved rather than recreated, so listeners on them survive. Each `<tbody>` sorts
within itself, since separate bodies are row groups. Fires `hs-sort` with
`{ column, direction, header }`.

A `<th>` with `colspan` is skipped: it heads more than one column, so which one
it would sort is ambiguous.

### hs-copy

Light DOM, wrapping a real `<button>` and using the Clipboard API.

```html
<pre id="snippet"><code>npm install html.style</code></pre>
<hs-copy for="snippet">Copy</hs-copy>
```

Confirmation is announced through a live region rather than by renaming the
button, since renaming a control mid-interaction loses voice-control users their
target. Fires `hs-copy` with the copied text, and `hs-copy-error` when the
Clipboard API rejects — which it does whenever the document is not focused.

### hs-dialog

Light DOM, wrapping a real `<dialog>`. The platform supplies the top layer,
backdrop, focus trap, Escape, focus return, and `<form method="dialog">`. The
component adds a declarative modal `open` — `<dialog open>` alone is *non*-modal
— and configures backdrop dismissal.

```html
<hs-dialog id="confirm">
  <h2>Delete this?</h2>
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="delete">Delete</button>
  </form>
</hs-dialog>
```

```javascript
document.querySelector('#confirm').show();
document.querySelector('#confirm').addEventListener('hs-close', (e) => {
  console.log(e.detail.returnValue); // "delete"
});
```

Add `persistent` to stop backdrop dismissal. Escape always works — a modal the
keyboard cannot close is a trap. Where the browser supports `closedBy` this is
configured natively rather than handled in JavaScript.

### hs-accordion

Light DOM, coordinating real `<details>` elements. Disclosure, keyboard and
accessibility are all native; the component assigns the shared `name` that makes
a group exclusive and reports one event for the whole group.

```html
<hs-accordion exclusive>
  <details><summary>Shipping</summary>…</details>
  <details open><summary>Returns</summary>…</details>
</hs-accordion>
```

Fires `hs-accordion-toggle` with `{ index, open }`. `closeAll()` and `openAll()`
have no native equivalent; `openAll()` is a deliberate no-op under `exclusive`,
since the browser would immediately close all but one.

### hs-theme-toggle

Light DOM. Renders a real `<button>` rather than reimplementing one, so focus,
activation and the accessible name stay native. It supplies only what the
platform lacks: reading the stored preference and flipping `color-scheme`.

```html
<hs-theme-toggle></hs-theme-toggle>
```

Reports state through `aria-pressed` and keeps its accessible name stable across
states, so voice control does not lose the target mid-interaction. Fires
`hs-theme-change` with `{ scheme }`.

A shadow component renders nothing until its module loads. Without a build step
there is no server render to supply Declarative Shadow DOM, so the stylesheet
reserves the component's box instead — the control is visible and the layout
does not shift when the script arrives. If you are server-rendering inside
another framework, its SSR can emit Declarative Shadow DOM for these elements.

## Design Tokens

### Using Design Tokens

```css
/* Primitives (--p- prefix) */
--p-brand-hue: 260;
--p-brand-600: oklch(0.6 0.18 var(--p-brand-hue));

/* Semantic tokens */
--color-action-primary: light-dark(var(--p-brand-600), oklch(0.7 0.2 var(--p-brand-hue)));

/* State tokens (derived) */
--color-action-hover: oklch(from var(--color-action-primary) calc(l + 0.1) c h);
```

Full reference, including the component-level settings and how theming crosses
the shadow boundary: **[docs/design-system.md](docs/design-system.md)**.

### Customizing Brand Colors

```css
:root {
  /* Change brand hue (0-360) */
  --p-brand-hue: 200; /* Blue instead of purple */
}

/* Or use theme variants */
html[data-theme="green"] {
  --p-brand-hue: 140;
}
```

## Component Examples

Two pages ship with the framework:

- **[`dist/examples.html`](src/examples.html)** — every pattern, including all eleven
  custom elements
- **[`dist/example-vanilla.html`](src/example-vanilla.html)** — a minimal page
  using the components with no framework and no build step

The showcase covers:

- Custom elements — cards, badges, alerts, toggles, tabs, fields, comboboxes,
  copy buttons, dialogs, accordions, theme toggle
- Typography (headings, paragraphs, lists, code)
- Buttons (primary, secondary, outline, disabled states)
- Forms (all input types, validation states)
- Alert messages (success, warning, error, info)
- Layout primitives (stack, cluster, grid, center, switcher)
- Native elements (details/summary, dialog, tables)
- Interactive container query demo

## Browser Support

html.style targets modern evergreen browsers:

- **Chrome/Edge**: 131+
- **Firefox**: 133+
- **Safari**: 18+

These are hard floors, not a rolling window — the required features below land at different absolute versions in each engine, and the binding constraint is full Relative Color Syntax support, which the derived state tokens rely on. There are no polyfills; the framework assumes every feature listed here is present.

Required features:
- CSS Container Queries
- OKLCH color space
- `light-dark()` function
- Cascade Layers (`@layer`)
- Relative Color Syntax

## JavaScript API

### ThemeManager

```javascript
import { ThemeManager } from './js/html.style.js';

// Initialize theme system
ThemeManager.init();

// Toggle between light and dark
const newTheme = ThemeManager.toggle();

// Set specific theme
ThemeManager.setTheme('dark');  // 'light', 'dark', or 'auto'
```

### FormEnhancements

```javascript
import { FormEnhancements } from './js/html.style.js';

// Add validation feedback
FormEnhancements.init();
```

### Other Modules

- `SmoothScroll` - Smooth scrolling for skip links (respects `prefers-reduced-motion`)
- `DialogEnhancements` - Adds backdrop-click dismissal to bare `<dialog>`
  elements. It skips any dialog owned by an [`<hs-dialog>`](#hs-dialog), which
  configures dismissal natively instead. Escape is the platform's, not this
- `ClipboardHelper` - Legacy. Not enabled by default (it is commented out of
  `init()`), and it injects a copy button into *every* code block. Use
  [`<hs-copy>`](#hs-copy) instead, which copies what you point it at.

## Accessibility

html.style is built with accessibility as a core principle:

- Semantic HTML elements
- WCAG AA color contrast (4.5:1 minimum)
- Focus visible indicators (`:focus-visible`)
- Skip links for keyboard navigation
- ARIA attributes where appropriate
- `prefers-reduced-motion` support
- `prefers-color-scheme` support
- Screen reader friendly markup

## Privacy

- **Global Privacy Control (GPC)** detection
- No tracking by default
- LocalStorage only for theme preference
- Optional analytics can be disabled via GPC

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [HTML5 Boilerplate](https://html5boilerplate.com/)
- Built on modern web standards
- Follows [Atomic Design](https://atomicdesign.bradfrost.com/) methodology
- Implements [Every Layout](https://every-layout.dev/) primitives

## Version

**v2026.1.0** - Year-based versioning (YYYY.MAJOR.MINOR)

---

Built with modern web standards for the AI-native web of 2026.
