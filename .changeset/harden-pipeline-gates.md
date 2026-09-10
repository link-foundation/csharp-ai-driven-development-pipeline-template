---
'MyPackage': patch
---

Harden the CI pipeline across ten issues (#51-#58, #60, #61). Workflows are
audited with zizmor beside a digest-pinned actionlint, and checkout
credentials are kept only by the jobs that push. The release pipeline ends
in a terminal status gate, so a job killed by its timeout is a red failure
on main instead of a grey cancelled run. Long steps run under their own
budget and warn at 70% of the job cap. A release preflight proves the
GitHub token can push and NUGET_API_KEY is configured before the build
matrix starts, instead of discovering a missing key at the push. Broken-link
runs re-ask the failures no host ever answered -- connect-phase resets that
--max-retries cannot retry -- while keeping every failure that carries a
status code final, and the Web Archive fallback no longer receives the links
the re-check found healthy. Release descriptions pass to git as argv, never
through a shell, so `$(...)` in a workflow_dispatch description is stored as
text instead of executing in a contents:write job. And changeset text the
repo's own scripts print is bracketed between fresh stop-commands markers,
so a description quoting `##[error]` or `::stop-commands::` renders as text
instead of annotating the run or switching off command processing.
