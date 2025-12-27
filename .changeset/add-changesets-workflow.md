---
'MyPackage': minor
---

Add changesets workflow similar to JavaScript template

- Add `.changeset/` directory with config.json and README.md
- Add `validate-changeset.mjs` script for PR validation
- Add `merge-changesets.mjs` script for merging multiple changesets
- Update `version-and-commit.mjs` to support changeset and instant modes
- Update CI/CD workflow with changeset validation and automatic releases
- Remove old `changelog.d/` fragment-based system
- Update documentation in README.md and CONTRIBUTING.md
