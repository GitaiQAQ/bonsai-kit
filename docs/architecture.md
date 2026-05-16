# Architecture

A high-level look at how bonsai-kit fits together.

```
                    ┌────────────────────────────────────┐
                    │          Public Entry              │
                    │           src/index.js             │
                    │  (re-exports + side-effect import) │
                    └─────────────┬──────────────────────┘
                                  │
        ┌─────────────────────────┼──────────────────────────┐
        │                         │                          │
┌───────▼─────────┐    ┌──────────▼──────────┐    ┌──────────▼─────────┐
│  components/    │    │      sources/       │    │       utils/       │
│  <bk-*>         │    │  data adapters      │    │  helpers           │
│  (UI surface)   │    │  (e.g. VmokSource)  │    │  (LocalStore, …)   │
└───────┬─────────┘    └─────────────────────┘    └────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│           internal/                  │
│  • BonsaiElement (base class)        │
│  • design tokens                     │
│  • html`…` template helper           │
│  • define() (idempotent registration)│
└──────────────────────────────────────┘
```

## Layers

### 1. `internal/` — the base
- **`BonsaiElement`** is the only base class for components. It auto-attaches Shadow DOM, exposes `$()` / `$$()` / `emit()`, and stores a static `template`.
- **Design tokens** (`tokens.js`) are CSS custom properties set on `:host` of every component. Consumers can override globally:

  ```css
  :root { --bk-color-accent: #ec4899; }
  ```

- The **`html\`…\``** tagged template returns a cached `<template>`, parsed once at module load.

### 2. `utils/` — small, isolated helpers
- `LocalStore` and `GMStore` give every component a uniform persistence story driven by a single `storage-key` attribute.
- `makeDraggable` is reused by `<bk-floating-button>` and `<bk-dock-bar>`.

### 3. `sources/` — data adapters
- Sources are framework-free observable-ish objects with `subscribe(fn)` / `start()` / `stop()`.
- Decoupling sources from UI lets you swap polling for SSE / WebSocket later without touching components.

### 4. `components/` — the visible surface
- One file per `<bk-*>` element.
- Style isolated via Shadow DOM; tokens for theming.
- Composite components (e.g. `<bk-vmok-inspector>`) import primitives — never the other way around.

### 5. Entry & registration
- `src/index.js` lists every component between `// @bonsai-components-start` and `// @bonsai-components-end`. The `new:component` generator inserts new entries here.
- Importing the entry triggers side-effect registration. Subpath imports register only what you need.

## Distribution

- **ESM** (`dist/bonsai-kit.esm.min.js`) — modern bundlers
- **UMD** (`dist/bonsai-kit.umd.min.js`) — for `@require` in userscripts
- **IIFE** (`dist/bonsai-kit.iife.min.js`) — drop-in `<script>` tag

All three carry the same auto-registration side effect.

## Why no framework?

Userscripts need to coexist with the host page's existing framework runtime (React, Vue, Angular, jQuery, none). Bringing your own framework means double-loading and risking version skew. Native Web Components:

- Cost zero runtime.
- Are isolated by Shadow DOM.
- Outlive any framework wave.
- Work with `@require` without a build step on the consumer side.
