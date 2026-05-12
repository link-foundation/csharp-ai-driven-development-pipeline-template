# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- changelog-insert-here -->

## [0.2.0] - 2026-05-12

Fix CI/CD check differences between pull request and push events

Changes:

- Add `detect-changes` job with cross-platform `detect-code-changes.mjs` script
- Make lint job independent of changeset-check (runs based on file changes only)
- Allow docs-only PRs without changeset requirement
- Handle changeset-check 'skipped' state in dependent jobs
- Exclude `.changeset/`, `docs/`, `experiments/`, `examples/` folders and markdown files from code changes detection

Add changesets workflow similar to JavaScript template

- Add `.changeset/` directory with config.json and README.md
- Add `validate-changeset.mjs` script for PR validation
- Add `merge-changesets.mjs` script for merging multiple changesets
- Update `version-and-commit.mjs` to support changeset and instant modes
- Update CI/CD workflow with changeset validation and automatic releases
- Remove old `changelog.d/` fragment-based system
- Update documentation in README.md and CONTRIBUTING.md

Fix C# release metadata by using language-prefixed GitHub release titles, adding a NuGet badge, and verifying NuGet propagation before release creation.

Attach generated NuGet package artifacts to GitHub Releases during release automation.

Fix release script treating missing tags as already released. The `exec()` helper now propagates command failures even in silent mode, and `checkTagExists()` queries the exact `refs/tags/v<version>` ref, so a missing tag is no longer mistaken for an existing one.
