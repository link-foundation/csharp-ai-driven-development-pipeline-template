#!/usr/bin/env bash
# Local offline package path exercises the generated package and real consumer.
set -euo pipefail
dotnet restore --locked-mode -warnaserror
dotnet build --no-restore -c Release -m:1 -warnaserror
dotnet test --no-build -c Release
project=$(find src -name '*.csproj' -print -quit)
if [ -z "$project" ]; then echo 'No package project found' >&2; exit 1; fi
package_id=$(dotnet msbuild "$project" -getProperty:PackageId)
version=$(dotnet msbuild "$project" -getProperty:Version)
library_namespace=$(dotnet msbuild "$project" -getProperty:RootNamespace)
dotnet pack "$project" --no-build --no-restore -c Release -o artifacts/local-package
PACKAGE_ID="$package_id" PACKAGE_VERSION="$version" node scripts/validate-nuget-package.mjs "artifacts/local-package/$package_id.$version.nupkg"
node scripts/smoke-test-nuget-package.mjs --package-id "$package_id" --library-namespace "$library_namespace" --release-version "$version" --source "$PWD/artifacts/local-package" --max-attempts 1
mkdir -p artifacts/security
sha256sum "artifacts/local-package/$package_id.$version.nupkg" > artifacts/security/tested-package.sha256
printf 'SHA=%s\nRUN=%s/%s/actions/runs/%s\n' "${GITHUB_SHA:-local}" "${GITHUB_SERVER_URL:-https://github.com}" "${GITHUB_REPOSITORY:-local}" "${GITHUB_RUN_ID:-local}" > artifacts/security/tested-run.txt
