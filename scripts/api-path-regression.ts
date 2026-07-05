/**
 * API path regression — POST /build via builder server.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { BuildReport } from '../src/types.js';
import { assertBuildPlan } from './regression-build-plan.js';
import { assertUnderstanding } from './regression-understanding.js';
import { assertGenerationMode } from './regression-generation-mode.js';

export const API_PATH_PROMPT = 'Build a calculator app';
const API_PORT = 39247;
const BASE_URL = `http://127.0.0.1:${API_PORT}`;

interface BuildApiResponse {
  ok: boolean;
  report?: BuildReport;
  reportText?: string;
  error?: string;
}

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

async function verifyPreview(url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

function assertApiResponse(data: BuildApiResponse, httpOk: boolean): void {
  const report = data.report;

  if (httpOk && data.ok) pass('HTTP 200 and ok: true');
  else fail('HTTP 200 and ok: true', `status ok=${data.ok}`);

  if (report?.ok) pass('status SUCCESS (report.ok)');
  else fail('status SUCCESS (report.ok)');

  if (data.reportText?.includes('Status:     SUCCESS')) pass('final report text includes SUCCESS');
  else fail('final report text includes SUCCESS');

  if (report?.appType === 'calculator') pass('app type calculator');
  else fail('app type calculator', report?.appType ?? 'missing');

  if (report?.projectDir && existsSync(report.projectDir)) {
    pass(`project folder exists (${report.projectDir})`);
  } else {
    fail('project folder exists', report?.projectDir ?? 'missing');
  }

  if (report?.generatedFiles && report.generatedFiles.length > 0) {
    pass(`generated files (${report.generatedFiles.length})`);
  } else {
    fail('generated files', 'empty or missing');
  }

  if (report?.installOk) pass('install result OK');
  else fail('install result OK');

  if (report?.buildOk) pass('build result OK');
  else fail('build result OK');

  if (report?.previewUrl) pass(`preview URL present (${report.previewUrl})`);
  else fail('preview URL present');

  if (data.reportText && data.reportText.length > 0) pass('final report text present');
  else fail('final report text present');

  if (report) {
    assertUnderstanding(
      report,
      data.reportText ?? '',
      { expectSupported: true, expectMatchedAppType: 'calculator', minConfidence: 0.95 },
      pass,
      fail,
    );
    assertGenerationMode(report, data.reportText ?? '', 'specialized-template', pass, fail);
    assertBuildPlan(report, data.reportText ?? '', 'calculator', pass, fail);
  }
}

export async function runApiPathRegression(): Promise<boolean> {
  failures.length = 0;
  console.log(`\nAPI path regression: POST /build "${API_PATH_PROMPT}"\n`);

  const server = startBuilderServer();
  let response: BuildApiResponse | null = null;
  let httpOk = false;

  try {
    console.log(`Starting builder server on ${BASE_URL}...\n`);
    await waitForServerReady(server);

    const res = await fetch(`${BASE_URL}/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: API_PATH_PROMPT }),
    });

    httpOk = res.ok;
    response = (await res.json()) as BuildApiResponse;

    if (response.reportText) {
      console.log(response.reportText);
    }

    console.log('\n── Assertions ──\n');

    assertApiResponse(response, httpOk);

    if (response.report?.previewUrl) {
      const reachable = await verifyPreview(response.report.previewUrl);
      if (reachable) pass(`preview URL reachable (${response.report.previewUrl})`);
      else fail('preview URL reachable', response.report.previewUrl);
    } else {
      fail('preview URL reachable', 'no preview URL');
    }
  } catch (err) {
    fail('API regression run', err instanceof Error ? err.message : String(err));
  } finally {
    await stopServer(server);
  }

  console.log('');
  if (failures.length === 0) {
    console.log('PASSED (21 checks)\n');
    return true;
  }

  console.log(`FAILED (${failures.length} check(s)):\n`);
  for (const f of failures) console.log(`  • ${f}`);
  console.log('');
  return false;
}
