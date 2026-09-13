/**
 * <hs-menu> — shadow DOM.
 *
 * A dropdown of actions anchored to a trigger button. `<menu>` is a list
 * element, not a menu widget, and nothing in the platform pairs a button with a
 * list of commands, so this is one of the places shadow DOM earns its cost: the
 * component owns the trigger, the menu box and the items, and wires the ARIA
 * between elements the consumer never sees.
 *
 * The consumer writes items and a label:
 *
 *   <hs-menu label="Actions">
 *     <hs-menu-item value="duplicate">Duplicate</hs-menu-item>
 *     <hs-menu-item value="delete">Delete</hs-menu-item>
 *   </hs-menu>
 *
 * Those `<hs-menu-item>` elements are data, not rendering, exactly like
 * `<hs-option>` in `<hs-combobox>`. The items the user sees are real `<button>`
 * elements built in the shadow root — a menu item has to be a button, and
 * roving tabindex means the component has to own the tab order.
 *
 * ## What the platform does, and what is left over
 *
 * The menu box is a popover, so the top layer, light dismiss and Escape all come
 * from the Popover API. `popovertarget` on the trigger handles the one case that
 * is genuinely awkward to hand-roll: a click on the trigger while the menu is
 * open closes it, rather than the light dismiss closing it and the same click
 * immediately reopening it.
 *
 * Two things the platform does not do, and this does:
 *
 * **Focus return.** A dismissed popover drops focus to `<body>` — measured, not
 * assumed. The menu puts it back on the trigger, but only when focus was
 * actually lost. That condition is what lets Tab close the menu and carry on to
 * the next control instead of being yanked backwards.
 *
 * **Position.** A popover has no containing block to be positioned against.
 * See position.js and docs/positioning.md.
 */

import { LitElement, html, css } from 'lit';
import { anchorStyles, tether } from './position.js';

/**
 * One command in an `<hs-menu>`. Deliberately inert: it carries a value and its
 * text, and the menu does the rest. It never renders — the global stylesheet
 * hides it, and once the menu upgrades it is not slotted at all.
 *
 * @element hs-menu-item
 * @attr {string} value - Value reported when this item is chosen. Defaults to
 *   the element's text content.
 */
export class HsMenuItem extends HTMLElement {}

if (!customElements.get('hs-menu-item')) {
  customElements.define('hs-menu-item', HsMenuItem);
}

/** Milliseconds of silence that end a typeahead run. The usual figure. */
const TYPEAHEAD_TIMEOUT = 500;

/**
 * A printable character with no modifier held. Space is excluded: on a focused
 * menu item the platform uses it to activate, and swallowing that would be
 * reimplementing a button.
 */
const isTypeahead = (event) =>
  event.key.length === 1 &&
  event.key !== ' ' &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.altKey;

/**
 * @element hs-menu
 *
 * @attr {string} label - Text on the trigger button. Also what the pre-upgrade
 *   rule in the global stylesheet draws, so the box is reserved at the right
 *   width.
 * @attr {boolean} disabled - Inactive and removed from the tab order.
 * @attr {boolean} open - Whether the menu is showing. Reflected. Setting it
 *   opens or closes the menu.
 *
 * @slot trigger - Replaces the trigger's text, for a trigger that needs an icon
 *   or markup. Falls back to `label`.
 *
 * @fires hs-menu-select - Fired when an item is chosen. `detail` carries
 *   `{ value, label, index }`.
 * @fires hs-open - Fired after the menu opens.
 * @fires hs-close - Fired after it closes.
 *
 * @csspart trigger - The trigger button.
 * @csspart menu - The menu box.
 * @csspart item - Every menu item.
 *
 * @cssprop [--hs-menu-trigger-background] - Trigger background.
 * @cssprop [--hs-menu-trigger-background-hover] - Trigger background on hover.
 * @cssprop [--hs-menu-trigger-color] - Trigger text colour.
 * @cssprop [--hs-menu-trigger-padding-block] - Vertical padding on the trigger.
 * @cssprop [--hs-menu-trigger-padding-inline] - Horizontal padding on it.
 * @cssprop [--hs-menu-radius] - Corner radius of trigger and menu box.
 * @cssprop [--hs-menu-min-inline-size] - Narrowest the menu box may be.
 * @cssprop [--hs-menu-padding] - Padding inside the menu box.
 * @cssprop [--hs-menu-border-color] - Menu box border.
 * @cssprop [--hs-menu-background] - Menu box surface.
 * @cssprop [--hs-menu-color] - Menu text colour.
 * @cssprop [--hs-menu-shadow] - Menu box shadow.
 * @cssprop [--hs-menu-item-padding-block] - Vertical padding in an item.
 * @cssprop [--hs-menu-item-padding-inline] - Horizontal padding in an item.
 * @cssprop [--hs-menu-item-radius] - Corner radius of an item.
 * @cssprop [--hs-menu-item-background-active] - Background of the item under
 *   the pointer or the keyboard.
 * @cssprop [--hs-anchor-gap] - Distance from the trigger. Read by position.js.
 */
export class HsMenu extends LitElement {
  static properties = {
    label: { type: String },
    disabled: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    _items: { state: true, attribute: false },
    _active: { state: true, attribute: false },
  };

  static styles = [
    anchorStyles,
    css`
      /* The global reset does not cross the shadow boundary, so restate it.
         Without border-box the trigger's padding adds to its width and the
         element resizes the moment it upgrades. */
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      :host {
        display: inline-block;
      }

      /* The trigger mirrors the button atom, because the global stylesheet
         cannot reach in to style it and a trigger that looked nothing like the
         buttons beside it would be worse than one that does. */
      [part='trigger'] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--p-space-xs, 0.25rem);
        border: none;
        border-radius: var(--hs-menu-radius, var(--p-radius-md, 0.375rem));
        padding: var(--hs-menu-trigger-padding-block, var(--space-component, 0.5rem))
          var(--hs-menu-trigger-padding-inline, var(--space-inline, 1rem));
        background: var(--hs-menu-trigger-background, var(--color-action-primary, currentColor));
        color: var(--hs-menu-trigger-color, var(--color-text-inverse, canvas));
        font: inherit;
        font-variation-settings: 'wght' 500;
        cursor: pointer;
        transition: background var(--motion-duration, 200ms) var(--motion-ease, ease);
      }

      [part='trigger']:hover:not(:disabled) {
        background: var(--hs-menu-trigger-background-hover, var(--color-action-hover, currentColor));
      }

      [part='trigger']:disabled {
        background: var(--color-action-disabled, currentColor);
        cursor: not-allowed;
      }

      [part='trigger']:focus-visible {
        outline: var(--focus-ring-width, 2px) solid
          var(--focus-ring-color, var(--color-action-primary, currentColor));
        outline-offset: var(--focus-ring-offset, 2px);
      }

      /* position, inset and the gap all come from anchorStyles. What is left is
         what the box looks like. */
      [part='menu'] {
        min-inline-size: var(--hs-menu-min-inline-size, 12rem);
        padding: var(--hs-menu-padding, var(--p-space-xs, 0.25rem));
        border: var(--border-width, 1px) solid
          var(--hs-menu-border-color, var(--color-border-default, currentColor));
        border-radius: var(--hs-menu-radius, var(--p-radius-md, 0.375rem));
        background: var(--hs-menu-background, var(--color-surface-elevated, canvas));
        color: var(--hs-menu-color, var(--color-text-primary, currentColor));
        box-shadow: var(--hs-menu-shadow, var(--p-shadow-md, none));
      }

      [part='item'] {
        display: block;
        inline-size: 100%;
        border: none;
        border-radius: var(--hs-menu-item-radius, var(--p-radius-sm, 0.25rem));
        padding: var(--hs-menu-item-padding-block, var(--space-component, 0.5rem))
          var(--hs-menu-item-padding-inline, var(--space-inline, 1rem));
        background: none;
        color: inherit;
        font: inherit;
        text-align: start;
        cursor: pointer;
      }

      [part='item']:hover,
      [part='item']:focus-visible {
        background: var(--hs-menu-item-background-active, var(--color-surface-sunken, currentColor));
      }

      /* Inset, because an item is flush with the edge of the menu box and an
         outset ring would be clipped by it. */
      [part='item']:focus-visible {
        outline: var(--focus-ring-width, 2px) solid
          var(--focus-ring-color, var(--color-action-primary, currentColor));
        outline-offset: calc(-1 * var(--focus-ring-width, 2px));
      }

      /* No reduced-motion block. --motion-duration is a custom property and
         custom properties inherit THROUGH the shadow boundary, so collapsing it
         on :root reaches the transition above. */
    `,
  ];

  /** Undoes the positioning. Null whenever the menu is closed. */
  #detach = null;

  /** Which item to focus when the menu next opens. ArrowUp asks for the last. */
  #focusOnOpen = 0;

  /** What the popover last reported. See `updated` for why this is tracked. */
  #popoverState = false;

  #typeaheadBuffer = '';
  #typeaheadTimer = 0;

  constructor() {
    super();
    this.label = '';
    this.disabled = false;
    this.open = false;
    this._items = [];
    this._active = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#readItems();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Scroll and resize listeners outlive the element otherwise.
    this.#detach?.();
    this.#detach = null;
    clearTimeout(this.#typeaheadTimer);
  }

  get #menu() {
    return this.renderRoot?.querySelector('[part="menu"]');
  }

  get #trigger() {
    return this.renderRoot?.querySelector('[part="trigger"]');
  }

  /**
   * Read the consumer's `<hs-menu-item>` children. They are data: the buttons
   * the user sees are rendered in the shadow root.
   */
  #readItems() {
    this._items = [...this.querySelectorAll(':scope > hs-menu-item')].map((el, index) => ({
      index,
      value: el.getAttribute('value') ?? el.textContent.trim(),
      label: el.textContent.trim(),
    }));

    // A shorter list can leave the roving tabindex pointing past the end, and
    // then no item is in the tab order at all.
    if (this._active >= this._items.length) this._active = 0;
  }

  /** Re-read the `<hs-menu-item>` children. Call after changing them. */
  refresh() {
    this.#readItems();
  }

  updated(changed) {
    // `open` is a real setting, not just a readout, so a consumer can drive the
    // menu from markup or script.
    if (!changed.has('open') || !this.#menu) return;

    // Act only when `open` disagrees with what the popover last reported —
    // meaning somebody set it from outside. On a platform-driven change the two
    // already agree, and calling showPopover() here would re-enter the popover
    // algorithm from inside its own beforetoggle: Lit's update is a microtask,
    // and a microtask checkpoint runs the moment a listener returns, which is
    // BEFORE the platform has finished opening. The re-entrant call then
    // coalesces away the toggle event that never arrives, and with it the
    // positioning, the focus return and hs-close.
    if (this.open === this.#popoverState) return;

    this.#popoverState = this.open;
    if (this.open) this.#menu.showPopover();
    else this.#menu.hidePopover();
  }

  // Synchronous, so aria-expanded changes in the same turn as the menu itself.
  #onBeforeToggle = (event) => {
    this.#popoverState = event.newState === 'open';
    this.open = this.#popoverState;
  };

  // Queued, so by now the box is laid out: it can be measured and focused.
  #onToggle = (event) => {
    if (event.newState === 'open') this.#opened();
    else this.#closed();
  };

  #opened() {
    this.#detach = tether(this.#menu, this.#trigger, { placement: 'block-end', align: 'start' });
    this.#focusItem(this.#focusOnOpen);
    this.dispatchEvent(new Event('hs-open', { bubbles: true }));
  }

  #closed() {
    this.#detach?.();
    this.#detach = null;
    this.#focusOnOpen = 0;
    this.#typeaheadBuffer = '';

    // Focus goes back to the trigger when the dismissal would otherwise lose
    // it: either it is still on an item that is no longer rendered, or it has
    // already been dropped to <body>. Anywhere else means something deliberate
    // took it — Tab moving on, or a click on another control — and taking it
    // back would trap the keyboard in the one component that must never do
    // that, or yank the user away from what they just clicked.
    const stranded =
      this.#menu.contains(this.renderRoot.activeElement) ||
      document.activeElement === document.body;
    if (stranded) this.#trigger?.focus();

    this.dispatchEvent(new Event('hs-close', { bubbles: true }));
  }

  /** Move the roving tabindex, wrapping at both ends, and follow with focus. */
  #focusItem(index) {
    const count = this._items.length;
    if (count === 0) return;

    this._active = (index + count) % count;
    // After the render that moves tabindex, so the tab order is right at the
    // moment focus lands rather than one frame later.
    this.updateComplete.then(() => {
      this.renderRoot.querySelectorAll('[part="item"]')[this._active]?.focus();
    });
  }

  #onTriggerKeydown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    if (this.open) return;

    // Would otherwise scroll the page.
    event.preventDefault();
    this.#focusOnOpen = event.key === 'ArrowDown' ? 0 : this._items.length - 1;
    this.#menu.showPopover();
  };

  #onMenuKeydown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.#focusItem(this._active + 1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.#focusItem(this._active - 1);
        return;
      case 'Home':
        event.preventDefault();
        this.#focusItem(0);
        return;
      case 'End':
        event.preventDefault();
        this.#focusItem(this._items.length - 1);
        return;
      case 'Tab':
        // A menu is not a dialog and must not trap the keyboard. Close it and
        // let the default action carry focus past the trigger — no
        // preventDefault, and #closed leaves focus alone because Tab has
        // claimed it by then.
        this.#menu.hidePopover();
        return;
      case 'Escape':
        // The platform closes an auto popover on Escape. Handling it here would
        // be reimplementing light dismiss.
        return;
      default:
    }

    if (isTypeahead(event)) {
      event.preventDefault();
      this.#typeahead(event.key);
    }
  };

  /**
   * Jump to the first item whose label starts with what has been typed.
   *
   * A single letter searches from the item AFTER the active one, so pressing it
   * repeatedly walks through the items that share it. Anything longer searches
   * from the active item, so extending the run refines it rather than skipping
   * the match already found.
   */
  #typeahead(key) {
    clearTimeout(this.#typeaheadTimer);
    this.#typeaheadTimer = setTimeout(() => {
      this.#typeaheadBuffer = '';
    }, TYPEAHEAD_TIMEOUT);

    this.#typeaheadBuffer += key.toLowerCase();

    const count = this._items.length;
    const from = this.#typeaheadBuffer.length === 1 ? this._active + 1 : this._active;

    for (let step = 0; step < count; step++) {
      const index = (from + step) % count;
      if (this._items[index].label.toLowerCase().startsWith(this.#typeaheadBuffer)) {
        this.#focusItem(index);
        return;
      }
    }
  }

  #select(index) {
    const item = this._items[index];
    if (!item) return;

    this.dispatchEvent(
      new CustomEvent('hs-menu-select', {
        bubbles: true,
        detail: { value: item.value, label: item.label, index },
      })
    );
    this.#menu.hidePopover();
  }

  render() {
    return html`
      <button
        part="trigger"
        id="trigger"
        type="button"
        popovertarget="menu"
        aria-haspopup="menu"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls="menu"
        ?disabled=${this.disabled}
        @keydown=${this.#onTriggerKeydown}
      >
        <slot name="trigger">${this.label}</slot>
      </button>

      <div
        part="menu"
        id="menu"
        popover
        role="menu"
        aria-labelledby="trigger"
        @beforetoggle=${this.#onBeforeToggle}
        @toggle=${this.#onToggle}
        @keydown=${this.#onMenuKeydown}
      >
        ${this._items.map(
          (item) => html`
            <button
              part="item"
              type="button"
              role="menuitem"
              tabindex=${item.index === this._active ? 0 : -1}
              @click=${() => this.#select(item.index)}
            >
              ${item.label}
            </button>
          `
        )}
      </div>
    `;
  }
}

customElements.define('hs-menu', HsMenu);
