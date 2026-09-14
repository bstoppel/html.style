/**
 * <hs-copy> — light DOM, wrapping a real <button>.
 *
 * Renders a native button rather than reimplementing one, so focus, activation
 * and the accessible name come from the platform. The Clipboard API does the
 * copying. What the component adds is the wiring: pointing at what to copy,
 * confirming it happened, and announcing that to assistive technology.
 *
 * This replaces `ClipboardHelper` in html.style.js, which the README listed as
 * available while it sat commented out of init() — so nobody had it, and anyone
 * who uncommented it got copy buttons injected into every code block whether
 * they wanted them or not.
 *
 *   <pre id="snippet"><code>npm install html.style</code></pre>
 *   <hs-copy for="snippet">Copy</hs-copy>
 *
 */

const DEFAULT_COPIED = 'Copied';
const RESET_AFTER = 2000;

/**
 * @element hs-copy
 *
 * @cssprop [--hs-copy-copied-background] - Button background while confirming.
 * @cssprop [--hs-copy-copied-color] - Button text while confirming.
 *
 * @attr {string} for - Id of the element whose text is copied. Without it, the
 *   copied text is this element's own `value` attribute.
 * @attr {string} value - Literal text to copy, used when `for` is absent.
 * @attr {string} copied-label - Confirmation text. Defaults to "Copied".
 *
 * @slot - The button's label.
 *
 * @fires hs-copy - Fired after a successful copy. `detail` carries `{ text }`.
 * @fires hs-copy-error - Fired when the copy fails, which the Clipboard API
 *   does whenever the document is not focused or permission is refused.
 */
export class HsCopy extends HTMLElement {
  #button = null;
  #status = null;
  #label = '';
  #timer = 0;

  connectedCallback() {
    if (this.#button) return;

    this.#label = this.textContent.trim() || 'Copy';

    this.#button = document.createElement('button');
    this.#button.type = 'button';
    this.#button.textContent = this.#label;
    this.#button.addEventListener('click', () => this.copy());

    // A polite live region, so the confirmation is announced. The button's own
    // name is left alone: renaming a control mid-interaction loses voice
    // control users their target.
    this.#status = document.createElement('span');
    this.#status.className = 'visually-hidden';
    this.#status.setAttribute('role', 'status');

    this.replaceChildren(this.#button, this.#status);
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
  }

  /**
   * The text this element would copy.
   * @type {string}
   */
  get text() {
    const id = this.getAttribute('for');
    if (id) return document.getElementById(id)?.textContent ?? '';
    return this.getAttribute('value') ?? '';
  }

  async copy() {
    const text = this.text;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // writeText rejects when the document is not focused or the permission
      // is denied. Surface it rather than silently appearing to succeed.
      this.dispatchEvent(
        new CustomEvent('hs-copy-error', { bubbles: true, detail: { error } })
      );
      return;
    }

    this.#confirm();
    this.dispatchEvent(new CustomEvent('hs-copy', { bubbles: true, detail: { text } }));
  }

  #confirm() {
    const copied = this.getAttribute('copied-label') || DEFAULT_COPIED;
    this.#status.textContent = copied;
    this.setAttribute('data-copied', '');

    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      this.removeAttribute('data-copied');
      this.#status.textContent = '';
    }, RESET_AFTER);
  }
}

customElements.define('hs-copy', HsCopy);
