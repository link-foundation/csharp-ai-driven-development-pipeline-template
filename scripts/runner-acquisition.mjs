#!/usr/bin/env node
/**
 * Recognise jobs that GitHub never handed to a hosted runner (issue #96).
 *
 * When hosted capacity runs out (usually macOS arm64), GitHub gives up on a
 * queued job with the annotation "The job was not acquired by Runner of type
 * hosted even after multiple attempts". The job ends `cancelled` (sometimes
 * `failure`) with no runner and no steps: no code ran, yet the release gate
 * and the terminal status gate see an ordinary failed job.
 *
 * "No runner and no steps" alone is not enough evidence. A job that job-level
 * concurrency cancels while it is still queued looks identical in the jobs API
 * (run 41299533544, `Detect Changes`: cancelled, runner_name "", 0 steps) and
 * only its annotation, "Canceling since a higher priority waiting request ...
 * exists", tells the two apart. So a job counts as unacquired only when it is
 * runnerless *and* its check run carries the not-acquired annotation.
 *
 * CLI (used by .github/workflows/rerun-infrastructure-failures.yml):
 *   node scripts/runner-acquisition.mjs rerun
 * Environment: GH_TOKEN, REPO (owner/name), RUN_ID, optional DRY_RUN=true,
 * MAX_ATTEMPTS (default 3) and GITHUB_API_URL.
 */
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { fetchWithRetries } from './fetch-with-retries.mjs';

/** @type {import('./process-types.js').Fetch} */
const request = fetch;

export const NOT_ACQUIRED = 'was not acquired by Runner';
/** Attempt 1 plus at most two automatic reruns. */
export const MAX_ATTEMPTS = 3;
const FAILED = ['cancelled', 'failure', 'timed_out'];

/** A finished job that never reached a runner and never ran a step. */
export function isRunnerless(job) {
  return (
    job?.status === 'completed' &&
    ['cancelled', 'failure'].includes(job.conclusion) &&
    !job.runner_name &&
    (job.steps ?? []).length === 0
  );
}

/** Jobs that are runnerless and annotated as not acquired by a hosted runner. */
export function unacquiredJobs(jobs, annotationsById) {
  return jobs.filter(
    (job) =>
      isRunnerless(job) &&
      (annotationsById.get(job.id) ?? []).some((annotation) =>
        String(annotation?.message ?? '').includes(NOT_ACQUIRED),
      ),
  );
}

/** Finished jobs that did not succeed (used to surface non-blocking legs). */
export function failedJobs(jobs) {
  return jobs.filter(
    (job) => job?.status === 'completed' && FAILED.includes(job.conclusion),
  );
}

/**
 * Decide what to do with a completed run.
 * @returns {{ action: 'nothing' | 'rerun' | 'give-up', reason: string }}
 */
export function decideRerun({
  run,
  latestRunId,
  unacquired,
  maxAttempts = MAX_ATTEMPTS,
}) {
  if (run.status !== 'completed' || run.conclusion !== 'failure')
    return {
      action: 'nothing',
      reason: `run is ${run.status}/${run.conclusion ?? 'pending'}, not a completed failure`,
    };
  if (latestRunId !== run.id)
    return {
      action: 'nothing',
      reason: `run ${latestRunId} superseded it on the same branch and event`,
    };
  if (!unacquired.length)
    return {
      action: 'nothing',
      reason: `every job of attempt ${run.run_attempt} reached a runner; real failures are never rerun`,
    };
  const names = unacquired.map((job) => job.name).join(', ');
  if (run.run_attempt >= maxAttempts)
    return {
      action: 'give-up',
      reason: `${names} found no hosted runner in ${run.run_attempt} attempts`,
    };
  return {
    action: 'rerun',
    reason: `${names} found no hosted runner in attempt ${run.run_attempt}`,
  };
}

export function createGitHubClient({
  token,
  fetchImpl = request,
  apiUrl = 'https://api.github.com',
  retry = {},
}) {
  if (!token) throw Error('GH_TOKEN is required to read workflow jobs');
  return async function api(path, { method = 'GET' } = {}) {
    const response = await fetchWithRetries(
      `${apiUrl}/${path}`,
      {
        method,
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${token}`,
          'x-github-api-version': '2022-11-28',
        },
      },
      fetchImpl,
      retry,
    );
    if (!response.ok)
      throw Error(`GitHub API ${method} ${path}: HTTP ${response.status}`);
    return response.status === 204 || method !== 'GET' ? null : response.json();
  };
}

export async function listAttemptJobs(api, repo, runId, attempt) {
  const jobs = [];
  for (let page = 1; page <= 10; page++) {
    const body = await api(
      `repos/${repo}/actions/runs/${runId}/attempts/${attempt}/jobs?per_page=100&page=${page}`,
    );
    jobs.push(...(body.jobs ?? []));
    if (jobs.length >= (body.total_count ?? 0) || !body.jobs?.length) break;
  }
  return jobs;
}

/** Read one attempt and return its jobs plus the unacquired subset. */
export async function inspectAttempt(api, repo, runId, attempt) {
  const jobs = await listAttemptJobs(api, repo, runId, attempt);
  const annotations = new Map();
  for (const job of jobs.filter(isRunnerless))
    annotations.set(
      job.id,
      await api(`repos/${repo}/check-runs/${job.id}/annotations`),
    );
  return { jobs, unacquired: unacquiredJobs(jobs, annotations) };
}

export async function rerunInfrastructureFailures({
  api,
  repo,
  runId,
  dryRun = false,
  maxAttempts = MAX_ATTEMPTS,
  log = console.log,
}) {
  if (!/^[A-Za-z0-9-]+\/(?!\.\.?$)[\w.-]+$/.test(repo ?? ''))
    throw Error(`Invalid repository: ${repo}`);
  if (!/^\d+$/.test(String(runId ?? ''))) throw Error(`Invalid run id: ${runId}`);
  const run = await api(`repos/${repo}/actions/runs/${runId}`);
  const latest = await api(
    `repos/${repo}/actions/workflows/${run.workflow_id}/runs?branch=${encodeURIComponent(
      run.head_branch ?? '',
    )}&event=${encodeURIComponent(run.event ?? '')}&per_page=1`,
  );
  const { unacquired } =
    run.status === 'completed' && run.conclusion === 'failure'
      ? await inspectAttempt(api, repo, run.id, run.run_attempt)
      : { unacquired: [] };
  const decision = decideRerun({
    run,
    latestRunId: latest.workflow_runs?.[0]?.id,
    unacquired,
    maxAttempts,
  });
  if (decision.action === 'nothing') {
    log(`Leaving run ${run.id} as it is: ${decision.reason}.`);
  } else if (decision.action === 'give-up') {
    log(
      `::error title=Hosted runner not acquired::${decision.reason}. GitHub's runner capacity is outside this repository; rerun later with \`gh run rerun ${run.id} --failed --repo ${repo}\`.`,
    );
  } else {
    log(
      `::warning title=Hosted runner not acquired::${decision.reason}; rerunning the failed jobs and the jobs that waited for them.`,
    );
    if (dryRun) log('DRY_RUN=true: not requesting the rerun.');
    else
      await api(`repos/${repo}/actions/runs/${run.id}/rerun-failed-jobs`, {
        method: 'POST',
      });
  }
  return decision;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  if (process.argv[2] !== 'rerun') {
    console.error('Usage: node scripts/runner-acquisition.mjs rerun');
    process.exit(2);
  }
  const api = createGitHubClient({
    token: process.env.GH_TOKEN,
    apiUrl: process.env.GITHUB_API_URL || undefined,
  });
  const decision = await rerunInfrastructureFailures({
    api,
    repo: process.env.REPO,
    runId: process.env.RUN_ID,
    dryRun: process.env.DRY_RUN === 'true',
    maxAttempts: Number(process.env.MAX_ATTEMPTS || MAX_ATTEMPTS),
  });
  if (decision.action === 'give-up') process.exitCode = 1;
}
