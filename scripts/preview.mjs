#!/usr/bin/env node
/**
 * Serve the merged `dist/` artifact exactly as production would.
 *
 * Worth having separately from `pnpm dev`: the dev servers resolve routes dynamically,
 * while the export is plain files — `/roadmap.html` vs `/roadmap` and a missing base-path
 * prefix only show up here.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { BASE_PATH, DIST } from './env.mjs';

const PORT = Number(process.env.PREVIEW_PORT ?? 3200);

if (!fs.existsSync(DIST)) {
  console.error(`No build found at ${DIST}. Run \`pnpm build\` first.`);
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let url;
  try {
    url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  } catch {
    // Malformed percent-encoding must not crash the server.
    res.writeHead(400, { 'content-type': 'text/plain' }).end('400 Bad Request');
    return;
  }

  // Match on a path-segment boundary: a bare startsWith would also accept `/tvmjs-other`.
  if (BASE_PATH && url !== BASE_PATH && !url.startsWith(`${BASE_PATH}/`)) {
    res.writeHead(302, { location: `${BASE_PATH}/` });
    res.end();
    return;
  }

  const relative = BASE_PATH ? url.slice(BASE_PATH.length) : url;
  // path.join normalises away any `..`; the containment check below is the actual guard.
  // Compare against DIST plus a separator, otherwise a sibling like `dist-old/` passes.
  const requested = path.join(DIST, relative);
  if (requested !== DIST && !requested.startsWith(DIST + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  const isFile = (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile();

  // Order matters. `/roadmap` has both a `roadmap.html` page and a `roadmap/` directory
  // holding the route's RSC payload, and only the former is the page — so the sibling
  // `.html` has to win over the directory index, which does not exist for that route.
  const filePath = [requested, `${requested}.html`, path.join(requested, 'index.html')].find(isFile);

  if (!filePath) {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('404 Not Found');
    return;
  }

  res.writeHead(200, {
    'content-type': TYPES[path.extname(filePath)] ?? 'application/octet-stream',
    // The header-only defences a static export cannot declare for itself. Mirror these
    // in the real deployment — see DEPLOYMENT.md.
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n  Preview: http://localhost:${PORT}${BASE_PATH}/`);
  console.log(`  Docs:    http://localhost:${PORT}${BASE_PATH}/docs/\n`);
});
