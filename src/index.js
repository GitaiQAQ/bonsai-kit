/**
 * bonsai-kit — public entry.
 *
 * Importing this file:
 *   1. Auto-registers all custom elements with the `bk-` prefix
 *   2. Re-exports component classes & helpers for tree-shake friendly access
 *
 * Cherry-pick subpath imports to avoid bundling unused components:
 *   import 'bonsai-kit/components/floating-button';
 *   import { toast } from 'bonsai-kit/components/toast-stack';
 *
 * NOTE: The list below is the single source of truth for components.
 *       The `npm run new:component` generator inserts new entries here.
 */

// ─── components ────────────────────────────────────────────────────────────
// @bonsai-components-start
export { BkResizablePanel } from './components/resizable-panel.js';
export { BkModuleList }     from './components/module-list.js';
export { BkVmokInspector }  from './components/vmok-inspector.js';
export { BkFloatingButton } from './components/floating-button.js';
export { BkDockBar }        from './components/dock-bar.js';
export { BkSettingPanel }   from './components/setting-panel.js';
export { BkTabsView }       from './components/tabs-view.js';
export { BkToastStack, toast }      from './components/toast-stack.js';
export { BkConfirmDialog, confirm } from './components/confirm-dialog.js';

import './components/resizable-panel.js';
import './components/module-list.js';
import './components/vmok-inspector.js';
import './components/floating-button.js';
import './components/dock-bar.js';
import './components/setting-panel.js';
import './components/tabs-view.js';
import './components/toast-stack.js';
import './components/confirm-dialog.js';
// @bonsai-components-end

// ─── sources ───────────────────────────────────────────────────────────────
export { VmokSource } from './sources/vmok-source.js';

// ─── utils ─────────────────────────────────────────────────────────────────
export { LocalStore, GMStore, defaultStore } from './utils/local-store.js';
export { makeDraggable } from './utils/draggable.js';
export { escapeHtml, escapeAttr } from './utils/escape.js';

// ─── internal (advanced; mostly for authors of new components) ─────────────
export { BonsaiElement, define, html } from './internal/base.js';
export { withTokens, tokens } from './internal/tokens.js';

export const VERSION = '0.0.11';
