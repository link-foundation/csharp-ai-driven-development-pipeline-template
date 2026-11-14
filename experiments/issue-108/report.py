"""Generate before/latest/selected dependency tables from retained registry data."""

from collections import defaultdict
import json
from pathlib import Path
import re

root = Path('dev/log/issues/108/pulls/109')
registry = root / 'registry'


def read(name):
    return json.loads((registry / f'{name}.json').read_text())


def versions(items):
    return ', '.join(sorted(set(items))) or 'not present'


def table(title, rows):
    return [f'## {title}', '',
            '| Dependency | Before | Latest stable | Selected | Reason / registry |',
            '| --- | --- | --- | --- | --- |', *rows, '']


lines = ['# Dependency resolution on 2026-11-14', '',
         'Baseline: `e33364e`. Registry responses are retained in `registry/`.',
         '“Latest” means the current stable release, excluding prereleases.',
         'Every Bun lock entry (including optional platform binaries) is included.',
         'Repeated instances are grouped by package; selected versions come from locks.',
         'Transitive compatibility exceptions name the actual parent constraints.',
         'Forcing a different major under these constraints would falsify the graph.', '']
lock = json.loads(re.sub(r',\s*([}\]])', r'\1', Path('bun.lock').read_text()))
selected = defaultdict(set)
parents = defaultdict(set)
for entry in lock['packages'].values():
    name, version = entry[0].rsplit('@', 1)
    selected[name].add(version)
    for dependency, constraint in entry[2].get('dependencies', {}).items():
        parents[dependency].add(f'`{name}@{version}` requires `{constraint}`')
rows = []
for name, data in sorted(read('npm').items()):
    actual = versions(selected[name])
    reason = 'current stable'
    if actual != data['latest']:
        reason = '; '.join(sorted(parents[name])) + '. Parent API/module compatibility; awaiting parent migration.'
        if name == 'undici-types':
            reason += ' Node types intentionally track the bundled Undici minor; the standalone newest types would describe a different runtime.'
    rows.append(f'| `{name}` | {versions(data["before"])} | {data["latest"]} | {actual} | {reason} ([npm]({data["source"]})) |')
lines += table('JavaScript: direct and transitive packages', rows)

selected = defaultdict(set)
for path in [Path('examples/packages.lock.json'), Path('src/MyPackage/packages.lock.json'),
             Path('tests/MyPackage.Tests/packages.lock.json')]:
    for framework in json.loads(path.read_text())['dependencies'].values():
        for name, entry in framework.items():
            if entry['type'].lower() != 'project':
                selected[name].add(entry['resolved'])
selected['docfx'].add(json.loads(Path('.config/dotnet-tools.json').read_text())['tools']['docfx']['version'])
rows = []
for name, data in sorted(read('nuget').items()):
    if name == 'dotnet-outdated-tool':
        continue  # Researched alternative; never a repository dependency.
    actual = versions(selected[name])
    reason = 'current stable'
    if name == 'Microsoft.Bcl.AsyncInterfaces':
        reason += '; explicit private test reference raises xUnit’s net6-compatible minimum to the current net11 package'
    rows.append(f'| `{name}` | {versions(data["before"])} | {data["latest"]} | {actual} | {reason} ([NuGet]({data["source"]})) |')
lines += table('.NET: all three project graphs and local tools', rows)

actual_actions = defaultdict(set)
for path in Path('.github').glob('**/*.yml'):
    for repo, tag in re.findall(r'uses:\s*([\w.-]+/[\w.-]+)(?:/[\w./-]+)?@[0-9a-f]{40}\s*#\s*(v\S+)', path.read_text()):
        actual_actions[repo].add(tag)
rows = []
for name, data in sorted(read('actions').items()):
    actual = versions(actual_actions[name])
    assert actual == data['latest'], (name, actual, data['latest'])
    rows.append(f'| `{name}` | {versions(data["before"])} | {data["latest"]} | {actual} | immutable SHA `{data["sha"]}` ([release]({data["source"]})) |')
lines += table('GitHub Actions (every repeated pin agrees)', rows)

infra = [
    ('Microsoft.NET SDK', '10.0.403', '11.0.100', '11.0.100',
     'global.json; official releases-index.json; runtime 11.0.0 / MSBuild 18.12.2 bundled',
     'https://builds.dotnet.microsoft.com/dotnet/release-metadata/releases-index.json'),
    ('TargetFramework', 'net10.0', 'net11.0', 'net11.0',
     'all projects inherit Directory.Build.props; consumer smoke fixture agrees',
     'https://learn.microsoft.com/en-us/dotnet/core/compatibility/11'),
    ('Node.js', 'ambient; engines >=22', '26.13.1', '26.13.1',
     '.node-version, engine floor and every JavaScript workflow agree; prerelease 27 excluded',
     'https://nodejs.org/dist/index.json'),
    ('Bun', '1.4.4', '1.4.4', '1.4.4',
     'packageManager, engine floor and every workflow agree',
     'https://github.com/oven-sh/bun/releases/latest'),
    ('Ubuntu hosted image', 'ubuntu-24.04', 'ubuntu-26.04', 'ubuntu-26.04',
     'latest GA Ubuntu runner; current image revisions managed by GitHub',
     'https://github.blog/changelog/2026-09-17-ubuntu-26-generally-available-and-latest-migration/'),
    ('macOS hosted image', 'macos-15', 'xcode-27 / macOS 27', 'xcode-27',
     'GA standard Apple Silicon runner; paid xlarge variant unnecessary',
     'https://github.blog/changelog/2026-10-15-xcode-27-runner-image-generally-available/'),
    ('Windows hosted image', 'windows-2025', 'windows-2025 / VS2026', 'windows-2025',
     'already current; windows-2025-vs2026 is an alias of the same GA image',
     'https://github.com/actions/runner-images#available-images'),
    ('Actions runner binary', 'GitHub managed', '2.338.2', 'GitHub managed',
     'hosted service progressively deploys this binary; no repository pin or self-hosted runner',
     'https://github.com/actions/runner/releases/tag/v2.338.2'),
    ('actionlint / Docker image', '1.7.12', '1.7.12', '1.7.12',
     'latest official stable; SHA256 b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667 in both uses',
     'https://github.com/rhysd/actionlint/releases/tag/v1.7.12'),
    ('ShellCheck (image)', '0.11.0', '0.11.0', '0.11.0',
     'embedded and standalone probes verify execution',
     'https://github.com/koalaman/shellcheck/releases/tag/v0.11.0'),
    ('Pyflakes (image)', '3.4.0', '4.1.0', '3.4.0',
     'upstream-owned immutable image exception; actionlint#779 requests rebuild; local Python probes use 4.1.0',
     'https://pypi.org/project/pyflakes/'),
    ('Python (image)', '3.12.12', '3.15.2', '3.12.12',
     'upstream-owned immutable image exception; actionlint#779 requests supported current interpreter',
     'https://www.python.org/downloads/source/'),
    ('Alpine base (image)', '3.23.3', '3.24.4', '3.23.3',
     'upstream-owned immutable image exception; rebuilding belongs to actionlint publisher (#779)',
     'https://www.alpinelinux.org/releases/'),
    ('Go compiler (actionlint binary)', '1.26.1', '1.27.4', '1.26.1',
     'upstream release build provenance; no Go manifest/build in this repository; new binary requires upstream release',
     'https://go.dev/dl/?mode=json'),
    ('lychee executable', '0.24.2', '0.24.2', '0.24.2',
     'explicit version in SHA-pinned lychee action; connect-reset workaround remains required (#2297)',
     'https://github.com/lycheeverse/lychee/releases/tag/lychee-v0.24.2'),
    ('zizmor analyzer', '1.29.0', '1.32.0', '1.32.0',
     'both action version input and pipx command agree; action wrapper latest alone is insufficient',
     'https://pypi.org/project/zizmor/'),
    ('pre-commit hook collection', '6.0.0', '6.0.0', '6.0.0',
     'latest hooks; new major already present at baseline; no removed hooks configured',
     'https://github.com/pre-commit/pre-commit-hooks/releases/tag/v6.0.0'),
    ('pre-commit executable', 'not repository-pinned', '4.7.0', '4.7.0 (validation)',
     'not installed by CI; current release used for full local hook validation',
     'https://pypi.org/project/pre-commit/'),
]
rows = [f'| {name} | {before} | {latest} | {actual} | {reason} ([source]({url})) |'
        for name, before, latest, actual, reason, url in infra]
lines += table('Infrastructure, analyzers and toolchains', rows)
lines += [
    'The frozen actionlint image exceptions above are explicit upstream publication blockers,',
    'not silent omissions. The image is the newest official stable artifact and keeps the',
    'required embedded integrations. A different publisher or custom rebuilt image would',
    'change the trust/build supply chain. [Report #779](https://github.com/rhysd/actionlint/issues/779)',
    'contains measured versions and a concrete rebuild proposal. No claim is made that',
    'those bundled components were upgraded, or that their OS advisories were audited.',
    '',
    'There is no Cargo, npm lock, pip project, Terraform, Helm, Dockerfile or submodule',
    'manifest in this repository. npm is bundled with Node and is not the package manager.',
    'The hosted images own ambient Git/curl/pipx/Python and action runtimes; their moving',
    'image revisions are recorded in CI logs rather than represented as repository pins.',
    'Vendored trees inside SHA-pinned actions/tools are owned by those publishers;',
    'known unresolved bugs are linked in analysis.md. No forked vendored copies are added.',
    '',
]
rows = []
for data in read('python-validation-tools'):
    assert data['selected'] == data['latest'], data
    rows.append(f'| `{data["name"]}` | not pinned | {data["latest"]} | {data["selected"]} | disposable validation environment only; [PyPI]({data["source"]}) |')
lines += table('Disposable Python validation tools, including their full installed graph', rows)
lines += ['These tools do not add Python package manifests or a runtime dependency to the library.',
          '`pip-audit` reports no known advisories for this installed environment; see python-audit.json.', '']
(root / 'dependencies.md').write_text('\n'.join(lines).rstrip() + '\n')
print(f'{len(lock["packages"])} Bun entries; {len(selected)} NuGet packages/tools; {len(actual_actions)} action repositories')
