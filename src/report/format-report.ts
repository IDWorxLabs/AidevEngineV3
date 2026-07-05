import type {
  ArchitectureGeneration,
  ArchitecturePlan,
  BuildLoopReport,
  BuildPlan,
  BuildReport,
  EngineeringTimeline,
  FeatureRealityReport,
  GenericApplicationCapabilities,
  PreviewVerificationReport,
  ProductQualityReport,
  RealAppTrialSuiteReport,
  UiStrategyReport,
  UnderstandingReport,
} from '../types.js';
import { formatStageDuration } from '../runtime/live-engineering-timeline.js';

function formatList(items: string[], indent = '  '): string[] {
  return items.map((item) => `${indent}• ${item}`);
}

export function formatUnderstandingSection(understanding: UnderstandingReport): string[] {
  return [
    '── Understanding ──',
    `Intent:     ${understanding.detectedIntent}`,
    `App name:   ${understanding.suggestedAppName}`,
    `Category:   ${understanding.applicationCategory ?? '—'}`,
    `Supported:  ${understanding.supported ? 'yes' : 'no'}`,
    `Confidence: ${understanding.confidence.toFixed(2)}`,
    `Matched:    ${understanding.matchedAppType ?? 'none'}`,
    'Features:',
    ...formatList(understanding.detectedFeatures),
    'Entities:',
    ...formatList(understanding.detectedEntities),
    'Reasoning:',
    `  ${understanding.reasoning}`,
  ];
}

export function formatBuildPlanSection(plan: BuildPlan): string[] {
  return [
    '── Build Plan ──',
    `App name:   ${plan.appName}`,
    'Features:',
    ...formatList(plan.features),
    'Pages:',
    ...formatList(plan.pages),
    'Components:',
    ...formatList(plan.components),
    'Project structure:',
    ...formatList(plan.projectStructure),
    'Stack:',
    ...formatList(plan.stack),
  ];
}

export function formatDraftBuildPlanSection(plan: BuildPlan): string[] {
  return [
    '── Draft Build Plan ──',
    `App name:   ${plan.appName}`,
    'Features:',
    ...formatList(plan.features),
    'Pages:',
    ...formatList(plan.pages),
    'Components:',
    ...formatList(plan.components),
    'Project structure:',
    ...formatList(plan.projectStructure),
    'Stack:',
    ...formatList(plan.stack),
  ];
}

export function formatArchitectureSection(plan: ArchitecturePlan): string[] {
  return [
    '── Architecture ──',
    `Project type: ${plan.projectType}`,
    'Recommended stack:',
    ...formatList(plan.recommendedStack),
    'Folders:',
    ...formatList(plan.folders),
    'Files:',
    ...formatList(plan.files),
    'Components:',
    ...formatList(plan.components),
    'Pages:',
    ...formatList(plan.pages),
    `State:       ${plan.stateManagement}`,
    `Routing:     ${plan.routing}`,
    `Data layer:  ${plan.dataLayer}`,
    `Styling:     ${plan.styling}`,
    `Testing:     ${plan.testingStrategy}`,
  ];
}

export function formatArchitectureGuidedGenerationSection(
  generation: ArchitectureGeneration,
): string[] {
  const lines: string[] = [
    '── Architecture-Guided Generation ──',
    `Applied:    ${generation.applied ? 'yes' : 'no'}`,
  ];

  if (generation.componentsGenerated.length > 0) {
    lines.push('Components generated:');
    lines.push(...formatList(generation.componentsGenerated));
  } else {
    lines.push('Components generated: (none)');
  }

  if (generation.pagesGenerated.length > 0) {
    lines.push('Pages generated:');
    lines.push(...formatList(generation.pagesGenerated));
  } else {
    lines.push('Pages generated: (none)');
  }

  if (generation.servicesGenerated.length > 0) {
    lines.push('Services generated:');
    lines.push(...formatList(generation.servicesGenerated));
  } else {
    lines.push('Services generated: (none)');
  }

  if (generation.foldersCreated.length > 0) {
    lines.push('Files/folders created:');
    lines.push(...formatList(generation.foldersCreated));
  } else {
    lines.push('Files/folders created: (none)');
  }

  return lines;
}

export function formatFeatureRealitySection(reality: FeatureRealityReport): string[] {
  const lines: string[] = [
    '── Feature Reality ──',
    `Status:     ${reality.status}`,
    `Confidence: ${reality.confidenceScore.toFixed(2)}`,
    'Requested features:',
    ...(reality.requestedFeatures.length > 0
      ? formatList(reality.requestedFeatures)
      : ['  (none)']),
    'Generated evidence:',
    ...(reality.generatedFeatureEvidence.length > 0
      ? formatList(reality.generatedFeatureEvidence)
      : ['  (none)']),
    'Rendered evidence:',
    ...(reality.renderedFeatureEvidence.length > 0
      ? formatList(reality.renderedFeatureEvidence)
      : ['  (none)']),
    'Missing features:',
    ...(reality.missingFeatures.length > 0 ? formatList(reality.missingFeatures) : ['  (none)']),
  ];
  return lines;
}

export function formatGenericApplicationCapabilitiesSection(
  capabilities: GenericApplicationCapabilities,
): string[] {
  return [
    '── Generic Application Capability ──',
    `Capability score: ${capabilities.capabilityScore.toFixed(2)}`,
    'UI patterns:',
    ...(capabilities.uiPatterns.length > 0
      ? formatList(capabilities.uiPatterns)
      : ['  (none)']),
    'Data patterns:',
    ...(capabilities.dataPatterns.length > 0
      ? formatList(capabilities.dataPatterns)
      : ['  (none)']),
    'CRUD capabilities:',
    ...(capabilities.crudCapabilities.length > 0
      ? formatList(capabilities.crudCapabilities)
      : ['  (none)']),
  ];
}

export function formatUiStrategySection(uiStrategy: UiStrategyReport): string[] {
  return [
    '── UI Strategy ──',
    `Strategy:               ${uiStrategy.strategyName} (${uiStrategy.strategyId})`,
    `Layout pattern:         ${uiStrategy.layoutPattern}`,
    `Primary user goal:      ${uiStrategy.primaryUserGoal}`,
    `Reason selected:        ${uiStrategy.selectionReason}`,
    `Primary surface:        ${uiStrategy.primarySurface}`,
    `Interaction model:      ${uiStrategy.interactionModel}`,
    'Generated layout components:',
    ...(uiStrategy.generatedLayoutComponents.length > 0
      ? formatList(uiStrategy.generatedLayoutComponents)
      : ['  (none)']),
  ];
}

export function formatProductQualitySection(quality: ProductQualityReport): string[] {
  return [
    '── Product Quality ──',
    `Quality score:        ${quality.qualityScore.toFixed(2)}`,
    `Responsive layout:    ${quality.responsiveLayout ? 'yes' : 'no'}`,
    'Design components:',
    ...(quality.designComponents.length > 0
      ? formatList(quality.designComponents)
      : ['  (none)']),
    'Accessibility support:',
    ...(quality.accessibilityFeatures.length > 0
      ? formatList(quality.accessibilityFeatures)
      : ['  (none)']),
    'CRUD UX features:',
    ...(quality.crudUxFeatures.length > 0
      ? formatList(quality.crudUxFeatures)
      : ['  (none)']),
    'Layout quality:',
    ...(quality.layoutFeatures.length > 0
      ? formatList(quality.layoutFeatures)
      : ['  (none)']),
  ];
}

export function formatPreviewVerificationSection(
  verification: PreviewVerificationReport,
): string[] {
  const lines: string[] = [
    '──────── Preview Verification ────────',
    `Status:                 ${verification.status}`,
    `Preview URL:            ${verification.previewUrl ?? '—'}`,
    `Preview started:        ${verification.previewStarted ? 'yes' : 'no'}`,
    `HTTP reachable:         ${verification.httpReachable ? 'yes' : 'no'}`,
    `HTTP status:            ${verification.httpStatus ?? '—'}`,
    `HTML loaded:            ${verification.htmlLoaded ? 'yes' : 'no'}`,
    `Application rendered:   ${verification.applicationRendered ? 'yes' : 'no'}`,
    `Preview startup:        ${(verification.previewStartupMs / 1000).toFixed(1)}s`,
    `Verification duration:  ${(verification.verificationDurationMs / 1000).toFixed(1)}s`,
  ];

  if (verification.evidence.length > 0) {
    lines.push('Evidence:');
    lines.push(...formatList(verification.evidence));
  } else {
    lines.push('Evidence:               (none)');
  }

  if (verification.warnings.length > 0) {
    lines.push('Warnings:');
    lines.push(...formatList(verification.warnings));
  } else {
    lines.push('Warnings:               (none)');
  }

  lines.push(`Overall status:         ${verification.status}`);

  return lines;
}

export function formatBuildLoopSection(loop: BuildLoopReport): string[] {
  const lines: string[] = [
    '──────── Build Loop ────────',
    `Status:               ${loop.status}`,
    `Workspace:            ${loop.workspaceGenerated ? 'generated' : 'not generated'}`,
    `Dependencies:         ${loop.dependenciesInstalled ? 'installed' : 'not installed'}`,
    `Build:                ${loop.buildSucceeded ? 'succeeded' : 'failed'}`,
    `Preview:              ${loop.previewStarted ? 'started' : 'not started'}`,
    `Preview verification: ${loop.previewVerified ? 'verified' : 'not verified'}`,
    `Duration:             ${(loop.elapsedTimeMs / 1000).toFixed(1)}s`,
    `Preview URL:            ${loop.previewUrl ?? '—'}`,
    `Overall verdict:        ${loop.status}`,
  ];

  if (loop.warnings.length > 0) {
    lines.push('Warnings:');
    lines.push(...formatList(loop.warnings));
  } else {
    lines.push('Warnings:             (none)');
  }

  if (loop.stageResults.length > 0) {
    lines.push('Stages:');
    for (const stage of loop.stageResults) {
      lines.push(
        `  • ${stage.stageName}: ${stage.result} (${stage.durationMs}ms)`,
      );
    }
  }

  return lines;
}

export function formatEngineeringTimelineSection(timeline: EngineeringTimeline): string[] {
  const lines: string[] = [
    '── Engineering Timeline ──',
    `Current stage:        ${timeline.currentStage}`,
    `Overall progress:     ${(timeline.overallProgress * 100).toFixed(0)}%`,
    `Total elapsed:        ${(timeline.totalElapsedTime / 1000).toFixed(1)}s`,
    `Engineering time:     ${(timeline.totalEngineeringTimeMs / 1000).toFixed(1)}s`,
    `Timeline health:      ${timeline.timelineHealth}`,
    `Slowest stage:        ${timeline.slowestStage ?? '—'}`,
    `Fastest stage:        ${timeline.fastestStage ?? '—'}`,
    'Stages:',
  ];

  for (const event of timeline.events) {
    const duration = event.durationMs != null ? formatStageDuration(event.durationMs) : '—';
    lines.push(`  • ${event.title}: ${event.status} (${duration})`);
    if (event.details.length > 0) {
      for (const detail of event.details.slice(0, 3)) {
        lines.push(`      ${detail}`);
      }
    }
  }

  return lines;
}

export function formatRealAppTrialSummarySection(suite: RealAppTrialSuiteReport): string[] {
  const lines: string[] = [
    '──────── Real App Trial Summary ────────',
    `Total apps:           ${suite.totalApps}`,
    `Passed:               ${suite.passed}`,
    `Warnings:             ${suite.warned}`,
    `Failed:               ${suite.failed}`,
    `Preview Passed:       ${suite.previewPassed}`,
    `Preview Warned:       ${suite.previewWarned}`,
    `Preview Failed:       ${suite.previewFailed}`,
    `Average quality:      ${suite.averageQualityScore.toFixed(2)}`,
    `Average build time:   ${(suite.averageBuildTime / 1000).toFixed(1)}s`,
    `Average engineering:  ${(suite.averageEngineeringTime / 1000).toFixed(1)}s`,
    `Overall success:      ${suite.overallSuccessPercentage.toFixed(0)}%`,
    'Applications:',
  ];

  for (const result of suite.results) {
    const engineering =
      result.totalEngineeringTimeMs > 0
        ? `, Engineering: ${(result.totalEngineeringTimeMs / 1000).toFixed(1)}s`
        : '';
    lines.push(
      `  • ${result.applicationType}: ${result.verdict} (Preview: ${result.previewVerificationStatus}, Quality: ${result.productQualityScore.toFixed(2)}${engineering})`,
    );
    if (result.slowestStage) {
      lines.push(`      Slowest: ${result.slowestStage}, Fastest: ${result.fastestStage ?? '—'}`);
    }
  }

  return lines;
}

export function formatBuildReport(report: BuildReport): string {
  const lines: string[] = [
    '═══════════════════════════════════════',
    '  AiDevEngine V3 — Build Report',
    '═══════════════════════════════════════',
    '',
    `Status:     ${report.ok ? 'SUCCESS' : 'FAILED'}`,
    `Prompt:     ${report.prompt}`,
    `App type:   ${report.appType}`,
    `Stage:      ${report.stage}`,
    `Duration:   ${(report.durationMs / 1000).toFixed(1)}s`,
  ];

  if (report.generationMode) {
    lines.push(`Generation Mode: ${report.generationMode}`);
  }

  if (report.engineeringTimeline) {
    lines.push('', ...formatEngineeringTimelineSection(report.engineeringTimeline));
  }

  if (report.understanding) {
    lines.push('', ...formatUnderstandingSection(report.understanding));
  }

  if (report.buildPlan) {
    const isDraft = report.understanding != null && !report.understanding.supported;
    lines.push('', ...(isDraft ? formatDraftBuildPlanSection(report.buildPlan) : formatBuildPlanSection(report.buildPlan)));
  }

  if (report.architecturePlan) {
    lines.push('', ...formatArchitectureSection(report.architecturePlan));
  }

  if (report.architectureGeneration) {
    lines.push('', ...formatArchitectureGuidedGenerationSection(report.architectureGeneration));
  }

  if (report.featureReality) {
    lines.push('', ...formatFeatureRealitySection(report.featureReality));
  }

  if (report.genericApplicationCapabilities) {
    lines.push('', ...formatGenericApplicationCapabilitiesSection(report.genericApplicationCapabilities));
  }

  if (report.buildLoop) {
    lines.push('', ...formatBuildLoopSection(report.buildLoop));
  }

  if (report.previewVerification) {
    lines.push('', ...formatPreviewVerificationSection(report.previewVerification));
  }

  if (report.productQuality) {
    lines.push('', ...formatProductQualitySection(report.productQuality));
  }

  if (report.uiStrategy) {
    lines.push('', ...formatUiStrategySection(report.uiStrategy));
  }

  if (report.realAppTrialResults && report.realAppTrialResults.length > 0) {
    const suite: RealAppTrialSuiteReport = {
      totalApps: report.realAppTrialResults.length,
      passed: report.realAppTrialResults.filter((r) => r.verdict === 'PASS').length,
      warned: report.realAppTrialResults.filter((r) => r.verdict === 'WARN').length,
      failed: report.realAppTrialResults.filter((r) => r.verdict === 'FAIL').length,
      previewPassed: report.realAppTrialResults.filter((r) => r.previewVerificationStatus === 'PASS').length,
      previewWarned: report.realAppTrialResults.filter((r) => r.previewVerificationStatus === 'WARN').length,
      previewFailed: report.realAppTrialResults.filter((r) => r.previewVerificationStatus === 'FAIL').length,
      averageQualityScore:
        report.realAppTrialResults.reduce((sum, r) => sum + r.productQualityScore, 0) /
        report.realAppTrialResults.length,
      averageBuildTime:
        report.realAppTrialResults.reduce((sum, r) => sum + r.durationMs, 0) /
        report.realAppTrialResults.length,
      averageEngineeringTime:
        report.realAppTrialResults.reduce((sum, r) => sum + r.totalEngineeringTimeMs, 0) /
        report.realAppTrialResults.length,
      totalDuration: report.realAppTrialResults.reduce((sum, r) => sum + r.durationMs, 0),
      overallSuccessPercentage:
        (report.realAppTrialResults.filter((r) => r.verdict !== 'FAIL').length /
          report.realAppTrialResults.length) *
        100,
      results: report.realAppTrialResults,
    };
    lines.push('', ...formatRealAppTrialSummarySection(suite));
  }

  lines.push(
    '',
    '── Project ──',
    `ID:         ${report.projectId}`,
    `Folder:     ${report.projectDir}`,
    `Files:      ${report.generatedFiles.length} generated`,
  );

  if (report.generatedFiles.length > 0) {
    for (const f of report.generatedFiles) {
      lines.push(`  • ${f}`);
    }
  }

  lines.push(
    '',
    '── Build ──',
    `npm install: ${report.installOk ? 'OK' : 'FAIL'}`,
    `npm build:   ${report.buildOk ? 'OK' : 'FAIL'}`,
  );

  if (report.repairAttempted) {
    lines.push(
      '',
      '── Repair ──',
      `Attempted:  yes`,
      `Succeeded:  ${report.repairSucceeded ? 'yes' : 'no'}`,
      `Summary:    ${report.repairSummary ?? '—'}`,
    );
    if (report.initialBuildError) {
      lines.push('', 'Initial build error:', report.initialBuildError);
    }
  }

  if (report.previewUrl) {
    lines.push('', '── Live Preview ──', `URL: ${report.previewUrl}`);
  }

  if (report.error) {
    lines.push('', '── Error ──', report.error);
  }

  lines.push('', '═══════════════════════════════════════');
  return lines.join('\n');
}

export function buildReportJson(report: BuildReport): string {
  return JSON.stringify(report, null, 2);
}
