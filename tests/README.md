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
npm run test:atoms         # Semantic HTML styled by the atoms layer
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

Baselines are per-platform: Playwright names them `…-chromium-darwin.png` and
`…-chromium-linux.png`, and each platform only ever reads its own. CI runs on
Linux, so a macOS-only regeneration leaves CI comparing against stale images.

After an intentional visual change, regenerate **both**:

```bash
# macOS (local)
npm run test:update-snapshots
```

```bash
# Linux (CI) — run the workflow, then commit the artifact it uploads
gh workflow run visual-baselines.yml --ref <your-branch>
gh run download <run-id> -n visual-baselines
```

The workflow runs on the same Linux image CI uses and verifies `dist/` is in
sync first, so baselines cannot lock in a stale render. Dispatching it against
your branch (`--ref`) runs the workflow as defined there, which matters when the
change being baselined is on that branch.

## Documentation checks

`npm run docs:check` is not a Playwright test — it runs standalone, because the
Markdown is not served to a browser. It verifies that file trees name real
files, internal links resolve to real headings, referenced npm scripts exist,
and every element in `custom-elements.json` is documented in the README.

It runs in CI ahead of the browser tests, since it needs no browser.

## Test Structure

```
tests/
├── visual/
│   └── components.spec.js      # Visual regression tests
├── a11y/
│   └── accessibility.spec.js   # Accessibility tests (axe-core)
├── atoms/
│   └── atoms.spec.js           # Semantic HTML the atoms layer styles
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
- The accessibility tree Chrome computes for the toast live region, read through
  CDP — see [Manual checks](#manual-checks) for the part this cannot reach

### Atoms
- Elements the reset strips and the atoms layer has to give something back to,
  asserted as computed style rather than as the presence of a rule — a
  `<blockquote>` that renders exactly like a `<p>` is the failure being guarded
- Native widgets themed through `accent-color` rather than rebuilt, and `<meter>`
  deliberately keeping its own value-based colouring

### Components
- Light-DOM components styled before their JavaScript defines them
- Dismiss behaviour, cancelable events, and role handling
- Shadow-DOM state reflected to assistive technology via ElementInternals
- Keyboard operation, focus order, and the disabled state
- Form participation, reset, and `::part()` exposure
- axe scan of the component section in both colour schemes
- The custom elements manifest documents every registered element and its
  public API (parts, attributes, slots)
- Anchor positioning on both paths — the declarative one and the script
  fallback the browser floor needs, which must agree on where a box lands,
  centred alignment and its shift back into view included
- Live-region wiring, timeout pausing and stacking order for transient messages.
  Whether a screen reader actually speaks them is not automatable here and still
  needs a human with VoiceOver or NVDA

### Performance
- **LCP** (Largest Contentful Paint) < 2.5s
- **CLS** (Cumulative Layout Shift) < 0.1
- **INP** (Interaction to Next Paint) < 200ms
- CSS token computation efficiency
- Cascade layer ordering
- Resource loading optimization

## Manual checks

Some things a screen reader does cannot be observed from the page. axe checks
that the markup is well-formed, and the CDP tests in `hs-toast.spec.js` check the
accessibility tree Chrome computes from it — but neither is speech. Whether a
message is spoken at all, whether it is spoken twice, and how an assertive
message interrupts a polite one are decisions the screen reader makes, and they
differ between VoiceOver and NVDA.

The checks below exist because a design decision in this framework rests on each
one. Run them against `/examples.html` before releasing a change to the component
named. VoiceOver toggles with Cmd+F5 on macOS; NVDA starts with Ctrl+Alt+N on
Windows and quits with Insert+Q.

### hs-toast

Covers the part of [#32](https://github.com/bstoppel/html.style/issues/32) that
automation cannot.

1. Click **Show a toast** without moving focus. The message should be spoken, and
   focus should stay on the button.
2. Click **Show two, half a second apart**. Two announcements, each only its own
   message. Hearing the first message again with the second means `aria-atomic`
   is not holding, and every new toast is dragging the whole stack with it.
3. Click **Fail**. It should interrupt rather than wait its turn, and be spoken
   **once**. Twice means the `role="alert"` toast and the polite region are both
   announcing it — the risk in nesting a live region inside another one.
4. Let a toast expire untouched. Nothing should be spoken when it disappears.

Steps 2 and 3 are the ones worth the time; 1 and 4 confirm the basics.

### hs-tooltip

The component exists because `title` is announced inconsistently, so this is the
claim it has to make good on.

1. Tab to **Archive**. The button's own name should be read first, then the
   tooltip text as its description — not instead of the name.
2. Press Escape. The tooltip hides and focus stays on the button.

### hs-sortable

The header control is a real `<button>` rather than an activatable `<th>`, and
part of the argument for that was voice control and announcement.

1. Tab to the **Name** header. It should announce as a button, with the column
   name, and say the column is sortable or unsorted.
2. Activate it. The new sort direction should be announced — that is `aria-sort`
   being read.
3. With voice control on, say "click Name". A focusable `<th>` would not respond
   to this; the button should.

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
