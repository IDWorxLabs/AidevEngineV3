import type { ArchitecturePlan, GeneratedFile } from '../types.js';
import { buildCommonProjectFiles } from '../generator/templates/shared.js';
import type { BuildPlan } from '../types.js';

export interface ArchitectureGuidedInput {
  buildPlan: BuildPlan;
  architecturePlan: ArchitecturePlan;
  projectName: string;
}

export function baseProjectFiles(input: ArchitectureGuidedInput): GeneratedFile[] {
  return buildCommonProjectFiles(input.buildPlan, input.projectName);
}

export function placeholderComponent(name: string, description: string): string {
  return `interface ${name}Props {
  label?: string;
}

export function ${name}({ label = ${JSON.stringify(name)} }: ${name}Props) {
  return (
    <section className="arch-component" data-component="${name}">
      <h2>{label}</h2>
      <p>${description}</p>
    </section>
  );
}
`;
}

export function placeholderPage(name: string, componentImports: string[]): string {
  const imports = componentImports
    .map((c) => `import { ${c} } from '../components/${c}';`)
    .join('\n');
  const usage = componentImports.map((c) => `      <${c} />`).join('\n');

  return `${imports}

export default function ${name}() {
  return (
    <div className="page" data-page="${name}">
${usage}
    </div>
  );
}
`;
}

export function placeholderService(serviceName: string, dataLayer: string): string {
  return `// ${dataLayer}

export class ${serviceName} {
  async fetchDemo() {
    return { ok: true, source: ${JSON.stringify(dataLayer)} };
  }
}
`;
}

export function placeholderTypes(typeName: string): string {
  return `export interface ${typeName}Record {
  id: string;
  label: string;
}
`;
}

export function collectEvidence(
  files: GeneratedFile[],
  architecturePlan: ArchitecturePlan,
): {
  foldersCreated: string[];
  componentsGenerated: string[];
  pagesGenerated: string[];
  servicesGenerated: string[];
} {
  const paths = files.map((file) => file.relativePath.replace(/\\/g, '/'));

  const foldersCreated = [...architecturePlan.folders];

  const componentsGenerated = architecturePlan.components
    .filter((name) => name !== 'App')
    .filter((name) => paths.some((path) => path.endsWith(`/components/${name}.tsx`) || path.endsWith(`/${name}.tsx`)));

  const pagesGenerated = architecturePlan.pages.filter((name) =>
    paths.some((path) => path.endsWith(`/pages/${name}.tsx`)),
  );

  const servicesGenerated = paths
    .filter((path) => path.includes('/services/') && path.endsWith('.ts'))
    .map((path) => {
      const fileName = path.split('/').pop() ?? '';
      return fileName.replace(/\.ts$/, '');
    });

  return {
    foldersCreated,
    componentsGenerated,
    pagesGenerated,
    servicesGenerated,
  };
}
