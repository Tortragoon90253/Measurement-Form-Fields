// ===== HISTORY PAGE =====

let _histWeightChart = null;
let _histMeasChart   = null;
let _allRecords      = [];

async function initHistory() {
  const { user, profile } = window.appState;
  const content = document.getElementById('history-content');

  content.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>กำลังโหลด...</p></div>';

  // Destroy previous charts
  if (_histWeightChart) { _histWeightChart.destroy(); _histWeightChart = null; }
  if (_histMeasChart)   { _histMeasChart.destroy();   _histMeasChart   = null; }

  try {
    _allRecords = await getMeasurements(user.uid);

    if (!_allRecords.length) {
      content.innerHTML = `
        <div class="empty-state">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#CBD5E1" stroke-width="2"/>
            <path d="M26 54V38M40 54V26M54 54V44" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <h3>ยังไม่มีประวัติการบันทึก</h3>
          <p>เริ่มบันทึกข้อมูลแรกของคุณเลย</p>
          <a href="#add" class="btn btn-primary">เพิ่มข้อมูล</a>
        </div>`;
      return;
    }

    const gender = profile ? profile.gender : 'male';
    content.innerHTML = renderHistoryContent(gender);

    renderTable(_allRecords, gender, user.uid);
    bindHistoryFilters(gender, user.uid);

    // Charts
    if (_allRecords.length > 1) {
      _histWeightChart = renderMiniWeightChart('hist-weight-chart', _allRecords);
      const firstField = getMeasurementChartFields(gender)[0];
      _histMeasChart   = renderMeasurementChart('hist-meas-chart', _allRecords, firstField.key, firstField.label);
    } else {
      document.getElementById('hist-charts-area').innerHTML =
        '<p style="color:var(--text-muted);font-size:0.9rem;padding:1rem">ต้องการข้อมูลอย่างน้อย 2 รายการเพื่อแสดงกราฟ</p>';
    }

  } catch (err) {
    console.error(err);
    content.innerHTML = `<div class="empty-state"><p style="color:var(--danger)">โหลดข้อมูลไม่สำเร็จ</p></div>`;
  }
}

function renderHistoryContent(gender) {
  const fields = getMeasurementChartFields(gender);
  const opts   = fields.map(f => `<option value="${f.key}">${f.label}</option>`).join('');

  return `
    <!-- Filter bar -->
    <div class="filter-bar">
      <div class="filter-group">
        <label>จากวันที่</label>
        <input type="date" id="filter-from" style="padding:0.5rem 0.8rem;border:1.5px solid var(--border);border-radius:var(--radius-sm)">
      </div>
      <div class="filter-group">
        <label>ถึงวันที่</label>
        <input type="date" id="filter-to" style="padding:0.5rem 0.8rem;border:1.5px solid var(--border);border-radius:var(--radius-sm)">
      </div>
      <button class="btn btn-secondary" id="filter-reset-btn" style="height:fit-content;align-self:flex-end">รีเซ็ต</button>
    </div>

    <!-- Table -->
    <div class="table-card" id="hist-table-wrapper">
      <div class="table-wrapper">
        <table id="hist-table">
          <thead id="hist-thead"></thead>
          <tbody id="hist-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- Charts -->
    <div id="hist-charts-area">
      <div class="chart-card">
        <h3>แนวโน้มน้ำหนัก</h3>
        <div class="chart-wrapper"><canvas id="hist-weight-chart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-selector-group">
          <label for="meas-selector">แสดงกราฟ:</label>
          <select id="meas-selector">${opts}</select>
        </div>
        <div class="chart-wrapper"><canvas id="hist-meas-chart"></canvas></div>
      </div>
    </div>`;
}

function renderTable(records, gender, uid) {
  const isMale  = gender === 'male';
  const headers = getTableHeaders(isMale);

  document.getElementById('hist-thead').innerHTML =
    `<tr>${headers.map(h => `<th>${h.label}</th>`).join('')}<th class="td-actions">ลบ</th></tr>`;

  const tbody = document.getElementById('hist-tbody');
  if (!records.length) {
    tbody.innerHTML = `<tr><td colspan="${headers.length + 1}" style="text-align:center;color:var(--text-muted);padding:2rem">ไม่พบข้อมูลในช่วงเวลานี้</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(r => {
    const cat   = getBMICategory(r.bmi);
    const cells = headers.map(h => {
      if (h.key === 'date')   return `<td>${formatDate(r.date)}</td>`;
      if (h.key === 'bmi')    return `<td>${r.bmi ?? '–'} ${cat ? `<span class="bmi-badge" style="color:${cat.color};background:${cat.bg};font-size:0.72rem">${cat.label}</span>` : ''}</td>`;
      if (h.key === 'notes')  return `<td class="td-muted" style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.notes || '–'}</td>`;
      const val = r[h.key];
      return `<td>${val != null ? val + ' cm' : '<span class="td-muted">–</span>'}</td>`;
    }).join('');
    return `<tr>
      ${cells}
      <td class="td-actions">
        <button class="btn btn-danger" data-id="${r.id}" data-uid="${uid}" title="ลบรายการนี้">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');

  // Delete buttons
  document.querySelectorAll('.btn-danger[data-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('ลบรายการนี้?')) return;
      try {
        await deleteMeasurement(btn.dataset.uid, btn.dataset.id);
        _allRecords = _allRecords.filter(r => r.id !== btn.dataset.id);
        applyFilters(gender, uid);
        showToast('ลบข้อมูลเรียบร้อย', 'success');
      } catch (err) {
        showToast('ลบไม่สำเร็จ กรุณาลองใหม่', 'error');
      }
    });
  });
}

function bindHistoryFilters(gender, uid) {
  document.getElementById('filter-from').addEventListener('change', () => applyFilters(gender, uid));
  document.getElementById('filter-to').addEventListener('change',   () => applyFilters(gender, uid));
  document.getElementById('filter-reset-btn').addEventListener('click', () => {
    document.getElementById('filter-from').value = '';
    document.getElementById('filter-to').value   = '';
    applyFilters(gender, uid);
  });

  // Measurement chart selector
  const sel = document.getElementById('meas-selector');
  if (sel) {
    sel.addEventListener('change', () => {
      const fields = getMeasurementChartFields(gender);
      const found  = fields.find(f => f.key === sel.value);
      if (!found) return;
      if (_histMeasChart) { _histMeasChart.destroy(); _histMeasChart = null; }
      _histMeasChart = renderMeasurementChart('hist-meas-chart', _allRecords, found.key, found.label);
    });
  }
}

function applyFilters(gender, uid) {
  const from = document.getElementById('filter-from').value;
  const to   = document.getElementById('filter-to').value;

  let filtered = _allRecords;
  if (from) {
    const fromDate = new Date(from);
    filtered = filtered.filter(r => {
      const d = r.date.toDate ? r.date.toDate() : new Date(r.date);
      return d >= fromDate;
    });
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter(r => {
      const d = r.date.toDate ? r.date.toDate() : new Date(r.date);
      return d <= toDate;
    });
  }
  renderTable(filtered, gender, uid);
}

function getTableHeaders(isMale) {
  const common = [
    { key: 'date',     label: 'วันที่' },
    { key: 'weightKg', label: 'น้ำหนัก (kg)' },
    { key: 'bmi',      label: 'BMI' },
  ];
  const meas = isMale
    ? [
        { key: 'shoulders', label: 'ไหล่' },
        { key: 'chest',     label: 'อก' },
      ]
    : [
        { key: 'bust',      label: 'รอบอก' },
        { key: 'underbust', label: 'รอบใต้อก' },
        { key: 'chest',     label: 'อก' },
      ];
  return [
    ...common,
    ...meas,
    { key: 'waist',     label: 'เอว' },
    { key: 'hips',      label: 'สะโพก' },
    { key: 'thighL',    label: 'ต้นขา ซ้าย' },
    { key: 'thighR',    label: 'ต้นขา ขวา' },
    { key: 'upperArmL', label: 'ต้นแขน ซ้าย' },
    { key: 'upperArmR', label: 'ต้นแขน ขวา' },
    { key: 'notes',     label: 'หมายเหตุ' },
  ];
}

function getMeasurementChartFields(gender) {
  const common = [
    { key: 'chest',     label: 'อก' },
    { key: 'waist',     label: 'เอว' },
    { key: 'hips',      label: 'สะโพก' },
    { key: 'thighL',    label: 'ต้นขา ซ้าย' },
    { key: 'thighR',    label: 'ต้นขา ขวา' },
    { key: 'upperArmL', label: 'ต้นแขน ซ้าย' },
    { key: 'upperArmR', label: 'ต้นแขน ขวา' },
  ];
  if (gender === 'male') {
    return [{ key: 'shoulders', label: 'ไหล่' }, ...common];
  } else {
    return [{ key: 'bust', label: 'รอบอก' }, { key: 'underbust', label: 'รอบใต้อก' }, ...common];
  }
}
