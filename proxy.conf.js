// Angular dev-server proxy to avoid CORS by keeping same-origin in dev.
// Targets Praxis API Quickstart. You can override with env PAX_PROXY_TARGET.
// Adds smart defaults for WSL and debug logging on demand.

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const os = require('os');

function isWSL() {
  try {
    return process.platform === 'linux' && (os.release() || '').toLowerCase().includes('microsoft');
  } catch { return false; }
}

function resolveWSLHost() {
  // In WSL, the Windows host is usually the DNS in /etc/resolv.conf
  try {
    const txt = fs.readFileSync('/etc/resolv.conf', 'utf8');
    const m = txt.match(/nameserver\s+([0-9.]+)/);
    if (m && m[1]) return m[1];
  } catch {}
  return '127.0.0.1';
}

const LOG_LEVEL = process.env.PROXY_LOG_LEVEL || process.env.DEBUG ? 'debug' : 'debug';
const defaultHost = isWSL() ? resolveWSLHost() : '127.0.0.1';
// Default API target for local dev: Praxis API Quickstart runs on 8088
const DEFAULT_TARGET = `http://${defaultHost}:8088`;
const target = process.env.PAX_PROXY_TARGET || DEFAULT_TARGET;
const SECURE = String(target).startsWith('https://');

try { console.log(`[proxy] target=${target}  (logLevel=${LOG_LEVEL})`); } catch {}

function commonHandlers() {
  return {
    onError(err, req, res) {
      try { console.error('[proxy][error]', err.code, req.method, req.url); } catch {}
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({ error: 'proxy_error', code: err.code }));
    },
    onProxyRes(proxyRes) {
      try {
        const setCookie = proxyRes.headers['set-cookie'];
        if (Array.isArray(setCookie)) {
          proxyRes.headers['set-cookie'] = setCookie.map((c) => c.replace(/Domain=[^;]+/i, 'Domain=localhost'));
        }
      } catch {}
    }
  };
}

/** @type {import('http-proxy-middleware').Options | Record<string, any>} */
module.exports = {
  // Ensure auth calls through /api/auth/* are rewritten to backend /auth/*
  '/api/auth': {
    target,
    secure: SECURE,
    changeOrigin: true,
    xfwd: true,
    logLevel: LOG_LEVEL,
    cookieDomainRewrite: 'localhost',
    cookiePathRewrite: '/',
    pathRewrite: { '^/api/auth': '/auth' },
    ...commonHandlers(),
  },
  '/api': {
    target,
    secure: SECURE,
    changeOrigin: true,
    xfwd: true,
    logLevel: LOG_LEVEL,
    cookieDomainRewrite: 'localhost',
    cookiePathRewrite: '/',
    ...commonHandlers(),
  },
  '/schemas': {
    target,
    secure: SECURE,
    changeOrigin: true,
    xfwd: true,
    logLevel: LOG_LEVEL,
    cookieDomainRewrite: 'localhost',
    cookiePathRewrite: '/',
    ...commonHandlers(),
  },
  '/auth': {
    target,
    secure: SECURE,
    changeOrigin: true,
    xfwd: true,
    logLevel: LOG_LEVEL,
    cookieDomainRewrite: 'localhost',
    cookiePathRewrite: '/',
    ...commonHandlers(),
  },
};
