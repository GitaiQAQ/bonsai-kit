#!/usr/bin/env node
/**
 * Build script — produces:
 *
 * Full bundle:
 *   dist/bonsai-kit.esm.min.js        (ESM, minified)
 *   dist/bonsai-kit.iife.min.js       (IIFE, minified)
 *   dist/bonsai-kit.umd.min.js        (UMD, minified)
 *   dist/bonsai-kit.user.js           (IIFE, unminified, for @require)
 *
 * Per-component UMD (minified, standard Web Component builds):
 *   dist/components/bk-*.umd.min.js   (one per component, self-contained)
 *
 * Uses esbuild.
 */
import { build } from 'esbuild';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const entry = resolve(root, 'src/index.js');
const outDir = resolve(root, 'dist');

await mkdir(outDir, { recursive: true });

const banner = `/*! bonsai-kit | MIT | https://github.com/GitaiQAQ/bonsai-kit */`;

// ─── Full bundle builds ────────────────────────────────────────────────────
const targets = [
  { format: 'esm',  outfile: 'bonsai-kit.esm.min.js' },
  { format: 'iife', outfile: 'bonsai-kit.iife.min.js', globalName: 'BonsaiKit' },
  { format: 'iife', outfile: 'bonsai-kit.user.js', globalName: 'BonsaiKit', minify: false },
];

for (const t of targets) {
  await build({
    entryPoints: [entry],
    outfile: resolve(outDir, t.outfile),
    bundle: true,
    minify: t.minify !== false,
    format: t.format,
    globalName: t.globalName,
    target: ['es2020'],
    banner: { js: banner },
    legalComments: 'none',
  });
  console.log(`✓ ${t.outfile}`);
}

// Patch userscript: explicit window.BonsaiKit for Tampermonkey/Violentmonkey sandbox
const userJs = await readFile(resolve(outDir, 'bonsai-kit.user.js'), 'utf8');
await writeFile(resolve(outDir, 'bonsai-kit.user.js'), userJs + '\nwindow.BonsaiKit = BonsaiKit;\n', 'utf8');
console.log('✓ bonsai-kit.user.js (patched)');

// UMD wrapper (esbuild doesn't have native UMD; we wrap iife output)
const iifeMin = await readFile(resolve(outDir, 'bonsai-kit.iife.min.js'), 'utf8');
const umd = `${banner}
(function (root, factory) {
  if (typeof define === 'function' && define.amd) define([], factory);
  else if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BonsaiKit = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  ${iifeMin.replace(/^.*?var BonsaiKit\s*=\s*/m, 'var BonsaiKit=')}
  return BonsaiKit;
}));
`;
await writeFile(resolve(outDir, 'bonsai-kit.umd.min.js'), umd, 'utf8');
console.log('✓ bonsai-kit.umd.min.js');

// ─── Per-component UMD builds ──────────────────────────────────────────────
const compDir = resolve(root, 'src/components');
const compOutDir = resolve(outDir, 'components');
await mkdir(compOutDir, { recursive: true });

// Components that are business-specific (not generic UI primitives) — skip per-component UMD
const SKIP_UMD = new Set(['vmok-inspector']);

const componentFiles = (await readdir(compDir)).filter(f => f.endsWith('.js'));

for (const f of componentFiles) {
  const name = f.replace('.js', '');
  if (SKIP_UMD.has(name)) continue;
  const tagName = 'bk-' + name;

  await build({
    entryPoints: [resolve(compDir, f)],
    outfile: resolve(compOutDir, `${tagName}.umd.min.js`),
    bundle: true,
    minify: true,
    format: 'iife',
    globalName: 'BonsaiKit',
    target: ['es2020'],
    banner: { js: banner },
    legalComments: 'none',
  });

  // Merge into window.BonsaiKit so multiple components can coexist via @require
  const code = await readFile(resolve(compOutDir, `${tagName}.umd.min.js`), 'utf8');
  await writeFile(
    resolve(compOutDir, `${tagName}.umd.min.js`),
    code + '\nwindow.BonsaiKit = Object.assign(window.BonsaiKit || {}, BonsaiKit);\n',
    'utf8',
  );
  console.log(`✓ components/${tagName}.umd.min.js`);
}
