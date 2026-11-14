# Issue 108 investigation and acceptance record

Research date: 2026-11-14 UTC. PR: https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/pull/109.
Baseline: `e33364e12bb727a64115a25d0c5d464757f20c7a`.
Implementation verified by hosted CI: `3679365af31c3721570d77169d297f5f5eaa87dd`.
The final evidence commit also receives CI; its final result belongs in the PR.

## Scope and source material

Read the full issue, its one conversation comment, all three PR feedback endpoints
(conversation comments, inline comments and reviews), related merged PRs #94 and
#101, and the dependency-update practices linked by the issue. Initial and final
feedback snapshots are retained here. All three PR feedback lists were empty at
the final research snapshot. `sub-issues.json` is empty: there are no required
child issues. References to earlier #80/#82/#91 work in historical documents do
not add new publication acceptance work to #108; their safeguards remain active.

The issue comment corrects the provisional run statuses in the issue body:
Workflows and Security on `e33364e` already passed, while Pipeline failed. Docs
passed on an earlier SHA and the earlier link check failed. We matched actual
run SHA/timestamps before attributing failures to dependency updates. The
original #102/#106 failures were also downloaded and investigated, although
their complementary merges had already repaired the CodeQL version mismatch.
No merged update was reverted.

## Every requirement, options and selected plan

The IDs below cover the prose requirements as well as the ecosystem lists and
later feedback. Evidence paths are relative to this directory; implementation
paths are relative to the repository root.

| ID | Requirement | Possible solutions and selected execution | Implementation / verification / status |
| --- | --- | --- | --- |
| R01 | Read issue, all comments, required children and all kinds of PR feedback | Use paginated GitHub APIs and retain snapshots rather than relying on the initial description | `issue.json`, `issue-comments.json`, `sub-issues.json`, final feedback JSON; complete |
| R02 | Analyze default-branch runs after #102–107, including the corrected final statuses | Match timestamps/SHA; download failed-job logs and full failed main runs; distinguish dependency errors from provider/configuration failures | `initial-main-runs.json`, `ci-logs/`, root-cause table below; complete investigation |
| R03 | Fix every dependency regression without reverting merged updates or suppressing validation | Keep current CodeQL pair, group future updates; migrate SDK/runtime consumers; test actual errors | CodeQL pin test and new Dependabot group test; NU1512, glob cap, actionlint and filesystem regressions corrected; hosted CI passes |
| R04 | Default-branch CI must become green | Merge the reviewed PR through normal protection, then configure owner-only release prerequisites and run main CI | **Unfinished / external owner blocker**: no direct merge is authorized; NuGet publisher/key/identity and Codecov token failures are detailed below; PR CI success does not satisfy this requirement |
| R05 | Update JavaScript first, every direct/dev and transitive dependency, across majors where applicable | Registry `latest` metadata plus Bun's native upgrade/lock resolver; npm-check-updates is an alternative, but npm install would create an unrelated second lock | `package.json`, regenerated `bun.lock`; 106 entries / 104 unique names in `dependencies.md`; frozen install, 382 tests, lint/format/types and Bun audit pass |
| R06 | Update .NET SDK, target, every project/package and transitive lock | Compare official SDK release metadata and NuGet stable versions; update shared target and compatible private test reference; regenerate all project locks | SDK 11.0.100, net11.0, Test SDK 18.12.0, xUnit 4.0.3, Bcl.AsyncInterfaces 11.0.0; all three locks, 21 tests, Release build, format, pack and consumer smoke pass |
| R07 | Update every Action, reusable/composite reference and hidden analyzer version | Resolve release tags to immutable commit SHAs; keep all repeated references identical; inspect action inputs instead of assuming wrapper version updates its analyzer | 16 action repositories inventoried; setup-node 7.1.0, create-pull-request 8.1.3, zizmor 1.32.0; `action-pins.test.mjs`, policy tests and hosted action runs pass |
| R08 | Update infrastructure, hooks, base images, shell-installed tools and language versions | Inspect all manifests, shell invocations and Docker metadata; use latest official hosted images and stable tooling; document upstream-owned immutable exceptions | Ubuntu 26.04, xcode-27/macOS 27, Windows 2025/VS2026; pre-commit hooks 6.0.0, actionlint 1.7.12, ShellCheck 0.11.0, Bun 1.4.4 and lychee 0.24.2 already current; exception table below |
| R09 | Produce before/latest/selected tables for every dependency using registries, with written reasons for everything left behind | Retain compact npm/NuGet/PyPI/GitHub/release metadata; generate tables rather than relying on memory | `registry/`, `dependencies.md`, reproducible `experiments/issue-108/inventory.py` and `report.py`; every incompatible transitive major identifies its parent constraint |
| R10 | Read major migration guides, adapt APIs and resolve new deprecations without skipping tests or loosening constraints | Review .NET 11, Node 23–26 and setup-node 7 notes; reproduce affected behavior before changing consumers | Migration section below; locked-mode audit regression; native CRC32; fatal-deprecation artifact round trip passes; no newly disabled tests |
| R11 | Use new upstream functionality and delete replaced handwritten logic | Native `node:zlib` CRC32 replaces two loops; native exact-commit self-repository actions replace relative legacy references | `scripts/zip-archive.mjs`, `experiments/issue-82/zip-fixture.mjs`; existing CRC, malformed archive, path and digest tests still pass; `$/.github/actions/csharp-layout` runs successfully |
| R12 | Make constraints honest; remove obsolete overrides; regenerate every lock; keep repeated pins synchronized | Pin actual current runtimes and local DocFX manifest; remove minimatch override now adopted by ESLint; test consistency | `.node-version`, package engine/packageManager floors, `global.json`, shared props, smoke fixtures, docs, Bun and three NuGet locks; pin/framework/DocFX policy tests pass |
| R13 | Dependabot must cover every ecosystem and manifest directory, including additions | Retain existing five ecosystem configurations; add `/.config` and a group for coupled CodeQL actions; Renovate is an alternative without a necessary benefit here | `.github/dependabot.yml` covers root, examples, src, tests, local tools and composite actions; new policy tests plus GitHub Dependabot config check pass |
| R14 | Run the full build/test/lint suite for every ecosystem after updates | Sequential bounded local validation plus three hosted OS runners, CodeQL and full gates; preserve full logs | Local/hosted verification table below; all checks pass on implementation SHA, including macOS without enabling NON_BLOCKING_MACOS |
| R15 | Audit the resulting dependency tree with no unresolved known findings | Bun audit plus complete NuGet locked restore/audit and dependency review; pip-audit additionally checks disposable Python tools | `bun-audit.json`, `dotnet-audit.json`, graph files, `python-audit.json`: zero reported advisories; hosted audit/review pass; no OS-container audit claim |
| R16 | Search upstream first, report general workarounds/bugs with minimal reproductions, versions and proposals, link reports in PR | Search all existing issues/comments; update open reports rather than duplicate; retain local safeguards until an upstream fix ships | Five reports posted, table below; bounded experiments and exact comment bodies/URLs retained in `upstream/`; existing actionlint issues linked |
| R17 | Apply requirements across the whole codebase, including duplicate pins, examples, scripts and docs | Search all current executable/configuration files and fixtures; keep historical measurements accurate rather than rewriting history | Shared target inherited by all three projects; smoke default/fixtures and documentation updated; all workflow runtime pins and analyzer versions checked; nine DocFX links corrected |
| R18 | Keep one PR, useful atomic commits, history and authorized branch; prepare next release | Regular commits on `issue-108-555c331829cb`; check origin/main ancestry; major changeset for the breaking framework/runtime requirements | Implementation commits 691b84f, 1dde8de, 7b20bef, 3679365; current main is an ancestor; `.changeset/current-dependencies-and-dotnet11.md`; release workflow will consume it |
| R19 | Add automated regression coverage and verify bugs fail before/pass after | Real SDK stale-lock test, real actionlint negative probes, bounded glob reproducer and sink-failure before/after experiment | Locked audit and lint probes run in CI; `print-untrusted.test.mjs` fails with prior helper and passes now; no tests skipped to hide major changes |
| R20 | Compile deep analysis, alternative components, plans and verification under requested folder | Retain raw source/log evidence, add this requirement map and dependency tables; exclude only archived research from product link crawling/log mutation | This directory; archives retain original diagnostic bytes; current source/docs remain linted and link checked; no visual UI changes requiring screenshots |
| R21 | Final review, actual title/body with closing keyword, clean tree, all current-commit checks, ready PR and no merge | Review complete `gh pr diff`, refresh feedback/main, run final evidence checks, push and wait final CI, update PR then mark ready | Implementation diff reviewed; final operational confirmation is recorded in PR after the evidence commit; **Fixes #108** remains in PR body; main-only blocker remains explicit |

## Root causes and exact log evidence

All line numbers refer to retained files, not a moving web log. The PR checks
were reviewed after each push; failed experiments were kept rather than erased.

| Failure | Evidence | Root cause and correction |
| --- | --- | --- |
| Original #102 CodeQL initialization/analysis failures | `ci-logs/pr102-security-failed.log:1074,1104` | init 4.39.3 and analyze 4.39.1 disagree on internal action version. #106's complementary merge restores equality; group `github/codeql-action/*` for future Dependabot updates. All three current CodeQL jobs pass. |
| Original #106 CodeQL failures | `ci-logs/pr106-security-failed.log` | analyze 4.39.3 ran with init 4.39.1 on that PR. Same coupled-action cause, not separate language build defects. |
| Original helper and lint gate failures | `ci-logs/pr102-security-failed.log:1392`, `ci-logs/pr102-pipeline-failed.log:1019` | Existing action pin guard correctly rejects multiple SHAs from the same repository. Keep the guard and consistent current pins. |
| Main Codecov failure | `ci-logs/main-pipeline-43602041497.log:46` | CODECOV_TOKEN is missing; the existing main guard correctly fails with setup instructions. PRs intentionally use report mode. |
| Main NuGet preflight failure | `ci-logs/main-pipeline-43602041497.log:567,592,594,3282` | No matching trusted-publisher policy (401), unchanged MyPackage/Your Name template identity, and fallback API key lacks push scope (403). This is repository/provider configuration, not fixed by a package downgrade. |
| Earlier main link checker failure | `ci-logs/main-links-43402853117.log:275,336` | An external GitHub PR URL returned HTTP 500 after bounded retries. Current hosted link checks pass with the same bounded policy. No permanent link bypass added. |
| First updated workflow lint run | `ci-logs/workflows-43604067933.log:428` | Docker action args parser recognizes double quotes, not shell single quotes; a regex was split into filenames. Use double-quoted args in YAML, keep shell quoting in local script. |
| First updated runner policy run | `ci-logs/security-43604260723.log:546` | Test still expected macos-15 after the intentional xcode-27 upgrade. Update all runner fixtures/policies together; three OS coverage remains blocking by default. |
| Temporary lint fixture on new label | `ci-logs/workflows-43604903675.log:432` | A fixture outside the repo cannot auto-discover `.github/actionlint.yaml`. Pass `-config-file` explicitly in both fixture scripts. |
| Changeset mutation fixture ordering | `ci-logs/security-43604903694.log:745` | readdir returned b.md,a.md on Ubuntu 26.04. Filesystem enumeration order is unspecified. Sort only the asserted file set; preserve content, hash, remote and no-mutation checks. |
| .NET 11 audit warning NU1512 | `locked-audit-regression.log`, `dotnet11-release.md` | `--force-evaluate` overrides `--locked-mode` by design; use `--force` to refresh assets/advisories without changing lock resolution. Real stale lock fails NU1004 and stays byte-identical. |
| New minimatch expansion-cap behavior | `scripts/helper-globs.test.mjs` / `final-javascript-tests.log` | Current patched minimatch throws RangeError when the finite cap is exceeded instead of truncating alternatives. Assert rejection and below-cap correct matching. |
| Untrusted-output sink failure | `output-restore-regression.log` | Throwing during the payload left runner command processing suspended. Restore in finally; regression fails with 7b20bef's helper and passes with the new helper. |
| DocFX warnings on current tool | `docs-build.log` | Nine historical relative links resolve against DocFX's virtual output tree and fail. Link their existing repository files with permanent GitHub URLs. Current build: zero warnings/errors. |

## Major migrations and removal decisions

The [SDK 11 release metadata](https://builds.dotnet.microsoft.com/dotnet/release-metadata/releases-index.json)
and [.NET 11 compatibility guide](https://learn.microsoft.com/en-us/dotnet/core/compatibility/11)
were read before moving the SDK and shared target. No application API in this
small library needs a new overload; the audit workflow does need the locked-mode
change above. The current private Bcl.AsyncInterfaces reference raises xUnit's
older compatible minimum; xUnit's exact internal 4.0.3 constraints remain intact.
[xUnit release notes](https://xunit.net/releases/v3/4.0.3) and the retained VSTest
release metadata informed the test package upgrades. Full tests and pack/consume
validation verify this is an actual net11 migration. It is a breaking minimum
framework change, so a major changeset is included.

The Node floor previously allowed 22 while CI used ambient newer versions. Read
the [23](https://nodejs.org/en/blog/release/v23.0.0),
[24](https://nodejs.org/en/blog/release/v24.0.0),
[25](https://nodejs.org/en/blog/release/v25.0.0), and
[26](https://nodejs.org/en/blog/release/v26.0.0) major release/migration notes.
The repository uses ESM and no native addons; removed legacy Buffer/HTTP/private
APIs are not used in its source. A vendored artifact dependency still uses the
deprecated Buffer constructor, so its existing raw-download path is necessary.
Node's [native CRC32](https://nodejs.org/api/zlib.html#zlibcrc32data-value) removes
both handwritten loops while preserving archive validation. Every workflow that
runs JavaScript installs the same exact .node-version; Bun has a matching current
engine floor. Repeated types/runtime pins and consumer fixtures were checked.

[setup-node 7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0)
includes the v7 ESM migration. This repository uses neither removed dummy
NODE_AUTH_TOKEN behavior nor automatic dependency caching; caching is explicitly
disabled and Bun handles its own lock. The action runs successfully on current
Linux, Windows and macOS hosted images. The other action bumps are patches;
already-current major versions were not gratuitously changed.

[Ubuntu 26.04 GA](https://github.blog/changelog/2026-09-17-ubuntu-26-generally-available-and-latest-migration/)
and [xcode-27 GA](https://github.blog/changelog/2026-10-15-xcode-27-runner-image-generally-available/)
announcements establish the stable labels. xcode-27 is the standard Apple Silicon
image; the paid xlarge variant is unnecessary. Windows 2025 already names the
current VS2026 image. Latest actionlint does not yet recognize the new labels,
so its documented configuration registers them locally; hosted execution confirms
actual availability. Both macOS queue acquisition and execution were awaited.

Latest ESLint/config-array natively depend on minimatch ^11.0.5: the repository's
override is now redundant and removed. No replacement override forces incompatible
transitive majors. `dependencies.md` identifies older parent-owned module/API
constraints, including Ajv, find-up, visitor keys and nested hookified. Updating
their parent migrations belongs upstream; falsifying their graph is not safe.

## Existing components considered

| Need | Existing component | Decision |
| --- | --- | --- |
| Group related Action bumps | [Dependabot groups](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#groups) | Use the existing service's native group, preserving all ecosystem coverage and cooldowns. |
| Broader dependency automation | [Renovate grouped presets](https://docs.renovatebot.com/presets-group/) | Viable alternative already suggested by the issue; switching bots adds migration/configuration without improving this focused group fix. |
| Cross-major JS manifest updates | [npm-check-updates](https://github.com/raineorshine/npm-check-updates) and [Bun update](https://bun.sh/docs/cli/update) | Native Bun resolution plus registry latest checks updates the actual existing lock; no second package manager or npm lock introduced. |
| NuGet upgrade discovery | [dotnet-outdated](https://github.com/dotnet-outdated/dotnet-outdated) and [native package listing](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-package-list) | Native graph/audit plus NuGet registry comparison covers direct/transitive stable versions; adding a persistent upgrade tool is unnecessary. |
| CRC32 and ZIP | [Node zlib](https://nodejs.org/api/zlib.html#zlibcrc32data-value), [artifact SDK](https://github.com/actions/toolkit/tree/main/packages/artifact), [zip.js](https://github.com/gildas-lormeau/zip.js) | Adopt native CRC32; retain bounded digest/path/CRC-checked raw ZIP extraction until the SDK's vendored Buffer bug is fixed. Adding another archive dependency does not fix runner transport behavior. |
| Reproducible documentation tool | [.NET local tools](https://learn.microsoft.com/en-us/dotnet/core/tools/local-tools-how-to-use) and [DocFX](https://github.com/dotnet/docfx) | Commit a pinned local tool manifest, restore it in CI and add Dependabot directory/path coverage. |
| Current workflow linter integrations | [Official actionlint image](https://github.com/rhysd/actionlint/blob/main/docs/install.md), standalone binary plus separate tools, community fork | Keep the newest official immutable image and its proven integrations; report stale bundled tools upstream. A fork/custom image changes publisher and build trust and is not silently substituted. |
| Workflow command-safe output | [Runner command controls](https://docs.github.com/en/actions/reference/workflow-commands-for-github-actions#stopping-and-starting-workflow-commands) / [Actions toolkit](https://github.com/actions/toolkit) | Keep the random stop/resume wrapper with finally; propose a native literal-output API upstream. |

## Upstream reports and retained safeguards

All reports were preceded by searches and complete reading of relevant issue
discussions. Bodies include affected current versions, finite reproductions,
the local workaround and a concrete fix/proposal. Exact posted bodies and URLs
are retained in `upstream/`. None of these reports establishes an upstream fix.

| Dependency / problem | Report | Local evidence and retained safeguard |
| --- | --- | --- |
| actionlint immutable image contains older Python, Pyflakes, Alpine and Go provenance | [New #779](https://github.com/rhysd/actionlint/issues/779) | `actionlint-bundled-tools.log`, Dockerfile copy and registry metadata; newest official image retained, exceptions explicit in dependency table. |
| Bun 1.4.4 ignores TOML test timeout | [Existing #7789 updated](https://github.com/oven-sh/bun/issues/7789#issuecomment-6878832700) | `bun-timeout-reproduction.log`, finite six-second case: TOML seven-second setting fails at five; per-file setDefaultTimeout passes. Keep existing per-file timeout workaround. |
| lychee 0.24.2 omits retry on nested connect I/O reset | [Existing #2297 updated](https://github.com/lycheeverse/lychee/issues/2297#issuecomment-6878833021) | `reproduce-lychee-reset.py`, finite max-two-retry TLS reset server sees one connection; keep bounded transient-failure adapter and fatal permanent-status behavior. |
| Actions runner accepts modern command prefix mid-line | [Existing #4692 updated](https://github.com/actions/runner/issues/4692#issuecomment-6878833407) | v2.338.2 `runner-ActionCommand.cs.txt` shows IndexOf(prefix); source finding, not a claimed live exploit. Preserve safe-output wrapper and its finally regression. |
| download-artifact 8.0.2 vendored unzipper uses legacy Buffer | [Existing #484 updated](https://github.com/actions/download-artifact/issues/484#issuecomment-6878833830) | `artifact-buffer-reproduction.log`, bounded exact-bundle VM under Node 26.13.1 --throw-deprecation; raw download + verified extraction passes real upload/download CI. Toolkit #2003 and PR #490 also linked. |

Existing actionlint [queue #657](https://github.com/rhysd/actionlint/issues/657),
[schema #654](https://github.com/rhysd/actionlint/issues/654),
[self-repository #711](https://github.com/rhysd/actionlint/issues/711),
[implementation #732](https://github.com/rhysd/actionlint/pull/732), and
[new runner labels #682](https://github.com/rhysd/actionlint/issues/682) already
describe the schema gaps. Link these instead of filing duplicates. Narrow exact
message exceptions preserve unrelated unknown actions and SC2086 diagnostics;
automated negative probes verify that fact. Remove each exception when its fix
ships. The ESLint minimatch workaround was already fixed upstream and was deleted.

## Verification evidence

| Check | Result | Retained evidence |
| --- | --- | --- |
| Frozen Bun install and full JS suite | 382 passed, zero failed; 1,218 expectations across 41 files | `bun-frozen-install.log`, `final-javascript-tests.log` |
| ESLint, Prettier, TypeScript | All pass | `final-javascript-check.log` |
| .NET restore/build/format | Release build zero warnings/errors; all locks accepted | `dotnet-restore.log`, `dotnet-build.log`, `dotnet-format.log` |
| .NET tests/coverage | 21 passed, zero failed | `dotnet-tests.log`, `final-pre-commit.log` |
| Locked audit regression | Good lock passes; stale framework fails NU1004 without rewriting | `locked-audit-regression.log` |
| Pack, package validator and net11 consumer | All pass; consumer loads MyPackage 0.3.16 | `pack.log`, `package-validation.log`, `package-smoke.log` |
| All pre-commit hooks | All pass, including full .NET build/test hooks | `final-pre-commit.log` |
| actionlint, embedded/standalone ShellCheck and Pyflakes | All pass, including expected negative probes | `final-workflow-lint.log`, `python-lint.log` |
| zizmor regular and high/high pedantic | Both pass with 1.32.0; no severity/confidence weakening | `zizmor-ci.log`, `zizmor-pedantic.log` |
| DocFX 2.81.0 | Zero warnings and zero errors | `docfx-restore.log`, `docs-build.log` |
| Security audits | Bun/NuGet full direct+transitive graphs and Python validation tools: zero findings | Audit JSON and graph files; hosted dependency review/audit pass |
| Complete hosted implementation CI | All passing, including three OS tests, CodeQL's three languages, fatal-deprecation artifact probes, docs, links, audits and gates | `passing-implementation-pipeline.json`, `passing-implementation-security.json`; see PR for final evidence commit |

Local heavy .NET commands ran sequentially with one MSBuild process, shared
compilation disabled and a 1 GiB managed heap limit. No repeated killed compiler
experiment or full unbounded memory/stack stress was used. Scripts are retained
under `experiments/` for reuse. This is a tooling/configuration change with no
visual UI changes, so screenshot acceptance requirements do not apply.

## Remaining blocked criteria and limits

**R04 is not complete.** Main remains at the pre-PR commit; changing main directly
would violate the authorized PR-only workflow. Main's release jobs additionally
need real owner-supplied provider/account configuration. To complete it through
the normal merge and release process, the owner must:

1. Set the intended owned NuGet PackageId, Authors and other required template
   metadata; a generic unowned MyPackage name must not be published as a shortcut.
2. Match the NuGet trusted-publisher policy to this repository, actual NuGet user,
   release workflow and any environment; configure NUGET_USER consistently.
   If retaining API-key fallback, supply a key with push scope for that identity.
3. Configure a valid CODECOV_TOKEN for this repository, then rerun main's strict
   preflight/coverage/release checks after the reviewed PR is merged.

The failed main log gives explicit existing instructions for these prerequisites.
PRs continue to pass the pre-existing report-mode preflight and skip secret-only
publication/coverage-token gates; default-branch checks still fail explicitly when
required configuration is missing. No token was fabricated, no publication was
attempted and no release guard was disabled. An upstream report or a green PR does
not prove owner/provider configuration or successful main publication.

The newest official actionlint artifact still bundles the older components listed
in `dependencies.md`. Their upstream publication is separately blocked; the table
does not claim those components were upgraded or that their OS packages were
security audited. Incompatible parent-owned transitive majors also have explicit
reasons per row. These exceptions are visible for review rather than hidden by a
claim that every bundled byte is the latest possible release.
