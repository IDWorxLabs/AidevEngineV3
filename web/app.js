const promptEl = document.getElementById('prompt');
const buildBtn = document.getElementById('build-btn');
const buildBtnLabel = buildBtn.querySelector('.btn-label');
const buildBtnSpinner = buildBtn.querySelector('.btn-spinner');
const progressEl = document.getElementById('progress');
const errorEl = document.getElementById('error');
const resultsEl = document.getElementById('results');
const understandingEl = document.getElementById('understanding');
const buildPlanEl = document.getElementById('build-plan');
const architectureEl = document.getElementById('architecture');
const architectureGenerationEl = document.getElementById('architecture-generation');
const featureRealityEl = document.getElementById('feature-reality');
const previewVerificationEl = document.getElementById('preview-verification');
const buildLoopEl = document.getElementById('build-loop');
const genericCapabilityEl = document.getElementById('generic-application-capability');
const productQualityEl = document.getElementById('product-quality');
const uiStrategyEl = document.getElementById('ui-strategy');
const workflowIntelligenceEl = document.getElementById('workflow-intelligence');
const productExperienceEl = document.getElementById('product-experience');
const productArchitectureEl = document.getElementById('product-architecture');
const realAppTrialsEl = document.getElementById('real-app-trials');
const engineeringTimelineEl = document.getElementById('engineering-timeline');
const timelineStagesEl = document.getElementById('timeline-stages');
const timelineProgressBar = document.getElementById('timeline-progress-bar');
const timelineProgressLabel = document.getElementById('timeline-progress-label');
const buildSummaryEl = document.getElementById('build-summary');
const buildSummaryContentEl = document.getElementById('build-summary-content');
const buildSummaryActionsEl = document.getElementById('build-summary-actions');
const engineeringTimelineReportEl = document.getElementById('engineering-timeline-report');
const previewCtaEl = document.getElementById('preview-cta');
const previewCtaOpen = document.getElementById('preview-cta-open');
const previewCtaUrl = document.getElementById('preview-cta-url');
const buildMetadataEl = document.getElementById('build-metadata');
const sidebarHintEl = document.getElementById('sidebar-hint');
const previewsPanelEl = document.getElementById('previews-panel');
const previewsListEl = document.getElementById('previews-list');
const quickReportEl = document.getElementById('quick-report');
const timelineIdleEl = document.getElementById('timeline-idle');
const reportDrawerEl = document.getElementById('report-drawer');
const resetWorkspaceBtn = document.getElementById('reset-workspace-btn');
const newBuildBtn = document.getElementById('new-build-btn');

const REPORT_CARD_MAP = [
  ['understanding', 'card-understanding'],
  ['build-plan', 'card-build-plan'],
  ['architecture', 'card-architecture'],
  ['architecture-generation', 'card-architecture-generation'],
  ['feature-reality', 'card-feature-reality'],
  ['product-quality', 'card-product-quality'],
  ['ui-strategy', 'card-ui-strategy'],
  ['workflow-intelligence', 'card-workflow-intelligence'],
  ['product-experience', 'card-product-experience'],
  ['product-architecture', 'card-product-architecture'],
  ['preview-verification', 'card-preview-verification'],
  ['build-loop', 'card-build-loop'],
  ['engineering-timeline-report', 'card-engineering-timeline-report'],
  ['generic-application-capability', 'card-generic-capability'],
  ['real-app-trials', 'card-real-app-trials'],
];

let lastBuildReport = null;
let lastReportText = '';

function setBuildingState(isBuilding) {
  buildBtn.disabled = isBuilding;
  buildBtnSpinner.hidden = !isBuilding;
  buildBtnLabel.textContent = isBuilding ? 'Building Application…' : 'Build Application';
}

function syncReportCards() {
  for (const [sectionId, cardId] of REPORT_CARD_MAP) {
    const section = document.getElementById(sectionId);
    const card = document.getElementById(cardId);
    if (!section || !card) continue;
    const visible = !section.hidden;
    card.hidden = !visible;
    if (visible) card.open = false;
  }

  const filesCard = document.getElementById('card-generated-files');
  const finalCard = document.getElementById('card-final-report');
  if (filesCard) {
    filesCard.hidden = !lastBuildReport;
    if (!filesCard.hidden) filesCard.open = false;
  }
  if (finalCard) {
    finalCard.hidden = !lastBuildReport;
    if (!finalCard.hidden) finalCard.open = false;
  }
}

function openReportDrawer() {
  if (!lastBuildReport) return;
  reportDrawerEl.hidden = false;
  reportDrawerEl.setAttribute('aria-hidden', 'false');
}

function closeReportDrawer() {
  reportDrawerEl.hidden = true;
  reportDrawerEl.setAttribute('aria-hidden', 'true');
}

function resetWorkspaceUI(options = {}) {
  const { clearPrompt = false } = options;

  closeReportDrawer();
  previewsPanelEl.hidden = true;
  errorEl.hidden = true;
  errorEl.textContent = '';

  engineeringTimelineEl.hidden = true;
  timelineIdleEl.hidden = false;
  timelineStagesEl.innerHTML = '';
  timelineProgressBar.style.width = '0%';
  timelineProgressLabel.textContent = '0%';

  buildSummaryEl.hidden = true;
  buildSummaryContentEl.innerHTML = '';
  buildSummaryActionsEl.innerHTML = '';
  previewCtaEl.hidden = true;
  quickReportEl.hidden = true;

  buildMetadataEl.hidden = true;
  sidebarHintEl.hidden = false;

  understandingEl.hidden = true;
  buildPlanEl.hidden = true;
  architectureEl.hidden = true;
  architectureGenerationEl.hidden = true;
  featureRealityEl.hidden = true;
  previewVerificationEl.hidden = true;
  buildLoopEl.hidden = true;
  genericCapabilityEl.hidden = true;
  productQualityEl.hidden = true;
  uiStrategyEl.hidden = true;
  workflowIntelligenceEl.hidden = true;
  productExperienceEl.hidden = true;
  productArchitectureEl.hidden = true;
  realAppTrialsEl.hidden = true;
  engineeringTimelineReportEl.hidden = true;

  if (clearPrompt) {
    promptEl.value = '';
  }

  promptEl.focus();
  syncReportCards();
}

function badgeClass(status) {
  if (!status) return '';
  const value = String(status).toUpperCase();
  if (value === 'PASS' || value === 'SUCCESS') return 'badge pass';
  if (value === 'WARN' || value === 'WARNING') return 'badge warn';
  if (value === 'FAIL' || value === 'FAILED') return 'badge fail';
  return 'badge';
}

function renderSidebarMetrics(report) {
  if (!report) {
    buildMetadataEl.hidden = true;
    sidebarHintEl.hidden = false;
    return;
  }

  buildMetadataEl.hidden = false;
  sidebarHintEl.hidden = true;

  const category =
    report.understanding?.applicationCategory ??
    report.buildPlan?.appName ??
    report.appType;

  document.getElementById('sidebar-status').textContent = report.ok ? 'Ready' : 'Failed';
  document.getElementById('sidebar-app-type').textContent = category;
  document.getElementById('sidebar-ui-strategy').textContent =
    report.uiStrategy?.strategyName ?? report.uiStrategy?.layoutPattern ?? '—';
  document.getElementById('sidebar-experience').textContent =
    report.productExperience?.experienceSummary ?? '—';
  document.getElementById('sidebar-architecture-summary').textContent =
    report.productArchitecture?.architectureSummary ?? '—';
  document.getElementById('sidebar-preview-ready').textContent = report.previewUrl ? 'Yes' : 'No';

  document.getElementById('sidebar-duration').textContent = `${(report.durationMs / 1000).toFixed(1)}s`;
  document.getElementById('sidebar-ready').textContent = report.ok ? 'Yes' : 'No';

  const previewStatus = report.previewVerification?.status ?? '—';
  const previewEl = document.getElementById('sidebar-preview-verification');
  previewEl.textContent = previewStatus;
  previewEl.className = `metric-value ${badgeClass(previewStatus)}`;

  const featureStatus = report.featureReality?.status ?? '—';
  const featureEl = document.getElementById('sidebar-feature-reality');
  featureEl.textContent = featureStatus;
  featureEl.className = `metric-value ${badgeClass(featureStatus)}`;

  document.getElementById('sidebar-product-quality').textContent =
    report.productQuality != null ? report.productQuality.qualityScore.toFixed(2) : '—';

  const loopStatus = report.buildLoop?.status ?? '—';
  const loopEl = document.getElementById('sidebar-build-loop');
  loopEl.textContent = loopStatus;
  loopEl.className = `metric-value ${badgeClass(loopStatus)}`;
}

function renderPreviewCta(report) {
  if (!report?.ok || !report.previewUrl) {
    previewCtaEl.hidden = true;
    return;
  }

  previewCtaEl.hidden = false;
  previewCtaOpen.href = report.previewUrl;
  previewCtaUrl.textContent = report.previewUrl;
}

async function showPreviewsPanel() {
  try {
    const res = await fetch('/previews');
    const data = await res.json();
    previewsListEl.innerHTML = '';

    if (!data.previews || data.previews.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No active previews yet.';
      previewsListEl.appendChild(li);
    } else {
      for (const preview of data.previews) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = preview.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = preview.url;
        li.appendChild(link);
        previewsListEl.appendChild(li);
      }
    }

    previewsPanelEl.hidden = false;
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  }
}

function showTimelineBuild() {
  errorEl.hidden = true;
  closeReportDrawer();
  quickReportEl.hidden = true;
  buildSummaryEl.hidden = true;
  previewCtaEl.hidden = true;
  understandingEl.hidden = true;
  buildPlanEl.hidden = true;
  architectureEl.hidden = true;
  architectureGenerationEl.hidden = true;
  featureRealityEl.hidden = true;
  previewVerificationEl.hidden = true;
  buildLoopEl.hidden = true;
  genericCapabilityEl.hidden = true;
  productQualityEl.hidden = true;
  uiStrategyEl.hidden = true;
  workflowIntelligenceEl.hidden = true;
  productExperienceEl.hidden = true;
  productArchitectureEl.hidden = true;
  realAppTrialsEl.hidden = true;
  engineeringTimelineReportEl.hidden = true;
  timelineIdleEl.hidden = true;
  engineeringTimelineEl.hidden = false;
  timelineStagesEl.innerHTML = '';
  timelineProgressBar.style.width = '0%';
  timelineProgressLabel.textContent = '0%';
  progressEl.hidden = true;
  buildMetadataEl.hidden = true;
  sidebarHintEl.hidden = false;
  syncReportCards();
}

function statusMarkerClass(status) {
  switch (status) {
    case 'Success':
      return 'success';
    case 'Warning':
      return 'warning';
    case 'Failed':
      return 'failed';
    case 'Running':
      return 'running';
    default:
      return 'waiting';
  }
}

function statusSymbol(status) {
  switch (status) {
    case 'Success':
    case 'Warning':
      return '✓';
    case 'Failed':
      return '✗';
    case 'Running':
      return '●';
    default:
      return '○';
  }
}

function itemStateClass(status) {
  switch (status) {
    case 'Success':
      return 'is-success is-complete';
    case 'Warning':
      return 'is-success is-complete';
    case 'Failed':
      return 'is-failed';
    case 'Running':
      return 'is-running';
    default:
      return 'is-waiting';
  }
}

const STAGE_ICONS = {
  understanding: '🧠',
  'build-planning': '📋',
  'architecture-planning': '🏗',
  'architecture-guided-generation': '⚙',
  'feature-reality': '✓',
  'workspace-generation': '📁',
  'dependency-installation': '📦',
  'compile-build': '🔨',
  'preview-startup': '🚀',
  'preview-verification': '🔍',
  'build-complete': '✅',
};

function stageIcon(event) {
  if (STAGE_ICONS[event.stage]) return STAGE_ICONS[event.stage];
  const fromTitle = event.title?.trim().charAt(0);
  return fromTitle && /\p{Extended_Pictographic}/u.test(fromTitle) ? fromTitle : '•';
}

function formatDurationMs(durationMs) {
  if (durationMs == null) return '';
  if (durationMs < 1000) return `${(durationMs / 1000).toFixed(2)} seconds`;
  return `${(durationMs / 1000).toFixed(1)} seconds`;
}

function updateTimelineProgress(timeline) {
  const progress = Math.round((timeline?.overallProgress ?? 0) * 100);
  timelineProgressBar.style.width = `${progress}%`;
  timelineProgressLabel.textContent = `${progress}%`;
  timelineProgressBar.parentElement?.setAttribute('aria-valuenow', String(progress));
}

function renderEngineeringTimeline(timeline) {
  if (!timeline || !timeline.events) {
    engineeringTimelineEl.hidden = true;
    timelineIdleEl.hidden = false;
    return;
  }

  timelineIdleEl.hidden = true;
  engineeringTimelineEl.hidden = false;
  updateTimelineProgress(timeline);
  timelineStagesEl.innerHTML = '';

  timeline.events.forEach((event) => {
    const item = document.createElement('div');
    item.className = `timeline-item ${itemStateClass(event.status)}`;

    const rail = document.createElement('div');
    rail.className = 'timeline-rail';

    const marker = document.createElement('div');
    marker.className = `timeline-marker ${statusMarkerClass(event.status)}`;
    marker.textContent = stageIcon(event);
    marker.setAttribute('aria-label', `${event.title} — ${event.status}`);
    rail.appendChild(marker);

    const body = document.createElement('div');
    body.className = 'timeline-body';

    const title = document.createElement('p');
    title.className = `timeline-title${event.status === 'Running' ? ' running' : ''}`;
    title.textContent = event.title.replace(/^[\p{Extended_Pictographic}\s]+/u, '').trim() || event.title;
    body.appendChild(title);

    const statusLine = document.createElement('p');
    statusLine.className = `timeline-status-line${event.status === 'Running' ? ' running' : ''}`;
    if (event.status === 'Running') {
      statusLine.textContent = 'Running';
    } else if (event.status === 'Waiting') {
      statusLine.textContent = 'Waiting';
    } else if (event.status === 'Failed') {
      statusLine.textContent = 'Failed';
    } else {
      statusLine.textContent = 'Complete';
    }
    body.appendChild(statusLine);

    const stageProgress = document.createElement('div');
    stageProgress.className = 'timeline-stage-progress';
    stageProgress.setAttribute('role', 'progressbar');
    stageProgress.setAttribute('aria-valuemin', '0');
    stageProgress.setAttribute('aria-valuemax', '100');
    const stageProgressBar = document.createElement('div');
    stageProgressBar.className = 'timeline-stage-progress-bar';
    if (event.status === 'Success' || event.status === 'Warning') {
      stageProgressBar.style.width = '100%';
      stageProgress.setAttribute('aria-valuenow', '100');
    } else if (event.status === 'Running') {
      stageProgressBar.style.width = '55%';
      stageProgress.setAttribute('aria-valuenow', '55');
    } else if (event.status === 'Failed') {
      stageProgressBar.style.width = '100%';
      stageProgressBar.classList.add('failed');
      stageProgress.setAttribute('aria-valuenow', '100');
    } else {
      stageProgressBar.style.width = '0%';
      stageProgress.setAttribute('aria-valuenow', '0');
    }
    stageProgress.appendChild(stageProgressBar);
    body.appendChild(stageProgress);

    if (event.durationMs != null && event.status !== 'Waiting' && event.status !== 'Running') {
      const duration = document.createElement('p');
      duration.className = 'timeline-duration';
      duration.textContent = formatDurationMs(event.durationMs);
      body.appendChild(duration);
    }

    if (event.details && event.details.length > 0 && event.status !== 'Waiting') {
      const details = document.createElement('details');
      details.className = 'timeline-details';
      const summary = document.createElement('summary');
      summary.textContent = 'Stage details';
      details.appendChild(summary);
      const ul = document.createElement('ul');
      for (const line of event.details) {
        const li = document.createElement('li');
        li.textContent = line;
        ul.appendChild(li);
      }
      details.appendChild(ul);
      body.appendChild(details);
    }

    item.appendChild(rail);
    item.appendChild(body);
    timelineStagesEl.appendChild(item);
  });
}

function renderEngineeringTimelineReport(timeline) {
  if (!timeline) {
    engineeringTimelineReportEl.hidden = true;
    syncReportCards();
    return;
  }

  engineeringTimelineReportEl.hidden = false;
  document.getElementById('timeline-overall-progress').textContent = `${(timeline.overallProgress * 100).toFixed(0)}%`;
  document.getElementById('timeline-engineering-time').textContent = `${(timeline.totalEngineeringTimeMs / 1000).toFixed(1)}s`;
  document.getElementById('timeline-health').textContent = timeline.timelineHealth;
  document.getElementById('timeline-slowest').textContent = timeline.slowestStage ?? '—';
  document.getElementById('timeline-fastest').textContent = timeline.fastestStage ?? '—';

  const historyEl = document.getElementById('timeline-stage-history');
  historyEl.innerHTML = '';
  const ul = document.createElement('ul');
  for (const event of timeline.events) {
    const li = document.createElement('li');
    const duration = event.durationMs != null ? ` (${formatDurationMs(event.durationMs)})` : '';
    li.textContent = `${event.title}: ${event.status}${duration}`;
    ul.appendChild(li);
  }
  historyEl.appendChild(ul);
  syncReportCards();
}

function renderQuickReport(report) {
  if (!report?.ok) {
    quickReportEl.hidden = true;
    return;
  }

  quickReportEl.hidden = false;
  const appName = report.buildPlan?.appName ?? report.understanding?.suggestedAppName ?? report.appType;
  document.getElementById('quick-app-name').textContent = appName;
  document.getElementById('quick-preview-status').textContent =
    report.previewVerification?.status ?? (report.previewUrl ? 'Available' : 'Unavailable');
  document.getElementById('quick-project-folder').textContent = report.projectDir || '—';
  document.getElementById('quick-build-time').textContent = `${(report.durationMs / 1000).toFixed(1)}s`;

  const quickPreview = document.getElementById('quick-open-preview');
  const quickFolder = document.getElementById('quick-open-folder');

  if (report.previewUrl) {
    quickPreview.hidden = false;
    quickPreview.href = report.previewUrl;
  } else {
    quickPreview.hidden = true;
  }

  if (report.projectDir) {
    quickFolder.hidden = false;
    quickFolder.onclick = () => {
      navigator.clipboard?.writeText(report.projectDir);
      quickFolder.textContent = 'Path copied!';
      setTimeout(() => { quickFolder.textContent = 'Copy Project Path'; }, 2000);
    };
  } else {
    quickFolder.hidden = true;
  }
}

function renderBuildSummary(report) {
  if (!report) {
    buildSummaryEl.hidden = true;
    return;
  }

  buildSummaryEl.hidden = false;
  buildSummaryEl.className = `card build-summary sidebar-ready-panel celebration-card ${report.ok ? 'success' : 'failed'}`;
  buildSummaryContentEl.innerHTML = '';
  buildSummaryActionsEl.innerHTML = '';

  const heading = document.createElement('h2');
  heading.className = 'celebration-title';
  heading.textContent = report.ok ? '🎉 Application Ready' : '❌ Build Failed';
  buildSummaryContentEl.appendChild(heading);

  const appName = report.buildPlan?.appName ?? report.understanding?.suggestedAppName ?? report.appType;

  const grid = document.createElement('dl');
  grid.className = 'build-summary-grid';

  const fields = report.ok
    ? [
        ['Application Name', appName],
        ['Build Time', `${(report.durationMs / 1000).toFixed(1)} seconds`],
        ['Preview Status', report.previewVerification?.status ?? '—'],
        ['Overall Result', report.ok ? 'Success' : 'Failed'],
      ]
    : [
        ['Failed Stage', report.engineeringTimeline?.currentStage ?? report.buildLoop?.failedStage ?? '—'],
        ['Failure Reason', report.error ?? 'Unknown error'],
      ];

  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    grid.appendChild(dt);
    grid.appendChild(dd);
  }

  buildSummaryContentEl.appendChild(grid);

  if (report.ok) {
    const primaryActions = document.createElement('div');
    primaryActions.className = 'build-summary-actions-primary';

    if (report.previewUrl) {
      const previewBtn = document.createElement('a');
      previewBtn.href = report.previewUrl;
      previewBtn.target = '_blank';
      previewBtn.rel = 'noopener noreferrer';
      previewBtn.className = 'btn-link btn-primary';
      previewBtn.textContent = 'Open Preview';
      primaryActions.appendChild(previewBtn);
    }

    const folderBtn = document.createElement('button');
    folderBtn.type = 'button';
    folderBtn.className = 'btn-primary';
    folderBtn.textContent = 'Open Project Folder';
    folderBtn.title = report.projectDir;
    folderBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(report.projectDir);
      folderBtn.textContent = 'Path copied!';
      setTimeout(() => { folderBtn.textContent = 'Open Project Folder'; }, 2000);
    });
    primaryActions.appendChild(folderBtn);

    const anotherBtn = document.createElement('button');
    anotherBtn.type = 'button';
    anotherBtn.className = 'btn-primary';
    anotherBtn.textContent = 'Build Another App';
    anotherBtn.addEventListener('click', () => resetWorkspaceUI({ clearPrompt: false }));
    primaryActions.appendChild(anotherBtn);
    buildSummaryActionsEl.appendChild(primaryActions);

    const secondaryActions = document.createElement('div');
    secondaryActions.className = 'build-summary-actions-secondary';

    const reportBtn = document.createElement('button');
    reportBtn.type = 'button';
    reportBtn.className = 'btn-secondary';
    reportBtn.textContent = 'Engineering Report';
    reportBtn.addEventListener('click', openReportDrawer);
    secondaryActions.appendChild(reportBtn);

    const previewsBtn = document.createElement('button');
    previewsBtn.type = 'button';
    previewsBtn.className = 'btn-secondary';
    previewsBtn.textContent = 'View All Previews';
    previewsBtn.addEventListener('click', showPreviewsPanel);
    secondaryActions.appendChild(previewsBtn);
    buildSummaryActionsEl.appendChild(secondaryActions);
  } else {
    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'btn-primary';
    retryBtn.textContent = 'Retry Build';
    retryBtn.addEventListener('click', () => buildBtn.click());
    buildSummaryActionsEl.appendChild(retryBtn);

    const logsBtn = document.createElement('button');
    logsBtn.type = 'button';
    logsBtn.className = 'btn-secondary';
    logsBtn.textContent = 'View Logs';
    logsBtn.addEventListener('click', () => {
      openReportDrawer();
      document.getElementById('card-final-report').open = true;
    });
    buildSummaryActionsEl.appendChild(logsBtn);

    const reportBtn = document.createElement('button');
    reportBtn.type = 'button';
    reportBtn.className = 'btn-secondary';
    reportBtn.textContent = 'View Report';
    reportBtn.addEventListener('click', openReportDrawer);
    buildSummaryActionsEl.appendChild(reportBtn);
  }
}

async function parseStreamBuild(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalPayload = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;

      let eventType = 'message';
      let dataLine = '';

      for (const line of chunk.split('\n')) {
        if (line.startsWith('event: ')) eventType = line.slice(7).trim();
        else if (line.startsWith('data: ')) dataLine = line.slice(6);
      }

      if (!dataLine) continue;

      const payload = JSON.parse(dataLine);

      if (eventType === 'timeline' && payload.timeline) {
        renderEngineeringTimeline(payload.timeline);
      }

      if (eventType === 'complete') {
        finalPayload = payload;
        if (payload.report?.engineeringTimeline) {
          renderEngineeringTimeline(payload.report.engineeringTimeline);
        }
      }
    }
  }

  return finalPayload;
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function renderList(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const ul = document.createElement('ul');
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  }
  container.appendChild(ul);
}

function renderUnderstanding(understanding) {
  if (!understanding) {
    understandingEl.hidden = true;
    syncReportCards();
    return;
  }

  understandingEl.hidden = false;
  document.getElementById('understanding-intent').textContent = understanding.detectedIntent;
  document.getElementById('understanding-app-name').textContent = understanding.suggestedAppName;
  renderList('understanding-features', understanding.detectedFeatures ?? []);
  document.getElementById('understanding-confidence').textContent = understanding.confidence.toFixed(2);
  document.getElementById('understanding-supported').textContent = understanding.supported
    ? 'Supported'
    : 'Not supported';
  syncReportCards();
}

function renderBuildPlan(plan, isDraft = false) {
  if (!plan) {
    buildPlanEl.hidden = true;
    syncReportCards();
    return;
  }

  buildPlanEl.hidden = false;
  document.getElementById('build-plan-title').textContent = isDraft ? 'Draft Build Plan' : 'Build Plan';
  document.getElementById('plan-app-name').textContent = plan.appName;
  renderList('plan-features', plan.features);
  renderList('plan-pages', plan.pages);
  renderList('plan-components', plan.components);
  renderList('plan-structure', plan.projectStructure);
  renderList('plan-stack', plan.stack);
  syncReportCards();
}

function renderArchitecture(architecture) {
  if (!architecture) {
    architectureEl.hidden = true;
    syncReportCards();
    return;
  }

  architectureEl.hidden = false;
  document.getElementById('arch-project-type').textContent = architecture.projectType;
  renderList('arch-stack', architecture.recommendedStack ?? []);
  renderList('arch-folders', architecture.folders ?? []);
  renderList('arch-files', architecture.files ?? []);
  renderList('arch-components', architecture.components ?? []);
  renderList('arch-pages', architecture.pages ?? []);
  document.getElementById('arch-state').textContent = architecture.stateManagement;
  document.getElementById('arch-routing').textContent = architecture.routing;
  document.getElementById('arch-data-layer').textContent = architecture.dataLayer;
  document.getElementById('arch-styling').textContent = architecture.styling;
  document.getElementById('arch-testing').textContent = architecture.testingStrategy;
  syncReportCards();
}

function renderArchitectureGeneration(generation) {
  if (!generation) {
    architectureGenerationEl.hidden = true;
    syncReportCards();
    return;
  }

  architectureGenerationEl.hidden = false;
  document.getElementById('arch-gen-applied').textContent = generation.applied ? 'yes' : 'no';
  renderList('arch-gen-components', generation.componentsGenerated ?? []);
  renderList('arch-gen-pages', generation.pagesGenerated ?? []);
  renderList('arch-gen-services', generation.servicesGenerated ?? []);
  renderList('arch-gen-structure', generation.foldersCreated ?? []);
  syncReportCards();
}

function renderFeatureReality(reality) {
  if (!reality) {
    featureRealityEl.hidden = true;
    syncReportCards();
    return;
  }

  featureRealityEl.hidden = false;
  document.getElementById('feature-reality-status').textContent = reality.status;
  document.getElementById('feature-reality-confidence').textContent = reality.confidenceScore.toFixed(2);
  renderList('feature-reality-requested', reality.requestedFeatures ?? []);
  renderList('feature-reality-generated', reality.generatedFeatureEvidence ?? []);
  renderList('feature-reality-rendered', reality.renderedFeatureEvidence ?? []);
  renderList('feature-reality-missing', reality.missingFeatures ?? []);
  syncReportCards();
}

function renderUiStrategy(uiStrategy) {
  if (!uiStrategy) {
    uiStrategyEl.hidden = true;
    syncReportCards();
    return;
  }

  uiStrategyEl.hidden = false;
  document.getElementById('ui-strategy-name').textContent =
    `${uiStrategy.strategyName} (${uiStrategy.strategyId})`;
  document.getElementById('ui-strategy-layout-pattern').textContent = uiStrategy.layoutPattern;
  document.getElementById('ui-strategy-primary-goal').textContent = uiStrategy.primaryUserGoal;
  document.getElementById('ui-strategy-reason').textContent = uiStrategy.selectionReason;
  document.getElementById('ui-strategy-primary-surface').textContent = uiStrategy.primarySurface;
  document.getElementById('ui-strategy-interaction').textContent = uiStrategy.interactionModel;
  renderList('ui-strategy-components', uiStrategy.generatedLayoutComponents ?? []);
  syncReportCards();
}

function renderWorkflowIntelligence(workflow) {
  if (!workflow) {
    workflowIntelligenceEl.hidden = true;
    syncReportCards();
    return;
  }

  workflowIntelligenceEl.hidden = false;
  document.getElementById('workflow-application-goal').textContent = workflow.applicationGoal;
  document.getElementById('workflow-primary-actor').textContent = workflow.primaryActor;
  document.getElementById('workflow-primary-workflow').textContent = workflow.primaryWorkflow;
  document.getElementById('workflow-navigation-model').textContent = workflow.navigationModel;
  document.getElementById('workflow-entry-screen').textContent = workflow.entryScreen;
  document.getElementById('workflow-completion-screen').textContent = workflow.completionScreen;
  document.getElementById('workflow-confidence').textContent = workflow.workflowConfidence.toFixed(2);
  renderList('workflow-secondary-workflows', workflow.secondaryWorkflows ?? []);
  renderList('workflow-steps', workflow.workflowSteps ?? []);
  renderList('workflow-critical-actions', workflow.criticalActions ?? []);
  renderList('workflow-interaction-patterns', workflow.interactionPatterns ?? []);
  renderList('workflow-screen-priorities', workflow.screenPriorities ?? []);
  renderList('workflow-data-flow', workflow.dataFlow ?? []);
  renderList('workflow-success-criteria', workflow.successCriteria ?? []);
  syncReportCards();
}

function renderProductExperience(experience) {
  if (!experience) {
    productExperienceEl.hidden = true;
    syncReportCards();
    return;
  }

  productExperienceEl.hidden = false;
  document.getElementById('pxie-experience-goal').textContent = experience.experienceGoal;
  document.getElementById('pxie-primary-emotion').textContent = experience.primaryUserEmotion;
  document.getElementById('pxie-empty-state').textContent = experience.emptyStateStrategy;
  document.getElementById('pxie-loading-state').textContent = experience.loadingStateStrategy;
  document.getElementById('pxie-error-state').textContent = experience.errorStateStrategy;
  document.getElementById('pxie-success-state').textContent = experience.successStateStrategy;
  document.getElementById('pxie-confidence').textContent = experience.experienceConfidence.toFixed(2);
  renderList('pxie-information-hierarchy', experience.informationHierarchy ?? []);
  renderList('pxie-visual-hierarchy', experience.visualHierarchy ?? []);
  renderList('pxie-attention-flow', experience.attentionFlow ?? []);
  renderList('pxie-cta-hierarchy', experience.ctaHierarchy ?? []);
  renderList('pxie-feedback-model', experience.feedbackModel ?? []);
  renderList('pxie-microcopy', experience.microcopyGuidelines ?? []);
  renderList('pxie-dashboard-emphasis', experience.dashboardEmphasis ?? []);
  renderList('pxie-trust-signals', experience.trustSignals ?? []);
  renderList('pxie-friction-reduction', experience.frictionReduction ?? []);
  renderList('pxie-accessibility', experience.accessibilityGuidance ?? []);
  syncReportCards();
}

function renderProductArchitecture(architecture) {
  if (!architecture) {
    productArchitectureEl.hidden = true;
    syncReportCards();
    return;
  }

  productArchitectureEl.hidden = false;
  document.getElementById('paie-product-type').textContent = architecture.productType;
  document.getElementById('paie-product-goal').textContent = architecture.productGoal;
  document.getElementById('paie-confidence').textContent = architecture.architectureConfidence.toFixed(2);
  renderList('paie-primary-modules', architecture.primaryModules ?? []);
  renderList('paie-secondary-modules', architecture.secondaryModules ?? []);
  renderList('paie-admin-modules', architecture.adminModules ?? []);
  renderList('paie-settings-modules', architecture.settingsModules ?? []);
  renderList('paie-user-roles', architecture.userRoles ?? []);
  renderList('paie-permission-model', architecture.permissionModel ?? []);
  renderList('paie-data-entities', architecture.dataEntities ?? []);
  renderList('paie-entity-relationships', architecture.entityRelationships ?? []);
  renderList('paie-product-boundaries', architecture.productBoundaries ?? []);
  renderList('paie-navigation-architecture', architecture.navigationArchitecture ?? []);
  renderList('paie-notification-model', architecture.notificationModel ?? []);
  renderList('paie-integration-readiness', architecture.integrationReadiness ?? []);
  renderList('paie-extensibility-plan', architecture.extensibilityPlan ?? []);
  renderList('paie-risk-areas', architecture.riskAreas ?? []);
  renderList('paie-future-capabilities', architecture.futureCapabilities ?? []);
  syncReportCards();
}

function renderProductQuality(quality) {
  if (!quality) {
    productQualityEl.hidden = true;
    syncReportCards();
    return;
  }

  productQualityEl.hidden = false;
  document.getElementById('product-quality-score').textContent = quality.qualityScore.toFixed(2);
  document.getElementById('product-quality-responsive').textContent = quality.responsiveLayout ? 'yes' : 'no';
  renderList('product-quality-design', quality.designComponents ?? []);
  renderList('product-quality-accessibility', quality.accessibilityFeatures ?? []);
  renderList('product-quality-crud', quality.crudUxFeatures ?? []);
  renderList('product-quality-layout', quality.layoutFeatures ?? []);
  syncReportCards();
}

function renderPreviewVerification(verification) {
  if (!verification) {
    previewVerificationEl.hidden = true;
    syncReportCards();
    return;
  }

  previewVerificationEl.hidden = false;
  document.getElementById('preview-verification-status').textContent = verification.status;
  document.getElementById('preview-verification-http-reachable').textContent = verification.httpReachable ? 'yes' : 'no';
  document.getElementById('preview-verification-rendered').textContent = verification.applicationRendered ? 'yes' : 'no';
  document.getElementById('preview-verification-duration').textContent =
    `${(verification.verificationDurationMs / 1000).toFixed(1)}s (startup ${(verification.previewStartupMs / 1000).toFixed(1)}s)`;
  document.getElementById('preview-verification-http-status').textContent = verification.httpStatus ?? '—';
  document.getElementById('preview-verification-verdict').textContent = verification.status;
  renderList('preview-verification-evidence', verification.evidence ?? []);
  renderList('preview-verification-warnings', verification.warnings ?? []);

  const previewUrlEl = document.getElementById('preview-verification-url');
  previewUrlEl.innerHTML = '';
  if (verification.previewUrl) {
    const link = document.createElement('a');
    link.href = verification.previewUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = verification.previewUrl;
    previewUrlEl.appendChild(link);
  } else {
    previewUrlEl.textContent = '—';
  }
  syncReportCards();
}

function renderGenericApplicationCapability(capabilities) {
  if (!capabilities) {
    genericCapabilityEl.hidden = true;
    syncReportCards();
    return;
  }

  genericCapabilityEl.hidden = false;
  document.getElementById('generic-capability-score').textContent = capabilities.capabilityScore.toFixed(2);
  renderList('generic-ui-patterns', capabilities.uiPatterns ?? []);
  renderList('generic-data-patterns', capabilities.dataPatterns ?? []);
  renderList('generic-crud-capabilities', capabilities.crudCapabilities ?? []);
  syncReportCards();
}

function renderBuildLoop(buildLoop) {
  if (!buildLoop) {
    buildLoopEl.hidden = true;
    syncReportCards();
    return;
  }

  buildLoopEl.hidden = false;

  const stages = buildLoop.stageResults ?? [];
  const lastStage = stages.length > 0 ? stages[stages.length - 1].stageName : '—';
  const completedStages = stages
    .filter((stage) => stage.result === 'pass' || stage.result === 'warn')
    .map((stage) => stage.stageName);

  document.getElementById('build-loop-current-stage').textContent = lastStage;
  renderList('build-loop-stages', completedStages);
  document.getElementById('build-loop-duration').textContent = `${(buildLoop.elapsedTimeMs / 1000).toFixed(1)}s`;
  document.getElementById('build-loop-verification').textContent = buildLoop.previewVerified
    ? 'verified'
    : buildLoop.previewStarted
      ? 'not verified'
      : 'skipped';
  document.getElementById('build-loop-verdict').textContent = buildLoop.status;
  renderList('build-loop-warnings', buildLoop.warnings ?? []);

  const previewEl = document.getElementById('build-loop-preview-url');
  previewEl.innerHTML = '';
  if (buildLoop.previewUrl) {
    const link = document.createElement('a');
    link.href = buildLoop.previewUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = buildLoop.previewUrl;
    previewEl.appendChild(link);
  } else {
    previewEl.textContent = '—';
  }
  syncReportCards();
}

function renderRealAppTrials(trialResults) {
  if (!trialResults || trialResults.length === 0) {
    realAppTrialsEl.hidden = true;
    syncReportCards();
    return;
  }

  realAppTrialsEl.hidden = false;

  const passed = trialResults.filter((trial) => trial.verdict === 'PASS').length;
  const warned = trialResults.filter((trial) => trial.verdict === 'WARN').length;
  const failed = trialResults.filter((trial) => trial.verdict === 'FAIL').length;
  const previewPassed = trialResults.filter((trial) => trial.previewVerificationStatus === 'PASS').length;
  const previewWarned = trialResults.filter((trial) => trial.previewVerificationStatus === 'WARN').length;
  const previewFailed = trialResults.filter((trial) => trial.previewVerificationStatus === 'FAIL').length;
  const averageMs = trialResults.reduce((sum, trial) => sum + trial.durationMs, 0) / trialResults.length;
  const successRate = ((passed + warned) / trialResults.length) * 100;

  document.getElementById('trial-summary').textContent =
    `${trialResults.length} apps — ${passed} passed, ${warned} warned, ${failed} failed; preview ${previewPassed}/${previewWarned}/${previewFailed} pass/warn/fail`;
  document.getElementById('trial-success-rate').textContent = `${successRate.toFixed(0)}%`;
  document.getElementById('trial-average-time').textContent = `${(averageMs / 1000).toFixed(1)}s`;

  const container = document.getElementById('trial-applications');
  container.innerHTML = '';

  for (const trial of trialResults) {
    const details = document.createElement('details');
    details.className = 'trial-item';

    const summary = document.createElement('summary');
    summary.textContent = `${trial.applicationType} — ${trial.verdict} (Preview: ${trial.previewVerificationStatus})`;
    details.appendChild(summary);

    const body = document.createElement('div');
    body.className = 'trial-details';

    const lines = [
      `Feature Reality: ${trial.featureRealityStatus}`,
      `Preview Verification: ${trial.previewVerificationStatus}`,
      `Build Loop: ${trial.buildLoopStatus}`,
      `Preview URL: ${trial.previewUrl ?? '—'}`,
      `Duration: ${(trial.durationMs / 1000).toFixed(1)}s`,
      `Engineering Time: ${(trial.totalEngineeringTimeMs / 1000).toFixed(1)}s`,
      `Slowest Stage: ${trial.slowestStage ?? '—'}`,
      `Fastest Stage: ${trial.fastestStage ?? '—'}`,
    ];

    if (trial.warnings.length > 0) {
      lines.push(`Warnings: ${trial.warnings.join('; ')}`);
    }

    for (const line of lines) {
      const p = document.createElement('p');
      p.textContent = line;
      body.appendChild(p);
    }

    if (trial.previewUrl) {
      const link = document.createElement('a');
      link.href = trial.previewUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Open preview';
      body.appendChild(link);
    }

    details.appendChild(body);
    container.appendChild(details);
  }
  syncReportCards();
}

function populateReportMetadata(report, reportText) {
  document.getElementById('status').textContent = report.ok ? 'SUCCESS' : 'FAILED';
  document.getElementById('result-prompt').textContent = report.prompt;
  document.getElementById('app-type').textContent = report.appType;
  document.getElementById('generation-mode').textContent = report.generationMode || '—';
  document.getElementById('duration').textContent = `${(report.durationMs / 1000).toFixed(1)}s`;
  document.getElementById('project-folder').textContent = report.projectDir || '—';
  document.getElementById('install-result').textContent = report.installOk ? 'OK' : 'FAIL';
  document.getElementById('build-result').textContent = report.buildOk ? 'OK' : 'FAIL';
  document.getElementById('final-report').textContent = reportText || '';

  const filesList = document.getElementById('generated-files');
  filesList.innerHTML = '';
  for (const file of report.generatedFiles ?? []) {
    const li = document.createElement('li');
    li.textContent = file;
    filesList.appendChild(li);
  }

  const previewEl = document.getElementById('preview-url');
  previewEl.innerHTML = '';
  if (report.previewUrl) {
    const link = document.createElement('a');
    link.href = report.previewUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = report.previewUrl;
    previewEl.appendChild(link);
  } else {
    previewEl.textContent = '—';
  }
}

function renderResults(data) {
  const report = data.report;

  if (!report) {
    showError(data.error || 'Build failed — no report returned.');
    understandingEl.hidden = true;
    syncReportCards();
    return;
  }

  timelineIdleEl.hidden = true;
  renderEngineeringTimelineReport(report.engineeringTimeline);
  renderBuildSummary(report);
  renderQuickReport(report);
  renderPreviewCta(report);
  renderSidebarMetrics(report);
  renderUnderstanding(report.understanding);

  const isDraft = report.understanding && !report.understanding.supported;
  renderBuildPlan(report.buildPlan, isDraft);
  renderArchitecture(report.architecturePlan);
  renderArchitectureGeneration(report.architectureGeneration);
  renderFeatureReality(report.featureReality);
  renderGenericApplicationCapability(report.genericApplicationCapabilities);
  renderProductQuality(report.productQuality);
  renderUiStrategy(report.uiStrategy);
  renderWorkflowIntelligence(report.workflowIntelligence);
  renderProductExperience(report.productExperience);
  renderProductArchitecture(report.productArchitecture);
  renderBuildLoop(report.buildLoop);
  renderPreviewVerification(report.previewVerification);
  renderRealAppTrials(report.realAppTrialResults);
  populateReportMetadata(report, data.reportText || '');

  if (!report.ok) {
    showError(report.error || 'Build failed.');
  } else {
    errorEl.hidden = true;
  }

  syncReportCards();
}

for (const chip of document.querySelectorAll('.prompt-chip')) {
  chip.addEventListener('click', () => {
    promptEl.value = chip.getAttribute('data-prompt') ?? '';
    promptEl.focus();
  });
}

document.getElementById('view-previews-btn').addEventListener('click', showPreviewsPanel);
document.getElementById('preview-cta-all').addEventListener('click', showPreviewsPanel);
document.getElementById('close-previews-panel').addEventListener('click', () => {
  previewsPanelEl.hidden = true;
});
document.getElementById('close-report-drawer').addEventListener('click', closeReportDrawer);
document.getElementById('report-drawer-backdrop').addEventListener('click', closeReportDrawer);
resetWorkspaceBtn.addEventListener('click', () => resetWorkspaceUI({ clearPrompt: true }));
newBuildBtn.addEventListener('click', () => resetWorkspaceUI({ clearPrompt: false }));

buildBtn.addEventListener('click', async () => {
  const prompt = promptEl.value.trim();
  if (!prompt) {
    showError('Please enter a prompt.');
    return;
  }

  setBuildingState(true);
  showTimelineBuild();
  lastBuildReport = null;
  lastReportText = '';

  try {
    const res = await fetch('/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ prompt, stream: true }),
    });

    let data;
    const contentType = res.headers.get('content-type') ?? '';

    if (contentType.includes('text/event-stream')) {
      data = await parseStreamBuild(res);
      if (!data) {
        showError('Build stream ended without a final report.');
        return;
      }
    } else {
      data = await res.json();
      if (data.report?.engineeringTimeline) {
        renderEngineeringTimeline(data.report.engineeringTimeline);
      }
    }

    lastBuildReport = data.report;
    lastReportText = data.reportText ?? '';

    if (!res.ok && !data.report) {
      showError(data.error || `Build request failed (${res.status}).`);
      return;
    }

    renderResults(data);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  } finally {
    setBuildingState(false);
  }
});
