import type { AppType, BuildPlan, GeneratedFile } from '../types.js';
import { writeGeneratedApp } from '../generator/generate-app.js';
import { npmInstall, npmRunBuild } from '../build/npm-runner.js';
import { startDevServer } from '../build/dev-server.js';
import { repairBuildFailure } from '../repair/repair-build-failure.js';
import type { LiveEngineeringTimelineTracker } from '../runtime/live-engineering-timeline.js';
import type {
  BuildLoopReport,
  BuildLoopStageResult,
  BuildLoopStageResultValue,
  BuildLoopStatus,
} from './build-loop-types.js';

export interface RunBuildLoopInput {
  projectDir: string;
  files: GeneratedFile[];
  appType: AppType;
  buildPlan: BuildPlan;
  skipPreview?: boolean;
  timeline?: LiveEngineeringTimelineTracker;
}

export interface RunBuildLoopResult {
  ok: boolean;
  error: string | null;
  generatedFiles: string[];
  installOk: boolean;
  buildOk: boolean;
  previewUrl: string | null;
  repairAttempted: boolean;
  repairSucceeded: boolean;
  repairSummary: string | null;
  initialBuildError: string | null;
  buildLoop: BuildLoopReport;
}

function recordStage(
  stages: BuildLoopStageResult[],
  stageName: string,
  startedAt: string,
  startMs: number,
  result: BuildLoopStageResultValue,
  options: { warnings?: string[]; failureReason?: string | null } = {},
  timeline?: LiveEngineeringTimelineTracker,
): BuildLoopStageResult {
  const stage: BuildLoopStageResult = {
    stageName,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - startMs,
    result,
    warnings: [...(options.warnings ?? [])],
    failureReason: options.failureReason ?? null,
  };
  stages.push(stage);

  if (timeline && stageName !== 'preview-verification') {
    timeline.completeFromBuildLoop(stageName, result, {
      warnings: stage.warnings,
      failureReason: stage.failureReason,
      details: [`Result: ${result}`, `Duration: ${(stage.durationMs / 1000).toFixed(1)}s`],
    });
  }

  return stage;
}

async function verifyPreviewUrl(url: string): Promise<{ verified: boolean; warning?: string }> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { verified: false, warning: `Preview HTTP ${response.status}` };
    }

    const body = await response.text();
    const servesApp =
      body.includes('id="root"') ||
      body.includes("id='root'") ||
      body.includes('<!DOCTYPE html');

    if (!servesApp) {
      return { verified: false, warning: 'Preview response does not appear to serve the application' };
    }

    return { verified: true };
  } catch (err) {
    return {
      verified: false,
      warning: err instanceof Error ? err.message : String(err),
    };
  }
}

function resolveStatus(
  input: RunBuildLoopInput,
  flags: {
    workspaceGenerated: boolean;
    installSucceeded: boolean;
    buildSucceeded: boolean;
    previewStarted: boolean;
    previewVerified: boolean;
    warnings: string[];
  },
): BuildLoopStatus {
  if (!flags.workspaceGenerated || !flags.installSucceeded || !flags.buildSucceeded) {
    return 'FAIL';
  }

  if (input.skipPreview) {
    return flags.warnings.length > 0 ? 'WARN' : 'PASS';
  }

  if (!flags.previewStarted || !flags.previewVerified) {
    return 'FAIL';
  }

  return flags.warnings.length > 0 ? 'WARN' : 'PASS';
}

export async function runBuildLoop(input: RunBuildLoopInput): Promise<RunBuildLoopResult> {
  const loopStartMs = Date.now();
  const stageResults: BuildLoopStageResult[] = [];
  const warnings: string[] = [];

  let generatedFiles: string[] = [];
  let installOk = false;
  let buildOk = false;
  let previewUrl: string | null = null;
  let previewStarted = false;
  let previewVerified = false;
  let workspaceGenerated = false;
  let failedStage: string | null = null;
  let error: string | null = null;
  let repairAttempted = false;
  let repairSucceeded = false;
  let repairSummary: string | null = null;
  let initialBuildError: string | null = null;

  // Stage: workspace generation
  {
    input.timeline?.startStage('workspace-generation');
    const stageStartMs = Date.now();
    const startedAt = new Date().toISOString();
    try {
      generatedFiles = writeGeneratedApp(input.projectDir, input.files);
      workspaceGenerated = generatedFiles.length > 0;
      recordStage(stageResults, 'workspace-generation', startedAt, stageStartMs, 'pass', {}, input.timeline);
    } catch (err) {
      failedStage = 'workspace-generation';
      error = err instanceof Error ? err.message : String(err);
      recordStage(stageResults, 'workspace-generation', startedAt, stageStartMs, 'fail', {
        failureReason: error,
      }, input.timeline);
    }
  }

  // Stage: dependency installation
  if (!failedStage) {
    input.timeline?.startStage('dependency-installation');
    const stageStartMs = Date.now();
    const startedAt = new Date().toISOString();
    const installResult = await npmInstall(input.projectDir);
    installOk = installResult.ok;

    if (installResult.ok) {
      recordStage(stageResults, 'dependency-installation', startedAt, stageStartMs, 'pass', {}, input.timeline);
    } else {
      failedStage = 'dependency-installation';
      error = `npm install failed: ${installResult.stderr || installResult.stdout}`.trim();
      recordStage(stageResults, 'dependency-installation', startedAt, stageStartMs, 'fail', {
        failureReason: error,
      }, input.timeline);
    }
  }

  // Stage: compile / build
  if (!failedStage) {
    input.timeline?.startStage('compile-build');
    const stageStartMs = Date.now();
    const startedAt = new Date().toISOString();
    let buildResult = await npmRunBuild(input.projectDir);

    if (!buildResult.ok) {
      initialBuildError = [buildResult.stdout, buildResult.stderr].filter(Boolean).join('\n').trim();

      const repair = repairBuildFailure({
        projectDir: input.projectDir,
        appType: input.appType,
        buildErrorOutput: initialBuildError,
        buildPlan: input.buildPlan,
      });

      repairAttempted = repair.attempted;
      repairSucceeded = repair.succeeded;
      repairSummary = repair.summary;

      if (repair.attempted && repair.succeeded) {
        warnings.push(`Build repair applied: ${repair.summary}`);
        buildResult = await npmRunBuild(input.projectDir);
      }
    }

    buildOk = buildResult.ok;

    if (buildResult.ok) {
      const stageWarnings = repairAttempted ? [`Repair applied: ${repairSummary}`] : [];
      recordStage(stageResults, 'compile-build', startedAt, stageStartMs, repairAttempted ? 'warn' : 'pass', {
        warnings: stageWarnings,
      }, input.timeline);
      if (repairAttempted) warnings.push(`Build repair applied: ${repairSummary}`);
    } else {
      failedStage = 'compile-build';
      error = repairAttempted
        ? `npm run build failed after repair: ${[buildResult.stdout, buildResult.stderr].filter(Boolean).join('\n').trim()}`
        : `npm run build failed: ${initialBuildError}`;
      recordStage(stageResults, 'compile-build', startedAt, stageStartMs, 'fail', {
        failureReason: error,
      }, input.timeline);
    }
  }

  // Stage: preview startup
  if (!failedStage && !input.skipPreview) {
    input.timeline?.startStage('preview-startup');
    const stageStartMs = Date.now();
    const startedAt = new Date().toISOString();
    const preview = await startDevServer(input.projectDir);

    if (preview.ok && preview.url) {
      previewStarted = true;
      previewUrl = preview.url;
      const stageWarnings = preview.reused ? ['Reused existing preview server'] : [];
      recordStage(stageResults, 'preview-startup', startedAt, stageStartMs, preview.reused ? 'warn' : 'pass', {
        warnings: stageWarnings,
      }, input.timeline);
      if (preview.reused) warnings.push('Preview server reused from prior run');
    } else {
      failedStage = 'preview-startup';
      error = preview.error ?? 'Dev server failed to start';
      recordStage(stageResults, 'preview-startup', startedAt, stageStartMs, 'fail', {
        failureReason: error,
      }, input.timeline);
    }
  } else if (!failedStage && input.skipPreview) {
    input.timeline?.startStage('preview-startup');
    const stageStartMs = Date.now();
    const startedAt = new Date().toISOString();
    warnings.push('Preview skipped by request');
    recordStage(stageResults, 'preview-startup', startedAt, stageStartMs, 'skipped', {
      warnings: ['Preview skipped by request'],
    }, input.timeline);
    recordStage(stageResults, 'preview-verification', startedAt, stageStartMs, 'skipped', {
      warnings: ['Preview skipped by request'],
    });
  }

  // Stage: preview verification (HTTP check — orchestrator runs full verification separately)
  if (!failedStage && !input.skipPreview && previewUrl) {
    const stageStartMs = Date.now();
    const startedAt = new Date().toISOString();
    const verification = await verifyPreviewUrl(previewUrl);

    if (verification.verified) {
      previewVerified = true;
      recordStage(stageResults, 'preview-verification', startedAt, stageStartMs, 'pass', {}, input.timeline);
    } else {
      failedStage = 'preview-verification';
      error = verification.warning ?? 'Preview verification failed';
      warnings.push(error);
      recordStage(stageResults, 'preview-verification', startedAt, stageStartMs, 'fail', {
        failureReason: error,
      }, input.timeline);
    }
  }

  const buildLoop: BuildLoopReport = {
    workspaceGenerated,
    dependenciesInstalled: installOk,
    installSucceeded: installOk,
    buildSucceeded: buildOk,
    previewStarted,
    previewVerified,
    previewUrl,
    elapsedTimeMs: Date.now() - loopStartMs,
    stageResults,
    failedStage,
    warnings: [...warnings],
    status: resolveStatus(input, {
      workspaceGenerated,
      installSucceeded: installOk,
      buildSucceeded: buildOk,
      previewStarted,
      previewVerified,
      warnings,
    }),
  };

  const ok = buildLoop.status !== 'FAIL';

  return {
    ok,
    error: ok ? null : error,
    generatedFiles,
    installOk,
    buildOk,
    previewUrl,
    repairAttempted,
    repairSucceeded,
    repairSummary,
    initialBuildError,
    buildLoop,
  };
}
