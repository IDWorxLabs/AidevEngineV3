import type { AppType, BuildReport } from '../src/types.js';

export interface AssertUnderstandingOptions {
  expectSupported?: boolean;
  expectMatchedAppType?: AppType | null;
  minConfidence?: number;
  maxConfidence?: number;
}

export function assertUnderstanding(
  report: BuildReport,
  reportText: string,
  options: AssertUnderstandingOptions,
  pass: (label: string) => void,
  fail: (label: string, detail?: string) => void,
): void {
  const understanding = report.understanding;

  if (understanding) pass('understanding in report object');
  else {
    fail('understanding in report object');
    return;
  }

  if (reportText.includes('── Understanding ──')) pass('Understanding section in report text');
  else fail('Understanding section in report text');

  if (report.buildPlan) {
    const understandingIndex = reportText.indexOf('── Understanding ──');
    const buildPlanIndex = reportText.indexOf('── Build Plan ──');
    const draftPlanIndex = reportText.indexOf('── Draft Build Plan ──');
    const planIndex = buildPlanIndex >= 0 ? buildPlanIndex : draftPlanIndex;

    if (understandingIndex >= 0 && planIndex >= 0 && understandingIndex < planIndex) {
      pass('Understanding appears before plan section');
    } else {
      fail('Understanding appears before plan section');
    }
  }

  if (understanding.originalPrompt === report.prompt) pass('understanding originalPrompt matches prompt');
  else fail('understanding originalPrompt matches prompt', understanding.originalPrompt);

  if (understanding.detectedIntent) pass('understanding detectedIntent populated');
  else fail('understanding detectedIntent populated');

  if (understanding.suggestedAppName) pass('understanding suggestedAppName populated');
  else fail('understanding suggestedAppName populated');

  if (understanding.detectedFeatures.length > 0) pass('understanding detectedFeatures populated');
  else fail('understanding detectedFeatures populated');

  if (understanding.detectedEntities.length > 0) pass('understanding detectedEntities populated');
  else fail('understanding detectedEntities populated');

  if (typeof understanding.confidence === 'number' && understanding.confidence > 0) {
    pass(`understanding confidence populated (${understanding.confidence.toFixed(2)})`);
  } else {
    fail('understanding confidence populated');
  }

  if (understanding.reasoning) pass('understanding reasoning populated');
  else fail('understanding reasoning populated');

  if (options.expectSupported !== undefined) {
    if (understanding.supported === options.expectSupported) {
      pass(`understanding supported=${options.expectSupported}`);
    } else {
      fail(`understanding supported=${options.expectSupported}`, String(understanding.supported));
    }
  }

  if (options.expectMatchedAppType !== undefined) {
    if (understanding.matchedAppType === options.expectMatchedAppType) {
      pass(`understanding matchedAppType=${options.expectMatchedAppType ?? 'null'}`);
    } else {
      fail(
        `understanding matchedAppType=${options.expectMatchedAppType ?? 'null'}`,
        String(understanding.matchedAppType),
      );
    }
  }

  if (options.minConfidence !== undefined) {
    if (understanding.confidence > options.minConfidence) {
      pass(`understanding confidence > ${options.minConfidence}`);
    } else {
      fail(`understanding confidence > ${options.minConfidence}`, understanding.confidence.toFixed(2));
    }
  }

  if (options.maxConfidence !== undefined) {
    if (understanding.confidence < options.maxConfidence) {
      pass(`understanding confidence < ${options.maxConfidence}`);
    } else {
      fail(`understanding confidence < ${options.maxConfidence}`, understanding.confidence.toFixed(2));
    }
  }

  if (reportText.includes(understanding.detectedIntent)) {
    pass('report text includes detected intent');
  } else {
    fail('report text includes detected intent');
  }
}
