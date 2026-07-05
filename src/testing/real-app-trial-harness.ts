import type { BuildReport } from '../types.js';

import { buildFromPrompt } from '../build/orchestrator.js';

import type {

  RealAppTrialResult,

  RealAppTrialSuiteReport,

  RealAppTrialVerdict,

} from './real-app-trial-types.js';



export const REAL_APP_TRIAL_SUITE: readonly string[] = [

  'Build a calculator.',

  'Build a counter.',

  'Build a todo list.',

  'Build a weather app.',

  'Build an expense tracker.',

  'Build a note-taking app.',

  'Build a habit tracker.',

  'Build a recipe manager.',

  'Build a contact manager.',

  'Build a countdown timer.',

];



export interface RunRealAppTrialHarnessInput {

  prompts?: readonly string[];

  engineRootDir?: string;

  skipPreview?: boolean;

}



function collectWarnings(report: BuildReport): string[] {

  const warnings: string[] = [];



  if (report.buildLoop?.warnings.length) {

    warnings.push(...report.buildLoop.warnings);

  }



  if (report.previewVerification?.warnings.length) {

    warnings.push(...report.previewVerification.warnings);

  }



  if (report.featureReality?.missingFeatures.length) {

    for (const feature of report.featureReality.missingFeatures) {

      warnings.push(`Missing feature: ${feature}`);

    }

  }



  if (report.error) {

    warnings.push(report.error);

  }



  return [...new Set(warnings)];

}



function deriveVerdict(report: BuildReport, skipPreview: boolean): RealAppTrialVerdict {

  if (!report.buildOk || report.buildLoop?.status === 'FAIL') {

    return 'FAIL';

  }



  if (report.featureReality?.status === 'FAIL') {

    return 'FAIL';

  }



  if (!skipPreview && report.previewVerification?.status === 'FAIL') {

    return 'FAIL';

  }



  if (!skipPreview && !report.previewVerification?.applicationRendered) {

    return 'FAIL';

  }



  if (

    report.featureReality?.status === 'WARN' ||

    report.buildLoop?.status === 'WARN' ||

    report.previewVerification?.status === 'WARN' ||

    skipPreview

  ) {

    return 'WARN';

  }



  return 'PASS';

}



function resultFromBuildReport(report: BuildReport, skipPreview: boolean): RealAppTrialResult {

  const applicationType = (

    report.buildPlan?.appName ??

    report.understanding?.suggestedAppName ??

    report.appType

  ).replace(/\.$/, '');



  return {

    prompt: report.prompt,

    applicationType,

    understandingSucceeded: report.understanding != null,

    architectureGenerationApplied: report.architectureGeneration?.applied === true,

    featureRealityStatus: report.featureReality?.status ?? 'FAIL',

    previewVerificationStatus: report.previewVerification?.status ?? (skipPreview ? 'WARN' : 'FAIL'),
    productQualityScore: report.productQuality?.qualityScore ?? 0,

    workspaceGenerated: report.buildLoop?.workspaceGenerated === true,

    installSucceeded: report.buildLoop?.installSucceeded === true,

    buildSucceeded: report.buildOk === true,

    previewVerified: report.previewVerification?.applicationRendered === true,

    buildLoopStatus: report.buildLoop?.status ?? 'FAIL',

    previewUrl: report.previewUrl,

    durationMs: report.durationMs,

    warnings: collectWarnings(report),

    verdict: deriveVerdict(report, skipPreview),

    featureReality: report.featureReality,

    buildLoop: report.buildLoop,

    previewVerification: report.previewVerification,

    productQuality: report.productQuality,

    totalEngineeringTimeMs: report.engineeringTimeline?.totalEngineeringTimeMs ?? 0,

    slowestStage: report.engineeringTimeline?.slowestStage ?? null,

    fastestStage: report.engineeringTimeline?.fastestStage ?? null,

    timelineHealth: report.engineeringTimeline?.timelineHealth ?? 'unknown',

  };

}



function aggregateSuite(results: RealAppTrialResult[], totalDurationMs: number): RealAppTrialSuiteReport {

  const passed = results.filter((r) => r.verdict === 'PASS').length;

  const warned = results.filter((r) => r.verdict === 'WARN').length;

  const failed = results.filter((r) => r.verdict === 'FAIL').length;

  const previewPassed = results.filter((r) => r.previewVerificationStatus === 'PASS').length;

  const previewWarned = results.filter((r) => r.previewVerificationStatus === 'WARN').length;

  const previewFailed = results.filter((r) => r.previewVerificationStatus === 'FAIL').length;

  const totalApps = results.length;

  const averageQualityScore =
    totalApps === 0
      ? 0
      : results.reduce((sum, r) => sum + r.productQualityScore, 0) / totalApps;

  const averageBuildTime =

    totalApps === 0 ? 0 : results.reduce((sum, r) => sum + r.durationMs, 0) / totalApps;

  const averageEngineeringTime =

    totalApps === 0 ? 0 : results.reduce((sum, r) => sum + r.totalEngineeringTimeMs, 0) / totalApps;

  const overallSuccessPercentage =

    totalApps === 0 ? 0 : ((passed + warned) / totalApps) * 100;



  return {

    totalApps,

    passed,

    warned,

    failed,

    previewPassed,

    previewWarned,

    previewFailed,

    averageQualityScore,

    averageBuildTime,

    averageEngineeringTime,

    totalDuration: totalDurationMs,

    overallSuccessPercentage,

    results,

  };

}



export async function runRealAppTrialHarness(

  input: RunRealAppTrialHarnessInput = {},

): Promise<RealAppTrialSuiteReport> {

  const prompts = input.prompts ?? REAL_APP_TRIAL_SUITE;

  const skipPreview = input.skipPreview ?? false;

  const startedMs = Date.now();

  const results: RealAppTrialResult[] = [];



  for (const prompt of prompts) {

    const report = await buildFromPrompt({

      prompt,

      engineRootDir: input.engineRootDir,

      skipPreview,

    });

    results.push(resultFromBuildReport(report, skipPreview));

  }



  return aggregateSuite(results, Date.now() - startedMs);

}



export function formatRealAppTrialSummary(suite: RealAppTrialSuiteReport): string {

  const lines: string[] = ['──────── Real App Trial Summary ────────', ''];



  for (const result of suite.results) {

    const label = result.applicationType.padEnd(18, ' ');

    lines.push(`${label} ${result.verdict} (Preview: ${result.previewVerificationStatus}, Quality: ${result.productQualityScore.toFixed(2)}, Engineering: ${(result.totalEngineeringTimeMs / 1000).toFixed(1)}s)`);

  }



  lines.push(

    '',

    'Summary:',

    `Total:                ${suite.totalApps}`,

    `Passed:               ${suite.passed}`,

    `Warned:               ${suite.warned}`,

    `Failed:               ${suite.failed}`,

    `Preview Passed:       ${suite.previewPassed}`,

    `Preview Warned:       ${suite.previewWarned}`,

    `Preview Failed:       ${suite.previewFailed}`,

    `Average Quality:      ${suite.averageQualityScore.toFixed(2)}`,

    `Average Build Time:   ${(suite.averageBuildTime / 1000).toFixed(1)}s`,

    `Average Engineering:  ${(suite.averageEngineeringTime / 1000).toFixed(1)}s`,

    `Overall Success Rate: ${suite.overallSuccessPercentage.toFixed(0)}%`,

  );



  return lines.join('\n');

}



export function attachTrialResultsToReport(

  report: BuildReport,

  suite: RealAppTrialSuiteReport,

): BuildReport {

  return {

    ...report,

    realAppTrialResults: suite.results,

  };

}

