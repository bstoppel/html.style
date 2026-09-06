import { test, expect } from '@playwright/test';

/**
 * These tests do not run React, Vue, Angular, Solid or Svelte. They exercise the
 * primitives every one of those integrations is built on, so that docs/frameworks.md
 * rests on verified behaviour rather than assertion:
 *
 *   - setting a PROPERTY          (React 19 client rendering, Angular [prop] binding)
 *   - setting an ATTRIBUTE        (templates, SSR output, Vue/Angular attr binding)
 *   - boolean attribute semantics (presence, not value — a recurring framework footgun)
 *   - custom events BUBBLING      (every framework ultimately calls addEventListener)
 *   - form participation          (framework-owned forms reading FormData)
 *   - properties set BEFORE upgrade (frameworks routinely render before the module loads)
 */

test.describe('Framework interop primitives', () => {
  test('setting a property updates the element', async ({ page }) => {
    await page.goto('/examples.html');

    // What React 19 does on the client: a prop matching a property on the
    // instance is assigned as a property rather than an attribute.
    const result = await page.evaluate(async () => {
      const el = document.querySelector('hs-toggle[name="digest"]');
      el.checked = true;
      // The property is readable immediately...
      const immediate = { checked: el.checked, reflected: el.hasAttribute('checked') };
      // ...but reflection to the attribute is batched with the next update.
      await el.updateComplete;
      return { immediate, afterUpdate: el.hasAttribute('checked') };
    });

    expect(result.immediate.checked).toBe(true);
    // Documented gotcha: reading the ATTRIBUTE straight after setting the
    // property sees stale state, because Lit batches reflection.
    expect(result.immediate.reflected).toBe(false);
    expect(result.afterUpdate).toBe(true);
  });

  test('setting an attribute updates the element', async ({ page }) => {
    await page.goto('/examples.html');

    // What a template or SSR output does.
    const checked = await page.evaluate(() => {
      const el = document.querySelector('hs-toggle[name="digest"]');
      el.setAttribute('checked', '');
      return el.checked;
    });
    expect(checked).toBe(true);
  });

  test('boolean attributes follow presence, not value', async ({ page }) => {
    await page.goto('/examples.html');

    // The footgun: a framework that stringifies false into an attribute
    // produces disabled="false", which HTML reads as disabled. Frameworks are
    // expected to OMIT the attribute instead. This documents the semantics so
    // the guide can warn about it accurately.
    const states = await page.evaluate(() => {
      const el = document.createElement('hs-toggle');
      document.body.append(el);
      el.setAttribute('disabled', 'false');
      const whenStringFalse = el.disabled;
      el.removeAttribute('disabled');
      const whenAbsent = el.disabled;
      el.remove();
      return { whenStringFalse, whenAbsent };
    });

    expect(states.whenStringFalse).toBe(true);
    expect(states.whenAbsent).toBe(false);
  });

  test('custom events bubble past a wrapper, where frameworks listen', async ({ page }) => {
    await page.goto('/examples.html');

    // Frameworks attach listeners on an ancestor they control, not on the
    // custom element itself, so the event has to bubble out of it.
    const seen = await page.evaluate(() => {
      const wrapper = document.createElement('div');
      const alert = document.createElement('hs-alert');
      alert.setAttribute('dismissible', '');
      wrapper.append(alert);
      document.body.append(wrapper);

      return new Promise((resolve) => {
        wrapper.addEventListener('hs-dismiss', (e) => {
          resolve({ bubbled: true, cancelable: e.cancelable, target: e.target.tagName.toLowerCase() });
        });
        alert.dismiss();
        setTimeout(() => resolve({ bubbled: false }), 500);
      });
    });

    expect(seen).toEqual({ bubbled: true, cancelable: true, target: 'hs-alert' });
  });

  test('change fires on interaction, so framework bindings stay in sync', async ({ page }) => {
    await page.goto('/examples.html');

    const detail = await page.evaluate(() => {
      const el = document.querySelector('hs-toggle[name="digest"]');
      return new Promise((resolve) => {
        el.addEventListener('change', (e) => resolve({ bubbles: e.bubbles, checked: e.target.checked }));
        el.click();
        setTimeout(() => resolve(null), 500);
      });
    });

    expect(detail).toEqual({ bubbles: true, checked: true });
  });

  test('a property set BEFORE the module loads is not lost', async ({ page }) => {
    // The failure mode frameworks actually hit: they render and assign
    // properties before the component's module has evaluated. Without upgrade
    // handling the assignment becomes an own property that shadows the
    // accessor, and the value is silently dropped.
    // Load the page with the component module blocked, so nothing is defined yet.
    await page.route('**/html.style.components.js', (route) => route.abort());
    await page.goto('/examples.html');
    expect(await page.evaluate(() => !!customElements.get('hs-toggle'))).toBe(false);

    // Configure an element while it is still an unknown tag.
    await page.evaluate(() => {
      const el = document.createElement('hs-toggle');
      el.setAttribute('name', 'late');
      el.checked = true;
      document.body.append(el);
      window.__late = el;
    });

    // Now let the module land, exactly as a late-loading bundle would.
    await page.unroute('**/html.style.components.js');
    const survived = await page.evaluate(async () => {
      // A failed import is cached in the module map, and the page already tried
      // this URL while it was blocked — so ask for a distinct one.
      await import('/js/html.style.components.js?late');
      await customElements.whenDefined('hs-toggle');
      await window.__late.updateComplete;
      return {
        checked: window.__late.checked,
        reflected: window.__late.hasAttribute('checked'),
      };
    });

    expect(survived.checked).toBe(true);
    expect(survived.reflected).toBe(true);
  });

  test('the classic build works from file://, where modules are blocked', async ({ page }) => {
    // The no-build promise: a page opened straight off disk. ES modules are
    // blocked from file:// by CORS, which is the whole reason the classic
    // bundle exists — so this is the test that keeps that promise honest.
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

    const url = new URL('file://' + process.cwd() + '/dist/example-vanilla.html');
    await page.goto(url.href);

    await expect(page.locator('hs-toggle').first()).toHaveJSProperty('checked', true);
    const upgraded = await page
      .locator('hs-toggle')
      .first()
      .evaluate((el) => !!el.shadowRoot);

    expect(upgraded).toBe(true);
    expect(errors).toEqual([]);
  });

  test('works inside a form the framework owns', async ({ page }) => {
    await page.goto('/examples.html');

    const entries = await page.evaluate(() => {
      const form = document.createElement('form');
      const el = document.createElement('hs-toggle');
      el.setAttribute('name', 'marketing');
      el.setAttribute('checked', '');
      form.append(el);
      document.body.append(form);
      const data = [...new FormData(form).entries()];
      form.remove();
      return data;
    });

    expect(entries).toEqual([['marketing', 'on']]);
  });
});
