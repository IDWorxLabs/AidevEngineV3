export type AppType = 'calculator' | 'counter' | 'todo' | 'unknown';

export type BuildStage =
  | 'detect'
  | 'generate'
  | 'install'
  | 'build'
  | 'preview'
  | 'complete'
  | 'failed';

export interface GeneratedFile {
  relativePath: string;
  content: string;
}

export interface BuildReport {
  ok: boolean;
  prompt: string;
  appType: AppType;
  projectId: string;
  projectDir: string;
  generatedFiles: string[];
  installOk: boolean;
  buildOk: boolean;
  previewUrl: string | null;
  stage: BuildStage;
  error: string | null;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
}

export interface BuildFromPromptInput {
  prompt: string;
  engineRootDir?: string;
  skipPreview?: boolean;
}
