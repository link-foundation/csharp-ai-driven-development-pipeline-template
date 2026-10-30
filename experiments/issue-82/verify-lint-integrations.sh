#!/bin/sh
# Run in the complete actionlint image. Both embedded integrations must execute.
set -eu
fixture=$(mktemp -d)
trap 'rm -rf "$fixture"' EXIT HUP INT TERM
cat > "$fixture/probe.yml" <<'YAML'
name: Integration regression
on: push
jobs:
  probe:
    runs-on: ubuntu-24.04
    steps:
      - run: echo $UNQUOTED
      - shell: python
        run: undefined_variable
YAML
if actionlint -no-color "$fixture/probe.yml" > "$fixture/findings.log" 2>&1; then
  echo 'actionlint missed embedded shell/Python findings' >&2
  exit 1
fi
grep 'SC2086' "$fixture/findings.log" >/dev/null
grep 'undefined name' "$fixture/findings.log" >/dev/null
# shellcheck disable=SC2016 # Deliberately unquoted variable is the test input.
printf '%s\n' '#!/bin/sh' 'echo $UNQUOTED' > "$fixture/probe.sh"
if shellcheck "$fixture/probe.sh" > "$fixture/shell.log" 2>&1; then
  echo 'Standalone shell finding was missed' >&2
  exit 1
fi
grep 'SC2086' "$fixture/shell.log" >/dev/null
echo 'Embedded ShellCheck/Pyflakes and standalone shell regressions passed'
