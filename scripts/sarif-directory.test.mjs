import { expect, test } from 'bun:test';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { collectSarifDirectoryProblems } from './security-gates.mjs';

test('CLI examines all files, including after invalid JSON, and prints untrusted values safely', () => {
  const directory = mkdtempSync(join(tmpdir(), 'sarif-all-'));
  try {
    expect(collectSarifDirectoryProblems(directory)).toEqual(['Missing SARIF reports']);
    writeFileSync(join(directory, 'a.sarif'), '{');
    for (const rule of ['rule-one', 'rule-two']) {
      writeFileSync(
        join(directory, `${rule}.sarif`),
        JSON.stringify({
          version: '2.1.0',
          runs: [
            {
              tool: { driver: { name: 'CodeQL' } },
              invocations: [{ executionSuccessful: true }],
              results: [{ ruleId: rule, message: { text: 'finding\n##[error]fake' } }],
            },
          ],
        }),
      );
    }
    const result = spawnSync(
      process.execPath,
      ['scripts/security-gates.mjs', 'sarif', directory],
      { encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: 'true' } },
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Malformed'.toLowerCase());
    expect(result.stderr).toContain('rule-one');
    expect(result.stderr).toContain('rule-two');
    const lines = result.stderr.trim().split('\n');
    const token = /^::stop-commands::([a-f0-9]+)$/.exec(lines[0])?.[1];
    expect(token).toBeDefined();
    expect(lines.at(-2)).toBe(`::${token}::`);
    expect(lines.at(-1)).toBe('CodeQL gate failed: 3 problem(s)');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
