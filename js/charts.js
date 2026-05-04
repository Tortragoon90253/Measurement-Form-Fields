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

function renderBMIChart(canvasId, records, targetBMI) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const sorted = [...records].reverse();
  const labels = sorted.map(r => formatDate(r.date));
  const data   = sorted.map(r => r.bmi ?? null);

  const allVals  = [...data.filter(v => v != null), targetBMI];
  const yMin     = Math.max(10,  Math.min(...allVals) - 2);
  const yMax     = Math.min(50,  Math.max(...allVals) + 3);
  const targetData = labels.map(() => targetBMI);

  // Custom plugin to draw BMI zone bands behind the chart
  const zonesPlugin = {
    id: 'bmiZones',
    beforeDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea) return;
      const { left, right } = chartArea;
      const yScale = scales.y;
      const clamp = v => Math.min(chartArea.bottom, Math.max(chartArea.top, yScale.getPixelForValue(v)));

      const zones = [
        { from: 30,   to: 60,   color: 'rgba(220,38,38,0.07)'  },
        { from: 25,   to: 30,   color: 'rgba(234,88,12,0.07)'  },
        { from: 23,   to: 25,   color: 'rgba(202,138,4,0.07)'  },
        { from: 18.5, to: 23,   color: 'rgba(22,163,74,0.09)'  },
        { from: 0,    to: 18.5, color: 'rgba(59,130,246,0.07)' },
      ];
      ctx.save();
      zones.forEach(z => {
        const y1 = clamp(z.to);
        const y2 = clamp(z.from);
        if (y2 <= y1) return;
        ctx.fillStyle = z.color;
        ctx.fillRect(left, y1, right - left, y2 - y1);
      });
      ctx.restore();
    }
  };

  return new Chart(canvas, {
    type: 'line',
    plugins: [zonesPlugin],
    data: {
      labels,
      datasets: [
        {
          label: 'BMI',
          data,
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124,58,237,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: data.map(v => {
            if (v == null) return 'transparent';
            if (v < 18.5)  return '#3B82F6';
            if (v < 23)    return '#16A34A';
            if (v < 25)    return '#D97706';
            if (v < 30)    return '#EA580C';
            return '#DC2626';
          }),
          pointRadius: 5, pointHoverRadius: 7,
          tension: 0.35, fill: false, spanGaps: true,
        },
        {
          label: `เป้าหมาย BMI (${targetBMI})`,
          data: targetData,
          borderColor: '#F6AE2D',
          borderWidth: 2,
          borderDash: [7, 4],
          pointRadius: 0,
          fill: false,
          tension: 0,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { family: 'Sarabun', size: 11 },
            color: '#6B8CA4',
            boxWidth: 20, padding: 14,
            usePointStyle: true,
          }
        },
        tooltip: {
          backgroundColor: '#1C2B36',
          titleFont: { family: 'Sarabun', size: 12 },
          bodyFont:  { family: 'Sarabun', size: 13 },
          padding: 10, cornerRadius: 8,
          callbacks: {
            afterBody(items) {
              const v = items.find(i => i.dataset.label === 'BMI')?.parsed?.y;
              if (v == null) return '';
              if (v < 18.5) return '📊 น้ำหนักน้อย';
              if (v < 23)   return '📊 ปกติ';
              if (v < 25)   return '📊 น้ำหนักเกิน';
              if (v < 30)   return '📊 อ้วน';
              return '📊 อ้วนมาก';
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { font: { family: 'Sarabun', size: 11 }, color: '#94AAB8', maxRotation: 35, autoSkip: true, maxTicksLimit: 8 },
          grid: { color: 'rgba(0,0,0,0.04)' }
        },
        y: {
          min: yMin, max: yMax,
          ticks: { font: { family: 'Sarabun', size: 11 }, color: '#94AAB8' },
          grid:  { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'ค่า BMI', font: { family: 'Sarabun', size: 11 }, color: '#94AAB8' }
        }
      }
    }
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
