import { BonsaiElement, define, html } from '../internal/base.js';
import { withTokens } from '../internal/tokens.js';

/**
 * <__TAG__>
 *
 * TODO: Describe what this component does.
 *
 * Attributes:
 *   - example   : description
 *
 * Properties:
 *   - data : any
 *
 * Slots:
 *   - default
 *
 * Events:
 *   - __KEBAB__-change : detail = { value }
 */
export class __CLASS__ extends BonsaiElement {
  static template = html`
    <style>${withTokens(`
      :host {
        display: block;
        color: var(--bk-text);
        font: var(--bk-font);
      }
      .root { padding: 8px; }
    `)}</style>
    <div class="root" part="root">
      <slot></slot>
    </div>
  `;

  static get observedAttributes() { return ['example']; }

  // ── Public properties ────────────────────────────────────────────────
  set data(v) { this._data = v; this._render(); }
  get data() { return this._data; }

  // ── Lifecycle ────────────────────────────────────────────────────────
  connectedCallback() {
    this._render();
  }

  attributeChangedCallback(/* name, _old, _new */) {
    this._render();
  }

  // ── Private ──────────────────────────────────────────────────────────
  _render() {
    // TODO: render based on this.attributes / this._data
  }
}

define('__TAG__', __CLASS__);
