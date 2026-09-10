---
'MyPackage': patch
---

Harden the CI pipeline across eight issues (#51-#58). Workflows are audited
with zizmor beside a digest-pinned actionlint, and checkout credentials are
kept only by the jobs that push. The release pipeline ends in a terminal
status gate, so a job killed by its timeout is a red failure on main instead
of a grey cancelled run. Long steps run under their own budget and warn at
70% of the job cap. A release preflight proves the GitHub token can push and
NUGET_API_KEY is configured before the build matrix starts, instead of
discovering a missing key at the push. And broken-link runs re-ask the
failures no host ever answered -- connect-phase resets that --max-retries
cannot retry -- while keeping every failure that carries a status code
final, and the Web Archive fallback no longer receives the links the
re-check found healthy.
