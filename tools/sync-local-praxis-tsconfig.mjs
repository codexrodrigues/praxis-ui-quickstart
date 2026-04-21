import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const quickstartRoot = path.resolve(__dirname, '..');
const platformRoot = path.resolve(quickstartRoot, '..');
const quickstartPackageJsonPath = path.join(quickstartRoot, 'package.json');
const quickstartTsconfigPath = path.join(quickstartRoot, 'tsconfig.json');
const angularProjectsRoot = path.join(platformRoot, 'praxis-ui-angular', 'projects');
const generatedTsconfigPath = path.join(quickstartRoot, 'tsconfig.local-praxis.json');
const localPraxisNodeModulesRoot = path.join(quickstartRoot, '.local-praxis', 'node_modules');
const localPraxisScopeRoot = path.join(localPraxisNodeModulesRoot, '@praxisui');

function readJson(jsonPath) {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const withoutBlockComments = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  const withoutLineComments = withoutBlockComments.replace(/^\s*\/\/.*$/gm, '');
  return JSON.parse(withoutLineComments);
}

function getPraxisQuickstartDependencies() {
  const quickstartPackageJson = readJson(quickstartPackageJsonPath);
  return Object.keys(quickstartPackageJson.dependencies ?? {})
    .filter((dependency) => dependency.startsWith('@praxisui/'))
    .sort();
}

function getExistingPathOverrides() {
  const quickstartTsconfig = readJson(quickstartTsconfigPath);
  return { ...(quickstartTsconfig.compilerOptions?.paths ?? {}) };
}

function appendSharedConsumerPaths(paths) {
  const sharedPaths = {
    '@angular/animations': ['./node_modules/@angular/animations'],
    '@angular/animations/*': ['./node_modules/@angular/animations/*'],
    '@angular/cdk': ['./node_modules/@angular/cdk'],
    '@angular/cdk/*': ['./node_modules/@angular/cdk/*'],
    '@angular/common': ['./node_modules/@angular/common'],
    '@angular/common/*': ['./node_modules/@angular/common/*'],
    '@angular/compiler': ['./node_modules/@angular/compiler'],
    '@angular/compiler/*': ['./node_modules/@angular/compiler/*'],
    '@angular/core': ['./node_modules/@angular/core'],
    '@angular/core/*': ['./node_modules/@angular/core/*'],
    '@angular/forms': ['./node_modules/@angular/forms'],
    '@angular/forms/*': ['./node_modules/@angular/forms/*'],
    '@angular/material': ['./node_modules/@angular/material'],
    '@angular/material/*': ['./node_modules/@angular/material/*'],
    '@angular/platform-browser': ['./node_modules/@angular/platform-browser'],
    '@angular/platform-browser/*': ['./node_modules/@angular/platform-browser/*'],
    '@angular/platform-browser-dynamic': ['./node_modules/@angular/platform-browser-dynamic'],
    '@angular/platform-browser-dynamic/*': ['./node_modules/@angular/platform-browser-dynamic/*'],
    '@angular/router': ['./node_modules/@angular/router'],
    '@angular/router/*': ['./node_modules/@angular/router/*'],
    rxjs: ['./node_modules/rxjs'],
    'rxjs/*': ['./node_modules/rxjs/*'],
    tslib: ['./node_modules/tslib/tslib.d.ts'],
  };

  for (const [key, value] of Object.entries(sharedPaths)) {
    paths[key] = value;
  }
}

function getPraxisLibraryMap() {
  const libraryMap = new Map();

  for (const entry of fs.readdirSync(angularProjectsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const packageJsonPath = path.join(angularProjectsRoot, entry.name, 'package.json');
    if (!fs.existsSync(packageJsonPath)) continue;

    const packageJson = readJson(packageJsonPath);
    if (typeof packageJson.name !== 'string' || !packageJson.name.startsWith('@praxisui/')) continue;

    const packageName = packageJson.name;
    const localPackageDirName = packageName.replace('@praxisui/', '');

    libraryMap.set(packageName, {
      distPath: `../praxis-ui-angular/dist/${entry.name}`,
      localBridgePath: `./.local-praxis/node_modules/@praxisui/${localPackageDirName}`,
    });
  }

  return libraryMap;
}

function buildGeneratedTsconfig(paths) {
  return {
    extends: './tsconfig.json',
    compilerOptions: {
      paths,
    },
  };
}

const dependencies = getPraxisQuickstartDependencies();
const libraryMap = getPraxisLibraryMap();
const paths = getExistingPathOverrides();
appendSharedConsumerPaths(paths);

const missingLibraries = [];
const distWarnings = [];

fs.mkdirSync(localPraxisScopeRoot, { recursive: true });

for (const dependency of dependencies) {
  const library = libraryMap.get(dependency);
  if (!library) {
    missingLibraries.push(dependency);
    continue;
  }

  const distAbsolutePath = path.resolve(quickstartRoot, library.distPath);
  if (!fs.existsSync(distAbsolutePath)) {
    distWarnings.push(`${dependency} -> ${library.distPath}`);
    delete paths[dependency];
    continue;
  }

  const localBridgeAbsolutePath = path.resolve(quickstartRoot, library.localBridgePath);
  fs.rmSync(localBridgeAbsolutePath, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(localBridgeAbsolutePath), { recursive: true });
  fs.cpSync(distAbsolutePath, localBridgeAbsolutePath, { recursive: true });

  paths[dependency] = [library.localBridgePath];
}

if (missingLibraries.length > 0) {
  console.error('Nao foi possivel mapear as libs Praxis abaixo em ../praxis-ui-angular/projects:');
  for (const dependency of missingLibraries) {
    console.error(`- ${dependency}`);
  }
  process.exit(1);
}

const generatedTsconfig = buildGeneratedTsconfig(paths);
fs.writeFileSync(generatedTsconfigPath, `${JSON.stringify(generatedTsconfig, null, 2)}\n`);

console.log(`Arquivo gerado: ${path.relative(quickstartRoot, generatedTsconfigPath)}`);
console.log(`Aliases Praxis mapeados: ${dependencies.length}`);

if (distWarnings.length > 0) {
  console.warn('');
  console.warn('Dist local ausente para algumas libs. Gere ou assista as libs antes de subir o quickstart em modo local:');
  for (const warning of distWarnings) {
    console.warn(`- ${warning}`);
  }
  console.warn('');
  console.warn('Comando recomendado em ../praxis-ui-angular: npm run watch-all');
}
