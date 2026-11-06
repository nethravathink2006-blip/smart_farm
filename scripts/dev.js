import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const useNpmCli = Boolean(process.env.npm_execpath);
const command = useNpmCli ? process.execPath : (process.platform === 'win32' ? 'npm.cmd' : 'npm');
const args = useNpmCli ? [process.env.npm_execpath, 'run', 'dev'] : ['run', 'dev'];
const children = ['server', 'client'].map(folder => spawn(command, args, {
  cwd: resolve(root, folder),
  stdio: 'inherit',
  shell: process.platform === 'win32' && !useNpmCli
}));

function stop() {
  for (const child of children) child.kill('SIGINT');
  process.exit();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const child of children) child.on('exit', code => {
  if (code && code !== 0) process.exitCode = code;
});
