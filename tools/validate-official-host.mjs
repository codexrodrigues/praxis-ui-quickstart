import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fail(message) {
  throw new Error(`[official-host] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
}

async function assertFile(relativePath) {
  const target = path.resolve(root, relativePath);
  assert(target.startsWith(`${root}${path.sep}`), `Source path escapes the repository: ${relativePath}`);
  const info = await stat(target).catch(() => null);
  assert(info?.isFile(), `Declared source file does not exist: ${relativePath}`);
}

function assertHttps(value, label) {
  const url = new URL(value);
  assert(url.protocol === 'https:', `${label} must use HTTPS: ${value}`);
}

const packageJson = await readJson('package.json');
const manifest = await readJson('public/examples.manifest.json');
const routesSource = await readFile(path.join(root, 'src/app/app.routes.ts'), 'utf8');

assert(manifest.schemaVersion === 'praxis.quickstart-examples/v1', 'Unsupported manifest schemaVersion.');
assert(manifest.owner === packageJson.name, 'Manifest owner must match package.json name.');
assert(Array.isArray(manifest.examples) && manifest.examples.length > 0, 'Manifest must publish examples.');

for (const [key, value] of Object.entries(manifest.host ?? {})) {
  assertHttps(value, `host.${key}`);
}

const praxisDependencies = Object.entries(packageJson.dependencies ?? {})
  .filter(([name]) => name.startsWith('@praxisui/'));
const packageVersions = new Set(praxisDependencies.map(([, version]) => version));
assert(packageVersions.size === 1, `All @praxisui/* dependencies must use one exact train; found ${[...packageVersions].join(', ')}.`);
assert([...packageVersions].every((version) => /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)), 'PraxisUI dependencies must use exact versions.');
assert(packageVersions.has(manifest.packageTrain), 'Manifest packageTrain must match every @praxisui/* dependency.');

const angularDependencies = Object.entries({
  ...(packageJson.dependencies ?? {}),
  ...(packageJson.devDependencies ?? {}),
})
  .filter(([name]) => name.startsWith('@angular/'));
const angularVersions = new Set(angularDependencies.map(([, version]) => version));
assert(angularVersions.size === 1, `All Angular runtime dependencies must use one exact patch; found ${[...angularVersions].join(', ')}.`);
assert([...angularVersions].every((version) => /^\d+\.\d+\.\d+$/.test(version)), 'Angular dependencies must use exact versions.');

const keys = new Set();
const routes = new Set();
for (const example of manifest.examples) {
  assert(typeof example.key === 'string' && example.key.length > 0, 'Every example needs a key.');
  assert(!keys.has(example.key), `Duplicate example key: ${example.key}`);
  keys.add(example.key);

  assert(/^\/examples\/[a-z0-9-]+$/.test(example.route), `Invalid example route: ${example.route}`);
  assert(!routes.has(example.route), `Duplicate example route: ${example.route}`);
  routes.add(example.route);
  assert(routesSource.includes(`path: '${example.route.slice(1)}'`), `Route is not registered in app.routes.ts: ${example.route}`);

  assert(['core', 'composition'].includes(example.category), `Invalid category for ${example.key}.`);
  assert(example.status === 'executable', `Official example must be executable: ${example.key}`);
  assert(Array.isArray(example.resourcePaths) && example.resourcePaths.length > 0, `Example has no resourcePath: ${example.key}`);
  assert(Array.isArray(example.runtimePackages) && example.runtimePackages.length > 0, `Example has no runtime packages: ${example.key}`);
  for (const dependency of example.runtimePackages) {
    assert(packageJson.dependencies?.[dependency], `Example ${example.key} references an undeclared package: ${dependency}`);
  }
  await assertFile(example.sourcePath);
}

console.log(`[official-host] OK: ${manifest.examples.length} examples, PraxisUI ${manifest.packageTrain}, Angular ${[...angularVersions][0]}.`);
