/**
 * <hs-accordion> — light DOM, coordinating real <details> elements.
 *
 * Disclosure is a solved problem: <details>/<summary> handles the toggle, the
 * keyboard, and the accessibility, and the `name` attribute makes a group
 * mutually exclusive. All of that is native and none of it is reimplemented
 * here — the consumer writes plain <details> children.
 *
 * What this adds is coordination the platform leaves to the author:
 *
 *   - `exclusive` assigns one shared `name` across the group, so opening one
 *     closes the others without repeating a name on every element and keeping
 *     it unique per accordion.
 *   - One event for the whole group rather than a listener per <details>.
 *   - openAll() / closeAll(), which have no native equivalent.
 *
 *   <hs-accordion exclusive>
 *     <details><summary>Shipping</summary>…</details>
 *     <details open><summary>Returns</summary>…</details>
 *   </hs-accordion>
 *
 * @element hs-accordion
 *
 * @attr {boolean} exclusive - Only one panel open at a time, via the native
 *   `name` grouping.
 *
 * @slot - `<details>` elements. Anything else is left alone.
 *
 * @fires hs-accordion-toggle - Fired when a panel opens or closes.
 *   `detail` carries `{ index, open }`.
 */

let groupCount = 0;

export class HsAccordion extends HTMLElement {
  static observedAttributes = ['exclusive'];

  #groupName = '';
  #observer = null;

  connectedCallback() {
    if (!this.#groupName) this.#groupName = `hs-accordion-${++groupCount}`;

    // Panels can be added after connect — by a framework render, or by script.
    this.#observer = new MutationObserver(() => this.#sync());
    this.#observer.observe(this, { childList: true });

    this.addEventListener('toggle', this.#onToggle, true);
    this.#sync();
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
    this.removeEventListener('toggle', this.#onToggle, true);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#sync();
  }

  /** The `<details>` children, in document order. */
  get panels() {
    return [...this.querySelectorAll(':scope > details')];
  }

  openAll() {
    // Meaningless under exclusive grouping — the browser would immediately
    // close all but one, so say so rather than appearing to work.
    if (this.hasAttribute('exclusive')) return;
    for (const panel of this.panels) panel.open = true;
  }

  closeAll() {
    for (const panel of this.panels) panel.open = false;
  }

  #sync() {
    const exclusive = this.hasAttribute('exclusive');
    for (const panel of this.panels) {
      // `name` is what makes the group exclusive, and it is the browser doing
      // the work — not a click handler closing siblings.
      if (exclusive) panel.setAttribute('name', this.#groupName);
      else if (panel.getAttribute('name') === this.#groupName) panel.removeAttribute('name');
    }
  }

  // `toggle` does not bubble, so listen in the capture phase.
  #onToggle = (event) => {
    const panel = event.target;
    if (panel.parentElement !== this) return;
    this.dispatchEvent(
      new CustomEvent('hs-accordion-toggle', {
        bubbles: true,
        detail: { index: this.panels.indexOf(panel), open: panel.open },
      })
    );
  };
}

customElements.define('hs-accordion', HsAccordion);
