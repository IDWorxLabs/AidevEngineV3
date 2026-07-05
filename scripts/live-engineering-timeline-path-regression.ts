/**
 * Live Engineering Timeline regression — verifies passive pipeline observation.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import {
  ENGINEERING_TIMELINE_STAGES,
} from '../src/runtime/live-engineering-timeline.js';
import {
  REAL_APP_TRIAL_SUITE,
  runRealAppTrialHarness,
} from '../src/testing/real-app-trial-harness.js';
import { GOLDEN_PATH_PROMPT } from './golden-path-regression.js';

const PASS_TOKEN = 'LIVE_ENGINEERING_TIMELINE_V1_PASS';

const APPROVED_HARDCODING_PREFIXES = [
  'src/architecture/',
  'src/planner/',
  'src/understanding/',
  'src/generation/',
  'src/generator/detect-app-type.ts',
  'src/generator/templates/',
  'src/feature-reality/',
  'src/build-loop/',
  'src/runtime/',
  'src/testing/',
  'scripts/',
];

const FORBIDDEN_PATTERNS = ['LISA', 'WeatherDisplay', 'CountDisplay', 'TaskInput'];

const EXPECTED_STAGE_ORDER = ENGINEERING_TIMELINE_STAGES.map((s) => s.id);

const failures: string[] = [];

function pass(label: string): void {
  console.log(`  ✓ ${label}`);
}

function fail(label: string, detail?: string): void {
  const msg = detail ? `${label}: ${detail}` : label;
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}

function collectSourceFiles(dir: string, root: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.generated') continue;
      files.push(...collectSourceFiles(fullPath, root));
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      files.push(relative(root, fullPath).replace(/\\/g, '/'));
    }
  }

  return files;
}

function isApprovedHardcodingPath(filePath: string): boolean {
  return APPROVED_HARDCODING_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

function assertNoForbiddenHardcoding(): void {
  const srcRoot = join(process.cwd(), 'src');
  const sourceFiles = collectSourceFiles(srcRoot, srcRoot).map((file) => `src/${file}`);

  for (const filePath of sourceFiles) {
    if (isApprovedHardcodingPath(filePath)) continue;

    const content = readFileSync(join(process.cwd(), filePath), 'utf8');
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (content.includes(pattern)) {
        fail('no application-specific hardcoding', `${pattern} in ${filePath}`);
      }
    }
  }

  if (!failures.some((f) => f.startsWith('no application-specific'))) {
    pass('no application-specific hardcoding');
  }
}

function assertWebUiTimeline(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');

  if (indexHtml.includes('Build Timeline')) pass('web UI: Build Timeline panel exists');
  else fail('web UI: Build Timeline panel exists');

  if (indexHtml.includes('build-summary')) pass('web UI: Build Summary card exists');
  else fail('web UI: Build Summary card exists');

  if (appJs.includes('renderEngineeringTimeline')) pass('web UI: renderEngineeringTimeline implemented');
  else fail('web UI: renderEngineeringTimeline implemented');

  if (appJs.includes('renderBuildSummary')) pass('web UI: renderBuildSummary implemented');
  else fail('web UI: renderBuildSummary implemented');

  if (indexHtml.includes('Build Report')) pass('web UI: existing Build Report preserved');
  else fail('web UI: existing Build Report preserved');
}

function assertTimelineModel(): void {
  const modulePath = join(process.cwd(), 'src', 'runtime', 'live-engineering-timeline.ts');
  if (existsSync(modulePath)) pass('timeline model exists');
  else fail('timeline model exists');

  const content = readFileSync(modulePath, 'utf8');
  if (content.includes('EngineeringTimelineEvent')) pass('EngineeringTimelineEvent defined');
  else fail('EngineeringTimelineEvent defined');

  if (content.includes('LiveEngineeringTimelineTracker')) pass('LiveEngineeringTimelineTracker defined');
  else fail('LiveEngineeringTimelineTracker defined');
}

function assertStageOrdering(timeline: NonNullable<Awaited<ReturnType<typeof buildFromPrompt>>['engineeringTimeline']>): void {
  const eventIds = timeline.events.map((e) => e.id);
  if (eventIds.join(',') === EXPECTED_STAGE_ORDER.join(',')) {
    pass('correct stage ordering');
  } else {
    fail('correct stage ordering', `expected ${EXPECTED_STAGE_ORDER.join(' → ')}`);
  }
}

function assertTimelineReport(
  report: Awaited<ReturnType<typeof buildFromPrompt>>,
  reportText: string,
  label: string,
): void {
  const timeline = report.engineeringTimeline;
  if (!timeline) {
    fail(`${label}: engineeringTimeline in report`);
    return;
  }

  pass(`${label}: engineeringTimeline in report`);

  if (reportText.includes('── Engineering Timeline ──')) {
    pass(`${label}: Engineering Timeline section in report text`);
  } else {
    fail(`${label}: Engineering Timeline section in report text`);
  }

  const completed = timeline.events.filter(
    (e) => e.status === 'Success' || e.status === 'Warning' || e.status === 'Failed',
  );
  if (completed.length >= 8) {
    pass(`${label}: timeline events emitted (${completed.length} completed)`);
  } else {
    fail(`${label}: timeline events emitted`, `only ${completed.length} completed stages`);
  }

  const withDuration = timeline.events.filter((e) => e.durationMs != null && e.durationMs >= 0);
  if (withDuration.length >= 5) {
    pass(`${label}: stage durations recorded (${withDuration.length})`);
  } else {
    fail(`${label}: stage durations recorded`, `${withDuration.length} stages`);
  }

  if (timeline.currentStage) pass(`${label}: current stage recorded (${timeline.currentStage})`);
  else fail(`${label}: current stage recorded`);

  if (timeline.totalEngineeringTimeMs > 0) {
    pass(`${label}: total engineering time recorded (${(timeline.totalEngineeringTimeMs / 1000).toFixed(1)}s)`);
  } else {
    fail(`${label}: total engineering time recorded`);
  }

  const successStages = timeline.events.filter((e) => e.status === 'Success');
  if (successStages.length >= 5) pass(`${label}: success states displayed (${successStages.length})`);
  else fail(`${label}: success states displayed`);

  const completeEvent = timeline.events.find((e) => e.id === 'build-complete');
  if (completeEvent && (completeEvent.status === 'Success' || completeEvent.status === 'Failed')) {
    pass(`${label}: build completion summary shown`);
  } else {
    fail(`${label}: build completion summary shown`);
  }

  if (timeline.slowestStage && timeline.fastestStage) {
    pass(`${label}: slowest/fastest stages recorded`);
  } else {
    fail(`${label}: slowest/fastest stages recorded`);
  }

  assertStageOrdering(timeline);
}

export async function runLiveEngineeringTimelineRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nLive Engineering Timeline regression\n');

  console.log('── Static checks ──\n');
  assertTimelineModel();
  assertWebUiTimeline();
  assertNoForbiddenHardcoding();

  console.log('\n── Live callback observation ──\n');

  let liveUpdates = 0;
  let sawRunning = false;

  const liveReport = await buildFromPrompt({
    prompt: GOLDEN_PATH_PROMPT,
    skipPreview: true,
    onTimelineEvent: (timeline) => {
      liveUpdates += 1;
      if (timeline.currentStatus === 'Running') sawRunning = true;
    },
  });

  if (liveUpdates >= 5) pass(`timeline live updates emitted (${liveUpdates})`);
  else fail('timeline live updates emitted', `${liveUpdates} updates`);

  if (sawRunning) pass('running state displayed during build');
  else fail('running state displayed during build');

  const liveText = formatBuildReport(liveReport);
  assertTimelineReport(liveReport, liveText, 'calculator (skipPreview)');

  console.log('\n── Full build with preview ──\n');

  const fullReport = await buildFromPrompt({ prompt: GOLDEN_PATH_PROMPT });
  const fullText = formatBuildReport(fullReport);
  assertTimelineReport(fullReport, fullText, 'calculator (full)');

  console.log('\n── Trial harness timeline evidence ──\n');

  const suite = await runRealAppTrialHarness({
    skipPreview: true,
    prompts: REAL_APP_TRIAL_SUITE.slice(0, 3),
  });

  for (const result of suite.results) {
    if (result.totalEngineeringTimeMs > 0) {
      pass(`${result.applicationType}: engineering time recorded (${(result.totalEngineeringTimeMs / 1000).toFixed(1)}s)`);
    } else {
      fail(`${result.applicationType}: engineering time recorded`);
    }

    if (result.slowestStage) pass(`${result.applicationType}: slowest stage recorded (${result.slowestStage})`);
    else fail(`${result.applicationType}: slowest stage recorded`);
  }

  if (suite.averageEngineeringTime > 0) {
    pass(`trial average engineering time (${(suite.averageEngineeringTime / 1000).toFixed(1)}s)`);
  } else {
    fail('trial average engineering time');
  }

  console.log('');
  if (failures.length === 0) {
    console.log('PASSED');
    console.log(PASS_TOKEN);
    return true;
  }

  console.log('FAILED');
  for (const f of failures) console.log(`  - ${f}`);
  return false;
}
