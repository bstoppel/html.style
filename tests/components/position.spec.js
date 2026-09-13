import { test, expect } from '@playwright/test';

/**
 * src/components/position.js — the anchor positioning shared by the floating
 * components. docs/positioning.md has the decision and the compatibility data.
 *
 * Two things shape these tests.
 *
 * The browser here HAS anchor positioning (Chromium 145; the property has
 * placed boxes correctly since 125), so `auto` takes the declarative path and
 * the script fallback would never run. Every fallback test therefore names
 * `strategy: 'script'`. Without that the path written FOR the floor is the one
 * path CI never exercises.
 *
 * The fixture imports the module straight from `/components/position.js`. That
 * only works because the module imports nothing — a component module would
 * fail here on Lit's bare specifier.
 */

const VIEWPORT = { width: 800, height: 600 };

/** The anchor is 120x40 and the panel 200x100, so viewport room is predictable. */
async function mount(page, options = {}) {
  await page.evaluate(async (opts) => {
    window.__detach?.();
    document.getElementById('position-fixture')?.remove();

    const { tether, anchorStyles, hasAnchorPositioning } = await import('/components/position.js');
    window.__hasAnchorPositioning = hasAnchorPositioning;

    const host = document.createElement('div');
    host.id = 'position-fixture';
    host.style.direction = opts.direction ?? 'ltr';

    const root = host.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [anchorStyles];
    root.innerHTML = `
      <button id="trigger" style="${opts.anchorCss} inline-size: 120px; block-size: 40px; margin: 0;">go</button>
      <div id="panel" popover="manual" style="inline-size: 200px; block-size: 100px; padding: 0; border: 0;"></div>
    `;
    document.body.append(host);

    const trigger = root.getElementById('trigger');
    const panel = root.getElementById('panel');
    if (opts.gap) panel.style.setProperty('--hs-anchor-gap', opts.gap);

    // Shown before tethering: a display: none box has nothing to measure.
    panel.showPopover();

    window.__trigger = trigger;
    window.__panel = panel;
    window.__detach = tether(panel, trigger, {
      strategy: opts.strategy,
      placement: opts.placement,
      align: opts.align,
    });
  }, options);
}

async function measure(page) {
  return page.evaluate(() => {
    const anchor = window.__trigger.getBoundingClientRect();
    const panel = window.__panel.getBoundingClientRect();
    return {
      hasAnchorPositioning: window.__hasAnchorPositioning,
      anchored: window.__panel.dataset.hsAnchored ?? null,
      placement: window.__panel.dataset.hsPlacement ?? null,
      align: window.__panel.dataset.hsAlign ?? null,
      anchor: { top: anchor.top, bottom: anchor.bottom, left: anchor.left, right: anchor.right },
      panel: { top: panel.top, bottom: panel.bottom, left: panel.left, right: panel.right },
    };
  });
}

/** Both paths settle within a frame; the script one repositions on a rAF. */
const settle = (page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

test.describe('anchor positioning', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
    await page.goto('/examples.html');
  });

  test('the script path puts the box where the declarative path puts it', async ({ page }) => {
    const anchorCss = 'position: fixed; top: 100px; left: 200px;';

    await mount(page, { anchorCss, strategy: 'declarative' });
    const declarative = await measure(page);

    await mount(page, { anchorCss, strategy: 'script' });
    const script = await measure(page);

    // The point of the fallback is that nobody can tell which path ran. If
    // these drift apart, the floor and everything above it disagree about
    // where a menu opens.
    expect(script.panel.top).toBeCloseTo(declarative.panel.top, 0);
    expect(script.panel.left).toBeCloseTo(declarative.panel.left, 0);
    expect(script.panel.bottom).toBeCloseTo(declarative.panel.bottom, 0);
    expect(script.panel.right).toBeCloseTo(declarative.panel.right, 0);
  });

  test('the box sits after the anchor, start edges lined up', async ({ page }) => {
    await mount(page, { anchorCss: 'position: fixed; top: 100px; left: 200px;', strategy: 'script' });
    const { placement, align, anchor, panel } = await measure(page);

    expect(placement).toBe('block-end');
    expect(align).toBe('start');
    expect(panel.top).toBeGreaterThan(anchor.bottom);
    expect(panel.left).toBeCloseTo(anchor.left, 0);
  });

  test('the box flips before the anchor when there is no room after it', async ({ page }) => {
    // 40px below the anchor, and the panel is 100 tall.
    await mount(page, { anchorCss: 'position: fixed; top: 520px; left: 200px;', strategy: 'script' });
    const { placement, anchor, panel } = await measure(page);

    expect(placement).toBe('block-start');
    expect(panel.bottom).toBeLessThan(anchor.top);
  });

  test('the alignment flips when the box would leave the viewport', async ({ page }) => {
    // Start-aligned the panel would end at 850 in an 800 viewport; end-aligned
    // it fits exactly.
    await mount(page, { anchorCss: 'position: fixed; top: 100px; left: 650px;', strategy: 'script' });
    const { align, anchor, panel } = await measure(page);

    expect(align).toBe('end');
    expect(panel.right).toBeCloseTo(anchor.right, 0);
    expect(panel.right).toBeLessThanOrEqual(VIEWPORT.width);
  });

  test('a preferred side that fits is never flipped away from', async ({ page }) => {
    await mount(page, {
      anchorCss: 'position: fixed; top: 300px; left: 200px;',
      strategy: 'script',
      placement: 'block-start',
    });
    const { placement, anchor, panel } = await measure(page);

    expect(placement).toBe('block-start');
    expect(panel.bottom).toBeLessThan(anchor.top);
  });

  test('centring agrees on both paths, including the shift back into view', async ({ page }) => {
    // Centring has no opposite to flip to, so it shifts instead. The declarative
    // path gets that from the containing block and the script path computes it,
    // which is exactly the kind of divergence worth pinning down.
    for (const anchorCss of [
      'position: fixed; top: 200px; left: 360px;',
      'position: fixed; top: 200px; left: 10px;',
      // Fully on screen, but a centred 200px box would hang 10px off the end.
      'position: fixed; top: 200px; left: 650px;',
    ]) {
      await mount(page, { anchorCss, align: 'center', strategy: 'declarative' });
      const declarative = await measure(page);

      await mount(page, { anchorCss, align: 'center', strategy: 'script' });
      const script = await measure(page);

      expect(script.panel.left, anchorCss).toBeCloseTo(declarative.panel.left, 0);
      expect(script.panel.right, anchorCss).toBeCloseTo(declarative.panel.right, 0);
      // Never off screen, whichever path ran.
      expect(script.panel.left).toBeGreaterThanOrEqual(0);
      expect(script.panel.right).toBeLessThanOrEqual(VIEWPORT.width);
    }
  });

  test('a centred box sits on the anchor midpoint when there is room', async ({ page }) => {
    await mount(page, {
      anchorCss: 'position: fixed; top: 200px; left: 360px;',
      align: 'center',
      strategy: 'script',
    });
    const { align, anchor, panel } = await measure(page);

    expect(align).toBe('center');
    expect((panel.left + panel.right) / 2).toBeCloseTo((anchor.left + anchor.right) / 2, 0);
  });

  test('a centred box near the edge is not wrapped into a column', async ({ page }) => {
    // position-area cells are containing blocks, so `center` capped the box at
    // the anchor's width and a tooltip on a small button became four lines of
    // one word. `span-all` is what keeps the two paths the same shape.
    await mount(page, {
      anchorCss: 'position: fixed; top: 200px; left: 360px;',
      align: 'center',
      strategy: 'declarative',
    });
    const { anchor, panel } = await measure(page);

    expect(panel.right - panel.left).toBeGreaterThan(anchor.right - anchor.left);
  });

  test('the box follows the anchor when the page scrolls', async ({ page }) => {
    await mount(page, { anchorCss: 'position: absolute; top: 400px; left: 200px;', strategy: 'script' });
    const before = await measure(page);

    await page.evaluate(() => window.scrollTo(0, 200));
    await settle(page);
    const after = await measure(page);

    // The popover is in the top layer, so nothing scrolls it along — if the
    // module stopped listening, the anchor would move out from under it.
    expect(await page.evaluate(() => window.scrollY)).toBe(200);
    expect(after.anchor.top).toBeCloseTo(before.anchor.top - 200, 0);
    expect(after.panel.top - after.anchor.bottom).toBeCloseTo(before.panel.top - before.anchor.bottom, 0);
  });

  test('RTL lines the start edges up on the right', async ({ page }) => {
    await mount(page, {
      anchorCss: 'position: fixed; top: 100px; left: 200px;',
      strategy: 'script',
      direction: 'rtl',
    });
    const { align, anchor, panel } = await measure(page);

    // Start alignment is logical: in RTL the inline-start edge is the right one.
    expect(align).toBe('start');
    expect(panel.right).toBeCloseTo(anchor.right, 0);
    expect(panel.left).toBeLessThan(anchor.left);
  });

  test('the gap comes from --hs-anchor-gap', async ({ page }) => {
    await mount(page, {
      anchorCss: 'position: fixed; top: 100px; left: 200px;',
      strategy: 'script',
      gap: '24px',
    });
    const { anchor, panel } = await measure(page);

    expect(panel.top - anchor.bottom).toBeCloseTo(24, 0);
  });

  test('the path taken matches what the browser supports', async ({ page }) => {
    await mount(page, { anchorCss: 'position: fixed; top: 100px; left: 200px;' });
    const { anchored, hasAnchorPositioning } = await measure(page);

    expect(anchored).toBe(hasAnchorPositioning ? 'declarative' : 'script');
  });

  test('the declarative path reports no placement rather than a wrong one', async ({ page }) => {
    await mount(page, { anchorCss: 'position: fixed; top: 520px; left: 200px;', strategy: 'declarative' });
    const { anchored, placement, align, anchor, panel } = await measure(page);

    // It flipped — the box is above the anchor — but position-try-fallbacks
    // offers no way to read that back, so the attributes stay absent.
    expect(anchored).toBe('declarative');
    expect(panel.bottom).toBeLessThan(anchor.top);
    expect(placement).toBeNull();
    expect(align).toBeNull();
  });

  test('detach undoes everything it set', async ({ page }) => {
    await mount(page, { anchorCss: 'position: fixed; top: 100px; left: 200px;', strategy: 'script' });

    const leftovers = await page.evaluate(() => {
      window.__detach();
      window.__detach = null;
      const panel = window.__panel;
      return {
        data: { ...panel.dataset },
        properties: ['--hs-anchor-after', '--hs-anchor-before', '--hs-anchor-start', '--hs-anchor-end']
          .map((name) => panel.style.getPropertyValue(name))
          .filter(Boolean),
      };
    });

    expect(leftovers.data).toEqual({});
    expect(leftovers.properties).toEqual([]);
  });

  test('detach releases the anchor name it borrowed', async ({ page }) => {
    await mount(page, { anchorCss: 'position: fixed; top: 100px; left: 200px;', strategy: 'declarative' });

    const leftovers = await page.evaluate(() => {
      window.__detach();
      window.__detach = null;
      return {
        anchorName: window.__trigger.style.getPropertyValue('anchor-name'),
        anchored: window.__panel.dataset.hsAnchored ?? null,
      };
    });

    expect(leftovers.anchorName).toBe('');
    expect(leftovers.anchored).toBeNull();
  });
});
