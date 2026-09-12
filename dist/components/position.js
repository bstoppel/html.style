/**
 * Anchor positioning for floating components.
 *
 * `<hs-menu>` and `<hs-tooltip>` both need a box placed against a trigger and
 * moved when it would leave the viewport. CSS Anchor Positioning is the
 * platform answer to that, and it is not available at this project's browser
 * floor — see docs/positioning.md for the decision and the compatibility data.
 *
 * So there are two paths, and this is the only file that knows about either:
 *
 *   declarative   `position-area` does the work, flip included. Taken wherever
 *                 the browser has anchor positioning.
 *   script        the box is placed from measurements published as custom
 *                 properties. Taken at the floor.
 *
 * The script path is not a polyfill and not a reimplementation. It supplies
 * values the platform does not yet compute here, and the whole file deletes the
 * day the floor passes anchor positioning — one deletion rather than one per
 * component.
 *
 * ## Using it
 *
 *     import { anchorStyles, tether } from './position.js';
 *
 *     static styles = [anchorStyles, css`...`];
 *
 *     #detach = null;
 *
 *     #open() {
 *       this.#panel.showPopover();
 *       this.#detach = tether(this.#panel, this.#button);
 *     }
 *
 *     #close() {
 *       this.#detach?.();
 *       this.#detach = null;
 *       this.#panel.hidePopover();
 *     }
 *
 * Show the floating element before tethering it. A `display: none` box has no
 * dimensions to measure, so there is nothing to place.
 *
 * The floating element is expected to be a popover: the top layer and light
 * dismiss come from the platform, and reimplementing either would break the
 * rule in CONTRIBUTING. What the platform does not give us is the position.
 *
 * ## Contract
 *
 * Set by both paths:
 *
 *   data-hs-anchored    'declarative' | 'script'
 *
 * Set by the script path only, which is why the fallback rules key off them:
 *
 *   data-hs-placement   'block-end' | 'block-start'   the side actually used
 *   data-hs-align       'start' | 'end'               the alignment actually used
 *   --hs-anchor-after   inset-block-start value that sits after the anchor
 *   --hs-anchor-before  inset-block-end value that sits before it
 *   --hs-anchor-start   inset-inline-start value that lines up the start edges
 *   --hs-anchor-end     inset-inline-end value that lines up the end edges
 *   --hs-anchor-center  the anchor's midpoint, for align: 'center'
 *
 * Components and consumers set `--hs-anchor-gap` to change the distance from
 * the anchor. It is a token like every other setting, so it themes and scales
 * with the rest.
 *
 * The declarative path deliberately does not set `data-hs-placement`: anchor
 * positioning exposes no way to read back which `position-try-fallbacks` tactic
 * won, so reporting the *preferred* side there would be wrong half the time.
 * Absent beats wrong. Nothing that has to survive a flip — a tooltip arrow,
 * say — can be styled from that attribute.
 *
 * ## Limit
 *
 * The script path assumes a horizontal writing mode. It reads `direction`, so
 * RTL is placed correctly, but a vertical writing mode gets the block axis
 * wrong. The declarative path handles every writing mode, and it is the path
 * every browser takes once the floor moves.
 *
 * The two paths agree to the sub-pixel for any anchor that is itself on screen.
 * For one hanging off the viewport edge they clamp differently — the
 * declarative path against its containing block, this one against the viewport
 * — and neither answer is more right than the other, because a box centred on
 * a point nobody can see has no correct position.
 */

/**
 * Whether the platform can place the box itself.
 *
 * The test is `position-anchor` rather than `anchor-name` because that is the
 * property this module relies on. Chrome 125-150, Firefox 147-150 and Safari 26
 * are recorded as partial: the only gap is the property's INITIAL value, and
 * both paths here always set it explicitly, so those versions place correctly.
 */
export const hasAnchorPositioning = CSS.supports('position-anchor: --hs');

/**
 * The `position-area` for each placement and alignment. `span-inline-end` reads
 * oddly until you say it out loud: the box starts at the anchor's inline-start
 * edge and runs the other way, which is what lining up their start edges means.
 *
 * Centring is `span-all`, not `center`. A position-area cell is also the box's
 * containing block, so `center` would cap the box at the ANCHOR's width — a
 * tooltip on an 80px button wrapping into a column four lines tall. `span-all`
 * gives it the whole inline axis and still centres it on the anchor, which is
 * what the script path does by measuring.
 */
const AREA = {
  'block-end start': 'block-end span-inline-end',
  'block-end end': 'block-end span-inline-start',
  'block-end center': 'block-end span-all',
  'block-start start': 'block-start span-inline-end',
  'block-start end': 'block-start span-inline-start',
  'block-start center': 'block-start span-all',
};

const OPPOSITE = {
  'block-end': 'block-start',
  'block-start': 'block-end',
  start: 'end',
  end: 'start',
};

/**
 * Styles for both paths. A component adds this to its own `static styles`; it
 * has to live in the same shadow root as the floating element, because outside
 * CSS cannot reach in.
 *
 * A native `CSSStyleSheet` rather than Lit's `css` tag, so this module imports
 * nothing. That keeps it loadable straight from `dist/components/`, which the
 * Lit-importing component modules are not.
 */
export const anchorStyles = new CSSStyleSheet();

anchorStyles.replaceSync(`
  [data-hs-anchored] {
    position: fixed;
    /* A popover's UA styles centre it with inset: 0 and margin: auto. Clear
       both, then let the rules below set one inset per axis. */
    inset: auto;
    /* The gap is a block-axis margin and never a uniform one: an inline margin
       would push the box off the very edge it is being lined up with. */
    margin-block: var(--hs-anchor-gap, var(--space-component, 0.5rem));
    margin-inline: 0;
  }

  @supports (position-anchor: --hs) {
    [data-hs-anchored='declarative'] {
      position-anchor: var(--hs-anchor-name);
      position-area: var(--hs-anchor-area);
      position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    }
  }

  [data-hs-placement='block-end'] {
    inset-block-start: var(--hs-anchor-after);
  }

  [data-hs-placement='block-start'] {
    inset-block-end: var(--hs-anchor-before);
  }

  [data-hs-align='start'] {
    inset-inline-start: var(--hs-anchor-start);
  }

  [data-hs-align='end'] {
    inset-inline-end: var(--hs-anchor-end);
  }

  /* Centring is the one case that writes a PHYSICAL inset, and the one that
     moves the box with translate rather than an inset. Physical because
     centring has no handedness — the box sits on the anchor's midpoint in
     either direction, so there is nothing for a logical property to get right.
     Translate because a percentage there resolves against the element's OWN
     size: the box goes to the midpoint and then back by half itself, without
     its layout position changing and without the width feeding back into it. */
  [data-hs-align='center'] {
    left: 0;
    translate: calc(var(--hs-anchor-center) - 50%);
  }
`);

/**
 * Put the anchor stylesheet on a root that needs it.
 *
 * A shadow component adds `anchorStyles` to its own `static styles`. A light-DOM
 * one cannot: its floating element sits in the consumer's document, and that is
 * the root the rules have to reach. Additive and idempotent, and every rule in
 * the sheet is scoped to `[data-hs-anchored]`, which nothing but this module
 * ever sets.
 *
 * @param {Document|ShadowRoot} root - Usually `element.getRootNode()`.
 */
export function adoptAnchorStyles(root) {
  if (root.adoptedStyleSheets.includes(anchorStyles)) return;
  root.adoptedStyleSheets = [...root.adoptedStyleSheets, anchorStyles];
}

/** Anchor names are idents and every pairing needs its own, so they are generated. */
let names = 0;

/**
 * Place `floating` against `anchor`, and keep it placed.
 *
 * @param {HTMLElement} floating - The box being placed. Usually a popover.
 * @param {HTMLElement} anchor - What it is placed against.
 * @param {object} [options]
 * @param {'block-end'|'block-start'} [options.placement] - Preferred side.
 *   Flips to the other one when the box would not fit.
 * @param {'start'|'end'|'center'} [options.align] - Preferred inline alignment.
 *   `start` and `end` flip the same way; `center` shifts back into view
 *   instead, having no opposite to flip to.
 * @param {'auto'|'declarative'|'script'} [options.strategy] - Which path to
 *   take. `auto` uses the declarative one wherever the browser has it. Naming
 *   a path is how the fallback stays testable on a browser that would
 *   otherwise skip it.
 * @returns {() => void} Undoes everything this set. Call it on close.
 */
export function tether(floating, anchor, options = {}) {
  const { placement = 'block-end', align = 'start', strategy = 'auto' } = options;
  const declarative = strategy === 'auto' ? hasAnchorPositioning : strategy === 'declarative';

  return declarative
    ? tetherDeclarative(floating, anchor, placement, align)
    : tetherScript(floating, anchor, placement, align);
}

function tetherDeclarative(floating, anchor, placement, align) {
  const name = `--hs-anchor-${++names}`;
  anchor.style.setProperty('anchor-name', name);
  floating.style.setProperty('--hs-anchor-name', name);
  floating.style.setProperty('--hs-anchor-area', AREA[`${placement} ${align}`]);
  floating.dataset.hsAnchored = 'declarative';

  return () => {
    anchor.style.removeProperty('anchor-name');
    floating.style.removeProperty('--hs-anchor-name');
    floating.style.removeProperty('--hs-anchor-area');
    delete floating.dataset.hsAnchored;
  };
}

const MEASUREMENTS = [
  '--hs-anchor-after',
  '--hs-anchor-before',
  '--hs-anchor-start',
  '--hs-anchor-end',
  '--hs-anchor-center',
];

function tetherScript(floating, anchor, placement, align) {
  floating.dataset.hsAnchored = 'script';

  let frame = 0;

  /**
   * One placement per frame. Setting an inset changes how much room the box
   * has to lay out in, which can change its size, which fires the observer
   * again — a frame boundary stops that from running away.
   */
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      place(floating, anchor, placement, align);
    });
  };

  // The first placement is synchronous: the caller has just shown the popover,
  // and waiting a frame would paint it in the wrong place first.
  place(floating, anchor, placement, align);

  // Capture, because the anchor can be inside any scroll container, and the
  // popover is in the top layer where nothing scrolls it along.
  const listening = { capture: true, passive: true };
  document.addEventListener('scroll', schedule, listening);
  window.addEventListener('resize', schedule, listening);

  // Either box changing size can change which side fits.
  const resizes = new ResizeObserver(schedule);
  resizes.observe(floating);
  resizes.observe(anchor);

  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener('scroll', schedule, listening);
    window.removeEventListener('resize', schedule, listening);
    resizes.disconnect();

    for (const property of MEASUREMENTS) floating.style.removeProperty(property);
    delete floating.dataset.hsAnchored;
    delete floating.dataset.hsPlacement;
    delete floating.dataset.hsAlign;
  };
}

function place(floating, anchor, placement, align) {
  const box = anchor.getBoundingClientRect();

  // A hidden or detached anchor has no box. Leave the last placement alone
  // rather than throwing the floating element into the corner of the screen.
  if (box.width === 0 && box.height === 0) return;

  const view = document.documentElement;
  // The inset properties below resolve against the FLOATING element's own
  // direction, so that is the one to ask.
  const rtl = getComputedStyle(floating).direction === 'rtl';

  floating.style.setProperty('--hs-anchor-after', `${box.bottom}px`);
  floating.style.setProperty('--hs-anchor-before', `${view.clientHeight - box.top}px`);
  floating.style.setProperty('--hs-anchor-start', `${rtl ? view.clientWidth - box.right : box.left}px`);
  floating.style.setProperty('--hs-anchor-end', `${rtl ? box.left : view.clientWidth - box.right}px`);

  // Block axis first: the alignment is chosen against whichever side won.
  floating.dataset.hsPlacement = fits(floating, 'hsPlacement', placement, 'block');

  if (align === 'center') {
    floating.dataset.hsAlign = 'center';
    centreOn(floating, box, view);
    return;
  }

  floating.dataset.hsAlign = fits(floating, 'hsAlign', align, 'inline');
}

/**
 * Put the box's midpoint on the anchor's, then pull it back inside the viewport
 * if it hangs off an edge.
 *
 * Centring has no opposite to flip to, so it shifts instead — which is the
 * tactic the declarative path uses for the same case. Shifting is safe to do
 * from a measurement because the box moves by translate, so its width cannot
 * change underneath the calculation the way an inset-driven one would.
 */
function centreOn(floating, anchor, view) {
  let midpoint = (anchor.left + anchor.right) / 2;
  floating.style.setProperty('--hs-anchor-center', `${midpoint}px`);

  const box = floating.getBoundingClientRect();
  const past = box.right - view.clientWidth;
  const short = -box.left;

  if (past > 0) midpoint -= past;
  else if (short > 0) midpoint += short;
  else return;

  floating.style.setProperty('--hs-anchor-center', `${midpoint}px`);
}

/**
 * Try the preferred value, then flip only if the opposite leaves less of the
 * box off screen. Measuring beats predicting — the box is already laid out, so
 * its real size is there to read, and a flip that fixes nothing is not a fix.
 *
 * Trying means setting the attribute, so the caller assigns the return value
 * back to it: the last thing tried is not always the one that won.
 */
function fits(floating, attribute, preferred, axis) {
  floating.dataset[attribute] = preferred;
  const overflowing = overflow(floating, axis);
  if (overflowing === 0) return preferred;

  const opposite = OPPOSITE[preferred];
  floating.dataset[attribute] = opposite;
  return overflow(floating, axis) < overflowing ? opposite : preferred;
}

/**
 * How much of the box falls outside the viewport on one axis, counting both
 * ends. Zero means it fits. Block is the vertical axis here — see the
 * writing-mode limit at the top of the file.
 */
function overflow(floating, axis) {
  const box = floating.getBoundingClientRect();
  const view = document.documentElement;
  const [start, end, size] =
    axis === 'block'
      ? [box.top, box.bottom, view.clientHeight]
      : [box.left, box.right, view.clientWidth];

  return Math.max(0, -start) + Math.max(0, end - size);
}
