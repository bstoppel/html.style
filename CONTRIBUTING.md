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
- Keep JavaScript minimal and native-first

### CSS Standards

**Colors:**
```css
/* Always provide hex fallback before OKLCH */
.element {
  background: #6b46c1;
  background: oklch(0.6 0.18 260);
}
```

**Design Tokens:**
- Primitives: `--p-*` prefix
- Semantic: `--color-*`, `--space-*`
- State: Derived using Relative Color Syntax

**Cascade Layers:**
```css
@layer reset, tokens, atoms, molecules, organisms, templates;
```

**Naming:**
- Components: `.component-name`, `.component-name--variant`
- Layout primitives: `.stack`, `.cluster`, `.grid`
- Atoms layer: Style semantic HTML directly (NO classes)

### JavaScript Standards

- Progressive enhancement (works without JS)
- Use native APIs over libraries
- Feature detection, not browser sniffing
- Respect Global Privacy Control (GPC)
- ES modules (`import`/`export`)

### Accessibility

- WCAG AA minimum (4.5:1 contrast for normal text)
- Semantic HTML elements
- ARIA only when semantic HTML insufficient
- Test with keyboard navigation
- Test with screen readers

### Testing

Before submitting:

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
4. **Native-First** - Delete JavaScript dependencies
5. **AI-Friendly** - Predictable, machine-readable patterns
6. **Delete-Key Friendly** - Only include essentials

### What We Accept

- Bug fixes
- Performance improvements
- Accessibility enhancements
- Modern CSS feature adoption (when baseline)
- Documentation improvements
- Test additions

### What We Don't Accept

- Dependencies on JavaScript libraries (jQuery, Lodash, etc.)
- Non-standard color formats (prefer OKLCH)
- Utility class frameworks (we use semantic HTML)
- Build-time complexity without clear benefit
- Features that duplicate native browser capabilities

## Questions?

- Open a discussion for general questions
- Check PROJECT_CONTEXT.full.md for detailed patterns
- Review examples.html for component demonstrations

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
