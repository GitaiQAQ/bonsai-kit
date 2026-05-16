// ==UserScript==
// @name         VMOK Inspector
// @namespace    bonsai-kit
// @version      0.0.4
// @description  Inspect VMOK modules on any page — powered by bonsai-kit
// @match        *://*/*
// @run-at       document-end
// @require      https://unpkg.com/bonsai-kit/dist/components/bk-resizable-panel.umd.min.js
// @require      https://unpkg.com/bonsai-kit/dist/components/bk-module-list.umd.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  'use strict';

  // ─── VmokSource — polls window.__VMOK__.moduleInfo ───────────────────────
  class VmokSource {
    constructor(opts = {}) {
      this.interval = opts.interval ?? 1500;
      this.fields = opts.fields ?? ['version', 'buildVersion'];
      this._subs = new Set();
      this._timer = null;
      this._lastSnapshot = '';
    }
    subscribe(fn) {
      this._subs.add(fn);
      const items = this._snapshot();
      if (items) fn(items);
      return () => this._subs.delete(fn);
    }
    start() {
      if (this._timer) return;
      this._tick();
      this._timer = setInterval(() => this._tick(), this.interval);
    }
    stop() {
      if (this._timer) clearInterval(this._timer);
      this._timer = null;
    }
    refresh() { this._tick(true); }
    _snapshot() {
      const info = unsafeWindow.__VMOK__?.moduleInfo;
      if (!info || typeof info !== 'object') return null;
      return Object.entries(info).map(([name, raw]) => {
        const item = { name };
        for (const f of this.fields) item[f] = raw?.[f] ?? '-';
        return item;
      });
    }
    _tick(force = false) {
      const items = this._snapshot();
      if (!items) { if (force) this._broadcast([]); return; }
      const sig = JSON.stringify(items);
      if (!force && sig === this._lastSnapshot) return;
      this._lastSnapshot = sig;
      this._broadcast(items);
    }
    _broadcast(items) {
      for (const fn of this._subs) {
        try { fn(items); } catch (e) { console.error('[VmokSource]', e); }
      }
    }
  }

  // ─── Build inspector UI ──────────────────────────────────────────────────
  const panel = document.createElement('bk-resizable-panel');
  panel.setAttribute('title', 'VMOK Modules');
  panel.setAttribute('storage-key', 'vmok-inspector');
  panel.setAttribute('min-width', '280');
  panel.setAttribute('max-width', '600');

  const list = document.createElement('bk-module-list');
  list.empty = 'No matching VMOK modules';
  list.loading = 'Waiting for VMOK...';
  list.fields = [
    { key: 'buildVersion', className: 'build' },
    { key: 'version', className: 'version' },
  ];
  panel.appendChild(list);

  document.body.appendChild(panel);

  // ─── Connect data source ─────────────────────────────────────────────────
  const source = new VmokSource({ fields: ['buildVersion', 'version'] });
  source.subscribe((items) => {
    list.items = items;
    panel.setAttribute('badge', items === null ? '-' : `(${list.visibleCount})`);
  });
  source.start();
})();
