// Read-only check of scripts/runner-acquisition.mjs against a real run.
// Usage: GH_TOKEN=$(gh auth token) node experiments/issue-96/dry-run-rerun.mjs \
//   link-foundation/links-notation 41477660740
// It prints the unacquired jobs of every attempt and the decision the rerun
// workflow would take, with DRY_RUN semantics (no rerun is requested).
import {
  createGitHubClient,
  inspectAttempt,
  rerunInfrastructureFailures,
} from '../../scripts/runner-acquisition.mjs';

const [repo, runId] = process.argv.slice(2);
const api = createGitHubClient({ token: process.env.GH_TOKEN });
const run = await api(`repos/${repo}/actions/runs/${runId}`);
for (let attempt = 1; attempt <= run.run_attempt; attempt++) {
  const { jobs, unacquired } = await inspectAttempt(api, repo, runId, attempt);
  console.log(
    `attempt ${attempt}: ${jobs.length} jobs, unacquired: ${
      unacquired.map((job) => job.name).join(', ') || 'none'
    }`,
  );
}
const decision = await rerunInfrastructureFailures({ api, repo, runId, dryRun: true });
console.log(JSON.stringify(decision));
