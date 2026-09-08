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

/**
 * @element hs-toggle
 *
 * @attr {boolean} checked - Whether the switch is on.
 * @attr {boolean} disabled - Inactive and removed from the tab order.
 * @attr {string} name - Field name used when the form is submitted.
 * @attr {string} value - Value submitted when checked. Defaults to "on".
 *
 * @slot - The switch's label.
 *
 * @fires change - Fired when the state changes, like a native control.
 *
 * @csspart track - The switch's background rail.
 * @csspart thumb - The moving knob.
 *
 * @cssprop [--hs-toggle-track-inline-size] - Track width. Default 2.5rem.
 * @cssprop [--hs-toggle-track-block-size] - Track height. Default 1.5rem.
 * @cssprop [--hs-toggle-track-padding] - Inset around the thumb. Default 0.1875rem.
 * @cssprop [--hs-toggle-thumb-size] - Thumb diameter. Default 1.125rem.
 * @cssprop [--hs-toggle-radius] - Corner radius of track and thumb.
 * @cssprop [--hs-toggle-gap] - Space between the switch and its label.
 * @cssprop [--hs-toggle-track-color] - Track colour when off.
 * @cssprop [--hs-toggle-track-color-checked] - Track colour when on.
 * @cssprop [--hs-toggle-thumb-color] - Thumb colour.
 */
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

    /* Every dimension and colour is a custom property with a default, so a
       consumer can resize or recolour the switch without ::part() surgery —
       which would otherwise lose to the sizes declared in here. */
    :host {
      --_track-inline: var(--hs-toggle-track-inline-size, 2.5rem);
      --_track-block: var(--hs-toggle-track-block-size, 1.5rem);
      --_track-pad: var(--hs-toggle-track-padding, 0.1875rem);
      --_thumb: var(--hs-toggle-thumb-size, 1.125rem);

      display: inline-flex;
      align-items: center;
      gap: var(--hs-toggle-gap, var(--space-component, 0.5rem));
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    :host([disabled]) {
      cursor: not-allowed;
      opacity: 0.5;
    }

    :host(:focus-visible) {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, currentColor);
      outline-offset: var(--focus-ring-offset, 2px);
      border-radius: var(--p-radius-sm, 0.25rem);
    }

    .track {
      /* The thumb is a <span>, so it stays display:inline and ignores its own
         size unless its parent lays it out. The track escapes that only because
         it is a flex item of :host; the thumb has no such rescue. */
      display: flex;
      align-items: center;
      flex-shrink: 0;
      inline-size: var(--_track-inline);
      block-size: var(--_track-block);
      padding: var(--_track-pad);
      border-radius: var(--hs-toggle-radius, var(--p-radius-full, 9999px));
      background: var(--hs-toggle-track-color, var(--color-border-emphasis, currentColor));
      transition: background var(--motion-duration, 200ms) var(--motion-ease, ease);
    }

    :host([checked]) .track {
      background: var(--hs-toggle-track-color-checked, var(--color-action-primary, currentColor));
    }

    .thumb {
      inline-size: var(--_thumb);
      block-size: var(--_thumb);
      border-radius: var(--hs-toggle-radius, var(--p-radius-full, 9999px));
      background: var(--hs-toggle-thumb-color, var(--color-surface-elevated, #fff));
      transition: translate var(--motion-duration, 200ms) var(--motion-ease, ease);
    }

    /* Derived from the sizes above rather than hardcoded, so resizing the track
       actually moves the thumb the right distance. */
    :host([checked]) .thumb {
      translate: calc(var(--_track-inline) - var(--_thumb) - 2 * var(--_track-pad)) 0;
    }

    /* No reduced-motion block here. --motion-duration is a custom property, and
       custom properties inherit THROUGH the shadow boundary, so collapsing it
       on :root under prefers-reduced-motion reaches this component. */
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
    // Publish the form value synchronously. willUpdate also does this, but Lit
    // batches updates, so a toggle that is created and appended by framework
    // code would contribute nothing to FormData until after the first render —
    // where a native control contributes immediately.
    this.#internals.setFormValue(this.checked ? this.value : null);
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
