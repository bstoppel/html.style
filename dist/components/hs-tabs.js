/**
 * <hs-tabs> — shadow DOM.
 *
 * Owns internal structure the consumer must not restructure: a tablist, the
 * buttons in it, and the panel wrappers. The platform provides nothing here, so
 * the component is what supplies roving tabindex, arrow-key navigation, and the
 * ARIA relationships between tabs and panels.
 *
 * The consumer writes panels and nothing else — the tablist is derived from
 * their labels:
 *
 *   <hs-tabs>
 *     <hs-tab-panel label="Overview">…</hs-tab-panel>
 *     <hs-tab-panel label="Details">…</hs-tab-panel>
 *   </hs-tabs>
 *
 * BOTH the tabs and the panel wrappers live in the shadow root, with the
 * consumer's content slotted into them. That is deliberate: `aria-controls` and
 * `aria-labelledby` are IDREFs, and an IDREF cannot cross a shadow boundary. Put
 * the buttons in the shadow root and the panels in light DOM and the two halves
 * can never reference each other.
 */

import { LitElement, html, css } from 'lit';

/**
 * A panel's content holder. Deliberately inert: it carries a label and its
 * children, and `hs-tabs` does the rest.
 *
 * @element hs-tab-panel
 * @attr {string} label - Text shown on this panel's tab.
 */
export class HsTabPanel extends HTMLElement {}

if (!customElements.get('hs-tab-panel')) {
  customElements.define('hs-tab-panel', HsTabPanel);
}

/**
 * @element hs-tabs
 *
 * @attr {number} selected - Index of the active tab. Reflected.
 * @attr {'auto'|'manual'} activation - `auto` (default) selects on arrow-key
 *   focus; `manual` requires Enter or Space.
 *
 * @slot - `<hs-tab-panel>` elements. Anything else is ignored.
 *
 * @fires hs-tab-change - Fired after the active tab changes.
 *   `detail` carries `{ index, label }`.
 *
 * @csspart tablist - The row of tabs.
 * @csspart tab - Every tab button.
 * @csspart tab-active - The active tab button, in addition to `tab`.
 * @csspart panel - The active panel wrapper.
 *
 * @cssprop [--hs-tabs-gap] - Space between tabs.
 * @cssprop [--hs-tabs-tab-padding-block] - Vertical padding inside a tab.
 * @cssprop [--hs-tabs-tab-padding-inline] - Horizontal padding inside a tab.
 * @cssprop [--hs-tabs-indicator-size] - Thickness of the active-tab underline.
 * @cssprop [--hs-tabs-indicator-color] - Colour of that underline.
 * @cssprop [--hs-tabs-tab-color] - Inactive tab text.
 * @cssprop [--hs-tabs-tab-color-active] - Active tab text.
 * @cssprop [--hs-tabs-border-color] - Rule under the tablist.
 * @cssprop [--hs-tabs-panel-spacing] - Gap between the tablist and the panel.
 */
export class HsTabs extends LitElement {
  static properties = {
    selected: { type: Number, reflect: true },
    activation: { type: String, reflect: true },
    _labels: { state: true, attribute: false },
  };

  static styles = css`
    /* The global reset stops at the shadow boundary, so restate what matters. */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    :host {
      display: block;
    }

    [part='tablist'] {
      display: flex;
      gap: var(--hs-tabs-gap, var(--p-space-xs, 0.25rem));
      border-block-end: var(--border-width, 1px) solid
        var(--hs-tabs-border-color, var(--color-border-default, currentColor));
      overflow-x: auto;
    }

    button {
      flex-shrink: 0;
      background: none;
      border: none;
      border-block-end: var(--hs-tabs-indicator-size, var(--border-width-emphasis, 2px))
        solid transparent;
      margin-block-end: calc(-1 * var(--border-width, 1px));
      padding: var(--hs-tabs-tab-padding-block, var(--space-component, 0.5rem))
        var(--hs-tabs-tab-padding-inline, var(--space-inline, 1rem));
      font: inherit;
      color: var(--hs-tabs-tab-color, var(--color-text-secondary, currentColor));
      cursor: pointer;
      transition: color var(--motion-duration, 200ms) var(--motion-ease, ease),
        border-color var(--motion-duration, 200ms) var(--motion-ease, ease);
    }

    button[aria-selected='true'] {
      color: var(--hs-tabs-tab-color-active, var(--color-action-primary, currentColor));
      border-block-end-color: var(--hs-tabs-indicator-color,
        var(--color-action-primary, currentColor));
    }

    button:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, currentColor);
      outline-offset: calc(-1 * var(--focus-ring-width, 2px));
    }

    [part='panel'] {
      padding-block-start: var(--hs-tabs-panel-spacing, var(--space-block, 1.5rem));
    }

    /* No reduced-motion block: --motion-duration inherits through the shadow
       boundary, so collapsing it on :root reaches these transitions. */
  `;

  #panels = [];

  constructor() {
    super();
    this.selected = 0;
    this.activation = 'auto';
    this._labels = [];
  }

  /** The `<hs-tab-panel>` children, in document order. */
  get panels() {
    return this.#panels;
  }

  #onSlotChange = () => {
    // Read the light-DOM children rather than the default slot's assigned
    // elements. Assigning slot names below moves the panels OUT of that slot,
    // which fires slotchange again with nothing assigned — and a handler that
    // trusted assignedElements would wipe its own state on that second pass.
    this.#panels = [...this.querySelectorAll(':scope > hs-tab-panel')];

    // Route each panel into its own shadow wrapper. Assigning slot names here
    // rather than asking the consumer to do it keeps the authored markup to
    // just labels and content.
    this.#panels.forEach((panel, index) => panel.setAttribute('slot', `panel-${index}`));

    this._labels = this.#panels.map(
      (panel, index) => panel.getAttribute('label') || `Tab ${index + 1}`
    );

    if (this.selected >= this._labels.length) this.selected = 0;
  };

  #select(index, { focus = false } = {}) {
    if (index === this.selected || index < 0 || index >= this._labels.length) return;
    this.selected = index;
    if (focus) this.#focusTab(index);
    this.dispatchEvent(
      new CustomEvent('hs-tab-change', {
        bubbles: true,
        detail: { index, label: this._labels[index] },
      })
    );
  }

  #focusTab(index) {
    this.updateComplete.then(() => {
      this.renderRoot.querySelectorAll('button')[index]?.focus();
    });
  }

  #onKeydown = (event) => {
    const last = this._labels.length - 1;
    const current = Number(event.currentTarget.dataset.index);
    let next = null;

    switch (event.key) {
      case 'ArrowRight': next = current === last ? 0 : current + 1; break;
      case 'ArrowLeft': next = current === 0 ? last : current - 1; break;
      case 'Home': next = 0; break;
      case 'End': next = last; break;
      case 'Enter':
      case ' ':
        // Only meaningful under manual activation; auto has already selected.
        event.preventDefault();
        this.#select(current);
        return;
      default:
        return;
    }

    event.preventDefault();
    if (this.activation === 'manual') {
      // Move focus without changing the selection, so a screen reader user can
      // browse tabs before committing to one.
      this.#focusTab(next);
      this.renderRoot.querySelectorAll('button')[next]?.focus();
    } else {
      this.#select(next, { focus: true });
    }
  };

  render() {
    return html`
      <div part="tablist" role="tablist">
        ${this._labels.map(
          (label, index) => html`
            <button
              part=${index === this.selected ? 'tab tab-active' : 'tab'}
              role="tab"
              id="tab-${index}"
              data-index=${index}
              aria-selected=${index === this.selected ? 'true' : 'false'}
              aria-controls="panel-${index}"
              tabindex=${index === this.selected ? 0 : -1}
              @click=${() => this.#select(index)}
              @keydown=${this.#onKeydown}
            >
              ${label}
            </button>
          `
        )}
      </div>

      ${this._labels.map(
        (_, index) => html`
          <div
            part="panel"
            role="tabpanel"
            id="panel-${index}"
            aria-labelledby="tab-${index}"
            ?hidden=${index !== this.selected}
            tabindex="0"
          >
            <slot name="panel-${index}"></slot>
          </div>
        `
      )}

      <!-- Unassigned children land here and stay out of the tab UI. -->
      <slot @slotchange=${this.#onSlotChange} hidden></slot>
    `;
  }
}

customElements.define('hs-tabs', HsTabs);
