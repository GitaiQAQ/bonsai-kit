# Contributing to bonsai-kit

Thanks for considering a contribution! This document covers conventions specific to bonsai-kit.

## Setup

```bash
git clone https://github.com/GitaiQAQ/bonsai-kit
cd bonsai-kit
npm install
npm run dev      # starts a static server on http://localhost:5173
npm test         # runs node:test smoke tests
```

## Project conventions

### Tag naming

All custom elements use the **`bk-`** prefix to avoid collisions with host page elements.
Class names are PascalCase with a `Bk` prefix — e.g. `<bk-toast-stack>` ↔ `BkToastStack`.

### Component file structure

Every component file follows the same shape (enforced by `test/structure.test.js`):

```js
import { BonsaiElement, define, html } from '../internal/base.js';
import { withTokens } from '../internal/tokens.js';

export class BkXxx extends BonsaiElement {
  static template = html`
    <style>${withTokens(`
      :host { /* … */ }
    `)}</style>
    <!-- markup -->
  `;

  static get observedAttributes() { return [/* … */]; }

  connectedCallback() { /* setup */ }
  disconnectedCallback() { /* teardown */ }
}

define('bk-xxx', BkXxx);
```

Rules:

1. **Must extend `BonsaiElement`** — gives you Shadow DOM, `$()`, `$$()`, `emit()`.
2. **Must declare `static template = html\`…\``** — parsed once at module load.
3. **Must call `define('bk-…', …)`** at the bottom of the file.
4. **Use design tokens** via `withTokens(...)` so consumers can theme globally.
5. **Detach all listeners in `disconnectedCallback`** — no leaks.

### API surface conventions

| Kind of input | API |
|---|---|
| Booleans, strings, numbers | **Attributes** (reflected, observable) |
| Arrays, functions, complex objects | **Properties** (set via JS) |
| Side-effect operations (open, refresh) | **Methods** |
| State changes & user actions | `CustomEvent`s with `detail` |

### Persistence

Use `LocalStore` (or `GMStore` for userscripts). Activate with a single `storage-key` attribute:

```js
const sk = this.getAttribute('storage-key');
this._store = sk ? new LocalStore(sk) : null;
```

### Events

Use `this.emit('event-name', detail)` — already bubbles & composes through Shadow DOM.
Event names should be **kebab-case** and should not include the component prefix
(e.g. `panel-toggle`, not `bk-panel-toggle`).

## Adding a component

```bash
npm run new:component <kebab-name>
# e.g. npm run new:component json-viewer
```

The generator creates:

- `src/components/<name>.js` from `templates/component/component.tpl.js`
- `test/<name>.test.js` from the test template
- Adds export + import to `src/index.js` (between the marker comments)

Then:

1. Implement the component
2. Run `npm test`
3. Run `npm run lint`
4. Add a [changeset](https://github.com/changesets/changesets): `npx changeset`
5. Open a PR

## Releasing

We use [Changesets](https://github.com/changesets/changesets):

```bash
npx changeset            # add a changeset (run after each PR)
npm run version          # bump versions & generate CHANGELOG
npm run release          # publish to npm
```

CI handles publishing on `main` once a release PR is merged.

## Testing strategy

- `test/structure.test.js` ensures every component file follows the conventions above.
- Per-component tests live in `test/<name>.test.js`. For real DOM behavior, run them under [`@web/test-runner`](https://modern-web.dev/docs/test-runner/overview/) (planned).

## Code style

- Prettier (see `.prettierrc.json`)
- ESLint (see `eslint.config.js`)

```bash
npm run lint
npm run format
```

## License

By contributing you agree your code will be released under the MIT License.
