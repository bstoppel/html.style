import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * One test per acceptance scenario on #31, with the scenario name quoted in the
 * title so a failure points at the criterion it breaks.
 */

const tip = '#tooltip-demo hs-tooltip[for="tooltip-archive"]';
const above = '#tooltip-demo hs-tooltip[for="tooltip-purge"]';
const button = '#tooltip-archive';

/** The fade runs on --motion-duration, so give it a beat to finish. */
const settle = (page) => page.waitForTimeout(300);

async function state(page, selector = tip) {
  return page.locator(selector).evaluate((el) => {
    const trigger = el.trigger;
    const bubble = el.getBoundingClientRect();
    const anchor = trigger.getBoundingClientRect();

    return {
      open: el.matches(':popover-open'),
      popover: el.popover,
      role: el.getAttribute('role'),
      describedBy: (trigger.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean),
      id: el.id,
      opacity: getComputedStyle(el).opacity,
      transitionDuration: getComputedStyle(el).transitionDuration,
      centres: {
        anchor: (anchor.left + anchor.right) / 2,
        bubble: (bubble.left + bubble.right) / 2,
      },
      block: { anchorTop: anchor.top, anchorBottom: anchor.bottom, top: bubble.top, bottom: bubble.bottom },
    };
  });
}

test.describe('hs-tooltip', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples.html');
    await page.locator(button).scrollIntoViewIfNeeded();
  });

  test('hover and focus both reveal it', async ({ page }) => {
    expect((await state(page)).open).toBe(false);

    await page.locator(button).hover();
    await settle(page);
    expect((await state(page)).open).toBe(true);

    // Away, then back by keyboard.
    await page.mouse.move(0, 0);
    await settle(page);
    expect((await state(page)).open).toBe(false);

    await page.locator(button).focus();
    await settle(page);
    const focused = await state(page);
    expect(focused.open).toBe(true);
    expect(focused.opacity).toBe('1');
  });

  test('it is announced as a description', async ({ page }) => {
    const { describedBy, id, role } = await state(page);

    expect(role).toBe('tooltip');
    expect(describedBy).toContain(id);

    // The button keeps its own accessible name: describedby adds a description,
    // it does not relabel the control.
    const name = await page.locator(button).evaluate((el) => el.textContent.trim());
    expect(name).toBe('Archive');
  });

  test('Escape dismisses a tooltip that is in the way', async ({ page }) => {
    await page.locator(button).focus();
    await settle(page);
    expect((await state(page)).open).toBe(true);

    await page.keyboard.press('Escape');
    await settle(page);

    expect((await state(page)).open).toBe(false);
    // "And focus stays on the trigger"
    expect(await page.evaluate(() => document.activeElement.id)).toBe('tooltip-archive');
  });

  test('reduced motion removes the fade', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/examples.html');
    await page.locator(button).scrollIntoViewIfNeeded();

    // --motion-duration collapses on :root and reaches the transition through
    // the token, with no per-component media query.
    const { transitionDuration } = await state(page);
    for (const duration of transitionDuration.split(',')) {
      expect(Number.parseFloat(duration)).toBeLessThan(0.05);
    }
  });

  test('the bubble is centred on its trigger', async ({ page }) => {
    await page.locator(button).hover();
    await settle(page);
    const { centres, block } = await state(page);

    expect(centres.bubble).toBeCloseTo(centres.anchor, 0);
    expect(block.top).toBeGreaterThan(block.anchorBottom);
  });

  test('placement="block-start" puts it above the trigger', async ({ page }) => {
    await page.locator('#tooltip-purge').scrollIntoViewIfNeeded();
    await page.locator('#tooltip-purge').hover();
    await settle(page);

    const { open, block } = await state(page, above);
    expect(open).toBe(true);
    expect(block.bottom).toBeLessThan(block.anchorTop);
  });

  test('it is a manual popover, so it never dismisses another one', async ({ page }) => {
    // An auto popover closes every other auto popover that is not its ancestor,
    // which would mean a tooltip appearing closed an open menu.
    expect((await state(page)).popover).toBe('manual');

    await page.locator('#menu-demo hs-menu').locator('[part="trigger"]').click();
    await settle(page);

    await page.locator(button).hover();
    await settle(page);

    const menuStillOpen = await page
      .locator('#menu-demo hs-menu')
      .evaluate((el) => el.shadowRoot.querySelector('[part="menu"]').matches(':popover-open'));
    expect(menuStillOpen).toBe(true);
    expect((await state(page)).open).toBe(true);
  });

  test('it releases the trigger when it goes away', async ({ page }) => {
    const before = await state(page);
    expect(before.describedBy).toContain(before.id);

    await page.locator(tip).evaluate((el) => el.remove());

    // aria-describedby pointing at an element that no longer exists is worse
    // than no description at all.
    const describedBy = await page
      .locator(button)
      .evaluate((el) => el.getAttribute('aria-describedby'));
    expect(describedBy).toBeNull();
  });

  test('it adds to aria-describedby rather than replacing it', async ({ page }) => {
    const describedBy = await page.evaluate(() => {
      const trigger = document.querySelector('#tooltip-archive');
      const tooltip = document.querySelector('#tooltip-demo hs-tooltip[for="tooltip-archive"]');

      trigger.setAttribute('aria-describedby', 'some-other-hint');
      // Re-attach by pointing `for` away and back.
      tooltip.setAttribute('for', 'nothing-here');
      tooltip.setAttribute('for', 'tooltip-archive');

      return trigger.getAttribute('aria-describedby').split(/\s+/);
    });

    expect(describedBy).toContain('some-other-hint');
    expect(describedBy.length).toBe(2);
  });

  test('it never renders before upgrade', async ({ page }) => {
    await page.route('**/html.style.components*.js', (route) => route.abort());
    await page.goto('/examples.html');

    // A description is not page content: without its script it should be absent
    // rather than a stray line of prose under the button.
    await expect(page.locator(tip)).toBeHidden();
  });

  test('no accessibility violations, hidden or shown', async ({ page }) => {
    const hidden = await new AxeBuilder({ page }).include('#tooltip-demo').analyze();
    expect(hidden.violations).toEqual([]);

    await page.locator(button).hover();
    await settle(page);

    const shown = await new AxeBuilder({ page }).include('#tooltip-demo').analyze();
    expect(shown.violations).toEqual([]);
  });
});
