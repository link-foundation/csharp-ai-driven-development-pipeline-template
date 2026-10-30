// Finite regression for the ignored bunfig test.timeout setting in Bun 1.4.4.
// Each subprocess waits at most six seconds; no credentials or network involved.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const directory = mkdtempSync(join(tmpdir(), 'bun-timeout-'));
try {
  writeFileSync(join(directory, 'bunfig.toml'), '[test]\ntimeout = 7000\n');
  const body =
    "test('finite wait', async () => { await new Promise(resolve => setTimeout(resolve, 6000)); });\n";
  for (const explicit of [false, true]) {
    writeFileSync(
      join(directory, 'timeout.test.mjs'),
      "import { test, setDefaultTimeout } from 'bun:test';\n" +
        (explicit ? 'setDefaultTimeout(7000);\n' : '') +
        body,
    );
    const result = spawnSync('bun', ['test', 'timeout.test.mjs'], {
      cwd: directory,
      encoding: 'utf8',
    });
    console.log(result.stdout, result.stderr);
    assert.equal(result.status, explicit ? 0 : 1);
    if (!explicit) assert.match(result.stderr, /timed out after 5000ms/);
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
