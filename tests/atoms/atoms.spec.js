import { test, expect } from '@playwright/test';

/**
 * Atoms are semantic HTML styled directly, and the framework's whole claim is
 * that writing plain markup is enough. That only holds while every element the
 * reset touches gets something back.
 *
 * These assert computed style rather than the presence of a rule, because the
 * failure being guarded against is an element rendering as undifferentiated
 * text — which is what `<blockquote>` did: the reset zeroes every margin, and
 * nothing replaced it, so a quotation was indistinguishable from a paragraph.
 */

const computed = (page, selector, properties) =>
  page.evaluate(
    ({ selector, properties }) => {
      const style = getComputedStyle(document.querySelector(selector));
      return Object.fromEntries(properties.map((p) => [p, style.getPropertyValue(p)]));
    },
    { selector, properties }
  );

test.describe('atoms', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples.html');
  });

  test('a quotation does not read as body text', async ({ page }) => {
    const quote = await computed(page, 'blockquote', [
      'border-inline-start-width',
      'padding-inline-start',
      'color',
    ]);
    const paragraph = await computed(page, 'main p', ['color']);

    // The rule beside it is what says "quote"; an indent alone reads as an
    // accident of layout.
    expect(Number.parseFloat(quote['border-inline-start-width'])).toBeGreaterThan(0);
    expect(Number.parseFloat(quote['padding-inline-start'])).toBeGreaterThan(0);
    expect(quote.color).not.toBe(paragraph.color);
  });

  test('a description list distinguishes terms from descriptions', async ({ page }) => {
    const term = await computed(page, 'dt', ['font-variation-settings']);
    const description = await computed(page, 'dd', ['padding-inline-start']);

    expect(term['font-variation-settings']).toContain('wght');
    expect(Number.parseFloat(description['padding-inline-start'])).toBeGreaterThan(0);
  });

  test('a table caption is aligned with its cells, not centred', async ({ page }) => {
    const caption = await computed(page, 'caption', ['text-align', 'padding-block-end']);

    // The UA centres it, which reads as a title floating above an unrelated
    // table rather than a label belonging to it.
    expect(caption['text-align']).toBe('start');
    expect(Number.parseFloat(caption['padding-block-end'])).toBeGreaterThan(0);
  });

  test('a highlight inherits the text colour so it survives dark mode', async ({ page }) => {
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme });
      await page.goto('/examples.html');

      const mark = await computed(page, 'mark', ['color']);
      const body = await computed(page, 'body', ['color']);

      // The UA's black-on-yellow is unreadable once the surface goes dark.
      // Inheriting means a highlight can never contrast worse than the text
      // around it.
      expect(mark.color, colorScheme).toBe(body.color);
    }
  });

  test('widgets the browser draws are themed rather than rebuilt', async ({ page }) => {
    // Resolve the token through an element rather than reading the custom
    // property, which comes back as the unresolved light-dark() text while
    // accent-color comes back already resolved for the current scheme.
    const action = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--color-action-primary)';
      document.body.append(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return resolved;
    });

    for (const selector of [
      'input[type="checkbox"]',
      'input[type="radio"]',
      'input[type="range"]',
      'progress',
    ]) {
      const { 'accent-color': accent } = await computed(page, selector, ['accent-color']);
      expect(accent, selector).toBe(action);
    }
  });

  test('a range slider is not framed like a text box', async ({ page }) => {
    const range = await computed(page, 'input[type="range"]', [
      'border-top-width',
      'padding-top',
    ]);

    // The shared input rule would wrap the slider in the border and padding
    // meant for something you type into.
    expect(Number.parseFloat(range['border-top-width'])).toBe(0);
    expect(Number.parseFloat(range['padding-top'])).toBe(0);
  });

  test('meter keeps its own value-based colouring', async ({ page }) => {
    const meter = await computed(page, 'meter', ['accent-color']);

    // Deliberate: a meter's green/amber/red says whether the value is good,
    // which is information the brand colour would destroy.
    expect(meter['accent-color']).toBe('auto');
  });
});
