export type BuildLoopStatus = 'PASS' | 'WARN' | 'FAIL';

export type BuildLoopStageResultValue = 'pass' | 'warn' | 'fail' | 'skipped';

export interface BuildLoopStageResult {
  stageName: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  result: BuildLoopStageResultValue;
  warnings: string[];
  failureReason: string | null;
}

export interface BuildLoopReport {
  workspaceGenerated: boolean;
  dependenciesInstalled: boolean;
  installSucceeded: boolean;
  buildSucceeded: boolean;
  previewStarted: boolean;
  previewVerified: boolean;
  previewUrl: string | null;
  elapsedTimeMs: number;
  stageResults: BuildLoopStageResult[];
  failedStage: string | null;
  warnings: string[];
  status: BuildLoopStatus;
}
