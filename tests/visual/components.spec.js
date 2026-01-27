import { test, expect } from '@playwright/test';

// Run 
// npx playwright test --update-snapshots 
// locally to generate and commit the initial screenshots, 
// then push them to the repo for CI to compare against.
test.describe.skip('Visual Regression - Components', () => {
  test('buttons render correctly', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('button').first();
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
    const form = page.locator('form').first();
    await expect(form).toHaveScreenshot('form.png');
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
