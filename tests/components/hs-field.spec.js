import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const firstField = '#field-demo hs-field:first-of-type';

test.describe('hs-field', () => {
  test('associates a native label with the control', async ({ page }) => {
    await page.goto('/examples.html');
    const wiring = await page.locator(firstField).evaluate((el) => {
      const label = el.querySelector('label');
      const input = el.querySelector('input');
      return {
        shadow: !!el.shadowRoot,
        labelFor: label.getAttribute('for'),
        inputId: input.id,
        // A real <label for>, not aria-label — so clicking the label focuses
        // the control, which is platform behaviour we get for free.
        usesAriaLabelInstead: input.hasAttribute('aria-label'),
      };
    });

    expect(wiring.shadow).toBe(false);
    expect(wiring.labelFor).toBe(wiring.inputId);
    expect(wiring.usesAriaLabelInstead).toBe(false);
  });

  test('clicking the label focuses the control', async ({ page }) => {
    await page.goto('/examples.html');
    await page.locator(`${firstField} label`).click();
    const focused = await page.evaluate(() => document.activeElement?.name);
    expect(focused).toBe('email');
  });

  test('points aria-describedby at the hint', async ({ page }) => {
    await page.goto('/examples.html');
    const resolves = await page.locator(firstField).evaluate((el) => {
      const input = el.querySelector('input');
      const ids = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
      return ids.length > 0 && ids.every((id) => !!el.querySelector(`#${id}`));
    });
    expect(resolves).toBe(true);
  });

  test('shows the browser own validation message, not a hand-written one', async ({ page }) => {
    await page.goto('/examples.html');

    // The point of building on the Constraint Validation API: the text is
    // already localised and already matches what the platform would say.
    const result = await page.evaluate(async () => {
      const field = document.querySelector('#field-demo hs-field');
      const input = field.querySelector('input');
      input.value = 'not-an-email';
      input.checkValidity();
      await new Promise((r) => setTimeout(r, 50));
      const error = field.querySelector('[data-hs-error]');
      return {
        shown: error.textContent,
        native: input.validationMessage,
        hidden: error.hidden,
      };
    });

    expect(result.hidden).toBe(false);
    expect(result.shown).toBe(result.native);
    expect(result.shown.length).toBeGreaterThan(0);
  });

  test('marks the control invalid and describes the error', async ({ page }) => {
    await page.goto('/examples.html');
    const state = await page.evaluate(async () => {
      const field = document.querySelector('#field-demo hs-field');
      const input = field.querySelector('input');
      input.value = 'nope';
      input.checkValidity();
      await new Promise((r) => setTimeout(r, 50));
      const errorId = field.querySelector('[data-hs-error]').id;
      return {
        invalid: input.getAttribute('aria-invalid'),
        describes: (input.getAttribute('aria-describedby') ?? '').split(/\s+/).includes(errorId),
        liveRegion: field.querySelector('[data-hs-error]').getAttribute('role'),
      };
    });

    expect(state.invalid).toBe('true');
    expect(state.describes).toBe(true);
    // Announced when it appears rather than only found on revisit.
    expect(state.liveRegion).toBe('alert');
  });

  test(':user-invalid flags the border on real interaction', async ({ page }) => {
    await page.goto('/examples.html');
    const input = page.locator(firstField).locator('input');

    const before = await input.evaluate((el) => getComputedStyle(el).borderColor);
    await input.fill('not-an-email');
    await input.blur();
    // The border transitions (ADR-0009's --motion-duration pattern applies
    // here too), so it is not readable synchronously - same reason the
    // design-system token test waits.
    await page.waitForTimeout(350);
    const after = await input.evaluate((el) => ({
      matchesUserInvalid: el.matches(':user-invalid'),
      borderColor: getComputedStyle(el).borderColor,
    }));

    expect(after.matchesUserInvalid).toBe(true);
    expect(after.borderColor).not.toBe(before);
  });

  test('novalidate also suppresses the native :user-invalid border', async ({ page }) => {
    await page.goto('/examples.html');
    const field = page.locator(firstField);
    const input = field.locator('input');

    await field.evaluate((el) => el.setAttribute('novalidate', ''));
    const before = await input.evaluate((el) => getComputedStyle(el).borderColor);
    await input.fill('not-an-email');
    await input.blur();
    await page.waitForTimeout(350);
    const after = await input.evaluate((el) => ({
      // The browser's own state is unaffected by the attribute - only this
      // component's styling and reporting respect it.
      matchesUserInvalid: el.matches(':user-invalid'),
      borderColor: getComputedStyle(el).borderColor,
    }));
    await field.evaluate((el) => el.removeAttribute('novalidate'));

    expect(after.matchesUserInvalid).toBe(true);
    expect(after.borderColor).toBe(before);
  });

  test('clears the error once the value becomes valid', async ({ page }) => {
    await page.goto('/examples.html');
    const cleared = await page.evaluate(async () => {
      const field = document.querySelector('#field-demo hs-field');
      const input = field.querySelector('input');
      input.value = 'nope';
      input.checkValidity();
      await new Promise((r) => setTimeout(r, 50));

      input.value = 'someone@example.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 50));

      const error = field.querySelector('[data-hs-error]');
      return {
        hidden: error.hidden,
        invalid: input.hasAttribute('aria-invalid'),
        describedby: input.getAttribute('aria-describedby'),
      };
    });

    expect(cleared.hidden).toBe(true);
    expect(cleared.invalid).toBe(false);
    // The hint reference survives; only the error reference is withdrawn.
    expect(cleared.describedby).toContain('-hint');
    expect(cleared.describedby).not.toContain('-error');
  });

  test('leaves an author-supplied label alone', async ({ page }) => {
    await page.goto('/examples.html');
    const result = await page.evaluate(async () => {
      const field = document.createElement('hs-field');
      field.setAttribute('label', 'Generated');
      field.innerHTML = '<label>Mine</label><input name="custom">';
      document.body.append(field);
      await new Promise((r) => setTimeout(r, 50));

      const labels = [...field.querySelectorAll('label')].map((l) => l.textContent);
      const associated = field.querySelector('label').getAttribute('for') === field.querySelector('input').id;
      field.remove();
      return { labels, associated };
    });

    expect(result.labels).toEqual(['Mine']);
    // It still gets wired up — the component fills the gap without overwriting.
    expect(result.associated).toBe(true);
  });

  test('preserves aria-describedby ids the author set', async ({ page }) => {
    await page.goto('/examples.html');
    const describedby = await page.evaluate(async () => {
      const field = document.createElement('hs-field');
      field.setAttribute('label', 'Thing');
      field.setAttribute('hint', 'A hint.');
      field.innerHTML = '<input name="t" aria-describedby="external-note">';
      document.body.append(field);
      await new Promise((r) => setTimeout(r, 50));
      const value = field.querySelector('input').getAttribute('aria-describedby');
      field.remove();
      return value;
    });

    expect(describedby).toContain('external-note');
    expect(describedby).toContain('-hint');
  });

  test('the control still participates in its form', async ({ page }) => {
    await page.goto('/examples.html');
    const entries = await page.evaluate(() => {
      const form = document.querySelector('#field-demo');
      form.querySelector('input[name="email"]').value = 'a@b.co';
      form.querySelector('input[name="age"]').value = '21';
      return [...new FormData(form).entries()];
    });

    // Light DOM is not a style preference here: a control in a shadow root
    // does not participate in the surrounding form at all.
    expect(entries).toContainEqual(['email', 'a@b.co']);
    expect(entries).toContainEqual(['age', '21']);
  });

  test('novalidate suppresses reporting but not validation', async ({ page }) => {
    await page.goto('/examples.html');
    const result = await page.evaluate(async () => {
      const field = document.querySelector('#field-demo hs-field');
      field.setAttribute('novalidate', '');
      const input = field.querySelector('input');
      input.value = 'nope';
      const valid = input.checkValidity();
      await new Promise((r) => setTimeout(r, 50));
      const hidden = field.querySelector('[data-hs-error]').hidden;
      field.removeAttribute('novalidate');
      return { valid, hidden };
    });

    expect(result.valid).toBe(false);
    expect(result.hidden).toBe(true);
  });
});

test.describe('hs-copy', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('renders a real button rather than reimplementing one', async ({ page }) => {
    await page.goto('/examples.html');
    const shape = await page.locator('#copy-demo').evaluate((el) => ({
      shadow: !!el.shadowRoot,
      child: el.firstElementChild?.tagName.toLowerCase(),
      type: el.firstElementChild?.getAttribute('type'),
      label: el.firstElementChild?.textContent.trim(),
    }));

    expect(shape.shadow).toBe(false);
    expect(shape.child).toBe('button');
    expect(shape.type).toBe('button');
    expect(shape.label).toBe('Copy install command');
  });

  test('copies the referenced element text', async ({ page }) => {
    await page.goto('/examples.html');
    await page.locator('#copy-demo button').click();

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard.trim()).toBe('npm install html.style');
  });

  test('fires hs-copy with the copied text', async ({ page }) => {
    await page.goto('/examples.html');
    const detail = await page.evaluate(() => {
      const el = document.querySelector('#copy-demo');
      return new Promise((resolve) => {
        el.addEventListener('hs-copy', (e) => resolve(e.detail), { once: true });
        el.querySelector('button').click();
        setTimeout(() => resolve(null), 1000);
      });
    });
    expect(detail.text.trim()).toBe('npm install html.style');
  });

  test('announces the confirmation without renaming the button', async ({ page }) => {
    await page.goto('/examples.html');
    const before = await page.locator('#copy-demo button').textContent();
    await page.locator('#copy-demo button').click();

    const after = await page.locator('#copy-demo').evaluate((el) => ({
      buttonText: el.querySelector('button').textContent,
      status: el.querySelector('[role="status"]').textContent,
      marked: el.hasAttribute('data-copied'),
    }));

    // Renaming a control mid-interaction loses voice-control users their
    // target, so confirmation goes to a live region instead.
    expect(after.buttonText).toBe(before);
    expect(after.status).toBe('Copied');
    expect(after.marked).toBe(true);
  });

  test('falls back to the value attribute when there is no target', async ({ page }) => {
    await page.goto('/examples.html');
    const text = await page.evaluate(async () => {
      const el = document.createElement('hs-copy');
      el.setAttribute('value', 'literal text');
      el.textContent = 'Copy';
      document.body.append(el);
      await new Promise((r) => setTimeout(r, 50));
      const result = el.text;
      el.remove();
      return result;
    });
    expect(text).toBe('literal text');
  });
});

test.describe('Field and copy accessibility', () => {
  for (const scheme of ['light', 'dark']) {
    test(`no violations in ${scheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/examples.html');
      const results = await new AxeBuilder({ page }).include('#custom-elements').analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
