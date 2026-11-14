#!/usr/bin/env bash
# Real SDK regression: refreshing vulnerability data must not rewrite a lock.
set -euo pipefail
root=$(pwd)
fixture=$(mktemp -d)
trap 'rm -rf "$fixture"' EXIT
mkdir -p "$fixture/scripts"
cp scripts/audit-dependencies.mjs scripts/security-gates.mjs scripts/print-untrusted.mjs "$fixture/scripts/"
cp global.json "$fixture/"
framework=$(sed -n 's:.*<TargetFramework>\(.*\)</TargetFramework>.*:\1:p' Directory.Build.props)
cat > "$fixture/Probe.csproj" <<XML
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>$framework</TargetFramework>
    <RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>
  </PropertyGroup>
</Project>
XML
cd "$fixture"
dotnet restore --disable-parallel -warnaserror
node scripts/audit-dependencies.mjs
cp packages.lock.json original.lock
# A committed lock for a different TFM is stale. Locked restore must reject it.
sed -i "s/$framework/net9.0/g" packages.lock.json
cp packages.lock.json stale.lock
if node scripts/audit-dependencies.mjs > rejected.log 2>&1; then
  echo 'Audit accepted stale lockfile' >&2
  exit 1
fi
grep NU1004 rejected.log
cmp packages.lock.json stale.lock
cp original.lock packages.lock.json
node scripts/audit-dependencies.mjs
printf 'Fresh audit succeeded; stale lock rejected without rewriting it (%s)\n' "$root"
