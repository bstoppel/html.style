/**
 * <hs-toggle> — shadow DOM.
 *
 * Owns internal structure (a track and a thumb the consumer must not
 * restructure), so per the architecture in CLAUDE.md it encapsulates.
 *
 * It earns its existence because the platform does not provide it: there is no
 * cross-browser switch control — `<input type="checkbox" switch>` is Safari
 * only. This is behaviour the platform lacks, which is the bar a component has
 * to clear here.
 *
 * Form participation goes through ElementInternals rather than a hidden input,
 * so the element submits its own value, resets with its form, and restores on
 * back/forward navigation.
 *
 *   <hs-toggle name="notifications" checked>Email notifications</hs-toggle>
 *
 * Theming crosses the shadow boundary through the design tokens, which inherit
 * into shadow roots. `::part(track)` and `::part(thumb)` are public API.
 */

import { LitElement, html, css } from 'lit';

export class HsToggle extends LitElement {
  static formAssociated = true;

  static properties = {
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { type: String },
    value: { type: String },
  };

  static styles = css`
    /* The global reset does not cross the shadow boundary, so the component
       restates it. Without this, .track is content-box and its padding adds to
       the declared size — which shows up as a layout shift when the element
       upgrades. Every shadow component needs its own reset. */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space-component, 0.5rem);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    :host([disabled]) {
      cursor: not-allowed;
      opacity: 0.5;
    }

    :host(:focus-visible) {
      outline: 2px solid var(--color-action-primary, currentColor);
      outline-offset: 2px;
      border-radius: var(--p-radius-sm, 0.25rem);
    }

    .track {
      flex-shrink: 0;
      inline-size: 2.5rem;
      block-size: 1.5rem;
      padding: 0.1875rem;
      border-radius: var(--p-radius-full, 9999px);
      background: var(--color-border-emphasis, currentColor);
      transition: background 0.2s ease;
    }

    :host([checked]) .track {
      background: var(--color-action-primary, currentColor);
    }

    .thumb {
      inline-size: 1.125rem;
      block-size: 1.125rem;
      border-radius: var(--p-radius-full, 9999px);
      background: var(--color-surface-elevated, #fff);
      transition: translate 0.2s ease;
    }

    :host([checked]) .thumb {
      translate: 1rem 0;
    }

    /* The framework's global reduced-motion rule cannot reach into a shadow
       root, so each component repeats it for its own internals. */
    @media (prefers-reduced-motion: reduce) {
      .track,
      .thumb {
        transition-duration: 0.01ms;
      }
    }
  `;

  #internals;
  #defaultChecked = false;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.value = 'on';
    this.#internals = this.attachInternals();
    this.#internals.role = 'switch';
  }

  connectedCallback() {
    super.connectedCallback();
    // Remember the authored state so formResetCallback can return to it.
    this.#defaultChecked = this.hasAttribute('checked');
    if (!this.hasAttribute('tabindex')) this.tabIndex = this.disabled ? -1 : 0;
    this.addEventListener('click', this.#onClick);
    this.addEventListener('keydown', this.#onKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('keydown', this.#onKeydown);
  }

  willUpdate() {
    // Keep assistive technology, the form value, and focusability in step with
    // state on every change rather than only on user interaction.
    this.#internals.ariaChecked = String(this.checked);
    // Also reflect aria-disabled as an attribute. Internals ARIA is enough for
    // assistive technology, but an inactive control is exempt from WCAG 1.4.3
    // contrast, and tooling can only apply that exemption if the state is
    // visible in the DOM the way `<button disabled>` is.
    this.#internals.ariaDisabled = String(this.disabled);
    if (this.disabled) this.setAttribute('aria-disabled', 'true');
    else this.removeAttribute('aria-disabled');
    this.#internals.setFormValue(this.checked ? this.value : null);
    if (!this.hasAttribute('tabindex') || this.tabIndex >= 0 || this.disabled) {
      this.tabIndex = this.disabled ? -1 : 0;
    }
  }

  #onClick = () => this.toggle();

  #onKeydown = (event) => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    // Space would scroll the page and Enter would submit the form.
    event.preventDefault();
    this.toggle();
  };

  /** Flip the switch, unless disabled. Fires `change` like a native control. */
  toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  formResetCallback() {
    this.checked = this.#defaultChecked;
  }

  formStateRestoreCallback(state) {
    this.checked = state !== null;
  }

  render() {
    return html`
      <span class="track" part="track" aria-hidden="true">
        <span class="thumb" part="thumb"></span>
      </span>
      <slot></slot>
    `;
  }
}

customElements.define('hs-toggle', HsToggle);
