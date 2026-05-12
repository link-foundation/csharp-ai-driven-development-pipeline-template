#!/usr/bin/env bash
# Reproduce the bug from issue #9:
# version-and-commit.mjs reports already_released=true for a tag that doesn't exist.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK_DIR="$(mktemp -d -t version-and-commit-repro-XXXXXX)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "Reproducer working in $WORK_DIR"

cd "$WORK_DIR"
mkdir remote.git repo
git init -q --bare -b main remote.git
cd repo
git init -q -b main
git remote add origin "$WORK_DIR/remote.git"
git config user.email test@example.com
git config user.name 'Test User'
git config commit.gpgsign false
git config tag.gpgsign false
git commit --allow-empty -q -m 'init'

mkdir -p src/MyPackage .changeset
cat > src/MyPackage/MyPackage.csproj <<'EOF'
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <Version>2.3.0</Version>
  </PropertyGroup>
</Project>
EOF

cat > .changeset/feature.md <<'EOF'
---
'MyPackage': minor
---

Add a feature
EOF

git add -A
git commit -q -m 'snapshot'
git push -q -u origin main

# Sanity check: confirm v2.4.0 does NOT exist.
if git rev-parse --verify --quiet refs/tags/v2.4.0 >/dev/null; then
  echo "Unexpected: tag v2.4.0 already exists"
  exit 1
fi

# Use a fake GITHUB_OUTPUT to capture output values.
export GITHUB_OUTPUT="$WORK_DIR/gh-output.txt"
: > "$GITHUB_OUTPUT"

set +e
bun run "$REPO_ROOT/scripts/version-and-commit.mjs" --mode changeset
EXIT=$?
set -e

echo "---- GITHUB_OUTPUT ----"
cat "$GITHUB_OUTPUT"
echo "---- exit code: $EXIT ----"

if grep -q 'already_released=true' "$GITHUB_OUTPUT"; then
  echo "BUG REPRODUCED: script reported already_released=true with no tag present"
  exit 1
fi

if ! git rev-parse --verify --quiet refs/tags/v2.4.0 >/dev/null; then
  echo "FAIL: expected v2.4.0 tag to be created"
  exit 1
fi
if ! git log --oneline | grep -q 'chore: release v2.4.0'; then
  echo "FAIL: expected release commit for v2.4.0"
  exit 1
fi

echo "OK: script bumped to 2.4.0, created commit and tag"
exit 0
