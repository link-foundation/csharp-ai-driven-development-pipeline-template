---
'MyPackage': patch
---

Fix a script-injection sink in the release workflow: the *Validate changeset* step interpolated `${{ github.head_ref }}` directly into its `run:` body, so on a pull request from a fork the attacker-controlled branch name became shell syntax before the shell ever parsed it. The branch name is now read from the `GITHUB_HEAD_REF` environment variable, and the changeset validator path uses the `CSHARP_ROOT` variable the step already declared. Also quotes the two `>> $GITHUB_OUTPUT` redirections (SC2086). Adds a `Workflows` job that runs `actionlint` with its bundled shellcheck on every `.github/workflows/**` change, plus `scripts/workflow-injection-policy.test.mjs`, which fails if any workflow interpolates attacker-controlled context into a `run:` script.
