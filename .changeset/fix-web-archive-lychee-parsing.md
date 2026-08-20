---
'MyPackage': patch
---

Fix the Broken Link Checker's Wayback fallback: `scripts/check-web-archive.mjs` now parses only the `## Errors per input` section, so successfully redirected links are no longer reported as broken, and it reports lychee errors that have no http(s) URL (missing files, unresolvable root-relative links) instead of setting `all_archived=true` and turning a real failure green. Adds unit tests over a captured lychee report fixture.
