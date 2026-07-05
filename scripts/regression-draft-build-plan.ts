import type { BuildReport } from '../src/types.js';

export function assertDraftBuildPlan(
  report: BuildReport,
  reportText: string,
  pass: (label: string) => void,
  fail: (label: string, detail?: string) => void,
): void {
  if (report.buildPlan) pass('draft build plan in report object');
  else {
    fail('draft build plan in report object');
    return;
  }

  if (reportText.includes('── Draft Build Plan ──')) pass('Draft Build Plan section in report text');
  else fail('Draft Build Plan section in report text');

  const hasRegularPlanSection = reportText.split('\n').some((line) => line === '── Build Plan ──');
  if (!hasRegularPlanSection) pass('report does not use final Build Plan heading');
  else fail('report does not use final Build Plan heading');

  const understandingIndex = reportText.indexOf('── Understanding ──');
  const draftPlanIndex = reportText.indexOf('── Draft Build Plan ──');
  if (understandingIndex >= 0 && draftPlanIndex >= 0 && understandingIndex < draftPlanIndex) {
    pass('Understanding appears before Draft Build Plan');
  } else {
    fail('Understanding appears before Draft Build Plan');
  }

  const errorIndex = reportText.indexOf('── Error ──');
  if (errorIndex >= 0) {
    if (draftPlanIndex >= 0 && draftPlanIndex < errorIndex) {
      pass('Draft Build Plan appears before Error section');
    } else {
      fail('Draft Build Plan appears before Error section');
    }
  } else if (draftPlanIndex >= 0) {
    pass('Draft Build Plan present without Error section');
  } else {
    fail('Draft Build Plan present without Error section');
  }

  if (report.buildPlan.originalPrompt === report.prompt) pass('draft plan originalPrompt matches prompt');
  else fail('draft plan originalPrompt matches prompt');

  if (report.buildPlan.appType === 'unknown') pass('draft plan appType is unknown');
  else fail('draft plan appType is unknown', report.buildPlan.appType);

  if (report.buildPlan.appName === report.understanding?.suggestedAppName) {
    pass('draft plan appName matches understanding');
  } else {
    fail('draft plan appName matches understanding', report.buildPlan.appName);
  }

  if (report.buildPlan.features.length > 0) pass(`draft plan features (${report.buildPlan.features.length})`);
  else fail('draft plan features');

  if (report.buildPlan.pages.length > 0) pass(`draft plan pages (${report.buildPlan.pages.length})`);
  else fail('draft plan pages');

  if (report.buildPlan.components.length > 0) pass(`draft plan components (${report.buildPlan.components.length})`);
  else fail('draft plan components');

  if (report.buildPlan.projectStructure.length > 0) {
    pass(`draft plan projectStructure (${report.buildPlan.projectStructure.length})`);
  } else {
    fail('draft plan projectStructure');
  }

  if (report.buildPlan.stack.length > 0) pass(`draft plan stack (${report.buildPlan.stack.join(', ')})`);
  else fail('draft plan stack');
}
