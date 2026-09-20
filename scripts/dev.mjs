#!/usr/bin/env node
/**
 * Unified dev proxy.
 *
 * The two apps are mounted under one origin in production, so serving them from two
 * unrelated ports in development would let base-path bugs through — links between the
 * site and the docs would only break once deployed. This proxy reproduces the production
 * layout locally:
 *
 *   http://localhost:3100${BASE_PATH}/        → site (Next.js   :3103)
 *   http://localhost:3100${BASE_PATH}/docs/   → docs (VitePress :3104)
 *
 * Both child servers already serve under their own prefix (Next `basePath`, VitePress
 * `base`), so the proxy forwards paths unchanged. WebSocket upgrades (HMR) are proxied
 * transparently for both.
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { ROOT, BASE_PATH, DOCS_PREFIX } from './env.mjs';

const PORT = { proxy: 3100, site: 3103, docs: 3104 };

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

const children = [];
let shuttingDown = false;

function printLine(label, color, line) {
  if (line.trim()) process.stdout.write(`${color}${C.bold}[${label}]${C.reset} ${line}\n`);
}

function startServer(label, color, cwd, args) {
  const child = spawn('pnpm', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);

  const emit = (lineColor) => (data) =>
    data
      .toString()
      .split('\n')
      .forEach((l) => printLine(label, lineColor, l));

  child.stdout.on('data', emit(color));
  child.stderr.on('data', emit(C.yellow));

  child.on('error', (err) => printLine(label, C.red, `failed to start: ${err.message}`));
  child.on('exit', (code) => {
    if (shuttingDown) return;
    if (code !== 0 && code !== null) {
      printLine(label, C.red, `exited with code ${code} — shutting down`);
      shutdown(1);
    }
  });

  return child;
}

startServer('site', C.yellow, path.join(ROOT, 'site'), ['dev', '--port', String(PORT.site)]);
startServer('docs', C.magenta, path.join(ROOT, 'docs'), ['dev', '--port', String(PORT.docs)]);

/** Longest prefix first: `${BASE_PATH}/docs` is a prefix-sibling of `${BASE_PATH}`. */
function targetPort(url = '') {
  return url.startsWith(DOCS_PREFIX) ? PORT.docs : PORT.site;
}

const server = http.createServer((req, res) => {
  // With a base path, the bare root serves nothing — send the visitor where the app is
  // rather than showing them the Next.js 404.
  if (BASE_PATH && (req.url === '/' || req.url === '')) {
    res.writeHead(302, { location: `${BASE_PATH}/` });
    res.end();
    return;
  }

  const port = targetPort(req.url);
  const proxyReq = http.request(
    {
      hostname: 'localhost',
      port,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${port}` },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  proxyReq.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'content-type': 'text/plain' });
      res.end('Dev server not ready yet — please wait a moment and refresh.');
    }
  });

  req.pipe(proxyReq, { end: true });
});

server.on('upgrade', (req, clientSocket, head) => {
  const port = targetPort(req.url);
  const upstream = net.connect(port, 'localhost', () => {
    const requestLine = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    const headers = Object.entries(req.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\r\n');
    upstream.write(`${requestLine}${headers}\r\n\r\n`);
    if (head?.length) upstream.write(head);
    clientSocket.pipe(upstream);
    upstream.pipe(clientSocket);
  });

  upstream.on('error', () => clientSocket.destroy());
  clientSocket.on('error', () => upstream.destroy());
});

server.on('error', (err) => {
  console.error(`${C.red}Dev proxy failed to bind port ${PORT.proxy}: ${err.message}${C.reset}`);
  shutdown(1);
});

server.listen(PORT.proxy, () => {
  const origin = `http://localhost:${PORT.proxy}`;
  console.log('');
  console.log(`${C.green}${C.bold}  Dev proxy ready${C.reset}`);
  console.log(`${C.dim}  ┌─ ${origin}${BASE_PATH}/      → site (Next.js   :${PORT.site})${C.reset}`);
  console.log(`${C.dim}  └─ ${origin}${DOCS_PREFIX}/ → docs (VitePress :${PORT.docs})${C.reset}`);
  console.log('');
});

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach((c) => c.kill('SIGTERM'));
  server.close();
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
