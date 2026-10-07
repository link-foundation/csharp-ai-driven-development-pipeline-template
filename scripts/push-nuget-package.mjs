#!/usr/bin/env bun

import { spawnSync } from 'node:child_process';
import { appendFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NUGET_AUTH_HINT } from './nuget-auth.mjs';

/** Publish every package, preserving failures and giving actionable auth errors. */
export function pushPackages({ apiKey, packagePaths, spawn = spawnSync, log = console.log }) {
  if (!apiKey) throw new Error(`No NuGet publishing key was obtained. ${NUGET_AUTH_HINT}`);
  if (packagePaths.length === 0) throw new Error('No .nupkg files found to publish.');
  for (const packagePath of packagePaths) {
    const result = spawn('dotnet', [
      'nuget', 'push', packagePath, '--api-key', apiKey,
      '--source', 'https://api.nuget.org/v3/index.json', '--skip-duplicate',
    ], { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.replaceAll(apiKey, '[REDACTED]');
    if (output) log(output);
    if (result.error || result.status !== 0) {
      const guidance = /\b(401|403)\b/.test(output) ? ` ${NUGET_AUTH_HINT}` : '';
      throw new Error(`NuGet push failed for ${packagePath} (exit ${result.status ?? 'unavailable'}).${guidance}`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const packagePaths = readdirSync('artifacts').filter((name) => name.endsWith('.nupkg'))
      .sort().map((name) => join('artifacts', name));
    pushPackages({ apiKey: process.env.NUGET_API_KEY || '', packagePaths });
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, 'published=true\n');
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exitCode = 1;
  }
}
