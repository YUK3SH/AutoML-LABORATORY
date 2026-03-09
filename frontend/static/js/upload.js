/* upload.js — CSV upload, column selection, framework toggle, run trigger */

const dropZone   = document.getElementById('drop-zone');
const fileInput  = document.getElementById('file-input');
const fileInfo   = document.getElementById('file-info');
const fileBadge  = document.getElementById('file-badge');
const fileMeta   = document.getElementById('file-meta');
const uploadErr  = document.getElementById('upload-error');
const step2      = document.getElementById('step2');
const targetSel  = document.getElementById('target-col');
const previewBlk = document.getElementById('preview-block');
const previewTbl = document.getElementById('preview-table');
const btnRun     = document.getElementById('btn-run');
const configErr  = document.getElementById('config-error');

let uploadedFilename = null;

/* ── Drag & Drop ─────────────────────────────────────────── */
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

function handleFile(file) {
  if (!file.name.endsWith('.csv')) {
    showError(uploadErr, 'Only CSV files are supported.');
    return;
  }
  hideError(uploadErr);
  uploadFile(file);
}

/* ── Upload ──────────────────────────────────────────────── */
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  fileBadge.textContent = ` ${file.name}`;
  fileMeta.textContent  = `Uploading…`;
  fileInfo.style.display = 'flex';
  step2.style.display = 'none';

  try {
    const res  = await fetch('/upload', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok || data.error) {
      showError(uploadErr, data.error || 'Upload failed.');
      return;
    }

    uploadedFilename = data.filename;
    fileMeta.textContent = `${data.preview.length} preview rows · ${data.columns.length} columns`;

    // Populate target column dropdown
    targetSel.innerHTML = '<option value="">— Select column —</option>';
    data.columns.forEach(col => {
      const opt = document.createElement('option');
      opt.value = col; opt.textContent = col;
      // No auto-select — user picks their own target column
      targetSel.appendChild(opt);
    });

    // Render preview table
    renderPreview(data.columns, data.preview);
    previewBlk.style.display = 'block';
    step2.style.display = 'block';
    step2.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    showError(uploadErr, `Network error: ${err.message}`);
  }
}

/* ── Preview Table ───────────────────────────────────────── */
function renderPreview(columns, rows) {
  previewTbl.innerHTML = '';
  const thead = document.createElement('thead');
  const tr    = document.createElement('tr');
  columns.forEach(col => { const th = document.createElement('th'); th.textContent = col; tr.appendChild(th); });
  thead.appendChild(tr);
  previewTbl.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    columns.forEach(col => { const td = document.createElement('td'); td.textContent = row[col] ?? ''; tr.appendChild(td); });
    tbody.appendChild(tr);
  });
  previewTbl.appendChild(tbody);
}

/* ── Framework Cards ─────────────────────────────────────── */
document.querySelectorAll('.fw-card').forEach(card => {
  const cb = card.querySelector('input[type=checkbox]');
  if (cb.checked) card.classList.add('selected');
  card.addEventListener('click', () => {
    cb.checked = !cb.checked;
    card.classList.toggle('selected', cb.checked);
  });
});

function getSelectedFrameworks() {
  return [...document.querySelectorAll('.fw-card.selected input')].map(i => i.value);
}

/* ── Launch AutoML ───────────────────────────────────────── */
btnRun.addEventListener('click', async () => {
  hideError(configErr);
  const target = targetSel.value;
  const frameworks = getSelectedFrameworks();

  if (!uploadedFilename) { showError(configErr, 'Please upload a CSV first.'); return; }
  if (!target)           { showError(configErr, 'Please select a target column.'); return; }
  if (!frameworks.length){ showError(configErr, 'Please select at least one framework.'); return; }

  btnRun.disabled = true;
  btnRun.textContent = ' Launching…';

  try {
    // Store config in sessionStorage for loading page
    sessionStorage.setItem('aml_frameworks', JSON.stringify(frameworks));

    const res  = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: uploadedFilename, target_column: target, frameworks }),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      showError(configErr, data.error || 'Failed to start AutoML run.');
      btnRun.disabled = false;
      btnRun.innerHTML = '<span class="btn-run-icon">▶</span> Launch AutoML';
      return;
    }

    window.location.href = '/loading';

  } catch (err) {
    showError(configErr, `Network error: ${err.message}`);
    btnRun.disabled = false;
    btnRun.innerHTML = '<span class="btn-run-icon">▶</span> Launch AutoML';
  }
});

/* ── Helpers ─────────────────────────────────────────────── */
function showError(el, msg) { el.textContent = msg; el.style.display = 'block'; }
function hideError(el)       { el.textContent = '';  el.style.display = 'none';  }
