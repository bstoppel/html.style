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

/**
 * The neutral ramp carries a trace of the brand hue, which is what stops a
 * surface reading as a slab of grey next to a coloured button.
 *
 * The visual snapshots do not cover this: a palette shift this subtle falls
 * under Playwright's per-pixel threshold and the screenshots pass unchanged.
 * Asserting the channels directly is what catches it.
 */
test.describe('surface tint', () => {
  /** Resolve a token to its rendered channels. */
  const channels = (page, token) =>
    page.evaluate((name) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${name})`;
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();

      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b };
    }, token);

  const surfaces = [
    '--color-surface-base',
    '--color-surface-elevated',
    '--color-surface-sunken',
  ];

  for (const colorScheme of ['light', 'dark']) {
    test(`every surface carries the brand hue in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/examples.html');

      for (const token of surfaces) {
        const { r, g, b } = await channels(page, token);
        // Achromatic means all three channels are equal. Any tint at all breaks
        // that, which is a cheap and exact test for "not grey".
        expect(r === g && g === b, `${token} in ${colorScheme}`).toBe(false);
      }
    });
  }

  test('setting the chroma to zero returns a strictly grey ramp', async ({ page }) => {
    await page.goto('/examples.html');
    await page.evaluate(() =>
      document.documentElement.style.setProperty('--p-neutral-chroma', '0')
    );

    // The tint is one dial, and turning it off has to actually turn it off.
    for (const token of surfaces) {
      const { r, g, b } = await channels(page, token);
      expect(r === g && g === b, token).toBe(true);
    }
  });

  test('the tint does not cost text contrast', async ({ page }) => {
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme });
      await page.goto('/examples.html');

      const ratio = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const luminance = (css) => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = css;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b] = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map((v) => {
            const channel = v / 255;
            return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const resolve = (name) => {
          const probe = document.createElement('span');
          probe.style.color = `var(${name})`;
          document.body.append(probe);
          const value = getComputedStyle(probe).color;
          probe.remove();
          return value;
        };

        const text = luminance(resolve('--color-text-primary'));
        const surface = luminance(resolve('--color-surface-base'));
        const [high, low] = text > surface ? [text, surface] : [surface, text];
        return (high + 0.05) / (low + 0.05);
      });

      // Guards the dial being turned up far enough to matter. Body text sits
      // near 18:1 either way; AA needs 4.5:1.
      expect(ratio, colorScheme).toBeGreaterThan(7);
    }
  });
});
