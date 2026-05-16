import { BonsaiElement, define, html } from '../internal/base.js';
import { withTokens } from '../internal/tokens.js';

/**
 * <bk-confirm-dialog> + confirm() helper.
 *
 *   import { confirm } from 'bonsai-kit/components/confirm-dialog';
 *   if (await confirm('Delete?', { danger: true })) ...
 */
export class BkConfirmDialog extends BonsaiElement {
  static template = html`
    <style>${withTokens(`
      dialog {
        border: none; padding: 0; background: transparent;
        color: var(--bk-text); font: 12px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;
      }
      dialog::backdrop { background: rgba(0,0,0,.4); backdrop-filter: blur(2px); }
      .box {
        background: var(--bk-bg-elevated);
        border: 1px solid var(--bk-border);
        border-radius: 12px; box-shadow: var(--bk-shadow-lg);
        min-width: 320px; max-width: 440px; padding: 20px;
      }
      .title { font-size: 14px; font-weight: 600; color: var(--bk-text-strong); margin: 0 0 8px; }
      .msg { color: #cbd5e1; margin: 0 0 16px; font-size: 12px; }
      .actions { display: flex; justify-content: flex-end; gap: 8px; }
      .btn { background: rgba(255,255,255,.08); color: #fff; border: none; padding: 6px 14px; border-radius: var(--bk-radius-sm); cursor: pointer; font: inherit; }
      .btn:hover { background: rgba(255,255,255,.16); }
      .btn.primary { background: var(--bk-color-accent); }
      .btn.danger  { background: #dc2626; }
    `)}</style>
    <dialog>
      <div class="box">
        <h3 class="title" id="title"></h3>
        <p class="msg" id="msg"></p>
        <div class="actions">
          <button type="button" class="btn" id="cancel"></button>
          <button type="button" class="btn primary" id="ok"></button>
        </div>
      </div>
    </dialog>
  `;

  open({ title = 'Confirm', message = '', okText = 'OK', cancelText = 'Cancel', danger = false } = {}) {
    const dlg = this.$('dialog');
    this.$('#title').textContent = title;
    this.$('#msg').textContent = message;
    const ok = this.$('#ok'), cancel = this.$('#cancel');
    ok.textContent = okText; cancel.textContent = cancelText;
    ok.classList.toggle('danger', !!danger);
    ok.classList.toggle('primary', !danger);
    return new Promise((resolve) => {
      const cleanup = (v) => {
        ok.removeEventListener('click', onOk);
        cancel.removeEventListener('click', onCancel);
        dlg.removeEventListener('cancel', onCancel);
        dlg.close();
        resolve(v);
      };
      const onOk = () => cleanup(true);
      const onCancel = (e) => { e.preventDefault?.(); cleanup(false); };
      ok.addEventListener('click', onOk);
      cancel.addEventListener('click', onCancel);
      dlg.addEventListener('cancel', onCancel);
      dlg.showModal();
    });
  }
}

define('bk-confirm-dialog', BkConfirmDialog);

let _instance = null;
function ensureInstance() {
  if (_instance && _instance.isConnected) return _instance;
  _instance = document.querySelector('bk-confirm-dialog') || document.createElement('bk-confirm-dialog');
  if (!_instance.isConnected) document.body.appendChild(_instance);
  return _instance;
}
export function confirm(message, opts = {}) {
  return ensureInstance().open({ message, ...opts });
}
