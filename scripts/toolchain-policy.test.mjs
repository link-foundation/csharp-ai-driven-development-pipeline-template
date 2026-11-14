import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { DEFAULT_FRAMEWORK } from './smoke-test-nuget-package.mjs';
import { workflowFiles } from './action-pins.mjs';

const read = (file) => readFileSync(file, 'utf8');

test('package consumer smoke test uses the library target framework', () => {
  const target = read('Directory.Build.props').match(
    /<TargetFramework>([^<]+)<\/TargetFramework>/,
  )[1];
  expect(DEFAULT_FRAMEWORK).toBe(target);
});

test('Node and Bun requirements match the toolchain selected by CI', () => {
  const pkg = JSON.parse(read('package.json'));
  expect(pkg.engines.node).toBe(`>=${read('.node-version').trim()}`);
  const bun = pkg.packageManager.replace(/^bun@/, '');
  expect(pkg.engines.bun).toBe(`>=${bun}`);
  for (const file of workflowFiles()) {
    for (const match of read(file).matchAll(/bun-version: ['"]?([\d.]+)/g))
      expect(match[1]).toBe(bun);
  }
});

test('documentation restores its committed local tool and validates toolchain changes', () => {
  const workflow = read('.github/workflows/docs.yml');
  expect(workflow).toContain('run: dotnet tool restore');
  expect(workflow).toContain('run: dotnet tool run docfx docfx.json -o _site');
  const manifest = JSON.parse(read('.config/dotnet-tools.json'));
  expect(manifest.tools.docfx.version).toMatch(/^\d+\.\d+\.\d+$/);
  /** @type {Record<string, any>} */
  const dependabot = Bun.YAML.parse(read('.github/dependabot.yml'));
  expect(
    dependabot.updates.find((update) => update['package-ecosystem'] === 'nuget')
      .directories,
  ).toContain('/.config');
  /** @type {Record<string, any>} */
  const config = Bun.YAML.parse(workflow);
  for (const event of ['push', 'pull_request'])
    for (const file of [
      'global.json',
      'Directory.Build.props',
      '.config/dotnet-tools.json',
    ])
      expect(config.on[event].paths).toContain(file);
});

test('Dependabot updates coupled CodeQL actions together', () => {
  /** @type {Record<string, any>} */
  const config = Bun.YAML.parse(read('.github/dependabot.yml'));
  const actions = config.updates.find(
    (update) => update['package-ecosystem'] === 'github-actions',
  );
  expect(actions.groups.codeql.patterns).toEqual(['github/codeql-action/*']);
});
