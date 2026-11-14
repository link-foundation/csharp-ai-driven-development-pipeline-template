# Issue 108 / PR 109 work plan

Objective: implement and verify every issue requirement in this PR. Work only on
`issue-108-555c331829cb`; preserve history and leave the PR unmerged.

## Requirements and verification checklist

- [x] Read the complete issue, comments, required sub-issues, PR conversation,
  inline comments and reviews; retain snapshots here.
- [x] Investigate post-Dependabot default-branch failures using timestamp/SHA
  matched run metadata and preserved logs; reproduce root causes and add
  regressions without reverting dependency updates or skipping checks.
- [x] Inventory every direct/transitive dependency, toolchain, action, container,
  hook and shell-installed tool; resolve current releases from official registries
  and publish before/current/selected versions with reasons for exceptions.
- [x] Update JavaScript first, then .NET, Actions and infrastructure; regenerate
  Bun and all NuGet locks, unify repeated pins, and make version floors honest.
- [x] Read release notes/migration guides for major upgrades, adapt consumers,
  remove superseded shims and use applicable upstream functionality.
- [x] Verify Dependabot covers every ecosystem and manifest directory.
- [x] Investigate existing workarounds; search upstream reports before creating
  or updating actionable reports with bounded reproductions and proposals.
- [x] Run all ecosystem builds, tests and lint plus full transitive security
  audits sequentially within the 2.92 GiB container budget. Preserve results.
- [x] Add the release changeset, commit useful atomic work and push only the
  authorized branch; merge the latest main into it if necessary.
- [x] Inspect the complete PR diff for regressions and unintended removals;
  reconcile code, tests, evidence, title and description, including Fixes #108.
- [ ] Verify all current-commit CI checks, record human/external blockers
  accurately, leave a clean working tree, and mark PR 109 ready when complete.
- [ ] Default-branch CI green: externally blocked by owner-managed NuGet and
  Codecov configuration and the required normal PR merge. Do not mark fulfilled
  from passing PR checks. Exact failures and owner actions are in analysis.md.

## Approach and possible solutions

Use registry metadata and existing audit/pin helpers instead of guessing versions.
Prefer upstream built-in upgrade/audit tools over adding another dependency.
For CI failures distinguish code regressions, external service failures and
repository configuration, then repair the actual failure with focused tests.
Review all matching files, including experiments and documentation, for repeated
versions and migration assumptions. The default branch can only receive the fix
through an owner merge; validate this PR and document any remaining main-only
configuration requirement without bypassing branch protection.

Status: implementation commit 3679365 passes all hosted checks, all 382 JavaScript
tests and 21 .NET tests. Five upstream reports were posted with reproductions.
The complete implementation diff and final feedback were reviewed, and the PR
title/description updated. The final evidence commit, ready state and its CI
remain operational steps at this evidence snapshot; final results belong in PR.
There are no required sub-issues. See analysis.md for the full requirement map,
dependency exceptions, test evidence and the explicitly unfinished main criterion.
