#!/bin/sh
# The temporary schema exception must preserve unrelated action/shell errors.
set -eu
fixture=$(mktemp -d)
trap 'rm -rf "$fixture"' EXIT HUP INT TERM
cat > "$fixture/probe.yml" <<'YAML'
name: Self-repository regression
on: push
jobs:
  probe:
    runs-on: ubuntu-26.04
    steps:
      - uses: $/.github/actions/csharp-layout
YAML
exception='specifying action "\$/\.github/actions/csharp-layout" in invalid format because ref is missing'
actionlint -no-color -ignore "$exception" "$fixture/probe.yml"
cat >> "$fixture/probe.yml" <<'YAML'
      - uses: $/.github/actions/unknown
      - run: echo $UNQUOTED
YAML
if actionlint -no-color -ignore "$exception" "$fixture/probe.yml" > "$fixture/findings.log" 2>&1; then
  echo 'Schema exception hid unrelated errors' >&2
  exit 1
fi
grep 'actions/unknown' "$fixture/findings.log" >/dev/null
grep 'SC2086' "$fixture/findings.log" >/dev/null
echo 'Self-repository exception preserves other action and shell diagnostics'
