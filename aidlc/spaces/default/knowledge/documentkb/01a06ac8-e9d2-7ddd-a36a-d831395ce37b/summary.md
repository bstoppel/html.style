Guide to the Playwright test suite for html.style. Setup is `npm install` plus `npx playwright install`; the suite is driven through npm scripts (`npm test` for everything, plus test:visual, test:a11y, test:performance, and the test:debug / test:headed / test:ui debugging modes and test:update-snapshots).

The suite has three directories, each with a single spec: tests/visual/components.spec.js, tests/a11y/accessibility.spec.js (axe-core), and tests/performance/web-vitals.spec.js.

Coverage claimed per area. Visual regression: component rendering in both color schemes, button variants, form elements, cards and layouts, alerts, and container-query responsiveness. Accessibility: WCAG 2.1 AA, keyboard navigation, focus indicators, skip links, 4.5:1 contrast, semantic HTML validation, screen-reader compatibility. Performance: LCP < 2.5s, CLS < 0.1, INP < 200ms, plus CSS token computation efficiency, cascade layer ordering, and resource loading.

Cross-browser coverage is Chromium only (Desktop Chrome) — the single project in playwright.config.js, applying to local runs and CI alike, which matches CLAUDE.md. The document supplies a copy-pasteable projects block for adding Firefox, WebKit and the Pixel 5 / iPhone 13 mobile devices, and warns that visual snapshots are per-project so a new engine needs its own snapshot set generated before its tests pass.

CI notes that playwright.config.js starts a local server, parallelises, generates HTML reports and captures failure screenshots; reports are viewed with `npx playwright show-report`.

Closes with copy-pasteable patterns for a visual, an accessibility and a performance test, six best practices (atomic focused tests, descriptive names, cleanup, no hardcoded waits, deliberate snapshot updates, full suite before commit), and troubleshooting for snapshot mismatches, timeouts, and axe violations.
