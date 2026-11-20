import { expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./merge-changesets.mjs', import.meta.url));

function changeset(type, description) {
  return `---\n'MyPackage': ${type}\n---\n\n${description}\n`;
}

function withChangesets(inputs, verify) {
  const root = mkdtempSync(join(tmpdir(), 'merge-changesets-'));
  try {
    const dir = join(root, '.changeset');
    mkdirSync(dir);
    const preload = join(root, 'fixed-random.mjs');
    writeFileSync(preload, 'Math.random = () => 0;\n');
    for (const [index, [name, content]] of inputs.entries()) {
      const path = join(dir, name);
      const time = 1_700_000_000 + index;
      writeFileSync(path, content);
      utimesSync(path, time, time);
    }
    const result = spawnSync(process.execPath, ['--preload', preload, script], {
      cwd: root,
      encoding: 'utf8',
      timeout: 5_000,
    });
    const files = Object.fromEntries(
      readdirSync(dir).map((name) => [name, readFileSync(join(dir, name), 'utf8')]),
    );
    verify(result, files);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('retries occupied names and preserves all descriptions and the highest bump', () => {
  const inputs = [
    ['other.md', changeset('patch', 'First change')],
    ['merged-bright-apple.md', changeset('major', 'Second change')],
    ['merged-bright-apple-1.md', changeset('minor', 'Third change')],
  ];
  withChangesets(inputs, (result, files) => {
    expect(result.status).toBe(0);
    expect(files).toEqual({
      'merged-bright-apple-2.md': changeset(
        'major',
        'First change\n\nSecond change\n\nThird change',
      ),
    });
  });
});

test('leaves all input bytes intact when every output candidate is occupied', () => {
  const inputs = Array.from({ length: 10 }, (_, index) => [
    index ? `merged-bright-apple-${index}.md` : 'merged-bright-apple.md',
    changeset('patch', `Change ${index}`),
  ]);
  withChangesets(inputs, (result, files) => {
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Could not create a distinct merged changeset');
    expect(files).toEqual(Object.fromEntries(inputs));
  });
});
