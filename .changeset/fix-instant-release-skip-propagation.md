---
'MyPackage': patch
---

Fix the manual instant release path being skipped after `detect-changes` is skipped on `workflow_dispatch`. The `lint` and `instant-release` jobs now use `always() && !cancelled()` status-check functions so the dispatch run is evaluated instead of being skipped through `needs` propagation, while keeping explicit `needs.*.result == 'success'` gates on `instant-release`.
