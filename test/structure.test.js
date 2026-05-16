import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Smoke test — verifies that the public surface parses without error
 * by reading source files. Real component tests should run in a
 * browser / jsdom environment (see CONTRIBUTING.md).
 */
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

test('every component file follows the bonsai conventions', async () => {
  const dir = resolve(root, 'src/components');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.js'));
  assert.ok(files.length > 0, 'should have at least one component');

  for (const f of files) {
    const src = await readFile(resolve(dir, f), 'utf8');
    // 1. must define a custom element with bk- prefix
    const m = src.match(/define\(\s*['"](bk-[a-z0-9-]+)['"]/);
    assert.ok(m, `${f} must call define('bk-…', …)`);
    // 2. must extend BonsaiElement
    assert.ok(/extends\s+BonsaiElement/.test(src),
      `${f} must extend BonsaiElement`);
    // 3. must have a static template
    assert.ok(/static\s+template\s*=\s*html`/.test(src),
      `${f} must declare a static template`);
  }
});

test('index.js re-exports every component file', async () => {
  const dir = resolve(root, 'src/components');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.js'));
  const indexSrc = await readFile(resolve(root, 'src/index.js'), 'utf8');
  for (const f of files) {
    const path = `./components/${f}`;
    assert.ok(indexSrc.includes(path),
      `src/index.js must import ${path}`);
  }
});
