/**
 * Internal: tiny base class + helpers for all bonsai-kit components.
 *
 * Every component gets:
 *   - Shadow DOM auto-attached
 *   - Template cloning helper
 *   - $() shadow query shorthand
 *   - safe define() registration
 *
 * Keeping this here prevents repeating boilerplate in every component file.
 */

/**
 * Define a custom element only if not already defined (HMR / dual-imports safe).
 */
export function define(name, ctor) {
  if (!customElements.get(name)) customElements.define(name, ctor);
  return ctor;
}

/**
 * Build a <template> from an HTML string once, at module load.
 */
export function html(strings, ...values) {
  const raw = String.raw({ raw: strings }, ...values);
  const tpl = document.createElement('template');
  tpl.innerHTML = raw;
  return tpl;
}

/**
 * Base class with Shadow DOM + template + $/$$ helpers.
 */
export class BonsaiElement extends HTMLElement {
  /** Subclasses must override:  static template = html`...` */
  static template = null;

  constructor() {
    super();
    const tpl = this.constructor.template;
    if (tpl) {
      this.attachShadow({ mode: 'open' }).appendChild(tpl.content.cloneNode(true));
    }
  }

  $(sel) { return this.shadowRoot?.querySelector(sel) ?? null; }
  $$(sel) { return [...(this.shadowRoot?.querySelectorAll(sel) ?? [])]; }

  /** Convenience for emitting bubbling+composed CustomEvents. */
  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, {
      detail, bubbles: true, composed: true,
    }));
  }
}
