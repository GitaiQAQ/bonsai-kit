// ==UserScript==
// @name         TTAM Auto Whitelist Inspector
// @namespace    bonsai-kit
// @version      0.0.9
// @description  Inspect __TTAM_1MN_AUTO_WHITELIST_DEBUG__ on any page — powered by bonsai-kit
// @match        *://*/*
// @run-at       document-end
// @require      https://unpkg.com/bonsai-kit/dist/components/bk-resizable-panel.umd.min.js
// @require      https://unpkg.com/bonsai-kit/dist/components/bk-module-list.umd.min.js
// @require      https://unpkg.com/bonsai-kit/dist/components/bk-tabs-view.umd.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  'use strict';

  // ─── Data polling ────────────────────────────────────────────────────────
  // Pivot: tabs = objectives (app, lead, sales), rows = namespaces (ad_vertical_frontends, ads_manager_main)
  function snapshot() {
    const debug = unsafeWindow.__TTAM_1MN_AUTO_WHITELIST_DEBUG__;
    if (!debug || typeof debug !== 'object') return null;

    // Collect all objective names across all namespaces
    const objectiveNames = new Set();
    const namespaces = {};

    for (const [ns, data] of Object.entries(debug)) {
      if (!data || typeof data !== 'object') continue;
      const objectives = data.objectives || {};
      if (typeof objectives !== 'object') continue;
      namespaces[ns] = { source: data.source || '-', objectives };
      for (const name of Object.keys(objectives)) {
        objectiveNames.add(name);
      }
    }

    // Build per-objective data: each objective becomes a tab
    const result = {};
    for (const objName of objectiveNames) {
      const items = [];
      const fieldKeys = new Set();
      for (const [ns, info] of Object.entries(namespaces)) {
        const obj = info.objectives[objName];
        if (!obj || typeof obj !== 'object') continue;
        const item = { name: ns, source: info.source };
        for (const [k, v] of Object.entries(obj)) {
          item[k] = v;
          fieldKeys.add(k);
        }
        items.push(item);
      }
      items.sort((a, b) => a.name.localeCompare(b.name));
      result[objName] = { items, fields: [...fieldKeys] };
    }
    return result;
  }

  // ─── Build UI ────────────────────────────────────────────────────────────
  const panel = document.createElement('bk-resizable-panel');
  panel.setAttribute('title', 'Auto Whitelist');
  panel.setAttribute('storage-key', 'ttam-awl-inspector');
  panel.setAttribute('min-width', '600');
  panel.setAttribute('max-width', '1200');
  panel.setAttribute('top', '80px');
  panel.setAttribute('right', '400px');

  const tabs = document.createElement('bk-tabs-view');
  panel.appendChild(tabs);
  document.body.appendChild(panel);

  const lists = {};
  let lastSig = '';

  function render(data) {
    if (!data) return;
    const sig = JSON.stringify(data);
    if (sig === lastSig) return;
    lastSig = sig;

    const objNames = Object.keys(data).sort();
    const currentTabs = [...tabs.children]
      .map(el => el.dataset.tab)
      .filter(Boolean);

    if (JSON.stringify(currentTabs) !== JSON.stringify(objNames)) {
      tabs.innerHTML = '';
      for (const name of objNames) {
        const tab = document.createElement('div');
        tab.dataset.tab = name;
        tab.dataset.label = name;

        const list = document.createElement('bk-module-list');
        list.empty = 'No namespaces';
        list.loading = 'Loading...';
        tab.appendChild(list);
        tabs.appendChild(tab);

        lists[name] = list;
      }
      if (!tabs.getAttribute('active') && objNames.length) {
        tabs.setAttribute('active', objNames[0]);
      }
    }

    let totalCount = 0;
    for (const [name, info] of Object.entries(data)) {
      if (!lists[name]) continue;
      lists[name].items = info.items;
      lists[name].fields = info.fields.map((k) => ({
        key: k,
        label: k,
        className: k.includes('Enabled') || k.includes('Flag') ? 'version' : k.includes('Block') || k.includes('Allow') ? 'build' : '',
      }));
      totalCount += info.items ? info.items.length : 0;
    }
    panel.setAttribute('badge', `(${totalCount})`);
  }

  // ─── Poll ────────────────────────────────────────────────────────────────
  let timer = null;
  function start() {
    const data = snapshot();
    if (data) render(data);
    timer = setInterval(() => {
      const d = snapshot();
      if (d) render(d);
      else if (!d && lastSig) {
        lastSig = '';
        for (const l of Object.values(lists)) l.items = null;
        panel.setAttribute('badge', '-');
      }
    }, 2000);
  }
  start();
})();
