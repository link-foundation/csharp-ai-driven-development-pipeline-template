#!/usr/bin/env node

/**
 * Bump version in csproj and commit changes
 * Used by the CI/CD pipeline for releases
 *
 * Usage: bun run scripts/version-and-commit.mjs --bump-type <major|minor|patch> [--description <desc>]
 */

import { readFileSync, writeFileSync, appendFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Simple argument parsing
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return null;
  return args[index + 1] || '';
};

const bumpType = getArg('bump-type');
const description = getArg('description') || '';

if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
  console.error(
    'Usage: bun run scripts/version-and-commit.mjs --bump-type <major|minor|patch> [--description <desc>]'
  );
  process.exit(1);
}

const CSPROJ_PATH = 'src/MyPackage/MyPackage.csproj';

/**
 * Execute a shell command
 * @param {string} command
 * @param {boolean} silent
 * @returns {string}
 */
function exec(command, silent = false) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    if (silent) return '';
    throw error;
  }
}

/**
 * Append to GitHub Actions output file
 * @param {string} key
 * @param {string} value
 */
function setOutput(key, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `${key}=${value}\n`);
  }
  console.log(`Output: ${key}=${value}`);
}

/**
 * Get current version from csproj
 * @returns {{major: number, minor: number, patch: number}}
 */
function getCurrentVersion() {
  const csproj = readFileSync(CSPROJ_PATH, 'utf-8');
  const match = csproj.match(/<Version>(\d+)\.(\d+)\.(\d+)<\/Version>/);

  if (!match) {
    console.error('Error: Could not parse version from csproj');
    process.exit(1);
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Calculate new version based on bump type
 * @param {{major: number, minor: number, patch: number}} current
 * @param {string} bumpType
 * @returns {string}
 */
function calculateNewVersion(current, bumpType) {
  const { major, minor, patch } = current;

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${bumpType}`);
  }
}

/**
 * Update version in csproj
 * @param {string} newVersion
 */
function updateCsproj(newVersion) {
  let csproj = readFileSync(CSPROJ_PATH, 'utf-8');
  csproj = csproj.replace(
    /<Version>[^<]+<\/Version>/,
    `<Version>${newVersion}</Version>`
  );
  writeFileSync(CSPROJ_PATH, csproj, 'utf-8');
  console.log(`Updated csproj to version ${newVersion}`);
}

/**
 * Check if a git tag exists for this version
 * @param {string} version
 * @returns {boolean}
 */
function checkTagExists(version) {
  try {
    exec(`git rev-parse v${version}`, true);
    return true;
  } catch {
    return false;
  }
}

/**
 * Collect changelog fragments and update CHANGELOG.md
 * @param {string} version
 */
function collectChangelog(version) {
  const changelogDir = 'changelog.d';
  const changelogFile = 'CHANGELOG.md';

  if (!existsSync(changelogDir)) {
    return;
  }

  const files = readdirSync(changelogDir).filter(
    (f) => f.endsWith('.md') && f !== 'README.md'
  );

  if (files.length === 0) {
    return;
  }

  const fragments = files
    .sort()
    .map((f) => readFileSync(join(changelogDir, f), 'utf-8').trim())
    .filter(Boolean)
    .join('\n\n');

  if (!fragments) {
    return;
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const newEntry = `\n## [${version}] - ${dateStr}\n\n${fragments}\n`;

  if (existsSync(changelogFile)) {
    let content = readFileSync(changelogFile, 'utf-8');
    const lines = content.split('\n');
    let insertIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('## [')) {
        insertIndex = i;
        break;
      }
    }

    if (insertIndex >= 0) {
      lines.splice(insertIndex, 0, newEntry);
      content = lines.join('\n');
    } else {
      content += newEntry;
    }

    writeFileSync(changelogFile, content, 'utf-8');
  }

  console.log(`Collected ${files.length} changelog fragment(s)`);
}

try {
  // Configure git
  exec('git config user.name "github-actions[bot]"');
  exec('git config user.email "github-actions[bot]@users.noreply.github.com"');

  const current = getCurrentVersion();
  const newVersion = calculateNewVersion(current, bumpType);

  // Check if this version was already released
  if (checkTagExists(newVersion)) {
    console.log(`Tag v${newVersion} already exists`);
    setOutput('already_released', 'true');
    setOutput('new_version', newVersion);
    process.exit(0);
  }

  // Update version in csproj
  updateCsproj(newVersion);

  // Collect changelog fragments
  collectChangelog(newVersion);

  // Stage csproj and CHANGELOG.md
  exec('git add src/MyPackage/MyPackage.csproj CHANGELOG.md');

  // Check if there are changes to commit
  try {
    exec('git diff --cached --quiet', true);
    // No changes to commit
    console.log('No changes to commit');
    setOutput('version_committed', 'false');
    setOutput('new_version', newVersion);
    process.exit(0);
  } catch {
    // There are changes to commit (git diff exits with 1 when there are differences)
  }

  // Commit changes
  const commitMsg = description
    ? `chore: release v${newVersion}\n\n${description}`
    : `chore: release v${newVersion}`;
  exec(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
  console.log(`Committed version ${newVersion}`);

  // Create tag
  const tagMsg = description
    ? `Release v${newVersion}\n\n${description}`
    : `Release v${newVersion}`;
  exec(`git tag -a v${newVersion} -m "${tagMsg.replace(/"/g, '\\"')}"`);
  console.log(`Created tag v${newVersion}`);

  // Push changes and tag
  exec('git push');
  exec('git push --tags');
  console.log('Pushed changes and tags');

  setOutput('version_committed', 'true');
  setOutput('new_version', newVersion);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
