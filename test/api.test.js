'use strict';

/* Smoke tests: node --test test/ */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = 3999;
const BASE = `http://127.0.0.1:${PORT}`;
let child;

async function waitForServer(trials = 40) {
  for (let i = 0; i < trials; i += 1) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('server did not start');
}

before(async () => {
  child = spawn(process.execPath, [path.join(__dirname, '..', 'server', 'index.js')], {
    env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', TZ: 'Europe/Prague' },
    stdio: 'ignore',
  });
  await waitForServer();
});

after(() => child.kill('SIGKILL'));

test('health check odpovídá', async () => {
  const body = await (await fetch(`${BASE}/api/health`)).json();
  assert.equal(body.status, 'ok');
  assert.ok(body.uptime >= 0);
});

test('/api/time vrací čas serveru', async () => {
  const before = Date.now();
  const body = await (await fetch(`${BASE}/api/time`)).json();
  assert.ok(Math.abs(body.epochMs - before) < 3000, 'epochMs sedí proti lokálnímu času');
  assert.equal(body.timeZone, 'Europe/Prague');
  assert.match(body.isoUtc, /^\d{4}-\d{2}-\d{2}T/);
});

test('/api/time přepočítá požadované pásmo', async () => {
  const tokyo = await (await fetch(`${BASE}/api/time?zone=Asia%2FTokyo`)).json();
  assert.equal(tokyo.timeZone, 'Asia/Tokyo');
  assert.equal(tokyo.offsetMinutes, 540); // +9:00, bez letního času

  const kolkata = await (await fetch(`${BASE}/api/time?zone=Asia%2FKolkata`)).json();
  assert.equal(kolkata.offsetMinutes, 330); // +5:30
});

test('neplatné pásmo se hodí na čas serveru', async () => {
  const body = await (await fetch(`${BASE}/api/time?zone=../../etc/passwd`)).json();
  assert.equal(body.timeZone, 'Europe/Prague');
});

test('/api/info popíše server', async () => {
  const body = await (await fetch(`${BASE}/api/info`)).json();
  assert.ok(body.hostname);
  assert.equal(body.serverTimeZone, 'Europe/Prague');
  assert.ok(body.uptimeSeconds >= 0);
  assert.ok(body.memory.total > body.memory.free);
});

test('statický overflow a SPA fallback', async () => {
  const index = await fetch(`${BASE}/`);
  assert.equal(index.status, 200);
  assert.match(index.headers.get('content-type'), /text\/html/);
  assert.match(await index.text(), /Světové hodiny/);

  assert.equal((await fetch(`${BASE}/styles.css`)).status, 200);
  assert.equal((await fetch(`${BASE}/app.js`)).status, 200);
  assert.equal((await fetch(`${BASE}/nejaka/mesta`)).status, 200, 'SPA fallback pro cesty bez přípony');
  assert.equal((await fetch(`${BASE}/chybi.css`)).status, 404);
});

test('API odmítá jiné než GET', async () => {
  const res = await fetch(`${BASE}/api/time`, { method: 'POST' });
  assert.equal(res.status, 405);
});
