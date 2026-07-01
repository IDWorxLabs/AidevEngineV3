import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface CommandResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

async function runNpm(cwd: string, args: string, timeoutMs: number): Promise<CommandResult> {
  try {
    const { stdout, stderr } = await execAsync(`npm ${args}`, {
      cwd,
      timeout: timeoutMs,
      windowsHide: true,
      env: process.env,
      maxBuffer: 10 * 1024 * 1024,
    });
    return { ok: true, stdout, stderr, exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; code?: number; message?: string };
    return {
      ok: false,
      stdout: e.stdout ?? '',
      stderr: `${e.stderr ?? ''}\n${e.message ?? String(err)}`.trim(),
      exitCode: typeof e.code === 'number' ? e.code : null,
    };
  }
}

export async function npmInstall(projectDir: string): Promise<CommandResult> {
  return runNpm(projectDir, 'install', 180_000);
}

export async function npmRunBuild(projectDir: string): Promise<CommandResult> {
  return runNpm(projectDir, 'run build', 120_000);
}
