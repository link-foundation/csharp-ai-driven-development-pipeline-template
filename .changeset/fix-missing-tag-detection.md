---
'MyPackage': patch
---

Fix release script treating missing tags as already released. The `exec()` helper now propagates command failures even in silent mode, and `checkTagExists()` queries the exact `refs/tags/v<version>` ref, so a missing tag is no longer mistaken for an existing one.
