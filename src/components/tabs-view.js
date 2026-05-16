import { BonsaiElement, define, html } from '../internal/base.js';
import { withTokens } from '../internal/tokens.js';

/**
 * <bk-tabs-view>
 *
 * Slot-based tab container. Children with [data-tab] are panels.
 *   <bk-tabs-view active="logs">
 *     <div data-tab="modules" data-label="Modules">...</div>
 *     <div data-tab="logs" data-label="Logs">...</div>
 *   </bk-tabs-view>
 */
export class BkTabsView extends BonsaiElement {
  static template = html`
    <style>${withTokens(`
      :host { display: flex; flex-direction: column; color: var(--bk-text); font: 11px/1.4 -apple-system,Segoe UI,Roboto,sans-serif; }
      .nav { display: flex; gap: 2px; border-bottom: 1px solid rgba(255,255,255,.08); margin-bottom: 8px; }
      .tab { background: none; border: none; color: var(--bk-text-dim); padding: 6px 10px; cursor: pointer; font: inherit; border-bottom: 2px solid transparent; transition: color .15s, border-color .15s; }
      .tab:hover { color: #cbd5e1; }
      .tab.active { color: #fff; border-bottom-color: var(--bk-color-accent); }
      .body { flex: 1; min-height: 0; }
      ::slotted([data-tab]) { display: none; }
      ::slotted([data-tab].active) { display: block; }
    `)}</style>
    <div class="nav" id="nav"></div>
    <div class="body"><slot></slot></div>
  `;

  static get observedAttributes() { return ['active']; }

  connectedCallback() {
    this.$('slot').addEventListener('slotchange', () => this._sync());
    this.$('#nav').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-id]');
      if (!btn) return;
      const id = btn.dataset.id;
      if (this.getAttribute('active') === id) return;
      this.setAttribute('active', id);
      this.emit('tab-change', { tab: id });
    });
    this._sync();
  }

  attributeChangedCallback() { this._sync(); }

  get tabs() { return [...this.children].filter((el) => el.dataset.tab); }

  _sync() {
    const tabs = this.tabs;
    const active = this.getAttribute('active') || tabs[0]?.dataset.tab;
    const nav = this.$('#nav');
    if (!nav) return;
    nav.innerHTML = tabs.map((t) =>
      `<button class="tab ${t.dataset.tab === active ? 'active' : ''}" data-id="${t.dataset.tab}">${t.dataset.label || t.dataset.tab}</button>`
    ).join('');
    for (const t of tabs) t.classList.toggle('active', t.dataset.tab === active);
  }
}

define('bk-tabs-view', BkTabsView);
