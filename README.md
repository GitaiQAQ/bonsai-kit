# 🌳 bonsai-kit

> Cultivate small, beautiful UI inside someone else's webpage.

A standard Web Components UI kit for **userscript authors** — Shadow-DOM-isolated, zero-dependency primitives (floating panels, FABs, dock bars, settings, toasts, dialogs) that work safely inside any host page.

[![npm](https://img.shields.io/npm/v/bonsai-kit.svg)](https://www.npmjs.com/package/bonsai-kit) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Why bonsai-kit?

Userscript authors face a unique constraint: their UI lives inside **someone else's page**. Like a bonsai tree thriving in a borrowed garden, your scripts deserve UI that's:

- ✅ **Style-isolated** — Shadow DOM means host page CSS can't break your widgets
- ✅ **Drop-in** — Each component is a single `<bk-*>` tag; no framework runtime needed
- ✅ **`@require`-friendly** — One-line UMD bundle for Tampermonkey / Violentmonkey / Greasemonkey
- ✅ **Persistence opt-in** — Add `storage-key="x"` and the component remembers its state
- ✅ **GM-aware** — `GMStore` adapter for `GM_setValue` / `GM_getValue` if you need it
- ✅ **Composable** — Tabs holding settings holding tags holding toasts; mix and match freely
- ✅ **Tree-shake friendly** — Cherry-pick subpath imports; nothing you don't use ships

## Components

| Tag | Purpose |
|---|---|
| `<bk-resizable-panel>` | Floating, collapsible, resizable container |
| `<bk-module-list>` | Field-driven module list |
| `<bk-vmok-inspector>` | Composite — VMOK polling + list + panel |
| `<bk-floating-button>` | Draggable FAB |
| `<bk-dock-bar>` | Multi-button floating toolbar |
| `<bk-setting-panel>` | Schema-driven settings form |
| `<bk-tabs-view>` | Lightweight tab container |
| `<bk-toast-stack>` + `toast()` | Notification stack |
| `<bk-confirm-dialog>` + `confirm()` | Modal confirmation |

Plus utilities: `VmokSource`, `LocalStore`, `GMStore`, `makeDraggable`, and the base class `BonsaiElement` for authoring new components.

See [`docs/components.md`](docs/components.md) for full API references.

## Install

### npm

```bash
npm install bonsai-kit
```

```js
import 'bonsai-kit'; // auto-registers all <bk-*> elements
```

Or cherry-pick subpaths:

```js
import 'bonsai-kit/components/floating-button';
import { toast } from 'bonsai-kit/components/toast-stack';
```

### Userscript / `@require`

```js
// @require https://cdn.jsdelivr.net/npm/bonsai-kit@latest/dist/bonsai-kit.umd.min.js
```

After `@require`, every component is registered, and helpers are exposed on `window.BonsaiKit`.

## Quick start

```html
<bk-floating-button icon="🌳" storage-key="my-fab"></bk-floating-button>
<bk-resizable-panel id="p" title="Hello" storage-key="my-panel" collapsed>
  <bk-setting-panel id="s" storage-key="my-settings"></bk-setting-panel>
</bk-resizable-panel>

<script type="module">
  import 'bonsai-kit';
  const p = document.getElementById('p');
  document.querySelector('bk-floating-button')
    .addEventListener('fab-click', () => p.toggleAttribute('collapsed'));

  document.getElementById('s').schema = [
    { key: 'enabled',  label: 'Enabled', type: 'switch', default: true },
    { key: 'env',      label: 'Env',     type: 'select',
      options: [{ label: 'PPE', value: 'ppe' }, { label: 'PROD', value: 'prod' }] },
  ];
</script>
```

## Project layout

```
bonsai-kit/
├── src/
│   ├── components/        # one file per <bk-*> element
│   ├── sources/           # data adapters (VmokSource, …)
│   ├── utils/             # LocalStore, GMStore, makeDraggable, escape
│   ├── internal/          # BonsaiElement base class, design tokens
│   └── index.js           # public entry & auto-registration
├── templates/component/   # scaffold template for `npm run new:component`
├── examples/              # browser demos & userscript template
├── scripts/               # build, dev server, generator
├── test/                  # node:test smoke tests
├── docs/                  # docs site source
└── dist/                  # build output (gitignored)
```

## Adding a new component

```bash
npm run new:component json-viewer
```

This will:

1. Create `src/components/json-viewer.js` from the template
2. Create `test/json-viewer.test.js`
3. Auto-insert export & side-effect import into `src/index.js`

Then implement, test, and add a changeset:

```bash
npm test
npx changeset
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for full conventions.

## License

MIT © bonsai-kit contributors
