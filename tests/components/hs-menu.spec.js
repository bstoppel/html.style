import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * One test per acceptance scenario on #30, with the scenario name quoted in the
 * title so a failure points at the criterion it breaks rather than at a
 * behaviour nobody agreed. The rest cover the parts that were wrong first time.
 */

const menu = '#menu-demo hs-menu';

const trigger = (page) => page.locator(menu).locator('[part="trigger"]');
const items = (page) => page.locator(menu).locator('[part="item"]');

/** The popover settles a frame after it opens: toggle is a queued task. */
const settle = (page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

/** Everything a scenario needs to assert, read through the shadow root. */
async function state(page) {
  return page.locator(menu).evaluate((el) => {
    const root = el.shadowRoot;
    const box = root.querySelector('[part="menu"]');
    const button = root.querySelector('[part="trigger"]');
    const list = [...root.querySelectorAll('[part="item"]')];
    const anchor = button.getBoundingClientRect();
    const placed = box.getBoundingClientRect();

    return {
      open: box.matches(':popover-open'),
      expanded: button.getAttribute('aria-expanded'),
      role: box.getAttribute('role'),
      focused: root.activeElement?.textContent.trim() ?? null,
      focusedIsTrigger: root.activeElement === button,
      // Roving tabindex: exactly one item in the tab order at a time.
      tabbable: list.filter((item) => item.tabIndex === 0).map((item) => item.textContent.trim()),
      labels: list.map((item) => item.textContent.trim()),
      geometry: { anchorBottom: anchor.bottom, anchorLeft: anchor.left, boxTop: placed.top, boxLeft: placed.left },
    };
  });
}

const openMenu = async (page) => {
  await trigger(page).click();
  await settle(page);
};

test.describe('hs-menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples.html');
  });

  test('the menu opens from its trigger', async ({ page }) => {
    expect((await state(page)).expanded).toBe('false');

    await openMenu(page);
    const open = await state(page);

    expect(open.open).toBe(true);
    expect(open.expanded).toBe('true');
    expect(open.role).toBe('menu');
    expect(open.focused).toBe('Duplicate');
  });

  test('roving tabindex moves between items', async ({ page }) => {
    await openMenu(page);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    const after = await state(page);
    expect(after.focused).toBe(after.labels[2]);
    // "only the focused item is in the tab order"
    expect(after.tabbable).toEqual([after.labels[2]]);
  });

  test('typeahead jumps to a matching item', async ({ page }) => {
    await openMenu(page);
    await page.keyboard.type('de');

    expect((await state(page)).focused).toBe('Delete');
  });

  test('light dismiss returns focus', async ({ page }) => {
    await openMenu(page);
    await page.keyboard.press('Escape');
    await settle(page);

    const after = await state(page);
    expect(after.open).toBe(false);
    expect(after.expanded).toBe('false');
    expect(after.focusedIsTrigger).toBe(true);
  });

  test('it does not trap the keyboard', async ({ page }) => {
    await openMenu(page);
    await page.keyboard.press('Tab');
    await settle(page);

    const after = await state(page);
    expect(after.open).toBe(false);
    // Focus moved on rather than being pulled back to the trigger.
    expect(after.focusedIsTrigger).toBe(false);
    expect(after.focused).toBeNull();
  });

  test('choosing an item reports it and closes the menu', async ({ page }) => {
    const chosen = page.evaluate(
      () =>
        new Promise((resolve) => {
          document
            .querySelector('#menu-demo')
            .addEventListener('hs-menu-select', (event) => resolve(event.detail), { once: true });
        })
    );

    await openMenu(page);
    await items(page).nth(1).click();
    await settle(page);

    expect(await chosen).toEqual({ value: 'rename', label: 'Rename', index: 1 });
    const after = await state(page);
    expect(after.open).toBe(false);
    expect(after.focusedIsTrigger).toBe(true);
  });

  test('ArrowDown and ArrowUp open the menu at the first and last item', async ({ page }) => {
    await trigger(page).focus();
    await page.keyboard.press('ArrowDown');
    await settle(page);
    expect((await state(page)).focused).toBe('Duplicate');

    await page.keyboard.press('Escape');
    await settle(page);
    await page.keyboard.press('ArrowUp');
    await settle(page);

    const up = await state(page);
    expect(up.open).toBe(true);
    expect(up.focused).toBe(up.labels.at(-1));
  });

  test('Home, End and wrapping move focus the way a listbox does', async ({ page }) => {
    await openMenu(page);

    await page.keyboard.press('End');
    let now = await state(page);
    expect(now.focused).toBe(now.labels.at(-1));

    // Wraps forward off the end rather than stopping.
    await page.keyboard.press('ArrowDown');
    now = await state(page);
    expect(now.focused).toBe(now.labels[0]);

    // And backwards off the start.
    await page.keyboard.press('ArrowUp');
    now = await state(page);
    expect(now.focused).toBe(now.labels.at(-1));

    await page.keyboard.press('Home');
    now = await state(page);
    expect(now.focused).toBe(now.labels[0]);
  });

  test('a click on the trigger while open closes the menu', async ({ page }) => {
    await openMenu(page);
    expect((await state(page)).open).toBe(true);

    // The reason the trigger uses popovertarget: without it the light dismiss
    // closes the menu and the same click reopens it.
    await trigger(page).click();
    await settle(page);

    expect((await state(page)).open).toBe(false);
  });

  test('the menu box is placed under its trigger', async ({ page }) => {
    await openMenu(page);
    const { geometry } = await state(page);

    expect(geometry.boxTop).toBeGreaterThan(geometry.anchorBottom);
    expect(geometry.boxLeft).toBeCloseTo(geometry.anchorLeft, 0);
  });

  test('the open property drives the menu from script', async ({ page }) => {
    await page.locator(menu).evaluate((el) => {
      el.open = true;
    });
    await settle(page);
    expect((await state(page)).open).toBe(true);

    await page.locator(menu).evaluate((el) => {
      el.open = false;
    });
    await settle(page);
    const closed = await state(page);
    expect(closed.open).toBe(false);
    expect(closed.expanded).toBe('false');
  });

  test('closing fires hs-close and releases the positioning', async ({ page }) => {
    // Regression: syncing the popover from Lit's update ran inside the
    // platform's own beforetoggle, which coalesced away the toggle event. The
    // menu still closed, so only the work hanging off toggle went missing.
    const closed = page.evaluate(
      () =>
        new Promise((resolve) => {
          document
            .querySelector('#menu-demo')
            .addEventListener('hs-close', () => resolve(true), { once: true });
        })
    );

    await openMenu(page);
    await page.keyboard.press('Escape');

    expect(await closed).toBe(true);
    const anchored = await page
      .locator(menu)
      .evaluate((el) => el.shadowRoot.querySelector('[part="menu"]').dataset.hsAnchored ?? null);
    expect(anchored).toBeNull();
  });

  test('it reserves its box before upgrade', async ({ page }) => {
    // Measure the un-upgraded element by blocking the component bundle, then
    // compare against the upgraded one on a normal load.
    await page.route('**/html.style.components*.js', (route) => route.abort());
    await page.goto('/examples.html');
    const before = await page.locator(menu).boundingBox();
    await page.unroute('**/html.style.components*.js');

    await page.goto('/examples.html');
    await trigger(page).waitFor();
    const after = await page.locator(menu).boundingBox();

    // Within a pixel: the ::before draws the same label with the same padding
    // the trigger button uses.
    expect(Math.abs(before.height - after.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(before.width - after.width)).toBeLessThanOrEqual(1);
  });

  test('hs-menu-item never renders', async ({ page }) => {
    await expect(page.locator(`${menu} hs-menu-item`).first()).toBeHidden();
  });

  test('no accessibility violations, open or closed', async ({ page }) => {
    const closed = await new AxeBuilder({ page }).include('#menu-demo').analyze();
    expect(closed.violations).toEqual([]);

    await openMenu(page);

    const open = await new AxeBuilder({ page }).include('#menu-demo').analyze();
    expect(open.violations).toEqual([]);
  });
});
