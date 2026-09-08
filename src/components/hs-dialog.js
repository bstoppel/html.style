/**
 * <hs-dialog> — light DOM, wrapping a real <dialog>.
 *
 * The platform already does the hard parts: the top layer, the backdrop, the
 * focus trap, inert-ing the page behind, Escape to close, returning focus to
 * whatever opened it, and `<form method="dialog">`. None of that is
 * reimplemented here — a native <dialog> does it, and this element wraps one.
 *
 * What it adds is the part the platform leaves to script:
 *
 *   - `<dialog open>` shows NON-modally. Getting a modal requires calling
 *     showModal() from JavaScript, so there is no declarative way to open one.
 *     The `open` attribute here means modal.
 *   - Backdrop dismissal. Where the browser supports `closedBy` this sets it and
 *     the PLATFORM does the dismissing; the JavaScript fallback below only runs
 *     on browsers at this project's floor, which predate it.
 *
 * Children are moved into the <dialog> once, on connect, so consumers write
 * their content directly and `<form method="dialog">` still finds its ancestor:
 *
 *   <hs-dialog id="confirm">
 *     <h2>Delete this?</h2>
 *     <form method="dialog">
 *       <button value="cancel">Cancel</button>
 *       <button value="delete">Delete</button>
 *     </form>
 *   </hs-dialog>
 *
 * @element hs-dialog
 *
 * @cssprop [--hs-dialog-max-inline-size] - Maximum dialog width.
 * @cssprop [--hs-dialog-padding] - Internal padding.
 * @cssprop [--hs-dialog-radius] - Corner radius.
 * @cssprop [--hs-dialog-background] - Dialog surface.
 * @cssprop [--hs-dialog-backdrop] - Backdrop colour.
 *
 * @attr {boolean} open - Present means the dialog is open, as a modal.
 * @attr {boolean} persistent - Do not close on backdrop click. Escape still
 *   works; the platform owns that and it is not overridden.
 *
 * @slot - The dialog's content.
 *
 * @fires hs-open - Fired after the dialog opens.
 * @fires hs-close - Fired after it closes. `detail` carries `{ returnValue }`.
 */

export class HsDialog extends HTMLElement {
  static observedAttributes = ['open', 'persistent'];

  /** Whether the browser can do backdrop dismissal itself. */
  static #supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype;

  #dialog = null;

  connectedCallback() {
    if (!this.#dialog) {
      this.#dialog = document.createElement('dialog');
      // Move the authored content inside, so `method="dialog"` forms and
      // autofocus resolve against a real <dialog> ancestor.
      this.#dialog.append(...this.childNodes);
      this.append(this.#dialog);

      this.#dialog.addEventListener('close', this.#onNativeClose);
      // Only hand-roll dismissal where the platform cannot do it.
      if (!HsDialog.#supportsClosedBy) {
        this.#dialog.addEventListener('click', this.#onBackdropClick);
      }
    }
    this.#syncClosedBy();
    if (this.hasAttribute('open')) this.show();
  }

  attributeChangedCallback(name, previous, current) {
    if (!this.isConnected || previous === current) return;
    if (name === 'persistent') {
      this.#syncClosedBy();
      return;
    }
    if (name !== 'open') return;
    if (current === null) this.close();
    else this.show();
  }

  /**
   * Hand dismissal to the platform. `any` is light dismiss plus Escape;
   * `closerequest` is Escape only, which is what `persistent` means. Escape is
   * never taken away — a modal the keyboard cannot close is a trap.
   */
  #syncClosedBy() {
    if (!HsDialog.#supportsClosedBy || !this.#dialog) return;
    this.#dialog.closedBy = this.hasAttribute('persistent') ? 'closerequest' : 'any';
  }

  /** The wrapped native element, for anything this API does not cover. */
  get dialog() {
    return this.#dialog;
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(value) {
    this.toggleAttribute('open', Boolean(value));
  }

  /** Open as a modal. Idempotent. */
  show() {
    if (!this.#dialog || this.#dialog.open) return;
    // showModal(), not the `open` attribute: only the method puts the dialog in
    // the top layer, traps focus, and inerts the rest of the page.
    this.#dialog.showModal();
    if (!this.hasAttribute('open')) this.setAttribute('open', '');
    this.dispatchEvent(new CustomEvent('hs-open', { bubbles: true }));
  }

  /** Close, optionally setting the native returnValue. */
  close(returnValue) {
    if (!this.#dialog?.open) return;
    this.#dialog.close(returnValue);
  }

  // Fires for every close path — Escape, form submission, and close() — so the
  // attribute and the event are kept in one place rather than three.
  #onNativeClose = () => {
    this.removeAttribute('open');
    this.dispatchEvent(
      new CustomEvent('hs-close', {
        bubbles: true,
        detail: { returnValue: this.#dialog.returnValue },
      })
    );
  };

  #onBackdropClick = (event) => {
    if (this.hasAttribute('persistent')) return;
    // A click on the backdrop targets the dialog itself; a click on anything
    // inside targets a descendant. The rect check guards against clicks that
    // began inside and released on the backdrop.
    if (event.target !== this.#dialog) return;
    const box = this.#dialog.getBoundingClientRect();
    const inside =
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;
    if (!inside) this.close('backdrop');
  };
}

customElements.define('hs-dialog', HsDialog);
