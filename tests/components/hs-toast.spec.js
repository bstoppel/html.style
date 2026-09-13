import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * One test per acceptance scenario on #32, with the scenario name quoted in the
 * title so a failure points at the criterion it breaks.
 *
 * What these CANNOT cover: whether a screen reader actually speaks the message.
 * They verify the wiring a screen reader reads — the region's role, politeness
 * and atomicity, that the text is in the region before it is announced, and that
 * focus never moves — but #32 asks for a real screen reader too, and that is a
 * human's job.
 */

const region = '#toast-region';

/** Read the region and everything in it through its own API. */
async function state(page) {
  return page.locator(region).evaluate((el) => ({
    role: el.getAttribute('role'),
    live: el.getAttribute('aria-live'),
    atomic: el.getAttribute('aria-atomic'),
    count: el.toasts.length,
    texts: el.toasts.map((toast) => toast.textContent.trim()),
    roles: el.toasts.map((toast) => toast.getAttribute('role')),
    remaining: el.toasts.map((toast) => Math.round(toast.remaining)),
    paused: el.toasts.map((toast) => toast.paused),
  }));
}

const show = (page, message, options = {}) =>
  page.locator(region).evaluate((el, args) => el.show(args.message, args.options), {
    message,
    options,
  });

test.describe('hs-toast', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples.html');
    await page.locator(region).evaluate((el) => el.clear());
  });

  test('a toast announces itself without stealing focus', async ({ page }) => {
    await page.locator('#toast-demo button').first().focus();
    const before = await page.evaluate(() => document.activeElement.textContent.trim());

    await show(page, 'Draft saved', { variant: 'success' });
    const after = await state(page);

    // The wiring a polite announcement needs.
    expect(after.role).toBe('status');
    expect(after.live).toBe('polite');
    // status implies aria-atomic="true", which would re-announce the whole stack.
    expect(after.atomic).toBe('false');
    expect(after.texts).toEqual(['Draft saved']);

    // "And focus stays where the user left it"
    expect(await page.evaluate(() => document.activeElement.textContent.trim())).toBe(before);
  });

  test('it dismisses itself', async ({ page }) => {
    await show(page, 'Briefly', { duration: 250 });
    expect((await state(page)).count).toBe(1);

    await expect
      .poll(async () => (await state(page)).count, { timeout: 2000 })
      .toBe(0);

    // "And the live region is left empty"
    const emptied = await state(page);
    expect(emptied.texts).toEqual([]);
    expect(await page.locator(region).evaluate((el) => el.textContent.trim())).toBe('');
  });

  test('hover and focus pause the timeout', async ({ page }) => {
    await show(page, 'Hold me');

    await page.locator(`${region} hs-toast`).first().hover();
    const held = await state(page);
    expect(held.paused).toEqual([true]);

    // The clock stops rather than merely slowing.
    await page.waitForTimeout(400);
    expect((await state(page)).remaining[0]).toBe(held.remaining[0]);

    await page.mouse.move(0, 0);
    await expect
      .poll(async () => (await state(page)).remaining[0], { timeout: 2000 })
      .toBeLessThan(held.remaining[0]);
  });

  test('focus inside a toast pauses it, and leaving resumes it', async ({ page }) => {
    // A toast is text, but a consumer can still put a control in one, and the
    // timeout must not take it away while it is being used.
    await page.locator(region).evaluate((el) => {
      const toast = el.show('With a control');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Undo';
      toast.append(button);
    });

    await page.locator(`${region} hs-toast button`).focus();
    const held = await state(page);
    expect(held.paused).toEqual([true]);

    await page.locator('#toast-demo button').first().focus();
    await expect.poll(async () => (await state(page)).paused[0], { timeout: 2000 }).toBe(false);
  });

  test('several toasts stack in order', async ({ page }) => {
    await show(page, 'First', { variant: 'info' });
    await page.waitForTimeout(500);
    await show(page, 'Second', { variant: 'success' });

    const stacked = await state(page);
    expect(stacked.texts).toEqual(['First', 'Second']);

    // "And each keeps its own timeout" — the older one is further along.
    expect(stacked.remaining[0]).toBeLessThan(stacked.remaining[1]);

    // Shown order is also visual order.
    const tops = await page
      .locator(`${region} hs-toast`)
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
    expect(tops[0]).toBeLessThan(tops[1]);
  });

  test('reduced motion keeps the toast, drops the animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/examples.html');

    const measured = await page.locator(region).evaluate((el) => {
      const toast = el.show('Still readable');
      return {
        animation: getComputedStyle(toast).animationDuration,
        duration: toast.duration,
        remaining: toast.remaining,
      };
    });

    expect(Number.parseFloat(measured.animation)).toBeLessThan(0.05);
    // "And the timeout is unchanged, because the message still needs reading time"
    expect(measured.duration).toBe(5000);
    expect(measured.remaining).toBeGreaterThan(4000);
  });

  test('an error toast announces assertively without changing the region', async ({ page }) => {
    await show(page, 'Could not save', { variant: 'error' });
    await show(page, 'Draft saved', { variant: 'success' });

    const after = await state(page);
    expect(after.roles).toEqual(['alert', null]);
    // Changing aria-live on a live region that is already live is not reliably
    // picked up, so the region's politeness never moves.
    expect(after.live).toBe('polite');
  });

  test('duration zero leaves the toast up', async ({ page }) => {
    await show(page, 'Until dismissed', { duration: 0 });
    await page.waitForTimeout(600);

    const after = await state(page);
    expect(after.count).toBe(1);
    expect(after.remaining).toEqual([0]);
  });

  test('dismissal is cancelable, like hs-alert', async ({ page }) => {
    const kept = await page.locator(region).evaluate(async (el) => {
      const toast = el.show('Stubborn', { duration: 0 });
      toast.addEventListener('hs-dismiss', (event) => event.preventDefault());
      const proceeded = toast.dismiss();
      return { proceeded, stillThere: el.toasts.includes(toast) };
    });

    expect(kept.proceeded).toBe(false);
    expect(kept.stillThere).toBe(true);
  });

  test('the region never swallows a click meant for the page', async ({ page }) => {
    await show(page, 'In the corner', { duration: 0 });

    // The region spans a corner of the viewport; only the toasts in it take the
    // pointer, or it would block whatever sits underneath.
    const pointerEvents = await page
      .locator(region)
      .evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(pointerEvents).toBe('none');

    const toastPointerEvents = await page
      .locator(`${region} hs-toast`)
      .evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(toastPointerEvents).toBe('auto');
  });

  test('no accessibility violations, empty or stacked', async ({ page }) => {
    const empty = await new AxeBuilder({ page }).analyze();
    expect(empty.violations).toEqual([]);

    await show(page, 'Draft saved', { variant: 'success', duration: 0 });
    await show(page, 'Could not save', { variant: 'error', duration: 0 });

    // After the entrance animation. Scanned mid-fade, axe blends the text
    // against the page and reports a contrast failure that lasts 200ms and
    // applies to every fade-in ever written.
    await page.waitForTimeout(400);

    const stacked = await new AxeBuilder({ page }).analyze();
    expect(stacked.violations).toEqual([]);
  });
});

/**
 * What Chrome actually computes, rather than what the markup says.
 *
 * The tests above assert attributes. These assert the accessibility tree those
 * attributes produce, which is what a screen reader is handed — and the two can
 * differ. `role="status"` IMPLIES `aria-atomic="true"`, so the explicit
 * `aria-atomic="false"` either survives into the tree or every new toast
 * re-announces the whole stack, and nothing in the markup tells you which.
 *
 * Read through the Chrome DevTools Protocol because Playwright's own
 * accessibility snapshot exposes role and name but not `live` or `atomic`. That
 * makes this block Chromium-only; it skips elsewhere rather than failing.
 *
 * This still is not a screen reader. Tree shape is not speech, and whether
 * NVDA or VoiceOver announces an inserted subtree, and how an assertive message
 * interrupts a queued polite one, is not observable from here. #32 asks for a
 * real screen reader as well, and that part remains a human's job.
 */
test.describe('hs-toast accessibility tree', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'CDP is Chromium-only');

  /** Computed role and live-region properties for every match of a selector. */
  async function axProperties(cdp, selector) {
    // Node ids are invalidated by document changes, so re-resolve every time.
    const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
    const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
      nodeId: root.nodeId,
      selector,
    });

    const found = [];
    for (const nodeId of nodeIds) {
      const { node } = await cdp.send('DOM.describeNode', { nodeId });
      const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId });
      // getPartialAXTree returns ancestors too; take the one for this element.
      const self = nodes.find((n) => n.backendDOMNodeId === node.backendNodeId);
      if (!self) continue;

      const props = Object.fromEntries(
        (self.properties ?? []).map((p) => [p.name, p.value?.value])
      );
      found.push({ role: self.role?.value, live: props.live, atomic: props.atomic });
    }
    return found;
  }

  async function session(page) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Accessibility.enable');
    await cdp.send('DOM.enable');
    return cdp;
  }

  test('the region is polite and NOT atomic', async ({ page }) => {
    await page.goto('/examples.html');
    const cdp = await session(page);

    const [node] = await axProperties(cdp, region);
    expect(node.role).toBe('status');
    expect(node.live).toBe('polite');
    // The load-bearing one: status implies atomic true, and leaving it that way
    // means every arriving toast re-announces the ones already on screen.
    expect(node.atomic).toBe(false);
  });

  test('an error toast is assertive, and the region stays polite', async ({ page }) => {
    await page.goto('/examples.html');
    const cdp = await session(page);

    await page.locator(region).evaluate((el) => {
      el.clear();
      el.show('Draft saved', { variant: 'success', duration: 0 });
      el.show('Could not save', { variant: 'error', duration: 0 });
    });

    const toasts = await axProperties(cdp, `${region} hs-toast`);
    expect(toasts).toHaveLength(2);

    // A plain toast carries no live semantics of its own — the region's cover
    // it. One with aria-live on it as well would be announced twice.
    expect(toasts[0].live).toBeUndefined();

    // The error toast raises itself, and only itself.
    expect(toasts[1].role).toBe('alert');
    expect(toasts[1].live).toBe('assertive');

    const [node] = await axProperties(cdp, region);
    expect(node.live).toBe('polite');
  });
});
