/**
 * <hs-theme-toggle> — light DOM.
 *
 * Renders a real <button> as its child rather than reimplementing one in a
 * shadow root. Atoms stay semantic HTML, so the platform keeps supplying focus,
 * activation, and the accessible name; the component supplies only the
 * behaviour the platform lacks — reading the stored preference, flipping
 * `color-scheme`, and keeping its pressed state honest.
 *
 * This replaces a pattern the README used to document and which never worked:
 *
 *   <button onclick="ThemeManager.toggle()">Toggle Theme</button>
 *
 * ThemeManager is a module export, not a global, so an inline handler can never
 * see it. A custom element has no such problem.
 *
 *   <hs-theme-toggle></hs-theme-toggle>
 */

const STORAGE_KEY = 'theme';
const DEFAULT_LABEL = 'Toggle colour scheme';

/**
 * @element hs-theme-toggle
 *
 * @cssprop [--hs-theme-toggle-background] - Button background.
 * @cssprop [--hs-theme-toggle-background-hover] - Button background on hover.
 * @cssprop [--hs-theme-toggle-border-color] - Button border colour.
 * @cssprop [--hs-theme-toggle-color] - Icon colour.
 * @cssprop [--hs-theme-toggle-radius] - Corner radius.
 * @cssprop [--hs-theme-toggle-padding-block] - Vertical padding.
 * @cssprop [--hs-theme-toggle-padding-inline] - Horizontal padding.
 * @cssprop [--hs-theme-toggle-font-size] - Icon size.
 *
 * @attr {string} label - Accessible name for the button. Defaults to
 *   "Toggle colour scheme".
 *
 * @slot - Not used; the component renders its own button.
 *
 * @fires hs-theme-change - Fired after the scheme changes.
 *   `detail` carries `{ scheme }`, one of `light` or `dark`.
 */
export class HsThemeToggle extends HTMLElement {
  static observedAttributes = ['label'];

  #button = null;

  connectedCallback() {
    if (!this.#button) {
      this.#button = document.createElement('button');
      this.#button.type = 'button';
      this.#button.addEventListener('click', () => this.toggle());
      this.append(this.#button);
    }
    this.#render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  /** The scheme in effect: an explicit choice, else the system preference. */
  get scheme() {
    const explicit = document.documentElement.style.colorScheme;
    if (explicit === 'light' || explicit === 'dark') return explicit;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  set scheme(value) {
    if (value !== 'light' && value !== 'dark') return;
    document.documentElement.style.colorScheme = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Private browsing and blocked storage both throw. The scheme still
      // applies for this page; only persistence is lost.
    }
    this.#render();
    this.dispatchEvent(
      new CustomEvent('hs-theme-change', { bubbles: true, detail: { scheme: value } })
    );
  }

  toggle() {
    this.scheme = this.scheme === 'dark' ? 'light' : 'dark';
  }

  #render() {
    if (!this.#button) return;
    const dark = this.scheme === 'dark';

    this.#button.setAttribute('aria-label', this.getAttribute('label') || DEFAULT_LABEL);
    // A toggle button reports its state through aria-pressed rather than by
    // changing its name, so the name stays stable for voice control.
    this.#button.setAttribute('aria-pressed', String(dark));
    // The glyph is decorative — the button is named by aria-label above.
    this.#button.textContent = dark ? '☾' : '☀';
  }
}

customElements.define('hs-theme-toggle', HsThemeToggle);
