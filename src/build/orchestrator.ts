import { join } from 'node:path';
import type { BuildFromPromptInput, BuildReport } from '../types.js';
import { detectAppType, slugifyPrompt } from '../generator/detect-app-type.js';
import { resolveAppFiles, writeGeneratedApp } from '../generator/generate-app.js';
import { npmInstall, npmRunBuild } from './npm-runner.js';
import { startDevServer } from './dev-server.js';

const GENERATED_DIR = '.generated';

export async function buildFromPrompt(input: BuildFromPromptInput): Promise<BuildReport> {
  const startedAt = new Date();
  const startMs = Date.now();
  const engineRootDir = input.engineRootDir ?? process.cwd();
  const prompt = input.prompt.trim();

  const baseReport = (): Omit<BuildReport, 'durationMs' | 'finishedAt'> => ({
    ok: false,
    prompt,
    appType: 'unknown',
    projectId: '',
    projectDir: '',
    generatedFiles: [],
    installOk: false,
    buildOk: false,
    previewUrl: null,
    stage: 'detect',
    error: null,
    startedAt: startedAt.toISOString(),
  });

  let report = baseReport();

  const finish = (patch: Partial<BuildReport>): BuildReport => {
    const finishedAt = new Date();
    return {
      ...report,
      ...patch,
      finishedAt: finishedAt.toISOString(),
      durationMs: Date.now() - startMs,
    };
  };

  if (!prompt) {
    return finish({ stage: 'failed', error: 'Prompt is empty' });
  }

  const appType = detectAppType(prompt);
  report = { ...report, appType, stage: 'detect' };

  if (appType === 'unknown') {
    return finish({
      stage: 'failed',
      error: 'Could not detect app type. Supported: calculator, counter, todo (e.g. "Build a calculator app", "Build a counter app", or "Build a todo app")',
    });
  }

  const slug = slugifyPrompt(prompt, appType);
  const projectId = `${slug}-${Date.now()}`;
  const projectDir = join(engineRootDir, GENERATED_DIR, projectId);
  report = { ...report, projectId, projectDir, stage: 'generate' };

  try {
    const files = resolveAppFiles(appType, projectId);
    const generatedFiles = writeGeneratedApp(projectDir, files);
    report = { ...report, generatedFiles, stage: 'install' };

    const installResult = await npmInstall(projectDir);
    if (!installResult.ok) {
      return finish({
        stage: 'failed',
        installOk: false,
        error: `npm install failed: ${installResult.stderr || installResult.stdout}`.trim(),
      });
    }
    report = { ...report, installOk: true, stage: 'build' };

    const buildResult = await npmRunBuild(projectDir);
    if (!buildResult.ok) {
      return finish({
        stage: 'failed',
        buildOk: false,
        error: `npm run build failed: ${buildResult.stderr || buildResult.stdout}`.trim(),
      });
    }
    report = { ...report, buildOk: true, stage: 'preview' };

    if (input.skipPreview) {
      return finish({ ok: true, stage: 'complete' });
    }

    const preview = await startDevServer(projectDir);
    if (!preview.ok || !preview.url) {
      return finish({
        stage: 'failed',
        error: preview.error ?? 'Dev server failed to start',
      });
    }

    return finish({
      ok: true,
      previewUrl: preview.url,
      stage: 'complete',
    });
  } catch (err) {
    return finish({
      stage: 'failed',
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
