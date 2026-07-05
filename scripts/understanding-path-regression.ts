/**
 * Understanding regression — supported and unsupported prompt analysis.
 */

import { analyzePrompt } from '../src/understanding/analyze-prompt.js';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { GOLDEN_PATH_PROMPT } from './golden-path-regression.js';
import { COUNTER_PATH_PROMPT } from './counter-path-regression.js';
import { TODO_PATH_PROMPT } from './todo-path-regression.js';
import { UNSUPPORTED_PROMPT } from './unsupported-path-regression.js';
import { assertUnderstanding } from './regression-understanding.js';
import { assertDraftBuildPlan } from './regression-draft-build-plan.js';
import { assertGenerationMode } from './regression-generation-mode.js';

const failures: string[] = [];

function pass(label: string): void {
  console.log(`  ✓ ${label}`);
}

function fail(label: string, detail?: string): void {
  const msg = detail ? `${label}: ${detail}` : label;
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}

function assertWeatherUnderstanding(): void {
  const understanding = analyzePrompt(UNSUPPORTED_PROMPT);

  if (understanding.detectedIntent === 'Build a weather application') {
    pass('weather: detectedIntent');
  } else {
    fail('weather: detectedIntent', understanding.detectedIntent);
  }

  if (understanding.suggestedAppName === 'Weather') pass('weather: suggestedAppName');
  else fail('weather: suggestedAppName', understanding.suggestedAppName);

  for (const feature of ['Weather display', 'Search city', 'Current conditions']) {
    if (understanding.detectedFeatures.includes(feature)) pass(`weather: feature "${feature}"`);
    else fail(`weather: feature "${feature}"`);
  }

  if (!understanding.supported) pass('weather: supported=false');
  else fail('weather: supported=false');

  if (understanding.matchedAppType === null) pass('weather: matchedAppType null');
  else fail('weather: matchedAppType null', String(understanding.matchedAppType));

  if (understanding.confidence === 0.82) pass('weather: confidence 0.82');
  else fail('weather: confidence 0.82', understanding.confidence.toFixed(2));

  if (understanding.reasoning) pass('weather: reasoning populated');
  else fail('weather: reasoning populated');
}

export async function runUnderstandingRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nUnderstanding regression\n');

  console.log('── Direct analysis ──\n');
  assertWeatherUnderstanding();

  const supportedCases: Array<{ prompt: string; appType: 'calculator' | 'counter' | 'todo' }> = [
    { prompt: GOLDEN_PATH_PROMPT, appType: 'calculator' },
    { prompt: COUNTER_PATH_PROMPT, appType: 'counter' },
    { prompt: TODO_PATH_PROMPT, appType: 'todo' },
  ];

  console.log('\n── Supported prompts ──\n');
  for (const { prompt, appType } of supportedCases) {
    const understanding = analyzePrompt(prompt);
    if (understanding.supported) pass(`${appType}: supported=true`);
    else fail(`${appType}: supported=true`);

    if (understanding.confidence > 0.95) pass(`${appType}: confidence > 0.95`);
    else fail(`${appType}: confidence > 0.95`, understanding.confidence.toFixed(2));

    if (understanding.matchedAppType === appType) pass(`${appType}: matchedAppType populated`);
    else fail(`${appType}: matchedAppType populated`, String(understanding.matchedAppType));
  }

  console.log('\n── Build pipeline integration ──\n');

  const supportedReport = await buildFromPrompt({ prompt: GOLDEN_PATH_PROMPT, skipPreview: true });
  const supportedText = formatBuildReport(supportedReport);
  assertUnderstanding(
    supportedReport,
    supportedText,
    { expectSupported: true, expectMatchedAppType: 'calculator', minConfidence: 0.95 },
    pass,
    fail,
  );

  const unsupportedReport = await buildFromPrompt({ prompt: UNSUPPORTED_PROMPT });
  const unsupportedText = formatBuildReport(unsupportedReport);
  assertUnderstanding(
    unsupportedReport,
    unsupportedText,
    { expectSupported: false, expectMatchedAppType: null },
    pass,
    fail,
  );

  if (unsupportedReport.understanding?.detectedIntent === 'Build a weather application') {
    pass('unsupported build: meaningful detectedIntent');
  } else {
    fail('unsupported build: meaningful detectedIntent', unsupportedReport.understanding?.detectedIntent);
  }

  assertDraftBuildPlan(unsupportedReport, unsupportedText, pass, fail);

  if (unsupportedReport.buildPlan?.appName === 'Weather') {
    pass('unsupported build: draft plan appName Weather');
  } else {
    fail('unsupported build: draft plan appName Weather', unsupportedReport.buildPlan?.appName);
  }

  for (const feature of ['Weather display', 'Search city', 'Current conditions']) {
    if (unsupportedReport.buildPlan?.features.includes(feature)) {
      pass(`unsupported build: draft feature "${feature}"`);
    } else {
      fail(`unsupported build: draft feature "${feature}"`);
    }
  }

  if (unsupportedReport.ok) pass('unsupported build: succeeds with generic prototype');
  else fail('unsupported build: succeeds with generic prototype', unsupportedReport.error ?? 'failed');

  assertGenerationMode(unsupportedReport, unsupportedText, 'generic-prototype', pass, fail);

  console.log('');
  if (failures.length === 0) {
    console.log('PASSED\n');
    return true;
  }

  console.log(`FAILED (${failures.length} check(s)):\n`);
  for (const f of failures) console.log(`  • ${f}`);
  console.log('');
  return false;
}
