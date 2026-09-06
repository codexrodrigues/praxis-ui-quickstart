import { createHash } from 'node:crypto';
import { lstatSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const receiptName = '.praxis-release.json';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function inventory(directory) {
  const files = {};
  function walk(current) {
    for (const entry of readdirSync(current).sort()) {
      const path = join(current, entry);
      const name = relative(directory, path).replaceAll('\\', '/');
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) throw new Error(`Release artifact contains symlink: ${name}`);
      if (name === receiptName) continue;
      if (stat.isDirectory()) walk(path);
      else if (stat.isFile()) files[name] = hash(readFileSync(path));
      else throw new Error(`Unsupported artifact entry: ${name}`);
    }
  }
  walk(directory);
  if (!Object.hasOwn(files, 'index.html')) throw new Error('Missing production index.html');
  return files;
}

function context(root, env) {
  if (!/^[0-9a-f]{40}$/.test(env.GITHUB_SHA ?? '')) throw new Error('An immutable GITHUB_SHA is required');
  if (!env.GITHUB_REPOSITORY) throw new Error('GITHUB_REPOSITORY is required');
  const config = JSON.parse(readFileSync(join(root, 'firebase.json'), 'utf8'));
  if (!config.hosting?.public || Array.isArray(config.hosting)) throw new Error('Expected one Firebase hosting target');
  const directory = resolve(root, config.hosting.public);
  const outputPath = relative(resolve(root), directory);
  if (!outputPath || outputPath === '..' || outputPath.startsWith('..' + (process.platform === 'win32' ? '\\' : '/')) || isAbsolute(outputPath)) throw new Error('Hosting output must be inside the checkout');
  return { config, directory, identity: {
    repository: env.GITHUB_REPOSITORY,
    sha: env.GITHUB_SHA,
    lockfileSha256: hash(readFileSync(join(root, 'package-lock.json'))),
  } };
}

export function seal(root, env = process.env) {
  const { directory, identity } = context(root, env);
  const receipt = { ...identity, files: inventory(directory) };
  writeFileSync(join(directory, receiptName), JSON.stringify(receipt, null, 2) + '\n');
  return receipt;
}

export function verify(root, env = process.env) {
  const { directory, identity } = context(root, env);
  const receipt = JSON.parse(readFileSync(join(directory, receiptName), 'utf8'));
  for (const [key, value] of Object.entries(identity)) {
    if (receipt[key] !== value) throw new Error(`Release identity mismatch: ${key}`);
  }
  if (JSON.stringify(receipt.files) !== JSON.stringify(inventory(directory))) {
    throw new Error('Release artifact content changed after validation');
  }
  return receipt;
}

export function deploymentConfig(root, env = process.env) {
  verify(root, env);
  const { config } = context(root, env);
  delete config.hosting.predeploy;
  const target = join(root, '.firebase.release.json');
  writeFileSync(target, JSON.stringify(config, null, 2) + '\n');
  return target;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const commands = { seal, verify, 'firebase-config': deploymentConfig };
  const command = commands[process.argv[2]];
  if (!command) throw new Error('Usage: node tools/release-artifact.mjs seal|verify|firebase-config');
  command(root);
  console.log(`Release artifact ${process.argv[2]} completed for ${process.env.GITHUB_SHA}`);
}
