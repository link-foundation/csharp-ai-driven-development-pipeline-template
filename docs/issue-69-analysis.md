# Issue 69: requirements, research, and implementation plan

Scope: [parent issue 69](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/issues/69)
and issues [65](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/issues/65),
[66](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/issues/66),
[67](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/issues/67), and
[68](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/issues/68),
including their complete comments. Baseline: `22e53c87d87274415eb11c291702597c4021c50d`.

## Complete requirement inventory

Suggested implementations are distinguished from required outcomes. The chosen
approaches satisfy the outcomes and the added scope in issue comments.

| ID | Requirement or requested safeguard | Chosen solution and verification plan |
| --- | --- | --- |
| 69.1 | Read all four issues and all comments. | Read the parent, each child, paginated issue comments, and all three PR comment/review endpoints. Include the API-key scope and 5xx addenda below. |
| 69.2 | Address all four in one PR; defer none. | Implement all changes on `issue-69-e883a3a20e30` in existing PR 70. |
| 69.3 | Close the parent and every child in the PR body. | Use separate lines: `Fixes #69`, `Fixes #65`, `Fixes #66`, `Fixes #67`, `Fixes #68`. Verify the edited PR body. |
| 69.4 | State explicitly if any issue is already resolved or cannot be reproduced; retain its closing reference. | All four gaps reproduced at baseline. The existing duplicate-publish handling is preserved; none of the four issues is already fully resolved. |
| 65.1 | Eliminate floating macOS and Windows matrix labels while keeping Ubuntu pinned. | Use `ubuntu-24.04`, `macos-15`, `windows-2025`; retain .NET 8 setup and coverage gates. |
| 65.2 | Verify the supported SDK on the selected images. | Run the existing .NET 8 CI matrix on all three platforms; run local formatting, build, tests, and coverage with SDK 8.0.425. |
| 65.3 | Parse all workflow `runs-on` and matrices; reject labels ending in `-latest`. | Use Bun's native YAML parser in the repository-wide runner policy test. Cover scalars, arrays, label objects, multiline matrices, and include entries. |
| 65.4 | Plan intentional runner-image migrations. | Document a quarterly image review and review before retirement; require a migration PR with passing matrix results. |
| 66.1 | Support NuGet trusted publishing so an expired stored API key cannot block an OIDC release. | Select OIDC when `vars.NUGET_USER` is set; ignore the legacy secret in that mode. Test user-only and user-plus-expired-key configurations. |
| 66.2 | Grant `id-token: write` and use official `NuGet/login` with the configured username. | Apply to both `release` and `instant-release`. Pin the verified v1.2.0 commit; test permission scope and login configuration. |
| 66.3 | Pass the temporary key to publish; preserve an API-key fallback. | Login immediately before push. Use the legacy key only when trusted publishing is unconfigured; do not silently fall back after a failed OIDC login. |
| 66.4 | Let `NUGET_USER` alone satisfy NuGet preflight. | Report `auth=trusted-publishing`; validate the actual policy at login. Keep fork-PR report mode nonblocking. Test the full preflight path with mocks. |
| 66.5 | Print remediation for an HTTP 403 from `dotnet nuget push`. | Share one tested push helper across both release paths; preserve failed exit status and suggest key renewal or trusted publishing. Cover HTTP 401 too. |
| 66.6 | Comment: verify legacy-key validity with `POST /api/v2/package/create-verification-key/{id}`. | Send the API key with an empty body and bounded request; reject expired, revoked, or unauthorized keys before publishing. Never print either key. |
| 66.7 | Comment: verify package owner/glob with `GET /api/v2/verifykey/{id}/{published version}` using the one-time key. | Reuse the flat-container version list, then consume the verification key in the second request. Test valid-key/wrong-scope failure. |
| 66.8 | Preserve existing handling of already-published versions mentioned in the workaround. | Retain `check-release-needed.mjs`, self-healing release conditions, and `--skip-duplicate` in both publishing paths. Do not suppress required version bumps. |
| 66.9 | Explain setup and limitations to template consumers. | Document username variable, repository/workflow policy, package owner/glob, environment, temporary-key lifetime, legacy-key fallback, and first-publication scope limits. |
| 67.1 | Suppress Git's initial-branch hint in `docs.yml`, `security.yml`, and `workflows.yml`. | Add the same workflow-level `GIT_CONFIG_COUNT`, `GIT_CONFIG_KEY_0`, `GIT_CONFIG_VALUE_0` configuration already used by release and links. |
| 67.2 | Provide Git configuration before checkout invokes `git init`. | Use workflow-level environment variables; configuring Git in a subsequent shell step is too late. |
| 67.3 | Add a policy test requiring configuration in every checkout workflow, including future ones. | Parse every YAML workflow and check effective workflow/job/checkout-step environment values. |
| 68.1 | Reduce GitHub's secondary rate limits. | Add `lychee.toml` with GitHub concurrency 2 and request interval `1s`. Test parsed TOML. |
| 68.2 | Include the new configuration in link workflow path filters. | Add `lychee.toml` to push and PR filters; also cover `.lycheeignore` and both production link scripts. Include TOML changes in CI's code-change detector. |
| 68.3 | Stop treating HTTP 429 as a permanent broken-link verdict. | Retry 429 with backoff and `Retry-After`; recover only after an accepted response. Keep persistent rate limits visible. |
| 68.4 | Comment correction: failures include GitHub 502 and Codefactor 503, not seven GitHub failures. | Apply transient classification to all HTTP hosts, not only GitHub. Tests cover 502 and 503 alongside 429. |
| 68.5 | Comment addendum: `--max-retries` does not retry rejected 5xx statuses in lychee 0.24.2. | Extend the existing recovery script to retry all 500–599 responses; preserve transport-error recovery. |
| 68.6 | Keep real missing links red rather than hiding them in an ignore list. | Never retry original 404/client failures or non-HTTP failures; stop if a retry returns 404. Test mixed recovered and permanently missing links, exhausted attempts, and existing archive gates. |
| 68.7 | Bound recovery within the job cap and retain useful tracing. | Keep the three-attempt/180-second defaults; clamp retry waits and individual request timeouts to the remaining budget. Keep `RECHECK_VERBOSE=1` opt-in tracing. |

## Root causes and solution alternatives

### Runner labels

The earlier [PR 64](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/pull/64)
pinned Ubuntu everywhere, but deliberately left the other two matrix legs
floating. Its text-based policy looked only for `ubuntu-latest` and even
asserted the floating macOS/Windows matrix. GitHub documents versioned runner
labels for both selected platforms in
[Choosing the runner for a job](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job).

Versioned hosted labels preserve the existing matrix with little maintenance.
Self-hosted images would allow tighter control of installed software but add
infrastructure and operational work. Pinning OS labels is selected; hosted
images still receive software updates, so this does not freeze every tool.

### NuGet authentication

Both publishers duplicated presence checks and pushes. An expired key passed
preflight, and a missing key could silently skip the final publish step.
The official [NuGet trusted publishing guide](https://learn.microsoft.com/en-us/nuget/nuget-org/trusted-publishing)
and [NuGet/login](https://github.com/NuGet/login) provide the required OIDC
exchange. Temporary keys last one hour, so login belongs after building.
The verified v1.2.0 tag points to
`8d196754b4036150537f80ac539e15c2f1028841`.

OIDC-only publishing would remove long-lived keys but break existing template
users. Automatic fallback after an OIDC failure could conceal a bad policy and
reintroduce expiration failures. Selecting OIDC with `NUGET_USER`, otherwise
using a verified legacy key, preserves both supported configurations.

The [NuGetGallery controller](https://github.com/NuGet/NuGetGallery/blob/2f271fb8651906ecd841d0a658f9afc670e7021d/src/NuGetGallery/Controllers/ApiController.cs#L328-L414)
confirms that creating a verification key intentionally defers owner/package
validation until `VerifyPackageKey`. Checking only the first endpoint would
therefore miss valid keys with the wrong owner or glob. These calls create and
consume a temporary verification credential; neither uploads a package.
An existing implementation in
[Interfaces PR 151](https://github.com/linksplatform/Interfaces/pull/151)
uses the same two-call protocol. The code here adapts the approach to the
template's existing preflight and version lookup rather than adding another
release subsystem.

Before the first package publication, the second endpoint has no published
version to validate. Preflight verifies key validity and states that scope is
enforced by the push. If the package index is unavailable, API-key scope cannot
be verified and release mode fails; OIDC configuration remains independent of
that advisory lookup. OIDC policy validation requires a real GitHub job and a
policy created by the NuGet account owner. PR checks use mocks and verify wiring
without publishing packages or changing external account settings.

### Git checkout hints

Git starts initialization inside `actions/checkout`, before any shell step.
The [Git configuration documentation](https://git-scm.com/docs/git-config)
supports `init.defaultBranch` and the `GIT_CONFIG_COUNT` key/value environment
mechanism. The repository already uses that mechanism in two workflows.
Adding a post-checkout `git config` command cannot suppress the earlier hint;
reusing workflow-level environment configuration covers every checkout.

### Rate-limited and temporarily unavailable links

The original recovery classifier sent every HTTP status directly to its final
bucket. [Lychee's retry source at 0.24.2](https://github.com/lycheeverse/lychee/blob/lychee-v0.24.2/lychee-lib/src/retry.rs)
confirms that `ErrorKind::RejectedStatusCode` retries only 429. The separate
transport-error path can retry server errors, but rejected HTTP 502/503
responses do not reach it. This distinction explains why increasing
`--max-retries` alone cannot solve the reported 5xx failures.

[Lychee configuration](https://lychee.cli.rs/guides/config/)
supports a default `lychee.toml` and per-host concurrency/request intervals.
[Rate-limit guidance](https://lychee.cli.rs/troubleshooting/rate-limits/)
also recommends reducing concurrency. Host throttling reduces the number of
rate limits but cannot recover a short outage at another host.

Three solutions were considered:

1. Accept 429 in lychee's success list. Simple, but it can claim recovery
   without verifying the page and changes the meaning of success/cache entries.
2. Run lychee again after a pause with its cache. This retries failed links,
   but also rechecks permanent failures and duplicates the full action invocation.
3. Extend the existing bounded recovery script. This preserves current
   accepted-status rules, retries only transient failures, shares existing
   archive reporting, and supports deterministic tests. This is selected,
   together with GitHub host throttling. No 429/5xx status is accepted as healthy.

## Existing components selected

| Component | Role | Reason |
| --- | --- | --- |
| `actions/setup-dotnet@v5` | Install .NET 8 across pinned runner images | Existing official action and matrix. |
| `NuGet/login@v1.2.0` pinned by commit | Exchange GitHub OIDC identity for a temporary NuGet key | Official maintained implementation; avoids custom token exchange code. |
| NuGetGallery symbol verification API | Verify legacy API-key validity and package scope | Existing service protocol; no package upload is required. |
| `lycheeverse/lychee-action@v2` and TOML host controls | Initial link extraction/checking and throttling | Preserve the established checker and cache. |
| Built-in `fetch`, `AbortController`, `Headers` | Bounded probes, response statuses, and Retry-After | Already available in Node/Bun; no HTTP library required. |
| `Bun.YAML.parse` / `Bun.TOML.parse` | Read policy configuration structurally | Existing Bun test runtime; no package dependency required. |
| Existing actionlint and zizmor checks | Workflow schema, shell, permission, injection, and pin audits | Retain repository-pinned versions and audit modes. |

## Execution and validation plan

1. Read issue scope, comments, repository guidelines, and recent merged PRs;
   verify the prepared branch, clean worktree, and default-branch ancestry.
2. Write regression tests and preserve the baseline failures in local logs.
   Test changes include full preflight integration, mocked gallery/push calls,
   parsed workflow policies, and transient link retries.
3. Implement every path: both publishing jobs, all five checkout workflows,
   link-check configuration and filters, recovery classification/probing,
   documentation, and one patch changeset for the next automatic release.
4. Run the entire Bun suite, .NET 8 formatting/build/test/coverage checks,
   file-size validation, actionlint with the workflow-pinned image, and both
   configured zizmor audits. Use a finite localhost experiment to verify real
   429/503 recovery and permanent 404 handling without external rate limits.
5. Commit useful atomic steps, push only the prepared issue branch, update
   PR 70's title/body and closing references, and review the full PR diff.
6. Check CI timestamps and SHAs against the final commit. Download nonpassing
   run logs to `ci-logs/`, read specific failures, fix their causes, and rerun
   relevant checks before finalizing. Require the pinned three-OS matrix.
7. Confirm default branch ancestry, clean worktree, consistent documentation
   and tests, and mark PR 70 ready. Keep actual release publication for merge.

## Reproduction and local results

The initial policy/authentication regression run failed before implementation.
The independent localhost experiment also reproduced the original behavior:
all three HTTP failures were classified as permanent. The fixed code recovered
429 and 503 responses; the permanent 404 received exactly one request.

```sh
# Expected failure using the recorded baseline revision:
node experiments/issue-69/reproduce-transient-links.mjs --baseline
# Expected success using the working tree:
node experiments/issue-69/reproduce-transient-links.mjs
bun test scripts/*.test.mjs
```

Local results: 189 script tests and 21 .NET tests passed. .NET 8 formatting,
the warnings-as-errors Release build, coverage collection, file-size checks,
actionlint 1.7.12, and both configured zizmor 1.29.0 audits passed.
The PR's final CI results must verify the selected hosted runner platforms.
