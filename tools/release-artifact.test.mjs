import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { seal, verify, deploymentConfig } from './release-artifact.mjs';

const env = { GITHUB_SHA: 'a'.repeat(40), GITHUB_REPOSITORY: 'owner/site' };
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'praxis-release-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'dist'));
  writeFileSync(join(root, 'dist/index.html'), '<html>validated</html>');
  writeFileSync(join(root, 'package-lock.json'), '{}');
  writeFileSync(join(root, 'firebase.json'), JSON.stringify({ hosting: {
    public: 'dist', predeploy: ['npm run build'], rewrites: [{ source: '**', destination: '/index.html' }],
  } }));
  return root;
}
test('deploys validated content without changing the local build hook', t => {
  const root = fixture(t);
  seal(root, env);
  verify(root, env);
  const file = deploymentConfig(root, env);
  const config = JSON.parse(readFileSync(file));
  assert.equal(config.hosting.predeploy, undefined);
  assert.equal(config.hosting.rewrites[0].destination, '/index.html');
  assert.deepEqual(JSON.parse(readFileSync(join(root, 'firebase.json'))).hosting.predeploy, ['npm run build']);
});
test('rejects artifacts from another revision, repository or lockfile', t => {
  const root = fixture(t); seal(root, env);
  assert.throws(() => verify(root, { ...env, GITHUB_SHA: 'b'.repeat(40) }), /sha/);
  assert.throws(() => verify(root, { ...env, GITHUB_REPOSITORY: 'other/site' }), /repository/);
  writeFileSync(join(root, 'package-lock.json'), '{"changed":true}');
  assert.throws(() => verify(root, env), /lockfile/);
});
test('rejects modified or extra output files and refuses deployment', t => {
  const root = fixture(t); seal(root, env);
  writeFileSync(join(root, 'dist/extra.js'), 'unexpected');
  assert.throws(() => deploymentConfig(root, env), /content changed/);
  rmSync(join(root, 'dist/extra.js'));
  writeFileSync(join(root, 'dist/index.html'), 'modified');
  assert.throws(() => verify(root, env), /content changed/);
});
test('rejects missing output, symbolic links and a missing revision', t => {
  const root = fixture(t);
  assert.throws(() => seal(root, {}), /immutable/);
  symlinkSync(join(root, 'package-lock.json'), join(root, 'dist/link'));
  assert.throws(() => seal(root, env), /symlink/);
  rmSync(join(root, 'dist/link'));
  rmSync(join(root, 'dist/index.html'));
  assert.throws(() => seal(root, env), /index.html/);
});
