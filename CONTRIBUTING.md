# Contributing to html.style

Thank you for your interest in contributing to html.style! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, constructive, and professional in all interactions.

## How to Contribute

### Reporting Issues

- Check if the issue already exists
- Use a clear, descriptive title
- Include browser version and OS
- Provide minimal reproduction steps
- Include expected vs actual behavior

### Suggesting Features

- Check existing issues and discussions
- Explain the use case and benefit
- Consider if it aligns with project philosophy (web standards, delete-key friendly, AI-friendly)

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly across browsers
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Development Guidelines

### Code Style

- Follow `.editorconfig` settings (2 spaces, LF line endings)
- Use semantic HTML where possible
- Prefer modern CSS features (container queries, OKLCH, cascade layers)
- Keep JavaScript out of atoms and layout primitives; it belongs in components

### CSS Standards

**Colors:**
```css
/* OKLCH only - no hex fallback */
.element {
  background: oklch(0.6 0.18 260);
}
```
OKLCH predates the supported browser floor by many versions, so a fallback
declaration is dead weight. The framework's own stylesheet carries none.

**Design Tokens:**
- Primitives: `--p-*` prefix
- Semantic: `--color-*`, `--space-*`
- State: Derived using Relative Color Syntax

**Cascade Layers:**
```css
@layer reset, tokens, atoms, molecules, organisms, templates;
```

**Naming:**
- Component elements: `<hs-*>` (a custom element name requires a hyphen)
- Component classes: `.component-name`, `.component-name--variant`
- Layout primitives: `.stack`, `.cluster`, `.grid`
- Atoms layer: Style semantic HTML directly (NO classes)

### JavaScript Standards

- **Progressive enhancement is scoped.** Atoms and layout primitives work with
  JavaScript disabled. Components do not - Declarative Shadow DOM renders their
  markup server-side, but interactivity requires hydration. Do not describe the
  component layer as working without JS.
- Components are custom elements prefixed `hs-`, one per file in `src/components/`
- Shadow-DOM components extend Lit; light-DOM components may extend
  `HTMLElement` directly
- Shadow components must restate the reset they need (`box-sizing`,
  `prefers-reduced-motion`) — the global reset stops at the shadow boundary
- Give every shadow component a `hs-*:not(:defined)` rule in the global
  stylesheet that reserves its box, so the no-build path has no layout shift
- Use native APIs over libraries (`<dialog>`, Popover API, `ElementInternals`)
- Feature detection, not browser sniffing
- Respect Global Privacy Control (GPC)
- ES modules (`import`/`export`)

**Which tier?** No behaviour at all means a CSS-only element — styled by the
global stylesheet, registered only so editors see it. Behaviour over content the
consumer provides means light DOM. Owning internal structure means shadow DOM.
When in doubt, reach for the lighter tier.

### Before adding a component

`<hs-*>` elements are **additive**: they extend a baseline of styled semantic
HTML rather than replacing it, so someone who knows only the HTML spec gets a
working page. That property is not automatic. It survives only if each new
component obeys two rules.

**1. Where a native element exists, wrap it. Never shadow it.**

`<hs-dialog>` contains a real `<dialog>`. `<hs-accordion>` coordinates real
`<details>`. `<hs-field>` wires a real `<input>`. Platform behaviour keeps
working inside them, so `<form method="dialog">` still closes an `<hs-dialog>`
and `::backdrop` still styles its backdrop. A contributor can reason through the
element instead of memorizing it.

This implies a hard rule: **never introduce an `<hs-*>` element that duplicates
an already-styled atom.** We would reject `<hs-button>`. The plain `<button>`
already works, and a custom twin forces a choice where none existed while making
the plain element look wrong. The same goes for `<hs-input>`, `<hs-table>`, and
`<hs-heading>`.

**2. Reach for shadow DOM only where the platform offers nothing.**

Two components are opaque today and both earn it: `<hs-tabs>` (no native
tablist) and `<hs-toggle>` (no cross-browser native switch). Shadow DOM costs
the global stylesheet, `<label for>`, form participation, and slotted content
styling. Pay that only when no native element exists to build on.

A proposal that fails either rule changes the framework's design. Open a
discussion and make the case before writing the component.

### Accessibility

- WCAG AA minimum (4.5:1 contrast for normal text)
- Semantic HTML elements
- ARIA only when semantic HTML insufficient
- Test with keyboard navigation
- Test with screen readers

### Testing

Before submitting:

- Run `npm run docs:check` — verifies the docs still match the code: file trees,
  internal links, npm scripts, and that every shipped element is documented
- Run `npm test` — note this covers **Chromium only**; it is the single project configured
  in `playwright.config.js` (see [tests/README.md](tests/README.md))
- Manually verify in Firefox and Safari, at or above the supported floors in the
  [README](README.md#browser-support) — the automated suite does not cover these engines
- Test light and dark modes
- Test at various viewport sizes
- Verify container queries work correctly
- Run accessibility checks (axe, Lighthouse)
- Check Core Web Vitals (LCP, CLS, INP)

### Commit Messages

Use conventional commits format:

```
feat: add split hero organism
fix: correct container query breakpoint
docs: update README with new examples
refactor: simplify theme toggle logic
test: add visual regression tests
```

## Project Philosophy

### Core Principles

1. **Semantic HTML First** - Atoms layer = NO classes
2. **Container Queries Over Media Queries** - Components adapt to container
3. **OKLCH Color System** - All colors use OKLCH
4. **Build On, Don't Reimplement** - wrap a native element whenever the wrapper
   adds clarity or a better API, but never recreate platform behavior in
   JavaScript; no JavaScript for anything CSS or semantic HTML already does
5. **Components Are Additive** - `<hs-*>` elements extend the styled baseline
   rather than replacing it, and never duplicate an atom that already works.
   See [Before adding a component](#before-adding-a-component)
6. **AI-Friendly** - Predictable, machine-readable patterns
7. **Delete-Key Friendly** - Only include essentials

### What We Accept

- Bug fixes
- Performance improvements
- Accessibility enhancements
- Modern CSS feature adoption (when baseline)
- Documentation improvements
- Test additions

### Dependencies

**Lit is the single sanctioned runtime dependency**, for shadow-DOM components only.

Writing reactive attributes, template caching, and Declarative Shadow DOM
serialisation by hand is several hundred lines of infrastructure before the first
component ships, and DSD is a hard requirement here rather than an optimisation.
Lit is ~5KB and `@lit-labs/ssr` covers the serialisation directly. This is a
deliberate, bounded exception to the no-dependency rule - not a precedent.

Proposals for any other runtime dependency should expect to be rejected.

### What We Don't Accept

- Runtime dependencies other than Lit (see above)
- Non-standard color formats (prefer OKLCH)
- Utility class frameworks (we use semantic HTML)
- Build-time complexity without clear benefit
- Features that duplicate native browser capabilities

## Questions?

- Open a discussion for general questions
- Check [CLAUDE.md](CLAUDE.md) for detailed patterns and conventions
- Review [src/examples.html](src/examples.html) for component demonstrations

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
