import { BonsaiElement, define, html } from '../internal/base.js';
import { withTokens } from '../internal/tokens.js';
import { LocalStore } from '../utils/local-store.js';
import { makeDraggable } from '../utils/draggable.js';

/**
 * <bk-resizable-panel>
 *
 * Floating, collapsible, horizontally-resizable panel.
 *
 * Attributes: title, badge, collapsed, storage-key, min-width, max-width, top, right
 * Slots:      default, actions
 * Events:     panel-toggle, panel-resize
 */
export class BkResizablePanel extends BonsaiElement {
  static template = html`
    <style>${withTokens(`
      :host {
        position: fixed;
        top: var(--rp-top, 100px);
        right: var(--rp-right, 50px);
        width: var(--rp-width, 500px);
        max-height: 60vh;
        z-index: var(--bk-z-overlay);
        background: var(--bk-bg);
        backdrop-filter: blur(var(--bk-blur));
        color: var(--bk-text);
        border: 1px solid var(--bk-border);
        border-radius: var(--bk-radius);
        box-shadow: var(--bk-shadow);
        font: var(--bk-font);
        overflow: hidden;
        transition: width .2s, height .2s, opacity .2s;
        opacity: .75;
        display: block; box-sizing: border-box;
      }
      :host(:hover) { opacity: 1; }
      :host([collapsed]) { width: 22px !important; height: 22px; opacity: .9; }
      .resize-handle {
        position: absolute; right: -4px; top: 0; bottom: 0;
        width: 8px; cursor: col-resize; z-index: 1; background: transparent;
      }
      :host([collapsed]) .resize-handle { display: none; }
      :host(:not([collapsed])) .resize-handle:hover { background: rgba(147,51,234,.3); }
      .head {
        display: flex; justify-content: space-between; align-items: center;
        padding: 8px 12px; background: rgba(255,255,255,.04);
        border-bottom: 1px solid var(--bk-border-soft);
        cursor: pointer; user-select: none;
      }
      :host([collapsed]) .head-info { display: none; }
      .title { font-weight: 600; font-size: 12px; }
      .badge { color: #9fd3ff; font-size: 11px; margin-left: 6px; }
      .toggle {
        width: 20px; height: 20px; border: none;
        background: rgba(255,255,255,.1); border-radius: 50%; cursor: pointer;
        color: #fff; font-size: 10px;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      :host([collapsed]) .toggle::after { content: '▾'; }
      :host(:not([collapsed])) .toggle::after { content: '▸'; }
      .body { padding: 12px; overflow: auto; max-height: calc(60vh - 50px); }
      :host([collapsed]) .body { display: none; }
      ::slotted([slot="actions"]) { display: inline-flex; gap: 4px; margin-left: 6px; }
    `)}</style>
    <div class="head" part="head">
      <div class="head-info">
        <span class="title" id="title"></span>
        <span class="badge" id="badge"></span>
        <slot name="actions"></slot>
      </div>
      <button class="toggle" type="button" aria-label="toggle"></button>
    </div>
    <div class="body" part="body"><slot></slot></div>
    <div class="resize-handle" part="resize-handle"></div>
  `;

  static get observedAttributes() { return ['title', 'badge', 'collapsed']; }

  constructor() {
    super();
    this._onHeadClick = this._onHeadClick.bind(this);
    this._onResizeStart = this._onResizeStart.bind(this);
    this._onResizeMove = this._onResizeMove.bind(this);
    this._onResizeEnd = this._onResizeEnd.bind(this);
    this._detachDrag = null;
  }

  connectedCallback() {
    const sk = this.getAttribute('storage-key');
    this._store = sk ? new LocalStore(sk) : null;
    if (this._store) {
      if (this._store.get('collapsed') === true) this.setAttribute('collapsed', '');
      const w = this._store.get('width');
      if (w) this.style.setProperty('--rp-width', w);
    }
    const top = this.getAttribute('top'), right = this.getAttribute('right');
    if (top) this.style.setProperty('--rp-top', top);
    if (right) this.style.setProperty('--rp-right', right);

    this.$('.head').addEventListener('click', this._onHeadClick);
    this.$('.resize-handle').addEventListener('mousedown', this._onResizeStart);

    // Drag-to-move via head
    this._detachDrag = makeDraggable(this, this.$('.head'), {
      initial: () => this._store?.get('pos') || null,
      onEnd: (pos) => this._store?.set('pos', pos),
    });

    this._sync();
  }

  disconnectedCallback() {
    this.$('.head')?.removeEventListener('click', this._onHeadClick);
    this.$('.resize-handle')?.removeEventListener('mousedown', this._onResizeStart);
    this._detachDrag?.();
    window.removeEventListener('mousemove', this._onResizeMove);
    window.removeEventListener('mouseup', this._onResizeEnd);
  }

  attributeChangedCallback() { this._sync(); }
  _sync() {
    const t = this.$('#title'); if (t) t.textContent = this.getAttribute('title') || '';
    const b = this.$('#badge'); if (b) b.textContent = this.getAttribute('badge') || '';
  }

  toggle(force) {
    const next = typeof force === 'boolean' ? force : !this.hasAttribute('collapsed');
    this.toggleAttribute('collapsed', next);
    this._store?.set('collapsed', next);
    this.emit('panel-toggle', { collapsed: next });
  }

  _onHeadClick(e) {
    if (e.target.closest('[slot="actions"]')) return;
    this.toggle();
  }
  _onResizeStart(e) {
    if (this.hasAttribute('collapsed')) return;
    this._isResizing = true;
    this._startX = e.clientX;
    this._startWidth = parseInt(getComputedStyle(this).width, 10);
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', this._onResizeMove);
    window.addEventListener('mouseup', this._onResizeEnd);
    e.preventDefault();
  }
  _onResizeMove(e) {
    if (!this._isResizing) return;
    const min = parseInt(this.getAttribute('min-width') || '280', 10);
    const max = parseInt(this.getAttribute('max-width') || '600', 10);
    const w = Math.max(min, Math.min(max, this._startWidth + (e.clientX - this._startX)));
    this.style.setProperty('--rp-width', `${w}px`);
  }
  _onResizeEnd() {
    if (!this._isResizing) return;
    this._isResizing = false;
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', this._onResizeMove);
    window.removeEventListener('mouseup', this._onResizeEnd);
    const w = getComputedStyle(this).width;
    this._store?.set('width', w);
    this.emit('panel-resize', { width: w });
  }
}

define('bk-resizable-panel', BkResizablePanel);
