/**
 * Compiled by `npm run types:check`, not run by Playwright.
 *
 * Generated type declarations are exactly the kind of thing that rots silently:
 * nothing errors when they are wrong, consumers just get bad autocomplete or
 * spurious red squiggles. This file is the proof they describe the real API,
 * and it is written as a consumer would write it rather than as a test.
 *
 * Under `strict`, so an `any` leaking out of the declarations would surface as
 * an implicit-any error rather than passing quietly.
 */

import type { HsMenuElement, HsToastRegionElement } from '../../dist/custom-elements.d.ts';

// The point of HTMLElementTagNameMap: no casts anywhere below.
const menu = document.querySelector('hs-menu');
const toasts = document.querySelector('hs-toast-region');
const tooltip = document.querySelector('hs-tooltip');
const sortable = document.querySelector('hs-sortable');
const dialog = document.querySelector('hs-dialog');

if (menu && toasts && tooltip && sortable && dialog) {
  // Reflected attributes are typed as what they are.
  const label: string = menu.label;
  const open: boolean = menu.open;
  menu.open = true;
  void label;
  void open;

  // Getters carry the types annotated on them in the source, so a DOM object
  // comes back as a DOM object rather than as `unknown`.
  const table: HTMLTableElement | null = sortable.table;
  const header: HTMLTableCellElement | null = sortable.sortedBy;
  const native: HTMLDialogElement | null = dialog.dialog;
  const trigger: HTMLElement | null = tooltip.trigger;
  void table;
  void header;
  void native;
  void trigger;

  // Methods, with their real signatures.
  dialog.close('cancel');
  tooltip.show();
  toasts.clear();

  const toast = toasts.show('Draft saved', { variant: 'success', duration: 4000 });
  const remaining: number = toast.remaining;
  const paused: boolean = toast.paused;
  void remaining;
  void paused;

  // Events are narrowed by name, which is what the per-element event map buys.
  menu.addEventListener('hs-menu-select', (event) => {
    const target: HsMenuElement = event.currentTarget as HsMenuElement;
    void target;
  });

  // And an unknown event name still works, through the widened overload.
  menu.addEventListener('click', () => {});
}

// createElement is typed from the same map.
const created = document.createElement('hs-toast-region');
const region: HsToastRegionElement = created;
void region;
