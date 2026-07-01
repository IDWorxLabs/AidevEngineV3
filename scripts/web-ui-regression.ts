/**
 * Web UI regression — browser test of minimal builder interface.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { join } from 'node:path';
import { chromium } from 'playwright';

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

    await page.locator('#results').waitFor({ state: 'visible', timeout: 180_000 });

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
  } catch (err) {
    fail('web UI regression run', err instanceof Error ? err.message : String(err));
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }

  console.log('');
  if (failures.length === 0) {
    console.log('PASSED (13 checks)\n');
    return true;
  }

  console.log(`FAILED (${failures.length} check(s)):\n`);
  for (const f of failures) console.log(`  • ${f}`);
  console.log('');
  return false;
}
