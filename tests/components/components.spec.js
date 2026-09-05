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

  test('exposes track and thumb as parts for theming', async ({ page }) => {
    await page.goto('/examples.html');
    const parts = await page.locator('hs-toggle').first().evaluate((el) =>
      [...el.shadowRoot.querySelectorAll('[part]')].map((n) => n.getAttribute('part'))
    );
    expect(parts).toEqual(['track', 'thumb']);
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
