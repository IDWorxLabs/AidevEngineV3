/**
 * Single-Screen Builder UI regression — verifies fixed viewport layout,
 * reset behavior, report drawer, and preserved build data.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { chromium } from 'playwright';
import { WEB_UI_PROMPT } from './web-ui-regression.js';

const PASS_TOKEN = 'SINGLE_SCREEN_BUILDER_UI_V1_PASS';
const UI_PORT = 39249;
const BASE_URL = `http://127.0.0.1:${UI_PORT}`;

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
    env: { ...process.env, PORT: String(UI_PORT) },
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
      // not ready
    }
    await sleep(250);
  }
  throw new Error(`Builder server not ready after ${timeoutMs}ms`);
}

async function stopServer(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) return;
  child.kill('SIGTERM');
  await sleep(500);
  if (child.exitCode === null) child.kill('SIGKILL');
}

async function openReportCards(page: import('playwright').Page): Promise<void> {
  await page.evaluate(() => {
    const drawer = document.getElementById('report-drawer');
    if (drawer) {
      drawer.hidden = false;
      drawer.setAttribute('aria-hidden', 'false');
    }
    for (const id of [
      'card-understanding',
      'card-build-plan',
      'card-architecture',
      'card-generated-files',
    ]) {
      const card = document.getElementById(id);
      if (card instanceof HTMLDetailsElement) card.open = true;
    }
  });
}

function assertStaticSingleScreenShell(): void {
  const indexHtml = readFileSync(join(process.cwd(), 'web', 'index.html'), 'utf8');
  const appJs = readFileSync(join(process.cwd(), 'web', 'app.js'), 'utf8');
  const stylesCss = readFileSync(join(process.cwd(), 'web', 'styles.css'), 'utf8');

  if (indexHtml.includes('single-screen-builder')) pass('static: single-screen shell exists');
  else fail('static: single-screen shell exists');

  if (indexHtml.includes('command-center')) pass('static: command center layout exists');
  else fail('static: command center layout exists');

  if (indexHtml.includes('report-drawer')) pass('static: report drawer exists');
  else fail('static: report drawer exists');

  if (indexHtml.includes('reset-workspace-btn')) pass('static: reset button exists');
  else fail('static: reset button exists');

  if (indexHtml.includes('new-build-btn')) pass('static: new build button exists');
  else fail('static: new build button exists');

  if (appJs.includes('resetWorkspaceUI')) pass('static: resetWorkspaceUI implemented');
  else fail('static: resetWorkspaceUI implemented');

  if (appJs.includes('openReportDrawer')) pass('static: openReportDrawer implemented');
  else fail('static: openReportDrawer implemented');

  if (stylesCss.includes('overflow: hidden') && stylesCss.includes('single-screen-body')) {
    pass('static: body uses no page scroll layout');
  } else {
    fail('static: body uses no page scroll layout');
  }

  if (stylesCss.includes('scroll-panel')) pass('static: internal scroll panels defined');
  else fail('static: internal scroll panels defined');
}

export async function runSingleScreenBuilderUiRegression(): Promise<boolean> {
  failures.length = 0;
  console.log('\nSingle-Screen Builder UI regression\n');

  console.log('── Static shell checks ──\n');
  assertStaticSingleScreenShell();

  console.log('\n── Browser interaction checks ──\n');

  const server = startBuilderServer();
  let browser = null;

  try {
    await waitForServerReady(server);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const bodyOverflow = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return { overflowY: style.overflowY, overflow: style.overflow };
    });
    if (bodyOverflow.overflowY === 'hidden' || bodyOverflow.overflow === 'hidden') {
      pass('browser: body prevents page scroll');
    } else {
      fail('browser: body prevents page scroll', bodyOverflow.overflowY);
    }

    const shellHeight = await page.evaluate(() => {
      const shell = document.querySelector('.single-screen-builder');
      return shell ? shell.getBoundingClientRect().height : 0;
    });
    if (shellHeight >= 700 && shellHeight <= 780) pass(`browser: shell fits viewport (${Math.round(shellHeight)}px)`);
    else fail('browser: shell fits viewport', String(Math.round(shellHeight)));

    if (await page.locator('#prompt-panel').isVisible()) pass('browser: prompt panel visible');
    else fail('browser: prompt panel visible');

    if (await page.locator('#engineering-timeline, #timeline-idle').first().isVisible()) {
      pass('browser: timeline area visible');
    } else {
      fail('browser: timeline area visible');
    }

    if (await page.locator('#sidebar').isVisible()) pass('browser: sidebar exists');
    else fail('browser: sidebar exists');

    await page.locator('#prompt').fill(WEB_UI_PROMPT);
    const buildRequest = page.waitForResponse(
      (res) => res.url().includes('/build') && res.request().method() === 'POST',
      { timeout: 180_000 },
    );
    await page.locator('#build-btn').click();
    await buildRequest;
    await page.locator('#build-summary').waitFor({ state: 'visible', timeout: 180_000 });

    if (await page.locator('#build-summary').isVisible()) pass('browser: build summary visible after build');
    else fail('browser: build summary visible after build');

    const pageScrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    if (pageScrollHeight <= viewportHeight + 4) {
      pass('browser: no page scroll after completed build');
    } else {
      fail('browser: no page scroll after completed build', `${pageScrollHeight} > ${viewportHeight}`);
    }

    await page.locator('#report-drawer').waitFor({ state: 'attached' });
    if (await page.locator('#report-drawer').isHidden()) pass('browser: report drawer closed by default');
    else fail('browser: report drawer closed by default');

    await page.locator('#build-summary-actions button', { hasText: 'Engineering Report' }).click();
    await page.locator('#report-drawer').waitFor({ state: 'visible', timeout: 5_000 });
    if (await page.locator('#report-drawer').isVisible()) pass('browser: engineering report opens in drawer');
    else fail('browser: engineering report opens in drawer');

    await openReportCards(page);
    const finalReport = await page.locator('#final-report').textContent();
    if (finalReport?.includes('Build Report')) pass('browser: report data preserved in drawer');
    else fail('browser: report data preserved in drawer');

    await page.locator('#close-report-drawer').click();
    if (await page.locator('#report-drawer').isHidden()) pass('browser: report drawer closes');
    else fail('browser: report drawer closes');

    await page.locator('#reset-workspace-btn').click();
    if (await page.locator('#build-summary').isHidden()) pass('browser: reset clears build summary');
    else fail('browser: reset clears build summary');

    if (await page.locator('#timeline-idle').isVisible()) pass('browser: reset shows timeline idle state');
    else fail('browser: reset shows timeline idle state');

    if (await page.locator('#sidebar-hint').isVisible()) pass('browser: reset restores sidebar hint');
    else fail('browser: reset restores sidebar hint');

    if ((await page.locator('#prompt').inputValue()) === '') pass('browser: reset clears prompt');
    else fail('browser: reset clears prompt');

    await page.locator('#prompt').fill('Build a counter app');
    await page.locator('#build-btn').click();
    await page.waitForResponse(
      (res) => res.url().includes('/build') && res.request().method() === 'POST',
      { timeout: 180_000 },
    );
    await page.locator('#build-summary').waitFor({ state: 'visible', timeout: 180_000 });

    await page.locator('#build-summary-actions button', { hasText: 'Build Another App' }).click();
    if (await page.locator('#build-summary').isHidden()) pass('browser: build another app resets UI');
    else fail('browser: build another app resets UI');

    if ((await page.locator('#prompt').inputValue()) === 'Build a counter app') {
      pass('browser: build another app keeps prompt text');
    } else {
      fail('browser: build another app keeps prompt text');
    }

    await page.locator('#view-previews-btn').click();
    await page.locator('#previews-panel').waitFor({ state: 'visible', timeout: 10_000 });
    const previewItems = await page.locator('#previews-list li').count();
    if (previewItems > 0) pass(`browser: preview history accessible (${previewItems} entries)`);
    else fail('browser: preview history accessible');
  } catch (err) {
    fail('single-screen browser regression', err instanceof Error ? err.message : String(err));
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }

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
