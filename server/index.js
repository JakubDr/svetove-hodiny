'use strict';

/**
 * Svetove hodiny — tiny zero-dependency HTTP server.
 *
 * Serves the single page app from ./public and exposes a small JSON API so the
 * client can render the *server's* clock (not the visitor's browser clock).
 */

const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const BOOT_TIME = Date.now();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

// Server timezone, e.g. "Europe/Prague" (settable via TZ in the container).
function serverTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function offsetMinutesOf(date, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

// Validate a client supplied IANA zone (used by /api/time?zone=...).
// Southern-hemisphere safe: compare against the smaller of January/July offsets.
function isInDst(date, timeZone) {
  const year = date.getUTCFullYear();
  const jan = offsetMinutesOf(new Date(Date.UTC(year, 0, 1)), timeZone);
  const jul = offsetMinutesOf(new Date(Date.UTC(year, 6, 1)), timeZone);
  const current = offsetMinutesOf(date, timeZone);
  return jan !== jul && current > Math.min(jan, jul);
}

function safeZone(candidate) {
  if (typeof candidate !== 'string' || !/^[A-Za-z0-9_+/.-]{1,64}$/.test(candidate)) return null;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: candidate });
    return candidate;
  } catch {
    return null;
  }
}

function json(res, payload, status = 200) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  });
  res.end(body);
}

function handleApi(req, res, url) {
  const route = url.pathname;

  if (route === '/api/health') {
    return json(res, { status: 'ok', uptime: Math.round(process.uptime()) });
  }

  if (route === '/api/time') {
    const now = new Date();
    const zone = safeZone(url.searchParams.get('zone')) || serverTimeZone();
    return json(res, {
      epochMs: now.getTime(),
      isoUtc: now.toISOString(),
      timeZone: zone,
      offsetMinutes: offsetMinutesOf(now, zone),
      serverTimeZone: serverTimeZone(),
      isDst: isInDst(now, zone),
    });
  }

  if (route === '/api/info') {
    const cpus = os.cpus();
    return json(res, {
      hostname: os.hostname(),
      platform: `${os.type()} ${os.release()}`,
      arch: os.arch(),
      node: process.version,
      serverTimeZone: serverTimeZone(),
      uptimeSeconds: Math.round((Date.now() - BOOT_TIME) / 1000),
      processUptimeSeconds: Math.round(process.uptime()),
      cpuModel: cpus[0] ? cpus[0].model.trim() : 'unknown',
      cpuCount: cpus.length,
      loadAvg: os.loadavg().map((n) => Number(n.toFixed(2))),
      memory: { total: os.totalmem(), free: os.freemem() },
      pid: process.pid,
    });
  }

  return json(res, { error: 'not_found', path: route }, 404);
}

function serveStatic(res, url) {
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const target = path.join(PUBLIC_DIR, relative === '' ? 'index.html' : relative);

  // Prevent path traversal outside of ./public.
  if (!target.startsWith(PUBLIC_DIR + path.sep) && target !== path.join(PUBLIC_DIR, 'index.html')) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden');
  }

  fs.stat(target, (err, stat) => {
    let file = target;
    if (!err && stat.isDirectory()) file = path.join(target, 'index.html');

    fs.readFile(file, (readErr, data) => {
      if (readErr) {
        // SPA fallback: unknown, extension-less paths render the single page app.
        if (!path.extname(target)) {
          return fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (fallbackErr, html) => {
            if (fallbackErr) {
              res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
              return res.end('404 Not Found');
            }
            res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-cache' });
            res.end(html);
          });
        }
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        return res.end('404 Not Found');
      }

      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, {
        'content-type': MIME[ext] || 'application/octet-stream',
        'cache-control': file.endsWith('index.html') ? 'no-cache' : 'public, max-age=300',
        'content-length': data.length,
      });
      res.end(data);
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname.startsWith('/api/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return json(res, { error: 'method_not_allowed' }, 405);
    }
    try {
      return handleApi(req, res, url);
    } catch (error) {
      return json(res, { error: 'internal_error', message: String(error && error.message) }, 500);
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD', 'content-type': 'text/plain; charset=utf-8' });
    return res.end('405 Method Not Allowed');
  }

  serveStatic(res, url);
});

server.listen(PORT, HOST, () => {
  console.log(`[hodiny] listening on http://${HOST}:${PORT} (server tz: ${serverTimeZone()})`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`[hodiny] ${signal} received, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
