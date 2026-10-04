import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });
const git = (args, cwd = root) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

for (const task of ['check', 'test', 'build'])
  run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', task]);
const remote = git(['remote', 'get-url', 'origin']);
const sourceCommit = git(['rev-parse', '--short', 'HEAD']);
const branchExists = git(['ls-remote', '--heads', remote, 'gh-pages']).length > 0;
const temp = await mkdtemp(join(tmpdir(), 'kabu-picnic-deploy-'));

try {
  const checkout = join(temp, 'site');
  if (branchExists) {
    run('git', [
      'clone',
      '--depth',
      '1',
      '--single-branch',
      '--branch',
      'gh-pages',
      remote,
      checkout,
    ]);
    // Only this disposable clone's previous website files are replaced.
    for (const entry of await readdir(checkout))
      if (entry !== '.git') await rm(join(checkout, entry), { recursive: true, force: true });
  } else {
    run('git', ['init', '-b', 'gh-pages', checkout]);
    run('git', ['remote', 'add', 'origin', remote], checkout);
  }
  for (const field of ['user.name', 'user.email'])
    run('git', ['config', field, git(['config', field])], checkout);
  await cp(join(root, 'dist'), checkout, { recursive: true });
  await writeFile(join(checkout, '.nojekyll'), '');
  run('git', ['add', '--all'], checkout);
  if (!git(['status', '--porcelain'], checkout)) {
    console.log('The published website already matches this build.');
  } else {
    run('git', ['commit', '-m', `deploy: forest picnic from ${sourceCommit}`], checkout);
    run('git', ['push', 'origin', 'HEAD:gh-pages'], checkout);
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
