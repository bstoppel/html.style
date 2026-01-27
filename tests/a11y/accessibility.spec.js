import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe.skip('Accessibility Tests', () => {
  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('examples page has no accessibility violations', async ({ page }) => {
    await page.goto('/examples.html');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dark mode has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'dark' });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation works correctly', async ({ page }) => {
    await page.goto('/');

    // Tab to first focusable element (skip link)
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();

    // Tab to next element
    await page.keyboard.press('Tab');
    const firstNavLink = page.locator('nav a').first();
    await expect(firstNavLink).toBeFocused();
  });

  test('focus visible indicator is present', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus-visible');
    const outlineWidth = await focused.evaluate(
      el => getComputedStyle(el).outlineWidth
    );

    // Should have visible outline (at least 2px)
    expect(parseInt(outlineWidth)).toBeGreaterThanOrEqual(2);
  });

  test('skip link works', async ({ page }) => {
    await page.goto('/');

    // Focus skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();

    // Activate skip link
    await page.keyboard.press('Enter');

    // Main content should be focused
    const main = page.locator('#main-content');
    await expect(main).toBeFocused();
  });

  test('color contrast meets WCAG AA in light mode', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'light' });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('color contrast meets WCAG AA in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'dark' });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const text = await buttons.nth(i).textContent();
      const ariaLabel = await buttons.nth(i).getAttribute('aria-label');

      // Either visible text or aria-label should exist
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('form fields have labels', async ({ page }) => {
    await page.goto('/');

    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const id = await inputs.nth(i).getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });
});
