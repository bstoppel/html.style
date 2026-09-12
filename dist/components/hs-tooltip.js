/**
 * <hs-tooltip> — light DOM.
 *
 * The platform has `title`, and it is unusable: no touch support, no styling, a
 * delay nobody can predict or configure, and screen reader treatment that
 * differs by engine. Nothing else in the platform describes a control on hover
 * and on focus.
 *
 *   <button id="delete">Delete</button>
 *   <hs-tooltip for="delete">Removes the file permanently</hs-tooltip>
 *
 * ## Why light DOM is mandatory here
 *
 * `aria-describedby` is an IDREF, and an IDREF cannot cross a shadow boundary.
 * That is the same fact that forces `<hs-combobox>` to render its options INSIDE
 * its shadow root, and here it points the other way: the trigger is the
 * consumer's own element, out in the light DOM, so the bubble describing it has
 * to be out there with it.
 *
 * The element IS the bubble. It becomes a popover on upgrade, so the top layer
 * comes from the platform.
 *
 * ## Why the popover is manual
 *
 * `popover="auto"` would bring light dismiss, but an auto popover also closes
 * every other auto popover that is not its ancestor — so a tooltip appearing
 * would close an open `<hs-menu>`. `popover="hint"` exists for exactly this and
 * is too new for the supported floor; worse, an unsupported value falls back to
 * `manual`, which would mean light dismiss in some supported browsers and not
 * others. `manual` is the one behaviour that is the same everywhere, and a
 * tooltip does not want light dismiss anyway: it hides on mouseleave and blur.
 *
 * Escape is handled here because the tooltip pattern asks for it, not as a
 * stand-in for the dismissal the platform would do.
 */

import { adoptAnchorStyles, tether } from './position.js';

/** Ids are generated so `aria-describedby` has something to point at. */
let ids = 0;

/**
 * @element hs-tooltip
 *
 * @attr {string} for - Id of the element this describes. Required: without a
 *   trigger there is nothing to attach to and the tooltip stays hidden.
 * @attr {'block-end'|'block-start'} placement - Preferred side. Defaults to
 *   `block-end`, and flips when there is no room.
 *
 * @slot - The description. Text, never interactive content — the bubble does
 *   not take the pointer and has no tab stop.
 *
 * @fires hs-open - Fired after the tooltip appears.
 * @fires hs-close - Fired after it hides.
 *
 * @cssprop [--hs-tooltip-background] - Bubble background.
 * @cssprop [--hs-tooltip-color] - Bubble text colour.
 * @cssprop [--hs-tooltip-max-inline-size] - Widest the bubble may be.
 * @cssprop [--hs-tooltip-padding-block] - Vertical padding in the bubble.
 * @cssprop [--hs-tooltip-padding-inline] - Horizontal padding in it.
 * @cssprop [--hs-tooltip-radius] - Corner radius.
 * @cssprop [--hs-tooltip-font-size] - Bubble text size.
 * @cssprop [--hs-anchor-gap] - Distance from the trigger. Read by position.js.
 */
export class HsTooltip extends HTMLElement {
  static observedAttributes = ['for'];

  #trigger = null;
  #detach = null;

  connectedCallback() {
    // The rules that position it live in position.js, and this element's root
    // is the consumer's document rather than a shadow root of our own.
    adoptAnchorStyles(this.getRootNode());

    this.popover = 'manual';
    if (!this.hasAttribute('role')) this.setAttribute('role', 'tooltip');
    if (!this.id) this.id = `hs-tooltip-${++ids}`;

    this.addEventListener('toggle', this.#onToggle);
    this.#attach();
  }

  disconnectedCallback() {
    this.#release();
    this.removeEventListener('toggle', this.#onToggle);
    // Scroll and resize listeners outlive the element otherwise.
    this.#detach?.();
    this.#detach = null;
  }

  attributeChangedCallback(name, previous, current) {
    if (!this.isConnected || previous === current) return;
    this.#release();
    this.#attach();
  }

  /** The element this describes, or null while `for` names nothing. */
  get trigger() {
    return this.#trigger;
  }

  #attach() {
    const id = this.getAttribute('for');
    // A shadow root has getElementById too, so a tooltip inside one finds its
    // trigger in the same tree rather than reaching for the document.
    this.#trigger = id ? (this.getRootNode().getElementById?.(id) ?? null) : null;
    if (!this.#trigger) return;

    this.#describe(this.#trigger);
    this.#trigger.addEventListener('mouseenter', this.show);
    this.#trigger.addEventListener('mouseleave', this.hide);
    this.#trigger.addEventListener('focus', this.show);
    this.#trigger.addEventListener('blur', this.hide);
    this.#trigger.addEventListener('keydown', this.#onKeydown);
  }

  #release() {
    if (!this.#trigger) return;

    this.#undescribe(this.#trigger);
    this.#trigger.removeEventListener('mouseenter', this.show);
    this.#trigger.removeEventListener('mouseleave', this.hide);
    this.#trigger.removeEventListener('focus', this.show);
    this.#trigger.removeEventListener('blur', this.hide);
    this.#trigger.removeEventListener('keydown', this.#onKeydown);
    this.#trigger = null;
  }

  /** Add to `aria-describedby` rather than replacing it: a control can have more
   *  than one description, and `<hs-field>` already writes one. */
  #describe(trigger) {
    const described = (trigger.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    if (described.includes(this.id)) return;
    trigger.setAttribute('aria-describedby', [...described, this.id].join(' '));
  }

  #undescribe(trigger) {
    const described = (trigger.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((token) => token && token !== this.id);

    if (described.length > 0) trigger.setAttribute('aria-describedby', described.join(' '));
    else trigger.removeAttribute('aria-describedby');
  }

  /** Show it. An arrow field, so it doubles as the listener. Safe to call when
   *  it is already showing. */
  show = () => {
    if (this.#trigger && !this.matches(':popover-open')) this.showPopover();
  };

  /** Hide it. Safe to call when it is already hidden. */
  hide = () => {
    if (this.matches(':popover-open')) this.hidePopover();
  };

  #onKeydown = (event) => {
    if (event.key !== 'Escape' || !this.matches(':popover-open')) return;

    // Would otherwise close a surrounding <dialog> in the same keystroke.
    // Escape dismisses one layer at a time, and the tooltip is the top one.
    event.preventDefault();
    this.hide();
    // Focus is not touched: it is on the trigger, and that is where it belongs.
  };

  #onToggle = (event) => {
    if (event.newState === 'open') {
      this.#detach = tether(this, this.#trigger, {
        placement: this.getAttribute('placement') === 'block-start' ? 'block-start' : 'block-end',
        align: 'center',
      });
      this.dispatchEvent(new Event('hs-open', { bubbles: true }));
      return;
    }

    this.#detach?.();
    this.#detach = null;
    this.dispatchEvent(new Event('hs-close', { bubbles: true }));
  };
}

customElements.define('hs-tooltip', HsTooltip);
