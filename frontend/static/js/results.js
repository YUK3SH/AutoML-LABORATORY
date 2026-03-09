/* results.js — chart rendering for binary, multiclass, and regression tasks */

function renderAccuracyChart(report) {
  const canvas = document.getElementById('accuracy-chart');
  if (!canvas) return;

  const successful = (report.results || []).filter(r => r.status === 'success');
  if (!successful.length) return;

  const task = report.task || 'binary';
  const isRegression = task === 'regression';

  const FW_COLORS = {
    H2O: 'rgba(59,130,246,0.85)',
    AutoGluon: 'rgba(168,85,247,0.85)',
    TPOT: 'rgba(34,197,94,0.85)',
    FLAML: 'rgba(239,68,68,0.85)',
  };
  const FW_COLORS_DIM = {
    H2O: 'rgba(59,130,246,0.35)',
    AutoGluon: 'rgba(168,85,247,0.35)',
    TPOT: 'rgba(34,197,94,0.35)',
    FLAML: 'rgba(239,68,68,0.35)',
  };

  const labels = successful.map(r => r.framework);
  const colors = successful.map(r => FW_COLORS[r.framework] || 'rgba(245,158,11,0.85)');
  const colorsDim = successful.map(r => FW_COLORS_DIM[r.framework] || 'rgba(245,158,11,0.35)');

  let datasets, yConfig, tooltipSuffix;

  if (isRegression) {
    // Dataset 1: R²  (higher is better)
    // Dataset 2: RMSE (lower is better — shown as negative bar isn't great, show as-is)
    const r2 = successful.map(r => r.r2 != null ? +r.r2.toFixed(4) : 0);
    const rmse = successful.map(r => r.rmse != null ? +r.rmse.toFixed(4) : 0);

    datasets = [
      {
        label: 'R² Score',
        data: r2,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: 'yLeft',
      },
      {
        label: 'RMSE',
        data: rmse,
        backgroundColor: colorsDim,
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: 'yRight',
      },
    ];

    const maxR2 = Math.max(...r2, 0);
    const maxRMSE = Math.max(...rmse, 0);

    yConfig = {
      yLeft: {
        type: 'linear',
        position: 'left',
        min: 0,
        max: Math.min(maxR2 * 1.1, 1),
        title: { display: true, text: 'R² Score', color: '#9ca3af', font: { size: 11 } },
        ticks: {
          color: '#9ca3af',
          font: { family: "'JetBrains Mono', monospace", size: 10 },
          callback: v => v.toFixed(3),
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      yRight: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: maxRMSE * 1.2,
        title: { display: true, text: 'RMSE', color: '#9ca3af', font: { size: 11 } },
        ticks: {
          color: '#9ca3af',
          font: { family: "'JetBrains Mono', monospace", size: 10 },
          callback: v => v.toFixed(2),
        },
        grid: { drawOnChartArea: false },
      },
    };

    tooltipSuffix = (ctx) => {
      const v = ctx.parsed.y;
      return ctx.dataset.label === 'R² Score'
        ? ` R²: ${v.toFixed(4)}`
        : ` RMSE: ${v.toFixed(4)}`;
    };

  } else {
    // Classification: Accuracy % + F1 %
    const accuracy = successful.map(r => r.accuracy != null ? +(r.accuracy * 100).toFixed(2) : 0);
    const f1 = successful.map(r => r.f1_score != null ? +(r.f1_score * 100).toFixed(2) : 0);

    datasets = [
      {
        label: 'Accuracy (%)',
        data: accuracy,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'F1-Score (%)',
        data: f1,
        backgroundColor: colorsDim,
        borderRadius: 6,
        borderSkipped: false,
      },
    ];

    const allVals = [...accuracy, ...f1].filter(v => v > 0);
    const minVal = allVals.length ? Math.max(Math.min(...allVals) - 5, 0) : 0;

    yConfig = {
      y: {
        min: minVal,
        max: 100,
        ticks: {
          color: '#9ca3af',
          font: { family: "'JetBrains Mono', monospace", size: 10 },
          callback: v => `${v}%`,
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    };

    tooltipSuffix = (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`;
  }

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#9ca3af',
            font: { family: "'JetBrains Mono', monospace", size: 11 },
          },
        },
        tooltip: {
          callbacks: { label: tooltipSuffix },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#9ca3af',
            font: { family: "'JetBrains Mono', monospace", size: 11 },
          },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        ...yConfig,
      },
    },
  });
}