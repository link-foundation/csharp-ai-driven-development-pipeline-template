import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { validateJobResults } from './security-gates.mjs';
import {
  createGitHubClient,
  failedJobs,
  inspectAttempt,
} from './runner-acquisition.mjs';

export function checkPipeline({ needs, event, ref, releaseMode }) {
  const expected = ['release-preflight'];
  if (!['push', 'pull_request', 'workflow_dispatch'].includes(event))
    throw Error(`Unknown release event: ${event}`);
  if (event !== 'workflow_dispatch') {
    expected.push('detect-changes');
    validateJobResults(needs, expected);
    if (
      !['true', 'false'].includes(needs['detect-changes'].outputs?.['any-code-changed'])
    )
      throw Error('Missing change detector verdict');
  }
  const code =
    event === 'workflow_dispatch' ||
    needs['detect-changes'].outputs['any-code-changed'] === 'true';
  if (code) expected.push('lint', 'test', 'build');
  if (event === 'pull_request' && code) expected.push('changeset-check');
  if (event === 'push' && ref === 'refs/heads/main') {
    expected.push('codecov-token');
    if (code) expected.push('release');
  }
  if (event === 'workflow_dispatch') {
    if (ref !== 'refs/heads/main' || !['instant', 'changeset-pr'].includes(releaseMode))
      throw Error('Manual releases require main and a known release mode');
    expected.push(releaseMode === 'instant' ? 'instant-release' : 'changeset-pr');
  }
  const known = [
    'detect-changes',
    'release-preflight',
    'changeset-check',
    'lint',
    'test',
    'build',
    'codecov-token',
    'release',
    'instant-release',
    'changeset-pr',
  ];
  validateJobResults(needs, expected);
  for (const name of known) {
    if (!needs[name] || !['success', 'skipped'].includes(needs[name].result))
      throw Error(
        `Incomplete pipeline job ${name}: ${needs[name]?.result ?? 'missing'}`,
      );
    if (!expected.includes(name) && needs[name].result !== 'skipped')
      throw Error(`Unexpected pipeline job execution: ${name}`);
  }
  if (Object.keys(needs).some((name) => !known.includes(name)))
    throw Error('Unclassified pipeline job; update the required gate');
}
/**
 * Explain the attempt's job results without changing the verdict: a job that
 * never got a hosted runner keeps the gate red (nothing was tested) but is
 * named as an infrastructure failure, and a non-blocking leg that failed while
 * the gate passed gets its own warning (issue #96).
 */
export async function explainAttempt({
  api,
  repo,
  runId,
  attempt,
  gateFailed,
  log = console.log,
}) {
  const { jobs, unacquired } = await inspectAttempt(api, repo, runId, attempt);
  if (unacquired.length)
    log(
      `::${gateFailed ? 'error' : 'warning'} title=Hosted runner not acquired::${unacquired
        .map((job) => job.name)
        .join(
          ', ',
        )}. GitHub could not provide a runner; no code ran. rerun-infrastructure-failures.yml reruns these automatically.`,
    );
  const unacquiredIds = new Set(unacquired.map((job) => job.id));
  // This job is still in progress, so failedJobs never lists the gate itself.
  const failed = failedJobs(jobs).filter((job) => !unacquiredIds.has(job.id));
  if (!gateFailed && failed.length)
    log(
      `::warning title=Non-blocking job did not succeed::${failed
        .map((job) => `${job.name} (${job.conclusion})`)
        .join(', ')}. The gate passed because these jobs do not block a release.`,
    );
  return { unacquired, failed };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  let failure;
  try {
    checkPipeline({
      needs: JSON.parse(process.env.NEEDS_JSON || '{}'),
      event: process.env.EVENT_NAME,
      ref: process.env.BRANCH_REF_FULL,
      releaseMode: process.env.RELEASE_MODE,
    });
  } catch (error) {
    failure = error;
  }
  if (process.env.GH_TOKEN && process.env.GITHUB_RUN_ID) {
    try {
      await explainAttempt({
        api: createGitHubClient({
          token: process.env.GH_TOKEN,
          apiUrl: process.env.GITHUB_API_URL || undefined,
        }),
        repo: process.env.GITHUB_REPOSITORY,
        runId: process.env.GITHUB_RUN_ID,
        attempt: process.env.GITHUB_RUN_ATTEMPT || '1',
        gateFailed: Boolean(failure),
      });
    } catch (error) {
      // Diagnostics only: the verdict above never depends on the API.
      console.log(`::notice::Could not inspect job runners: ${error.message}`);
    }
  }
  if (failure) throw failure;
}
