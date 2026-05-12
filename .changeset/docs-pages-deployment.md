---
'MyPackage': minor
---

Add GitHub Pages docs deployment workflow (`.github/workflows/docs.yml`) and a
minimal DocFX configuration (`docfx.json`, `docs/`). Mirrors the JS and Rust
templates so projects bootstrapped from this template publish API docs to
`<org>.github.io/<repo>/` on every push to `main` instead of waiting for the
first tagged release. Closes #15.
