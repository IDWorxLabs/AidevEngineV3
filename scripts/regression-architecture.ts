import type { BuildReport } from '../src/types.js';

export interface AssertArchitectureOptions {
  expectProjectType?: string;
  expectFolders?: string[];
  expectFiles?: string[];
  expectComponents?: string[];
  expectPages?: string[];
  expectStack?: string[];
  expectStateManagement?: string;
  expectRouting?: string;
  expectDataLayer?: string;
  expectStyling?: string;
  expectTestingStrategy?: string;
}

export function assertArchitecture(
  report: BuildReport,
  reportText: string,
  options: AssertArchitectureOptions,
  pass: (label: string) => void,
  fail: (label: string, detail?: string) => void,
): void {
  const architecture = report.architecturePlan;

  if (architecture) pass('architecture plan in report object');
  else {
    fail('architecture plan in report object');
    return;
  }

  if (reportText.includes('── Architecture ──')) pass('Architecture section in report text');
  else fail('Architecture section in report text');

  const architectureIndex = reportText.indexOf('── Architecture ──');
  const projectIndex = reportText.indexOf('── Project ──');
  if (architectureIndex >= 0 && projectIndex >= 0 && architectureIndex < projectIndex) {
    pass('Architecture appears before Project section');
  } else {
    fail('Architecture appears before Project section');
  }

  if (options.expectProjectType && architecture.projectType === options.expectProjectType) {
    pass(`architecture projectType (${architecture.projectType})`);
  } else if (options.expectProjectType) {
    fail(`architecture projectType (${options.expectProjectType})`, architecture.projectType);
  } else if (architecture.projectType) {
    pass('architecture projectType populated');
  } else {
    fail('architecture projectType populated');
  }

  if (architecture.folders.length > 0) pass(`architecture folders (${architecture.folders.length})`);
  else fail('architecture folders');

  if (architecture.files.length > 0) pass(`architecture files (${architecture.files.length})`);
  else fail('architecture files');

  if (architecture.components.length > 0) pass(`architecture components (${architecture.components.length})`);
  else fail('architecture components');

  if (architecture.pages.length > 0) pass(`architecture pages (${architecture.pages.length})`);
  else fail('architecture pages');

  if (architecture.recommendedStack.length > 0) {
    pass(`architecture stack (${architecture.recommendedStack.join(', ')})`);
  } else {
    fail('architecture stack');
  }

  for (const folder of options.expectFolders ?? []) {
    if (architecture.folders.includes(folder)) pass(`architecture folder: ${folder}`);
    else fail(`architecture folder: ${folder}`);
  }

  for (const file of options.expectFiles ?? []) {
    if (architecture.files.includes(file)) pass(`architecture file: ${file}`);
    else fail(`architecture file: ${file}`);
  }

  for (const component of options.expectComponents ?? []) {
    if (architecture.components.includes(component)) pass(`architecture component: ${component}`);
    else fail(`architecture component: ${component}`);
  }

  for (const page of options.expectPages ?? []) {
    if (architecture.pages.includes(page)) pass(`architecture page: ${page}`);
    else fail(`architecture page: ${page}`);
  }

  for (const stackItem of options.expectStack ?? []) {
    if (architecture.recommendedStack.includes(stackItem)) pass(`architecture stack item: ${stackItem}`);
    else fail(`architecture stack item: ${stackItem}`);
  }

  if (options.expectStateManagement && architecture.stateManagement === options.expectStateManagement) {
    pass(`architecture stateManagement (${architecture.stateManagement})`);
  } else if (options.expectStateManagement) {
    fail(`architecture stateManagement (${options.expectStateManagement})`, architecture.stateManagement);
  }

  if (options.expectRouting && architecture.routing === options.expectRouting) {
    pass(`architecture routing (${architecture.routing})`);
  } else if (options.expectRouting) {
    fail(`architecture routing (${options.expectRouting})`, architecture.routing);
  }

  if (options.expectDataLayer && architecture.dataLayer === options.expectDataLayer) {
    pass(`architecture dataLayer (${architecture.dataLayer})`);
  } else if (options.expectDataLayer) {
    fail(`architecture dataLayer (${options.expectDataLayer})`, architecture.dataLayer);
  }

  if (options.expectStyling && architecture.styling === options.expectStyling) {
    pass(`architecture styling (${architecture.styling})`);
  } else if (options.expectStyling) {
    fail(`architecture styling (${options.expectStyling})`, architecture.styling);
  }

  if (options.expectTestingStrategy && architecture.testingStrategy === options.expectTestingStrategy) {
    pass(`architecture testingStrategy (${architecture.testingStrategy})`);
  } else if (options.expectTestingStrategy) {
    fail(`architecture testingStrategy (${options.expectTestingStrategy})`, architecture.testingStrategy);
  }
}
