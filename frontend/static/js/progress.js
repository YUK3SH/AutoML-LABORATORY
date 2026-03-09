/* progress.js — polls /status and shows live execution progress */

const fwProgressEl = document.getElementById('fw-progress');
const currentOpEl  = document.getElementById('current-op');
const elapsedEl    = document.getElementById('elapsed-display');

const frameworks = JSON.parse(sessionStorage.getItem('aml_frameworks') || '["H2O","AutoGluon","TPOT","FLAML"]');
let startTime = Date.now();
let pollInterval;

/* Build UI rows for each framework */
function buildRows() {
  fwProgressEl.innerHTML = '';
  frameworks.forEach(fw => {
    const row = document.createElement('div');
    row.className = 'fw-progress-row';
    row.id = `row-${fw}`;
    row.innerHTML = `
      <span class="fw-progress-name">${fw}</span>
      <div class="fw-progress-bar-wrap"><div class="fw-progress-bar" id="bar-${fw}"></div></div>
      <span class="fw-progress-status" id="status-${fw}">waiting</span>
    `;
    fwProgressEl.appendChild(row);
  });
}

function setRunning(fw) {
  const bar    = document.getElementById(`bar-${fw}`);
  const status = document.getElementById(`status-${fw}`);
  if (!bar || !status) return;
  bar.style.width = '50%';
  status.textContent = 'running…';
  status.className = 'fw-progress-status running';
}

function setDone(fw) {
  const bar    = document.getElementById(`bar-${fw}`);
  const status = document.getElementById(`status-${fw}`);
  if (!bar || !status) return;
  bar.style.width = '100%';
  status.textContent = 'done ✓';
  status.className = 'fw-progress-status done';
}

async function poll() {
  try {
    const res  = await fetch('/status');
    const data = await res.json();

    // Update elapsed
    const sec = Math.floor((Date.now() - startTime) / 1000);
    elapsedEl.textContent = `Elapsed: ${sec}s`;

    // Mark completed
    (data.completed || []).forEach(fw => setDone(fw));

    // Mark current
    if (data.current) {
      setRunning(data.current);
      currentOpEl.textContent = `Running ${data.current}…`;
    }

    if (data.done) {
      clearInterval(pollInterval);
      currentOpEl.textContent = '✓ All frameworks completed! Redirecting…';
      setTimeout(() => { window.location.href = '/results'; }, 1200);
    }

    if (data.error) {
      clearInterval(pollInterval);
      currentOpEl.textContent = `Error: ${data.error}`;
    }

  } catch (err) {
    console.error('Polling error:', err);
  }
}

buildRows();
pollInterval = setInterval(poll, 2000);
poll(); // immediate first call
