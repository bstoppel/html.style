Public README and primary user-facing documentation for html.style v2026.1.0 (year-based versioning, YYYY.MAJOR.MINOR), MIT licensed.

Distribution and install: direct release download, `npm install html.style`, or git clone. The shipped dist/ folder is self-contained — css/html.style.css, js/html.style.js, index.html starter, favicon.svg, site.webmanifest, robots.txt — and there is no build step for consumers; the documented workflow is to copy dist/ and edit index.html directly. src/ carries reference material (examples.html, template-landing.html, template-blog.html).

Feature set as advertised: OKLCH colors with Display P3, browser-native theming via light-dark() and color-scheme, container queries instead of viewport breakpoints, semantic-HTML-first styling with minimal classes, cascade layers in the reset/tokens/atoms/molecules/organisms/templates order, three-tier design tokens, intrinsically responsive layout primitives (stack, cluster, grid, center), progressive enhancement, and privacy-first behaviour including Global Privacy Control detection.

Usage documentation is example-driven: a minimal HTML page, theme switching through ThemeManager, the layout primitives, container-query cards, alerts with role="alert", and forms. The design-token section shows the primitive/semantic/state chain concretely (--p-brand-hue feeding --p-brand-600, feeding --color-action-primary via light-dark(), feeding --color-action-hover via `oklch(from ... calc(l + 0.1) c h)`) and documents brand customization as changing a single hue variable or setting html[data-theme="..."].

The JavaScript API is small and optional: ThemeManager (init/toggle/setTheme with light, dark, auto), FormEnhancements, SmoothScroll (honours prefers-reduced-motion), DialogEnhancements (backdrop and Escape closing), ClipboardHelper.

Browser support is stated as hard floors rather than a rolling window — Chrome/Edge 131+, Firefox 133+, Safari 18+ — matching CLAUDE.md, with container queries, OKLCH, light-dark(), @layer and relative color syntax as hard requirements and no polyfills. The binding constraint is full relative-color-syntax support, which the derived state tokens rely on.

Accessibility and privacy each get a dedicated section: semantic HTML, WCAG AA 4.5:1, :focus-visible, skip links, reduced-motion and color-scheme support; no tracking by default, localStorage used only for the theme preference, analytics disableable via GPC. Acknowledges HTML5 Boilerplate, Atomic Design, and Every Layout as influences.
