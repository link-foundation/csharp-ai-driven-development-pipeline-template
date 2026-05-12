---
'MyPackage': patch
---

Wait longer for NuGet indexing before creating the GitHub release. The previous inline verification used a 0/5/10/20/30/60 second retry schedule that gave up after about 125 seconds, well inside the normal NuGet indexing window (up to 15 minutes per https://learn.microsoft.com/en-us/nuget/nuget-org/publish-a-package#package-validation-and-indexing). The release workflow now uses a tested `scripts/wait-for-nuget.mjs` helper that polls the flat-container nuspec endpoint 8 times with a 120-second interval, applied to both the automatic `release` job and the manual `instant-release` job. See issue #13 and the matching link-cli reproducer at https://github.com/link-foundation/link-cli/issues/86.
