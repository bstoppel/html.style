# Design system

Everything configurable is a CSS custom property with a default. Nothing has to
be set for the framework to work, and anything can be changed without touching
the stylesheet or reaching into a shadow root.

## Three tiers

```
--p-brand-600         primitive   a raw value
    ↓
--color-action-primary  semantic  a role, resolved per colour scheme
    ↓
--color-action-hover     state    derived from the semantic value
```

**Primitives** (`--p-*`) are raw values with no opinion about use: colour ramps,
the spacing scale, type sizes, radii, shadows, durations, easings, border widths,
layering. Change one and everything above it moves.

**Semantic** tokens name a *role* — `--color-action-primary`,
`--color-feedback-error-text`, `--space-gutter`, `--motion-duration`. These are
what components and pages reference. They resolve per colour scheme through
`light-dark()`.

**State** tokens are derived with relative colour syntax rather than authored:

```css
--color-action-hover: light-dark(
  oklch(from var(--color-action-primary) calc(l - 0.08) c h),
  oklch(from var(--color-action-primary) calc(l + 0.08) c h)
);
```

Hover moves *away* from the text colour in each scheme — darker on light,
lighter on dark — so contrast improves on interaction rather than degrading.

## What exists

| Category | Prefix | Covers |
|---|---|---|
| Colour | `--p-brand-*`, `--p-neutral-*`, `--color-*` | brand and neutral ramps, surfaces, text, borders, actions, feedback |
| Spacing | `--p-space-*`, `--space-*` | a 7-step scale, plus inline / block / gutter / component roles |
| Typography | `--p-font-*`, `--p-text-*`, `--font-*`, `--text-*` | three stacks and a 7-step fluid scale built on `clamp()` |
| Radius | `--p-radius-*` | sm through full |
| Shadow | `--p-shadow-*` | sm through xl |
| Motion | `--p-duration-*`, `--p-ease-*`, `--motion-*` | three durations, three easings |
| Borders | `--p-border-*`, `--border-width*` | thin / thick / heavy |
| Focus | `--focus-ring-*` | width, offset, colour |
| Layering | `--p-layer-*` | base, raised, sticky, overlay |

`src/css/html.style.css` is the source of truth; the tokens layer is one block
near the top of the file.

## Rebranding

The brand ramp is generated from one hue, so changing it is a single line:

```css
:root {
  --p-brand-hue: 200; /* blue instead of purple */
}
```

Four presets ship as attribute variants:

```html
<html data-brand="green">
```

## Component settings

Components expose their own properties as `--hs-<element>-<setting>`, each with a
default that falls back to a semantic token:

```css
background: var(--hs-toggle-track-color, var(--color-border-emphasis));
```

So a component follows the theme with no configuration, and can be overridden
without any.

```css
/* Every switch on the page */
:root {
  --hs-toggle-track-inline-size: 3rem;
  --hs-toggle-track-color-checked: rebeccapurple;
}

/* Or just one */
hs-toggle.large {
  --hs-toggle-thumb-size: 1.5rem;
}
```

Light-DOM components use the same convention. A consumer *could* just write
`hs-alert { padding: 2rem }` — there is no boundary in the way — but the token
is still the better route: it cascades to descendants, it will not lose a
specificity fight with a variant rule, and it is a documented, supported surface
rather than an arbitrary declaration that might move.

Variants set an internal default rather than the public property, so an author
override wins over the variant despite the variant's higher specificity:

```css
hs-alert            { background: var(--hs-alert-background, var(--_alert-bg)); }
hs-alert[variant="error"] { --_alert-bg: var(--color-feedback-error-surface); }
```

**Overriding matters most for shadow-DOM components.** `::part()` can restyle the
elements a component exposes, but it loses to sizes declared inside the shadow
root — so a custom property is the only way in. Sizes that depend on other sizes
are derived rather than hardcoded: resize `hs-toggle`'s track and the thumb's
travel follows.

Every component's properties are listed in
[`dist/custom-elements.json`](../dist/custom-elements.json), which is generated
from the source, so that list cannot drift from the code. Editors read it
automatically.

## Motion and reduced motion

Build transitions from the tokens:

```css
transition: background var(--motion-duration) var(--motion-ease);
```

Under `prefers-reduced-motion: reduce` the framework collapses
`--motion-duration` on `:root`. **Custom properties inherit through a shadow
boundary**, so this reaches inside components — a media query in the global
stylesheet cannot. A component that builds its transitions from the token needs
no reduced-motion rule of its own.

## Colour schemes

`color-scheme: light dark` is set on `:root`, and every semantic colour is a
`light-dark()` pair. There is no class to toggle and no JavaScript required —
the system preference works on its own. `<hs-theme-toggle>` overrides it and
remembers the choice.

High contrast (`prefers-contrast: more`), forced colours, and print each
redefine the affected tokens rather than restyling components, so the override
reaches everything that uses them.
