The current stable actionlint release is still 1.7.12. Its official Docker image digest `sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667` bundles older interpreter/linter components:

```sh
docker run --rm --entrypoint sh rhysd/actionlint:1.7.12 -c \
  'python3 --version; pyflakes --version; cat /etc/alpine-release; shellcheck --version'
```

Measured on Linux x86_64, 2026-11-14: Python 3.12.12, Pyflakes 3.4.0, Alpine 3.23.3, ShellCheck 0.11.0. Current upstream stable releases are Python 3.15.2, Pyflakes 4.1.0 and Alpine 3.24.4; ShellCheck is already current. Sources: https://www.python.org/downloads/source/ , https://pypi.org/project/pyflakes/ , https://www.alpinelinux.org/releases/ . This is a component freshness report, not a claim that a particular advisory is exploitable through actionlint.

A consumer dependency refresh cannot update the image's individual APK packages while retaining its published digest. Our temporary workaround is to retain the latest official immutable image, document these upstream-owned exceptions and keep negative integration probes proving that both ShellCheck and Pyflakes execute: https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/pull/109 (`scripts/lint-workflows.sh`, `experiments/issue-82/verify-lint-integrations.sh`). We do not disable embedded-script validation.

Could the stable image be rebuilt on the current supported Alpine release with current Python/Pyflakes, publishing a new immutable digest? An image smoke test could assert both tool versions, then feed an undefined Python name and an unquoted shell variable through actionlint to ensure both integrations remain active. The Dockerfile already uses an Alpine build argument and installs `py3-pyflakes`; selecting a current base and verifying the resolved APK versions should make this reproducible. If Alpine's packaged Pyflakes lags, a separately pinned current Pyflakes installation would avoid silently keeping an older analyzer.

The separate schema exceptions we retain are already reported in #657 (queue), #711 (self-repository actions) and #682 (hosted runner labels); this report concerns the bundled tools rather than duplicating those issues. Prepared with AI assistance; the command and versions above were checked locally.
