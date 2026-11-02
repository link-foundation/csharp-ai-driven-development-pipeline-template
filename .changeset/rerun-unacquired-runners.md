---
'MyPackage': patch
---

Rerun CI jobs that GitHub never handed to a hosted runner (issue #96). A new `rerun-infrastructure-failures.yml` workflow reruns the failed jobs of a `CI/CD Pipeline` run, at most twice, only when a job has no runner, no steps and the "not acquired by Runner" annotation, so real failures and concurrency cancellations are never retried. Pipeline Status names such jobs as the cause of a red gate, and the repository variable `NON_BLOCKING_MACOS=true` optionally makes the macOS test leg non-blocking with its own warning.
