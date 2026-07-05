/**
 * Repair path regression — broken calculator prompt triggers one repair cycle.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { BROKEN_CALCULATOR_PROMPT } from '../src/repair/fault-injection.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { GOLDEN_PATH_PROMPT } from './golden-path-regression.js';
import { COUNTER_PATH_PROMPT } from './counter-path-regression.js';
import { TODO_PATH_PROMPT } from './todo-path-regression.js';
import { assertUnderstanding } from './regression-understanding.js';
import { assertGenerationMode } from './regression-generation-mode.js';

export const REPAIR_PATH_PROMPT = BROKEN_CALCULATOR_PROMPT;

const failures: string[] = [];

function pass(label: string): void {
  console.log(`  ✓ ${label}`);
}

function fail(label: string, detail?: string): void {
  const msg = detail ? `${label}: ${detail}` : label;
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}

async function verifyPreview(url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

async function assertNoRepairForPrompt(prompt: string, label: string): Promise<void> {
  const report = await buildFromPrompt({ prompt, skipPreview: true });
  if (report.ok) pass(`${label}: build succeeds`);
  else fail(`${label}: build succeeds`, report.error ?? 'failed');

  if (!report.repairAttempted) pass(`${label}: repair not attempted`);
  else fail(`${label}: repair not attempted`);

  if (!report.repairSucceeded) pass(`${label}: repair not marked succeeded`);
  else fail(`${label}: repair not marked succeeded`);

  if (!report.initialBuildError) pass(`${label}: no initial build error`);
  else fail(`${label}: no initial build error`);
}

export async function runRepairPathRegression(): Promise<boolean> {
  failures.length = 0;
  console.log(`\nRepair path regression: "${REPAIR_PATH_PROMPT}"\n`);

  const report = await buildFromPrompt({ prompt: REPAIR_PATH_PROMPT });
  const reportText = formatBuildReport(report);

  console.log(reportText);
  console.log('\n── Broken Calculator Assertions ──\n');

  if (existsSync(report.projectDir)) pass('1. project folder created');
  else fail('1. project folder created', report.projectDir);

  if (report.appType === 'calculator') pass('2. detected as calculator');
  else fail('2. detected as calculator', report.appType);

  const appTsxPath = join(report.projectDir, 'src', 'App.tsx');
  if (existsSync(appTsxPath)) {
    const appSource = readFileSync(appTsxPath, 'utf8');
    if (!appSource.includes('__broken_fault_injection__')) {
      pass('3. broken import removed from App.tsx');
    } else {
      fail('3. broken import removed from App.tsx');
    }
  } else {
    fail('3. broken import removed from App.tsx', 'App.tsx missing');
  }

  if (report.initialBuildError) pass('4. initial build error captured');
  else fail('4. initial build error captured');

  if (report.initialBuildError) {
    if (
      report.initialBuildError.includes('__broken_fault_injection__') ||
      report.initialBuildError.includes('brokenFaultInjection')
    ) {
      pass('5. initial build error references broken import');
    } else {
      fail('5. initial build error references broken import', report.initialBuildError);
    }
  } else {
    fail('5. initial build error references broken import', 'missing');
  }

  if (report.repairAttempted) pass('6. repair attempted');
  else fail('6. repair attempted');

  if (report.repairSucceeded) pass('7. repair succeeded');
  else fail('7. repair succeeded', report.repairSummary ?? '');

  if (report.buildOk) pass('8. final build succeeded');
  else fail('8. final build succeeded');

  if (report.ok) pass('9. overall build succeeded');
  else fail('9. overall build succeeded', report.error ?? '');

  if (report.previewUrl) pass(`10. preview URL present (${report.previewUrl})`);
  else fail('10. preview URL present');

  if (report.previewUrl && (await verifyPreview(report.previewUrl))) {
    pass('11. preview URL reachable');
  } else {
    fail('11. preview URL reachable', report.previewUrl ?? 'missing');
  }

  if (reportText.includes('── Repair ──')) pass('12. report includes Repair section');
  else fail('12. report includes Repair section');

  if (reportText.includes('Attempted:  yes')) pass('13. report shows repair attempted');
  else fail('13. report shows repair attempted');

  if (reportText.includes('Succeeded:  yes')) pass('14. report shows repair succeeded');
  else fail('14. report shows repair succeeded');

  if (report.repairSummary && reportText.includes(report.repairSummary)) {
    pass('15. report includes repair summary');
  } else {
    fail('15. report includes repair summary');
  }

  if (report.initialBuildError && reportText.includes('Initial build error:')) {
    pass('16. report includes initial build error');
  } else {
    fail('16. report includes initial build error');
  }

  assertUnderstanding(
    report,
    reportText,
    { expectSupported: true, expectMatchedAppType: 'calculator', minConfidence: 0.95 },
    pass,
    fail,
  );

  assertGenerationMode(report, reportText, 'specialized-template', pass, fail);

  console.log('\n── Existing App Behavior ──\n');

  await assertNoRepairForPrompt(GOLDEN_PATH_PROMPT, 'calculator');
  await assertNoRepairForPrompt(COUNTER_PATH_PROMPT, 'counter');
  await assertNoRepairForPrompt(TODO_PATH_PROMPT, 'todo');

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
