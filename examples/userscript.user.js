// ==UserScript==
// @name         bonsai-kit · userscript template
// @namespace    https://github.com/GitaiQAQ/bonsai-kit
// @version      0.0.3
// @description  Reference template: build a userscript UI with bonsai-kit Web Components.
// @match        *://*/*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @require      https://unpkg.com/bonsai-kit/dist/components/bk-floating-button.umd.min.js
// @require      https://unpkg.com/bonsai-kit/dist/components/bk-resizable-panel.umd.min.js
// @require      https://unpkg.com/bonsai-kit/dist/components/bk-setting-panel.umd.min.js
// @require      https://unpkg.com/bonsai-kit/dist/components/bk-toast-stack.umd.min.js
// @require      https://unpkg.com/bonsai-kit/dist/components/bk-confirm-dialog.umd.min.js
// ==/UserScript==

(function () {
  'use strict';
  // After @require, components are auto-registered and helpers are on `window.BonsaiKit`.
  const { toast, confirm } = window.BonsaiKit;

  // 1) FAB
  const fab = document.createElement('bk-floating-button');
  fab.setAttribute('icon', '🌳');
  fab.setAttribute('label', 'My userscript');
  fab.setAttribute('storage-key', 'my-userscript-fab');
  document.body.appendChild(fab);

  // 2) Panel triggered by FAB
  const panel = document.createElement('bk-resizable-panel');
  panel.setAttribute('title', 'My Userscript');
  panel.setAttribute('storage-key', 'my-userscript-panel');
  panel.setAttribute('collapsed', '');

  const settings = document.createElement('bk-setting-panel');
  settings.setAttribute('storage-key', 'my-userscript-settings');
  settings.schema = [
    { key: 'enabled',   label: 'Enabled', type: 'switch', default: true },
    { key: 'apiHost',   label: 'API host', type: 'text', default: 'https://api.example.com' },
    { key: 'verbosity', label: 'Verbosity', type: 'select',
      options: [
        { label: 'Silent', value: 'silent' },
        { label: 'Info',   value: 'info'   },
        { label: 'Debug',  value: 'debug'  },
      ], default: 'info' },
  ];
  settings.addEventListener('setting-change', (e) => {
    console.log('[settings]', e.detail);
  });

  panel.appendChild(settings);
  document.body.appendChild(panel);

  fab.addEventListener('fab-click', () => panel.toggleAttribute('collapsed'));

  // 3) Greet
  setTimeout(() => toast('bonsai-kit ready 🌳', { type: 'success' }), 300);

  // 4) Example destructive action
  document.addEventListener('keydown', async (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'X') {
      if (await confirm('Reset all script settings?', { danger: true })) {
        localStorage.clear();
        toast('Cleared');
      }
    }
  });
})();
