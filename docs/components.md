# Components reference

All components are registered with the `bk-` prefix. Import the entire kit with:

```js
import 'bonsai-kit';
```

or cherry-pick individual components:

```js
import 'bonsai-kit/components/floating-button';
```

---

## `<bk-resizable-panel>`

Floating, collapsible, horizontally-resizable panel.

**Attributes**
| Attr | Type | Default | Description |
|---|---|---|---|
| `title` | string | — | Header title |
| `badge` | string | — | Right-of-title badge text |
| `collapsed` | boolean | false | Initial state |
| `storage-key` | string | — | Persists `collapsed` + `width` |
| `min-width` / `max-width` | number | 280 / 600 | Resize bounds |
| `top` / `right` | css | 100px / 50px | Initial position |

**Slots**: `default`, `actions`
**Events**: `panel-toggle`, `panel-resize`
**Methods**: `toggle(force?: boolean)`

---

## `<bk-module-list>`

Generic field-driven module list.

**Properties**
- `items: Array<{ name, [field]: any }> | null`
- `fields: Array<{ key, className? }>`
- `filter: (name: string) => boolean | null`
- `empty: string`, `loading: string`

**Computed**: `visibleCount`

---

## `<bk-vmok-inspector>`

Composite shell that polls `window.__VMOK__` and renders modules into a panel.

**Attributes**: `panel-title`, `storage-key`, `interval`
**Properties**: `filters: string[]`, `fields: Array<{ key, className? }>`

---

## `<bk-floating-button>`

Draggable FAB.

**Attributes**: `icon`, `label`, `size`, `variant` (`primary` | `ghost` | `danger`),
`top`/`left`/`right`/`bottom`, `storage-key`, `draggable`
**Events**: `fab-click`, `fab-move`

---

## `<bk-dock-bar>`

Multi-button floating toolbar.

**Properties**: `items: Array<{ id, icon, label?, variant?, disabled? }>`
**Attributes**: `orientation` (`horizontal` | `vertical`), position attrs, `storage-key`
**Events**: `dock-action` → detail = `{ id, item }`

---

## `<bk-setting-panel>`

Schema-driven settings form.

**Properties**
- `schema: Array<Field>` where `Field = { key, label, type, default?, options?, placeholder?, help?, group? }`
- `values: Record<string, any>` — controlled values

**Field types**: `switch`, `text`, `number`, `select`, `textarea`, `tags`
**Attributes**: `storage-key`
**Events**: `setting-change`, `setting-reset`

---

## `<bk-tabs-view>`

Slot-based tab container.

```html
<bk-tabs-view active="logs">
  <div data-tab="modules" data-label="Modules">…</div>
  <div data-tab="logs"    data-label="Logs">…</div>
</bk-tabs-view>
```

**Attribute**: `active` (string id)
**Events**: `tab-change`

---

## `<bk-toast-stack>` + `toast()`

```js
import { toast } from 'bonsai-kit/components/toast-stack';
toast('Saved', { type: 'success', duration: 2000 });
```

`toast(message, { type, duration, position })`
- `type`: `info` | `success` | `warn` | `error`
- `position`: `top-right` (default) | `top-left` | `bottom-right` | `bottom-left` | `top-center`

---

## `<bk-confirm-dialog>` + `confirm()`

```js
import { confirm } from 'bonsai-kit/components/confirm-dialog';
const ok = await confirm('Delete this?', { danger: true });
```

`confirm(message, { title, okText, cancelText, danger })`

---

## Utilities

### `LocalStore` / `GMStore`

```js
import { LocalStore, GMStore } from 'bonsai-kit/utils/local-store';
const store = new LocalStore('my-script');     // localStorage backend
const gms   = new GMStore('my-script');        // GM_setValue if available
store.set('width', 320);
store.get('width', 280); // default 280
```

### `makeDraggable(host, handle, opts)`

Attach drag-to-move to any fixed-position element. Used internally by FAB and DockBar.

### `VmokSource`

```js
import { VmokSource } from 'bonsai-kit/sources/vmok-source';
const src = new VmokSource({ interval: 1500, fields: ['version'] });
src.subscribe((items) => console.log(items));
src.start();
```

### `BonsaiElement` / `define` / `html` / `withTokens`

Internal base utilities for authoring **new components**. See [CONTRIBUTING.md](../CONTRIBUTING.md).
