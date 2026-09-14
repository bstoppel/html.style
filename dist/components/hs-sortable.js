/**
 * <hs-sortable> — light DOM, coordinating a real <table>.
 *
 * `<table>` is already styled in the atoms layer and already works, and
 * CONTRIBUTING names `<hs-table>` as a rejection example. Sorting is an
 * enhancement over a table the consumer wrote, so this wraps one and leaves its
 * markup alone:
 *
 *   <hs-sortable>
 *     <table>
 *       <thead>
 *         <tr>
 *           <th data-sort>Name</th>
 *           <th data-sort="number">Size</th>
 *           <th>Actions</th>
 *         </tr>
 *       </thead>
 *       <tbody>…</tbody>
 *     </table>
 *   </hs-sortable>
 *
 * ## The control is a real button
 *
 * The header's own content is MOVED into a `<button>` inside the `<th>`.
 * Nothing is duplicated — the header text becomes the button's label — and the
 * `<th>` keeps its `columnheader` role and carries `aria-sort`.
 *
 * The alternative, a `<th>` made activatable with tabindex and a keydown
 * handler, is a button reimplemented by hand, which is the one thing CLAUDE.md
 * rules out. It would also lose voice control, and announce as a plain column
 * header with no hint that anything can be done to it.
 *
 * It has a second benefit worth stating: the button exists only because this
 * script ran. With JavaScript disabled the table is a plain, readable,
 * document-order table, and there is no affordance promising an interaction
 * that cannot happen.
 *
 * ## Comparing
 *
 * The default comparator is `Intl.Collator` with `numeric: true`, which gets
 * text, bare integers, ISO dates and "Item 2" before "Item 10" right with no
 * configuration. It is NOT a number sort — negatives and decimals collate
 * wrongly — so a numeric column says `data-sort="number"`.
 *
 * Anything else supplies its own key: `data-sort-value` on the cell. One escape
 * hatch instead of a type system, and it covers currency, formatted dates and
 * whatever else a consumer has.
 *
 * ## Limits
 *
 * A `<th>` with `colspan` is skipped: it heads more than one column, so which
 * one it would sort is ambiguous. Headers added after connect need `refresh()`.
 */

/**
 * `numeric: true` is what puts "Item 10" after "Item 2". Sensitivity is left at
 * its default so the order is total rather than collapsing case and accents.
 */
const collator = new Intl.Collator(undefined, { numeric: true });

/** Marks the buttons this element owns, so re-syncing is idempotent. */
const CONTROL = 'data-hs-sort';

/**
 * @element hs-sortable
 *
 * @attr {string} data-sort - On a `<th>`, not on this element: marks the column
 *   sortable. `data-sort="number"` compares as numbers instead of collating.
 * @attr {string} data-sort-value - On a `<td>`, not on this element: an explicit
 *   sort key for that cell, used instead of its text.
 *
 * @slot - One `<table>`. Anything else is left alone.
 *
 * @fires hs-sort - Fired after a sort. `detail` carries
 *   `{ column, direction, header }`.
 *
 * @cssprop [--hs-sortable-gap] - Space between a header's label and its
 *   direction indicator.
 * @cssprop [--hs-sortable-background-hover] - Header background on hover.
 * @cssprop [--hs-sortable-indicator-size] - Size of the direction triangle.
 * @cssprop [--hs-sortable-indicator-opacity] - Opacity of the sorted column's
 *   indicator.
 * @cssprop [--hs-sortable-indicator-idle-opacity] - Opacity of the indicator on
 *   a sortable column that is not the sorted one.
 */
export class HsSortable extends HTMLElement {
  connectedCallback() {
    this.#sync();
  }

  /**
   * The wrapped table, for anything this API does not cover.
   * @type {HTMLTableElement | null}
   */
  get table() {
    return this.querySelector(':scope > table');
  }

  /**
   * The header of the sorted column, or null while nothing is sorted.
   * @type {HTMLTableCellElement | null}
   */
  get sortedBy() {
    return (
      this.table?.querySelector(
        'thead th[aria-sort="ascending"], thead th[aria-sort="descending"]'
      ) ?? null
    );
  }

  /** Re-read the headers. Call after replacing the table or its `<thead>`. */
  refresh() {
    this.#sync();
  }

  #sync() {
    const table = this.table;
    if (!table) return;

    for (const th of table.querySelectorAll('thead th[data-sort]')) {
      // A header spanning columns cannot say which one it sorts.
      if (th.colSpan > 1) continue;
      this.#makeSortable(th);
    }
  }

  #makeSortable(th) {
    if (th.querySelector(`:scope > button[${CONTROL}]`)) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute(CONTROL, '');
    // The header's own content, moved rather than copied: a second control
    // repeating the header is exactly what this must not be.
    button.append(...th.childNodes);
    th.append(button);

    // Sortable but not currently sorted. This is what tells assistive
    // technology the column can be sorted at all.
    if (!th.hasAttribute('aria-sort')) th.setAttribute('aria-sort', 'none');

    button.addEventListener('click', () => this.sort(th));
  }

  /**
   * Sort by a column.
   *
   * @param {HTMLTableCellElement|number} header - The `<th>`, or its column index.
   * @param {'ascending'|'descending'} [direction] - Defaults to ascending, or to
   *   the reverse of the current direction when already sorted by this column.
   */
  sort(header, direction) {
    const table = this.table;
    if (!table) return;

    const th =
      typeof header === 'number'
        ? [...(table.tHead?.rows[0]?.cells ?? [])].find((cell) => this.#columnOf(cell) === header)
        : header;
    if (!th) return;

    const next =
      direction ?? (th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending');
    const column = this.#columnOf(th);

    // Only one column is sorted at a time; the others fall back to "sortable".
    for (const other of table.querySelectorAll('thead th[aria-sort]')) {
      other.setAttribute('aria-sort', other === th ? next : 'none');
    }

    const numeric = th.dataset.sort === 'number';
    const factor = next === 'ascending' ? 1 : -1;

    // Each <tbody> sorts within itself: separate bodies are row groups, and
    // sorting across them would merge groups the author kept apart.
    for (const body of table.tBodies) {
      const rows = [...body.rows];
      // Array.prototype.sort is stable, so rows with equal keys keep the order
      // they were written in.
      rows.sort((a, b) => compare(keyOf(a, column), keyOf(b, column), numeric, factor));
      // Appending existing nodes moves them, so listeners and element identity
      // survive the sort.
      body.append(...rows);
    }

    this.dispatchEvent(
      new CustomEvent('hs-sort', {
        bubbles: true,
        detail: { column, direction: next, header: th },
      })
    );
  }

  /** Which column a header starts at, counting any colspans before it. */
  #columnOf(th) {
    let index = 0;
    for (const cell of th.parentElement.cells) {
      if (cell === th) return index;
      index += cell.colSpan || 1;
    }
    return index;
  }
}

/** A cell's sort key: its explicit `data-sort-value`, else its text. */
function keyOf(row, column) {
  const cell = row.cells[column];
  if (!cell) return '';
  return cell.dataset.sortValue ?? cell.textContent.trim();
}

function compare(left, right, numeric, factor) {
  if (!numeric) return factor * collator.compare(left, right);

  const a = Number(left);
  const b = Number(right);
  const aBad = Number.isNaN(a);
  const bBad = Number.isNaN(b);

  // Unparseable values sort last in BOTH directions, which is why the factor
  // is not applied here: a stray em dash in a numeric column should stay at the
  // bottom rather than take the top on the way back.
  if (aBad || bBad) return aBad && bBad ? 0 : aBad ? 1 : -1;

  return factor * (a - b);
}

customElements.define('hs-sortable', HsSortable);
