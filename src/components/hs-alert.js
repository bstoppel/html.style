/**
 * <hs-alert> — light DOM.
 *
 * Arranges content the consumer provides, so per the architecture in CLAUDE.md
 * it stays in light DOM: the global stylesheet keeps applying, slotted markup
 * stays in the page's own tree, labels and links behave, and it renders
 * server-side with no special handling.
 *
 * Everything visual is CSS on `hs-alert[variant]`. JavaScript earns its place
 * here for exactly one thing — `dismissible` — and does nothing otherwise.
 *
 *   <hs-alert variant="error">Something went wrong.</hs-alert>
 *   <hs-alert variant="info" dismissible>You can close this.</hs-alert>
 */

const DEFAULT_DISMISS_LABEL = 'Dismiss';

export class HsAlert extends HTMLElement {
  static observedAttributes = ['dismissible', 'dismiss-label'];

  connectedCallback() {
    // An alert needs its role before anyone reads it, but never clobber a role
    // the author set deliberately (status, log, and alertdialog are all valid
    // choices a consumer might want here).
    if (!this.hasAttribute('role')) this.setAttribute('role', 'alert');
    this.#syncDismissButton();
  }

  attributeChangedCallback() {
    // Attribute callbacks can fire before the element is connected; the
    // connectedCallback above will run the sync once it is.
    if (this.isConnected) this.#syncDismissButton();
  }

  #syncDismissButton() {
    const existing = this.querySelector(':scope > [data-hs-dismiss]');

    if (!this.hasAttribute('dismissible')) {
      existing?.remove();
      return;
    }

    const label = this.getAttribute('dismiss-label') || DEFAULT_DISMISS_LABEL;
    if (existing) {
      existing.setAttribute('aria-label', label);
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('data-hs-dismiss', '');
    button.setAttribute('aria-label', label);
    // The glyph is decorative — the accessible name comes from aria-label.
    button.textContent = '×';
    button.addEventListener('click', () => this.dismiss());
    this.append(button);
  }

  /**
   * Remove the alert. Fires a cancelable `hs-dismiss` first so a consumer can
   * animate the exit, or call preventDefault() to keep it in place.
   */
  dismiss() {
    const proceed = this.dispatchEvent(
      new CustomEvent('hs-dismiss', { bubbles: true, cancelable: true })
    );
    if (proceed) this.remove();
  }
}

customElements.define('hs-alert', HsAlert);
