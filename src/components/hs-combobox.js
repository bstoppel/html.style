/**
 * <hs-combobox> — shadow DOM.
 *
 * Owns internal structure the consumer must not restructure: a text input, a
 * listbox, and the options in it. The platform provides nothing here — this is
 * NOT a replacement for `<select>`, which is already styled in the atoms layer
 * and works. The gap is filtering a long list by typing, and `<datalist>` does
 * not close it: no custom option rendering, no control over matching, and
 * behaviour that differs in every engine.
 *
 * The consumer writes options and nothing else:
 *
 *   <hs-combobox name="city" label="City">
 *     <hs-option value="berlin">Berlin</hs-option>
 *     <hs-option value="hamburg">Hamburg</hs-option>
 *   </hs-combobox>
 *
 * Those `<hs-option>` elements are data, not rendering. The options the user
 * sees are built in the shadow root from their value and text, for the same
 * reason `<hs-tabs>` builds its tablist there: `aria-activedescendant` and
 * `aria-controls` are IDREFs, and an IDREF cannot cross a shadow boundary. An
 * input in the shadow root can only point at options that are in it too.
 *
 * The listbox is NOT a popover and is deliberately not in the top layer. It
 * sits directly under its input, so ordinary absolute positioning reaches it,
 * and CSS Anchor Positioning is not available at this project's browser floor
 * anyway — see docs/positioning.md. The trade is that an `overflow: hidden`
 * ancestor clips the list; the consumer controls that.
 *
 * Form participation goes through ElementInternals rather than a hidden input,
 * so the element submits its own value, resets with its form, and restores on
 * back/forward navigation.
 */

import { LitElement, html, css } from 'lit';

/**
 * One choice in an `<hs-combobox>`. Deliberately inert: it carries a value and
 * its text, and the combobox does the rest. It never renders — the global
 * stylesheet hides it, and once the combobox upgrades it is not slotted at all.
 *
 * @element hs-option
 * @attr {string} value - Value submitted when this option is chosen. Defaults
 *   to the element's text content.
 */
export class HsOption extends HTMLElement {}

if (!customElements.get('hs-option')) {
  customElements.define('hs-option', HsOption);
}

/**
 * @element hs-combobox
 *
 * @attr {string} name - Field name used when the form is submitted.
 * @attr {string} value - Value of the chosen option. Reflected.
 * @attr {string} label - Visible label. Rendered as a real `<label for>` inside
 *   the shadow root, where the association works.
 * @attr {string} placeholder - Placeholder text for the input.
 * @attr {boolean} disabled - Inactive and removed from the tab order.
 * @attr {boolean} open - Whether the listbox is showing. Reflected.
 *
 * @slot - `<hs-option>` elements. Anything else is ignored.
 *
 * @fires change - Fired when the chosen value changes, like a native control.
 * @fires hs-open - Fired after the listbox opens.
 * @fires hs-close - Fired after it closes.
 *
 * @csspart label - The field label.
 * @csspart input - The text input.
 * @csspart listbox - The options container.
 * @csspart option - Every option.
 * @csspart option-active - The option under the cursor keys, in addition to
 *   `option`.
 *
 * @cssprop [--hs-combobox-inline-size] - Width of the whole control.
 * @cssprop [--hs-combobox-gap] - Space between label and input.
 * @cssprop [--hs-combobox-padding-block] - Vertical padding inside the input.
 * @cssprop [--hs-combobox-padding-inline] - Horizontal padding inside the input.
 * @cssprop [--hs-combobox-radius] - Corner radius of input and listbox.
 * @cssprop [--hs-combobox-border-color] - Input and listbox border colour.
 * @cssprop [--hs-combobox-background] - Input and listbox background.
 * @cssprop [--hs-combobox-color] - Text colour.
 * @cssprop [--hs-combobox-listbox-max-block-size] - Height before the list
 *   scrolls. Default 16rem.
 * @cssprop [--hs-combobox-option-background-active] - Background of the active
 *   option.
 * @cssprop [--hs-combobox-empty-color] - Colour of the "no matches" text.
 */
export class HsCombobox extends LitElement {
  static formAssociated = true;

  static properties = {
    name: { type: String },
    value: { type: String, reflect: true },
    label: { type: String },
    placeholder: { type: String },
    disabled: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    _query: { state: true },
    _active: { state: true },
    _options: { state: true },
  };

  static styles = css`
    /* The global reset does not cross the shadow boundary, so the component
       restates it. Without this the input is content-box and its padding adds
       to the declared width, which surfaces as a layout shift on upgrade. */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    /* Every dimension and colour is a custom property with a default, so a
       consumer can resize or recolour without ::part() surgery — which would
       otherwise lose to the sizes declared in here. */
    :host {
      --_radius: var(--hs-combobox-radius, var(--p-radius-md, 0.375rem));
      --_border: var(--hs-combobox-border-color, var(--color-border-default, currentColor));
      --_bg: var(--hs-combobox-background, var(--color-surface-elevated, #fff));

      /* The listbox is absolutely positioned against this, which is why the
         host is a containing block. See docs/positioning.md for why it is not
         a popover. */
      position: relative;
      display: inline-flex;
      flex-direction: column;
      gap: var(--hs-combobox-gap, var(--space-component, 0.5rem));
      inline-size: var(--hs-combobox-inline-size, 100%);
      color: var(--hs-combobox-color, var(--color-text-primary, currentColor));
    }

    :host([disabled]) {
      cursor: not-allowed;
      opacity: 0.5;
    }

    label {
      font-weight: 500;
    }

    input {
      inline-size: 100%;
      padding-block: var(--hs-combobox-padding-block, 0.5rem);
      padding-inline: var(--hs-combobox-padding-inline, 0.75rem);
      border: var(--border-width, 1px) solid var(--_border);
      border-radius: var(--_radius);
      background: var(--_bg);
      color: inherit;
      font: inherit;
    }

    input:focus-visible {
      outline: var(--focus-ring-width, 2px) solid
        var(--focus-ring-color, var(--color-action-primary, currentColor));
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .listbox {
      position: absolute;
      inset-block-start: 100%;
      inset-inline: 0;
      z-index: var(--p-layer-raised, 10);
      margin-block-start: var(--space-component, 0.5rem);
      max-block-size: var(--hs-combobox-listbox-max-block-size, 16rem);
      overflow-y: auto;
      padding: 0;
      border: var(--border-width, 1px) solid var(--_border);
      border-radius: var(--_radius);
      background: var(--_bg);
      box-shadow: var(--p-shadow-md, none);
      list-style: none;
    }

    /* Closed is absent from the accessibility tree, not merely invisible. */
    :host(:not([open])) .listbox {
      display: none;
    }

    .option {
      padding-block: var(--hs-combobox-padding-block, 0.5rem);
      padding-inline: var(--hs-combobox-padding-inline, 0.75rem);
      cursor: pointer;
    }

    .option[aria-selected='true'],
    .option.is-active {
      background: var(--hs-combobox-option-background-active, var(--color-surface-sunken, currentColor));
    }

    /* An empty list with no message is a dead end for a screen reader user, so
       the listbox always says something. */
    .empty {
      padding-block: var(--hs-combobox-padding-block, 0.5rem);
      padding-inline: var(--hs-combobox-padding-inline, 0.75rem);
      color: var(--hs-combobox-empty-color, var(--color-text-secondary, currentColor));
    }

    /* No reduced-motion block. --motion-duration is a custom property and
       custom properties inherit THROUGH the shadow boundary, so collapsing it
       on :root reaches this component. */
  `;

  #internals;
  #defaultValue = '';
  /** The committed value when the input took focus, so Escape can return to it. */
  #valueOnFocus = '';

  constructor() {
    super();
    this.value = '';
    this.label = '';
    this.placeholder = '';
    this.disabled = false;
    this.open = false;
    this._query = null;
    this._active = -1;
    this._options = [];
    this.#internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    // Remember the authored value so formResetCallback can return to it.
    this.#defaultValue = this.getAttribute('value') ?? '';
    this.#readOptions();
    // Publish the form value synchronously. willUpdate does this too, but Lit
    // batches updates, so a combobox created and appended by framework code
    // would contribute nothing to FormData until after the first render, where
    // a native control contributes immediately.
    this.#internals.setFormValue(this.value || null);
  }

  /**
   * Read the consumer's `<hs-option>` children. They are data: the options the
   * user sees are rendered in the shadow root, because an IDREF cannot cross
   * the boundary and `aria-activedescendant` is an IDREF.
   */
  #readOptions() {
    this._options = [...this.querySelectorAll('hs-option')].map((el, index) => ({
      index,
      value: el.getAttribute('value') ?? el.textContent.trim(),
      text: el.textContent.trim(),
    }));
  }

  /** Options matching what has been typed. Everything, when nothing is typed. */
  get #matches() {
    if (this._query === null || this._query === '') return this._options;
    const needle = this._query.toLowerCase();
    return this._options.filter((o) => o.text.toLowerCase().includes(needle));
  }

  /** The text shown in the input: what is being typed, else the chosen label. */
  get #displayText() {
    if (this._query !== null) return this._query;
    return this._options.find((o) => o.value === this.value)?.text ?? '';
  }

  willUpdate() {
    this.#internals.setFormValue(this.value || null);
    this.#internals.ariaDisabled = String(this.disabled);
    // Also reflect aria-disabled as an attribute: internals ARIA is enough for
    // assistive technology, but an inactive control is exempt from WCAG 1.4.3
    // contrast, and tooling can only apply that exemption when the state is
    // visible in the DOM the way `<button disabled>` is.
    if (this.disabled) this.setAttribute('aria-disabled', 'true');
    else this.removeAttribute('aria-disabled');
  }

  #show() {
    if (this.open || this.disabled) return;
    this.open = true;
    this.dispatchEvent(new Event('hs-open', { bubbles: true }));
  }

  #hide() {
    if (!this.open) return;
    this.open = false;
    this._active = -1;
    this.dispatchEvent(new Event('hs-close', { bubbles: true }));
  }

  #onFocus = () => {
    // Snapshot, so Escape can restore what was committed before this visit.
    this.#valueOnFocus = this.value;
  };

  #onInput = (event) => {
    this._query = event.target.value;
    this._active = this.#matches.length > 0 ? this.#matches[0].index : -1;
    this.#show();
  };

  #onKeydown = (event) => {
    const matches = this.#matches;
    const positionOf = (index) => matches.findIndex((o) => o.index === index);

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.open) {
          this.#show();
          if (matches.length > 0) this._active = matches[0].index;
          return;
        }
        if (matches.length === 0) return;
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const current = positionOf(this._active);
        // Wraps, matching the listbox pattern and <hs-tabs>.
        const next = (current + step + matches.length) % matches.length;
        this._active = matches[next].index;
        return;
      }
      case 'Home':
      case 'End':
        if (!this.open || matches.length === 0) return;
        event.preventDefault();
        this._active = (event.key === 'Home' ? matches[0] : matches.at(-1)).index;
        return;
      case 'Enter': {
        if (!this.open || this._active < 0) return;
        // Would otherwise submit the form.
        event.preventDefault();
        this.#commit(this._active);
        return;
      }
      case 'Escape':
        if (!this.open) return;
        // Would otherwise close a surrounding <dialog>.
        event.preventDefault();
        this.#revert();
        return;
      case 'Tab':
        // A combobox is not a dialog and must not trap the keyboard.
        this.#settle();
        return;
      default:
    }
  };

  #onBlur = () => this.#settle();

  /** Close, keeping whatever is committed, and drop any half-typed query. */
  #settle() {
    this._query = null;
    this.#hide();
  }

  /** Close and return to the last committed value. */
  #revert() {
    this._query = null;
    if (this.value !== this.#valueOnFocus) {
      this.value = this.#valueOnFocus;
    }
    this.#hide();
  }

  #commit(index) {
    const option = this._options[index];
    if (!option || option.value === this.value) {
      this.#settle();
      return;
    }
    this.value = option.value;
    // Re-baseline, so a later Escape abandons the NEXT edit rather than undoing
    // this one. Escape cancels an interaction in progress; it does not reverse a
    // selection the user already completed without leaving the field.
    this.#valueOnFocus = option.value;
    this._query = null;
    this.#hide();
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  formResetCallback() {
    this.value = this.#defaultValue;
    this._query = null;
    this.#hide();
  }

  formStateRestoreCallback(state) {
    this.value = state ?? '';
  }

  /** Re-read the `<hs-option>` children. Call after changing them. */
  refresh() {
    this.#readOptions();
  }

  render() {
    const matches = this.#matches;
    return html`
      ${this.label
        ? html`<label part="label" for="input">${this.label}</label>`
        : null}
      <input
        id="input"
        part="input"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls="listbox"
        aria-autocomplete="list"
        aria-activedescendant=${this.open && this._active >= 0 ? `option-${this._active}` : ''}
        ?disabled=${this.disabled}
        placeholder=${this.placeholder}
        .value=${this.#displayText}
        @focus=${this.#onFocus}
        @input=${this.#onInput}
        @keydown=${this.#onKeydown}
        @blur=${this.#onBlur}
      />
      <ul id="listbox" part="listbox" class="listbox" role="listbox">
        ${matches.length === 0
          ? html`<li class="empty" role="presentation">No matches</li>`
          : matches.map(
              (option) => html`
                <li
                  id="option-${option.index}"
                  part=${option.index === this._active ? 'option option-active' : 'option'}
                  class="option ${option.index === this._active ? 'is-active' : ''}"
                  role="option"
                  aria-selected=${option.value === this.value ? 'true' : 'false'}
                  @mousedown=${(event) => {
                    // Before blur, so the click is not lost to #settle().
                    event.preventDefault();
                    this.#commit(option.index);
                  }}
                >
                  ${option.text}
                </li>
              `
            )}
      </ul>
    `;
  }
}

customElements.define('hs-combobox', HsCombobox);
