#!/usr/bin/env node
/**
 * H4CK3D local project scanner — zero-dependency companion server for the
 * "Lokálne projekty" source.
 *
 *   npm run server                          # scans ~/Projects (or the cwd parent)
 *   PROJECTS_DIR=~/code npm run server
 *   CORS_ORIGINS=https://timeline.example.com npm run server
 *
 * Security: binds to 127.0.0.1 only, read-only, and answers CORS only for the
 * origins listed in CORS_ORIGINS (dev ports are always allowed) so a random
 * website can't read your folder structure.
 */
import { execFile } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? '127.0.0.1';
const MAX_DEPTH = Number(process.env.SCAN_DEPTH ?? 2);
const expandHome = (p) => (p.startsWith('~') ? join(homedir(), p.slice(1)) : p);
const ROOTS = (process.env.PROJECTS_DIR ?? process.argv[2] ?? join(homedir(), 'Projects'))
  .split(',')
  .map((p) => resolve(expandHome(p.trim())))
  .filter(Boolean);

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];
const ALLOWED = new Set([
  ...DEV_ORIGINS,
  ...(process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean),
]);

const SKIP = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.cache',
  'vendor',
  '.turbo',
  'coverage',
]);

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function readJSON(p) {
  try {
    return JSON.parse(await readFile(p, 'utf8'));
  } catch {
    return null;
  }
}

async function gitRemote(dir) {
  try {
    const config = await readFile(join(dir, '.git', 'config'), 'utf8');
    const origin = config.match(/\[remote "origin"\][^[]*?url\s*=\s*(.+)/);
    return origin ? origin[1].trim() : null;
  } catch {
    return null;
  }
}

async function lastCommit(dir) {
  try {
    const { stdout } = await run('git', ['-C', dir, 'log', '-1', '--format=%cI'], { timeout: 3000 });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

async function describe(dir) {
  const [pkg, hasGit] = await Promise.all([readJSON(join(dir, 'package.json')), exists(join(dir, '.git'))]);
  if (!pkg && !hasGit) return null;

  const [remoteUrl, commitDate, info] = await Promise.all([
    hasGit ? gitRemote(dir) : null,
    hasGit ? lastCommit(dir) : null,
    stat(dir),
  ]);

  return {
    name: (typeof pkg?.name === 'string' && pkg.name.replace(/^@[^/]+\//, '')) || basename(dir),
    path: dir,
    description: typeof pkg?.description === 'string' ? pkg.description : null,
    remoteUrl,
    lastCommitDate: commitDate ?? info.mtime.toISOString(),
    dependencies: Object.keys({ ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) }),
  };
}

async function scan(dir, depth, out) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    const project = await describe(full);
    if (project) out.push(project);
    else if (depth < MAX_DEPTH) await scan(full, depth + 1, out);
  }
}

function send(res, status, body, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Origin',
  };
  if (origin && ALLOWED.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    // Chrome Private Network Access: allow an HTTPS site to reach localhost.
    headers['Access-Control-Allow-Private-Network'] = 'true';
  }
  res.writeHead(status, headers);
  res.end(body === null ? undefined : JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin;
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

  if (origin && !ALLOWED.has(origin))
    return send(res, 403, { error: `Origin ${origin} is not allowed` }, null);
  if (req.method === 'OPTIONS') return send(res, 204, null, origin);
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' }, origin);

  if (url.pathname === '/health') return send(res, 200, { ok: true, roots: ROOTS }, origin);

  if (url.pathname === '/api/local/projects') {
    try {
      const projects = [];
      for (const root of ROOTS) await scan(root, 1, projects);
      projects.sort((a, b) => (b.lastCommitDate ?? '').localeCompare(a.lastCommitDate ?? ''));
      return send(res, 200, { projects }, origin);
    } catch (err) {
      console.error(err);
      return send(res, 500, { error: 'Scan failed' }, origin);
    }
  }

  return send(res, 404, { error: 'Not found' }, origin);
});

server.listen(PORT, HOST, () => {
  console.log(`▲ H4CK3D local scanner on http://${HOST}:${PORT}`);
  console.log(`  scanning: ${ROOTS.join(', ')} (depth ${MAX_DEPTH})`);
  console.log(`  allowed origins: ${[...ALLOWED].join(', ')}`);
  for (const r of ROOTS)
    exists(r).then((ok) => ok || console.warn(`  ⚠ ${r} does not exist (parent: ${dirname(r)})`));
});
