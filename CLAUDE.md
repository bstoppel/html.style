# CLAUDE.md - html.style Project Guidelines

> This file provides context for Claude Code when working on the html.style project.

## Project Overview

**html.style** is a modern web standards-based CSS framework combining:
- CSS Framework/Library with pre-built components
- HTML Template Starter with best practices
- Design System with comprehensive styles and guidelines
- CSS Methodology for maintainable CSS

**Core Philosophy:**
- Modern web standards first (no polyfills)
- AI-friendly architecture for machine-readability
- Platform Native Engineering - semantic HTML maps to browser APIs
- Delete-key friendly - only include essentials

**Primary Users:** AI agents (by 2026) - every decision prioritizes machine-readability and predictability.

## Project Structure

```
html.style/
├── src/           # Source files (the only hand-edited tree)
│   ├── css/       # CSS source files
│   ├── js/        # JavaScript source files
│   ├── components/  # Web components, one <hs-*> element per file
│   ├── partials/  # Build-time HTML partials
│   └── *.html     # HTML templates
├── dist/          # Distribution files (what users download)
├── docs/          # Documentation
├── tests/         # Playwright tests
│   ├── a11y/      # Accessibility tests
│   ├── visual/    # Visual regression tests
│   └── performance/  # Core Web Vitals tests
└── website/       # Project website source
```

## Development Commands

```bash
npm run serve          # Start local dev server at http://localhost:8080
npm test               # Run all Playwright tests
npm run test:headed    # Run tests with browser visible
npm run test:ui        # Run tests with Playwright UI
npm run test:a11y      # Run accessibility tests only
npm run test:visual    # Run visual regression tests only
npm run test:performance  # Run performance tests only
```

## Key Technical Decisions

### Browser Support (2026 Baseline)
- Chrome/Edge 131+, Firefox 133+, Safari 18+
- Baseline features: Container Queries, OKLCH, light-dark(), Cascade Layers, Relative Color Syntax
- Floor is set by full Relative Color Syntax support, which the derived state tokens (`oklch(from ...)`) depend on. First support lands earlier (Chrome 119 / Firefox 128 / Safari 16.4) but is partial; `light-dark()` needs Chrome 123 / Firefox 120 / Safari 17.5
- Do not state the floor as a version count ("current - 4"): Chrome and Firefox ship majors ~4-weekly, Safari annually, and Safari's numbering jumped 18 to 26 in 2025
- Component APIs (Declarative Shadow DOM, `ElementInternals`, form-associated custom elements) all reached support well below this floor - the component layer needs no floor change
- No polyfills

### Color System: OKLCH
All colors use OKLCH format for:
- Perceptual uniformity across hues
- Wide gamut (Display P3) support
- Programmatic accessibility calculations
- AI-friendly color relationships

```css
/* Example */
--p-brand-600: oklch(0.6 0.18 260);
--color-action-hover: oklch(from var(--color-action-primary) calc(l + 0.1) c h);
```

### Cascade Layers
```css
@layer reset, tokens, atoms, molecules, organisms, templates;
```

### Three-Tier Design Tokens
1. **Primitives** (`--p-*`) - Raw values, infrastructure
2. **Semantic** (`--color-*`, `--space-*`) - Functional names by role
3. **State** - Derived via Relative Color Syntax

### Atomic Design Philosophy

Three kinds of thing. Deciding which one you are building is the first decision:

- **Atoms** = Semantic HTML elements (NO classes, NO components) - style `<button>`, not `.btn`. Zero JavaScript. Form participation, label association, and default accessibility come free from the platform; do not wrap them to get an attribute API.
- **Layout primitives** = CSS classes (`.stack`, `.cluster`, `.grid`, `.center`, `.switcher`). Pure arrangement, zero JavaScript. Not components.
- **Molecules / Organisms** = Web components (`<hs-*>`). Anything with behavior or composed internal structure.

Components choose light or shadow DOM by one criterion - does it own structure, or arrange content?

- **Light DOM** when the component *arranges content the consumer provides* (`<hs-card>`, `<hs-alert>`, `<hs-hero>`). The global stylesheet keeps applying, slotted content flows naturally, labels and forms behave, and SSR is free.
- **Shadow DOM** when the component *owns internal structure* the consumer should not restructure (`<hs-tabs>`, `<hs-dialog>`, `<hs-combobox>`). Encapsulated, with ARIA wired between elements the consumer never sees.

When in doubt, light DOM. It is the cheaper default and the easier one to change later.

### Naming Conventions
- **Tokens:** `--p-{category}-{variant}` for primitives, `--{category}-{role}` for semantic
- **Component elements:** `<hs-*>` (`<hs-card>`, `<hs-tabs>`) - a custom element name requires a hyphen
- **Component classes:** `.card`, `.card--featured` (flat, no BEM child selectors)
- **Layout utilities:** `.stack`, `.cluster`, `.grid`, `.center`

### JavaScript: Native Where Native Suffices

JavaScript belongs in the component layer and nowhere else.

- Atoms and layout primitives use **no JavaScript**. If CSS or semantic HTML can do it, it does not become a component.
- Components use JavaScript because behavior and composition need it. That is the boundary - not an exception carved out of a no-JS rule.
- Prefer native APIs inside components: `<dialog>`, `<details>`, Popover API, Anchor Positioning, `ElementInternals`.
- TypeScript for any JS that IS required.

**Progressive enhancement is scoped, not universal.** A page built from atoms and layout primitives works with JavaScript disabled. Components do not: Declarative Shadow DOM renders their markup server-side, but interactivity needs hydration. Do not claim otherwise in documentation.

### Web Components

- Custom elements are prefixed `hs-`, one element per file under `src/components/`.
- **Lit** is the base class for shadow-DOM components - the single sanctioned runtime dependency (see CONTRIBUTING.md for the rationale). Light-DOM components may extend `HTMLElement` directly where Lit buys nothing.
- **Declarative Shadow DOM is required** for shadow components, so they render server-side rather than appearing empty until hydration. This is what protects the LCP target.
- **Theming crosses the shadow boundary through CSS custom properties**, which inherit into shadow roots. The three-tier tokens are therefore the public theming API; expose anything further with `::part()`. Both are public API - changing either is a breaking change.
- Ship a `custom-elements.json` manifest so editors and agents get completion and type information. This is what makes the AI-friendly claim concrete rather than aspirational.
- Consumers: custom elements work in every framework, with known friction. Vue needs `compilerOptions.isCustomElement`, Angular needs `CUSTOM_ELEMENTS_SCHEMA`, React needs 19+. Document this; do not claim frictionless interop.

**Build-time partials are a separate mechanism.** `src/partials/<element-name>.html` is inlined by `build.js` for this project's own static pages (`site-header.html` renders `<site-header>`, honouring `<span slot="name">` overrides). It is a build convenience, not part of the shipped component library.

## CSS Patterns to Follow

### Container Queries (Not Media Queries)
```css
.card {
  container-type: inline-size;
}

@container (inline-size > 400px) {
  .card { flex-direction: row; }
}
```

### Theme Support with light-dark()
```css
:root {
  color-scheme: light dark;
  --color-bg: light-dark(var(--p-neutral-50), var(--p-neutral-900));
}
```

### Accessibility Requirements
- `:focus-visible` for keyboard focus indicators
- WCAG AA contrast (4.5:1) via OKLCH lightness
- `prefers-reduced-motion` support
- Semantic HTML landmarks
- Shadow DOM: `<label for>` does not cross the boundary. Use form-associated custom elements and `ElementInternals` rather than re-implementing label association
- Expose roles and state through `ElementInternals` ARIA reflection, not by copying attributes onto the host

### Core Web Vitals Targets
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms

## Testing Requirements

Tests are run with Playwright and include:
- **Accessibility:** axe-playwright for WCAG compliance
- **Visual:** Screenshot comparisons
- **Performance:** Web Vitals API measurements
- **Cross-browser:** Chromium (Firefox and WebKit can be added)

## Code Style

### CSS Organization
- **Global stylesheet:** `src/css/html.style.css` holds reset, tokens, atoms, layout primitives, and light-DOM component styles. Keep it a single file; `dist/` is generated from it
- **Shadow-DOM component styles** live with their component - outside CSS cannot reach into a shadow root
- Order: @layer declaration, then layers in order (reset, tokens, atoms, molecules, organisms, templates)

### CSS
- Use logical properties (`padding-inline`, `margin-block`)
- Prefer container queries over media queries
- Use `clamp()` for fluid typography
- All colors in OKLCH format

### Browser Fallbacks
Use minimal fallbacks only for critical features:
```css
:root {
  --color: #6b46c1;           /* Fallback */
  --color: oklch(0.6 0.18 260); /* Modern */
}
```
Do NOT add extensive @supports blocks or polyfills.

### HTML
- Semantic elements first (articles, sections, headers)
- Minimal class usage - leverage element selectors
- Accessible by default (proper headings, landmarks, alt text)

### Do NOT
- Use BEM-style child classes (`.card__title`)
- Use utility-first/atomic CSS patterns
- Add JavaScript for things CSS or semantic HTML can handle
- Wrap a working semantic element in a component (`<hs-button>` around `<button>`) - it costs the zero-JS baseline and the platform's form and label behaviour for no functional gain
- Name by appearance (`--blue-500`) - name by role (`--color-action-primary`)

## Files to Understand

- [README.md](README.md) - Public documentation, usage examples, and the design token chain
- [src/css/](src/css/) - CSS source files
- [src/examples.html](src/examples.html) - Component showcase covering every pattern
- [dist/](dist/) - Built distribution files
- [tests/README.md](tests/README.md) - Test suite structure and coverage

---

## Git Workflow

### Commit Messages
Use **Conventional Commits** format:
```
type(scope): description

feat(css): add button hover states
fix(tokens): correct brand color lightness
docs(readme): update installation instructions
refactor(atoms): simplify heading styles
test(a11y): add contrast ratio tests
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Branch Naming
Use description-only format with hyphens:
```
add-button-styles
fix-hover-state
update-color-tokens
```

### Pull Requests
Before creating a PR:
1. All tests must pass (`npm test`)
2. Manually verify changes in browser at http://localhost:8080
3. Ensure no accessibility regressions

## Before Committing

Checklist:
- [ ] Run `npm test` - all tests must pass
- [ ] Verify changes visually in browser (`npm run serve`)
- [ ] Check accessibility with browser devtools
- [ ] Commit message follows Conventional Commits format
- [ ] No console errors in browser

