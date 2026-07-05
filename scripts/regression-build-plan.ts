import type { AppType, BuildReport } from '../src/types.js';

export function assertBuildPlan(
  report: BuildReport,
  reportText: string,
  expectedAppType: AppType,
  pass: (label: string) => void,
  fail: (label: string, detail?: string) => void,
): void {
  if (report.buildPlan) pass('build plan in report object');
  else fail('build plan in report object');

  if (reportText.includes('── Build Plan ──')) pass('Build Plan section in report text');
  else fail('Build Plan section in report text');

  if (report.buildPlan?.originalPrompt === report.prompt) pass('plan originalPrompt matches prompt');
  else fail('plan originalPrompt matches prompt');

  if (report.buildPlan?.appType === expectedAppType) pass('plan appType matches');
  else fail('plan appType matches', report.buildPlan?.appType ?? 'missing');

  if (report.buildPlan?.appName) pass(`plan appName (${report.buildPlan.appName})`);
  else fail('plan appName');

  if (report.buildPlan?.features.length) pass(`plan features (${report.buildPlan.features.length})`);
  else fail('plan features');

  if (report.buildPlan?.pages.length) pass(`plan pages (${report.buildPlan.pages.length})`);
  else fail('plan pages');

  if (report.buildPlan?.components.length) pass(`plan components (${report.buildPlan.components.length})`);
  else fail('plan components');

  if (report.buildPlan?.projectStructure.length) {
    pass(`plan projectStructure (${report.buildPlan.projectStructure.length})`);
  } else {
    fail('plan projectStructure');
  }

  if (report.buildPlan?.stack.length) pass(`plan stack (${report.buildPlan.stack.join(', ')})`);
  else fail('plan stack');
}
