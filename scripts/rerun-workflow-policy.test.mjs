import { describe, expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';

/** @returns {Record<string, any>} */
const parse = (path) => Bun.YAML.parse(readFileSync(path, 'utf-8'));
const RERUN = '.github/workflows/rerun-infrastructure-failures.yml';
const rerunText = readFileSync(RERUN, 'utf-8');
const rerun = parse(RERUN);
const release = parse('.github/workflows/release.yml');

describe('infrastructure-failure rerun workflow (issue #96)', () => {
  test('listens to the completed CI/CD pipeline by its exact name', () => {
    expect(rerun.on.workflow_run).toEqual({
      workflows: readdirSync('.github/workflows')
        .filter((file) => /\.ya?ml$/.test(file))
        .map((file) => parse(`.github/workflows/${file}`))
        .filter((workflow) =>
          Object.values(workflow.jobs).some(
            (job) => job.needs && job.if === 'always()',
          ),
        )
        .map((workflow) => workflow.name)
        .sort(),
      types: ['completed'],
    });
    expect(rerun.jobs.rerun.if).toBe(
      "github.event.workflow_run.conclusion == 'failure'",
    );
  });

  test('runs only trusted default-branch code with least privilege', () => {
    const job = rerun.jobs.rerun;
    expect(rerun.permissions).toEqual({ contents: 'read' });
    expect(job.permissions).toEqual({
      contents: 'read',
      actions: 'write',
      checks: 'read',
    });
    const checkout = job.steps.find((step) =>
      step.uses?.startsWith('actions/checkout@'),
    );
    expect(checkout.with).toEqual({
      ref: '${{ github.sha }}',
      'persist-credentials': false,
    });
    // The numeric run id is the only value taken from the triggering run.
    const eventValues = rerunText.match(/github\.event\.workflow_run\.[\w.]+/g);
    expect([...new Set(eventValues)].sort()).toEqual([
      'github.event.workflow_run.conclusion',
      'github.event.workflow_run.id',
    ]);
    expect(job.steps.at(-1).run).toBe('node scripts/runner-acquisition.mjs rerun');
    expect(job.concurrency['cancel-in-progress']).toBe(false);
    expect(job['timeout-minutes']).toBe(5);
  });

  test('the status gate can read jobs and annotations to name the cause', () => {
    const gate = release.jobs['pipeline-status'];
    expect(gate.permissions).toEqual({
      contents: 'read',
      actions: 'read',
      checks: 'read',
    });
    const step = gate.steps.find(
      (s) => s.run === 'bash scripts/check-pipeline-status.sh',
    );
    expect(step.env.GH_TOKEN).toBe('${{ github.token }}');
  });

  test('macOS stays blocking unless NON_BLOCKING_MACOS is explicitly enabled', () => {
    expect(release.jobs.test['continue-on-error']).toBe(
      "${{ matrix.os == 'xcode-27' && vars.NON_BLOCKING_MACOS == 'true' }}",
    );
  });
});
