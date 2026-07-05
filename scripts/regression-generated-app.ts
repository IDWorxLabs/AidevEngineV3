import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BuildReport } from '../src/types.js';

export function assertGeneratedAppUsesPlanAppName(
  report: BuildReport,
  pass: (label: string) => void,
  fail: (label: string, detail?: string) => void,
): void {
  const appName = report.buildPlan?.appName;
  if (!appName) {
    fail('generated App.tsx includes planned appName', 'no buildPlan.appName');
    return;
  }

  const appPath = join(report.projectDir, 'src', 'App.tsx');
  try {
    const content = readFileSync(appPath, 'utf8');
    if (content.includes(`<h1>${appName}</h1>`)) {
      pass(`generated App.tsx includes planned appName (${appName})`);
    } else {
      fail('generated App.tsx includes planned appName', `expected <h1>${appName}</h1>`);
    }
  } catch (err) {
    fail('generated App.tsx includes planned appName', err instanceof Error ? err.message : String(err));
  }
}
