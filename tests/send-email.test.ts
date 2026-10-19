import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler, { parseEmailRequest, rateLimited } from '../api/send-email';

const JSON_HEADERS = { 'content-type': 'application/json' };

function fakeRes() {
  const res: any = { statusCode: 200, body: null, headers: {} };
  res.status = (c: number) => ((res.statusCode = c), res);
  res.json = (b: unknown) => ((res.body = b), res);
  res.setHeader = (k: string, v: string) => (res.headers[k.toLowerCase()] = v);
  return res;
}

let ipSeq = 0;
async function call(body: unknown, headers: Record<string, string> = JSON_HEADERS, method = 'POST') {
  const res = fakeRes();
  ipSeq += 1;
  await handler({ method, body, headers: { 'x-forwarded-for': `198.51.100.${ipSeq % 250}`, ...headers } }, res);
  return res;
}

test('valid request shape passes', () => {
  const r = parseEmailRequest(JSON_HEADERS, { kind: 'appointment', ticketCode: ' fs-7kq2m9xa ' });
  assert.deepEqual(r, { ok: true, kind: 'appointment', ticketCode: 'FS-7KQ2M9XA' });
});

test('malicious or malformed bodies are refused with a generic error', async () => {
  const bad: unknown[] = [
    null,
    [],
    'kind=appointment',
    { kind: 'appointment' },
    { kind: 'appointment', ticketCode: '<script>alert(1)</script>' },
    { kind: 'appointment', ticketCode: "FS-7KQ2M9XA' OR 1=1--" },
    { kind: 'appointment', ticketCode: 'x'.repeat(5000) },
    { kind: 'appointment', ticketCode: ['FS-7KQ2M9XA'] },
    { kind: '__proto__', ticketCode: 'FS-7KQ2M9XA' },
    { kind: 'users', ticketCode: 'FS-7KQ2M9XA' },
    { kind: 'appointment', ticketCode: 'FS-7KQ2M9XA', to: 'victim@example.com' },
    { kind: 'appointment', ticketCode: 'FS-7KQ2M9XA', html: '<h1>phish</h1>' },
    JSON.parse('{"kind":"appointment","ticketCode":"FS-7KQ2M9XA","__proto__":{"admin":true}}')
  ];
  for (const body of bad) {
    const res = await call(body);
    assert.ok(res.statusCode === 400 || res.statusCode === 413, JSON.stringify(body)?.slice(0, 60));
    assert.deepEqual(res.body, { success: false, error: { code: 'VALIDATION', message: 'Invalid request' } });
  }
});

test('content type, body size and method are enforced', async () => {
  assert.equal((await call({ kind: 'form', ticketCode: 'FS-7KQ2M9XA' }, { 'content-type': 'text/plain' })).statusCode, 415);
  assert.equal((await call({ kind: 'form', ticketCode: 'FS-7KQ2M9XA' }, { ...JSON_HEADERS, 'content-length': '50000' })).statusCode, 413);
  assert.equal((await call({ kind: 'form', ticketCode: 'FS-7KQ2M9XA' }, JSON_HEADERS, 'GET')).statusCode, 405);
});

test('valid request without server configuration is accepted quietly', async () => {
  const saved = { ...process.env };
  for (const k of ['SUPABASE_SECRET_KEY', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL']) delete process.env[k];
  const res = await call({ kind: 'waitlist', ticketCode: 'FS-7KQ2M9XA' });
  process.env = saved;
  assert.equal(res.statusCode, 202);
});

test('rate limit per client', () => {
  const now = 1_000_000;
  let limited = false;
  for (let i = 0; i < 11; i++) limited = rateLimited('203.0.113.99', now);
  assert.equal(limited, true);
  assert.equal(rateLimited('203.0.113.99', now + 61_000), false);
});
