import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

const RELEASE_WORKFLOW = '.github/workflows/release.yml';

const EXPECTED_JOB_TIMEOUTS = new Map([
  ['detect-changes', 5],
  ['changeset-check', 10],
  ['lint', 20],
  ['test', 30],
  ['build', 20],
  ['release', 30],
  ['instant-release', 30],
  ['changeset-pr', 10],
]);

function readWorkflow(filePath) {
  return readFileSync(filePath, 'utf-8').replaceAll('\r\n', '\n');
}

// Jobs whose `needs` graph includes detect-changes, which is intentionally
// skipped for workflow_dispatch. Without a status-check function in their `if`,
// GitHub Actions adds an implicit success() over the skipped dependency and
// skips these jobs (and the release they gate). See issue #23.
const JOBS_REQUIRING_STATUS_CHECK = ['lint', 'test', 'build', 'release', 'instant-release'];

const STATUS_CHECK_FUNCTIONS = ['always()', '!cancelled()', 'cancelled()', 'success()', 'failure()'];

function getJobCondition(jobBlock) {
  const lines = jobBlock.split('\n');
  const ifIndex = lines.findIndex((line) => /^    if:/.test(line));
  if (ifIndex === -1) {
    return '';
  }

  const conditionLines = [lines[ifIndex].replace(/^    if:\s*\|?\s*/, '')];
  for (const line of lines.slice(ifIndex + 1)) {
    // Condition continues while indented deeper than the `if:` key.
    if (/^      \S/.test(line) || line.trim() === '') {
      conditionLines.push(line);
      continue;
    }
    break;
  }

  return conditionLines.join('\n').trim();
}

function getJobBlocks(workflow) {
  const lines = workflow.split('\n');
  const jobsStart = lines.findIndex((line) => line === 'jobs:');
  if (jobsStart === -1) {
    return new Map();
  }

  const blocks = new Map();
  let currentName = '';
  let currentLines = [];

  for (const line of lines.slice(jobsStart + 1)) {
    const match = /^  ([a-zA-Z0-9_-]+):\s*$/.exec(line);
    if (match) {
      if (currentName) {
        blocks.set(currentName, currentLines.join('\n'));
      }
      currentName = match[1];
      currentLines = [line];
      continue;
    }

    if (currentName) {
      currentLines.push(line);
    }
  }

  if (currentName) {
    blocks.set(currentName, currentLines.join('\n'));
  }

  return blocks;
}

describe('release workflow policy', () => {
  test('does not cancel release runs on main when newer pushes arrive', () => {
    const workflow = readWorkflow(RELEASE_WORKFLOW);

    expect(workflow).toContain(
      'group: ${{ github.workflow }}-${{ github.ref }}'
    );
    expect(workflow).toContain(
      "cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}"
    );
    expect(workflow).not.toContain('cancel-in-progress: true');
  });

  test('sets explicit timeout-minutes on every job', () => {
    const workflow = readWorkflow(RELEASE_WORKFLOW);
    const jobBlocks = getJobBlocks(workflow);

    expect([...jobBlocks.keys()]).toEqual([...EXPECTED_JOB_TIMEOUTS.keys()]);

    for (const [jobName, timeoutMinutes] of EXPECTED_JOB_TIMEOUTS) {
      expect(jobBlocks.get(jobName)).toContain(
        `\n    timeout-minutes: ${timeoutMinutes}`
      );
    }
  });

  test('guards jobs with skipped dependencies using a status-check function', () => {
    const workflow = readWorkflow(RELEASE_WORKFLOW);
    const jobBlocks = getJobBlocks(workflow);

    for (const jobName of JOBS_REQUIRING_STATUS_CHECK) {
      const condition = getJobCondition(jobBlocks.get(jobName));
      expect(condition).not.toBe('');
      expect(
        STATUS_CHECK_FUNCTIONS.some((fn) => condition.includes(fn)),
        `Job "${jobName}" must use a status-check function (e.g. always()) because it depends on a possibly skipped job`
      ).toBe(true);
    }
  });

  test('instant-release keeps explicit success checks on its dependencies', () => {
    const workflow = readWorkflow(RELEASE_WORKFLOW);
    const condition = getJobCondition(getJobBlocks(workflow).get('instant-release'));

    expect(condition).toContain("github.event.inputs.release_mode == 'instant'");
    expect(condition).toContain("needs.lint.result == 'success'");
    expect(condition).toContain("needs.test.result == 'success'");
    expect(condition).toContain("needs.build.result == 'success'");
  });

  test('uses the current GitHub Action versions required by the template', () => {
    const workflow = readWorkflow(RELEASE_WORKFLOW);

    expect(workflow).toContain('uses: actions/checkout@v6');
    expect(workflow).toContain('uses: actions/upload-artifact@v7');
    expect(workflow).toContain('uses: peter-evans/create-pull-request@v8');
    expect(workflow).not.toContain('uses: actions/checkout@v4');
    expect(workflow).not.toContain('uses: actions/upload-artifact@v4');
    expect(workflow).not.toContain('uses: peter-evans/create-pull-request@v7');
  });
});
