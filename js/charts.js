// ===== CHART.JS WRAPPERS =====

function renderMiniWeightChart(canvasId, records) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const sorted = [...records].reverse(); // oldest → newest
  const labels = sorted.map(r => formatDate(r.date));
  const data   = sorted.map(r => r.weightKg);

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'น้ำหนัก (kg)',
        data,
        borderColor: '#2E86AB',
        backgroundColor: 'rgba(46,134,171,0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: '#2E86AB',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: true,
      }]
    },
    options: chartOptions('น้ำหนัก (kg)')
  });
}

function renderMeasurementChart(canvasId, records, fieldKey, fieldLabel) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const sorted  = [...records].reverse();
  const labels  = sorted.map(r => formatDate(r.date));
  const data    = sorted.map(r => r[fieldKey] ?? null);

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${fieldLabel} (cm)`,
        data,
        borderColor: '#F6AE2D',
        backgroundColor: 'rgba(246,174,45,0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: '#F6AE2D',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: true,
        spanGaps: true,
      }]
    },
    options: chartOptions(`${fieldLabel} (cm)`)
  });
}

function chartOptions(yLabel) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1C2B36',
        titleFont: { family: 'Sarabun', size: 12 },
        bodyFont:  { family: 'Sarabun', size: 13 },
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        ticks: {
          font: { family: 'Sarabun', size: 11 },
          color: '#94AAB8',
          maxRotation: 35,
          autoSkip: true,
          maxTicksLimit: 8,
        },
        grid: { color: 'rgba(0,0,0,0.04)' }
      },
      y: {
        ticks: {
          font: { family: 'Sarabun', size: 11 },
          color: '#94AAB8',
        },
        grid: { color: 'rgba(0,0,0,0.06)' },
        title: {
          display: true,
          text: yLabel,
          font: { family: 'Sarabun', size: 11 },
          color: '#94AAB8',
        }
      }
    }
  };
}
