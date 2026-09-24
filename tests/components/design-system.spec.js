import { test, expect } from '@playwright/test';

/**
 * The design system's contract: settings are custom properties with defaults,
 * and a consumer can change them from outside — including through a shadow
 * boundary, where nothing else they write can reach.
 */

test.describe('Token layer', () => {
  test('the three tiers all resolve', async ({ page }) => {
    await page.goto('/');
    const tokens = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const read = (name) => cs.getPropertyValue(name).trim();
      return {
        primitive: read('--p-brand-600'),
        semantic: read('--color-action-primary'),
        derived: read('--color-action-hover'),
        motion: read('--motion-duration'),
        focus: read('--focus-ring-width'),
        border: read('--border-width'),
        layer: read('--p-layer-overlay'),
      };
    });

    for (const [name, value] of Object.entries(tokens)) {
      expect(value, `${name} should resolve`).not.toBe('');
    }
  });

  test('changing one primitive moves everything derived from it', async ({ page }) => {
    await page.goto('/');
    const backgroundColor = () =>
      page.evaluate(() => getComputedStyle(document.querySelector('button')).backgroundColor);

    const before = await backgroundColor();
    // The whole point of the primitive tier: one hue drives the brand.
    await page.evaluate(() => document.documentElement.style.setProperty('--p-brand-hue', '140'));
    // --p-brand-hue is registered via @property and :root transitions it
    // (ADR-0009), so the new value is not readable synchronously — same
    // reason the resize and recolour tests below wait.
    await page.waitForTimeout(350);
    const after = await backgroundColor();

    expect(after).not.toBe(before);
  });
});

test.describe('Component settings are custom properties', () => {
  test('a shadow component can be resized from outside', async ({ page }) => {
    await page.goto('/examples.html');

    // ::part() can restyle the element, but it cannot beat an inline-size
    // declared inside the shadow root. Custom properties are the only route in.
    const measure = () =>
      page.locator('hs-toggle[name="notifications"]').evaluate((el) => {
        const track = el.shadowRoot.querySelector('.track').getBoundingClientRect();
        const thumb = el.shadowRoot.querySelector('.thumb').getBoundingClientRect();
        return {
          trackWidth: Math.round(track.width),
          thumbWidth: Math.round(thumb.width),
          travel: Math.round(thumb.x - track.x),
        };
      });

    const before = await measure();

    await page.locator('hs-toggle[name="notifications"]').evaluate((el) => {
      el.style.setProperty('--hs-toggle-track-inline-size', '4rem');
      el.style.setProperty('--hs-toggle-thumb-size', '1.6rem');
    });
    await page.waitForTimeout(350);
    const after = await measure();

    expect(after.trackWidth).toBeGreaterThan(before.trackWidth);
    expect(after.thumbWidth).toBeGreaterThan(before.thumbWidth);
    // Travel is derived from the sizes rather than hardcoded, so it follows.
    expect(after.travel).toBeGreaterThan(before.travel);
  });

  test('a shadow component can be recoloured from outside', async ({ page }) => {
    await page.goto('/examples.html');
    const toggle = page.locator('hs-toggle[name="notifications"]');
    const trackColour = () =>
      toggle.evaluate((el) => getComputedStyle(el.shadowRoot.querySelector('.track')).backgroundColor);

    const before = await trackColour();
    await toggle.evaluate((el) =>
      el.style.setProperty('--hs-toggle-track-color-checked', 'rgb(102, 51, 153)')
    );
    // The track transitions its background, so the new value is not readable
    // synchronously — the same reason the resize test waits.
    await page.waitForTimeout(350);
    const after = await trackColour();

    expect(after).not.toBe(before);
    expect(after).toBe('rgb(102, 51, 153)');
  });

  test('every setting has a default, so nothing is required', async ({ page }) => {
    await page.goto('/examples.html');
    // Nothing on the page sets any --hs-* property, and the components render.
    const rendered = await page.locator('hs-toggle').first().evaluate((el) => {
      const track = el.shadowRoot.querySelector('.track').getBoundingClientRect();
      return track.width > 0 && track.height > 0;
    });
    expect(rendered).toBe(true);
  });

  test('tabs expose their spacing and indicator', async ({ page }) => {
    await page.goto('/examples.html');
    const changed = await page.locator('#tabs-demo').evaluate((el) => {
      const tab = () => getComputedStyle(el.shadowRoot.querySelector('[role="tab"]'));
      const before = tab().borderBottomWidth;
      el.style.setProperty('--hs-tabs-indicator-size', '6px');
      return { before, after: tab().borderBottomWidth };
    });
    expect(changed.after).toBe('6px');
    expect(changed.after).not.toBe(changed.before);
  });
});

test.describe('Reduced motion crosses the shadow boundary', () => {
  test('collapsing the token reaches inside a shadow root', async ({ browser }) => {
    // A media query in the global stylesheet cannot reach a shadow root, but
    // custom properties INHERIT through it. Components that build transitions
    // from --motion-duration are covered without restating anything.
    const read = async (reducedMotion) => {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();
      await page.goto('/examples.html');
      const value = await page.locator('hs-toggle').first().evaluate(
        (el) => getComputedStyle(el.shadowRoot.querySelector('.track')).transitionDuration
      );
      await context.close();
      return parseFloat(value);
    };

    const normal = await read('no-preference');
    const reduced = await read('reduce');

    expect(normal).toBeGreaterThan(0.1);
    expect(reduced).toBeLessThan(0.001);
  });
});
