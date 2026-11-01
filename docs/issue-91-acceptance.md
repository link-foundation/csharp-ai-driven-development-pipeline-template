# Issue 91: publication acceptance and setup evidence

Status: **unfinished; provider setup and the publication target are blocked**.
PR: [#92](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/pull/92).
Investigation date: 2026-11-01 UTC.

## Plan and requirements

- [x] Read #91, #80, #82, all eleven #82 sub-issues, their comments, and
  PR #92 conversation/inline comments/reviews. Read the recent merged PR #83,
  its conversation, inline comments and reviews. #91 has no native sub-issues;
  #92 has no feedback at initial inspection.
- [x] Verify current main, authenticated GitHub identity, available secret
  names, repository variables, provider sessions and saved CI evidence.
- [ ] Confirm the intended unique package ID and owner, or an explicitly
  chosen generated repository. A clarification is pending; no identity is
  inferred from the template name or borrowed from Data.Doublets.
- [ ] Inspect and configure the exact NuGet publisher policy using the
  authorized account and approved flow. Preserve OIDC first and the supplied
  `NUGET_API_KEY` fallback, recording configuration separately from method used.
- [ ] Resolve the independent main Codecov setup gate through its authorized
  provider setup flow, then verify a real coverage upload.
- [ ] Run automatic and instant/manual release acceptance on the chosen
  repository's main, retaining same-artifact bounded fallback and version safety.
- [ ] Record main SHA/run, package ID/version, selected credential method,
  exact anonymous download, isolated consumer execution, required public release
  assets and configured documentation evidence.
- [ ] Reconcile #80/#82 completion only after that evidence succeeds.
- [x] Investigate and fix the new PR helper-audit failure; use bounded
  regression cases and existing hosted validation rather than duplicate builds.
- [ ] Update the single prepared PR, review its diff, verify latest-head CI
  and a clean tree. Keep it unmerged while required acceptance is unfinished.

The code changes for #71–#79/#81 and authentication/asset safeguards from #80
are already on main through #83. Their requirement-to-test mapping is in
[the preceding plan](issue-82-plan.md). This PR must preserve them. Successful
downstream Data.Doublets publication is not this repository's acceptance.

## Current main and historical run

Current main is `565f4bd6546cb64b6639a34f4354090e455350e3`. The prepared
branch contains this commit. The latest push-triggered main
[CI/CD run 40989121123](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/40989121123)
was created at **2026-10-30 02:00:19 UTC**, attempt 1, and failed at that SHA.
Later Dependabot updater runs are not release runs. These logs were downloaded
again on November 1; their events still describe October 30.

| Check | Saved evidence | Result and limit |
| --- | --- | --- |
| NuGet OIDC exchange | [Preflight log](../ci-logs/issue-91-main-preflight-40989121123.log), line 210 | HTTP 401, no matching trust policy owned by `konard` found for that exchange. This is historical runtime evidence, not a fresh inspection of provider settings. |
| Selected preflight method | Preflight log, lines 234 and 239 | `token-fallback`; the supplied key validity probe passed. Package-scoped push authorization remains unknown. No package was published. |
| Publishing identity | Preflight log, lines 235–241 | The required identity guard rejected `MyPackage` / `Your Name`, and preflight failed. Version `0.3.16` remains the local template fixture here; a package already exists publicly under that generic ID, which cannot establish this repository's acceptance. |
| Codecov | [Codecov log](../ci-logs/issue-91-main-codecov-40989121123.log), line 46 | Empty `CODECOV_TOKEN`; the separate main configuration gate failed with setup instructions. |
| Dependent stages | Main run's jobs | Lint, matrix tests, build and both release jobs were skipped. Pipeline Status failed. These skips establish no publication acceptance. |
| Documentation | [Main docs run 40989121232](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/40989121232), same SHA | Site build passed; deployment was explicitly disabled, and the Pages deployment job was skipped. A built site is not deployed-docs evidence. |

## Fresh read-only setup inspection

Authenticated GitHub CLI identity is `konard`, with repository admin access.
Only repository variable `NUGET_USER=konard` exists. Repository secret metadata
is empty. The repository's available organization-secret metadata includes the
intentionally configured `NUGET_API_KEY`; there is no available organization
`CODECOV_TOKEN`. Secret **values** were not read or changed.

There are no configured environments. The GitHub Pages API returns HTTP 404,
and `DEPLOY_GITHUB_PAGES` is unset. This agrees with the recorded disabled docs
deployment. It is not evidence that a configured site's deployment succeeded.

The available browser redirects NuGet `/account/` to its sign-in page. Codecov
settings show a logged-out page, and GitHub browser settings redirect to sign-in.
The browser was closed after inspection. There is no authenticated NuGet policy
or Codecov settings session in this workspace. GitHub CLI authorization cannot
stand in for those providers' authentication. Current policy contents, owner and
activation state therefore remain **unverified**.

No provider settings, credentials, publisher policies, releases or Pages
configuration were changed. No workflow was dispatched to publish the fixture.

## Newly reproduced helper-audit failure

The initial PR head `83bf8f18c5aecb0d9271211b0423a377759ccfad` started
[Security run 41281784926](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/41281784926)
at 2026-11-01 06:40:39 UTC. Its tested PR merge SHA was
`b881559d38afd39f5a6e361346c1b575fce15033`. All 296 helper tests and helper
quality checks passed, then the full JavaScript audit correctly failed.
The downloaded Helper Checks job log, saved locally as
`ci-logs/issue-91-initial-helper-124775005732.log`, records the failure at lines
773–781. The
[Helper Checks job](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/41281784926/job/124775005732)
retained artifact `13074215076`; its
[copied audit JSON](../ci-logs/issue-91-javascript-audit-before.json) identifies
the transitive ESLint dependency `minimatch` 10.2.6 and
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
The advisory affects versions below 11.0.1; updating only ESLint to its currently
available 10.14.0 still requests minimatch 10.x, as does the latest config-array.

Pin the transitive dependency to the upstream patched **11.0.1** through a
package override and retain its resolved integrity in `bun.lock`. Version 11
changes some public APIs, so verify the actual APIs used by ESLint/config-array
(`Minimatch` and `match`) and test file discovery/ignore behavior explicitly.
Do not exempt the advisory or weaken the audit. Revisit the override when
ESLint's dependency range includes a patched version.

[The bounded regression](../scripts/helper-globs.test.mjs) uses just four
`**/../a/b` sections: the vulnerable release produces sixteen alternatives
despite an eight-alternative limit; patched 11.0.1 respects the limit. It failed
before the fix and passed afterward. A second test runs real ESLint discovery
over nested `.mjs`/`.js` fixtures and confirms both findings and ignored paths.
No stress input or vulnerability-scanner exception is needed.

Local verification on Bun 1.4.4 / Node 26.13.0:

- The existing `node scripts/audit-javascript.mjs` failed on the original lock
  and passes with the patched lock, returning `{}` from the vulnerability
  provider. Frozen install and complete lint/format/type checks pass.
- The two new bounded tests pass; 64 focused existing authentication,
  publication, asset and pipeline tests pass. Full helper and C# package/consumer
  checks are delegated to the existing hosted CI for this commit to avoid
  duplicating builds locally.

These are code/dependency checks only. They do not resolve any live publication
or provider configuration criterion below.

## Required acceptance record

These fields intentionally remain unfilled until actual execution is possible.

| Criterion | Required evidence | Current state |
| --- | --- | --- |
| Target identity | Explicit repository, unique PackageId, real Authors, NuGet package owner and policy creator | Blocked: no target choice supplied. `NUGET_USER` identifies a profile, not the intended package owner. |
| Publisher configuration | Saved exact repository, `.github/workflows/release.yml`, environment matching the publishing jobs (currently none), exact package IDs and active policy | Blocked: target identity and authenticated provider setup unavailable. Never create a wildcard or register `MyPackage`. |
| Authentication | Actual preflight and publishing job methods, sanitized outcomes; fresh temporary keys per job | Historical preflight selected `token-fallback`; no new release method or push authorization verified. Preserve the existing fallback secret. |
| Codecov | Authorized repository token setup, saved GitHub secret name and successful upload on current main | Blocked: no token configured or authenticated provider setup available. Keep the missing-token main gate fatal and PRs usable without secrets. |
| Automatic release | New main push run URL/SHA, successful relevant validation/build/test/release and terminal gates | Unexecuted: identity/setup blocked; this PR is unmerged. |
| Instant/manual release | `workflow_dispatch` on chosen main, mode `instant`, distinct immutable version and same successful gates | Unexecuted: same blockers. Branch dispatch is not main acceptance and must not publish. |
| Public consumer | Exact package ID/version, anonymous package URL/hash, fresh isolated cache/home, install/build/execute output | Unexecuted for the chosen real package. Mocked tests and a local fixture cannot satisfy it. |
| Release assets | Matching public tag/release URL, required package/symbol/source assets, downloaded hashes; immutable originals preserved on rerun | Unexecuted for the required new real publication. |
| Documentation | Configured deployment/run URL, deployed site URL and correct content for the accepted revision | Deployment is currently disabled. Record the chosen docs configuration and verify it if enabled. |
| Completion | Acceptance record covers #91 and the remaining #80/#82 criteria | Unfinished. Closed issue states from #83 do not establish successful acceptance. Keep this PR unmerged. |

After the target and provider access are supplied, use the existing official
NuGet/login flow and documented setup in [README](../README.md). Inspect saved
state before mutation; avoid duplicate policies. Read back GitHub settings after
repair. Execute both paths only on the authorized main target. Keep failures
fatal, record actual methods separately from configured policies, and obtain
exact public-consumer and asset evidence before declaring completion.
