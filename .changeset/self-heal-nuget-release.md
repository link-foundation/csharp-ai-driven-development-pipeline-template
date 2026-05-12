---
'MyPackage': patch
---

Self-heal release workflow when NuGet publish fails after the version commit + tag are pushed. A new `scripts/check-release-needed.mjs` probes the NuGet flat-container index and the GitHub Releases API; when the csproj `<Version>` is missing on NuGet (or its GitHub release is missing), the next push to `main` resumes publishing without requiring a new changeset. Both the automatic `release` job and the manual `instant-release` job validate `NUGET_API_KEY` upfront so an expired key fails fast instead of mid-push.
