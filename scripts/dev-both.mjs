import { spawn } from 'node:child_process';

const procs = [];

function run(name, cmd, args, opts = {}) {
  const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
  procs.push({ name, p });
  p.on('exit', (code, signal) => {
    console.log(`[${name}] exited with`, code ?? signal);
  });
}

run('server', 'npm', ['start'], { cwd: 'server' });
run('client', 'npm', ['run', 'dev']);

function shutdown() {
  for (const { p } of procs) {
    if (!p.killed) {
      try { p.kill('SIGINT'); } catch {}
    }
  }
}

process.on('SIGINT', () => { shutdown(); process.exit(0); });
process.on('SIGTERM', () => { shutdown(); process.exit(0); });

