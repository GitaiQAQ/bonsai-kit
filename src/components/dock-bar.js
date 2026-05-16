import { BonsaiElement, define, html } from '../internal/base.js';
import { withTokens } from '../internal/tokens.js';
import { makeDraggable } from '../utils/draggable.js';
import { LocalStore } from '../utils/local-store.js';
import { escapeHtml, escapeAttr } from '../utils/escape.js';

/**
 * <bk-dock-bar> — Draggable horizontal/vertical dock of icon buttons.
 * Property: items
 * Events: dock-action
 */
export class BkDockBar extends BonsaiElement {
  static template = html`
    <style>${withTokens(`
      :host {
        position: fixed; z-index: var(--bk-z-overlay);
        display: inline-flex; gap: 4px; padding: 6px;
        background: var(--bk-bg); backdrop-filter: blur(10px);
        border: 1px solid var(--bk-border); border-radius: 12px;
        box-shadow: var(--bk-shadow); user-select: none;
        color: var(--bk-text); font: 12px/1 -apple-system,Segoe UI,Roboto,sans-serif;
      }
      :host([orientation="vertical"]) { flex-direction: column; }
      .grip { width: 14px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.35); cursor: grab; }
      :host([orientation="vertical"]) .grip { width: auto; height: 14px; }
      .btn {
        width: 32px; height: 32px; border-radius: 8px;
        border: none; cursor: pointer; color: #fff;
        background: rgba(255,255,255,.06);
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 14px; transition: background .15s, transform .15s;
      }
      .btn:hover { background: rgba(255,255,255,.14); }
      .btn:active { transform: scale(.94); }
      .btn[disabled] { opacity: .4; cursor: not-allowed; }
      .btn.danger  { background: rgba(239,68,68,.18); }
      .btn.primary { background: linear-gradient(135deg, var(--bk-color-accent), var(--bk-color-accent-2)); }
    `)}</style>
    <span class="grip" id="grip">⋮⋮</span>
    <div id="list" style="display:contents"></div>
  `;

  constructor() {
    super();
    this._items = [];
    this._onClick = this._onClick.bind(this);
  }

  set items(v) { this._items = Array.isArray(v) ? v : []; this._render(); }
  get items() { return this._items; }

  connectedCallback() {
    const top = this.getAttribute('top'), left = this.getAttribute('left');
    const right = this.getAttribute('right'), bottom = this.getAttribute('bottom');
    if (top) this.style.top = top;
    if (left) this.style.left = left;
    if (right) this.style.right = right;
    if (bottom) this.style.bottom = bottom;
    if (!top && !bottom) this.style.top = '24px';
    if (!left && !right) this.style.left = '50%';

    const sk = this.getAttribute('storage-key');
    const store = sk ? new LocalStore(sk) : null;
    this._detachDrag = makeDraggable(this, this.$('#grip'), {
      initial: () => store?.get('pos', null),
      onEnd: (pos) => store?.set('pos', pos),
    });

    this.$('#list').addEventListener('click', this._onClick);
    this._render();
  }

  disconnectedCallback() {
    this.$('#list')?.removeEventListener('click', this._onClick);
    this._detachDrag?.();
  }

  _render() {
    const list = this.$('#list');
    if (!list) return;
    list.innerHTML = this._items.map((it) => `
      <button class="btn ${it.variant || ''}"
              data-id="${escapeAttr(it.id)}"
              title="${escapeAttr(it.label || it.id)}"
              ${it.disabled ? 'disabled' : ''}>
        ${escapeHtml(it.icon || '·')}
      </button>
    `).join('');
  }

  _onClick(e) {
    const btn = e.target.closest('[data-id]');
    if (!btn || btn.disabled) return;
    const id = btn.dataset.id;
    const item = this._items.find((i) => String(i.id) === id);
    this.emit('dock-action', { id, item });
  }
}

define('bk-dock-bar', BkDockBar);
