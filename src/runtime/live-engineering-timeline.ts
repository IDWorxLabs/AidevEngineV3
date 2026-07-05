export type EngineeringTimelineEventStatus =
  | 'Waiting'
  | 'Running'
  | 'Success'
  | 'Warning'
  | 'Failed';

export type EngineeringTimelineHealth = 'healthy' | 'degraded' | 'failed';

export interface EngineeringTimelineEvent {
  id: string;
  stage: string;
  title: string;
  description: string;
  status: EngineeringTimelineEventStatus;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  details: string[];
}

export interface EngineeringTimelineCompletionStatistics {
  totalStages: number;
  completedStages: number;
  failedStages: number;
  warnedStages: number;
  skippedStages: number;
}

export interface EngineeringTimeline {
  currentStage: string;
  currentStatus: EngineeringTimelineEventStatus;
  overallProgress: number;
  totalElapsedTime: number;
  events: EngineeringTimelineEvent[];
  stageDurations: Record<string, number>;
  totalEngineeringTimeMs: number;
  slowestStage: string | null;
  fastestStage: string | null;
  timelineHealth: EngineeringTimelineHealth;
  completionStatistics: EngineeringTimelineCompletionStatistics;
}

export interface TimelineStageDefinition {
  id: string;
  stage: string;
  title: string;
  description: string;
  icon: string;
}

export const ENGINEERING_TIMELINE_STAGES: readonly TimelineStageDefinition[] = [
  {
    id: 'understanding',
    stage: 'understanding',
    title: 'Understanding your request',
    description: 'Analyzing prompt intent, features, and supported app type',
    icon: '🧠',
  },
  {
    id: 'build-planning',
    stage: 'build-planning',
    title: 'Creating build plan',
    description: 'Planning features, pages, components, and project structure',
    icon: '📋',
  },
  {
    id: 'architecture-planning',
    stage: 'architecture-planning',
    title: 'Designing architecture',
    description: 'Defining stack, folders, state, routing, and data layer',
    icon: '🏗',
  },
  {
    id: 'architecture-guided-generation',
    stage: 'architecture-guided-generation',
    title: 'Generating application',
    description: 'Creating source files from architecture-guided templates',
    icon: '⚙',
  },
  {
    id: 'feature-reality',
    stage: 'feature-reality',
    title: 'Evaluating feature reality',
    description: 'Verifying requested features appear in generated output',
    icon: '✓',
  },
  {
    id: 'workspace-generation',
    stage: 'workspace-generation',
    title: 'Generating workspace',
    description: 'Writing project files to disk',
    icon: '📁',
  },
  {
    id: 'dependency-installation',
    stage: 'dependency-installation',
    title: 'Installing dependencies',
    description: 'Running npm install in the generated workspace',
    icon: '📦',
  },
  {
    id: 'compile-build',
    stage: 'compile-build',
    title: 'Compiling project',
    description: 'Running npm run build and applying repairs if needed',
    icon: '🔨',
  },
  {
    id: 'preview-startup',
    stage: 'preview-startup',
    title: 'Launching preview',
    description: 'Starting the Vite dev server for live preview',
    icon: '🚀',
  },
  {
    id: 'preview-verification',
    stage: 'preview-verification',
    title: 'Verifying application',
    description: 'Confirming preview is reachable and the app renders',
    icon: '🔍',
  },
  {
    id: 'build-complete',
    stage: 'build-complete',
    title: 'Application Ready',
    description: 'Engineering pipeline finished',
    icon: '🎉',
  },
] as const;

export type EngineeringTimelineStageId = (typeof ENGINEERING_TIMELINE_STAGES)[number]['id'];

export type TimelineEventCallback = (timeline: EngineeringTimeline) => void;

function mapBuildLoopResult(
  result: 'pass' | 'warn' | 'fail' | 'skipped',
): EngineeringTimelineEventStatus {
  switch (result) {
    case 'pass':
      return 'Success';
    case 'warn':
      return 'Warning';
    case 'skipped':
      return 'Warning';
    case 'fail':
      return 'Failed';
  }
}

export class LiveEngineeringTimelineTracker {
  private readonly events: EngineeringTimelineEvent[];
  private readonly buildStartMs: number;
  private readonly onUpdate?: TimelineEventCallback;
  private currentStageId: string;
  private buildFinished = false;

  constructor(onUpdate?: TimelineEventCallback, buildStartMs = Date.now()) {
    this.buildStartMs = buildStartMs;
    this.onUpdate = onUpdate;
    this.currentStageId = ENGINEERING_TIMELINE_STAGES[0].id;

    this.events = ENGINEERING_TIMELINE_STAGES.map((def) => ({
      id: def.id,
      stage: def.stage,
      title: `${def.icon} ${def.title}`,
      description: def.description,
      status: 'Waiting' as EngineeringTimelineEventStatus,
      startedAt: null,
      finishedAt: null,
      durationMs: null,
      details: [],
    }));
  }

  startStage(stageId: EngineeringTimelineStageId, details: string[] = []): void {
    if (this.buildFinished) return;

    const event = this.findEvent(stageId);
    if (!event || event.status === 'Success' || event.status === 'Warning' || event.status === 'Failed') {
      return;
    }

    this.currentStageId = stageId;
    event.status = 'Running';
    event.startedAt = new Date().toISOString();
    if (details.length > 0) {
      event.details = [...details];
    }

    this.emit();
  }

  completeStage(
    stageId: EngineeringTimelineStageId,
    status: EngineeringTimelineEventStatus,
    options: {
      details?: string[];
      warnings?: string[];
      failureReason?: string | null;
    } = {},
  ): void {
    if (this.buildFinished && stageId !== 'build-complete') return;

    const event = this.findEvent(stageId);
    if (!event) return;

    const finishedAt = new Date();
    event.status = status;
    event.finishedAt = finishedAt.toISOString();
    if (event.startedAt) {
      event.durationMs = finishedAt.getTime() - new Date(event.startedAt).getTime();
    } else {
      event.startedAt = finishedAt.toISOString();
      event.durationMs = 0;
    }

    const detailLines = [...(options.details ?? [])];
    if (options.warnings?.length) {
      detailLines.push(...options.warnings.map((w) => `Warning: ${w}`));
    }
    if (options.failureReason) {
      detailLines.push(`Failure: ${options.failureReason}`);
    }
    if (detailLines.length > 0) {
      event.details = detailLines;
    }

    this.emit();
  }

  completeFromBuildLoop(
    stageName: string,
    result: 'pass' | 'warn' | 'fail' | 'skipped',
    options: {
      details?: string[];
      warnings?: string[];
      failureReason?: string | null;
    } = {},
  ): void {
    const stageId = stageName as EngineeringTimelineStageId;
    if (!this.findEvent(stageId)) return;

    this.completeStage(stageId, mapBuildLoopResult(result), options);
  }

  finalizeBuildComplete(ok: boolean, options: { failureReason?: string | null; details?: string[] } = {}): EngineeringTimeline {
    this.buildFinished = true;

    const completeEvent = this.findEvent('build-complete');
    if (completeEvent) {
      completeEvent.status = ok ? 'Success' : 'Failed';
      completeEvent.startedAt = completeEvent.startedAt ?? new Date().toISOString();
      completeEvent.finishedAt = new Date().toISOString();
      completeEvent.durationMs = 0;
      completeEvent.title = ok ? '🎉 Application Ready' : '❌ Build Failed';
      completeEvent.details = [
        ...(options.details ?? []),
        ...(options.failureReason ? [`Failure: ${options.failureReason}`] : []),
      ];
      this.currentStageId = 'build-complete';
    }

    const timeline = this.buildTimeline();
    this.onUpdate?.(timeline);
    return timeline;
  }

  getSnapshot(): EngineeringTimeline {
    return this.buildTimeline();
  }

  buildTimeline(): EngineeringTimeline {
    const finishedEvents = this.events.filter(
      (e) => e.status === 'Success' || e.status === 'Warning' || e.status === 'Failed',
    );
    const actionableStages = this.events.filter((e) => e.id !== 'build-complete');
    const completedCount = finishedEvents.filter((e) => e.id !== 'build-complete').length;
    const overallProgress =
      actionableStages.length === 0 ? 0 : completedCount / actionableStages.length;

    const stageDurations: Record<string, number> = {};
    for (const event of this.events) {
      if (event.durationMs != null && event.id !== 'build-complete') {
        stageDurations[event.stage] = event.durationMs;
      }
    }

    const timedStages = Object.entries(stageDurations);
    let slowestStage: string | null = null;
    let fastestStage: string | null = null;
    if (timedStages.length > 0) {
      timedStages.sort((a, b) => b[1] - a[1]);
      slowestStage = timedStages[0][0];
      fastestStage = timedStages[timedStages.length - 1][0];
    }

    const failedStages = this.events.filter((e) => e.status === 'Failed').length;
    const warnedStages = this.events.filter((e) => e.status === 'Warning').length;
    const skippedStages = this.events.filter((e) => e.status === 'Warning' && e.details.some((d) => d.includes('skipped'))).length;

    let timelineHealth: EngineeringTimelineHealth = 'healthy';
    if (failedStages > 0) timelineHealth = 'failed';
    else if (warnedStages > 0) timelineHealth = 'degraded';

    const runningEvent = this.events.find((e) => e.status === 'Running');
    const currentStatus = runningEvent?.status ?? this.events.find((e) => e.id === this.currentStageId)?.status ?? 'Waiting';

    const totalEngineeringTimeMs = this.events.reduce((sum, e) => sum + (e.durationMs ?? 0), 0);

    return {
      currentStage: this.currentStageId,
      currentStatus,
      overallProgress,
      totalElapsedTime: Date.now() - this.buildStartMs,
      events: this.events.map((e) => ({ ...e, details: [...e.details] })),
      stageDurations,
      totalEngineeringTimeMs,
      slowestStage,
      fastestStage,
      timelineHealth,
      completionStatistics: {
        totalStages: actionableStages.length,
        completedStages: completedCount,
        failedStages,
        warnedStages,
        skippedStages,
      },
    };
  }

  private findEvent(stageId: string): EngineeringTimelineEvent | undefined {
    return this.events.find((e) => e.id === stageId);
  }

  private emit(): void {
    this.onUpdate?.(this.buildTimeline());
  }
}

export function formatStageDuration(durationMs: number | null): string {
  if (durationMs == null) return '—';
  if (durationMs < 1000) return `${(durationMs / 1000).toFixed(2)} seconds`;
  return `${(durationMs / 1000).toFixed(1)} seconds`;
}
