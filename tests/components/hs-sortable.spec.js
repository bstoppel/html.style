import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * One test per acceptance scenario on #33, with the scenario name quoted in the
 * title so a failure points at the criterion it breaks.
 */

const demo = '#sortable-demo';
const header = (page, nth) => page.locator(`${demo} thead th:nth-child(${nth})`);
const control = (page, nth) => header(page, nth).locator('button[data-hs-sort]');

async function state(page) {
  return page.locator(`${demo} hs-sortable`).evaluate((el) => ({
    headers: [...el.querySelectorAll('thead th')].map((th) => ({
      text: th.textContent.trim(),
      sort: th.getAttribute('aria-sort'),
      control: !!th.querySelector('button[data-hs-sort]'),
    })),
    names: [...el.querySelectorAll('tbody tr')].map((row) => row.cells[0].textContent.trim()),
    sizes: [...el.querySelectorAll('tbody tr')].map((row) => row.cells[1].textContent.trim()),
  }));
}

test.describe('hs-sortable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples.html');
  });

  test('clicking a header sorts by that column', async ({ page }) => {
    const before = await state(page);
    expect(before.headers[0].sort).toBe('none');

    await control(page, 1).click();
    const after = await state(page);

    expect(after.names).toEqual([...before.names].sort((a, b) => a.localeCompare(b)));
    expect(after.headers[0].sort).toBe('ascending');
  });

  test('activating the same header reverses the order', async ({ page }) => {
    await control(page, 1).click();
    const ascending = (await state(page)).names;

    await control(page, 1).click();
    const after = await state(page);

    expect(after.names).toEqual([...ascending].reverse());
    expect(after.headers[0].sort).toBe('descending');
  });

  test('only one column is sorted at a time', async ({ page }) => {
    await control(page, 1).click();
    expect((await state(page)).headers[0].sort).toBe('ascending');

    await control(page, 2).click();
    const after = await state(page);

    // "the previous header no longer carries aria-sort" — it goes back to
    // "none", which still says the column is sortable.
    expect(after.headers[0].sort).toBe('none');
    expect(after.headers[1].sort).toBe('ascending');
  });

  test('the keyboard reaches the sort control', async ({ page }) => {
    await control(page, 1).focus();
    await page.keyboard.press('Enter');
    expect((await state(page)).headers[0].sort).toBe('ascending');

    // Both keys, because both come from the button rather than a handler.
    await page.keyboard.press('Space');
    expect((await state(page)).headers[0].sort).toBe('descending');
  });

  test('the table is readable with scripts disabled', async ({ page }) => {
    await page.route('**/html.style.components*.js', (route) => route.abort());
    await page.goto('/examples.html');

    const rows = page.locator(`${demo} tbody tr`);
    await expect(rows).toHaveCount(4);
    await expect(rows.first()).toBeVisible();
    await expect(header(page, 1)).toBeVisible();

    // "And no sort affordance suggests an interaction that cannot happen" — the
    // control exists only because the script created it.
    await expect(page.locator(`${demo} button[data-hs-sort]`)).toHaveCount(0);
    const sorted = await page
      .locator(`${demo} thead th`)
      .evaluateAll((ths) => ths.map((th) => th.getAttribute('aria-sort')));
    expect(sorted).toEqual([null, null, null, null]);

    // Still styled: the table is an atom, not something this element supplies.
    const padded = await header(page, 1).evaluate((th) => getComputedStyle(th).padding);
    expect(Number.parseFloat(padded)).toBeGreaterThan(0);
  });

  test('a column without data-sort gets no control', async ({ page }) => {
    const { headers } = await state(page);
    const actions = headers.at(-1);

    expect(actions.text).toContain('Actions');
    expect(actions.control).toBe(false);
    expect(actions.sort).toBeNull();
  });

  test('the header content is moved, not duplicated', async ({ page }) => {
    // A second control repeating the header is what #33 rules out, so the label
    // must appear exactly once in the cell.
    const occurrences = await header(page, 1).evaluate((th) => ({
      cellText: th.textContent.trim(),
      buttonText: th.querySelector('button[data-hs-sort]').textContent.trim(),
      elementChildren: th.children.length,
    }));

    expect(occurrences.cellText).toBe('Name');
    expect(occurrences.buttonText).toBe('Name');
    expect(occurrences.elementChildren).toBe(1);
  });

  test('a numeric column sorts by value, not by collation', async ({ page }) => {
    await control(page, 2).click();
    const ascending = await state(page);

    // 9 before 41 before 128 — collation alone would put 128 first.
    expect(ascending.sizes.slice(0, 3)).toEqual(['9', '41', '128']);
  });

  test('values a numeric column cannot parse sort last in both directions', async ({ page }) => {
    await control(page, 2).click();
    expect((await state(page)).sizes.at(-1)).toBe('—');

    await control(page, 2).click();
    // Reversing must not float the unparseable value to the top.
    expect((await state(page)).sizes.at(-1)).toBe('—');
  });

  test('data-sort-value supplies the key instead of the cell text', async ({ page }) => {
    // The dates read "12 September 2026" and sort on their ISO attribute.
    await control(page, 3).click();

    const dates = await page
      .locator(`${demo} tbody tr`)
      .evaluateAll((rows) => rows.map((row) => row.cells[2].dataset.sortValue));
    expect(dates).toEqual([...dates].sort());
  });

  test('sorting moves rows rather than recreating them', async ({ page }) => {
    // Rows carry the consumer's own listeners and state; recreating them would
    // silently drop both.
    const survived = await page.locator(`${demo} hs-sortable`).evaluate(async (el) => {
      const first = el.querySelector('tbody tr');
      first.dataset.marked = 'yes';
      const button = first.querySelector('button');
      let clicks = 0;
      button.addEventListener('click', () => (clicks += 1));

      el.sort(el.querySelector('thead th'), 'descending');

      const moved = el.querySelector('tbody tr[data-marked="yes"]');
      moved.querySelector('button').click();
      return { stillThere: !!moved, sameNode: moved === first, clicks };
    });

    expect(survived.stillThere).toBe(true);
    expect(survived.sameNode).toBe(true);
    expect(survived.clicks).toBe(1);
  });

  test('it fires hs-sort with the column and direction', async ({ page }) => {
    const detail = page.evaluate(
      () =>
        new Promise((resolve) => {
          document
            .querySelector('#sortable-demo')
            .addEventListener('hs-sort', (event) => resolve({ ...event.detail, header: undefined }), {
              once: true,
            });
        })
    );

    await control(page, 2).click();
    expect(await detail).toEqual({ column: 1, direction: 'ascending', header: undefined });
  });

  test('no accessibility violations, unsorted or sorted', async ({ page }) => {
    const unsorted = await new AxeBuilder({ page }).include(demo).analyze();
    expect(unsorted.violations).toEqual([]);

    await control(page, 1).click();

    const sorted = await new AxeBuilder({ page }).include(demo).analyze();
    expect(sorted.violations).toEqual([]);
  });
});
