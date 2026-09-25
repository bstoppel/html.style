/**
 * <hs-field> — light DOM, wiring a native form control.
 *
 * Every part of this is platform machinery. `<label for>` associates, the
 * Constraint Validation API decides validity and writes the message, and
 * `aria-describedby` connects the hint and error to the control. None of that is
 * reimplemented — what the component does is the wiring people get wrong.
 *
 * Light DOM is mandatory here, not a preference: `<label for>` does not cross a
 * shadow boundary, and a control inside one does not participate in the
 * surrounding form.
 *
 *   <hs-field label="Email address" hint="We never share it.">
 *     <input type="email" name="email" required>
 *   </hs-field>
 *
 * It generates the id, associates the label, points aria-describedby at the
 * hint, and on failure shows the browser's own validationMessage — never a
 * hand-written one, so the text stays localised and consistent with the
 * platform.
 *
 * An author-supplied <label> is left alone; the component only fills gaps.
 *
 * The invalid-border styling in the stylesheet has two independent paths:
 * `[aria-invalid="true"]`, which this file sets, and the atoms layer's
 * `:user-invalid` rule (every input/select/textarea on the page, not just
 * this component's), which needs none of this JS and reacts to real
 * typing/blur the moment it happens. They compose rather than one replacing
 * the other — aria-invalid still carries the accessible state and error
 * text, which a CSS pseudo-class cannot expose to assistive tech.
 * `novalidate` opts a field's controls out of both: the atoms rule excludes
 * `hs-field[novalidate]` explicitly, and this file never sets aria-invalid
 * while the attribute is present.
 */

let fieldCount = 0;

/**
 * @element hs-field
 *
 * @cssprop [--hs-field-gap] - Space between label, control, hint and error.
 * @cssprop [--hs-field-spacing] - Space below the whole field.
 * @cssprop [--hs-field-hint-color] - Hint text colour.
 * @cssprop [--hs-field-hint-font-size] - Hint text size.
 * @cssprop [--hs-field-error-color] - Error text colour.
 * @cssprop [--hs-field-error-font-size] - Error text size.
 * @cssprop [--hs-field-invalid-border-color] - Control border when invalid.
 *
 * @attr {string} label - Label text. Skipped if you supply your own <label>.
 * @attr {string} hint - Help text shown under the control and referenced by
 *   aria-describedby.
 * @attr {boolean} novalidate - Do not display validation messages. The control
 *   still validates; only this element's reporting is suppressed.
 *
 * @slot - One `<input>`, `<select>` or `<textarea>`, plus anything else you
 *   want inside the field.
 *
 * @fires hs-invalid - Fired when the control fails validation.
 *   `detail` carries `{ message }`, the browser's own text.
 */
export class HsField extends HTMLElement {
  static observedAttributes = ['label', 'hint'];

  #control = null;
  #label = null;
  #hint = null;
  #error = null;
  #id = '';

  connectedCallback() {
    this.#control = this.querySelector('input, select, textarea');
    if (!this.#control) return;

    if (!this.#id) this.#id = this.#control.id || `hs-field-${++fieldCount}`;
    this.#control.id = this.#id;

    this.#ensureLabel();
    this.#ensureHint();
    this.#ensureError();
    this.#describe();

    // `invalid` does not bubble, so capture it.
    this.addEventListener('invalid', this.#onInvalid, true);
    this.#control.addEventListener('blur', this.#onBlur);
    this.#control.addEventListener('input', this.#onInput);
  }

  disconnectedCallback() {
    this.removeEventListener('invalid', this.#onInvalid, true);
    this.#control?.removeEventListener('blur', this.#onBlur);
    this.#control?.removeEventListener('input', this.#onInput);
  }

  attributeChangedCallback() {
    if (!this.isConnected || !this.#control) return;
    this.#ensureLabel();
    this.#ensureHint();
    this.#describe();
  }

  /** The wrapped native control. */
  /** @type {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null} */
  get control() {
    return this.#control;
  }

  #ensureLabel() {
    // An author-supplied label wins; the component never overwrites one.
    const existing = this.querySelector(':scope > label');
    if (existing && existing !== this.#label) {
      if (!existing.hasAttribute('for')) existing.setAttribute('for', this.#id);
      return;
    }
    const text = this.getAttribute('label');
    if (!text) {
      this.#label?.remove();
      this.#label = null;
      return;
    }
    if (!this.#label) {
      this.#label = document.createElement('label');
      this.#control.before(this.#label);
    }
    this.#label.setAttribute('for', this.#id);
    this.#label.textContent = text;
  }

  #ensureHint() {
    const text = this.getAttribute('hint');
    if (!text) {
      this.#hint?.remove();
      this.#hint = null;
      return;
    }
    if (!this.#hint) {
      this.#hint = document.createElement('p');
      this.#hint.id = `${this.#id}-hint`;
      this.#hint.setAttribute('data-hs-hint', '');
      this.#control.after(this.#hint);
    }
    this.#hint.textContent = text;
  }

  #ensureError() {
    if (this.#error) return;
    this.#error = document.createElement('p');
    this.#error.id = `${this.#id}-error`;
    this.#error.setAttribute('data-hs-error', '');
    // A live region, so the message is announced when it appears rather than
    // only being found if the user navigates back to the control.
    this.#error.setAttribute('role', 'alert');
    this.#error.hidden = true;
    (this.#hint ?? this.#control).after(this.#error);
  }

  /** Keep aria-describedby pointing at whichever of hint and error exist. */
  #describe() {
    const ids = [];
    if (this.#hint) ids.push(this.#hint.id);
    if (this.#error && !this.#error.hidden) ids.push(this.#error.id);

    // Preserve any ids the author put there themselves.
    const owned = new Set([`${this.#id}-hint`, `${this.#id}-error`]);
    const theirs = (this.#control.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((id) => id && !owned.has(id));

    const all = [...theirs, ...ids];
    if (all.length) this.#control.setAttribute('aria-describedby', all.join(' '));
    else this.#control.removeAttribute('aria-describedby');
  }

  #show(message) {
    if (this.hasAttribute('novalidate')) return;
    // The browser's own message, not a hand-written one: it is already
    // localised and already matches what the platform would have said.
    this.#error.textContent = message;
    this.#error.hidden = false;
    this.#control.setAttribute('aria-invalid', 'true');
    this.#describe();
  }

  #clear() {
    this.#error.hidden = true;
    this.#error.textContent = '';
    this.#control.removeAttribute('aria-invalid');
    this.#describe();
  }

  #onInvalid = (event) => {
    if (event.target !== this.#control) return;
    if (this.hasAttribute('novalidate')) return;
    // Suppress the browser's bubble so the message appears in the field's own
    // error region instead — same text, placed where it can be styled and
    // announced.
    event.preventDefault();
    this.#show(this.#control.validationMessage);
    this.dispatchEvent(
      new CustomEvent('hs-invalid', {
        bubbles: true,
        detail: { message: this.#control.validationMessage },
      })
    );
  };

  // Validate on blur, not on every keystroke: reporting an incomplete email as
  // invalid while it is still being typed is hostile.
  #onBlur = () => {
    if (this.hasAttribute('novalidate') || this.#control.value === '') return;
    if (this.#control.checkValidity()) this.#clear();
  };

  #onInput = () => {
    if (!this.#error.hidden && this.#control.checkValidity()) this.#clear();
  };
}

customElements.define('hs-field', HsField);
