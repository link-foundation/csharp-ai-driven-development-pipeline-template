import { expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractBrokenLinks, validateLycheeReport } from './check-web-archive.mjs';
import { main, parseLycheeFailures } from './recheck-broken-links.mjs';

const mixed = `| Errors | 1 |
| Timeouts | 1 |
## Errors per input
* [503] <https://recovered.example/>
## Timeouts per input
* [TIMEOUT] <https://timeout.example/>
## Redirects per input
* [301] <https://redirect.example/>
`;

test('both failure sections are parsed; redirects are excluded', () => {
  expect(parseLycheeFailures(mixed).map((item) => item.url)).toEqual([
    'https://recovered.example/',
    'https://timeout.example/',
  ]);
  expect(extractBrokenLinks(mixed).urls).toHaveLength(2);
  expect(() => validateLycheeReport(mixed, '2')).not.toThrow();
  expect(() =>
    validateLycheeReport('## Timeouts per input\n* [TIMEOUT] https://example.com', '2'),
  ).not.toThrow();
});

for (const code of ['1', '3', '127', ''])
  test(`exit ${JSON.stringify(code)} cannot be recovered`, () => {
    expect(() => validateLycheeReport(mixed, code)).toThrow();
  });
for (const report of [
  '',
  '## Redirects per input\n* https://example.com',
  mixed.replace('| Timeouts | 1 |', '| Timeouts | 2 |'),
  mixed.replace(
    '* [TIMEOUT] <https://timeout.example/>',
    '* [TIMEOUT]\nhttps://timeout.example/',
  ),
])
  test('missing, incomplete or malformed report fails closed', () => {
    expect(() => validateLycheeReport(report, '2')).toThrow();
  });

test('a recovered 503 never hides an unrecovered timeout in the verdict', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lychee-timeouts-'));
  const overrides = {
    LYCHEE_OUTPUT: join(directory, 'report.md'),
    GITHUB_OUTPUT: join(directory, 'output'),
    RECOVERED_OUTPUT: join(directory, 'recovered'),
    LYCHEE_EXIT_CODE: '2',
    RECHECK_ATTEMPTS: '1',
  };
  const saved = Object.fromEntries(
    Object.keys(overrides).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, overrides);
  try {
    writeFileSync(overrides.LYCHEE_OUTPUT, mixed);
    const calls = [];
    await main({
      fetchImpl: async (url) => {
        calls.push(String(url));
        return { status: String(url).includes('recovered') ? 200 : 404 };
      },
    });
    expect(calls).toHaveLength(2);
    expect(readFileSync(overrides.GITHUB_OUTPUT, 'utf8')).toContain(
      'all_recovered=false',
    );
    expect(readFileSync(overrides.RECOVERED_OUTPUT, 'utf8').trim()).toBe(
      'https://recovered.example/',
    );
    process.env.LYCHEE_EXIT_CODE = '3';
    await expect(
      main({
        fetchImpl: async () => {
          throw Error('must not probe');
        },
      }),
    ).rejects.toThrow('not a link-failure result');
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    rmSync(directory, { recursive: true, force: true });
  }
});
