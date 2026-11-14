# Issue 108 / PR 109 evidence

- [Analysis and complete requirement map](analysis.md): root causes, possible
  solutions, selected implementation, regression coverage, migration guides,
  existing components and explicitly unfinished acceptance criteria.
- [Dependency tables](dependencies.md): baseline, registry latest stable, selected
  versions and reasons for every exception, including transitive dependencies.
- [Work plan](plan.md): checklist as of this evidence commit's preparation.
- [Registry snapshots](registry/): npm, NuGet, PyPI, Action releases, SDK/runtime
  releases and hosted-image evidence fetched on 2026-11-14.
- [Archived CI logs](ci-logs/): original #102/#106 failures, failed main runs and
  intermediate implementation failures. Analysis cites exact line numbers.
- [Posted upstream reports](upstream/): exact report bodies and result URLs.

Initial/final issue and PR feedback snapshots are JSON files at this level.
No required sub-issues or PR feedback were returned by their respective APIs.
Local build, test, lint, audit, package, documentation and bounded experiment
logs are named by the command or subsystem. All retained JSON parses, and all
applicable pre-commit evidence checks pass (`evidence-pre-commit.log`).

Hosted verification of implementation 3679365 is retained in
`passing-implementation-pipeline.json` and `passing-implementation-security.json`.
Local verification finishes at 382 JavaScript tests / 21 .NET tests, all passing.
Final evidence-commit CI is recorded in [PR 109](https://github.com/link-foundation/csharp-ai-driven-development-pipeline-template/pull/109),
so a recorded final-check SHA does not require another evidence-only commit.

Raw diagnostic logs and downloaded research preserve their original formatting.
They are excluded from whitespace rewriting; archived large CI logs are allowed
explicitly. The research directory is outside the product documentation link
crawl. Product source, workflow, documentation and link checks remain active.

The default-branch-green criterion remains unfinished: a reviewed merge and
owner-managed NuGet/Codecov configuration are required. Read analysis.md before
treating passing PR checks as issue completion. The repository is left unmerged.
