#!/usr/bin/env node
/**
 * Component generator — `npm run new:component <kebab-name>`
 *
 *   npm run new:component json-viewer
 *
 * Effects:
 *   1. Copies templates/component/* into src/components/<name>.js (single file)
 *   2. Adds the <name>.test.js stub
 *   3. Inserts export + side-effect import lines into src/index.js between
 *      `// @bonsai-components-start` and `// @bonsai-components-end`
 *
 * Stays in pure ESM Node, zero deps.
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: npm run new:component <kebab-name>\nExample: npm run new:component json-viewer');
  process.exit(1);
}
const kebab = arg.trim().toLowerCase();
if (!/^[a-z][a-z0-9-]*$/.test(kebab)) {
  console.error('Component name must be lowercase kebab-case, e.g. json-viewer');
  process.exit(1);
}

// Bk + PascalCase
const className = 'Bk' + kebab.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
const tagName = `bk-${kebab}`;

const componentPath = resolve(root, 'src/components', `${kebab}.js`);
const testPath      = resolve(root, 'test', `${kebab}.test.js`);
const indexPath     = resolve(root, 'src/index.js');

// Refuse if the file exists
try {
  await access(componentPath);
  console.error(`✗ ${componentPath} already exists — aborting.`);
  process.exit(1);
} catch {}

// Read templates
const tpl = await readFile(resolve(root, 'templates/component/component.tpl.js'), 'utf8');
const testTpl = await readFile(resolve(root, 'templates/component/component.test.tpl.js'), 'utf8');

const replace = (s) => s
  .replaceAll('__TAG__', tagName)
  .replaceAll('__CLASS__', className)
  .replaceAll('__KEBAB__', kebab);

await writeFile(componentPath, replace(tpl), 'utf8');
await writeFile(testPath, replace(testTpl), 'utf8');

// Inject into index.js
let idx = await readFile(indexPath, 'utf8');
const startMark = '// @bonsai-components-start';
const endMark   = '// @bonsai-components-end';
const startIdx = idx.indexOf(startMark);
const endIdx   = idx.indexOf(endMark);
if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find component markers in src/index.js — please insert manually.');
  process.exit(0);
}

const exportLine  = `export { ${className} } from './components/${kebab}.js';\n`;
const importLine  = `import './components/${kebab}.js';\n`;

// Insert export right after start marker (before the import block)
const block = idx.slice(startIdx, endIdx);
const importBlockStart = block.indexOf("\nimport './components/");
const insertExportAt = startIdx + (importBlockStart === -1 ? block.length : importBlockStart);
idx = idx.slice(0, insertExportAt) + '\n' + exportLine + idx.slice(insertExportAt);

// Insert import right before end marker
const newEndIdx = idx.indexOf(endMark);
idx = idx.slice(0, newEndIdx) + importLine + idx.slice(newEndIdx);

await writeFile(indexPath, idx, 'utf8');

console.log(`
✓ Component scaffolded:
   src/components/${kebab}.js
   test/${kebab}.test.js
✓ src/index.js updated
   <${tagName}> registered, exports added.

Next steps:
   1. Implement the component in src/components/${kebab}.js
   2. Run tests:   npm test
   3. Add a changeset: npx changeset
`);
