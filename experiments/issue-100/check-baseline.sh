#!/usr/bin/env bash
# Run the new regression tests against the original helper/workflow code.
# Nonzero is expected here: each reported defect must be detectable pre-fix.
set -euo pipefail
repo_root=$(git rev-parse --show-toplevel)
baseline=$(mktemp -d)
trap 'rm -rf "$baseline"' EXIT
git -C "$repo_root" archive 1f3b92f71c22717102a21cc5576a514cf11e674f scripts .github package.json LICENSE | tar -x -C "$baseline"
tests=(action-pins nuget-auth check-file-size release-workflow-policy rerun-workflow-policy security-gates recheck-broken-links link-failures sarif-directory)
for name in "${tests[@]}"; do
  cp "$repo_root/scripts/$name.test.mjs" "$baseline/scripts/"
done
cd "$baseline"
args=()
for name in "${tests[@]}"; do args+=("./scripts/$name.test.mjs"); done
bun test "${args[@]}"
