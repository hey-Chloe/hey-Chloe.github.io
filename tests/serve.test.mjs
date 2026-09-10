import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { request } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import { createStaticServer } from '../scripts/serve.mjs';

let directory;
let server;
let port;
const page = '<!doctype html><title>Preview fixture</title><p>Text response with Chinese 中文.</p>'.repeat(40);
const script = 'const message = "Static asset fixture";\n'.repeat(100);
const missing = '<!doctype html><title>Not found</title><p>Missing page.</p>'.repeat(30);
const image = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]);

function get(route, { encoding, method = 'GET' } = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path: route, method, headers: encoding === undefined ? {} : { 'Accept-Encoding': encoding } }, (res) => {
      const parts = [];
      res.on('data', (part) => parts.push(part));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(parts) }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

before(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'homepage-preview-'));
  const output = path.join(directory, 'out');
  await mkdir(path.join(output, '_next', 'static'), { recursive: true });
  await writeFile(path.join(output, 'index.html'), page);
  await writeFile(path.join(output, '404.html'), missing);
  await writeFile(path.join(output, '_next', 'static', 'asset.js'), script);
  await writeFile(path.join(output, 'image.png'), image);
  await writeFile(path.join(output, 'figure.svg'), '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  await writeFile(path.join(directory, 'secret.txt'), 'Must not be served');
  await symlink(path.join(directory, 'secret.txt'), path.join(output, 'escape.txt'));
  server = createStaticServer({ directory: output, basePath: '/homepage' });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  port = server.address().port;
});

after(async () => {
  if (server?.listening) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  if (directory) await rm(directory, { recursive: true, force: true });
});

test('HTML negotiates gzip and Brotli with byte-identical decoded content', async () => {
  for (const encoding of ['gzip', 'br']) {
    const response = await get('/homepage/', { encoding });
    assert.equal(response.status, 200);
    assert.equal(response.headers['content-encoding'], encoding);
    assert.equal(response.headers.vary, 'Accept-Encoding');
    assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
    assert.equal(response.headers['cache-control'], 'no-cache');
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.equal(Number(response.headers['content-length']), response.body.length);
    assert.equal((encoding === 'br' ? brotliDecompressSync(response.body) : gunzipSync(response.body)).toString(), page);
    assert(response.body.length < Buffer.byteLength(page));
  }
});

test('negotiation respects relative quality, explicit exclusions, and identity', async () => {
  const cases = [
    ['gzip, br', 'br'], ['br;q=0.2, gzip;q=0.9', 'gzip'], ['br;q=0, gzip', 'gzip'],
    ['gzip;q=0, *;q=0.8', 'br'], ['br;q=bad, gzip;q=0.5', 'gzip'],
    ['gzip; q = 0, br;q=1', 'br'],
    ['identity;q=1, gzip;q=0.5', undefined], ['gzip;q=0, br;q=0', undefined], [undefined, undefined],
  ];
  for (const [encoding, expected] of cases) {
    const response = await get('/homepage/', { encoding });
    assert.equal(response.status, 200, String(encoding));
    assert.equal(response.headers['content-encoding'], expected, String(encoding));
    if (!expected) assert.equal(response.body.toString(), page);
  }
  assert.equal((await get('/homepage/', { encoding: '*;q=0' })).status, 406);
});

test('HEAD matches negotiated GET headers and emits no body', async () => {
  const full = await get('/homepage/', { encoding: 'br' });
  const head = await get('/homepage/', { encoding: 'br', method: 'HEAD' });
  assert.equal(head.status, full.status);
  for (const key of ['content-type', 'content-encoding', 'content-length', 'cache-control', 'vary']) assert.equal(head.headers[key], full.headers[key]);
  assert.equal(head.body.length, 0);
});

test('Next assets keep their MIME and immutable caching under compression', async () => {
  const response = await get('/homepage/_next/static/asset.js', { encoding: 'gzip' });
  assert.equal(response.status, 200);
  assert.equal(response.headers['content-type'], 'text/javascript; charset=utf-8');
  assert.equal(response.headers['cache-control'], 'public, max-age=31536000, immutable');
  assert.equal(gunzipSync(response.body).toString(), script);
});

test('images, including textual SVG, remain uncompressed', async () => {
  const response = await get('/homepage/image.png', { encoding: 'br, gzip' });
  assert.equal(response.status, 200);
  assert.equal(response.headers['content-type'], 'image/png');
  assert.equal(response.headers['content-encoding'], undefined);
  assert.deepEqual(response.body, image);
  const svg = await get('/homepage/figure.svg', { encoding: 'br, gzip' });
  assert.equal(svg.headers['content-type'], 'image/svg+xml');
  assert.equal(svg.headers['content-encoding'], undefined);
});

test('404 pages preserve status, compress text, and honor HEAD', async () => {
  const response = await get('/homepage/missing/', { encoding: 'gzip' });
  assert.equal(response.status, 404);
  assert.equal(gunzipSync(response.body).toString(), missing);
  const head = await get('/homepage/missing/', { encoding: 'gzip', method: 'HEAD' });
  assert.equal(head.status, 404);
  assert.equal(head.headers['content-encoding'], 'gzip');
  assert.equal(head.body.length, 0);
});

test('base-path escapes, encoded traversal, malformed URLs, and symlinks stay private', async () => {
  for (const route of ['/', '/homepage-other/', '/homepage/%2e%2e%2fsecret.txt', '/homepage/%zz', '/homepage/escape.txt']) {
    const response = await get(route, { encoding: 'gzip' });
    assert.equal(response.status, 404, route);
    assert.equal(gunzipSync(response.body).toString(), missing, route);
  }
});
