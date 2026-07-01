import { spawn, type ChildProcess } from 'node:child_process';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import {
  parseViteDevServerUrl,
  summarizeDevServerStartupFailure,
} from './vite-dev-server-output.js';

export interface DevServerState {
  child: ChildProcess;
  port: number;
  url: string;
  projectDir: string;
  startedAt: number;
}

const activeServers = new Map<string, DevServerState>();

function resolveViteExecutable(projectDir: string): { executable: string; args: string[] } | null {
  const viteBin = join(projectDir, 'node_modules', 'vite', 'bin', 'vite.js');
  if (!existsSync(viteBin)) return null;
  return { executable: process.execPath, args: [viteBin, '--host', '127.0.0.1'] };
}

export function startDevServer(
  projectDir: string,
  timeoutMs = 45_000,
): Promise<{ ok: boolean; port?: number; url?: string; error?: string; reused?: boolean }> {
  const existing = activeServers.get(projectDir);
  if (existing && existing.child.exitCode === null) {
    return Promise.resolve({
      ok: true,
      port: existing.port,
      url: existing.url,
      reused: true,
    });
  }

  const spawnTarget = resolveViteExecutable(projectDir);
  if (!spawnTarget) {
    return Promise.resolve({ ok: false, error: 'node_modules/vite not found — run npm install first' });
  }

  return new Promise((resolve) => {
    const child = spawn(spawnTarget.executable, spawnTarget.args, {
      cwd: projectDir,
      env: { ...process.env, BROWSER: 'none' },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (result: { ok: boolean; port?: number; url?: string; error?: string; reused?: boolean }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      if (result.ok && result.port && result.url) {
        activeServers.set(projectDir, {
          child,
          port: result.port,
          url: result.url,
          projectDir,
          startedAt: Date.now(),
        });
        resolve(result);
        return;
      }

      if (result.ok) {
        const parsed = parseViteDevServerUrl(`${stdout}\n${stderr}`);
        if (parsed) {
          activeServers.set(projectDir, {
            child,
            port: parsed.port,
            url: parsed.url,
            projectDir,
            startedAt: Date.now(),
          });
          resolve({ ok: true, port: parsed.port, url: parsed.url });
          return;
        }
      }

      if (!result.ok) {
        child.kill('SIGTERM');
        activeServers.delete(projectDir);
      }
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({
        ok: false,
        error: summarizeDevServerStartupFailure(stdout, stderr),
      });
    }, timeoutMs);

    const tryParse = () => {
      const parsed = parseViteDevServerUrl(`${stdout}\n${stderr}`);
      if (parsed) finish({ ok: true, port: parsed.port, url: parsed.url });
    };

    child.stdout?.on('data', (chunk) => {
      stdout += String(chunk);
      tryParse();
    });
    child.stderr?.on('data', (chunk) => {
      stderr += String(chunk);
      tryParse();
    });

    child.on('error', (err) => {
      finish({ ok: false, error: String(err) });
    });

    child.on('exit', (code) => {
      if (!settled && code !== 0) {
        finish({ ok: false, error: summarizeDevServerStartupFailure(stdout, stderr) });
      }
    });
  });
}

export function getActiveDevServer(projectDir: string): DevServerState | null {
  const state = activeServers.get(projectDir);
  if (!state || state.child.exitCode !== null) return null;
  return state;
}

export function listActiveDevServers(): DevServerState[] {
  return [...activeServers.values()].filter((s) => s.child.exitCode === null);
}
