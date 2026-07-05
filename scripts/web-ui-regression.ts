/**
 * Web UI regression — browser test of minimal builder interface.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { UNSUPPORTED_PROMPT } from './unsupported-path-regression.js';

export const WEB_UI_PROMPT = 'Build a calculator app';
const WEB_UI_PORT = 39248;
const BASE_URL = `http://127.0.0.1:${WEB_UI_PORT}`;

const failures: string[] = [];

function pass(label: string): void {
  console.log(`  ✓ ${label}`);
}

function fail(label: string, detail?: string): void {
  const msg = detail ? `${label}: ${detail}` : label;
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function startBuilderServer(): ChildProcess {
  const tsxBin = join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
  return spawn(process.execPath, [tsxBin, 'server/builder-server.ts'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(WEB_UI_PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
}

async function waitForServerReady(child: ChildProcess, timeoutMs = 15_000): Promise<void> {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(`Builder server exited before ready (code ${child.exitCode})`);
    }

    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return;
    } catch {
      // server not ready yet
    }

    await sleep(250);
  }

  throw new Error(`Builder server not ready after ${timeoutMs}ms`);
}

async function stopServer(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) return;

  child.kill('SIGTERM');
  await sleep(500);

  if (child.exitCode === null) {
    child.kill('SIGKILL');
  }
}

async function parseBuildApiResponse(response: { headers: () => Record<string, string>; text: () => Promise<string>; json: () => Promise<unknown> }): Promise<{
  ok?: boolean;
  report?: {
    ok?: boolean;
    stage?: string;
    generationMode?: string;
    understanding?: { detectedIntent?: string; supported?: boolean };
    engineeringTimeline?: { events?: unknown[] };
  };
}> {
  const contentType = response.headers()['content-type'] ?? '';
  if (contentType.includes('text/event-stream')) {
    const text = await response.text();
    for (const chunk of text.split('\n\n')) {
      if (!chunk.includes('event: complete')) continue;
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          return JSON.parse(line.slice(6)) as {
            ok?: boolean;
            report?: {
              ok?: boolean;
              stage?: string;
              generationMode?: string;
              understanding?: { detectedIntent?: string; supported?: boolean };
              engineeringTimeline?: { events?: unknown[] };
            };
          };
        }
      }
    }
    throw new Error('SSE stream missing complete event');
  }

  return (await response.json()) as {
    ok?: boolean;
    report?: {
      ok?: boolean;
      stage?: string;
      generationMode?: string;
      understanding?: { detectedIntent?: string; supported?: boolean };
      engineeringTimeline?: { events?: unknown[] };
    };
  };
}

export async function runWebUiRegression(): Promise<boolean> {
  failures.length = 0;
  console.log(`\nWeb UI regression: ${BASE_URL}\n`);

  const server = startBuilderServer();
  let browser = null;

  try {
    console.log('Starting builder server...\n');
    await waitForServerReady(server);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    pass('1. web page loads');

    const prompt = page.locator('#prompt');
    const buildBtn = page.locator('#build-btn');

    if (await prompt.isVisible()) pass('2. prompt textbox exists');
    else fail('2. prompt textbox exists');

    if (await page.locator('#prompt-panel').isVisible()) pass('2b. prompt panel exists');
    else fail('2b. prompt panel exists');

    if (await page.getByText('What would you like to build?').isVisible()) pass('2c. prompt heading rendered');
    else fail('2c. prompt heading rendered');

    const chipCount = await page.locator('.prompt-chip').count();
    if (chipCount >= 8) pass(`2d. example prompt chips rendered (${chipCount})`);
    else fail('2d. example prompt chips rendered');

    if (await buildBtn.isVisible()) pass('3. build button exists');
    else fail('3. build button exists');

    await prompt.fill(WEB_UI_PROMPT);

    const buildRequest = page.waitForResponse(
      (res) => res.url().includes('/build') && res.request().method() === 'POST',
      { timeout: 180_000 },
    );

    await buildBtn.click();
    pass('4. clicking Build sends request to /build');

    const response = await buildRequest;
    if (response.ok()) pass('4b. /build response OK');
    else fail('4b. /build response OK', `status ${response.status()}`);

    await page.locator('#build-summary').waitFor({ state: 'visible', timeout: 180_000 });

    if (await page.locator('#engineering-timeline').isVisible()) {
      pass('4c. engineering timeline visible during build');
    } else {
      fail('4c. engineering timeline visible during build');
    }

    if (await page.locator('#build-summary').isVisible()) {
      pass('4d. build summary card visible');
    } else {
      fail('4d. build summary card visible');
    }

    if (await page.locator('#preview-cta').isVisible()) pass('4e. preview action visible');
    else fail('4e. preview action visible');

    if (await page.locator('#build-metadata').isVisible()) pass('4f. sidebar build metadata visible');
    else fail('4f. sidebar build metadata visible');

    if (await page.locator('.command-center').isVisible()) pass('4g. dashboard layout rendered');
    else fail('4g. dashboard layout rendered');

    const openPreviewBtn = page.locator('#build-summary-actions a', { hasText: 'Open Preview' });
    if (await openPreviewBtn.isVisible()) pass('4h. Open Preview action visible');
    else fail('4h. Open Preview action visible');

    const openDetails = (selector: string) =>
      page.locator(selector).evaluate((el) => {
        (el as HTMLDetailsElement).open = true;
      });

    await page.locator('#build-summary-actions button', { hasText: 'Engineering Report' }).click();
    await page.locator('#report-drawer').waitFor({ state: 'visible', timeout: 5_000 });
    await openDetails('#card-understanding');
    await openDetails('#card-build-plan');
    await openDetails('#card-architecture');
    await openDetails('#card-generated-files');

    const status = await page.locator('#status').textContent();
    if (status?.includes('SUCCESS')) pass('5a. status rendered');
    else fail('5a. status rendered', status ?? 'empty');

    const appType = await page.locator('#app-type').textContent();
    if (appType === 'calculator') pass('5b. app type rendered');
    else fail('5b. app type rendered', appType ?? 'empty');

    const projectFolder = await page.locator('#project-folder').textContent();
    if (projectFolder && projectFolder.length > 0) pass('5c. project path rendered');
    else fail('5c. project path rendered');

    const fileCount = await page.locator('#generated-files li').count();
    if (fileCount > 0) pass(`5d. generated files rendered (${fileCount})`);
    else fail('5d. generated files rendered');

    const installResult = await page.locator('#install-result').textContent();
    if (installResult === 'OK') pass('5e. install result rendered');
    else fail('5e. install result rendered', installResult ?? 'empty');

    const buildResult = await page.locator('#build-result').textContent();
    if (buildResult === 'OK') pass('5f. build result rendered');
    else fail('5f. build result rendered', buildResult ?? 'empty');

    const previewLink = page.locator('#preview-url a');
    if (await previewLink.isVisible()) {
      const href = await previewLink.getAttribute('href');
      pass(`5g. preview URL rendered (${href})`);
    } else {
      fail('5g. preview URL rendered');
    }

    const finalReport = await page.locator('#final-report').textContent();
    if (finalReport && finalReport.includes('Build Report')) pass('5h. final report rendered');
    else fail('5h. final report rendered');

    const buildPlanSection = page.locator('#build-plan');
    if (await buildPlanSection.isVisible()) pass('5i. build plan section rendered');
    else fail('5i. build plan section rendered');

    const planAppName = await page.locator('#plan-app-name').textContent();
    if (planAppName === 'Calculator') pass('5j. plan app name rendered');
    else fail('5j. plan app name rendered', planAppName ?? 'empty');

    const planFeatureCount = await page.locator('#plan-features li').count();
    if (planFeatureCount > 0) pass(`5k. plan features rendered (${planFeatureCount})`);
    else fail('5k. plan features rendered');

    if (finalReport?.includes('── Build Plan ──')) pass('5l. final report includes Build Plan section');
    else fail('5l. final report includes Build Plan section');

    const understandingSection = page.locator('#understanding');
    if (await understandingSection.isVisible()) pass('5m. understanding section rendered');
    else fail('5m. understanding section rendered');

    const understandingIntent = await page.locator('#understanding-intent').textContent();
    if (understandingIntent?.includes('calculator')) pass('5n. understanding intent rendered');
    else fail('5n. understanding intent rendered', understandingIntent ?? 'empty');

    const understandingAppName = await page.locator('#understanding-app-name').textContent();
    if (understandingAppName === 'Calculator') pass('5o. understanding app name rendered');
    else fail('5o. understanding app name rendered', understandingAppName ?? 'empty');

    const understandingFeatureCount = await page.locator('#understanding-features li').count();
    if (understandingFeatureCount > 0) pass(`5p. understanding features rendered (${understandingFeatureCount})`);
    else fail('5p. understanding features rendered');

    const understandingConfidence = await page.locator('#understanding-confidence').textContent();
    if (understandingConfidence && Number.parseFloat(understandingConfidence) > 0) {
      pass(`5q. understanding confidence rendered (${understandingConfidence})`);
    } else {
      fail('5q. understanding confidence rendered', understandingConfidence ?? 'empty');
    }

    const understandingSupported = await page.locator('#understanding-supported').textContent();
    if (understandingSupported === 'Supported') pass('5r. understanding supported status rendered');
    else fail('5r. understanding supported status rendered', understandingSupported ?? 'empty');

    if (finalReport?.includes('── Understanding ──')) pass('5s. final report includes Understanding section');
    else fail('5s. final report includes Understanding section');

    const generationMode = await page.locator('#generation-mode').textContent();
    if (generationMode === 'specialized-template') pass('5t. generation mode rendered');
    else fail('5t. generation mode rendered', generationMode ?? 'empty');

    if (await page.locator('#architecture').isVisible()) pass('5u. architecture section rendered');
    else fail('5u. architecture section rendered');

    const archProjectType = await page.locator('#arch-project-type').textContent();
    if (archProjectType === 'Calculator utility application') pass('5v. architecture project type rendered');
    else fail('5v. architecture project type rendered', archProjectType ?? 'empty');

    const archFolderCount = await page.locator('#arch-folders li').count();
    if (archFolderCount > 0) pass(`5w. architecture folders rendered (${archFolderCount})`);
    else fail('5w. architecture folders rendered');

    if (finalReport?.includes('── Architecture ──')) pass('5x. final report includes Architecture section');
    else fail('5x. final report includes Architecture section');

    await page.locator('#close-report-drawer').click();
    await page.locator('#report-drawer').waitFor({ state: 'hidden', timeout: 5_000 });

    await prompt.fill(UNSUPPORTED_PROMPT);

    const unsupportedRequest = page.waitForResponse(
      (res) => res.url().includes('/build') && res.request().method() === 'POST',
      { timeout: 180_000 },
    );

    await buildBtn.click();
    pass('6. weather prompt sends request to /build');

    const unsupportedResponse = await unsupportedRequest;
    if (unsupportedResponse.ok()) pass('6b. weather /build response OK');
    else fail('6b. weather /build response OK', `status ${unsupportedResponse.status()}`);

    const unsupportedData = await parseBuildApiResponse(unsupportedResponse);
    if (unsupportedData.report && unsupportedData.report.ok === true) {
      pass('6c. weather API report ok is true');
    } else {
      fail('6c. weather API report ok is true');
    }

    await page.locator('#build-summary').waitFor({ state: 'visible', timeout: 180_000 });

    if (unsupportedData.report?.stage === 'complete') pass('6d. weather API stage is complete');
    else fail('6d. weather API stage is complete', unsupportedData.report?.stage ?? 'missing');

    if (await page.locator('#error').isHidden()) pass('6e. error panel hidden for weather prototype');
    else fail('6e. error panel hidden for weather prototype');

    const weatherStatus = await page.locator('#status').textContent();
    if (weatherStatus?.includes('SUCCESS')) pass('6f. weather status rendered SUCCESS');
    else fail('6f. weather status rendered SUCCESS', weatherStatus ?? 'empty');

    if (await page.locator('#build-summary').isVisible()) pass('6g. results visible for weather prompt');
    else fail('6g. results visible for weather prompt');

    await page.locator('#build-summary-actions button', { hasText: 'Engineering Report' }).click();
    await page.locator('#report-drawer').waitFor({ state: 'visible', timeout: 5_000 });
    await page.locator('#card-understanding > summary').click();
    await page.locator('#card-build-plan > summary').click();
    await page.locator('#card-generated-files > summary').click();

    if (await page.locator('#understanding').isVisible()) pass('6h. understanding visible for weather prompt');
    else fail('6h. understanding visible for weather prompt');

    const unsupportedSupported = await page.locator('#understanding-supported').textContent();
    if (unsupportedSupported === 'Not supported') pass('6i. understanding shows Not supported');
    else fail('6i. understanding shows Not supported', unsupportedSupported ?? 'empty');

    if (unsupportedData.report?.understanding?.detectedIntent === 'Build a weather application') {
      pass('6j. weather understanding intent in API report');
    } else {
      fail('6j. weather understanding intent in API report', unsupportedData.report?.understanding?.detectedIntent);
    }

    if (await page.locator('#build-plan').isVisible()) pass('6k. draft build plan visible for weather prompt');
    else fail('6k. draft build plan visible for weather prompt');

    const draftPlanTitle = await page.locator('#build-plan-title').textContent();
    if (draftPlanTitle === 'Draft Build Plan') pass('6l. draft build plan title rendered');
    else fail('6l. draft build plan title rendered', draftPlanTitle ?? 'empty');

    const draftPlanAppName = await page.locator('#plan-app-name').textContent();
    if (draftPlanAppName === 'Weather') pass('6m. draft plan app name rendered');
    else fail('6m. draft plan app name rendered', draftPlanAppName ?? 'empty');

    const draftFeatureCount = await page.locator('#plan-features li').count();
    if (draftFeatureCount >= 3) pass(`6n. draft plan features rendered (${draftFeatureCount})`);
    else fail('6n. draft plan features rendered');

    const weatherGenerationMode = await page.locator('#generation-mode').textContent();
    if (weatherGenerationMode === 'generic-prototype') pass('6o. generation mode generic-prototype rendered');
    else fail('6o. generation mode generic-prototype rendered', weatherGenerationMode ?? 'empty');

    const unsupportedFinalReport = await page.locator('#final-report').textContent();
    if (unsupportedFinalReport?.includes('── Draft Build Plan ──')) {
      pass('6p. final report includes Draft Build Plan section');
    } else {
      fail('6p. final report includes Draft Build Plan section');
    }

    if (unsupportedFinalReport?.includes('Generation Mode: generic-prototype')) {
      pass('6q. final report includes generic-prototype generation mode');
    } else {
      fail('6q. final report includes generic-prototype generation mode');
    }

    if (unsupportedFinalReport?.includes('── Architecture ──')) {
      pass('6r. final report includes Architecture section');
    } else {
      fail('6r. final report includes Architecture section');
    }

    const weatherArchType = await page.locator('#arch-project-type').textContent();
    if (weatherArchType === 'Weather information application') {
      pass('6s. weather architecture project type rendered');
    } else {
      fail('6s. weather architecture project type rendered', weatherArchType ?? 'empty');
    }

    if (unsupportedData.report?.engineeringTimeline?.events?.length) {
      pass('6u. weather engineering timeline in API report');
    } else {
      fail('6u. weather engineering timeline in API report');
    }

    const weatherPreviewLink = page.locator('#preview-url a');
    if (await weatherPreviewLink.isVisible()) pass('6t. weather preview URL rendered');
    else fail('6t. weather preview URL rendered');
  } catch (err) {
    fail('web UI regression run', err instanceof Error ? err.message : String(err));
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }

  console.log('');
  if (failures.length === 0) {
    console.log('PASSED (52 checks)\n');
    return true;
  }

  console.log(`FAILED (${failures.length} check(s)):\n`);
  for (const f of failures) console.log(`  • ${f}`);
  console.log('');
  return false;
}
