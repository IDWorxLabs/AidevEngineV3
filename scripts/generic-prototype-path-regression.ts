/**
 * Generic prototype regression — unsupported prompt builds a working scaffold.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { UNSUPPORTED_PROMPT } from './unsupported-path-regression.js';
import { assertUnderstanding } from './regression-understanding.js';
import { assertDraftBuildPlan } from './regression-draft-build-plan.js';
import { assertGenerationMode } from './regression-generation-mode.js';
import { assertArchitecture } from './regression-architecture.js';

export const GENERIC_PROTOTYPE_PROMPT = UNSUPPORTED_PROMPT;

const REQUIRED_ROOT_FILES = ['package.json', 'index.html', 'vite.config.ts', 'tsconfig.json'] as const;
const REQUIRED_SRC_FILES = ['src/main.tsx', 'src/App.tsx', 'src/index.css'] as const;

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

export async function runGenericPrototypeRegression(): Promise<boolean> {
  failures.length = 0;
  console.log(`\nGeneric prototype regression: "${GENERIC_PROTOTYPE_PROMPT}"\n`);

  const report = await buildFromPrompt({ prompt: GENERIC_PROTOTYPE_PROMPT });
  const reportText = formatBuildReport(report);

  console.log(reportText);
  console.log('\n── Assertions ──\n');

  if (report.ok) pass('1. build succeeds');
  else fail('1. build succeeds', report.error ?? 'failed');

  if (report.appType === 'unknown') pass('2. app type unknown');
  else fail('2. app type unknown', report.appType);

  assertUnderstanding(
    report,
    reportText,
    { expectSupported: false, expectMatchedAppType: null },
    pass,
    fail,
  );

  assertDraftBuildPlan(report, reportText, pass, fail);

  assertGenerationMode(report, reportText, 'generic-prototype', pass, fail);

  assertArchitecture(
    report,
    reportText,
    {
      expectProjectType: 'Weather information application',
      expectFolders: ['components/', 'pages/', 'services/', 'types/'],
      expectComponents: ['WeatherDisplay', 'SearchBar', 'ForecastCard'],
      expectPages: ['Home'],
      expectDataLayer: 'Placeholder WeatherService',
    },
    pass,
    fail,
  );

  if (existsSync(report.projectDir)) pass('3. project folder created');
  else fail('3. project folder created', report.projectDir);

  for (const file of [...REQUIRED_ROOT_FILES, ...REQUIRED_SRC_FILES]) {
    const path = join(report.projectDir, file);
    if (existsSync(path)) pass(`4. contains ${file}`);
    else fail(`4. contains ${file}`, 'missing on disk');
  }

  const appSource = readFileSync(join(report.projectDir, 'src/App.tsx'), 'utf8');
  if (appSource.includes('Prototype generated from application understanding.')) {
    pass('5. App.tsx includes prototype banner');
  } else {
    fail('5. App.tsx includes prototype banner');
  }

  if (appSource.includes('<h1>{APP_NAME}</h1>') || appSource.includes('Weather')) {
    pass('6. App.tsx renders planned app name');
  } else {
    fail('6. App.tsx renders planned app name');
  }

  if (appSource.includes('DESCRIPTION') && appSource.includes('Build a weather application')) {
    pass('7. App.tsx includes detected intent description');
  } else {
    fail('7. App.tsx includes detected intent description');
  }

  if (report.installOk) pass('8. npm install succeeded');
  else fail('8. npm install succeeded');

  if (report.buildOk) pass('9. npm run build succeeded');
  else fail('9. npm run build succeeded');

  if (report.previewUrl) pass(`10. preview URL present (${report.previewUrl})`);
  else fail('10. preview URL present');

  if (report.previewUrl && (await verifyPreview(report.previewUrl))) {
    pass('11. preview URL reachable');
  } else {
    fail('11. preview URL reachable', report.previewUrl ?? 'missing');
  }

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
