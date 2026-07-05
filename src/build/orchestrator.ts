import { join } from 'node:path';
import type { BuildFromPromptInput, BuildReport, GenerationMode } from '../types.js';
import { detectAppType, slugifyPrompt } from '../generator/detect-app-type.js';
import { buildArchitectureGuidedWorkspace } from '../generation/architecture-guided-generator.js';
import { createBuildPlan } from '../planner/create-build-plan.js';
import { createDraftBuildPlan } from '../planner/create-draft-build-plan.js';
import { createArchitecturePlan } from '../architecture/create-architecture-plan.js';
import { evaluateFeatureReality } from '../feature-reality/evaluate-feature-reality.js';
import { runBuildLoop } from '../build-loop/build-loop-engine.js';
import { analyzePrompt } from '../understanding/analyze-prompt.js';
import { evaluateGenericApplicationCapabilities } from '../generation/generic/evaluate-generic-capabilities.js';
import { evaluateProductQuality } from '../generation/product-quality/evaluate-product-quality.js';
import { isCrudApplication } from '../generation/generic/infer-application-profile.js';
import { runRealPreviewVerification } from '../testing/real-preview-runner.js';
import { LiveEngineeringTimelineTracker } from '../runtime/live-engineering-timeline.js';
import type { EngineeringTimelineStageId } from '../runtime/live-engineering-timeline.js';
import type { BuildLoopReport } from '../build-loop/build-loop-types.js';

const GENERATED_DIR = '.generated';

function previewStartupMsFromBuildLoop(buildLoop: BuildLoopReport | null): number {
  const stage = buildLoop?.stageResults.find((entry) => entry.stageName === 'preview-startup');
  return stage?.durationMs ?? 0;
}

export async function buildFromPrompt(input: BuildFromPromptInput): Promise<BuildReport> {
  const startedAt = new Date();
  const startMs = Date.now();
  const engineRootDir = input.engineRootDir ?? process.cwd();
  const prompt = input.prompt.trim();
  const timeline = new LiveEngineeringTimelineTracker(input.onTimelineEvent, startMs);

  const baseReport = (): Omit<BuildReport, 'durationMs' | 'finishedAt'> => ({
    ok: false,
    prompt,
    appType: 'unknown',
    understanding: null,
    buildPlan: null,
    architecturePlan: null,
    architectureGeneration: null,
    featureReality: null,
    buildLoop: null,
    previewVerification: null,
    realAppTrialResults: null,
    genericApplicationCapabilities: null,
    productQuality: null,
    uiStrategy: null,
    engineeringTimeline: null,
    generationMode: null,
    projectId: '',
    projectDir: '',
    generatedFiles: [],
    installOk: false,
    buildOk: false,
    previewUrl: null,
    stage: 'detect',
    error: null,
    repairAttempted: false,
    repairSucceeded: false,
    repairSummary: null,
    initialBuildError: null,
    startedAt: startedAt.toISOString(),
  });

  let report = baseReport();

  const finish = (patch: Partial<BuildReport>): BuildReport => {
    const finishedAt = new Date();
    const engineeringTimeline =
      patch.engineeringTimeline ??
      timeline.finalizeBuildComplete(patch.ok === true, {
        failureReason: patch.error ?? null,
        details: patch.ok
          ? [`Total engineering time: ${((Date.now() - startMs) / 1000).toFixed(1)}s`]
          : undefined,
      });

    return {
      ...report,
      ...patch,
      engineeringTimeline,
      finishedAt: finishedAt.toISOString(),
      durationMs: Date.now() - startMs,
    };
  };

  if (!prompt) {
    timeline.startStage('understanding');
    timeline.completeStage('understanding', 'Failed', { failureReason: 'Prompt is empty' });
    return finish({ stage: 'failed', error: 'Prompt is empty' });
  }

  timeline.startStage('understanding');
  const understanding = analyzePrompt(prompt);
  report = { ...report, understanding, stage: 'detect' };
  timeline.completeStage('understanding', 'Success', {
    details: [
      `Intent: ${understanding.detectedIntent}`,
      `Confidence: ${understanding.confidence.toFixed(2)}`,
      `Supported: ${understanding.supported ? 'yes' : 'no'}`,
    ],
  });

  const appType = detectAppType(prompt);
  report = { ...report, appType };

  timeline.startStage('build-planning');
  const isGenericPrototype = appType === 'unknown';
  const generationMode: GenerationMode = isGenericPrototype
    ? 'generic-prototype'
    : 'specialized-template';

  const buildPlan = isGenericPrototype
    ? createDraftBuildPlan(understanding)
    : createBuildPlan(prompt, appType);
  timeline.completeStage('build-planning', 'Success', {
    details: [
      `App name: ${buildPlan.appName}`,
      `Features: ${buildPlan.features.length}`,
      `Components: ${buildPlan.components.length}`,
    ],
  });

  timeline.startStage('architecture-planning');
  const architecturePlan = createArchitecturePlan(understanding, buildPlan);
  timeline.completeStage('architecture-planning', 'Success', {
    details: [
      `Project type: ${architecturePlan.projectType}`,
      `Components: ${architecturePlan.components.length}`,
      `Stack: ${architecturePlan.recommendedStack.join(', ')}`,
    ],
  });

  const slug = slugifyPrompt(prompt, appType);
  const projectId = `${slug}-${Date.now()}`;
  const projectDir = join(engineRootDir, GENERATED_DIR, projectId);

  report = {
    ...report,
    buildPlan,
    architecturePlan,
    generationMode,
    projectId,
    projectDir,
    stage: 'architecture',
  };

  try {
    timeline.startStage('architecture-guided-generation');
    const guided = buildArchitectureGuidedWorkspace({
      understanding,
      buildPlan,
      architecturePlan,
      projectName: projectId,
    });

    report = {
      ...report,
      stage: 'generate',
      architectureGeneration: guided.architectureGeneration,
      uiStrategy: guided.uiStrategy,
    };
    timeline.completeStage('architecture-guided-generation', 'Success', {
      details: [
        `Files generated: ${guided.files.length}`,
        `Components: ${guided.architectureGeneration.componentsGenerated.join(', ') || 'none'}`,
      ],
    });

    timeline.startStage('feature-reality');
    const featureReality = evaluateFeatureReality({
      understanding,
      buildPlan,
      architecturePlan,
      architectureGeneration: guided.architectureGeneration,
      generatedFiles: guided.files,
    });

    const genericApplicationCapabilities =
      isCrudApplication(
        buildPlan.appType,
        buildPlan.appName,
        understanding.detectedIntent,
        architecturePlan.projectType,
      )
        ? evaluateGenericApplicationCapabilities(guided.files)
        : null;

    const productQuality = evaluateProductQuality(guided.files);

    report = {
      ...report,
      featureReality,
      genericApplicationCapabilities,
      productQuality,
      stage: 'feature-reality',
    };
    timeline.completeStage('feature-reality', featureReality.status === 'FAIL' ? 'Failed' : featureReality.status === 'WARN' ? 'Warning' : 'Success', {
      details: [
        `Status: ${featureReality.status}`,
        `Confidence: ${featureReality.confidenceScore.toFixed(2)}`,
        ...featureReality.generatedFeatureEvidence.slice(0, 4),
      ],
      warnings: featureReality.missingFeatures.map((f) => `Missing: ${f}`),
    });

    const loopResult = await runBuildLoop({
      projectDir,
      files: guided.files,
      appType,
      buildPlan,
      skipPreview: input.skipPreview,
      timeline,
    });

    timeline.startStage('preview-verification');
    const previewVerification = await runRealPreviewVerification({
      projectDir,
      previewUrl: loopResult.previewUrl,
      previewStarted: loopResult.buildLoop.previewStarted,
      previewStartupMs: previewStartupMsFromBuildLoop(loopResult.buildLoop),
      skipPreview: input.skipPreview,
    });

    const buildLoopVerification = loopResult.buildLoop.stageResults.find(
      (s) => s.stageName === 'preview-verification',
    );
    const verificationDetails = [
      `Status: ${previewVerification.status}`,
      ...previewVerification.evidence.slice(0, 6),
    ];
    if (buildLoopVerification) {
      verificationDetails.push(`Build loop HTTP check: ${buildLoopVerification.result}`);
    }

    timeline.completeStage(
      'preview-verification',
      previewVerification.status === 'PASS'
        ? 'Success'
        : previewVerification.status === 'WARN'
          ? 'Warning'
          : 'Failed',
      {
        details: verificationDetails,
        warnings: previewVerification.warnings,
        failureReason:
          previewVerification.status === 'FAIL'
            ? previewVerification.warnings.join('; ') || 'Preview verification failed'
            : null,
      },
    );

    const featureRealityFinal = evaluateFeatureReality({
      understanding,
      buildPlan,
      architecturePlan,
      architectureGeneration: guided.architectureGeneration,
      generatedFiles: guided.files,
      previewUrl: loopResult.previewUrl,
    });

    const previewFailed = !input.skipPreview && previewVerification.status === 'FAIL';
    const buildSucceeded = loopResult.buildOk && !previewFailed;

    return finish({
      ok: loopResult.ok && !previewFailed,
      generatedFiles: loopResult.generatedFiles,
      installOk: loopResult.installOk,
      buildOk: buildSucceeded,
      previewUrl: loopResult.previewUrl,
      repairAttempted: loopResult.repairAttempted,
      repairSucceeded: loopResult.repairSucceeded,
      repairSummary: loopResult.repairSummary,
      initialBuildError: loopResult.initialBuildError,
      featureReality: featureRealityFinal,
      genericApplicationCapabilities,
      productQuality,
      buildLoop: loopResult.buildLoop,
      previewVerification,
      stage: buildSucceeded && loopResult.ok ? 'complete' : 'failed',
      error: previewFailed
        ? previewVerification.warnings.join('; ') || 'Preview verification failed'
        : loopResult.error,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const running = timeline.getSnapshot().events.find((e) => e.status === 'Running');
    if (running) {
      timeline.completeStage(running.id as EngineeringTimelineStageId, 'Failed', {
        failureReason: message,
      });
    }
    return finish({
      stage: 'failed',
      error: message,
    });
  }
}
