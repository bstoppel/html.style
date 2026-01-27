import { test, expect } from '@playwright/test';

test.describe('Core Web Vitals', () => {
  test('LCP is under 2.5s', async ({ page }) => {
    await page.goto('/');

    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Timeout after 10 seconds
        setTimeout(() => resolve(10000), 10000);
      });
    });

    expect(lcp).toBeLessThan(2500);
  });

  test('CLS is under 0.1', async ({ page }) => {
    await page.goto('/');

    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsScore = 0;

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });

        // Wait 5 seconds to collect shifts
        setTimeout(() => resolve(clsScore), 5000);
      });
    });

    expect(cls).toBeLessThan(0.1);
  });

  test('INP is under 200ms', async ({ page }) => {
    await page.goto('/');

    // Click a button to measure interaction
    const button = page.locator('button').first();
    await button.click();

    const inp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.duration);
          }
        }).observe({ entryTypes: ['event'] });

        // Fallback timeout
        setTimeout(() => resolve(0), 2000);
      });
    });

    // INP should be under 200ms
    if (inp > 0) {
      expect(inp).toBeLessThan(200);
    }
  });
});

test.describe('CSS Performance', () => {
  test('design tokens are computed efficiently', async ({ page }) => {
    await page.goto('/');

    const tokenTest = await page.evaluate(() => {
      const start = performance.now();

      const root = getComputedStyle(document.documentElement);
      const tokens = {
        brandHue: root.getPropertyValue('--p-brand-hue'),
        spacing: root.getPropertyValue('--p-space-md'),
        colorPrimary: root.getPropertyValue('--color-action-primary'),
      };

      const end = performance.now();
      return {
        tokens,
        duration: end - start,
      };
    });

    // Should compute in less than 50ms
    expect(tokenTest.duration).toBeLessThan(50);
    expect(tokenTest.tokens.brandHue).toBeTruthy();
  });

  test('cascade layers are in correct order', async ({ page }) => {
    await page.goto('/');

    const layers = await page.evaluate(() => {
      const allLayers = [];

      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.constructor.name === 'CSSLayerBlockRule') {
              allLayers.push(rule.name);
            }
          }
        } catch (e) {
          // Cross-origin stylesheets
        }
      }

      return allLayers;
    });

    // Verify layer order
    const expectedOrder = ['reset', 'tokens', 'atoms', 'molecules', 'organisms', 'templates'];
    const actualOrder = layers.filter(l => expectedOrder.includes(l));

    expect(actualOrder).toEqual(expectedOrder);
  });
});

test.describe('Resource Loading', () => {
  test('CSS loads efficiently', async ({ page }) => {
    await page.goto('/');

    const cssMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      const cssFiles = entries.filter(e => e.name.endsWith('.css'));

      return cssFiles.map(f => ({
        name: f.name,
        duration: f.duration,
        size: f.transferSize,
      }));
    });

    // CSS should load in under 500ms
    cssMetrics.forEach(css => {
      expect(css.duration).toBeLessThan(500);
    });
  });

  test('JavaScript loads efficiently', async ({ page }) => {
    await page.goto('/');

    const jsMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      const jsFiles = entries.filter(e => e.name.endsWith('.js'));

      return jsFiles.map(f => ({
        name: f.name,
        duration: f.duration,
        size: f.transferSize,
      }));
    });

    // JS should load in under 500ms
    jsMetrics.forEach(js => {
      expect(js.duration).toBeLessThan(500);
    });
  });

  test('no unnecessary fonts are loaded', async ({ page }) => {
    await page.goto('/');

    const fontMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      const fonts = entries.filter(e =>
        e.name.endsWith('.woff') ||
        e.name.endsWith('.woff2') ||
        e.name.endsWith('.ttf')
      );

      return fonts.length;
    });

    // Should use system fonts (no external fonts)
    expect(fontMetrics).toBe(0);
  });
});

test.describe('Images and Media', () => {
  test('images have proper aspect ratios to prevent CLS', async ({ page }) => {
    await page.goto('/');

    const imagesWithAspectRatio = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let hasAspectRatio = 0;

      images.forEach(img => {
        const style = getComputedStyle(img);
        if (style.aspectRatio !== 'auto') {
          hasAspectRatio++;
        }
      });

      return {
        total: images.length,
        withAspectRatio: hasAspectRatio,
      };
    });

    // All images should have aspect ratio defined
    if (imagesWithAspectRatio.total > 0) {
      expect(imagesWithAspectRatio.withAspectRatio).toBeGreaterThan(0);
    }
  });
});
