#!/usr/bin/env node

// Finite, offline reproduction of issue #68. Run with --baseline to exercise
// the original classifier; the baseline must fail, the current code must pass.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const baseline = process.argv.includes('--baseline');
const baselineRevision = '22e53c87d87274415eb11c291702597c4021c50d';
let temporary;
let recoveryUrl = new URL('../../scripts/recheck-broken-links.mjs', import.meta.url);
if (baseline) {
  temporary = mkdtempSync(join(tmpdir(), 'issue-69-baseline-'));
  for (const script of ['recheck-broken-links.mjs', 'check-web-archive.mjs']) {
    writeFileSync(join(temporary, script), execFileSync('git', ['show', `${baselineRevision}:scripts/${script}`], { cwd: root }));
  }
  recoveryUrl = pathToFileURL(join(temporary, 'recheck-broken-links.mjs'));
}
const counts = { '/limited': 0, '/outage': 0, '/gone': 0 };
const server = createServer((request, response) => {
  const route = request.url;
  if (!(route in counts)) { response.writeHead(404).end(); return; }
  const count = ++counts[route];
  const status = route === '/gone' ? 404
    : route === '/limited' && count === 1 ? 429
    : route === '/outage' && count < 3 ? 503 : 200;
  response.writeHead(status, { 'Retry-After': '0' }).end();
});

try {
  const { classifyFailures, parseLycheeFailures, recheckAll } = await import(recoveryUrl.href);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const lines = ['## Errors per input', ''];
  for (const route of Object.keys(counts)) {
    const response = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(1000) });
    await response.body?.cancel();
    lines.push(`* [${response.status}] <${base}${route}> | Rejected status code: ${response.status}`);
  }
  const { final, unanswered } = classifyFailures(parseLycheeFailures(lines.join('\n')));
  console.log({ baseline, permanent: final.length, retryable: unanswered.length, counts });
  assert.equal(final.length, 1, 'only the real 404 should be permanent');
  assert.equal(unanswered.length, 2, '429 and 503 should be retried');
  const results = await recheckAll(unanswered.map(({ url }) => url), {
    attempts: 3, waitMs: 10, timeoutMs: 500, budgetMs: 3000, log: console.log,
  });
  assert.equal([...results.values()].filter(({ outcome }) => outcome === 'alive').length, 2);
  assert.deepEqual(counts, { '/limited': 2, '/outage': 3, '/gone': 1 });
  console.log('PASS: 429/503 recovered; the 404 was never re-asked.', counts);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  if (temporary) rmSync(temporary, { recursive: true, force: true });
}
