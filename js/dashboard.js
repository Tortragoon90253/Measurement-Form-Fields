// ===== DASHBOARD PAGE =====

let _dashChart = null;

async function initDashboard() {
  const { user, profile } = window.appState;
  const content = document.getElementById('dashboard-content');

  // Greeting
  const greeting = document.getElementById('dashboard-greeting');
  const name = profile ? profile.displayName.split(' ')[0] : (user.displayName || 'คุณ');
  greeting.textContent = `สวัสดี, ${name}!`;

  // Date
  const dateEl = document.getElementById('dashboard-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('th-TH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  content.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>กำลังโหลด...</p></div>';

  try {
    const latest = await getLatestMeasurement(user.uid);
    const recent = await getMeasurements(user.uid, 8);

    if (!latest) {
      content.innerHTML = renderEmptyDashboard();
      return;
    }

    content.innerHTML = renderDashboardCards(latest, profile) + renderDashboardChart();

    // Destroy previous chart instance
    if (_dashChart) { _dashChart.destroy(); _dashChart = null; }
    if (recent.length > 1) {
      _dashChart = renderMiniWeightChart('dash-weight-chart', recent);
    }

    // Last measurements summary
    renderMeasurementSummary(latest, profile);

  } catch (err) {
    console.error(err);
    content.innerHTML = `<div class="empty-state"><p style="color:var(--danger)">โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่</p></div>`;
  }
}

function renderEmptyDashboard() {
  return `
    <div class="empty-state">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="38" stroke="#CBD5E1" stroke-width="2"/>
        <path d="M24 40 L33 31 L40 40 L50 28 L56 36" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <circle cx="40" cy="56" r="3" fill="#CBD5E1"/>
      </svg>
      <h3>ยังไม่มีข้อมูล</h3>
      <p>เริ่มบันทึกสัดส่วนร่างกายของคุณวันนี้</p>
      <a href="#add" class="btn btn-primary">เพิ่มข้อมูลแรก</a>
    </div>`;
}

function renderDashboardCards(latest, profile) {
  const bmi    = latest.bmi;
  const cat    = getBMICategory(bmi);
  const dateStr = formatDate(latest.date);

  return `
    <div class="stats-grid" id="stats-grid">
      <div class="stat-card">
        <div class="stat-card__label">น้ำหนักล่าสุด</div>
        <div class="stat-card__value">${latest.weightKg}<span class="stat-card__unit">kg</span></div>
        <div class="stat-card__sub">${dateStr}</div>
      </div>
      <div class="stat-card stat-card--bmi">
        <div class="stat-card__label">BMI</div>
        <div class="stat-card__value">${bmi}</div>
        ${cat ? `<span class="bmi-badge" style="color:${cat.color};background:${cat.bg}">${cat.label}</span>` : ''}
      </div>
      ${profile ? `
      <div class="stat-card stat-card--date">
        <div class="stat-card__label">ส่วนสูง</div>
        <div class="stat-card__value">${profile.heightCm}<span class="stat-card__unit">cm</span></div>
        <div class="stat-card__sub">${profile.gender === 'male' ? 'ชาย' : 'หญิง'}</div>
      </div>` : ''}
      <div class="stat-card stat-card--date">
        <div class="stat-card__label">บันทึกล่าสุด</div>
        <div class="stat-card__value" style="font-size:1.1rem;line-height:1.3">${dateStr}</div>
      </div>
    </div>
    <div id="measure-summary"></div>`;
}

function renderDashboardChart() {
  return `
    <div class="chart-card">
      <h3>แนวโน้มน้ำหนัก (8 รายการล่าสุด)</h3>
      <div class="chart-wrapper"><canvas id="dash-weight-chart"></canvas></div>
    </div>`;
}

function renderMeasurementSummary(latest, profile) {
  const fields = getMeasurementFieldDefs(profile ? profile.gender : 'male');
  const hasAny = fields.some(f => latest[f.key] != null);
  if (!hasAny) return;

  const chips = fields
    .filter(f => latest[f.key] != null)
    .map(f => `
      <div style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.75rem;background:var(--surface);border-radius:var(--radius-sm);font-size:0.85rem;">
        <span class="measure-dot" style="background:${f.color};"></span>
        <span style="color:var(--text-muted);font-size:0.78rem">${f.label}</span>
        <strong>${latest[f.key]} cm</strong>
      </div>`).join('');

  document.getElementById('measure-summary').innerHTML = `
    <div class="chart-card">
      <h3>สัดส่วนล่าสุด</h3>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">${chips}</div>
    </div>`;
}

function getMeasurementFieldDefs(gender) {
  const common = [
    { key: 'chest',    label: 'อก',       color: '#2E86AB' },
    { key: 'waist',    label: 'เอว',      color: '#F6AE2D' },
    { key: 'hips',     label: 'สะโพก',    color: '#A8D5BA' },
    { key: 'thigh',    label: 'ต้นขา',    color: '#E63946' },
    { key: 'upperArm', label: 'ต้นแขน',   color: '#9B5DE5' },
  ];
  if (gender === 'male') {
    return [...common, { key: 'shoulders', label: 'ไหล่', color: '#0EA5E9' }];
  } else {
    return [
      { key: 'bust',      label: 'รอบอก',     color: '#EC4899' },
      { key: 'underbust', label: 'รอบใต้อก',  color: '#F97316' },
      ...common,
    ];
  }
}
