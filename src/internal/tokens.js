/**
 * Shared design tokens — used by component CSS via CSS custom properties.
 * Consumers can override any token globally:
 *
 *   :root { --bk-color-accent: #ec4899; }
 */
export const tokens = `
  --bk-bg:           rgba(16,18,27,.92);
  --bk-bg-elevated:  rgba(16,18,27,.96);
  --bk-border:       rgba(255,255,255,.12);
  --bk-border-soft:  rgba(255,255,255,.06);
  --bk-text:         #e8eefc;
  --bk-text-dim:     #94a3b8;
  --bk-text-strong:  #ffffff;
  --bk-color-accent: #6366f1;
  --bk-color-accent-2: #8b5cf6;
  --bk-color-success:#4ade80;
  --bk-color-warn:   #facc15;
  --bk-color-danger: #ef4444;
  --bk-radius:       10px;
  --bk-radius-sm:    6px;
  --bk-shadow:       0 8px 25px rgba(0,0,0,.3);
  --bk-shadow-lg:    0 12px 40px rgba(0,0,0,.5);
  --bk-blur:         12px;
  --bk-font:         11px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  --bk-z-overlay:    2147483646;
  --bk-z-modal:      2147483647;
`;

/** Wrap component-local CSS so it has access to tokens via :host. */
export function withTokens(css) {
  return `:host { ${tokens} } ${css}`;
}
