# html.style

A modern web standards-based CSS framework leveraging OKLCH colors, container queries, and semantic HTML for 2026 and beyond.

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
├── dist/
│   ├── css/
│   │   └── html.style.css    # Framework styles
│   ├── js/
│   │   ├── html.style.js     # Optional enhancements
│   │   └── html.style.components.js  # All components, one bundle
│   ├── components/           # Individual component modules
│   ├── index.html             # Starter template
│   ├── favicon.svg            # Dark mode favicon
│   ├── site.webmanifest       # PWA manifest
│   └── robots.txt             # SEO
├── src/                       # Source files (for reference)
│   ├── examples.html          # Component showcase
│   ├── template-landing.html  # Landing page example
│   └── template-blog.html     # Blog layout example
└── README.md
```

### Quick Start: Just Open and Edit

No build process required. Open `dist/index.html` in your code editor and start building. The framework uses modern web standards that work directly in browsers.

## Features

- **OKLCH Color System** - Perceptually uniform colors with Display P3 wide gamut support
- **Browser-Native Theming** - Uses `light-dark()` function and `color-scheme` property
- **Container Queries** - Components adapt to their container, not the viewport
- **Semantic HTML First** - Style HTML tags directly, minimal class usage
- **Cascade Layers** - Predictable specificity with `@layer` (reset, tokens, atoms, molecules, organisms, templates)
- **Three-Tier Design Tokens** - Primitives → Semantic → State (derived via Relative Color Syntax)
- **Layout Primitives** - Intrinsically responsive layouts (stack, cluster, grid, center)
- **Progressive Enhancement** - Atoms and layout work with no JavaScript at all; components add behaviour on top
- **Privacy-First** - Global Privacy Control (GPC) detection and compliance
- **Web Components** - `<hs-*>` custom elements for behaviour the platform doesn't provide

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
<button onclick="ThemeManager.toggle()">Toggle Theme</button>
```

```javascript
// Set specific theme
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
  <article class="card">...</article>
  <article class="card">...</article>
  <article class="card">...</article>
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
file works — including from `file://`:

```html
<script type="module" src="js/html.style.components.js"></script>
```

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

See [examples.html](src/examples.html) for a comprehensive showcase of all components including:

- Typography (headings, paragraphs, lists, code)
- Buttons (primary, secondary, outline, disabled states)
- Forms (all input types, validation states)
- Cards with container query demonstrations
- Alert messages (success, warning, error, info)
- Layout primitives (stack, cluster, grid, center)
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
- `DialogEnhancements` - Close on backdrop click and Escape key
- `ClipboardHelper` - Copy buttons for code blocks

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
