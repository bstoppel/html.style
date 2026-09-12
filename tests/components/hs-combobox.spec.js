import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * One test per acceptance scenario on #29. The scenario name is quoted in each
 * title so a failure points at the criterion it breaks rather than at a
 * behaviour nobody agreed.
 */

const box = '#combobox-demo hs-combobox';

/** The shadow input, reached through the host. Playwright pierces shadow DOM. */
const field = (page) => page.locator(box).locator('input');
const options = (page) => page.locator(box).locator('li.option');

test.describe('hs-combobox', () => {
  test('typing filters the list', async ({ page }) => {
    await page.goto('/examples.html');
    await field(page).fill('ber');

    await expect(options(page)).toHaveCount(1);
    await expect(options(page).first()).toHaveText('Berlin');

    // The first match is referenced, not merely highlighted.
    const active = await page.locator(box).evaluate((el) => {
      const i = el.shadowRoot.querySelector('input');
      const id = i.getAttribute('aria-activedescendant');
      return { id, text: el.shadowRoot.querySelector(`#${id}`)?.textContent.trim() };
    });
    expect(active.text).toBe('Berlin');
  });

  test('typing that matches nothing says so rather than showing an empty box', async ({ page }) => {
    await page.goto('/examples.html');
    await field(page).fill('zzzz');

    await expect(options(page)).toHaveCount(0);
    await expect(page.locator(box).locator('.empty')).toBeVisible();
  });

  test('ArrowDown moves aria-activedescendant and leaves focus on the input', async ({ page }) => {
    await page.goto('/examples.html');
    await field(page).click();
    await field(page).press('ArrowDown');
    await field(page).press('ArrowDown');

    const state = await page.locator(box).evaluate((el) => {
      const i = el.shadowRoot.querySelector('input');
      const id = i.getAttribute('aria-activedescendant');
      return {
        text: el.shadowRoot.querySelector(`#${id}`)?.textContent.trim(),
        // Focus must stay on the input: an activedescendant listbox never
        // moves focus to the option.
        focusIsInput: el.shadowRoot.activeElement === i,
      };
    });

    expect(state.text).toBe('Hamburg');
    expect(state.focusIsInput).toBe(true);
  });

  test('Escape closes without committing', async ({ page }) => {
    await page.goto('/examples.html');

    // Commit a value first, so "unchanged" means something.
    await field(page).click();
    await field(page).press('ArrowDown');
    await field(page).press('Enter');
    const committed = await page.locator(box).evaluate((el) => el.value);
    expect(committed).toBe('berlin');

    // Now type something else and abandon it.
    await field(page).fill('ham');
    await field(page).press('ArrowDown');
    await field(page).press('Escape');

    await expect(page.locator(box)).not.toHaveAttribute('open', /.*/);
    expect(await page.locator(box).evaluate((el) => el.value)).toBe('berlin');
  });

  test('the combobox submits with its form', async ({ page }) => {
    await page.goto('/examples.html');
    await field(page).fill('mun');
    await field(page).press('ArrowDown');
    await field(page).press('Enter');

    const submitted = await page.locator('#combobox-demo').evaluate((form) => {
      return Object.fromEntries(new FormData(form).entries());
    });
    expect(submitted.city).toBe('munich');
  });

  test('reset restores the initial value', async ({ page }) => {
    await page.goto('/examples.html');
    await field(page).fill('bre');
    await field(page).press('ArrowDown');
    await field(page).press('Enter');
    expect(await page.locator(box).evaluate((el) => el.value)).toBe('bremen');

    await page.locator('#combobox-demo button[type=reset]').click();

    // The demo authors no value attribute, so the initial value is empty.
    expect(await page.locator(box).evaluate((el) => el.value)).toBe('');
    const after = await page.locator('#combobox-demo').evaluate((form) =>
      Object.fromEntries(new FormData(form).entries())
    );
    expect(after.city ?? '').toBe('');
  });

  test('it reserves its box before upgrade', async ({ page }) => {
    // Measure the un-upgraded element by blocking the component bundle, then
    // compare against the upgraded one on a normal load.
    await page.route('**/html.style.components*.js', (route) => route.abort());
    await page.goto('/examples.html');
    const before = await page.locator(box).boundingBox();
    await page.unroute('**/html.style.components*.js');

    await page.goto('/examples.html');
    await page.locator(box).locator('input').waitFor();
    const after = await page.locator(box).boundingBox();

    // Within a pixel: the ::after box mirrors the shadow input exactly.
    expect(Math.abs(before.height - after.height)).toBeLessThanOrEqual(1);
  });

  test('hs-option never renders', async ({ page }) => {
    await page.goto('/examples.html');
    await expect(page.locator(`${box} hs-option`).first()).toBeHidden();
  });

  test('has no axe violations, open or closed', async ({ page }) => {
    await page.goto('/examples.html');

    const closed = await new AxeBuilder({ page }).include('#combobox-demo').analyze();
    expect(closed.violations).toEqual([]);

    await field(page).click();
    await field(page).press('ArrowDown');

    const open = await new AxeBuilder({ page }).include('#combobox-demo').analyze();
    expect(open.violations).toEqual([]);
  });
});
