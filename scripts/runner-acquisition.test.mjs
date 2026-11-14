import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import {
  MAX_ATTEMPTS,
  createGitHubClient,
  decideRerun,
  inspectAttempt,
  isRunnerless,
  rerunInfrastructureFailures,
  unacquiredJobs,
} from './runner-acquisition.mjs';
import { explainAttempt } from './pipeline-gate.mjs';

const fixture = (name) =>
  JSON.parse(readFileSync(`scripts/fixtures/runner-acquisition/${name}.json`, 'utf-8'));
// Real API payloads: a macOS job GitHub never acquired (links-notation run
// 41477660740) and a queued job cancelled by job-level concurrency in this
// repository (run 41299533544). Both have no runner and no steps.
const unacquired = fixture('links-notation-41477660740-kotlin-ios');
const superseded = fixture('template-41299533544-detect-changes');
const REPO = 'link-foundation/example';

const passed = (id, name) => ({
  id,
  name,
  status: 'completed',
  conclusion: 'success',
  runner_name: 'GitHub Actions 1',
  steps: [{ name: 'Set up job' }],
});
const testFailed = {
  ...passed(3, 'Test (windows-2025)'),
  conclusion: 'failure',
};

/** In-memory GitHub API: routes are matched by path prefix. */
function fakeApi(routes) {
  const calls = [];
  const api = async (path, { method = 'GET' } = {}) => {
    calls.push(`${method} ${path}`);
    for (const [prefix, body] of Object.entries(routes))
      if (path.startsWith(prefix))
        return typeof body === 'function' ? body(path) : body;
    throw Error(`Unexpected API call ${method} ${path}`);
  };
  return { api, calls };
}

function runApi({ jobs, run = {}, latestId = 7, annotations = {} }) {
  return fakeApi({
    [`repos/${REPO}/actions/runs/7/attempts/`]: { total_count: jobs.length, jobs },
    [`repos/${REPO}/actions/runs/7/rerun-failed-jobs`]: null,
    [`repos/${REPO}/actions/runs/7`]: {
      id: 7,
      workflow_id: 11,
      head_branch: 'main',
      event: 'push',
      status: 'completed',
      conclusion: 'failure',
      run_attempt: 1,
      ...run,
    },
    [`repos/${REPO}/actions/workflows/11/runs`]: { workflow_runs: [{ id: latestId }] },
    [`repos/${REPO}/check-runs/`]: (path) => annotations[path.split('/')[4]] ?? [],
  });
}

describe('runner acquisition classification', () => {
  test('the real not-acquired macOS job is runnerless and unacquired', () => {
    const annotations = new Map([[unacquired.job.id, unacquired.annotations]]);
    expect(isRunnerless(unacquired.job)).toBe(true);
    expect(unacquiredJobs([unacquired.job], annotations)).toEqual([unacquired.job]);
  });

  test('a queued job cancelled by concurrency is runnerless but not unacquired', () => {
    const annotations = new Map([[superseded.job.id, superseded.annotations]]);
    expect(isRunnerless(superseded.job)).toBe(true);
    expect(unacquiredJobs([superseded.job], annotations)).toEqual([]);
  });

  test('a job that ran steps and failed is never treated as infrastructure', () => {
    const annotations = new Map([[testFailed.id, unacquired.annotations]]);
    expect(isRunnerless(testFailed)).toBe(false);
    expect(unacquiredJobs([testFailed], annotations)).toEqual([]);
  });

  test('a runnerless job reported as failure (not cancelled) still counts', () => {
    const job = { ...unacquired.job, conclusion: 'failure', runner_name: null };
    expect(unacquiredJobs([job], new Map([[job.id, unacquired.annotations]]))).toEqual([
      job,
    ]);
  });
});

describe('rerun decision', () => {
  const run = { id: 7, status: 'completed', conclusion: 'failure', run_attempt: 1 };
  test('reruns attempts 1 and 2, gives up on attempt 3', () => {
    expect(MAX_ATTEMPTS).toBe(3);
    for (const [attempt, action] of /** @type {[number, string][]} */ ([
      [1, 'rerun'],
      [2, 'rerun'],
      [3, 'give-up'],
    ]))
      expect(
        decideRerun({
          run: { ...run, run_attempt: attempt },
          latestRunId: 7,
          unacquired: [unacquired.job],
        }).action,
      ).toBe(/** @type {any} */ (action));
  });
  test('leaves real failures, superseded runs and unfinished runs alone', () => {
    expect(decideRerun({ run, latestRunId: 7, unacquired: [] }).action).toBe('nothing');
    expect(
      decideRerun({ run, latestRunId: 8, unacquired: [unacquired.job] }).action,
    ).toBe('nothing');
    expect(
      decideRerun({
        run: { ...run, status: 'in_progress', conclusion: null },
        latestRunId: 7,
        unacquired: [unacquired.job],
      }).action,
    ).toBe('nothing');
  });
});

describe('rerunInfrastructureFailures', () => {
  const macos = { ...unacquired.job, id: 2, name: 'Test (xcode-27)' };
  const annotations = { 2: unacquired.annotations };

  test('requests "rerun failed jobs" once for an unacquired job', async () => {
    const { api, calls } = runApi({ jobs: [passed(1, 'Lint'), macos], annotations });
    const logs = [];
    const decision = await rerunInfrastructureFailures({
      api,
      repo: REPO,
      runId: '7',
      log: (line) => logs.push(line),
    });
    expect(decision.action).toBe('rerun');
    expect(calls).toContain(`POST repos/${REPO}/actions/runs/7/rerun-failed-jobs`);
    expect(logs.join('\n')).toContain(
      '::warning title=Hosted runner not acquired::Test (xcode-27)',
    );
  });

  test('never reruns a run whose failure is a test that ran', async () => {
    const { api, calls } = runApi({
      jobs: [passed(1, 'Lint'), testFailed],
      annotations,
    });
    const decision = await rerunInfrastructureFailures({
      api,
      repo: REPO,
      runId: '7',
      log: () => {},
    });
    expect(decision.action).toBe('nothing');
    expect(calls.some((call) => call.startsWith('POST'))).toBe(false);
  });

  test('does not rerun a concurrency cancellation or a superseded run', async () => {
    const cancelled = { ...superseded.job, id: 4 };
    for (const options of [
      { jobs: [cancelled], annotations: { 4: superseded.annotations } },
      { jobs: [macos], annotations, latestId: 9 },
    ]) {
      const { api, calls } = runApi(options);
      await rerunInfrastructureFailures({ api, repo: REPO, runId: '7', log: () => {} });
      expect(calls.some((call) => call.startsWith('POST'))).toBe(false);
    }
  });

  test('gives up after the third attempt with the manual command', async () => {
    const { api, calls } = runApi({
      jobs: [macos],
      annotations,
      run: { run_attempt: 3 },
    });
    const logs = [];
    const decision = await rerunInfrastructureFailures({
      api,
      repo: REPO,
      runId: '7',
      log: (line) => logs.push(line),
    });
    expect(decision.action).toBe('give-up');
    expect(calls.some((call) => call.startsWith('POST'))).toBe(false);
    expect(logs.join('\n')).toContain(`gh run rerun 7 --failed --repo ${REPO}`);
  });

  test('dry run reports but does not rerun; inputs are validated', async () => {
    const { api, calls } = runApi({ jobs: [macos], annotations });
    expect(
      (
        await rerunInfrastructureFailures({
          api,
          repo: REPO,
          runId: '7',
          dryRun: true,
          log: () => {},
        })
      ).action,
    ).toBe('rerun');
    expect(calls.some((call) => call.startsWith('POST'))).toBe(false);
    await expect(
      rerunInfrastructureFailures({ api, repo: REPO, runId: '7; rm', log: () => {} }),
    ).rejects.toThrow('Invalid run id');
    await expect(
      rerunInfrastructureFailures({ api, repo: '../x', runId: '7', log: () => {} }),
    ).rejects.toThrow('Invalid repository');
  });
});

describe('pipeline gate explanation', () => {
  test('names the unacquired job as the cause of a red gate', async () => {
    const macos = { ...unacquired.job, id: 2, name: 'Test (xcode-27)' };
    const { api } = runApi({
      jobs: [passed(1, 'Lint'), macos],
      annotations: { 2: unacquired.annotations },
    });
    const logs = [];
    await explainAttempt({
      api,
      repo: REPO,
      runId: '7',
      attempt: '1',
      gateFailed: true,
      log: (line) => logs.push(line),
    });
    expect(logs).toEqual([
      '::error title=Hosted runner not acquired::Test (xcode-27). GitHub could not provide a runner; no code ran. rerun-infrastructure-failures.yml reruns these automatically.',
    ]);
  });

  test('warns about a non-blocking leg that failed while the gate passed', async () => {
    const { api } = runApi({ jobs: [passed(1, 'Lint'), testFailed] });
    const logs = [];
    await explainAttempt({
      api,
      repo: REPO,
      runId: '7',
      attempt: '1',
      gateFailed: false,
      log: (line) => logs.push(line),
    });
    expect(logs).toEqual([
      '::warning title=Non-blocking job did not succeed::Test (windows-2025) (failure). The gate passed because these jobs do not block a release.',
    ]);
  });

  test('says nothing when every job reached a runner and the gate failed on results', async () => {
    const { api } = runApi({ jobs: [testFailed] });
    const logs = [];
    await explainAttempt({
      api,
      repo: REPO,
      runId: '7',
      attempt: '1',
      gateFailed: true,
      log: (line) => logs.push(line),
    });
    expect(logs).toEqual([]);
  });
});

describe('GitHub client', () => {
  test('authenticates, paginates jobs and reports HTTP failures', async () => {
    const seen = [];
    const fetchImpl = async (url, init) => {
      seen.push([String(url), init.headers.authorization]);
      const page = Number(new URL(String(url)).searchParams.get('page') ?? '1');
      if (String(url).includes('/missing')) return { ok: false, status: 404 };
      return {
        ok: true,
        status: 200,
        json: async () => ({
          total_count: 101,
          jobs:
            page === 1
              ? Array.from({ length: 100 }, (_, id) => ({ id }))
              : [{ id: 100 }],
        }),
      };
    };
    const api = createGitHubClient({
      token: 't',
      fetchImpl,
      apiUrl: 'https://api.test',
    });
    const { jobs } = await inspectAttempt(api, REPO, 7, 1);
    expect(jobs).toHaveLength(101);
    expect(seen[0]).toEqual([
      `https://api.test/repos/${REPO}/actions/runs/7/attempts/1/jobs?per_page=100&page=1`,
      'Bearer t',
    ]);
    await expect(api('missing')).rejects.toThrow('HTTP 404');
    expect(() => createGitHubClient({ token: '' })).toThrow('GH_TOKEN');
  });
});
