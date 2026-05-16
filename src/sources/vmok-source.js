/**
 * VmokSource — Polling adapter for `window.__VMOK__.moduleInfo`.
 * Decoupled from any UI; subscribers receive normalized item arrays.
 */
export class VmokSource {
  constructor(opts = {}) {
    this.interval = opts.interval ?? 1500;
    this.fields = opts.fields ?? ['version', 'buildVersion'];
    this.read = opts.read ?? (() => (typeof window !== 'undefined' ? window.__VMOK__?.moduleInfo : null));
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
    const info = this.read();
    if (!info || typeof info !== 'object') return null;
    return Object.entries(info).map(([name, raw]) => {
      const item = { name };
      for (const f of this.fields) item[f] = raw?.[f] ?? '-';
      return item;
    });
  }
  _tick(force = false) {
    const items = this._snapshot();
    if (!items) {
      if (force) this._broadcast([]);
      return;
    }
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
