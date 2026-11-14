#!/bin/sh
# Prove the sink-failure regression fails on the prior implementation and passes now.
set -eu
fixture=$(mktemp -d)
trap 'rm -rf "$fixture"' EXIT HUP INT TERM
cp scripts/print-untrusted.test.mjs "$fixture/print-untrusted.test.mjs"
git show 7b20bef:scripts/print-untrusted.mjs > "$fixture/print-untrusted.mjs"
if bun test --test-name-pattern 'resumes command processing' "$fixture/print-untrusted.test.mjs" > "$fixture/before.log" 2>&1; then
  echo 'Expected the original sink-failure regression to fail' >&2
  exit 1
fi
grep '0 pass' "$fixture/before.log" >/dev/null
grep '1 fail' "$fixture/before.log" >/dev/null
cp scripts/print-untrusted.mjs "$fixture/print-untrusted.mjs"
bun test --test-name-pattern 'resumes command processing' "$fixture/print-untrusted.test.mjs"
echo 'Output restoration regression fails before the fix and passes afterward'
