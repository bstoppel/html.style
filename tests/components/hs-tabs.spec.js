import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const tabs = (page) => page.locator('#tabs-demo');

const inside = (page, fn) => tabs(page).evaluate(fn);

test.describe('hs-tabs', () => {
  test('derives one tab per panel, labelled from the panel', async ({ page }) => {
    await page.goto('/examples.html');
    const labels = await inside(page, (el) =>
      [...el.shadowRoot.querySelectorAll('[role="tab"]')].map((t) => t.textContent.trim())
    );
    expect(labels).toEqual(['Overview', 'Keyboard', 'Activation']);
  });

  test('ARIA relationships resolve, which is why both halves live in the shadow root', async ({ page }) => {
    await page.goto('/examples.html');

    // aria-controls and aria-labelledby are IDREFs and cannot cross a shadow
    // boundary. Tabs in the shadow root pointing at panels in light DOM would
    // silently reference nothing.
    const resolved = await inside(page, (el) => {
      const root = el.shadowRoot;
      const tabList = [...root.querySelectorAll('[role="tab"]')];
      const panels = [...root.querySelectorAll('[role="tabpanel"]')];
      return {
        controls: tabList.every((t) => !!root.getElementById(t.getAttribute('aria-controls'))),
        labelledby: panels.every((p) => !!root.getElementById(p.getAttribute('aria-labelledby'))),
        tablist: !!root.querySelector('[role="tablist"]'),
      };
    });

    expect(resolved).toEqual({ controls: true, labelledby: true, tablist: true });
  });

  test('exactly one panel is visible, and it matches the selected tab', async ({ page }) => {
    await page.goto('/examples.html');
    const state = await inside(page, (el) => {
      const root = el.shadowRoot;
      const visible = [...root.querySelectorAll('[role="tabpanel"]')].filter(
        (p) => !p.hasAttribute('hidden')
      );
      const selected = [...root.querySelectorAll('[role="tab"]')].findIndex(
        (t) => t.getAttribute('aria-selected') === 'true'
      );
      return { visibleCount: visible.length, visibleId: visible[0]?.id, selected };
    });

    expect(state.visibleCount).toBe(1);
    expect(state.selected).toBe(0);
    expect(state.visibleId).toBe('panel-0');
  });

  test('uses roving tabindex, so the tablist is one tab stop', async ({ page }) => {
    await page.goto('/examples.html');
    const indices = await inside(page, (el) =>
      [...el.shadowRoot.querySelectorAll('[role="tab"]')].map((t) => t.tabIndex)
    );
    expect(indices).toEqual([0, -1, -1]);
  });

  test('clicking a tab selects it', async ({ page }) => {
    await page.goto('/examples.html');
    await tabs(page).evaluate((el) => el.shadowRoot.querySelectorAll('[role="tab"]')[1].click());
    await expect(tabs(page)).toHaveJSProperty('selected', 1);
  });

  test('arrow keys move and wrap; Home and End jump to the ends', async ({ page }) => {
    await page.goto('/examples.html');
    const focusFirst = () =>
      tabs(page).evaluate((el) => el.shadowRoot.querySelectorAll('[role="tab"]')[0].focus());

    await focusFirst();
    await page.keyboard.press('ArrowRight');
    await expect(tabs(page)).toHaveJSProperty('selected', 1);

    await page.keyboard.press('End');
    await expect(tabs(page)).toHaveJSProperty('selected', 2);

    // Wraps forward from the last tab.
    await page.keyboard.press('ArrowRight');
    await expect(tabs(page)).toHaveJSProperty('selected', 0);

    // And backward from the first.
    await page.keyboard.press('ArrowLeft');
    await expect(tabs(page)).toHaveJSProperty('selected', 2);

    await page.keyboard.press('Home');
    await expect(tabs(page)).toHaveJSProperty('selected', 0);
  });

  test('manual activation moves focus without selecting', async ({ page }) => {
    await page.goto('/examples.html');
    await tabs(page).evaluate((el) => {
      el.activation = 'manual';
      el.shadowRoot.querySelectorAll('[role="tab"]')[0].focus();
    });

    await page.keyboard.press('ArrowRight');
    // Focus moved, selection did not — a screen reader user can browse first.
    await expect(tabs(page)).toHaveJSProperty('selected', 0);
    const focusedIndex = await inside(page, (el) =>
      [...el.shadowRoot.querySelectorAll('[role="tab"]')].indexOf(el.shadowRoot.activeElement)
    );
    expect(focusedIndex).toBe(1);

    await page.keyboard.press('Enter');
    await expect(tabs(page)).toHaveJSProperty('selected', 1);
  });

  test('fires hs-tab-change with the index and label', async ({ page }) => {
    await page.goto('/examples.html');
    const detail = await page.evaluate(() => {
      const el = document.querySelector('#tabs-demo');
      return new Promise((resolve) => {
        el.addEventListener('hs-tab-change', (e) => resolve(e.detail), { once: true });
        el.shadowRoot.querySelectorAll('[role="tab"]')[2].click();
        setTimeout(() => resolve(null), 500);
      });
    });
    expect(detail).toEqual({ index: 2, label: 'Activation' });
  });

  test('survives repeated slot assignment', async ({ page }) => {
    await page.goto('/examples.html');

    // Assigning slot names moves panels out of the default slot, which fires
    // slotchange again with nothing assigned. A handler that trusted
    // assignedElements wiped its own state on that second pass and rendered
    // zero tabs.
    const afterAdding = await page.evaluate(async () => {
      const el = document.querySelector('#tabs-demo');
      const panel = document.createElement('hs-tab-panel');
      panel.setAttribute('label', 'Added');
      panel.textContent = 'Late panel';
      el.append(panel);
      await new Promise((r) => setTimeout(r, 100));
      await el.updateComplete;
      return [...el.shadowRoot.querySelectorAll('[role="tab"]')].map((t) => t.textContent.trim());
    });

    expect(afterAdding).toEqual(['Overview', 'Keyboard', 'Activation', 'Added']);
  });

  test('exposes tablist, tab and panel as parts', async ({ page }) => {
    await page.goto('/examples.html');
    const parts = await inside(page, (el) =>
      [...el.shadowRoot.querySelectorAll('[part]')].map((n) => n.getAttribute('part'))
    );
    expect(parts).toContain('tablist');
    expect(parts).toContain('tab tab-active');
    expect(parts.filter((p) => p === 'panel').length).toBeGreaterThan(0);
  });
});

test.describe('hs-theme-toggle', () => {
  test('renders a real button rather than reimplementing one', async ({ page }) => {
    await page.goto('/examples.html');
    // Light DOM, so the platform still supplies focus, activation and role.
    const shape = await page.locator('#theme-demo').evaluate((el) => ({
      shadow: !!el.shadowRoot,
      child: el.firstElementChild?.tagName.toLowerCase(),
      type: el.firstElementChild?.getAttribute('type'),
      label: el.firstElementChild?.getAttribute('aria-label'),
    }));

    expect(shape.shadow).toBe(false);
    expect(shape.child).toBe('button');
    expect(shape.type).toBe('button');
    expect(shape.label).toBe('Toggle colour scheme');
  });

  test('toggles the colour scheme and reports state via aria-pressed', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/examples.html');

    const button = page.locator('#theme-demo button');
    await expect(button).toHaveAttribute('aria-pressed', 'false');

    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(
      await page.evaluate(() => document.documentElement.style.colorScheme)
    ).toBe('dark');

    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('keeps a stable accessible name across states', async ({ page }) => {
    await page.goto('/examples.html');
    const button = page.locator('#theme-demo button');
    const before = await button.getAttribute('aria-label');
    await button.click();
    const after = await button.getAttribute('aria-label');

    // A toggle button reports state through aria-pressed, not by renaming
    // itself — otherwise voice control loses the target mid-interaction.
    expect(after).toBe(before);
  });

  test('fires hs-theme-change', async ({ page }) => {
    await page.goto('/examples.html');
    const detail = await page.evaluate(() => {
      const el = document.querySelector('#theme-demo');
      return new Promise((resolve) => {
        el.addEventListener('hs-theme-change', (e) => resolve(e.detail), { once: true });
        el.toggle();
        setTimeout(() => resolve(null), 500);
      });
    });
    expect(detail).toHaveProperty('scheme');
    expect(['light', 'dark']).toContain(detail.scheme);
  });
});

test.describe('New component accessibility', () => {
  for (const scheme of ['light', 'dark']) {
    test(`no violations in ${scheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/examples.html');
      const results = await new AxeBuilder({ page }).include('#custom-elements').analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
