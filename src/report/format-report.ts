import type { BuildReport } from '../types.js';

export function formatBuildReport(report: BuildReport): string {
  const lines: string[] = [
    '═══════════════════════════════════════',
    '  AiDevEngine V3 — Build Report',
    '═══════════════════════════════════════',
    '',
    `Status:     ${report.ok ? 'SUCCESS' : 'FAILED'}`,
    `Prompt:     ${report.prompt}`,
    `App type:   ${report.appType}`,
    `Stage:      ${report.stage}`,
    `Duration:   ${(report.durationMs / 1000).toFixed(1)}s`,
    '',
    '── Project ──',
    `ID:         ${report.projectId}`,
    `Folder:     ${report.projectDir}`,
    `Files:      ${report.generatedFiles.length} generated`,
  ];

  if (report.generatedFiles.length > 0) {
    for (const f of report.generatedFiles) {
      lines.push(`  • ${f}`);
    }
  }

  lines.push(
    '',
    '── Build ──',
    `npm install: ${report.installOk ? 'OK' : 'FAIL'}`,
    `npm build:   ${report.buildOk ? 'OK' : 'FAIL'}`,
  );

  if (report.previewUrl) {
    lines.push('', '── Live Preview ──', `URL: ${report.previewUrl}`);
  }

  if (report.error) {
    lines.push('', '── Error ──', report.error);
  }

  lines.push('', '═══════════════════════════════════════');
  return lines.join('\n');
}

export function buildReportJson(report: BuildReport): string {
  return JSON.stringify(report, null, 2);
}
