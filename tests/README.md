# html.style Tests

Comprehensive test suite for html.style framework using Playwright.

## Setup

Install dependencies:
```bash
npm install
```

Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

**Run all tests:**
```bash
npm test
```

**Run specific test suites:**
```bash
npm run test:visual        # Visual regression tests
npm run test:a11y          # Accessibility tests
npm run test:performance   # Performance tests
npm run test:components    # Web component tests
```

**Debug tests:**
```bash
npm run test:debug         # Debug mode with inspector
npm run test:headed        # See browser while testing
npm run test:ui            # Interactive UI mode
```

**Update visual snapshots:**
```bash
npm run test:update-snapshots
```

## Test Structure

```
tests/
├── visual/
│   └── components.spec.js      # Visual regression tests
├── a11y/
│   └── accessibility.spec.js   # Accessibility tests (axe-core)
├── components/
│   └── components.spec.js      # Web component behaviour and a11y
└── performance/
    └── web-vitals.spec.js      # Core Web Vitals tests
```

## What's Tested

### Visual Regression
- Component rendering in light/dark modes
- Button variants
- Form elements
- Cards and layouts
- Alert messages
- Container query responsiveness

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Focus indicators
- Skip links
- Color contrast (4.5:1 minimum)
- Semantic HTML validation
- Screen reader compatibility

### Components
- Light-DOM components styled before their JavaScript defines them
- Dismiss behaviour, cancelable events, and role handling
- Shadow-DOM state reflected to assistive technology via ElementInternals
- Keyboard operation, focus order, and the disabled state
- Form participation, reset, and `::part()` exposure
- axe scan of the component section in both colour schemes
- The custom elements manifest documents every registered element and its
  public API (parts, attributes, slots)

### Performance
- **LCP** (Largest Contentful Paint) < 2.5s
- **CLS** (Cumulative Layout Shift) < 0.1
- **INP** (Interaction to Next Paint) < 200ms
- CSS token computation efficiency
- Cascade layer ordering
- Resource loading optimization

## Cross-Browser Testing

Tests currently run on **Chromium only** (`Desktop Chrome`). That is the single project
configured in `playwright.config.js`, and CI runs the same config — so Chromium-only
applies locally and in CI alike.

To test additional engines, add projects to `playwright.config.js`:

```javascript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
]
```

Visual regression snapshots are stored per project, so adding an engine means generating
a new snapshot set for it (`npm run test:update-snapshots`) before its tests will pass.

## CI Integration

Tests are configured to run in CI environments. The playwright.config.js automatically:
- Starts a local server
- Runs tests in parallel
- Generates HTML reports
- Captures screenshots on failure

## Viewing Reports

After running tests:
```bash
npx playwright show-report
```

## Writing New Tests

Follow the existing patterns:

**Visual test example:**
```javascript
test('component renders correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.component')).toHaveScreenshot('component.png');
});
```

**Accessibility test example:**
```javascript
test('page has no violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

**Performance test example:**
```javascript
test('metric is under threshold', async ({ page }) => {
  await page.goto('/');
  const metric = await page.evaluate(() => {
    // Measure something
    return performance.now();
  });
  expect(metric).toBeLessThan(100);
});
```

## Best Practices

1. Keep tests focused and atomic
2. Use descriptive test names
3. Clean up after tests (if needed)
4. Avoid hardcoded waits (use Playwright's auto-waiting)
5. Update snapshots only when intentional changes are made
6. Run full test suite before committing

## Troubleshooting

**Snapshots don't match:**
- Check if changes are intentional
- Update snapshots: `npm run test:update-snapshots`
- Review diff images in `test-results/`

**Tests timeout:**
- Check if local server is running
- Increase timeout in playwright.config.js
- Use `test.slow()` for known slow tests

**Accessibility violations:**
- Review axe-core report details
- Fix HTML/CSS issues
- Ensure proper ARIA usage
