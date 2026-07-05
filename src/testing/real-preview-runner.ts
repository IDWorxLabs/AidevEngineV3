import { chromium, type Page } from 'playwright';
import { startDevServer } from '../build/dev-server.js';
import type {
  PreviewVerificationReport,
  PreviewVerificationStatus,
} from './preview-verification-types.js';

export interface RunRealPreviewVerificationInput {
  projectDir: string;
  previewUrl?: string | null;
  previewStarted?: boolean;
  previewStartupMs?: number;
  skipPreview?: boolean;
}

const PREVIEW_LOAD_TIMEOUT_MS = 30_000;

function resolveStatus(flags: {
  skipPreview: boolean;
  previewStarted: boolean;
  httpReachable: boolean;
  htmlLoaded: boolean;
  applicationRendered: boolean;
  warnings: string[];
}): PreviewVerificationStatus {
  if (flags.skipPreview) {
    return 'WARN';
  }

  if (!flags.previewStarted || !flags.httpReachable || !flags.htmlLoaded) {
    return 'FAIL';
  }

  if (!flags.applicationRendered) {
    return 'FAIL';
  }

  return flags.warnings.length > 0 ? 'WARN' : 'PASS';
}

function skippedReport(warnings: string[]): PreviewVerificationReport {
  return {
    previewStarted: false,
    previewUrl: null,
    httpReachable: false,
    httpStatus: null,
    htmlLoaded: false,
    applicationRendered: false,
    previewStartupMs: 0,
    verificationDurationMs: 0,
    evidence: [],
    warnings,
    status: 'WARN',
  };
}

async function waitForHttpReachable(
  url: string,
  timeoutMs = 15_000,
): Promise<{ reachable: boolean; status: number | null; body: string; evidence: string[]; warning?: string }> {
  const startedMs = Date.now();
  let lastError: string | undefined;

  while (Date.now() - startedMs < timeoutMs) {
    try {
      const response = await fetch(url);
      const body = await response.text();
      const evidence = [`HTTP ${response.status} from ${url}`];

      if (response.ok) {
        return { reachable: true, status: response.status, body, evidence };
      }

      lastError = `HTTP ${response.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return {
    reachable: false,
    status: null,
    body: '',
    evidence: [],
    warning: lastError ?? 'Preview URL not reachable',
  };
}

function verifyHtmlDocument(body: string): { loaded: boolean; evidence: string[]; warning?: string } {
  const evidence: string[] = [];
  const lower = body.toLowerCase();

  const hasDocument =
    lower.includes('<!doctype html') ||
    lower.includes('<html') ||
    lower.includes('<head');

  if (hasDocument) {
    evidence.push('Expected HTML document loaded');
  }

  const hasRoot = body.includes('id="root"') || body.includes("id='root'");
  if (hasRoot) {
    evidence.push('React root mount point present in HTML');
  }

  if (!hasDocument) {
    return { loaded: false, evidence, warning: 'Response does not contain an HTML document' };
  }

  if (!hasRoot) {
    return { loaded: false, evidence, warning: 'HTML document missing React root element' };
  }

  return { loaded: true, evidence };
}

async function verifyApplicationRendered(page: Page): Promise<{
  rendered: boolean;
  evidence: string[];
  warning?: string;
}> {
  const evidence: string[] = [];
  const runtimeErrors: string[] = [];

  page.on('pageerror', (error) => {
    runtimeErrors.push(error.message);
  });

  await page.waitForSelector('#root', { timeout: PREVIEW_LOAD_TIMEOUT_MS });
  evidence.push('React root element present in DOM');

  const rootMounted = await page.locator('#root').evaluate((element) => element.childElementCount > 0);
  if (rootMounted) {
    evidence.push('React root mounted with child nodes');
  }

  const containerVisible = await page
    .locator('.app, [class~="app"], main, [data-page], [data-component], [data-ui-pattern]')
    .first()
    .isVisible()
    .catch(() => false);

  if (containerVisible) {
    evidence.push('Primary application container rendered');
  }

  const interactiveCount = await page
    .locator('#root button, #root input, #root a, #root [role="button"], #root [onclick]')
    .count();

  if (interactiveCount > 0) {
    evidence.push(`Interactive UI elements present (${interactiveCount})`);
  }

  if (runtimeErrors.length > 0) {
    return {
      rendered: false,
      evidence,
      warning: `Fatal runtime errors detected: ${runtimeErrors.join('; ')}`,
    };
  }

  const rendered = rootMounted && (containerVisible || interactiveCount > 0);
  if (!rendered) {
    return {
      rendered: false,
      evidence,
      warning: 'Application root did not render expected UI content',
    };
  }

  return { rendered: true, evidence };
}

export async function runRealPreviewVerification(
  input: RunRealPreviewVerificationInput,
): Promise<PreviewVerificationReport> {
  if (input.skipPreview) {
    return skippedReport(['Preview skipped by request']);
  }

  const verificationStartMs = Date.now();
  const warnings: string[] = [];
  const evidence: string[] = [];

  let previewUrl = input.previewUrl ?? null;
  let previewStarted = input.previewStarted ?? false;
  let previewStartupMs = input.previewStartupMs ?? 0;

  if (!previewUrl) {
    const startupStartMs = Date.now();
    const preview = await startDevServer(input.projectDir);

    if (!preview.ok || !preview.url) {
      return {
        previewStarted: false,
        previewUrl: null,
        httpReachable: false,
        httpStatus: null,
        htmlLoaded: false,
        applicationRendered: false,
        previewStartupMs: Date.now() - startupStartMs,
        verificationDurationMs: Date.now() - verificationStartMs,
        evidence: [],
        warnings: [preview.error ?? 'Preview server failed to start'],
        status: 'FAIL',
      };
    }

    previewUrl = preview.url;
    previewStarted = true;
    previewStartupMs = Date.now() - startupStartMs;
    if (preview.reused) {
      warnings.push('Preview server reused from prior run');
    }
    evidence.push(`Preview server started at ${previewUrl}`);
  } else if (previewStarted) {
    evidence.push(`Preview server already running at ${previewUrl}`);
  }

  const http = await waitForHttpReachable(previewUrl);
  evidence.push(...http.evidence);
  if (http.warning) warnings.push(http.warning);

  let htmlLoaded = false;
  if (http.reachable) {
    const html = verifyHtmlDocument(http.body);
    evidence.push(...html.evidence);
    htmlLoaded = html.loaded;
    if (html.warning) warnings.push(html.warning);
  }

  let applicationRendered = false;
  if (http.reachable && htmlLoaded) {
    let browser = null;
    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(previewUrl, {
        waitUntil: 'domcontentloaded',
        timeout: PREVIEW_LOAD_TIMEOUT_MS,
      });

      const render = await verifyApplicationRendered(page);
      evidence.push(...render.evidence);
      applicationRendered = render.rendered;
      if (render.warning) warnings.push(render.warning);
    } catch (err) {
      warnings.push(err instanceof Error ? err.message : String(err));
    } finally {
      await browser?.close();
    }
  }

  const status = resolveStatus({
    skipPreview: false,
    previewStarted,
    httpReachable: http.reachable,
    htmlLoaded,
    applicationRendered,
    warnings,
  });

  return {
    previewStarted,
    previewUrl,
    httpReachable: http.reachable,
    httpStatus: http.status,
    htmlLoaded,
    applicationRendered,
    previewStartupMs,
    verificationDurationMs: Date.now() - verificationStartMs,
    evidence,
    warnings,
    status,
  };
}
