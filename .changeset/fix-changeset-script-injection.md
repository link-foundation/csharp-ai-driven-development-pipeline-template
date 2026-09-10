---
'MyPackage': patch
---

Close the two command-injection holes in the changeset scripts (#60, #61).
Release descriptions pass to git as argv, never through a shell, so
`$(...)` or backticks in a workflow_dispatch release description are stored
in the commit and tag messages as text instead of executing twice in a job
that holds contents:write. And changeset text the validation and merge
scripts print is bracketed between fresh stop-commands markers, so a
description quoting `##[error]` or `::stop-commands::` renders as text
instead of annotating the run, adding masks, or switching off command
processing for every step that follows.
