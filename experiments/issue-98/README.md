# Issue 98 verification

Requirements from issue 98 and its change-detection comment:

- [x] Keep adjacent lychee failure records separate, including records without
  descriptions. Keep optional locations and descriptions on their own lines.
- [x] Parse only the Errors section and retain failures under input subheadings.
- [x] Keep source deletions visible when a rename targets an excluded folder.
  Apply this to both PR and push comparisons without changing Git input validation.
- [x] Cover every excluded folder, source-to-source renames, and examples-only edits.
- [x] Add a patch changeset for the automatic release workflow.

## Reproduce and verify

Run the focused offline tests (no .NET build or network requests):

```sh
bun test scripts/recheck-broken-links.test.mjs scripts/change-detection-renames.test.mjs scripts/detect-code-changes.test.mjs
bun run check
```

With the new regressions and the original helpers, 29 tests failed: five parser
or recheck cases and 24 rename cases. After the fixes, all 71 focused tests pass.
The parser cases include the exact two-line report from the issue, LF and CRLF,
bare and bracketed URLs, optional locations, horizontal whitespace, and section
boundaries. The main-function regression verifies that the second URL is probed,
the recovered URL is written, and the adjacent permanent failure remains final.

Rename tests create small temporary repositories, explicitly enable Git rename
detection, commit the original source and its move, and invoke the actual helper
in a separate process. Both push and PR events run in root and nested C# layouts.
Every excluded folder is covered: `.changeset`, `docs`, `dev/log`, `experiments`,
and `examples`. Tests require both the deleted and added paths and the resulting
`any-code-changed=true` output. Source-to-source moves remain code changes;
genuine examples-only edits remain excluded. Temporary repositories are removed
in `finally` blocks.

## Existing CI failure

The initial Workflows run 42172721878 failed in zizmor. Preserved local log
`ci-logs/initial-42172721878.log`, lines 203–205, reports version-comment mismatches
for `security.yml` lines 39 and 43. The `v4` tag moved away from the pinned commit.
The annotated `v4.39.1` tag resolves to the existing pinned commit
`9b3254085494b55a0f7c4c2b3d2d52cc712ce370`. Updating only those two comments keeps
the audited action code unchanged and lets CI verify the exact release tag.
