# Issue #100 verification plan

Scope: seven CI gate defects in issue #100. The issue and PR #101 had no
comments, reviews, inline feedback, or required sub-issues at initial inspection.

| Item | Requirement | Implementation and regression evidence |
| --- | --- | --- |
| 12 | Credential failure must not skip code checks; publishing stays gated | Release workflow dependency/condition policy and existing pipeline gate tests |
| 7 | NuGet 401/403 fail with distinct authentication/authorization states and warnings | Offline NuGet response tests, preflight release/advisory decision tests |
| 1 | Include timeouts, reject incomplete reports and non-link exit codes, schedule checks | Parser, recovery integration, and link workflow policy tests |
| 6 | Retry infrastructure failures in every workflow with a terminal gate | Rerun workflow policy derives the list of gated workflows |
| 3 | Report all SARIF problems across files with safe rule/location/message output | SARIF aggregation and CLI regression tests |
| 5 | Bound JavaScript helpers and Markdown as well as C# | File size boundary/discovery tests; same 900 warning/1000 hard budget for all |
| 11 | Require exact action version comments | Pin predicate negative cases and repository pin policy |

Plan: add regression coverage, implement all requirements, run focused offline
checks, then push and inspect CI for the exact commit. Preserve failing CI logs
and investigate actual errors before retrying. Full .NET builds run on CI to
limit local resource use. The release trigger is a patch changeset.

## Verification evidence

- `ci-logs/issue-100-baseline.log`: original code has 14 regression failures
  and two missing-new-API import errors. In particular the existing recovery
  entry point ignores the timeout after recovering a 503.
- `ci-logs/issue-100-focused.log`: 154 focused tests pass, including all seven
  requirements and the main Pipeline Status failure on a failed preflight.
- `ci-logs/issue-100-check.log`: pinned ESLint, Prettier and checkJs pass.
- `ci-logs/issue-100-size.log`: 103 source/documentation files meet the budget.
- `ci-logs/workflows-43400679647.log:410`: pre-existing zizmor failure on the
  major-only create-pull-request comment; the exact v8.1.1 tag resolves to the
  existing pinned SHA. The first updated Workflows run passes both audits.

The local full helper run initially had two package-validation failures because
only SDK 10.0.112 is installed here, while the repository pins 10.0.403. The first
updated CI run installs the pinned SDK and passes the complete helper suite and
package checks, so no SDK pin change or local installation is needed.

CI runs for implementation commit `0564c9b`:

- [Security](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/43401510187)
- [CI/CD Pipeline](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/43401510188)
- [Workflows](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/43401510198)
- [Links](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/43401510205)
- [Documentation](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/actions/runs/43401510151)

The PR description records final-commit CI verification. No live invalid NuGet
key or deliberately failing production push is necessary: response mocks and
workflow dependency/condition tests reproduce these cases without publication.
