# Dependency resolution on 2026-11-14

Baseline: `e33364e`. Registry responses are retained in `registry/`.
“Latest” means the current stable release, excluding prereleases.
Every Bun lock entry (including optional platform binaries) is included.
Repeated instances are grouped by package; selected versions come from locks.
Transitive compatibility exceptions name the actual parent constraints.
Forcing a different major under these constraints would falsify the graph.

## JavaScript: direct and transitive packages

| Dependency | Before | Latest stable | Selected | Reason / registry |
| --- | --- | --- | --- | --- |
| `@cacheable/memory` | 2.2.0 | 2.2.0 | 2.2.0 | current stable ([npm](https://registry.npmjs.org/@cacheable/memory/latest)) |
| `@cacheable/utils` | 2.5.0 | 2.5.0 | 2.5.0 | current stable ([npm](https://registry.npmjs.org/@cacheable/utils/latest)) |
| `@eslint-community/eslint-utils` | 4.10.1 | 4.10.1 | 4.10.1 | current stable ([npm](https://registry.npmjs.org/@eslint-community/eslint-utils/latest)) |
| `@eslint-community/regexpp` | 4.12.2 | 4.12.3 | 4.12.3 | current stable ([npm](https://registry.npmjs.org/@eslint-community/regexpp/latest)) |
| `@eslint/config-array` | 0.23.5 | 0.23.6 | 0.23.6 | current stable ([npm](https://registry.npmjs.org/@eslint/config-array/latest)) |
| `@eslint/config-helpers` | 0.7.0 | 0.7.0 | 0.7.0 | current stable ([npm](https://registry.npmjs.org/@eslint/config-helpers/latest)) |
| `@eslint/core` | 1.2.1 | 1.2.1 | 1.2.1 | current stable ([npm](https://registry.npmjs.org/@eslint/core/latest)) |
| `@eslint/js` | 10.0.1 | 10.0.1 | 10.0.1 | current stable ([npm](https://registry.npmjs.org/@eslint/js/latest)) |
| `@eslint/object-schema` | 3.0.5 | 3.0.5 | 3.0.5 | current stable ([npm](https://registry.npmjs.org/@eslint/object-schema/latest)) |
| `@eslint/plugin-kit` | 0.7.3 | 0.7.3 | 0.7.3 | current stable ([npm](https://registry.npmjs.org/@eslint/plugin-kit/latest)) |
| `@humanfs/core` | 0.19.2 | 0.20.0 | 0.19.2 | `@humanfs/node@0.16.8` requires `^0.19.2`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/@humanfs/core/latest)) |
| `@humanfs/node` | 0.16.8 | 0.17.0 | 0.16.8 | `eslint@10.15.0` requires `^0.16.8`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/@humanfs/node/latest)) |
| `@humanfs/types` | 0.15.0 | 0.16.0 | 0.15.0 | `@humanfs/core@0.19.2` requires `^0.15.0`; `@humanfs/node@0.16.8` requires `^0.15.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/@humanfs/types/latest)) |
| `@humanwhocodes/module-importer` | 1.0.1 | 1.0.1 | 1.0.1 | current stable ([npm](https://registry.npmjs.org/@humanwhocodes/module-importer/latest)) |
| `@humanwhocodes/retry` | 0.4.3 | 0.4.3 | 0.4.3 | current stable ([npm](https://registry.npmjs.org/@humanwhocodes/retry/latest)) |
| `@isaacs/nonrecursive-glob-match` | 1.0.3 | 1.1.0 | 1.1.0 | current stable ([npm](https://registry.npmjs.org/@isaacs/nonrecursive-glob-match/latest)) |
| `@keyv/bigmap` | 1.3.1 | 6.1.0 | 1.3.1 | `@cacheable/memory@2.2.0` requires `^1.3.1`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/@keyv/bigmap/latest)) |
| `@keyv/serialize` | 1.1.1 | 1.1.1 | 1.1.1 | current stable ([npm](https://registry.npmjs.org/@keyv/serialize/latest)) |
| `@types/bun` | 1.4.4 | 1.4.4 | 1.4.4 | current stable ([npm](https://registry.npmjs.org/@types/bun/latest)) |
| `@types/esrecurse` | 4.3.1 | 4.3.1 | 4.3.1 | current stable ([npm](https://registry.npmjs.org/@types/esrecurse/latest)) |
| `@types/estree` | 1.0.10 | 1.0.10 | 1.0.10 | current stable ([npm](https://registry.npmjs.org/@types/estree/latest)) |
| `@types/json-schema` | 7.0.15 | 7.0.15 | 7.0.15 | current stable ([npm](https://registry.npmjs.org/@types/json-schema/latest)) |
| `@types/node` | 26.6.6 | 26.6.6 | 26.6.6 | current stable ([npm](https://registry.npmjs.org/@types/node/latest)) |
| `@typescript/typescript-aix-ppc64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-aix-ppc64/latest)) |
| `@typescript/typescript-darwin-arm64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-darwin-arm64/latest)) |
| `@typescript/typescript-darwin-x64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-darwin-x64/latest)) |
| `@typescript/typescript-freebsd-arm64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-freebsd-arm64/latest)) |
| `@typescript/typescript-freebsd-x64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-freebsd-x64/latest)) |
| `@typescript/typescript-linux-arm` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-linux-arm/latest)) |
| `@typescript/typescript-linux-arm64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-linux-arm64/latest)) |
| `@typescript/typescript-linux-loong64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-linux-loong64/latest)) |
| `@typescript/typescript-linux-mips64el` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-linux-mips64el/latest)) |
| `@typescript/typescript-linux-ppc64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-linux-ppc64/latest)) |
| `@typescript/typescript-linux-riscv64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-linux-riscv64/latest)) |
| `@typescript/typescript-linux-s390x` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-linux-s390x/latest)) |
| `@typescript/typescript-linux-x64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-linux-x64/latest)) |
| `@typescript/typescript-netbsd-arm64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-netbsd-arm64/latest)) |
| `@typescript/typescript-netbsd-x64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-netbsd-x64/latest)) |
| `@typescript/typescript-openbsd-arm64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-openbsd-arm64/latest)) |
| `@typescript/typescript-openbsd-x64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-openbsd-x64/latest)) |
| `@typescript/typescript-sunos-x64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-sunos-x64/latest)) |
| `@typescript/typescript-win32-arm64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-win32-arm64/latest)) |
| `@typescript/typescript-win32-x64` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/@typescript/typescript-win32-x64/latest)) |
| `acorn` | 8.19.0 | 8.19.0 | 8.19.0 | current stable ([npm](https://registry.npmjs.org/acorn/latest)) |
| `acorn-jsx` | 5.3.2 | 5.3.2 | 5.3.2 | current stable ([npm](https://registry.npmjs.org/acorn-jsx/latest)) |
| `ajv` | 6.15.0 | 8.20.0 | 6.15.0 | `eslint@10.15.0` requires `^6.14.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/ajv/latest)) |
| `balanced-match` | 4.0.4 | 5.0.0 | 4.0.4 | `brace-expansion@5.0.13` requires `^4.0.2`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/balanced-match/latest)) |
| `brace-expansion` | 5.0.12 | 5.0.13 | 5.0.13 | current stable ([npm](https://registry.npmjs.org/brace-expansion/latest)) |
| `bun-types` | 1.4.4 | 1.4.4 | 1.4.4 | current stable ([npm](https://registry.npmjs.org/bun-types/latest)) |
| `cacheable` | 2.5.0 | 2.5.0 | 2.5.0 | current stable ([npm](https://registry.npmjs.org/cacheable/latest)) |
| `cross-spawn` | 7.0.6 | 7.0.6 | 7.0.6 | current stable ([npm](https://registry.npmjs.org/cross-spawn/latest)) |
| `debug` | 4.4.3 | 4.4.3 | 4.4.3 | current stable ([npm](https://registry.npmjs.org/debug/latest)) |
| `deep-is` | 0.1.4 | 0.1.4 | 0.1.4 | current stable ([npm](https://registry.npmjs.org/deep-is/latest)) |
| `escape-string-regexp` | 4.0.0 | 5.0.0 | 4.0.0 | `eslint@10.15.0` requires `^4.0.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/escape-string-regexp/latest)) |
| `eslint` | 10.14.0 | 10.15.0 | 10.15.0 | current stable ([npm](https://registry.npmjs.org/eslint/latest)) |
| `eslint-scope` | 9.1.2 | 9.1.2 | 9.1.2 | current stable ([npm](https://registry.npmjs.org/eslint-scope/latest)) |
| `eslint-visitor-keys` | 3.4.3, 5.0.1 | 5.0.1 | 3.4.3, 5.0.1 | `@eslint-community/eslint-utils@4.10.1` requires `^3.4.3`; `eslint@10.15.0` requires `^5.0.1`; `espree@11.2.0` requires `^5.0.1`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/eslint-visitor-keys/latest)) |
| `espree` | 11.2.0 | 11.2.0 | 11.2.0 | current stable ([npm](https://registry.npmjs.org/espree/latest)) |
| `esquery` | 1.7.0 | 1.7.0 | 1.7.0 | current stable ([npm](https://registry.npmjs.org/esquery/latest)) |
| `esrecurse` | 4.3.0 | 4.3.0 | 4.3.0 | current stable ([npm](https://registry.npmjs.org/esrecurse/latest)) |
| `estraverse` | 5.3.0 | 5.3.0 | 5.3.0 | current stable ([npm](https://registry.npmjs.org/estraverse/latest)) |
| `esutils` | 2.0.3 | 2.0.3 | 2.0.3 | current stable ([npm](https://registry.npmjs.org/esutils/latest)) |
| `fast-deep-equal` | 3.1.3 | 3.1.3 | 3.1.3 | current stable ([npm](https://registry.npmjs.org/fast-deep-equal/latest)) |
| `fast-json-stable-stringify` | 2.1.0 | 2.1.0 | 2.1.0 | current stable ([npm](https://registry.npmjs.org/fast-json-stable-stringify/latest)) |
| `fast-levenshtein` | 2.0.6 | 3.0.0 | 2.0.6 | `optionator@0.9.4` requires `^2.0.6`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/fast-levenshtein/latest)) |
| `file-entry-cache` | 11.1.5 | 11.1.5 | 11.1.5 | current stable ([npm](https://registry.npmjs.org/file-entry-cache/latest)) |
| `find-up` | 5.0.0 | 8.0.0 | 5.0.0 | `eslint@10.15.0` requires `^5.0.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/find-up/latest)) |
| `flat-cache` | 6.1.23 | 6.1.23 | 6.1.23 | current stable ([npm](https://registry.npmjs.org/flat-cache/latest)) |
| `flatted` | 3.4.4 | 3.4.4 | 3.4.4 | current stable ([npm](https://registry.npmjs.org/flatted/latest)) |
| `glob-parent` | 6.0.2 | 6.0.2 | 6.0.2 | current stable ([npm](https://registry.npmjs.org/glob-parent/latest)) |
| `globals` | 17.14.0 | 17.14.0 | 17.14.0 | current stable ([npm](https://registry.npmjs.org/globals/latest)) |
| `hashery` | 1.5.1 | 3.0.6 | 1.5.1 | `@cacheable/utils@2.5.0` requires `^1.5.1`; `@keyv/bigmap@1.3.1` requires `^1.4.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/hashery/latest)) |
| `hookified` | 1.15.1, 2.2.0 | 3.1.0 | 1.15.1, 2.2.0 | `@cacheable/memory@2.2.0` requires `^1.15.1`; `@keyv/bigmap@1.3.1` requires `^1.15.0`; `cacheable@2.5.0` requires `^1.15.0`; `flat-cache@6.1.23` requires `^1.15.0`; `hashery@1.5.1` requires `^1.15.0`; `qified@0.10.1` requires `^2.1.1`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/hookified/latest)) |
| `ignore` | 5.3.2 | 7.0.14 | 5.3.2 | `eslint@10.15.0` requires `^5.2.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/ignore/latest)) |
| `imurmurhash` | 0.1.4 | 0.1.4 | 0.1.4 | current stable ([npm](https://registry.npmjs.org/imurmurhash/latest)) |
| `is-extglob` | 2.1.1 | 2.1.1 | 2.1.1 | current stable ([npm](https://registry.npmjs.org/is-extglob/latest)) |
| `is-glob` | 4.0.3 | 4.0.3 | 4.0.3 | current stable ([npm](https://registry.npmjs.org/is-glob/latest)) |
| `isexe` | 2.0.0 | 4.0.0 | 2.0.0 | `which@2.0.2` requires `^2.0.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/isexe/latest)) |
| `json-schema-traverse` | 0.4.1 | 1.0.0 | 0.4.1 | `ajv@6.15.0` requires `^0.4.1`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/json-schema-traverse/latest)) |
| `json-stable-stringify-without-jsonify` | 1.0.1 | 1.0.1 | 1.0.1 | current stable ([npm](https://registry.npmjs.org/json-stable-stringify-without-jsonify/latest)) |
| `keyv` | 5.6.0 | 6.1.0 | 5.6.0 | `@cacheable/memory@2.2.0` requires `^5.6.0`; `@cacheable/utils@2.5.0` requires `^5.6.0`; `cacheable@2.5.0` requires `^5.6.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/keyv/latest)) |
| `levn` | 0.4.1 | 0.4.1 | 0.4.1 | current stable ([npm](https://registry.npmjs.org/levn/latest)) |
| `locate-path` | 6.0.0 | 8.0.0 | 6.0.0 | `find-up@5.0.0` requires `^6.0.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/locate-path/latest)) |
| `minimatch` | 11.0.3 | 11.0.8 | 11.0.8 | current stable ([npm](https://registry.npmjs.org/minimatch/latest)) |
| `ms` | 2.1.3 | 2.1.3 | 2.1.3 | current stable ([npm](https://registry.npmjs.org/ms/latest)) |
| `natural-compare` | 1.4.0 | 1.4.0 | 1.4.0 | current stable ([npm](https://registry.npmjs.org/natural-compare/latest)) |
| `optionator` | 0.9.4 | 0.9.4 | 0.9.4 | current stable ([npm](https://registry.npmjs.org/optionator/latest)) |
| `p-limit` | 3.1.0 | 7.3.3 | 3.1.0 | `p-locate@5.0.0` requires `^3.0.2`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/p-limit/latest)) |
| `p-locate` | 5.0.0 | 7.0.0 | 5.0.0 | `locate-path@6.0.0` requires `^5.0.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/p-locate/latest)) |
| `path-exists` | 4.0.0 | 5.0.0 | 4.0.0 | `find-up@5.0.0` requires `^4.0.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/path-exists/latest)) |
| `path-key` | 3.1.1 | 4.0.0 | 3.1.1 | `cross-spawn@7.0.6` requires `^3.1.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/path-key/latest)) |
| `prelude-ls` | 1.2.1 | 1.2.1 | 1.2.1 | current stable ([npm](https://registry.npmjs.org/prelude-ls/latest)) |
| `prettier` | 3.9.10 | 3.10.1 | 3.10.1 | current stable ([npm](https://registry.npmjs.org/prettier/latest)) |
| `punycode` | 2.3.1 | 2.3.1 | 2.3.1 | current stable ([npm](https://registry.npmjs.org/punycode/latest)) |
| `qified` | 0.10.1 | 0.13.2 | 0.10.1 | `cacheable@2.5.0` requires `^0.10.1`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/qified/latest)) |
| `shebang-command` | 2.0.0 | 2.0.0 | 2.0.0 | current stable ([npm](https://registry.npmjs.org/shebang-command/latest)) |
| `shebang-regex` | 3.0.0 | 4.0.0 | 3.0.0 | `shebang-command@2.0.0` requires `^3.0.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/shebang-regex/latest)) |
| `type-check` | 0.4.0 | 0.4.0 | 0.4.0 | current stable ([npm](https://registry.npmjs.org/type-check/latest)) |
| `typescript` | 7.0.2 | 7.0.2 | 7.0.2 | current stable ([npm](https://registry.npmjs.org/typescript/latest)) |
| `undici-types` | 6.21.0, 8.9.0 | 8.12.4 | 8.9.0 | `@types/node@26.6.6` requires `~8.9.0`; `bun-types@1.4.4` requires `*`. Parent API/module compatibility; awaiting parent migration. Node types intentionally track the bundled Undici minor; the standalone newest types would describe a different runtime. ([npm](https://registry.npmjs.org/undici-types/latest)) |
| `uri-js` | 4.4.1 | 4.4.1 | 4.4.1 | current stable ([npm](https://registry.npmjs.org/uri-js/latest)) |
| `which` | 2.0.2 | 7.0.0 | 2.0.2 | `cross-spawn@7.0.6` requires `^2.0.1`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/which/latest)) |
| `word-wrap` | 1.2.5 | 1.2.5 | 1.2.5 | current stable ([npm](https://registry.npmjs.org/word-wrap/latest)) |
| `yocto-queue` | 0.1.0 | 1.2.2 | 0.1.0 | `p-limit@3.1.0` requires `^0.1.0`. Parent API/module compatibility; awaiting parent migration. ([npm](https://registry.npmjs.org/yocto-queue/latest)) |

## .NET: all three project graphs and local tools

| Dependency | Before | Latest stable | Selected | Reason / registry |
| --- | --- | --- | --- | --- |
| `Microsoft.Bcl.AsyncInterfaces` | 6.0.0 | 11.0.0 | 11.0.0 | current stable; explicit private test reference raises xUnit’s net6-compatible minimum to the current net11 package ([NuGet](https://api.nuget.org/v3-flatcontainer/microsoft.bcl.asyncinterfaces/index.json)) |
| `Microsoft.CodeCoverage` | 18.11.0 | 18.12.0 | 18.12.0 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/microsoft.codecoverage/index.json)) |
| `Microsoft.NET.Test.Sdk` | 18.11.0 | 18.12.0 | 18.12.0 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/microsoft.net.test.sdk/index.json)) |
| `Microsoft.TestPlatform.ObjectModel` | 18.11.0 | 18.12.0 | 18.12.0 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/microsoft.testplatform.objectmodel/index.json)) |
| `Microsoft.TestPlatform.TestHost` | 18.11.0 | 18.12.0 | 18.12.0 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/microsoft.testplatform.testhost/index.json)) |
| `Microsoft.Win32.Registry` | 5.0.0 | 5.0.0 | 5.0.0 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/microsoft.win32.registry/index.json)) |
| `System.Security.AccessControl` | 6.0.1 | 6.0.1 | 6.0.1 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/system.security.accesscontrol/index.json)) |
| `coverlet.collector` | 10.1.0 | 10.1.0 | 10.1.0 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/coverlet.collector/index.json)) |
| `docfx` | unpinned | 2.81.0 | 2.81.0 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/docfx/index.json)) |
| `xunit.analyzers` | 2.2.0 | 2.3.0 | 2.3.0 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/xunit.analyzers/index.json)) |
| `xunit.runner.visualstudio` | 4.0.1 | 4.0.1 | 4.0.1 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/xunit.runner.visualstudio/index.json)) |
| `xunit.v3.assert` | 4.0.2 | 4.0.3 | 4.0.3 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/xunit.v3.assert/index.json)) |
| `xunit.v3.common` | 4.0.2 | 4.0.3 | 4.0.3 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/xunit.v3.common/index.json)) |
| `xunit.v3.core.mtp-off` | 4.0.2 | 4.0.3 | 4.0.3 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/xunit.v3.core.mtp-off/index.json)) |
| `xunit.v3.extensibility.core` | 4.0.2 | 4.0.3 | 4.0.3 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/xunit.v3.extensibility.core/index.json)) |
| `xunit.v3.mtp-off` | 4.0.2 | 4.0.3 | 4.0.3 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/xunit.v3.mtp-off/index.json)) |
| `xunit.v3.runner.common` | 4.0.2 | 4.0.3 | 4.0.3 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/xunit.v3.runner.common/index.json)) |
| `xunit.v3.runner.inproc.console` | 4.0.2 | 4.0.3 | 4.0.3 | current stable ([NuGet](https://api.nuget.org/v3-flatcontainer/xunit.v3.runner.inproc.console/index.json)) |

## GitHub Actions (every repeated pin agrees)

| Dependency | Before | Latest stable | Selected | Reason / registry |
| --- | --- | --- | --- | --- |
| `NuGet/login` | v1.2.0 | v1.2.0 | v1.2.0 | immutable SHA `8d196754b4036150537f80ac539e15c2f1028841` ([release](https://github.com/NuGet/login/releases/tag/v1.2.0)) |
| `actions/checkout` | v7.0.1 | v7.0.1 | v7.0.1 | immutable SHA `3d3c42e5aac5ba805825da76410c181273ba90b1` ([release](https://github.com/actions/checkout/releases/tag/v7.0.1)) |
| `actions/configure-pages` | v6.0.0 | v6.0.0 | v6.0.0 | immutable SHA `45bfe0192ca1faeb007ade9deae92b16b8254a0d` ([release](https://github.com/actions/configure-pages/releases/tag/v6.0.0)) |
| `actions/dependency-review-action` | v5.0.0 | v5.0.0 | v5.0.0 | immutable SHA `a1d282b36b6f3519aa1f3fc636f609c47dddb294` ([release](https://github.com/actions/dependency-review-action/releases/tag/v5.0.0)) |
| `actions/deploy-pages` | v5.0.1 | v5.0.1 | v5.0.1 | immutable SHA `368f82528645a54fb793d4d04e342629a3f51346` ([release](https://github.com/actions/deploy-pages/releases/tag/v5.0.1)) |
| `actions/download-artifact` | v8.0.2 | v8.0.2 | v8.0.2 | immutable SHA `9000827ccba6bdab643e8b6fd33ac0654aef8333` ([release](https://github.com/actions/download-artifact/releases/tag/v8.0.2)) |
| `actions/setup-dotnet` | v6.1.0 | v6.1.0 | v6.1.0 | immutable SHA `0f4a354dd5547a28c70b7853dbd95d5b67886e73` ([release](https://github.com/actions/setup-dotnet/releases/tag/v6.1.0)) |
| `actions/setup-node` | not pinned | v7.1.0 | v7.1.0 | immutable SHA `949feb2413d6458794dcd2491c4babbbce0c15c1` ([release](https://github.com/actions/setup-node/releases/tag/v7.1.0)) |
| `actions/upload-artifact` | v7.0.2 | v7.0.2 | v7.0.2 | immutable SHA `cf430e030ddbb5b0abf93d22962f4752f3646cd9` ([release](https://github.com/actions/upload-artifact/releases/tag/v7.0.2)) |
| `actions/upload-pages-artifact` | v5.0.0 | v5.0.0 | v5.0.0 | immutable SHA `fc324d3547104276b827a68afc52ff2a11cc49c9` ([release](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0)) |
| `codecov/codecov-action` | v7.1.1 | v7.1.1 | v7.1.1 | immutable SHA `303a32d7a59b442fa8d48b6a1cc6825c09c847a5` ([release](https://github.com/codecov/codecov-action/releases/tag/v7.1.1)) |
| `github/codeql-action` | v4.39.3 | v4.39.3 | v4.39.3 | immutable SHA `33d7b85da1a04171e211befe2c739303b9a4c066` ([release](https://github.com/github/codeql-action/releases/tag/v4.39.3)) |
| `lycheeverse/lychee-action` | v2.9.0 | v2.9.0 | v2.9.0 | immutable SHA `e7477775783ea5526144ba13e8db5eec57747ce8` ([release](https://github.com/lycheeverse/lychee-action/releases/tag/v2.9.0)) |
| `oven-sh/setup-bun` | v2.2.0 | v2.2.0 | v2.2.0 | immutable SHA `0c5077e51419868618aeaa5fe8019c62421857d6` ([release](https://github.com/oven-sh/setup-bun/releases/tag/v2.2.0)) |
| `peter-evans/create-pull-request` | v8.1.2 | v8.1.3 | v8.1.3 | immutable SHA `3ffccacd46053766916f087ce41d627c0b8cf2d1` ([release](https://github.com/peter-evans/create-pull-request/releases/tag/v8.1.3)) |
| `zizmorcore/zizmor-action` | v0.8.1 | v0.8.1 | v0.8.1 | immutable SHA `45d7276c9ca790aabd705e31ca99c6185c3e76dd` ([release](https://github.com/zizmorcore/zizmor-action/releases/tag/v0.8.1)) |

## Infrastructure, analyzers and toolchains

| Dependency | Before | Latest stable | Selected | Reason / registry |
| --- | --- | --- | --- | --- |
| Microsoft.NET SDK | 10.0.403 | 11.0.100 | 11.0.100 | global.json; official releases-index.json; runtime 11.0.0 / MSBuild 18.12.2 bundled ([source](https://builds.dotnet.microsoft.com/dotnet/release-metadata/releases-index.json)) |
| TargetFramework | net10.0 | net11.0 | net11.0 | all projects inherit Directory.Build.props; consumer smoke fixture agrees ([source](https://learn.microsoft.com/en-us/dotnet/core/compatibility/11)) |
| Node.js | ambient; engines >=22 | 26.13.1 | 26.13.1 | .node-version, engine floor and every JavaScript workflow agree; prerelease 27 excluded ([source](https://nodejs.org/dist/index.json)) |
| Bun | 1.4.4 | 1.4.4 | 1.4.4 | packageManager, engine floor and every workflow agree ([source](https://github.com/oven-sh/bun/releases/latest)) |
| Ubuntu hosted image | ubuntu-24.04 | ubuntu-26.04 | ubuntu-26.04 | latest GA Ubuntu runner; current image revisions managed by GitHub ([source](https://github.blog/changelog/2026-09-17-ubuntu-26-generally-available-and-latest-migration/)) |
| macOS hosted image | macos-15 | xcode-27 / macOS 27 | xcode-27 | GA standard Apple Silicon runner; paid xlarge variant unnecessary ([source](https://github.blog/changelog/2026-10-15-xcode-27-runner-image-generally-available/)) |
| Windows hosted image | windows-2025 | windows-2025 / VS2026 | windows-2025 | already current; windows-2025-vs2026 is an alias of the same GA image ([source](https://github.com/actions/runner-images#available-images)) |
| Actions runner binary | GitHub managed | 2.338.2 | GitHub managed | hosted service progressively deploys this binary; no repository pin or self-hosted runner ([source](https://github.com/actions/runner/releases/tag/v2.338.2)) |
| actionlint / Docker image | 1.7.12 | 1.7.12 | 1.7.12 | latest official stable; SHA256 b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667 in both uses ([source](https://github.com/rhysd/actionlint/releases/tag/v1.7.12)) |
| ShellCheck (image) | 0.11.0 | 0.11.0 | 0.11.0 | embedded and standalone probes verify execution ([source](https://github.com/koalaman/shellcheck/releases/tag/v0.11.0)) |
| Pyflakes (image) | 3.4.0 | 4.1.0 | 3.4.0 | upstream-owned immutable image exception; actionlint#779 requests rebuild; local Python probes use 4.1.0 ([source](https://pypi.org/project/pyflakes/)) |
| Python (image) | 3.12.12 | 3.15.2 | 3.12.12 | upstream-owned immutable image exception; actionlint#779 requests supported current interpreter ([source](https://www.python.org/downloads/source/)) |
| Alpine base (image) | 3.23.3 | 3.24.4 | 3.23.3 | upstream-owned immutable image exception; rebuilding belongs to actionlint publisher (#779) ([source](https://www.alpinelinux.org/releases/)) |
| Go compiler (actionlint binary) | 1.26.1 | 1.27.4 | 1.26.1 | upstream release build provenance; no Go manifest/build in this repository; new binary requires upstream release ([source](https://go.dev/dl/?mode=json)) |
| lychee executable | 0.24.2 | 0.24.2 | 0.24.2 | explicit version in SHA-pinned lychee action; connect-reset workaround remains required (#2297) ([source](https://github.com/lycheeverse/lychee/releases/tag/lychee-v0.24.2)) |
| zizmor analyzer | 1.29.0 | 1.32.0 | 1.32.0 | both action version input and pipx command agree; action wrapper latest alone is insufficient ([source](https://pypi.org/project/zizmor/)) |
| pre-commit hook collection | 6.0.0 | 6.0.0 | 6.0.0 | latest hooks; new major already present at baseline; no removed hooks configured ([source](https://github.com/pre-commit/pre-commit-hooks/releases/tag/v6.0.0)) |
| pre-commit executable | not repository-pinned | 4.7.0 | 4.7.0 (validation) | not installed by CI; current release used for full local hook validation ([source](https://pypi.org/project/pre-commit/)) |

The frozen actionlint image exceptions above are explicit upstream publication blockers,
not silent omissions. The image is the newest official stable artifact and keeps the
required embedded integrations. A different publisher or custom rebuilt image would
change the trust/build supply chain. [Report #779](https://github.com/rhysd/actionlint/issues/779)
contains measured versions and a concrete rebuild proposal. No claim is made that
those bundled components were upgraded, or that their OS advisories were audited.

There is no Cargo, npm lock, pip project, Terraform, Helm, Dockerfile or submodule
manifest in this repository. npm is bundled with Node and is not the package manager.
The hosted images own ambient Git/curl/pipx/Python and action runtimes; their moving
image revisions are recorded in CI logs rather than represented as repository pins.
Vendored trees inside SHA-pinned actions/tools are owned by those publishers;
known unresolved bugs are linked in analysis.md. No forked vendored copies are added.

## Disposable Python validation tools, including their full installed graph

| Dependency | Before | Latest stable | Selected | Reason / registry |
| --- | --- | --- | --- | --- |
| `boolean.py` | not pinned | 5.0 | 5.0 | disposable validation environment only; [PyPI](https://pypi.org/project/boolean.py/) |
| `CacheControl` | not pinned | 0.14.4 | 0.14.4 | disposable validation environment only; [PyPI](https://pypi.org/project/CacheControl/) |
| `certifi` | not pinned | 2026.10.23 | 2026.10.23 | disposable validation environment only; [PyPI](https://pypi.org/project/certifi/) |
| `cfgv` | not pinned | 3.5.0 | 3.5.0 | disposable validation environment only; [PyPI](https://pypi.org/project/cfgv/) |
| `charset-normalizer` | not pinned | 3.5.2 | 3.5.2 | disposable validation environment only; [PyPI](https://pypi.org/project/charset-normalizer/) |
| `cyclonedx-python-lib` | not pinned | 11.12.0 | 11.12.0 | disposable validation environment only; [PyPI](https://pypi.org/project/cyclonedx-python-lib/) |
| `defusedxml` | not pinned | 0.7.1 | 0.7.1 | disposable validation environment only; [PyPI](https://pypi.org/project/defusedxml/) |
| `distlib` | not pinned | 0.4.4 | 0.4.4 | disposable validation environment only; [PyPI](https://pypi.org/project/distlib/) |
| `filelock` | not pinned | 4.2.10 | 4.2.10 | disposable validation environment only; [PyPI](https://pypi.org/project/filelock/) |
| `identify` | not pinned | 2.6.20 | 2.6.20 | disposable validation environment only; [PyPI](https://pypi.org/project/identify/) |
| `idna` | not pinned | 3.20 | 3.20 | disposable validation environment only; [PyPI](https://pypi.org/project/idna/) |
| `license-expression` | not pinned | 30.4.4 | 30.4.4 | disposable validation environment only; [PyPI](https://pypi.org/project/license-expression/) |
| `markdown-it-py` | not pinned | 4.3.0 | 4.3.0 | disposable validation environment only; [PyPI](https://pypi.org/project/markdown-it-py/) |
| `mdurl` | not pinned | 0.1.2 | 0.1.2 | disposable validation environment only; [PyPI](https://pypi.org/project/mdurl/) |
| `msgpack` | not pinned | 1.2.4 | 1.2.4 | disposable validation environment only; [PyPI](https://pypi.org/project/msgpack/) |
| `nodeenv` | not pinned | 1.12.0 | 1.12.0 | disposable validation environment only; [PyPI](https://pypi.org/project/nodeenv/) |
| `packageurl-python` | not pinned | 0.17.6 | 0.17.6 | disposable validation environment only; [PyPI](https://pypi.org/project/packageurl-python/) |
| `packaging` | not pinned | 26.3 | 26.3 | disposable validation environment only; [PyPI](https://pypi.org/project/packaging/) |
| `pip` | not pinned | 26.3 | 26.3 | disposable validation environment only; [PyPI](https://pypi.org/project/pip/) |
| `pip_api` | not pinned | 0.0.35 | 0.0.35 | disposable validation environment only; [PyPI](https://pypi.org/project/pip_api/) |
| `pip_audit` | not pinned | 2.10.1 | 2.10.1 | disposable validation environment only; [PyPI](https://pypi.org/project/pip_audit/) |
| `pip-requirements-parser` | not pinned | 32.0.1 | 32.0.1 | disposable validation environment only; [PyPI](https://pypi.org/project/pip-requirements-parser/) |
| `platformdirs` | not pinned | 4.14.5 | 4.14.5 | disposable validation environment only; [PyPI](https://pypi.org/project/platformdirs/) |
| `pre_commit` | not pinned | 4.7.0 | 4.7.0 | disposable validation environment only; [PyPI](https://pypi.org/project/pre_commit/) |
| `py-serializable` | not pinned | 2.2.0 | 2.2.0 | disposable validation environment only; [PyPI](https://pypi.org/project/py-serializable/) |
| `pyflakes` | not pinned | 4.1.0 | 4.1.0 | disposable validation environment only; [PyPI](https://pypi.org/project/pyflakes/) |
| `Pygments` | not pinned | 2.21.0 | 2.21.0 | disposable validation environment only; [PyPI](https://pypi.org/project/Pygments/) |
| `pyparsing` | not pinned | 3.3.3 | 3.3.3 | disposable validation environment only; [PyPI](https://pypi.org/project/pyparsing/) |
| `python-discovery` | not pinned | 1.9.5 | 1.9.5 | disposable validation environment only; [PyPI](https://pypi.org/project/python-discovery/) |
| `PyYAML` | not pinned | 6.0.3 | 6.0.3 | disposable validation environment only; [PyPI](https://pypi.org/project/PyYAML/) |
| `requests` | not pinned | 2.34.2 | 2.34.2 | disposable validation environment only; [PyPI](https://pypi.org/project/requests/) |
| `rich` | not pinned | 15.0.0 | 15.0.0 | disposable validation environment only; [PyPI](https://pypi.org/project/rich/) |
| `sortedcontainers` | not pinned | 2.4.0 | 2.4.0 | disposable validation environment only; [PyPI](https://pypi.org/project/sortedcontainers/) |
| `tomli` | not pinned | 2.5.0 | 2.5.0 | disposable validation environment only; [PyPI](https://pypi.org/project/tomli/) |
| `tomli_w` | not pinned | 1.2.0 | 1.2.0 | disposable validation environment only; [PyPI](https://pypi.org/project/tomli_w/) |
| `urllib3` | not pinned | 2.8.0 | 2.8.0 | disposable validation environment only; [PyPI](https://pypi.org/project/urllib3/) |
| `virtualenv` | not pinned | 21.15.6 | 21.15.6 | disposable validation environment only; [PyPI](https://pypi.org/project/virtualenv/) |
| `zizmor` | not pinned | 1.32.0 | 1.32.0 | disposable validation environment only; [PyPI](https://pypi.org/project/zizmor/) |

These tools do not add Python package manifests or a runtime dependency to the library.
`pip-audit` reports no known advisories for this installed environment; see python-audit.json.
