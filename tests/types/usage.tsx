/**
 * Compiled by `npm run types:check`, not run by Playwright.
 *
 * Proof that `JSX.IntrinsicElements` describes the real attributes with no
 * cast, written as a React/TSX consumer would write it — see #60.
 *
 * `@types/react` is a devDependency only for this file. The generated
 * augmentation itself is a plain object type, not `React.DetailedHTMLProps`,
 * so nothing in the shipped `.d.ts` requires a consumer with no JSX at all
 * to have `@types/react` installed.
 */

import type { HsMenuElement } from '../../dist/custom-elements.d.ts';

function Example() {
  const ref: React.RefObject<HsMenuElement | null> = { current: null };

  return (
    <>
      {/* A declared attribute, typed from the manifest — no `as any`. */}
      <hs-menu label="Actions" ref={ref}>
        <hs-menu-item value="duplicate">Duplicate</hs-menu-item>
        <hs-menu-item value="delete">Delete</hs-menu-item>
      </hs-menu>

      {/* A boolean attribute typed as boolean, not string. */}
      <hs-toggle name="notifications" checked>
        Email notifications
      </hs-toggle>

      {/*
        Standard React/DOM props this generator does not enumerate still
        pass through, via the index signature - the trade for not
        depending on React's own attribute types.
      */}
      <hs-dialog id="confirm" className="themed" onClick={() => {}}>
        <p>Delete this?</p>
      </hs-dialog>
    </>
  );
}

void Example;
