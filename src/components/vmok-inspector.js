import { BonsaiElement, define, html } from '../internal/base.js';
import { withTokens } from '../internal/tokens.js';
import { VmokSource } from '../sources/vmok-source.js';
import './resizable-panel.js';
import './module-list.js';

/**
 * <bk-vmok-inspector>
 *
 * Composite shell — VmokSource + <bk-module-list> wrapped in <bk-resizable-panel>.
 * Drop-in replacement for the original VMOK userscript UI.
 */
export class BkVmokInspector extends BonsaiElement {
  static template = html`
    <style>${withTokens(`
      .refresh {
        width: 18px; height: 18px; border: none; background: none;
        color: #9fd3ff; cursor: pointer; font-size: 12px;
      }
    `)}</style>
    <bk-resizable-panel id="panel" min-width="280" max-width="600">
      <button slot="actions" class="refresh" type="button" title="刷新">⟳</button>
      <bk-module-list id="list"></bk-module-list>
    </bk-resizable-panel>
  `;

  constructor() {
    super();
    this._filters = []; this._fields = null;
    this._source = null; this._unsub = null;
    this._onRefresh = this._onRefresh.bind(this);
    this._onItems = this._onItems.bind(this);
  }

  set filters(v) { this._filters = Array.isArray(v) ? v.map((s) => s.toLowerCase()) : []; this._applyFilter(); }
  get filters() { return this._filters; }
  set fields(v) {
    this._fields = v;
    if (this.$('#list')) this.$('#list').fields = v;
    if (this._source) this._source.fields = v.map((f) => f.key);
  }
  get fields() { return this._fields; }

  connectedCallback() {
    const panel = this.$('#panel');
    panel.setAttribute('title', this.getAttribute('panel-title') || 'VMOK Modules');
    panel.setAttribute('storage-key', this.getAttribute('storage-key') || 'vmok-panel');

    if (!this._fields) {
      this.fields = [
        { key: 'buildVersion', className: 'build' },
        { key: 'version', className: 'version' },
      ];
    }

    const list = this.$('#list');
    list.empty = 'No matching VMOK modules';
    list.loading = 'Waiting for VMOK...';
    this._applyFilter();

    this._source = new VmokSource({
      interval: parseInt(this.getAttribute('interval') || '1500', 10),
      fields: this._fields.map((f) => f.key),
    });
    this._unsub = this._source.subscribe(this._onItems);
    this._source.start();

    this.$('.refresh').addEventListener('click', this._onRefresh);
  }

  disconnectedCallback() {
    this.$('.refresh')?.removeEventListener('click', this._onRefresh);
    this._unsub?.();
    this._source?.stop();
  }

  _applyFilter() {
    const list = this.$('#list');
    if (!list) return;
    list.filter = this._filters.length === 0
      ? null
      : (name) => { const n = name.toLowerCase(); return this._filters.some((f) => n.includes(f)); };
    this._updateBadge();
  }

  _onItems(items) { this.$('#list').items = items; this._updateBadge(); }

  _updateBadge() {
    const list = this.$('#list');
    const panel = this.$('#panel');
    if (!list || !panel) return;
    panel.setAttribute('badge', list.items === null ? '-' : `(${list.visibleCount})`);
  }

  _onRefresh(e) { e.stopPropagation(); this._source?.refresh(); }
}

define('bk-vmok-inspector', BkVmokInspector);
