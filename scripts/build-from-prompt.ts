#!/usr/bin/env node
/**
 * CLI: one prompt → project → install → build → live preview → report
 *
 * Usage: npm run build:app -- "Build a calculator app"
 */

import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport, buildReportJson } from '../src/report/format-report.js';

const args = process.argv.slice(2).filter((a) => a !== '--skip-preview');
const skipPreview = process.argv.includes('--skip-preview');
const prompt = args.join(' ').trim() || 'Build a calculator app';

async function main(): Promise<void> {
  console.log(`\nAiDevEngine V3 — building from prompt:\n  "${prompt}"\n`);

  const report = await buildFromPrompt({ prompt, skipPreview });

  console.log(formatBuildReport(report));

  if (report.ok && report.previewUrl) {
    console.log(`\nLive preview running at ${report.previewUrl}`);
    console.log('Press Ctrl+C to stop the dev server.\n');
    // Keep process alive while dev server runs
    await new Promise(() => {});
  }

  if (!report.ok) {
    console.error('\nBuild failed.\n');
    if (process.env.JSON_REPORT === '1') {
      console.log(buildReportJson(report));
    }
    process.exit(1);
  }

  if (skipPreview) {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
