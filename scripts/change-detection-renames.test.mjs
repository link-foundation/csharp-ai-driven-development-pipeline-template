import { describe, expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const helper = new URL('./detect-code-changes.mjs', import.meta.url).href;

// Run the real helper in an isolated process: CSHARP_ROOT is read at import time.
function compareMove(event, root, source, destination, editOnly = false) {
  const directory = mkdtempSync(join(tmpdir(), 'change-detection-'));
  const git = (...args) =>
    execFileSync('git', args, { cwd: directory, encoding: 'utf8' }).trim();
  try {
    git('init', '--quiet');
    git('config', 'user.name', 'Regression Test');
    git('config', 'user.email', 'test@example.com');
    git('config', 'commit.gpgsign', 'false');
    // Reproduce even when a consumer explicitly enables rename detection.
    git('config', 'diff.renames', 'true');
    mkdirSync(dirname(join(directory, source)), { recursive: true });
    writeFileSync(join(directory, source), 'class Program {}\n');
    git('add', '.');
    git('commit', '--quiet', '-m', 'Initial source');
    const base = git('rev-parse', 'HEAD');
    if (editOnly) {
      writeFileSync(
        join(directory, source),
        'class Program { static void Main() {} }\n',
      );
    } else {
      mkdirSync(dirname(join(directory, destination)), { recursive: true });
      git('mv', source, destination);
    }
    git('add', '.');
    git('commit', '--quiet', '-m', 'Change source');
    const head = git('rev-parse', 'HEAD');
    return JSON.parse(
      execFileSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `
      import { getChangedFiles, detectChangeOutputs } from ${JSON.stringify(helper)};
      const files = getChangedFiles();
      console.log(JSON.stringify({ files, outputs: detectChangeOutputs(files) }));
    `,
        ],
        {
          cwd: directory,
          encoding: 'utf8',
          env: {
            ...process.env,
            CSHARP_ROOT: root,
            GITHUB_EVENT_NAME: event,
            GITHUB_BASE_SHA: base,
            GITHUB_HEAD_SHA: head,
          },
        },
      ),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

for (const event of ['push', 'pull_request']) {
  for (const root of ['', 'csharp']) {
    const prefix = root ? `${root}/` : '';
    const source = `${prefix}src/Program.cs`;
    describe(`${event} rename detection (${root || 'root'} layout)`, () => {
      test.each(['.changeset', 'docs', 'dev/log', 'experiments', 'examples'])(
        'moving source into %s still requires a changeset',
        (folder) => {
          const destination = `${prefix}${folder}/Program.cs`;
          const { files, outputs } = compareMove(event, root, source, destination);
          expect(files.sort()).toEqual([source, destination].sort());
          expect(outputs).toEqual({ 'any-code-changed': 'true' });
        },
      );

      test('ordinary source renames preserve both paths', () => {
        const destination = `${prefix}src/Renamed.cs`;
        const { files, outputs } = compareMove(event, root, source, destination);
        expect(files.sort()).toEqual([source, destination].sort());
        expect(outputs).toEqual({ 'any-code-changed': 'true' });
      });

      test('genuine examples-only edits remain excluded', () => {
        const example = `${prefix}examples/Program.cs`;
        const { files, outputs } = compareMove(event, root, example, example, true);
        expect(files).toEqual([example]);
        expect(outputs).toEqual({ 'any-code-changed': 'false' });
      });
    });
  }
}
