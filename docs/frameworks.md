# Using html.style components

Components are custom elements, so they work anywhere HTML works. This guide
covers the setup each environment needs and the handful of behaviours that
surprise people.

**Atoms and layout primitives need none of this.** Semantic HTML and the
layout classes are plain CSS — link the stylesheet and you are done. Only the
`<hs-*>` elements involve JavaScript.

## What ships

| File | Format | Use it when |
|---|---|---|
| `dist/js/html.style.components.js` | ES module, Lit inlined | Loading over `http(s)://` with a `<script type="module">` |
| `dist/js/html.style.components.classic.js` | Classic script, Lit inlined | Opening a page from `file://`, or anywhere you cannot use modules |
| `dist/components/*.js` | Unbundled ES modules | You have a bundler (Vite, webpack, Next, Rollup) |
| `dist/custom-elements.json` | Manifest | Editor completion; picked up automatically via `package.json` |
| `dist/custom-elements.d.ts` | Type declarations | TypeScript; wired through `package.json`, so nothing to import |

The unbundled modules `import { LitElement } from 'lit'` — a bare specifier a
browser cannot resolve on its own. **Do not point a `<script>` at
`dist/components/*.js` directly.** Use a bundle, or let your bundler resolve it.

---

## Vanilla HTML, CSS and JavaScript

No build step. See [`src/example-vanilla.html`](../src/example-vanilla.html) for
a complete working page.

```html
<link rel="stylesheet" href="css/html.style.css">
<script type="module" src="js/html.style.components.js"></script>

<hs-alert variant="info" dismissible>Saved.</hs-alert>
<hs-toggle name="notifications" checked>Email notifications</hs-toggle>
```

```javascript
// Custom elements are elements. Everything you know still applies.
document.querySelector('#alerts').addEventListener('hs-dismiss', (event) => {
  console.log('dismissed', event.target);
});
```

### Opening a page from `file://`

**No build step does not mean no server.** ES modules are blocked from `file://`
by CORS, so `<script type="module">` silently fails on a page opened straight off
disk. Two options:

Use the classic build, which has no such restriction:

```html
<script src="js/html.style.components.classic.js" defer></script>
```

Or serve the directory over HTTP, where either build works:

```bash
npx http-server dist -p 8080
```

---

## React 19+

React 19 is required. Earlier versions pass everything to custom elements as
attributes, which breaks non-string values.

```jsx
import 'html.style/components';

function Preferences() {
  return (
    <hs-toggle name="notifications" checked>
      Email notifications
    </hs-toggle>
  );
}
```

React 19 assigns a prop as a **property** when the custom element has a matching
property, and as an attribute otherwise.

### Custom events

Use a ref and `addEventListener`. This is the pattern that unambiguously works:

```jsx
import { useEffect, useRef } from 'react';

function Alert({ onDismiss, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    el.addEventListener('hs-dismiss', onDismiss);
    return () => el.removeEventListener('hs-dismiss', onDismiss);
  }, [onDismiss]);

  return <hs-alert ref={ref} variant="info" dismissible>{children}</hs-alert>;
}
```

`change` on `<hs-toggle>` is a standard event name, so `onChange` works directly.

---

## Vue 3

Tell the compiler which tags are custom elements, or Vue warns about unknown
components:

```javascript
// vite.config.js
import vue from '@vitejs/plugin-vue';

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: { isCustomElement: (tag) => tag.startsWith('hs-') },
      },
    }),
  ],
};
```

```vue
<script setup>
import 'html.style/components';
</script>

<template>
  <hs-alert variant="info" dismissible @hs-dismiss="onDismiss">Saved.</hs-alert>
  <hs-toggle name="notifications" :checked="enabled" @change="enabled = $event.target.checked">
    Email notifications
  </hs-toggle>
</template>
```

Vue sets a binding as a property when one exists on the element, and as an
attribute otherwise. Force either with `.prop` or `.attr`.

---

## Angular

Add `CUSTOM_ELEMENTS_SCHEMA`, or Angular treats unknown tags as an error:

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'html.style/components';

@Component({
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <hs-alert variant="info" dismissible (hs-dismiss)="onDismiss()">Saved.</hs-alert>
    <hs-toggle name="notifications" [checked]="enabled" (change)="enabled = $any($event.target).checked">
      Email notifications
    </hs-toggle>
  `,
})
export class PreferencesComponent {
  enabled = true;
  onDismiss() {}
}
```

`[checked]` binds a property; use `[attr.checked]` when you specifically want the
attribute.

---

## Svelte and Solid

Both handle custom elements without configuration.

```svelte
<script>
  import 'html.style/components';
  let el;
  $effect(() => {
    el.addEventListener('hs-dismiss', onDismiss);
    return () => el.removeEventListener('hs-dismiss', onDismiss);
  });
</script>

<hs-alert bind:this={el} variant="info" dismissible>Saved.</hs-alert>
```

Svelte's event syntax changed between versions 4 and 5, so the ref plus
`addEventListener` form above is the one that works in both. Solid can bind
custom events directly with its `on:` prefix, which uses the exact event name:

```jsx
<hs-alert variant="info" dismissible on:hs-dismiss={onDismiss}>Saved.</hs-alert>
```

---

## Behaviours worth knowing

Each of these is covered by
[`tests/components/framework-interop.spec.js`](../tests/components/framework-interop.spec.js).

### Boolean attributes go by presence, not value

`disabled="false"` means **disabled**, because HTML reads the attribute's
presence. A framework that stringifies `false` into an attribute produces
exactly the opposite of what you wrote. Bind the property, or omit the attribute
entirely.

### Property reflection is batched

Setting a property updates it immediately, but the matching attribute is written
on the next update:

```javascript
toggle.checked = true;
toggle.hasAttribute('checked');   // false — not yet
await toggle.updateComplete;
toggle.hasAttribute('checked');   // true
```

Read the property, not the attribute, if you need the value straight away.

### Properties set before the module loads are preserved

Frameworks routinely render and assign properties before the component's script
has evaluated. Those assignments survive the upgrade — no ordering workaround is
needed.

### Custom events bubble

`hs-dismiss` bubbles and is cancelable, so you can listen on an ancestor your
framework controls rather than on each element, and `preventDefault()` will keep
the alert in place.

### Forms work through ElementInternals

`<hs-toggle>` submits, resets, and restores like a native control — no hidden
input. `FormData` sees it immediately after it is appended, including when
framework code constructs it.

### Server-side rendering

Components render nothing until their script runs. There is no Declarative
Shadow DOM from this package, because emitting it requires a server render and
the primary delivery path is static HTML with no build step. If you are
server-rendering inside a framework, its own SSR can emit Declarative Shadow DOM
for these elements. Otherwise the global stylesheet reserves each shadow
component's box, so nothing shifts when the script arrives.
