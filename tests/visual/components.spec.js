import { test, expect } from '@playwright/test';

// Run 
// npx playwright test --update-snapshots 
// locally to generate and commit the initial screenshots, 
// then push them to the repo for CI to compare against.
test.describe('Visual Regression - Components', () => {
  test('buttons render correctly', async ({ page }) => {
    await page.goto('/');
    // Plain `button` alone grabs the nav's own toggle - a real <button>,
    // first in the DOM, hidden above the mobile breakpoint.
    const button = page.locator('button:visible').first();
    await expect(button).toHaveScreenshot('button-primary.png');
  });

  test('dark mode renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page).toHaveScreenshot('dark-mode-full.png');
  });

  test('light mode renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page).toHaveScreenshot('light-mode-full.png');
  });

  test('cards render at different container sizes', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 400, height: 800 });
    await expect(page.locator('.card').first()).toHaveScreenshot('card-small.png');

    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.card').first()).toHaveScreenshot('card-large.png');
  });

  test('forms render correctly', async ({ page }) => {
    await page.goto('/');
    // Target by id, not .first(). Adding a form earlier in the document
    // silently repointed this test at different markup.
    await expect(page.locator('#form-demo')).toHaveScreenshot('form.png');
  });

  test('custom elements render correctly', async ({ page }) => {
    await page.goto('/');
    // Nothing visual covered the components before, which is how a switch with
    // a 0x0 thumb shipped and passed the whole suite.
    await expect(page.locator('hs-alert').first()).toHaveScreenshot('hs-alert.png');
    await expect(page.locator('#component-demo')).toHaveScreenshot('hs-toggles.png');
  });

  test('custom elements render correctly in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('#component-demo')).toHaveScreenshot('hs-toggles-dark.png');
  });

  test('alerts render in all variants', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.alert--success').first()).toHaveScreenshot('alert-success.png');
    await expect(page.locator('.alert--warning').first()).toHaveScreenshot('alert-warning.png');
    await expect(page.locator('.alert--error').first()).toHaveScreenshot('alert-error.png');
    await expect(page.locator('.alert--info').first()).toHaveScreenshot('alert-info.png');
  });

  test('layout primitives render correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.stack').first()).toHaveScreenshot('layout-stack.png');
    await expect(page.locator('.cluster').first()).toHaveScreenshot('layout-cluster.png');
  });
});

test.describe('Visual Regression - Container Queries', () => {
  test('card adapts to container size', async ({ page }) => {
    await page.goto('/');

    // Small viewport
    await page.setViewportSize({ width: 400, height: 800 });
    const smallCard = await page.locator('.card').first().screenshot();

    // Large viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    const largeCard = await page.locator('.card').first().screenshot();

    // Cards should look different at different sizes
    expect(smallCard).not.toEqual(largeCard);
  });
});
