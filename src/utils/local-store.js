/**
 * Storage abstraction — namespaced JSON-aware key/value store.
 *
 * Default backend: localStorage.
 * For userscripts that prefer GM_setValue/GM_getValue, use `GMStore` instead.
 */
export class LocalStore {
  constructor(ns) { this.ns = ns ? `${ns}:` : ''; }
  _k(k) { return this.ns + k; }
  get(k, dflt = undefined) {
    try {
      const raw = localStorage.getItem(this._k(k));
      return raw === null ? dflt : JSON.parse(raw);
    } catch { return dflt; }
  }
  set(k, v) {
    try { localStorage.setItem(this._k(k), JSON.stringify(v)); } catch {}
  }
  del(k) {
    try { localStorage.removeItem(this._k(k)); } catch {}
  }
}

/**
 * Userscript GM API backed store. Falls back to localStorage if GM_* unavailable.
 *
 *   import { GMStore } from 'bonsai-kit/utils/local-store';
 *   const store = new GMStore('myscript');
 */
export class GMStore {
  constructor(ns) {
    this.ns = ns ? `${ns}:` : '';
    // eslint-disable-next-line no-undef
    this._gmGet = typeof GM_getValue !== 'undefined' ? GM_getValue : null;
    // eslint-disable-next-line no-undef
    this._gmSet = typeof GM_setValue !== 'undefined' ? GM_setValue : null;
    // eslint-disable-next-line no-undef
    this._gmDel = typeof GM_deleteValue !== 'undefined' ? GM_deleteValue : null;
    this._fallback = new LocalStore(ns);
  }
  _k(k) { return this.ns + k; }
  get(k, dflt = undefined) {
    if (!this._gmGet) return this._fallback.get(k, dflt);
    try {
      const raw = this._gmGet(this._k(k), undefined);
      if (raw === undefined) return dflt;
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { return dflt; }
  }
  set(k, v) {
    if (!this._gmSet) return this._fallback.set(k, v);
    try { this._gmSet(this._k(k), JSON.stringify(v)); } catch {}
  }
  del(k) {
    if (!this._gmDel) return this._fallback.del(k);
    try { this._gmDel(this._k(k)); } catch {}
  }
}

/** Shared default singleton — lazy localStorage instance. */
export const defaultStore = new LocalStore();
