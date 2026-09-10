import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { brotliCompress, constants, gzip } from 'node:zlib';

const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.txt':'text/plain; charset=utf-8', '.xml':'application/xml', '.png':'image/png', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf', '.pdf':'application/pdf' };
const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);
const isInside = (root, filename) => filename === root || filename.startsWith(`${root}${path.sep}`);

function selectEncoding(header, compressible) {
  if (!header) return 'identity';
  const qualities = new Map();
  for (const part of String(header).split(',')) {
    const [name, ...parameters] = part.trim().toLowerCase().split(';');
    if (!name.trim()) continue;
    const parameter = parameters.find((value) => /^\s*q\s*=/.test(value));
    const rawQuality = parameter?.slice(parameter.indexOf('=') + 1).trim();
    const quality = rawQuality === undefined ? 1 : /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(rawQuality) ? Number(rawQuality) : 0;
    qualities.set(name.trim(), Math.max(qualities.get(name.trim()) ?? 0, quality));
  }
  const identity = qualities.get('identity') ?? (qualities.get('*') === 0 ? 0 : undefined);
  const candidates = compressible
    ? ['br', 'gzip'].map((name) => ({ name, quality: qualities.get(name) ?? qualities.get('*') ?? 0 }))
      .filter(({ quality }) => quality > 0).sort((left, right) => right.quality - left.quality)
    : [];
  const preferred = candidates[0];
  if (preferred && (identity === undefined || preferred.quality >= identity)) return preferred.name;
  return identity === 0 ? null : 'identity';
}

async function respond(req, res, status, content, contentType, cacheControl) {
  // SVG is deliberately left with the other image types; precompressed fonts,
  // images and PDF files should not consume CPU for negligible savings.
  const compressible = /^(?:text\/|application\/(?:json|xml|javascript)(?:;|$))/.test(contentType);
  const encoding = selectEncoding(req.headers['accept-encoding'], compressible);
  let body = Buffer.isBuffer(content) ? content : Buffer.from(content);
  if (encoding === null) {
    status = 406;
    body = Buffer.from('No acceptable content encoding');
    contentType = 'text/plain; charset=utf-8';
    cacheControl = 'no-cache';
  } else if (encoding === 'br') {
    body = await brotliAsync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } });
  } else if (encoding === 'gzip') {
    body = await gzipAsync(body);
  }
  res.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': body.length,
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Accept-Encoding',
    ...(encoding === 'gzip' || encoding === 'br' ? { 'Content-Encoding': encoding } : {}),
  });
  res.end(req.method === 'HEAD' ? undefined : body);
}

/** Exported so tests exercise the same HTTP handler as the local preview. */
export function createStaticServer({ directory = 'out', basePath = '' } = {}) {
  const root = path.resolve(directory);
  const prefix = basePath.replace(/\/$/, '');
  return createServer(async (req, res) => {
    let content;
    let status = 200;
    let contentType = 'text/html; charset=utf-8';
    let cacheControl = 'no-cache';
    try {
      let pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
      if (prefix && pathname !== prefix && !pathname.startsWith(`${prefix}/`)) throw new Error('Not found');
      if (prefix) pathname = pathname.slice(prefix.length) || '/';
      let target = path.resolve(root, `.${pathname}`);
      if (!isInside(root, target)) throw new Error('Not found');
      if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
      // The lexical check also needs a realpath check to reject escaping symlinks.
      if (!isInside(await realpath(root), await realpath(target))) throw new Error('Not found');
      content = await readFile(target);
      contentType = mime[path.extname(target)] || 'application/octet-stream';
      if (target.includes(`${path.sep}_next${path.sep}`)) cacheControl = 'public, max-age=31536000, immutable';
    } catch {
      status = 404;
      content = await readFile(path.join(root, '404.html')).catch(() => 'Page not found');
    }
    try {
      await respond(req, res, status, content, contentType, cacheControl);
    } catch {
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : 'Preview response failed');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 3000);
  const basePath = (process.env.BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
  createStaticServer({ directory: process.env.EXPORT_DIR || 'out', basePath })
    .listen(port, '127.0.0.1', () => console.log(`Static preview: http://127.0.0.1:${port}${basePath}/`));
}
