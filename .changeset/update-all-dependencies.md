---
'MyPackage': minor
---

Target .NET 10 (current LTS; .NET 8 support ends 2026-11-10) with the SDK pinned once in `global.json`, move tests to xUnit v3, update every helper, Action and pre-commit dependency, and stop policy tests from duplicating pinned Action SHAs so Dependabot bumps no longer break CI.
