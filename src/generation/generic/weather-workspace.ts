import type { ArchitecturePlan, BuildPlan, GeneratedFile, UnderstandingReport } from '../../types.js';
import {
  baseProjectFiles,
  placeholderComponent,
  placeholderPage,
  placeholderService,
  placeholderTypes,
  type ArchitectureGuidedInput,
} from '../architecture-guided-shared.js';
import { productQualityStylesFile, wrapIndexCss } from '../product-quality/design-system.js';

export interface WeatherWorkspaceInput {
  understanding: UnderstandingReport;
  buildPlan: BuildPlan;
  architecturePlan: ArchitecturePlan;
  projectName: string;
}

export function buildWeatherWorkspace(input: WeatherWorkspaceInput): GeneratedFile[] {
  const { understanding, buildPlan, architecturePlan } = input;
  const guidedInput: ArchitectureGuidedInput = {
    buildPlan,
    architecturePlan,
    projectName: input.projectName,
  };

  const componentNames = architecturePlan.components.filter((name) => name !== 'App');
  const files: GeneratedFile[] = [...baseProjectFiles(guidedInput)];

  for (const name of componentNames) {
    files.push({
      relativePath: `src/components/${name}.tsx`,
      content: placeholderComponent(name, `Architecture-guided ${name} component`),
    });
  }

  for (const page of architecturePlan.pages) {
    files.push({
      relativePath: `src/pages/${page}.tsx`,
      content: placeholderPage(page, componentNames),
    });
  }

  files.push({
    relativePath: 'src/services/WeatherService.ts',
    content: placeholderService('WeatherService', architecturePlan.dataLayer),
  });

  files.push({
    relativePath: 'src/types/weather.ts',
    content: placeholderTypes('Weather'),
  });

  const description = understanding.detectedIntent;
  const appComponent = `import Home from './pages/Home';

const APP_NAME = ${JSON.stringify(buildPlan.appName)};
const DESCRIPTION = ${JSON.stringify(description)};

export default function App() {
  return (
    <div className="page-layout app" data-layout="responsive-page">
      <header className="page-header" data-layout="header" data-design-component="section-header" data-accessibility="semantic-html">
        <h1>{APP_NAME}</h1>
        <p className="description">{DESCRIPTION}</p>
      </header>
      <main className="page-main" data-layout="main-content" data-accessibility="semantic-html">
        <p className="prototype-banner">Prototype generated from application understanding.</p>
        <Home />
      </main>
    </div>
  );
}
`;

  const indexCss = wrapIndexCss(`.app { width: min(520px, 92vw); margin: 0 auto; padding: var(--ds-space-lg); }

.prototype-banner {
  margin: 0 0 var(--ds-space-md);
  padding: 0.75rem 1rem;
  background: var(--ds-color-surface);
  border-radius: var(--ds-radius-md);
  color: var(--ds-color-accent);
  text-align: center;
}

.description { color: var(--ds-color-text-muted); text-align: center; margin-bottom: var(--ds-space-md); }

.arch-component, .page {
  background: var(--ds-color-surface);
  border-radius: var(--ds-radius-lg);
  padding: var(--ds-space-md);
  margin-bottom: var(--ds-space-md);
}
`);

  files.push(productQualityStylesFile());
  files.push({ relativePath: 'src/App.tsx', content: appComponent });
  files.push({ relativePath: 'src/index.css', content: indexCss });

  const plannedPaths = new Set(architecturePlan.files.map((path) => path.replace(/\\/g, '/')));
  return files.filter((file) => {
    if (plannedPaths.has(file.relativePath)) return true;
    return ['src/App.tsx', 'src/index.css', 'src/styles/product-quality.css'].includes(file.relativePath);
  });
}
