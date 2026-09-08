/**
 * <hs-card> — CSS-only element.
 *
 * There is no behaviour here and no shadow root. The global stylesheet styles
 * `hs-card` directly, so the element renders correctly with JavaScript disabled,
 * before any script loads, and if this module is never imported at all.
 *
 * The class below exists ONLY so the element appears in custom-elements.json and
 * editors offer completion for it. Nothing about rendering depends on it being
 * registered — delete the import and the card still looks exactly the same.
 *
 * Why an element rather than `class="card"`: the tag name carries the meaning,
 * which is what a machine reads first, and it keeps one authoring vocabulary —
 * everything is `<hs-*>` whether or not it has behaviour. The `.card` class
 * stays supported.
 *
 * @element hs-card
 *
 * @cssprop [--hs-card-background] - Card background.
 * @cssprop [--hs-card-border-color] - Card border colour.
 * @cssprop [--hs-card-border-width] - Card border width.
 * @cssprop [--hs-card-radius] - Corner radius.
 * @cssprop [--hs-card-padding] - Internal padding.
 * @cssprop [--hs-card-gap] - Space between child elements.
 * @cssprop [--hs-card-shadow-hover] - Shadow applied on hover.
 *
 * @slot - The card's content.
 *
 * @cssprop [--color-surface-elevated] - Card background.
 * @cssprop [--color-border-default] - Card border.
 * @cssprop [--space-component] - Internal padding and gap.
 */
export class HsCard extends HTMLElement {}

customElements.define('hs-card', HsCard);
