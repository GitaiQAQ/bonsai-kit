import { BonsaiElement, define, html } from '../internal/base.js';
import { withTokens } from '../internal/tokens.js';
import { makeDraggable } from '../utils/draggable.js';
import { LocalStore } from '../utils/local-store.js';

/**
 * <bk-floating-button> — Draggable FAB.
 * Attributes: icon, label, storage-key, size, variant, top/left/right/bottom, draggable
 * Events: fab-click, fab-move
 */
export class BkFloatingButton extends BonsaiElement {
  static template = html`
    <style>${withTokens(`
      :host {
        position: fixed; z-index: var(--bk-z-overlay);
        width: var(--fab-size, 44px); height: var(--fab-size, 44px);
        border-radius: 50%;
        display: inline-flex; align-items: center; justify-content: center;
        cursor: grab; user-select: none; color: #fff;
        font: 600 16px/1 -apple-system,Segoe UI,Roboto,sans-serif;
        box-shadow: 0 6px 18px rgba(0,0,0,.25);
        transition: transform .15s, box-shadow .15s, opacity .15s;
        background: linear-gradient(135deg, var(--bk-color-accent), var(--bk-color-accent-2));
        opacity: .9;
      }
      :host(:hover) { opacity: 1; transform: scale(1.05); }
      :host(:active) { cursor: grabbing; }
      :host([variant="ghost"])  { background: var(--bk-bg); border: 1px solid var(--bk-border); backdrop-filter: blur(8px); }
      :host([variant="danger"]) { background: linear-gradient(135deg, var(--bk-color-danger), #dc2626); }
      .icon { pointer-events: none; }
    `)}</style>
    <span class="icon" id="icon"></span>
    <slot></slot>
  `;

  static get observedAttributes() { return ['icon', 'label', 'size']; }

  connectedCallback() {
    const top = this.getAttribute('top'), left = this.getAttribute('left');
    const right = this.getAttribute('right'), bottom = this.getAttribute('bottom');
    if (top) this.style.top = top;
    if (left) this.style.left = left;
    if (right) this.style.right = right;
    if (bottom) this.style.bottom = bottom;
    if (!top && !bottom) this.style.bottom = '24px';
    if (!left && !right) this.style.right = '24px';

    this._sync();

    const sk = this.getAttribute('storage-key');
    const store = sk ? new LocalStore(sk) : null;
    if (this.getAttribute('draggable') !== 'false') {
      this._detachDrag = makeDraggable(this, this, {
        initial: () => store?.get('pos', null),
        onEnd: (pos) => {
          store?.set('pos', pos);
          this.emit('fab-move', pos);
        },
      });
    }
    this.addEventListener('click', (e) => this.emit('fab-click', { originalEvent: e }));
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');
  }

  disconnectedCallback() { this._detachDrag?.(); }
  attributeChangedCallback() { this._sync(); }
  _sync() {
    const iconEl = this.$('#icon');
    if (iconEl) iconEl.textContent = this.getAttribute('icon') || '✦';
    const s = this.getAttribute('size');
    if (s) this.style.setProperty('--fab-size', `${parseInt(s, 10)}px`);
    const l = this.getAttribute('label') || '';
    this.title = l;
    this.setAttribute('aria-label', l);
  }
}

define('bk-floating-button', BkFloatingButton);
