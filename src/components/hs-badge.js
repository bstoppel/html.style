/**
 * <hs-badge> — CSS-only element.
 *
 * No behaviour, no shadow root. The global stylesheet styles `hs-badge`
 * directly, so it renders with JavaScript disabled and without this module.
 *
 * The class exists only so the element reaches custom-elements.json for editor
 * completion; rendering never depends on registration. See hs-card.js for the
 * reasoning behind this tier.
 *
 * @element hs-badge
 *
 * @cssprop [--hs-badge-background] - Badge background.
 * @cssprop [--hs-badge-color] - Badge text colour.
 * @cssprop [--hs-badge-radius] - Corner radius.
 * @cssprop [--hs-badge-padding-block] - Vertical padding.
 * @cssprop [--hs-badge-padding-inline] - Horizontal padding.
 * @cssprop [--hs-badge-font-size] - Label size.
 *
 * @slot - The badge's label.
 *
 * @cssprop [--color-action-surface] - Badge background.
 * @cssprop [--color-action-on-surface] - Badge text.
 */
export class HsBadge extends HTMLElement {}

customElements.define('hs-badge', HsBadge);
