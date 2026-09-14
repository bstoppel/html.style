/**
 * <hs-toast-region> and <hs-toast> — light DOM.
 *
 * A transient message that appears, is announced, and leaves on its own.
 * `<hs-alert>` already covers the persistent, in-flow case; this is the stacked,
 * self-dismissing one, and the platform has no equivalent to either.
 *
 *   <hs-toast-region></hs-toast-region>
 *
 *   document.querySelector('hs-toast-region').show('Draft saved');
 *
 * Toasts can also be written by hand, which is what makes the region worth
 * having as its own element rather than a script-created container:
 *
 *   <hs-toast-region>
 *     <hs-toast variant="success">Draft saved</hs-toast>
 *   </hs-toast-region>
 *
 * ## Why both are light DOM
 *
 * The region has to be: a live region announces what is inserted INTO it, so it
 * has to exist in the page before the message does, and it has to be somewhere
 * the consumer can position.
 *
 * The message could have been a shadow component, and is not. The announced
 * content is the toast's own text, and keeping it in the same tree as the region
 * that announces it removes the question of whether a screen reader walks into a
 * shadow root to read a live region's new content. It also means the global
 * stylesheet styles `<hs-toast>` directly, the same way it styles `<hs-alert>`,
 * so the two siblings look related without either importing anything.
 *
 * ## Announcement
 *
 * The region is `role="status"`, which is polite. It also sets
 * `aria-atomic="false"`, and that is not decoration: `status` implies
 * `aria-atomic="true"`, which would make every new toast re-announce the entire
 * stack. An `error` toast carries `role="alert"` itself, which raises that one
 * message to assertive without changing the region's politeness — changing
 * `aria-live` on a live region that is already live is not reliably picked up.
 *
 * Nothing here moves focus. A toast the user has to dismiss to carry on working
 * is a dialog, and this is not one.
 *
 * ## Timing
 *
 * The timeout is an attribute in milliseconds rather than a token, because it is
 * reading time, not motion. `prefers-reduced-motion` removes the animation and
 * deliberately leaves the timeout alone: a message still needs the same time to
 * read whether or not it slid in.
 *
 * Dismissal removes the element immediately, with no exit animation. An exit
 * would have to wait on `animationend`, which does not fire on a hidden page,
 * and a toast that never leaves is the failure this component exists to avoid.
 */

/** Long enough to read a short sentence. Overridable per toast. */
const DEFAULT_DURATION = 5000;

/**
 * @element hs-toast
 *
 * @attr {'success'|'warning'|'error'|'info'} variant - Feedback tone, styled by
 *   the global stylesheet. `error` also makes this toast announce assertively.
 * @attr {number} duration - Milliseconds before it dismisses itself. Defaults to
 *   5000. Zero means it stays until something dismisses it.
 *
 * @slot - The message. Keep it to text: a toast that needs a tab stop should be
 *   a dialog, since the timeout would take the control away mid-interaction.
 *
 * @fires hs-dismiss - Cancelable, fired before the toast removes itself. Call
 *   preventDefault() to keep it in place.
 *
 * @cssprop [--hs-toast-background] - Overrides the variant's background.
 * @cssprop [--hs-toast-color] - Overrides the variant's text colour.
 * @cssprop [--hs-toast-accent-color] - Overrides the variant's leading rule.
 * @cssprop [--hs-toast-accent-width] - Thickness of that rule.
 * @cssprop [--hs-toast-padding] - Internal padding.
 * @cssprop [--hs-toast-gap] - Space between content and anything beside it.
 * @cssprop [--hs-toast-radius] - Corner radius.
 * @cssprop [--hs-toast-shadow] - Drop shadow.
 * @cssprop [--hs-toast-travel] - How far it slides in from.
 */
export class HsToast extends HTMLElement {
  #timer = 0;
  #remaining = 0;
  #startedAt = 0;
  #hovered = false;
  #focused = false;

  connectedCallback() {
    // Never clobber a role the author set deliberately.
    if (!this.hasAttribute('role') && this.getAttribute('variant') === 'error') {
      this.setAttribute('role', 'alert');
    }

    this.addEventListener('mouseenter', this.#hold);
    this.addEventListener('mouseleave', this.#release);
    this.addEventListener('focusin', this.#hold);
    this.addEventListener('focusout', this.#release);

    this.#remaining = this.duration;
    this.#start();
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
    this.#timer = 0;

    this.removeEventListener('mouseenter', this.#hold);
    this.removeEventListener('mouseleave', this.#release);
    this.removeEventListener('focusin', this.#hold);
    this.removeEventListener('focusout', this.#release);
  }

  /**
   * Milliseconds before self-dismissal. Zero means it stays.
   * @type {number}
   */
  get duration() {
    if (!this.hasAttribute('duration')) return DEFAULT_DURATION;
    const value = Number(this.getAttribute('duration'));
    // A duration nobody can parse is a typo, not a request to stay forever.
    return Number.isFinite(value) && value >= 0 ? value : DEFAULT_DURATION;
  }

  set duration(value) {
    this.setAttribute('duration', String(value));
  }

  /**
   * Milliseconds left on the clock. Stops falling while paused.
   * @type {number}
   */
  get remaining() {
    if (!this.#timer) return Math.max(0, this.#remaining);
    return Math.max(0, this.#remaining - (performance.now() - this.#startedAt));
  }

  /**
   * Whether the timeout is currently held by a pointer or by focus.
   * @type {boolean}
   */
  get paused() {
    return this.#hovered || this.#focused;
  }

  #start() {
    if (this.paused || this.#timer || this.#remaining <= 0) return;
    this.#startedAt = performance.now();
    this.#timer = setTimeout(() => this.dismiss(), this.#remaining);
  }

  #stop() {
    if (!this.#timer) return;
    clearTimeout(this.#timer);
    this.#timer = 0;
    this.#remaining = Math.max(0, this.#remaining - (performance.now() - this.#startedAt));
  }

  #hold = (event) => {
    if (event.type === 'mouseenter') this.#hovered = true;
    else this.#focused = true;
    this.#stop();
  };

  #release = (event) => {
    if (event.type === 'mouseleave') this.#hovered = false;
    // focusout fires on the way to the next element, and relatedTarget is where
    // focus is going. Still inside means focus never left.
    else if (!this.contains(event.relatedTarget)) this.#focused = false;

    // Both have to be clear: a pointer resting on a focused toast still holds it.
    this.#start();
  };

  /**
   * Remove it. Fires a cancelable `hs-dismiss` first, matching `<hs-alert>`, so
   * a consumer can keep it in place.
   */
  dismiss() {
    const proceed = this.dispatchEvent(
      new CustomEvent('hs-dismiss', { bubbles: true, cancelable: true })
    );
    if (proceed) this.remove();
    return proceed;
  }
}

if (!customElements.get('hs-toast')) {
  customElements.define('hs-toast', HsToast);
}

/**
 * @element hs-toast-region
 *
 * @slot - `<hs-toast>` elements, newest last.
 *
 * @cssprop [--hs-toast-region-offset] - Distance from the viewport corner.
 * @cssprop [--hs-toast-region-gap] - Space between stacked toasts.
 * @cssprop [--hs-toast-region-inline-size] - Width of the stack.
 */
export class HsToastRegion extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'status');
    if (!this.hasAttribute('aria-live')) this.setAttribute('aria-live', 'polite');
    // `status` implies aria-atomic="true", which would re-announce every toast
    // already on screen each time a new one arrives.
    if (!this.hasAttribute('aria-atomic')) this.setAttribute('aria-atomic', 'false');
  }

  /**
   * The toasts currently showing, oldest first.
   * @type {HTMLElement[]}
   */
  get toasts() {
    return [...this.querySelectorAll(':scope > hs-toast')];
  }

  /**
   * Show a toast and return it, so the caller can dismiss it early or listen to
   * it. Appending keeps DOM order the same as the order they were shown.
   *
   * The options are one inline type rather than `@param options.variant`
   * entries. The analyzer mis-parses those against a destructured parameter:
   * it emitted a parameter literally named `{ variant, duration }` and wrote
   * raw JSDoc into the manifest as a type, which then reached the generated
   * declarations and stopped them parsing.
   *
   * @param {string} message - The text to announce.
   * @param {{ variant?: 'success'|'warning'|'error'|'info', duration?: number }} [options]
   * @returns {HsToast}
   */
  show(message, options = {}) {
    const { variant, duration } = options;
    const toast = document.createElement('hs-toast');
    if (variant) toast.setAttribute('variant', variant);
    if (duration !== undefined) toast.setAttribute('duration', String(duration));
    toast.textContent = message;

    // Content before insertion: the live region announces what arrives, and an
    // empty element arriving announces nothing.
    this.append(toast);
    return toast;
  }

  /** Dismiss everything showing. Respects a cancelled `hs-dismiss`. */
  clear() {
    for (const toast of this.toasts) toast.dismiss();
  }
}

if (!customElements.get('hs-toast-region')) {
  customElements.define('hs-toast-region', HsToastRegion);
}
