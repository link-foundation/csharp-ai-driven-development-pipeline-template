# Issue 82: requirements, research and verification plan

Scope: one PR, #83, for #71–#82. Read all twelve issue bodies, paginated
comments, native sub-issues and all three PR feedback endpoints. At initial
inspection there were no PR comments/reviews; #80 has three setup comments.
Base: `4cc372ebf2075a0c948b46881143f7d66f0f0e7e`.

## Requirements inventory and proposed solutions

| Issue | Requirements and implementation plan | Verification plan |
| --- | --- | --- |
| #71 | Pass the PR author through the environment; exempt exactly `dependabot[bot]` before computing diffs. Branch names confer no exemption. | Bot, ordinary author, missing author and spoofed branch regressions. |
| #72, #79 | Remove workflow-wide reader/writer serialization. Put every main writer in `main-writer-${{ github.repository }}`, with `cancel-in-progress: false`, `queue: max`. Give readers independent cancellable groups. Use bounded fetch/rebase retries for non-fast-forward races, fatal GH006/GH013 diagnostics, no force push. | Workflow policy and real bounded bare-remote race/protected-write tests. Independently validate queue policy; suppress only actionlint's obsolete queue-key diagnostic. |
| #73 | Explicit C# `build-mode: none`; remove autobuild. Preserve C# and Actions coverage; add JavaScript helper coverage. Explain generated-source limitations for template consumers. | Workflow policy; real CodeQL run and retained SARIF. |
| #74 | Compare entire directory components relative to scanned root, everywhere traversal checks exclusions. | Oversized Robin/Combiner, `.github`, checkout names containing excluded strings, real bin/obj exclusions. |
| #75 | Restrict Codecov to actual test report directory; disable unrelated plugins and preserve upload errors. Missing token fails a separate main-only job with setup instructions; PRs remain usable and release does not depend on this job. | Workflow policy; main/PR configuration cases. |
| #76 | Shared bounded retry for network errors, 429, 5xx; exponential backoff and per-request deadline; 404 remains immediate; retain network cause and attempt count. | Both registry probes: recovery, exhaustion, 404, 429/5xx, permanent errors. |
| #77 | Retry Wayback network/timeout/429/5xx/unreadable responses. Separate confirmed absence from failed/unknown lookup, with rerun guidance and false `all_archived`. Update terminal link messages consistently. | Snapshot recovery, definite absence, permanent HTTP errors, malformed answers, exhausted lookups and CLI annotations. |
| #78 | Both changeset consumers reject any invalid file before mutation, deletion, commit or push. Validate modified pending changesets too; use one strict parser. | Mixed valid/invalid files retain all bytes, version, changelog, refs and tags in bare-remote regression; valid merge/bump still works. |
| #80 authentication | Official pinned NuGet/login first in each trusted preflight/publishing job; lint and test must wait for preflight before expensive work; fresh keys near use; tolerate only login attempt failure. Explicit method/outcome selects temporary key, then deliberate stored `NUGET_API_KEY` fallback. Username alone proves configuration only. Preserve separate authenticated/authorized/unknown states; PackageVerify HTTP 400 and derived keys cannot prove original push scope. Report sanitized reasons; no keys cross jobs. | OIDC success without fallback or with invalid unused fallback; unavailable/failed OIDC with valid fallback; both fail; missing username/policy/expired temporary key; realistic verify limitations; fork/report mode; both release paths and preflight dependency ordering. |
| #80 publication | At most one same-artifact fallback on real push HTTP 401/403, after anonymous exact-version lookup. HTTP 400, transport/build/test/docs failures stay fatal. Validate actual nupkg identity/version/SPDX/license bytes; test release-built package before publishing. Preserve indexing and anonymous install/execute. Preserve existing nonempty public assets; repair missing/empty/draft assets only; verify required release assets. Never promote after failed publication/consumer checks. | Authentication classification and duplicate-safe retry tests; generated package fixtures; public rerun byte preservation; protected writes; failed-publication gates. Live template/generated main run with SHA/URL, method, exact identity/version and anonymous consumer evidence remains required. |
| #80 setup | Document actual profile, exact package/owner/repository/workflow policy, official tools, fallback preservation, no wildcard/placeholder registration or automatic key rotation. Management-tool issues are references, not new product scope here. | Configuration validation and setup documentation. **External blocker:** template identity is `MyPackage` / `Your Name`; #80 explicitly forbids registering that placeholder against unrelated public packages. No intended real package/owner is supplied. Do not manufacture live publication evidence. |
| #81 scan verdict | Retain original SARIF; fatal gate rejects all findings (including notes), failed/warning diagnostics, missing/empty/malformed reports/runs/results/invocations and unknown execution. Empty result list is valid only for a complete successful scan. | Clean/finding/incomplete/malformed fixture matrix and terminal required gate. |
| #81 dependencies | Locked restore, full direct/transitive NuGet audit, fatal audit/provider warnings and validated JSON on PR/main/schedule; preserve exact graph and audit artifacts. Clean/vulnerable/unverified states stay distinct. No native dependencies exist in this template; do not add unrelated ecosystems. | Existing direct/transitive vulnerability fixtures, malformed/provider/missing graph tests; actual audit and lock files for every project including examples. |
| #81 helper/lint | Analyze maintained JS helpers/experiments; pinned lint/format/type policy shared locally/CI. Keep complete digest-pinned actionlint ShellCheck/Pyflakes integrations, lint standalone shell, fail when native integrations are missing. Run for relevant helper changes and schedules, not just workflow paths. | Bounded lint integration regression, actual repository checks and helper tests. Avoid broad tree/rule exclusions. |
| #81 artifacts/gates | Review pinned artifact implementations; verified raw download and safe extraction if deprecated unzip path persists. Reject ambiguous ZIPs, traversal, absolute/drive paths and symlinks before writing. Real upload/download with deprecations fatal and preserved bytes/hashes. Always-running required security and pipeline gates reject unexpected skips/failures/cancellations/missing work; retain run identity and evidence. | Malicious archive fixtures; real CI round trip; aggregate job checks and report artifacts. |
| #82 delivery | Keep all work on prepared branch and single PR, preserve history, add release changeset, merge latest main if necessary, run local checks, inspect full diff, verify latest-SHA CI, update title/body and retain one positive closing keyword per #71–#82. Mark PR ready; do not merge. Explicitly identify already-resolved behavior and any unexecuted blocked acceptance. | Final clean tree, current main ancestry, PR feedback/diff review, timestamp/SHA checked CI logs. |

## Research and component choices

- [GitHub concurrency documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
  and [May 2026 announcement](https://github.blog/changelog/2026-05-07-github-actions-concurrency-groups-now-allow-larger-queues/)
  confirm `queue: max` (100 pending), incompatible with cancellation.
- [Official NuGet trusted publishing](https://learn.microsoft.com/en-us/nuget/nuget-org/trusted-publishing)
  supplies short-lived one-hour keys through [NuGet/login](https://github.com/NuGet/login).
  Reuse this supported component; do not implement custom OIDC exchange.
- [NuGet Audit](https://learn.microsoft.com/en-us/nuget/concepts/auditing-packages)
  supports full transitive audit with `NuGetAuditMode=all`; .NET 8 defaults to
  direct-only. Use the SDK's supported audit instead of an unrelated scanner.
- [CodeQL build modes](https://docs.github.com/en/code-security/reference/code-scanning/codeql/build-options-for-compiled-languages)
  support C# without compilation; generated-code projects may need explicit manual builds.
- [Codecov inputs](https://github.com/codecov/codecov-action)
  provide report directory restrictions, explicit files, disabled search and `plugins: noop`.
- [Artifact v8 behavior](https://github.com/actions/download-artifact/releases/tag/v8.0.0)
  verifies digests by default and supports raw download. Review actual pinned source
  before selecting extraction; never suppress runtime deprecation warnings.
- [Pinned upload-artifact v7 inputs](https://github.com/actions/upload-artifact/blob/cf430e030ddbb5b0abf93d22962f4752f3646cd9/README.md#inputs)
  specify that `archive: false` ignores `name` and registers the original filename.
  The download probe must request `probe.zip` explicitly.
- Existing repository Bun tests, retry helpers, release recovery, consumer smoke
  helper and workflow policy tests are the starting point. No application runtime
  dependency is needed for the small JS fixes. Use pinned ESLint recommended rules, Prettier and TypeScript checkJs for all
  maintained helpers/experiments, with Bun tests and a frozen audited lockfile.
  These established tools cover lint, format and type checks without adding a
  product runtime or silently excluding source trees.
  [checkJs documentation](https://www.typescriptlang.org/tsconfig/checkJs.html).

## Execution checklist

- [x] Read scope, all comments/reviews, local contributing guidance and current main.
- [x] Inventory requirements and compare official documentation/components.
- [x] Add failing reproductions before fixes; save experiment scripts under experiments/.
- [x] Implement script and workflow fixes in independently useful commits.
- [x] Run local helper, format, build, C# test, audit and lint checks sequentially under memory limit.
- [x] Push only prepared branch; update PR with full evidence and closing references.
- [x] Download nonpassing CI logs under ci-logs/, inspect errors with line numbers,
      fix causes, and verify latest SHA and terminal gates.
- [x] Review complete PR diff, feedback, current main ancestry and clean working tree.
- [ ] Mark PR ready; record externally blocked live-publication acceptance honestly.

## Local verification record

.NET SDK 8.0.427, Bun 1.4.4, Node 26.12.1; builds run sequentially
under the 2.92 GiB container limit. Initial regressions failed before the
corresponding fixes (nine issue reproductions, three publication fallback
cases, and conflicting ZIP local-header metadata). Experiment sources are in
`experiments/issue-82/`.

- `bun install --frozen-lockfile` and `bun run check`: pass. Exact pinned
  ESLint recommended rules, Prettier and TypeScript checkJs cover maintained
  helpers/tests/experiments; no source-wide suppression.
- `GITHUB_EVENT_NAME=pull_request bun test scripts/*.test.mjs`: 296 pass,
  zero failures, including the hosted-environment and artifact-name regressions.
- `bash experiments/issue-82/verify-local-package.sh`: locked restore,
  Release build with warnings fatal, 21 C# tests, pack, actual metadata/license
  validation, fresh isolated consumer install/build/execute all pass.
- `dotnet format --verify-no-changes --verbosity diagnostic`: pass.
- `node scripts/audit-dependencies.mjs` and `node scripts/audit-javascript.mjs`:
  pass; all three project lockfiles and full helper dependency lock committed.
- Complete digest-pinned actionlint/ShellCheck/Pyflakes image: pass, including
  embedded shell/Python, standalone shell and missing native integration regressions.
- zizmor 1.29.0 regular and pedantic high/high policies: no findings.
- File size check and `git diff --check`: pass.
- Pinned download-artifact v8 still contains `MatcherStream`'s deprecated
  `new Buffer('')`. The finite retained experiment fails with DEP0005 under
  `--throw-deprecation`; the workflow uses raw verified download plus safe
  extraction instead. The actual hosted round trip passed; see evidence below.

The local package is the unpublished **template test fixture** `MyPackage`
0.3.16. It is never uploaded publicly. This proves package/consumer code locally,
not the blocked real package identity, publisher policy or main publication
acceptance in #80. Required new main SHA/run URL, selected credential method,
public exact package/version consumer, GitHub release and configured docs
verification remain unfinished until that external setup is supplied.

## First hosted run investigation

All five runs were created at 2026-10-30 01:34:47 UTC for commit
`550059b09681b6306bb4d94abb262b105d126d1d`. Workflow lint, docs and links
passed. All three CodeQL languages passed the strict SARIF gate; dependency
review, full NuGet audit and all three C# platforms passed. The security and
pipeline terminal gates correctly rejected these failures:

| Evidence | Root cause | Reproduction and correction |
| --- | --- | --- |
| [Helper log](../ci-logs/helper-checks-40986681017.log), lines 492–529; [lint log](../ci-logs/lint-40986680962.log), lines 591–629 | Two local changeset fixtures inherited hosted `GITHUB_EVENT_NAME=pull_request`, so the strict validator refused their unverified PR diff. | Running the fixture with that event reproduced two failures. Set explicit local fixture context; actual PR validation remains strict. |
| Helper log, lines 766–806 | Cold Roslyn metadata compilation crossed Bun's 5-second default. Bun 1.4.4 silently ignored `[test] timeout` in bunfig. | Retained finite `experiments/issue-82/reproduce-bun-timeout.mjs` proves the ignored setting and the supported explicit timeout. Remove the ineffective config; set a bounded 30-second default only in the metadata-test file. |
| [Upload log](../ci-logs/artifact-upload-40986681017.log), lines 177–185; [download log](../ci-logs/artifact-download-40986681017.log), line 168 | Raw upload registered `probe.zip`; download requested the ignored custom name `integrity-probe`. | New policy regression fails before correction and passes after matching the actual filename. Raw download, fatal deprecations, digest verification and safe extraction remain required. |

Full failed-run logs were also downloaded to `ci-logs/security-40986681017.log`
and `ci-logs/pipeline-40986680962.log` locally; the focused job logs above are
committed for review. Run URLs:
[Security](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/40986681017),
[CI/CD](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/40986680962).

## Hosted verification after corrections

All five workflows passed for head `d0fd6b8e4a1d281214da6b869150da0b58ce9e3a`,
created 2026-10-30 01:47:49 UTC:
[CI/CD](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/40987944970),
[Security](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/40987944930),
[Workflows](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/40987944981),
[docs](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/40987944815),
[links](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/40987944912).
This includes both required terminal gates, all three CodeQL languages, all
three C# platforms, 296 helper tests, full dependency audits, real local pack
and isolated consumer checks, and the real artifact upload/download probe.

The PR merge ref tested was `180c6c50f1e246d84ef338dd9f9ae251793fcb70`.
Artifact ID `12947673186` contains 141 raw ZIP bytes, SHA-256
`9fa07d16b5fea13271a1b6e16a40c25c902b5d51245c0598eaef68d9574b225b`;
the extracted text is SHA-256
`8b98ff7e12ce2772da378acf1b6c21f885e982471cf06a0d2733908b620e5911`.
The retained `artifact-integrity-180c6c50f1e246d84ef338dd9f9ae251793fcb70`
artifact records both hashes, run URL and merge SHA. Upload and download use
`NODE_OPTIONS=--throw-deprecation`; extraction additionally passes
`node --throw-deprecation`. No deprecation suppression is used.

Final review added a failing workflow regression for preflight ordering:
lint and matrix tests previously ran independently of preflight. Both now
require its successful verdict before expensive work. Their manual-dispatch
status conditions still handle the deliberately skipped change detector.
This final change passes local helper/quality/actionlint/zizmor checks;
latest-head hosted results and final PR readiness are recorded in PR #83.
Only GitHub's automated code-scanning setup notice was added during review;
there are no inline review requests or human review changes to resolve.
