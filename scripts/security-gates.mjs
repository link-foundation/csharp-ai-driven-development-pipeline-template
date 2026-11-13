import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { printUntrusted } from './print-untrusted.mjs';

const object = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const array = (x, name, nonempty = false) => {
  if (!Array.isArray(x) || (nonempty && !x.length))
    throw Error(`Missing/malformed ${name}`);
  return x;
};
/** Collect all structural problems, diagnostics and findings without stopping a scan. */
export function collectSarifProblems(data) {
  const problems = [];
  const list = (value, name, nonempty = false) => {
    if (!Array.isArray(value) || (nonempty && !value.length)) {
      problems.push(`Missing/malformed ${name}`);
      return [];
    }
    return value;
  };
  const describe = (item) =>
    JSON.stringify({
      rule: item?.ruleId ?? item?.descriptor?.id ?? 'unknown',
      level: item?.level ?? 'unknown',
      locations: (Array.isArray(item?.locations) ? item.locations : []).map(
        (location) => ({
          file: location?.physicalLocation?.artifactLocation?.uri ?? 'unknown',
          line: location?.physicalLocation?.region?.startLine ?? 'unknown',
          column: location?.physicalLocation?.region?.startColumn ?? 'unknown',
        }),
      ),
      message: item?.message?.text ?? item?.message?.markdown ?? 'Missing message',
    });
  if (data?.version !== '2.1.0') problems.push('Unknown SARIF version');
  for (const [index, run] of list(data?.runs, 'SARIF runs', true).entries()) {
    const context = `run ${index}`;
    if (typeof run?.tool?.driver?.name !== 'string' || !run.tool.driver.name)
      problems.push(`${context}: Missing SARIF tool`);
    for (const finding of list(run?.results, `${context} SARIF results`))
      problems.push(
        `${context}: CodeQL finding (all levels are fatal): ${describe(finding)}`,
      );
    for (const [invocationIndex, invocation] of list(
      run?.invocations,
      `${context} SARIF invocations`,
      true,
    ).entries()) {
      const label = `${context} invocation ${invocationIndex}`;
      if (invocation?.executionSuccessful !== true)
        problems.push(`${label}: Incomplete/failed CodeQL execution`);
      for (const key of [
        'toolExecutionNotifications',
        'toolConfigurationNotifications',
      ]) {
        if (invocation?.[key] === undefined) continue;
        for (const diagnostic of list(invocation[key], `${label} ${key}`)) {
          if (!object(diagnostic) || !['note', 'none'].includes(diagnostic.level))
            problems.push(
              `${label}: CodeQL warning/error/unknown diagnostic: ${describe(diagnostic)}`,
            );
        }
      }
    }
  }
  return problems;
}

export function validateSarif(data) {
  const problems = collectSarifProblems(data);
  if (problems.length) throw Error(problems.join('\n'));
}

/** Read every file even when another file is malformed or has findings. */
export function collectSarifDirectoryProblems(directory) {
  const files = readdirSync(directory)
    .filter((file) => file.endsWith('.sarif'))
    .sort();
  if (!files.length) return ['Missing SARIF reports'];
  return files.flatMap((file) => {
    try {
      return collectSarifProblems(
        JSON.parse(readFileSync(join(directory, file), 'utf8')),
      ).map((problem) => `${JSON.stringify(file)}: ${problem}`);
    } catch {
      return [`${JSON.stringify(file)}: Unreadable/malformed SARIF JSON`];
    }
  });
}

function projects(data, expected, kind) {
  if (data?.version !== 1 || data.problems?.length || data.errors?.length)
    throw Error(`Unverified ${kind} provider/schema`);
  const found = new Map();
  for (const project of array(data.projects, `${kind} projects`, true)) {
    if (typeof project?.path !== 'string' || found.has(resolve(project.path)))
      throw Error(`Invalid ${kind} project`);
    // dotnet 8 emits exactly {path} for a successfully audited clean project.
    // The independently captured complete graph still supplies every TFM.
    if (
      kind === 'audit' &&
      project.frameworks === undefined &&
      Object.keys(project).length === 1
    ) {
      found.set(resolve(project.path), null);
      continue;
    }
    const frameworks = new Map();
    for (const framework of array(project.frameworks, `${kind} frameworks`, true)) {
      if (!framework?.framework || frameworks.has(framework.framework))
        throw Error('Invalid/duplicate framework');
      frameworks.set(framework.framework, framework);
    }
    found.set(resolve(project.path), frameworks);
  }
  if (found.size !== expected.length || expected.some((p) => !found.has(resolve(p))))
    throw Error(`Missing/unexpected ${kind} project graph`);
  return found;
}

export function validateAudit(audit, graph, expected) {
  array(expected, 'expected projects', true);
  const resolved = projects(graph, expected, 'dependency graph');
  const audited = projects(audit, expected, 'audit');
  for (const [project, frameworks] of resolved) {
    const checked = audited.get(project);
    if (checked !== null && checked.size !== frameworks.size)
      throw Error('Audit omitted resolved framework');
    for (const [name, framework] of frameworks) {
      const report = checked === null ? {} : checked.get(name);
      if (!report) throw Error('Audit omitted resolved framework');
      for (const kind of ['topLevelPackages', 'transitivePackages']) {
        for (const pkg of array(framework[kind] ?? [], `resolved ${kind}`)) {
          if (
            typeof pkg?.id !== 'string' ||
            !pkg.id ||
            typeof pkg.resolvedVersion !== 'string' ||
            !pkg.resolvedVersion
          )
            throw Error('Unresolved dependency coordinate');
        }
        for (const pkg of array(report[kind] ?? [], `audit ${kind}`)) {
          if (
            !object(pkg) ||
            !Array.isArray(pkg.vulnerabilities) ||
            !pkg.vulnerabilities.length
          )
            throw Error('Malformed vulnerability verdict');
          throw Error(`Vulnerable ${kind}: ${pkg.id}@${pkg.resolvedVersion}`);
        }
      }
    }
  }
}
export function validateJobResults(needs, required) {
  if (!object(needs)) throw Error('Missing job results');
  for (const name of required)
    if (needs[name]?.result !== 'success')
      throw Error(`Required job ${name}: ${needs[name]?.result ?? 'missing'}`);
}
export function findProjects(directory = '.') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (['.git', 'bin', 'obj', 'node_modules', 'artifacts'].includes(entry.name))
      return [];
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? findProjects(path)
      : entry.isFile() && entry.name.endsWith('.csproj')
        ? [resolve(path)]
        : [];
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
  if (process.argv[2] === 'sarif') {
    const problems = collectSarifDirectoryProblems(process.argv[3]);
    if (problems.length) {
      // Quoting keeps each value on a single line. Disable command parsing too:
      // GitHub's legacy ##[command] syntax can be recognized inside a line.
      printUntrusted(problems.join('\n'), console.error);
      console.error(`CodeQL gate failed: ${problems.length} problem(s)`);
      process.exitCode = 1;
    }
  } else if (process.argv[2] === 'audit')
    validateAudit(read(process.argv[3]), read(process.argv[4]), findProjects());
  else if (process.argv[2] === 'jobs')
    validateJobResults(
      JSON.parse(process.env.NEEDS_JSON || '{}'),
      process.argv.slice(3),
    );
  else throw Error('Expected sarif, audit or jobs command');
}
