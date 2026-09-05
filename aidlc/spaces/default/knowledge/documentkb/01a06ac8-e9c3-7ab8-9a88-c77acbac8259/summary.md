Contributor guide for html.style. Covers issue reporting, feature suggestions judged against the project philosophy, and the fork/branch/test/PR flow.

Code style defers to .editorconfig (2 spaces, LF), semantic HTML, modern CSS, and keeping JavaScript out of atoms and layout primitives — it belongs in components.

CSS standards: OKLCH with NO hex fallback (the guide states the fallback is dead weight because OKLCH predates the supported browser floor by many versions, and notes the framework's own stylesheet carries none), the three-tier token prefixes, the fixed @layer order, and naming that now distinguishes component ELEMENTS (<hs-*>, which require a hyphen) from component CLASSES (.component-name, .component-name--variant) and layout primitives, with the atoms layer styling semantic HTML directly and taking no classes.

JavaScript standards reflect the web component pivot. Progressive enhancement is explicitly SCOPED: atoms and layout primitives work with JavaScript disabled, components do not, because Declarative Shadow DOM renders markup but not interactivity — and the guide forbids describing the component layer as working without JS. Components are custom elements prefixed hs-, one per file in src/components/; shadow-DOM components extend Lit and must support DSD, while light-DOM components may extend HTMLElement directly. A short "which DOM?" rule restates the criterion: arranging consumer content means light DOM, owning internal structure means shadow DOM, and when in doubt light DOM.

Accessibility is a merge condition, not an aspiration: WCAG AA 4.5:1, semantic elements before ARIA, keyboard and screen-reader testing.

The testing checklist is explicit about what is automated versus manual: `npm test` covers Chromium only (the single project in playwright.config.js), so Firefox and Safari must be verified by hand at or above the README's supported floors. It also requires both colour schemes, several viewport sizes, container-query verification, axe/Lighthouse checks, and Core Web Vitals. Commits use Conventional Commits.

The philosophy section names six principles — semantic HTML first, container over media queries, OKLCH, "Native Where Native Suffices" (no JavaScript for what CSS or semantic HTML already does; JavaScript belongs in the component layer), AI-friendly, delete-key friendly.

A DEPENDENCIES section names Lit as the single sanctioned runtime dependency, for shadow-DOM components only, with the reasoning stated: hand-writing reactive attributes, template caching and DSD serialisation is several hundred lines of infrastructure, DSD is a hard requirement here, and @lit-labs/ssr covers it directly. The section explicitly frames this as a bounded exception rather than a precedent, and says proposals for any other runtime dependency should expect rejection.

Accepted contributions: bug fixes, performance, accessibility, baseline-modern CSS adoption, docs, tests. Rejected: runtime dependencies other than Lit, non-OKLCH colour formats, utility-class frameworks, build complexity without clear benefit, and anything duplicating a native browser capability.

The Questions section points at CLAUDE.md for detailed patterns and src/examples.html for component demonstrations; both resolve.
