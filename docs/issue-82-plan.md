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
| #80 authentication | Official pinned NuGet/login first in each trusted preflight/publishing job; fresh keys near use; tolerate only login attempt failure. Explicit method/outcome selects temporary key, then deliberate stored `NUGET_API_KEY` fallback. Username alone proves configuration only. Preserve separate authenticated/authorized/unknown states; PackageVerify HTTP 400 and derived keys cannot prove original push scope. Report sanitized reasons; no keys cross jobs. | OIDC success without fallback or with invalid unused fallback; unavailable/failed OIDC with valid fallback; both fail; missing username/policy/expired temporary key; realistic verify limitations; fork/report mode; both release paths. |
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
- [ ] Push only prepared branch; update PR with full evidence and closing references.
- [ ] Download nonpassing CI logs under ci-logs/, inspect errors with line numbers,
      fix causes, and verify latest SHA and terminal gates.
- [ ] Review complete PR diff, feedback, current main ancestry and clean working tree.
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
- `bun test scripts/*.test.mjs`: 295 pass, zero failures.
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
  extraction instead. The actual hosted round trip still requires CI evidence.

The local package is the unpublished **template test fixture** `MyPackage`
0.3.16. It is never uploaded publicly. This proves package/consumer code locally,
not the blocked real package identity, publisher policy or main publication
acceptance in #80. Required new main SHA/run URL, selected credential method,
public exact package/version consumer, GitHub release and configured docs
verification remain unfinished until that external setup is supplied.
