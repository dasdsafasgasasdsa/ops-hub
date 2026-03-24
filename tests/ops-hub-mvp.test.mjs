import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = '/Users/openclaw/ops-hub';

async function exists(relPath) {
  await access(path.join(repoRoot, relPath));
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...options.env }
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed (${code}): ${command} ${args.join(' ')}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`));
      }
    });
  });
}

async function waitFor(url, predicate, timeoutMs = 20000) {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      if (predicate(res, text)) {
        return { res, text };
      }
      lastError = new Error(`Unexpected response ${res.status}: ${text.slice(0, 200)}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

async function withServer(command, args, { env, readyUrl, predicate, timeoutMs = 30000 }, fn) {
  const child = spawn(command, args, {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...env }
  });

  let logs = '';
  child.stdout.on('data', (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    logs += chunk.toString();
  });

  try {
    await waitFor(readyUrl, predicate, timeoutMs);
    return await fn(logs);
  } finally {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('close', resolve));
  }
}

test('PR #1 scaffold directories and workspace files exist', async () => {
  for (const rel of [
    'apps/web',
    'apps/api',
    'apps/worker',
    'packages/shared',
    'packages/db',
    'packages/task-engine',
    'packages/openclaw-adapter',
    'prisma',
    'scripts',
    'var/data',
    'var/logs',
    'var/runs',
    'var/artifacts',
    'launchd',
    'pnpm-workspace.yaml',
    'package.json'
  ]) {
    await exists(rel);
  }
});

test('PR #2 prisma schema contains required models and migration files', async () => {
  const schema = await readFile(path.join(repoRoot, 'prisma/schema.prisma'), 'utf8');
  for (const token of [
    'model Task ',
    'model TaskRun ',
    'model TaskEvent ',
    'model TaskArtifact ',
    'model Approval ',
    'model ExecutionLock ',
    'model Setting ',
    'enum TaskStatus ',
    'enum RunStatus ',
    'enum Priority ',
    'enum ApprovalDecision '
  ]) {
    assert.match(schema, new RegExp(token.replace(/ /g, '\\s+')));
  }
  await exists('prisma/migrations/migration_lock.toml');
  await exists('prisma/migrations/20260324072521_init/migration.sql');
});

test('PR #3 api builds and serves health endpoint on localhost using OPS_HUB_API_PORT', async () => {
  await run('pnpm', ['install', '--frozen-lockfile']);
  await run('pnpm', ['--filter', '@ops-hub/api', 'lint']);
  await run('pnpm', ['--filter', '@ops-hub/api', 'build']);

  await withServer(
    'pnpm',
    ['--filter', '@ops-hub/api', 'start'],
    {
      env: { OPS_HUB_API_PORT: '4015' },
      readyUrl: 'http://127.0.0.1:4015/health',
      predicate: (res, text) => res.status === 200 && text.includes('{"status":"ok"}')
    },
    async () => {
      const res = await fetch('http://127.0.0.1:4015/health');
      const json = await res.json();
      assert.equal(res.status, 200);
      assert.deepEqual(json, { status: 'ok' });
    }
  );
});

test('PR #4 web lint/build pass and dashboard renders with configurable OPS_HUB_WEB_PORT', async () => {
  await run('pnpm', ['--filter', '@ops-hub/web', 'lint']);
  await run('pnpm', ['--filter', '@ops-hub/web', 'build']);

  await withServer(
    'pnpm',
    ['--filter', '@ops-hub/web', 'start'],
    {
      env: { OPS_HUB_WEB_PORT: '3015' },
      readyUrl: 'http://127.0.0.1:3015/dashboard',
      predicate: (res, text) => res.status === 200 && text.includes('Dashboard')
    },
    async () => {
      const res = await fetch('http://127.0.0.1:3015/dashboard');
      const text = await res.text();
      assert.equal(res.status, 200);
      assert.match(text, /Dashboard/);
    }
  );
});
