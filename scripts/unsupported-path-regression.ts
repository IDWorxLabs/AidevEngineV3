/**

 * Unsupported app path regression — understood prompts without specialized templates.

 */



import { spawn, type ChildProcess } from 'node:child_process';

import { join } from 'node:path';

import { buildFromPrompt } from '../src/build/orchestrator.js';

import { formatBuildReport } from '../src/report/format-report.js';

import type { BuildReport } from '../src/types.js';

import { assertUnderstanding } from './regression-understanding.js';

import { assertDraftBuildPlan } from './regression-draft-build-plan.js';

import { assertGenerationMode } from './regression-generation-mode.js';
import { assertArchitecture } from './regression-architecture.js';



export const UNSUPPORTED_PROMPT = 'Build a weather app';

const API_PORT = 39249;

const BASE_URL = `http://127.0.0.1:${API_PORT}`;



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



function assertUnsupportedAppReport(report: BuildReport, reportText: string, label: string): void {

  const prefix = `${label}:`;



  if (report.ok) pass(`${prefix} status SUCCESS`);

  else fail(`${prefix} status SUCCESS`, report.error ?? 'failed');



  if (reportText.includes('Status:     SUCCESS')) pass(`${prefix} report text shows SUCCESS`);

  else fail(`${prefix} report text shows SUCCESS`);



  if (report.stage === 'complete') pass(`${prefix} stage is complete`);

  else fail(`${prefix} stage is complete`, report.stage);



  if (report.prompt === UNSUPPORTED_PROMPT) pass(`${prefix} original prompt preserved`);

  else fail(`${prefix} original prompt preserved`, report.prompt);



  if (report.appType === 'unknown') pass(`${prefix} app type unknown`);

  else fail(`${prefix} app type unknown`, report.appType);



  if (!report.error) pass(`${prefix} no unsupported rejection error`);

  else fail(`${prefix} no unsupported rejection error`, report.error);



  assertUnderstanding(

    report,

    reportText,

    { expectSupported: false, expectMatchedAppType: null },

    (l) => pass(`${prefix} ${l}`),

    (l, detail) => fail(`${prefix} ${l}`, detail),

  );



  assertDraftBuildPlan(

    report,

    reportText,

    (l) => pass(`${prefix} ${l}`),

    (l, detail) => fail(`${prefix} ${l}`, detail),

  );



  assertGenerationMode(

    report,

    reportText,

    'generic-prototype',

    (l) => pass(`${prefix} ${l}`),

    (l, detail) => fail(`${prefix} ${l}`, detail),

  );



  assertArchitecture(

    report,

    reportText,

    {

      expectProjectType: 'Weather information application',

      expectComponents: ['WeatherDisplay', 'SearchBar', 'ForecastCard'],

      expectPages: ['Home'],

    },

    (l) => pass(`${prefix} ${l}`),

    (l, detail) => fail(`${prefix} ${l}`, detail),

  );

}



function startBuilderServer(): ChildProcess {

  const tsxBin = join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');

  return spawn(process.execPath, [tsxBin, 'server/builder-server.ts'], {

    cwd: process.cwd(),

    env: { ...process.env, PORT: String(API_PORT) },

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



export async function runUnsupportedPathRegression(): Promise<boolean> {

  failures.length = 0;

  console.log(`\nUnsupported app path regression: "${UNSUPPORTED_PROMPT}"\n`);



  const report = await buildFromPrompt({ prompt: UNSUPPORTED_PROMPT, skipPreview: true });

  const reportText = formatBuildReport(report);



  console.log(reportText);

  console.log('\n── CLI Assertions ──\n');

  assertUnsupportedAppReport(report, reportText, 'CLI');



  const server = startBuilderServer();

  try {

    console.log('\n── API Assertions ──\n');

    await waitForServerReady(server);



    const res = await fetch(`${BASE_URL}/build`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ prompt: UNSUPPORTED_PROMPT, skipPreview: true }),

    });



    let data: { ok?: boolean; report?: BuildReport; reportText?: string; error?: string };

    try {

      data = (await res.json()) as typeof data;

    } catch {

      fail('API returns JSON response');

      data = {};

    }



    if (data.report) pass('API: returns report object');

    else fail('API: returns report object');



    if (data.reportText) pass('API: returns reportText');

    else fail('API: returns reportText');



    if (data.report && data.report.ok) pass('API: report ok is true');

    else fail('API: report ok is true');



    if (res.ok) pass('API: HTTP 200');

    else fail('API: HTTP 200', `status ${res.status}`);



    if (data.report) {

      assertUnsupportedAppReport(data.report, data.reportText ?? '', 'API');

    }

  } catch (err) {

    fail('API regression run', err instanceof Error ? err.message : String(err));

  } finally {

    await stopServer(server);

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


