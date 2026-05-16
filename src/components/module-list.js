import { BonsaiElement, define, html } from '../internal/base.js';
import { withTokens } from '../internal/tokens.js';
import { escapeHtml, escapeAttr } from '../utils/escape.js';

/**
 * <bk-module-list>
 *
 * Generic field-driven module list renderer with resizable columns.
 * Properties: items, fields, filter, empty, loading
 */
export class BkModuleList extends BonsaiElement {
  static template = html`
    <style>${withTokens(`
      :host { display: block; color: inherit; font: inherit; overflow: auto; }
      table {
        width: 100%; border-collapse: collapse;
        table-layout: fixed; font-size: 10px;
        min-width: 600px;
      }
      th {
        text-align: left; padding: 6px 8px;
        border-bottom: 1px solid rgba(255,255,255,.1);
        color: var(--bk-text-dim); font-weight: 600;
        position: relative; user-select: none; white-space: nowrap;
      }
      th .col-label { overflow: hidden; text-overflow: ellipsis; }
      th .col-resize {
        position: absolute; right: -3px; top: 0; bottom: 0;
        width: 7px; cursor: col-resize; background: transparent;
        z-index: 1;
      }
      th .col-resize:hover,
      th .col-resize.active { background: var(--bk-color-accent, #6366f1); }
      td {
        padding: 5px 8px;
        border-bottom: 1px solid rgba(255,255,255,.03);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      td.name { font-weight: 600; color: var(--ml-name-color, #fff); }
      td.field { color: var(--ml-field-color, #a5b4fc); }
      td.field--version { color: var(--ml-version-color, var(--bk-color-success)); }
      td.field--build   { color: var(--ml-build-color, var(--bk-color-warn)); }
      .placeholder {
        text-align: center; color: var(--bk-text-dim);
        padding: 20px 12px; font-size: 11px;
      }
    `)}</style>
    <div id="root"></div>
  `;

  constructor() {
    super();
    this._items = null; this._fields = []; this._filter = null;
    this._empty = 'No modules'; this._loading = 'Loading...';
    this._colWidths = [];
    this._onColResizeStart = this._onColResizeStart.bind(this);
    this._onColResizeMove = this._onColResizeMove.bind(this);
    this._onColResizeEnd = this._onColResizeEnd.bind(this);
    this._resizing = null; // { th, index, startX, startWidth }
  }

  set items(v) { this._items = v; this._render(); }
  get items() { return this._items; }
  set fields(v) { this._fields = Array.isArray(v) ? v : []; this._colWidths = []; this._render(); }
  get fields() { return this._fields; }
  set filter(fn) { this._filter = typeof fn === 'function' ? fn : null; this._render(); }
  set empty(v) { this._empty = v; this._render(); }
  set loading(v) { this._loading = v; this._render(); }

  get visibleCount() {
    if (!Array.isArray(this._items)) return 0;
    return this._items.filter((it) => !this._filter || this._filter(it.name)).length;
  }

  connectedCallback() { this._render(); }

  disconnectedCallback() {
    window.removeEventListener('mousemove', this._onColResizeMove);
    window.removeEventListener('mouseup', this._onColResizeEnd);
  }

  _render() {
    const root = this.$('#root');
    if (!root) return;
    if (this._items === null) {
      root.innerHTML = `<div class="placeholder">${escapeHtml(this._loading)}</div>`;
      return;
    }
    const list = this._items
      .filter((it) => !this._filter || this._filter(it.name))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
    if (list.length === 0) {
      root.innerHTML = `<div class="placeholder">${escapeHtml(this._empty)}</div>`;
      return;
    }
    const fields = this._fields;
    const totalCols = 1 + fields.length;

    // Default widths: name=30%, fields share the rest equally (min 10% each)
    if (this._colWidths.length !== totalCols) {
      const nameW = 30;
      const fieldW = fields.length ? Math.max(10, (100 - nameW) / fields.length) : 70;
      this._colWidths = [nameW, ...fields.map(() => fieldW)];
    }

    const colgroup = this._colWidths.map(w => `<col style="width:${w}%">`).join('');
    const headerCells = [
      `<th><span class="col-label">Name</span><div class="col-resize" data-col="0"></div></th>`,
      ...fields.map((f, i) => {
        const label = f.label || f.key;
        return `<th><span class="col-label">${escapeHtml(label)}</span><div class="col-resize" data-col="${i + 1}"></div></th>`;
      }),
    ].join('');

    const rows = list.map((item) => `
      <tr>
        <td class="name" title="${escapeAttr(item.name)}">${escapeHtml(item.name)}</td>
        ${fields.map((f) => {
          const v = item[f.key] ?? '-';
          const cls = f.className ? `field--${f.className}` : '';
          return `<td class="field ${cls}" title="${escapeAttr(String(v))}">${escapeHtml(String(v))}</td>`;
        }).join('')}
      </tr>
    `).join('');

    root.innerHTML = `<table><colgroup>${colgroup}</colgroup><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table>`;

    // Bind resize handles
    root.querySelectorAll('.col-resize').forEach(handle => {
      handle.addEventListener('mousedown', this._onColResizeStart);
    });
  }

  _onColResizeStart(e) {
    const handle = e.target;
    const colIndex = parseInt(handle.dataset.col, 10);
    const th = handle.closest('th');
    if (!th) return;

    this._resizing = {
      index: colIndex,
      startX: e.clientX,
      startWidth: th.offsetWidth,
      handle,
    };
    handle.classList.add('active');
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', this._onColResizeMove);
    window.addEventListener('mouseup', this._onColResizeEnd);
    e.preventDefault();
  }

  _onColResizeMove(e) {
    if (!this._resizing) return;
    const { index, startX, startWidth, handle } = this._resizing;
    const table = this.$('table');
    if (!table) return;

    const tableWidth = table.offsetWidth;
    const dx = e.clientX - startX;
    const newPx = Math.max(40, startWidth + dx);
    const newPercent = (newPx / tableWidth) * 100;

    this._colWidths[index] = newPercent;

    // Update col element directly for live feedback
    const col = this.$(`colgroup col:nth-child(${index + 1})`);
    if (col) col.style.width = `${newPercent}%`;
  }

  _onColResizeEnd() {
    if (!this._resizing) return;
    this._resizing.handle.classList.remove('active');
    this._resizing = null;
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', this._onColResizeMove);
    window.removeEventListener('mouseup', this._onColResizeEnd);
  }
}

define('bk-module-list', BkModuleList);
