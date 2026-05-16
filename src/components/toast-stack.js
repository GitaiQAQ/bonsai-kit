import { BonsaiElement, define, html } from '../internal/base.js';
import { withTokens } from '../internal/tokens.js';

/**
 * <bk-toast-stack> + toast() helper.
 *
 *   import { toast } from 'bonsai-kit/components/toast-stack';
 *   toast('Saved', { type: 'success' });
 */
export class BkToastStack extends BonsaiElement {
  static template = html`
    <style>${withTokens(`
      :host {
        position: fixed; z-index: var(--bk-z-modal);
        display: flex; flex-direction: column; gap: 8px;
        pointer-events: none;
        font: 12px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;
      }
      :host([position="top-right"])    { top: 20px; right: 20px; }
      :host([position="top-left"])     { top: 20px; left: 20px; }
      :host([position="bottom-right"]) { bottom: 20px; right: 20px; flex-direction: column-reverse; }
      :host([position="bottom-left"])  { bottom: 20px; left: 20px; flex-direction: column-reverse; }
      :host([position="top-center"])   { top: 20px; left: 50%; transform: translateX(-50%); align-items: center; }
      .toast {
        pointer-events: auto;
        background: var(--bk-bg-elevated); color: var(--bk-text-strong);
        padding: 10px 14px; border-radius: 8px;
        border: 1px solid var(--bk-border);
        border-left: 3px solid var(--bk-color-accent);
        box-shadow: var(--bk-shadow); backdrop-filter: blur(10px);
        min-width: 200px; max-width: 360px;
        animation: slideIn .25s ease;
      }
      .toast.success { border-left-color: var(--bk-color-success); }
      .toast.warn    { border-left-color: var(--bk-color-warn); }
      .toast.error   { border-left-color: var(--bk-color-danger); }
      .toast.leaving { animation: slideOut .2s ease forwards; }
      @keyframes slideIn  { from { transform: translateX(20px); opacity: 0; } to {} }
      @keyframes slideOut { to { transform: translateX(20px); opacity: 0; } }
    `)}</style>
    <div id="root" style="display:contents"></div>
  `;

  connectedCallback() {
    if (!this.hasAttribute('position')) this.setAttribute('position', 'top-right');
  }

  push(message, opts = {}) {
    const { type = 'info', duration = 3000 } = opts;
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    node.textContent = message;
    this.$('#root').appendChild(node);
    if (duration > 0) {
      setTimeout(() => {
        node.classList.add('leaving');
        node.addEventListener('animationend', () => node.remove(), { once: true });
      }, duration);
    }
    return () => node.remove();
  }
}

define('bk-toast-stack', BkToastStack);

let _instance = null;
function ensureInstance(position) {
  if (_instance && _instance.isConnected) return _instance;
  _instance = document.querySelector('bk-toast-stack') || document.createElement('bk-toast-stack');
  if (position) _instance.setAttribute('position', position);
  if (!_instance.isConnected) document.body.appendChild(_instance);
  return _instance;
}
export function toast(message, opts = {}) {
  return ensureInstance(opts.position).push(message, opts);
}
