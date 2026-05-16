#!/usr/bin/env node
/**
 * Tiny static dev server for examples/.
 * Usage: npm run dev   →   http://localhost:5173
 *
 * Zero deps; uses node:http.
 * NOTE: Only used locally; never run inside production sandboxes.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const port = process.env.PORT || 5173;

const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/examples/index.html';
  const filePath = join(root, urlPath);
  if (!filePath.startsWith(root)) { res.writeHead(403).end('forbidden'); return; }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': types[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404).end('not found');
  }
});

server.listen(port, () => console.log(`bonsai-kit dev → http://localhost:${port}`));
