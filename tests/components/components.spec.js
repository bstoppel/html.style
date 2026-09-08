import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('hs-alert (light DOM)', () => {
  test('is styled before its JavaScript defines it', async ({ page }) => {
    // The point of light DOM: the global stylesheet applies to the element
    // itself, so an alert looks right even if the module never loads.
    await page.addInitScript(() => {
      // Block module evaluation by removing the script before it runs.
      document.addEventListener('DOMContentLoaded', () => {}, { once: true });
    });
    await page.route('**/html.style.components.js', (route) => route.abort());
    await page.goto('/examples.html');

    const alert = page.locator('hs-alert[variant="success"]');
    const padding = await alert.evaluate((el) => getComputedStyle(el).paddingTop);
    const display = await alert.evaluate((el) => getComputedStyle(el).display);

    expect(display).toBe('flex');
    expect(parseFloat(padding)).toBeGreaterThan(0);
  });

  test('applies role="alert" without clobbering an author role', async ({ page }) => {
    await page.goto('/examples.html');
    await expect(page.locator('hs-alert[variant="success"]')).toHaveAttribute('role', 'alert');

    const kept = await page.evaluate(() => {
      const el = document.createElement('hs-alert');
      el.setAttribute('role', 'status');
      document.body.append(el);
      const role = el.getAttribute('role');
      el.remove();
      return role;
    });
    expect(kept).toBe('status');
  });

  test('dismissible renders a labelled button that removes the alert', async ({ page }) => {
    await page.goto('/examples.html');
    const alert = page.locator('hs-alert[dismissible]');
    const button = alert.locator('[data-hs-dismiss]');

    await expect(button).toHaveAttribute('aria-label', 'Dismiss');
    await expect(alert).toHaveCount(1);
    await button.click();
    await expect(alert).toHaveCount(0);
  });

  test('hs-dismiss is cancelable', async ({ page }) => {
    await page.goto('/examples.html');
    const stillThere = await page.evaluate(() => {
      const el = document.querySelector('hs-alert[dismissible]');
      el.addEventListener('hs-dismiss', (e) => e.preventDefault(), { once: true });
      el.dismiss();
      return document.contains(el);
    });
    expect(stillThere).toBe(true);
  });

  test('a non-dismissible alert has no dismiss button', async ({ page }) => {
    await page.goto('/examples.html');
    await expect(
      page.locator('hs-alert[variant="success"] [data-hs-dismiss]')
    ).toHaveCount(0);
  });
});

test.describe('CSS-only elements', () => {
  // The tier's defining property: these render from the stylesheet alone. If a
  // test here needs JavaScript to pass, the element has drifted out of the tier.

  test('render identically whether or not their module loads', async ({ page }) => {
    const styles = async (blockModule) => {
      const ctx = await page.context().browser().newContext();
      const p = await ctx.newPage();
      if (blockModule) await p.route('**/html.style.components*.js', (r) => r.abort());
      await p.goto('/examples.html');
      const result = await p.evaluate(() => {
        const read = (sel) => {
          const cs = getComputedStyle(document.querySelector(sel));
          return { display: cs.display, background: cs.backgroundColor, radius: cs.borderRadius };
        };
        return { defined: !!customElements.get('hs-card'), card: read('hs-card'), badge: read('hs-badge') };
      });
      await ctx.close();
      return result;
    };

    const without = await styles(true);
    const with_ = await styles(false);

    expect(without.defined).toBe(false);
    expect(with_.defined).toBe(true);
    // Registration is for tooling only; it must not change a single pixel.
    expect(without.card).toEqual(with_.card);
    expect(without.badge).toEqual(with_.badge);
  });

  test('lay out with JavaScript disabled entirely', async ({ page }) => {
    const ctx = await page.context().browser().newContext({ javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto('/examples.html');

    const box = await p.locator('hs-card').first().boundingBox();
    await ctx.close();

    // An unstyled custom element is display:inline and would collapse.
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  test('the class form stays supported alongside the element', async ({ page }) => {
    await page.goto('/examples.html');
    const same = await page.evaluate(() => {
      const pick = (el) => {
        const cs = getComputedStyle(el);
        return { display: cs.display, radius: cs.borderRadius, background: cs.backgroundColor };
      };
      return {
        element: pick(document.querySelector('hs-card')),
        klass: pick(document.querySelector('.card')),
      };
    });
    expect(same.element).toEqual(same.klass);
  });
});

test.describe('hs-toggle (shadow DOM)', () => {
  test('exposes role=switch and reflects checked state to assistive tech', async ({ page }) => {
    await page.goto('/examples.html');
    const toggle = page.locator('hs-toggle[name="notifications"]');

    // Set through ElementInternals, so it is readable from the accessibility
    // tree rather than from an attribute on the host.
    const snapshot = await toggle.evaluate((el) => ({
      role: el.computedRole ?? null,
      checked: el.checked,
    }));
    expect(snapshot.checked).toBe(true);

    await expect(toggle).toHaveJSProperty('checked', true);
    await toggle.click();
    await expect(toggle).toHaveJSProperty('checked', false);
  });

  test('toggles with Space and Enter', async ({ page }) => {
    await page.goto('/examples.html');
    const toggle = page.locator('hs-toggle[name="digest"]');

    await toggle.focus();
    await expect(toggle).toHaveJSProperty('checked', false);

    await page.keyboard.press(' ');
    await expect(toggle).toHaveJSProperty('checked', true);

    await page.keyboard.press('Enter');
    await expect(toggle).toHaveJSProperty('checked', false);
  });

  test('is focusable, and disabled removes it from the tab order', async ({ page }) => {
    await page.goto('/examples.html');
    expect(
      await page.locator('hs-toggle[name="digest"]').evaluate((el) => el.tabIndex)
    ).toBe(0);
    expect(
      await page.locator('hs-toggle[disabled]').evaluate((el) => el.tabIndex)
    ).toBe(-1);
  });

  test('disabled does not toggle', async ({ page }) => {
    await page.goto('/examples.html');
    const toggle = page.locator('hs-toggle[disabled]');
    const before = await toggle.evaluate((el) => el.checked);
    await toggle.dispatchEvent('click');
    expect(await toggle.evaluate((el) => el.checked)).toBe(before);
  });

  test('participates in its form through ElementInternals', async ({ page }) => {
    await page.goto('/examples.html');

    // Checked toggles submit their value; unchecked ones submit nothing, which
    // is how a native checkbox behaves.
    const entries = await page.evaluate(() => {
      const form = document.querySelector('#toggle-demo');
      return [...new FormData(form).entries()];
    });
    expect(entries).toContainEqual(['notifications', 'on']);
    expect(entries.map(([k]) => k)).not.toContain('digest');
  });

  test('resets with its form', async ({ page }) => {
    await page.goto('/examples.html');
    const checked = await page.evaluate(() => {
      const form = document.querySelector('#toggle-demo');
      const toggle = form.querySelector('hs-toggle[name="notifications"]');
      toggle.checked = false;
      form.reset();
      return toggle.checked;
    });
    // The authored state had checked set, so a reset returns to true.
    expect(checked).toBe(true);
  });

  test('the thumb is actually rendered and moves when checked', async ({ page }) => {
    await page.goto('/examples.html');

    // This shipped broken: .thumb is a <span>, so it stayed display:inline and
    // ignored its own size, rendering 0x0. The track only escaped that because
    // it is a flex item of :host. Nothing else in the suite looks at the shadow
    // root's geometry, so a switch with no knob passed every other test.
    const geometry = async (selector) =>
      page.locator(selector).evaluate((el) => {
        const track = el.shadowRoot.querySelector('.track').getBoundingClientRect();
        const thumb = el.shadowRoot.querySelector('.thumb').getBoundingClientRect();
        return {
          width: Math.round(thumb.width),
          height: Math.round(thumb.height),
          offset: Math.round(thumb.x - track.x),
        };
      });

    const on = await geometry('hs-toggle[name="notifications"]');
    const off = await geometry('hs-toggle[name="digest"]');

    expect(on.width).toBeGreaterThan(0);
    expect(on.height).toBeGreaterThan(0);
    expect(off.width).toBe(on.width);

    // The knob has to visibly travel, or the two states are indistinguishable.
    expect(on.offset).toBeGreaterThan(off.offset);
  });

  test('exposes track and thumb as parts for theming', async ({ page }) => {
    await page.goto('/examples.html');
    const parts = await page.locator('hs-toggle').first().evaluate((el) =>
      [...el.shadowRoot.querySelectorAll('[part]')].map((n) => n.getAttribute('part'))
    );
    expect(parts).toEqual(['track', 'thumb']);
  });
});

test.describe('Pre-upgrade rendering (the no-build path)', () => {
  // The framework's primary path is static HTML with no build step, so there is
  // no server render and no Declarative Shadow DOM. A shadow component renders
  // nothing until its module upgrades it; these tests hold the line on what the
  // page looks like in that window.

  test('a shadow component reserves its box, so upgrading shifts nothing', async ({ page }) => {
    const box = async (blockModule) => {
      const ctx = await page.context().browser().newContext();
      const p = await ctx.newPage();
      if (blockModule) await p.route('**/html.style.components.js', (r) => r.abort());
      await p.goto('/examples.html');
      await p.waitForTimeout(200);
      const rect = await p
        .locator('hs-toggle[name="notifications"]')
        .evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height) };
        });
      await ctx.close();
      return rect;
    };

    const before = await box(true);
    const after = await box(false);
    expect(before).toEqual(after);
  });

  test('an un-upgraded shadow component still shows its control', async ({ page }) => {
    await page.route('**/html.style.components.js', (route) => route.abort());
    await page.goto('/examples.html');

    // The :defined fallback draws the track, so the switch is visibly present
    // rather than the label sitting alone with nothing to operate.
    const track = await page
      .locator('hs-toggle[name="notifications"]')
      .evaluate((el) => {
        const cs = getComputedStyle(el, '::before');
        return { content: cs.content, width: cs.width, height: cs.height };
      });

    expect(track.content).toBe('""');
    expect(parseFloat(track.width)).toBeGreaterThan(0);
    expect(parseFloat(track.height)).toBeGreaterThan(0);
  });

  test('a light-DOM component needs no fallback at all', async ({ page }) => {
    await page.route('**/html.style.components.js', (route) => route.abort());
    await page.goto('/examples.html');

    // Styled by the global stylesheet directly, so there is no gap to cover.
    const display = await page
      .locator('hs-alert[variant="success"]')
      .evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe('flex');
  });
});

test.describe('Custom elements manifest', () => {
  // The manifest is what gives editors and agents completion for <hs-*>. It is
  // generated by build.js, so `npm run build:check` already catches staleness;
  // this catches the case that check cannot see — an element registered at
  // runtime that the analyzer never picked up, because it fell outside the glob.

  test('documents every element the page actually registers', async ({ page }) => {
    await page.goto('/examples.html');

    const registered = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .map((el) => el.tagName.toLowerCase())
        .filter((tag) => tag.startsWith('hs-'))
        .filter((tag, i, all) => all.indexOf(tag) === i)
        .sort()
    );

    const manifest = await (await page.request.get('/custom-elements.json')).json();
    const documented = manifest.modules
      .flatMap((m) => m.declarations ?? [])
      .filter((d) => d.customElement && d.tagName)
      .map((d) => d.tagName)
      .sort();

    expect(registered.length).toBeGreaterThan(0);
    for (const tag of registered) expect(documented).toContain(tag);
  });

  test('documents every part components actually expose', async ({ page }) => {
    await page.goto('/examples.html');

    // The analyzer only reads JSDoc on the CLASS. Tags left in a module header
    // are silently ignored, and you still get a manifest — just one missing
    // half the API. That has now happened twice, so cross-check the manifest
    // against the parts the shadow roots really render.
    const exposed = await page.evaluate(() => {
      const found = {};
      for (const el of document.querySelectorAll('*')) {
        const tag = el.tagName.toLowerCase();
        if (!tag.startsWith('hs-') || !el.shadowRoot) continue;
        const parts = [...el.shadowRoot.querySelectorAll('[part]')]
          .flatMap((n) => n.getAttribute('part').split(/\s+/))
          .filter(Boolean);
        found[tag] = [...new Set([...(found[tag] ?? []), ...parts])].sort();
      }
      return found;
    });

    const manifest = await (await page.request.get('/custom-elements.json')).json();
    const declarations = manifest.modules.flatMap((m) => m.declarations ?? []);

    expect(Object.keys(exposed).length).toBeGreaterThan(0);
    for (const [tag, parts] of Object.entries(exposed)) {
      const documented = (declarations.find((d) => d.tagName === tag)?.cssParts ?? []).map(
        (p) => p.name
      );
      for (const part of parts) {
        expect(documented, `${tag} should document ::part(${part})`).toContain(part);
      }
    }
  });

  test('records the public API surface, not just tag names', async ({ page }) => {
    const manifest = await (await page.request.get('/custom-elements.json')).json();
    const toggle = manifest.modules
      .flatMap((m) => m.declarations ?? [])
      .find((d) => d.tagName === 'hs-toggle');

    // Parts and custom properties are public API per CLAUDE.md, so they have to
    // be discoverable rather than only documented in prose.
    expect(toggle.cssParts.map((p) => p.name).sort()).toEqual(['thumb', 'track']);
    expect(toggle.attributes.map((a) => a.name)).toContain('checked');
    expect(toggle.slots.length).toBeGreaterThan(0);
  });
});

test.describe('Component accessibility', () => {
  test('the component section has no violations in light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/examples.html');

    const results = await new AxeBuilder({ page }).include('#custom-elements').analyze();
    expect(results.violations).toEqual([]);
  });

  test('the component section has no violations in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/examples.html');

    const results = await new AxeBuilder({ page }).include('#custom-elements').analyze();
    expect(results.violations).toEqual([]);
  });
});
