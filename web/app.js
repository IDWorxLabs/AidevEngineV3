const promptEl = document.getElementById('prompt');
const buildBtn = document.getElementById('build-btn');
const progressEl = document.getElementById('progress');
const progressTextEl = document.getElementById('progress-text');
const errorEl = document.getElementById('error');
const resultsEl = document.getElementById('results');

const PROGRESS_STEPS = [
  'Generating project...',
  'Installing dependencies...',
  'Building...',
  'Starting preview...',
];

let progressTimer = null;
let progressIndex = 0;

function showProgress() {
  progressIndex = 0;
  progressTextEl.textContent = PROGRESS_STEPS[0];
  progressEl.hidden = false;
  errorEl.hidden = true;
  resultsEl.hidden = true;

  progressTimer = setInterval(() => {
    progressIndex = (progressIndex + 1) % PROGRESS_STEPS.length;
    progressTextEl.textContent = PROGRESS_STEPS[progressIndex];
  }, 2500);
}

function stopProgress() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  progressEl.hidden = true;
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  resultsEl.hidden = true;
}

function renderResults(data) {
  const report = data.report;

  if (!report) {
    showError(data.error || 'Build failed — no report returned.');
    return;
  }

  errorEl.hidden = true;
  resultsEl.hidden = false;

  document.getElementById('status').textContent = report.ok ? 'SUCCESS' : 'FAILED';
  document.getElementById('result-prompt').textContent = report.prompt;
  document.getElementById('app-type').textContent = report.appType;
  document.getElementById('duration').textContent = `${(report.durationMs / 1000).toFixed(1)}s`;
  document.getElementById('project-folder').textContent = report.projectDir;

  const filesList = document.getElementById('generated-files');
  filesList.innerHTML = '';
  for (const file of report.generatedFiles) {
    const li = document.createElement('li');
    li.textContent = file;
    filesList.appendChild(li);
  }

  document.getElementById('install-result').textContent = report.installOk ? 'OK' : 'FAIL';
  document.getElementById('build-result').textContent = report.buildOk ? 'OK' : 'FAIL';

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

  document.getElementById('final-report').textContent = data.reportText || '';

  if (!report.ok && report.error) {
    showError(report.error);
  }
}

buildBtn.addEventListener('click', async () => {
  const prompt = promptEl.value.trim();
  if (!prompt) {
    showError('Please enter a prompt.');
    return;
  }

  buildBtn.disabled = true;
  showProgress();

  try {
    const res = await fetch('/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (!res.ok && !data.report) {
      showError(data.error || `Build request failed (${res.status}).`);
      return;
    }

    renderResults(data);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  } finally {
    stopProgress();
    buildBtn.disabled = false;
  }
});
