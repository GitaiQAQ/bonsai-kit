// ==UserScript==
// @name         Devtools
// @namespace    bonsai-kit
// @version      0.0.3
// @description  Full devtools panel — FAB, dock bar, VMOK inspector, settings, toasts — powered by bonsai-kit
// @match        *://*/*
// @run-at       document-end
// @require      https://unpkg.com/bonsai-kit/dist/bonsai-kit.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  'use strict';

  const { toast, confirm } = window.BonsaiKit;

  // 1) FAB
  const fab = document.createElement('bk-floating-button');
  fab.setAttribute('icon', '⚙');
  fab.setAttribute('label', 'Devtools');
  fab.setAttribute('storage-key', 'devtools-fab');
  document.body.appendChild(fab);

  // 2) Dock bar
  const dock = document.createElement('bk-dock-bar');
  dock.setAttribute('storage-key', 'devtools-dock');
  dock.items = [
    { id: 'refresh', icon: '⟳', label: 'Refresh' },
    { id: 'toast',   icon: '💬', label: 'Toast' },
  ];
  dock.addEventListener('dock-action', (e) => {
    if (e.detail.id === 'refresh') toast('Refreshed', { type: 'success' });
    if (e.detail.id === 'toast')   toast('Hello from bonsai-kit!', { type: 'info' });
  });
  document.body.appendChild(dock);

  // 3) Main panel
  const panel = document.createElement('bk-resizable-panel');
  panel.setAttribute('title', 'Devtools');
  panel.setAttribute('storage-key', 'devtools-panel');
  panel.setAttribute('collapsed', '');

  // 3a) Tabs
  const tabs = document.createElement('bk-tabs-view');
  tabs.setAttribute('active', 'modules');

  // Modules tab
  const modulesTab = document.createElement('div');
  modulesTab.dataset.tab = 'modules';
  modulesTab.dataset.label = 'Modules';
  const inspector = document.createElement('bk-vmok-inspector');
  inspector.setAttribute('storage-key', 'devtools-vmok');
  inspector.style.display = 'contents';
  modulesTab.appendChild(inspector);
  tabs.appendChild(modulesTab);

  // Settings tab
  const settingsTab = document.createElement('div');
  settingsTab.dataset.tab = 'settings';
  settingsTab.dataset.label = 'Settings';
  const settings = document.createElement('bk-setting-panel');
  settings.setAttribute('storage-key', 'devtools-settings');
  settings.schema = [
    { group: 'Display', key: 'theme', label: 'Theme', type: 'select',
      options: [{ label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }], default: 'dark' },
    { group: 'Display', key: 'compact', label: 'Compact mode', type: 'switch', default: true },
    { group: 'VMOK', key: 'interval', label: 'Poll interval (ms)', type: 'number', default: 1500 },
  ];
  settingsTab.appendChild(settings);
  tabs.appendChild(settingsTab);

  panel.appendChild(tabs);
  document.body.appendChild(panel);

  // FAB toggles panel
  fab.addEventListener('fab-click', () => panel.toggleAttribute('collapsed'));

  // Ready
  setTimeout(() => toast('Devtools ready', { type: 'success' }), 300);
})();
