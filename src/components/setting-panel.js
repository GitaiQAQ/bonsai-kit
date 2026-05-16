import { BonsaiElement, define, html } from '../internal/base.js';
import { withTokens } from '../internal/tokens.js';
import { LocalStore } from '../utils/local-store.js';
import { escapeHtml, escapeAttr } from '../utils/escape.js';

/**
 * <bk-setting-panel> — Schema-driven settings form.
 * Properties: schema, values
 * Attribute:  storage-key
 * Events:     setting-change, setting-reset
 */
export class BkSettingPanel extends BonsaiElement {
  static template = html`
    <style>${withTokens(`
      :host { display: block; color: var(--bk-text); font: 12px/1.4 -apple-system,Segoe UI,Roboto,sans-serif; }
      .group-title { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: var(--bk-text-dim); margin: 12px 0 6px; }
      .field { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.05); }
      .field:last-child { border-bottom: none; }
      .label { flex: 1; min-width: 0; }
      .label .name { font-weight: 500; color: var(--bk-text-strong); font-size: 12px; }
      .label .help { color: var(--bk-text-dim); font-size: 10px; margin-top: 2px; }
      .control { flex-shrink: 0; }
      input[type="text"], input[type="number"], textarea, select {
        background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
        color: #fff; padding: 4px 8px; border-radius: var(--bk-radius-sm);
        font: inherit; min-width: 140px;
      }
      input:focus, textarea:focus, select:focus { outline: none; border-color: var(--bk-color-accent); }
      textarea { min-height: 60px; min-width: 200px; resize: vertical; font-family: ui-monospace,Menlo,Consolas,monospace; font-size: 11px; }
      .switch { position: relative; width: 32px; height: 18px; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .switch .slider { position: absolute; inset: 0; background: rgba(255,255,255,.15); border-radius: 9px; cursor: pointer; transition: background .2s; }
      .switch .slider::before { content: ''; position: absolute; left: 2px; top: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: transform .2s; }
      .switch input:checked + .slider { background: var(--bk-color-accent); }
      .switch input:checked + .slider::before { transform: translateX(14px); }
      .footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.08); }
      .btn { background: rgba(255,255,255,.08); color: #fff; border: none; padding: 4px 10px; border-radius: var(--bk-radius-sm); cursor: pointer; font: inherit; }
      .btn:hover { background: rgba(255,255,255,.16); }
    `)}</style>
    <form id="form" autocomplete="off"></form>
    <div class="footer">
      <button type="button" class="btn" id="reset">Reset</button>
    </div>
  `;

  constructor() {
    super();
    this._schema = []; this._values = {}; this._store = null;
    this._onInput = this._onInput.bind(this);
    this._onReset = this._onReset.bind(this);
  }

  set schema(v) { this._schema = Array.isArray(v) ? v : []; this._loadDefaults(); this._render(); }
  get schema() { return this._schema; }
  set values(v) { this._values = { ...this._values, ...(v || {}) }; this._render(); }
  get values() { return { ...this._values }; }

  connectedCallback() {
    const sk = this.getAttribute('storage-key');
    if (sk) {
      this._store = new LocalStore(sk);
      this._values = { ...this._values, ...this._store.get('values', {}) };
    }
    const form = this.$('#form');
    form.addEventListener('input', this._onInput);
    form.addEventListener('change', this._onInput);
    this.$('#reset').addEventListener('click', this._onReset);
    this._render();
  }

  disconnectedCallback() {
    const form = this.$('#form');
    form?.removeEventListener('input', this._onInput);
    form?.removeEventListener('change', this._onInput);
    this.$('#reset')?.removeEventListener('click', this._onReset);
  }

  _loadDefaults() {
    for (const f of this._schema) {
      if (this._values[f.key] === undefined && f.default !== undefined) {
        this._values[f.key] = f.default;
      }
    }
  }

  _render() {
    const form = this.$('#form');
    if (!form) return;
    const groups = new Map();
    for (const f of this._schema) {
      const g = f.group || '';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(f);
    }
    form.innerHTML = [...groups.entries()].map(([g, fs]) => `
      ${g ? `<div class="group-title">${escapeHtml(g)}</div>` : ''}
      ${fs.map((f) => this._renderField(f)).join('')}
    `).join('');
  }

  _renderField(f) {
    const v = this._values[f.key];
    const ctrl = (() => {
      switch (f.type) {
        case 'switch':
          return `<label class="switch"><input type="checkbox" data-key="${escapeAttr(f.key)}" ${v ? 'checked' : ''}><span class="slider"></span></label>`;
        case 'number':
          return `<input type="number" data-key="${escapeAttr(f.key)}" value="${v ?? ''}" placeholder="${escapeAttr(f.placeholder || '')}">`;
        case 'select':
          return `<select data-key="${escapeAttr(f.key)}">${(f.options || []).map((o) => `<option value="${escapeAttr(o.value)}" ${o.value === v ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}</select>`;
        case 'textarea':
          return `<textarea data-key="${escapeAttr(f.key)}" placeholder="${escapeAttr(f.placeholder || '')}">${escapeHtml(v ?? '')}</textarea>`;
        case 'tags':
          return `<input type="text" data-key="${escapeAttr(f.key)}" data-type="tags" value="${escapeAttr(Array.isArray(v) ? v.join(', ') : '')}" placeholder="${escapeAttr(f.placeholder || 'a, b, c')}">`;
        case 'text':
        default:
          return `<input type="text" data-key="${escapeAttr(f.key)}" value="${escapeAttr(v ?? '')}" placeholder="${escapeAttr(f.placeholder || '')}">`;
      }
    })();
    return `
      <div class="field">
        <div class="label">
          <div class="name">${escapeHtml(f.label || f.key)}</div>
          ${f.help ? `<div class="help">${escapeHtml(f.help)}</div>` : ''}
        </div>
        <div class="control">${ctrl}</div>
      </div>
    `;
  }

  _onInput(e) {
    const t = e.target;
    const key = t.dataset.key;
    if (!key) return;
    let value;
    if (t.type === 'checkbox') value = t.checked;
    else if (t.type === 'number') value = t.value === '' ? null : Number(t.value);
    else if (t.dataset.type === 'tags') value = t.value.split(',').map((s) => s.trim()).filter(Boolean);
    else value = t.value;
    this._values[key] = value;
    this._store?.set('values', this._values);
    this.emit('setting-change', { key, value, values: { ...this._values } });
  }

  _onReset() {
    this._values = {};
    this._loadDefaults();
    this._store?.set('values', this._values);
    this._render();
    this.emit('setting-reset', { values: { ...this._values } });
  }
}

define('bk-setting-panel', BkSettingPanel);
