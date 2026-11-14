"""Resolve dependency versions from official registries; retain compact evidence."""

import json
from pathlib import Path
import re
import subprocess
from urllib.request import urlopen
from urllib.parse import quote

OUT = Path('dev/log/issues/108/pulls/109/registry')
OUT.mkdir(parents=True, exist_ok=True)


def get(url):
    with urlopen(url) as response:
        return json.load(response)


def gh(endpoint):
    return json.loads(subprocess.check_output(['gh', 'api', endpoint]))


def gh_pages(endpoint):
    pages = json.loads(subprocess.check_output(
        ['gh', 'api', '--paginate', '--slurp', endpoint]))
    return [entry for page in pages for entry in page]


def baseline(path):
    return subprocess.check_output(['git', 'show', f'e33364e:{path}'], text=True)


lock = json.loads(re.sub(r',\s*([}\]])', r'\1', baseline('bun.lock')))
npm = {}
for key, entry in lock['packages'].items():
    name, version = entry[0].rsplit('@', 1)
    if name not in npm:
        data = get(f'https://registry.npmjs.org/{quote(name, safe="@/")}/latest')
        npm[name] = dict(before=[], latest=data['version'],
                         source=f'https://registry.npmjs.org/{name}/latest',
                         dependencies=data.get('dependencies', {}),
                         engines=data.get('engines', {}),
                         repository=data.get('repository'))
    npm[name]['before'].append(version)
(OUT / 'npm.json').write_text(json.dumps(npm, indent=2) + '\n')
print('npm packages:', len(npm), flush=True)

nuget = {}
for path in Path('.').glob('**/packages.lock.json'):
    if 'node_modules' in path.parts:
        continue
    data = json.loads(baseline(str(path)))
    for packages in data['dependencies'].values():
        for name, entry in packages.items():
            if entry['type'].lower() == 'project':
                continue
            if name not in nuget:
                url = f'https://api.nuget.org/v3-flatcontainer/{name.lower()}/index.json'
                versions = get(url)['versions']
                stable = [v for v in versions if '-' not in v]
                nuget[name] = dict(before=[], latest=stable[-1], source=url)
            nuget[name]['before'].append(entry['resolved'])
for name in ['docfx', 'dotnet-outdated-tool']:
    url = f'https://api.nuget.org/v3-flatcontainer/{name}/index.json'
    nuget[name] = dict(before=['unpinned' if name == 'docfx' else 'not installed'],
                       latest=[v for v in get(url)['versions'] if '-' not in v][-1], source=url)
(OUT / 'nuget.json').write_text(json.dumps(nuget, indent=2) + '\n')
print('NuGet packages/tools:', len(nuget), flush=True)

actions = {}
for path in Path('.github').glob('**/*.yml'):
    for action, sha, tag in re.findall(r'uses:\s*([\w.-]+/[\w./-]+)@(\w+)\s*#\s*(v\S+)', baseline(str(path))):
        repo = '/'.join(action.split('/')[:2])
        if repo not in actions:
            releases = gh_pages(f'repos/{repo}/releases?per_page=100')
            release = next(r for r in releases if re.fullmatch(r'v\d+\.\d+\.\d+', r['tag_name']) and not r['prerelease'])
            latest = release['tag_name']
            actions[repo] = dict(before=[], latest=latest,
                                 sha=gh(f'repos/{repo}/commits/{latest}')['sha'],
                                 source=release['html_url'], notes=release['body'])
        actions[repo]['before'].append(tag)
repo = 'actions/setup-node'
release = gh(f'repos/{repo}/releases/latest')
actions[repo] = dict(before=['not pinned'], latest=release['tag_name'],
                     sha=gh(f'repos/{repo}/commits/{release["tag_name"]}')['sha'],
                     source=release['html_url'], notes=release['body'])
(OUT / 'actions.json').write_text(json.dumps(actions, indent=2) + '\n')
print('Action repositories:', len(actions), flush=True)

tools = {}
for name, repo in [('pre-commit-hooks', 'pre-commit/pre-commit-hooks'),
                   ('actionlint', 'rhysd/actionlint'),
                   ('lychee', 'lycheeverse/lychee')]:
    release = gh(f'repos/{repo}/releases/latest')
    tools[name] = dict(latest=release['tag_name'], source=release['html_url'], notes=release['body'])
for name in ['zizmor', 'pre-commit', 'pyflakes']:
    data = get(f'https://pypi.org/pypi/{name}/json')
    tools[name] = dict(latest=data['info']['version'], source=f'https://pypi.org/project/{name}/')
(OUT / 'tools.json').write_text(json.dumps(tools, indent=2) + '\n')
print('tools:', {k: v['latest'] for k, v in tools.items()}, flush=True)
