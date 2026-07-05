/**
 * Architecture-guided generation regression — verifies generation follows ArchitecturePlan.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { GOLDEN_PATH_PROMPT } from './golden-path-regression.js';
import { COUNTER_PATH_PROMPT } from './counter-path-regression.js';
import { TODO_PATH_PROMPT } from './todo-path-regression.js';
import { GENERIC_PROTOTYPE_PROMPT } from './generic-prototype-path-regression.js';

const PASS_TOKEN = 'ARCHITECTURE_GUIDED_GENERATION_V1_PASS';

const APPROVED_HARDCODING_PREFIXES = [
  'src/architecture/',
  'src/planner/',
  'src/understanding/',
  'src/generation/',
  'src/generator/detect-app-type.ts',
  'src/generator/templates/',
  'scripts/',
];

const FORBIDDEN_PATTERNS = [
  'WeatherDisplay',
  'SearchBar',
  'ForecastCard',
  'CountDisplay',
  'ControlButtons',
  'TaskInput',
  'TaskList',
  'TaskItem',
  'Display.tsx',
  'Keypad.tsx',
];

const failures: string[] = [];

function pass(label: string): void {
  console.log(`  ✓ ${label}`);
}

function fail(label: string, detail?: string): void {
  const msg = detail ? `${label}: ${detail}` : label;
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}

function fileExists(projectDir: string, relativePath: string): boolean {
  return existsSync(join(projectDir, relativePath));
}

function assertComponentFiles(
  projectDir: string,
  components: string[],
  label: string,
): void {
  for (const name of components) {
    const path = `src/components/${name}.tsx`;
    if (fileExists(projectDir, path)) pass(`${label}: ${path}`);
    else fail(`${label}: ${path}`, 'missing');
  }
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
        fail('no app-specific hardcoding outside approved areas', `${pattern} in ${filePath}`);
      }
    }
  }

  if (!failures.some((f) => f.startsWith('no app-specific hardcoding'))) {
    pass('no app-specific hardcoding outside approved areas');
  }
}

function assertArchitectureGenerationReport(
  report: Awaited<ReturnType<typeof buildFromPrompt>>,
  reportText: string,
  label: string,
): void {
  if (report.architecturePlan) pass(`${label}: report includes architecturePlan`);
  else fail(`${label}: report includes architecturePlan`);

  if (report.architectureGeneration) pass(`${label}: report includes architectureGeneration`);
  else fail(`${label}: report includes architectureGeneration`);

  if (report.architectureGeneration?.applied) {
    pass(`${label}: architectureGeneration.applied is true`);
  } else {
    fail(`${label}: architectureGeneration.applied is true`);
  }

  if (reportText.includes('── Architecture-Guided Generation ──')) {
    pass(`${label}: report text includes Architecture-Guided Generation section`);
  } else {
    fail(`${label}: report text includes Architecture-Guided Generation section`);
  }
}

function assertWebUiContainsPanel(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');

  if (indexHtml.includes('Architecture-Guided Generation')) {
    pass('web UI: index.html contains Architecture-Guided Generation panel');
  } else {
    fail('web UI: index.html contains Architecture-Guided Generation panel');
  }

  if (appJs.includes('renderArchitectureGeneration')) {
    pass('web UI: app.js renders architecture generation');
  } else {
    fail('web UI: app.js renders architecture generation');
  }
}

export async function runArchitectureGuidedGenerationRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nArchitecture-guided generation regression\n');

  console.log('── Supported apps ──\n');

  const calculatorReport = await buildFromPrompt({ prompt: GOLDEN_PATH_PROMPT, skipPreview: true });
  const calculatorText = formatBuildReport(calculatorReport);
  assertComponentFiles(calculatorReport.projectDir, ['Display', 'Keypad', 'Button'], 'calculator');
  assertArchitectureGenerationReport(calculatorReport, calculatorText, 'calculator');

  const counterReport = await buildFromPrompt({ prompt: COUNTER_PATH_PROMPT, skipPreview: true });
  const counterText = formatBuildReport(counterReport);
  assertComponentFiles(counterReport.projectDir, ['CountDisplay', 'ControlButtons'], 'counter');
  assertArchitectureGenerationReport(counterReport, counterText, 'counter');

  const todoReport = await buildFromPrompt({ prompt: TODO_PATH_PROMPT, skipPreview: true });
  const todoText = formatBuildReport(todoReport);
  assertComponentFiles(todoReport.projectDir, ['TaskInput', 'TaskList', 'TaskItem'], 'todo');
  assertArchitectureGenerationReport(todoReport, todoText, 'todo');

  console.log('\n── Generic weather prototype ──\n');

  const weatherReport = await buildFromPrompt({ prompt: GENERIC_PROTOTYPE_PROMPT, skipPreview: true });
  const weatherText = formatBuildReport(weatherReport);

  assertComponentFiles(weatherReport.projectDir, ['WeatherDisplay', 'SearchBar', 'ForecastCard'], 'weather');

  if (fileExists(weatherReport.projectDir, 'src/pages/Home.tsx')) {
    pass('weather: src/pages/Home.tsx');
  } else {
    fail('weather: src/pages/Home.tsx', 'missing');
  }

  if (fileExists(weatherReport.projectDir, 'src/services/WeatherService.ts')) {
    pass('weather: src/services/WeatherService.ts');
  } else {
    fail('weather: src/services/WeatherService.ts', 'missing');
  }

  const weatherService = readFileSync(
    join(weatherReport.projectDir, 'src/services/WeatherService.ts'),
    'utf8',
  );
  if (weatherService.includes('Placeholder WeatherService')) {
    pass('weather: WeatherService references Placeholder WeatherService');
  } else {
    fail('weather: WeatherService references Placeholder WeatherService');
  }

  assertArchitectureGenerationReport(weatherReport, weatherText, 'weather');

  console.log('\n── Static checks ──\n');

  assertWebUiContainsPanel();
  assertNoForbiddenHardcoding();

  console.log('');
  if (failures.length === 0) {
    console.log(`PASSED\n${PASS_TOKEN}\n`);
    return true;
  }

  console.log(`FAILED (${failures.length} check(s)):\n`);
  for (const f of failures) console.log(`  • ${f}`);
  console.log('');
  return false;
}
