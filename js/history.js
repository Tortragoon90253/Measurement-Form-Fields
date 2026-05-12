// ===== HISTORY PAGE =====

let _histWeightChart = null;
let _histMeasChart   = null;
let _histBMIChart    = null;
let _allRecords      = [];
let _histUnitInch    = false;

async function initHistory() {
  _histUnitInch = false;
  const { user, profile } = window.appState;
  const content = document.getElementById('history-content');

  content.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>กำลังโหลด...</p></div>';

  // Destroy previous charts
  if (_histWeightChart) { _histWeightChart.destroy(); _histWeightChart = null; }
  if (_histMeasChart)   { _histMeasChart.destroy();   _histMeasChart   = null; }
  if (_histBMIChart)    { _histBMIChart.destroy();    _histBMIChart    = null; }

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
    content.innerHTML = renderHistoryContent(gender, profile);

    renderProgressSummary(_allRecords, gender, profile);
    renderTable(_allRecords, gender, user.uid);
    bindHistoryFilters(gender, user.uid, profile);

    // Charts
    _histWeightChart = renderMiniWeightChart('hist-weight-chart', _allRecords);
    const firstField = getMeasurementChartFields(gender)[0];
    _histMeasChart   = renderMeasurementChart('hist-meas-chart', _allRecords, firstField.key, firstField.label);
    const targetWeightKg = profile && profile.targetWeightKg;
    const savedTargetBMI = (targetWeightKg && profile && profile.heightCm)
      ? calculateBMI(targetWeightKg, profile.heightCm) : 22.0;
    _histBMIChart = renderBMIChart('hist-bmi-chart', _allRecords, savedTargetBMI);
    bindBMITargetInput(user, profile);

  } catch (err) {
    console.error(err);
    content.innerHTML = `<div class="empty-state"><p style="color:var(--danger)">โหลดข้อมูลไม่สำเร็จ</p></div>`;
  }
}

function renderProgressSummary(records, gender, profile) {
  const container = document.getElementById('hist-summary');
  if (!container || records.length < 1) { if (container) container.innerHTML = ''; return; }

  // records[0] = latest, records[last] = oldest (sorted desc)
  const latest = records[0];
  const first  = records[records.length - 1];
  const prev   = records.length > 1 ? records[1] : null;

  const isInch   = _histUnitInch;
  const measUnit = isInch ? 'นิ้ว' : 'cm';
  const fields   = getMeasurementFieldDefs(gender);
  const allKeys  = [
    { key: 'weightKg', label: 'น้ำหนัก', unit: 'kg', icon: '⚖️', convert: false },
    { key: 'bmi',      label: 'BMI',      unit: '',   icon: '📊', convert: false },
    ...fields.map(f => ({ key: f.key, label: f.label, unit: measUnit, icon: '📏', color: f.color, convert: true }))
  ];

  const cvt = (val, shouldConvert) =>
    (shouldConvert && isInch && val != null) ? cmToInch(val) : val;

  function diff(a, b) {
    if (a == null || b == null) return null;
    return Math.round((a - b) * 10) / 10;
  }

  function arrowHtml(d, unit) {
    if (d === null) return '<span style="color:var(--text-light)">ไม่มีข้อมูล</span>';
    if (d === 0)    return `<span style="color:var(--text-muted)">→ ไม่เปลี่ยน</span>`;
    const down = d < 0;
    const color = down ? '#16A34A' : '#EA580C';
    const arrow = down ? '↓' : '↑';
    return `<span style="color:${color};font-weight:700">${arrow} ${Math.abs(d)} ${unit}</span>`;
  }

  const cards = allKeys.filter(f => latest[f.key] != null || first[f.key] != null).map(f => {
    const latestV    = cvt(latest[f.key], f.convert);
    const firstV     = cvt(first[f.key],  f.convert);
    const prevV      = prev ? cvt(prev[f.key], f.convert) : null;
    const totalDiff  = diff(latestV, firstV);
    const recentDiff = prev ? diff(latestV, prevV) : null;
    const latestVal  = latestV != null ? `${latestV} ${f.unit}` : '–';
    const firstVal   = firstV  != null ? `${firstV} ${f.unit}`  : '–';

    return `
      <div class="summary-card">
        <div class="summary-card__label">${f.icon || '📏'} ${f.label}</div>
        <div class="summary-card__value">${latestVal}</div>
        <div class="summary-card__row">
          <span style="color:var(--text-muted);font-size:0.75rem">รวม (จาก ${firstVal})</span>
          ${arrowHtml(totalDiff, f.unit)}
        </div>
        ${recentDiff !== null ? `
        <div class="summary-card__row" style="margin-top:0.2rem">
          <span style="color:var(--text-muted);font-size:0.75rem">ครั้งล่าสุด</span>
          ${arrowHtml(recentDiff, f.unit)}
        </div>` : ''}
      </div>`;
  }).join('');

  const span = records.length > 1
    ? `${formatDate(first.date)} – ${formatDate(latest.date)} (${records.length} รายการ)`
    : '';

  container.innerHTML = `
    <div class="chart-card" style="margin-bottom:1.5rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem">
        <h3 style="margin:0">สรุปภาพรวมการเปลี่ยนแปลง</h3>
        <span style="font-size:0.8rem;color:var(--text-muted)">${span}</span>
      </div>
      <div class="summary-grid">${cards}</div>
      <p style="margin-top:0.75rem;font-size:0.75rem;color:var(--text-muted)">
        ↓ ลดลง (สีเขียว) · ↑ เพิ่มขึ้น (สีส้ม) · เทียบจากรายการแรกสุดถึงล่าสุด
      </p>
    </div>`;
}

function renderHistoryContent(gender, profile) {
  const fields    = getMeasurementChartFields(gender);
  const opts      = fields.map(f => `<option value="${f.key}">${f.label}</option>`).join('');
  const heightCm  = (profile && profile.heightCm) || 170;
  const savedW    = (profile && profile.targetWeightKg) || '';
  const initBMI   = savedW ? calculateBMI(savedW, heightCm) : null;
  const initCat   = initBMI ? getBMICategory(initBMI) : null;
  const bmiPreview = initBMI
    ? `<span id="bmi-target-preview" style="font-weight:700;color:${initCat ? initCat.color : 'var(--primary)'}">${initBMI} ${initCat ? `(${initCat.label})` : ''}</span>`
    : `<span id="bmi-target-preview" style="color:var(--text-muted)">–</span>`;

  return `
    <!-- Progress Summary -->
    <div id="hist-summary"></div>

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
      <div class="filter-group" style="margin-left:auto">
        <label style="font-size:0.82rem">หน่วยวัด</label>
        <div class="unit-toggle" id="hist-unit-toggle">
          <button type="button" class="unit-toggle__btn active" data-unit="cm">cm</button>
          <button type="button" class="unit-toggle__btn" data-unit="inch">นิ้ว</button>
        </div>
      </div>
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
    </div>

    <!-- BMI Chart (full width) -->
    <div class="chart-card" id="hist-bmi-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1rem">
        <h3 style="margin:0">แนวโน้ม BMI</h3>
        <div style="display:flex;flex-direction:column;gap:0.4rem;align-items:flex-end">
          <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap">
            <label style="font-size:0.85rem;font-weight:600;color:var(--text-muted);white-space:nowrap">
              🎯 น้ำหนักเป้าหมาย (kg):
            </label>
            <input type="number" id="bmi-target-weight"
              min="30" max="200" step="0.5" value="${savedW}"
              style="width:90px;padding:0.4rem 0.6rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font);font-size:0.95rem;font-weight:600;color:var(--primary);text-align:center">
            <button id="bmi-target-save" class="btn btn-primary" style="padding:0.4rem 0.9rem;font-size:0.85rem">
              ตั้งค่า
            </button>
          </div>
          <div style="font-size:0.8rem;color:var(--text-muted);text-align:right">
            BMI เป้าหมาย: ${bmiPreview}
            <span style="margin-left:0.4rem">(จากส่วนสูง ${heightCm} cm)</span>
          </div>
        </div>
      </div>

      <!-- BMI Zone Legend -->
      <div class="bmi-zone-legend">
        <span class="bmi-zone-chip" style="background:rgba(59,130,246,0.12);color:#1D4ED8">น้ำหนักน้อย &lt;18.5</span>
        <span class="bmi-zone-chip" style="background:rgba(22,163,74,0.12);color:#15803D">ปกติ 18.5–22.9</span>
        <span class="bmi-zone-chip" style="background:rgba(202,138,4,0.12);color:#B45309">น้ำหนักเกิน 23–24.9</span>
        <span class="bmi-zone-chip" style="background:rgba(234,88,12,0.12);color:#C2410C">อ้วน 25–29.9</span>
        <span class="bmi-zone-chip" style="background:rgba(220,38,38,0.12);color:#B91C1C">อ้วนมาก ≥30</span>
      </div>

      <div class="chart-wrapper" style="height:280px;margin-top:0.75rem">
        <canvas id="hist-bmi-chart"></canvas>
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

  const isInch  = _histUnitInch;
  const measUnit = isInch ? 'นิ้ว' : 'cm';

  tbody.innerHTML = records.map(r => {
    const cat   = getBMICategory(r.bmi);
    const cells = headers.map(h => {
      if (h.key === 'date')     return `<td>${formatDate(r.date)}</td>`;
      if (h.key === 'weightKg') return `<td>${r.weightKg ?? '–'} kg</td>`;
      if (h.key === 'bmi')      return `<td>${r.bmi ?? '–'} ${cat ? `<span class="bmi-badge" style="color:${cat.color};background:${cat.bg};font-size:0.72rem">${cat.label}</span>` : ''}</td>`;
      if (h.key === 'notes')    return `<td class="td-muted" style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.notes || '–'}</td>`;
      const raw = r[h.key];
      const val = (isInch && raw != null) ? cmToInch(raw) : raw;
      return `<td>${val != null ? val + ' ' + measUnit : '<span class="td-muted">–</span>'}</td>`;
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

function bindHistoryFilters(gender, uid, profile) {
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

  // Unit toggle
  const unitToggle = document.getElementById('hist-unit-toggle');
  if (unitToggle) {
    unitToggle.addEventListener('click', e => {
      const btn = e.target.closest('.unit-toggle__btn');
      if (!btn) return;
      const isInch = btn.dataset.unit === 'inch';
      if (isInch === _histUnitInch) return;
      _histUnitInch = isInch;
      unitToggle.querySelectorAll('.unit-toggle__btn').forEach(b =>
        b.classList.toggle('active', b.dataset.unit === (isInch ? 'inch' : 'cm'))
      );
      applyFilters(gender, uid);
      renderProgressSummary(_allRecords, gender, profile);
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

function bindBMITargetInput(user, profile) {
  const input   = document.getElementById('bmi-target-weight');
  const saveBtn = document.getElementById('bmi-target-save');
  const preview = document.getElementById('bmi-target-preview');
  if (!input || !saveBtn) return;

  const heightCm = (profile && profile.heightCm) || 170;

  function updatePreview() {
    const w = parseFloat(input.value);
    if (!w || w < 30 || w > 200) {
      if (preview) { preview.textContent = '–'; preview.style.color = 'var(--text-muted)'; }
      return;
    }
    const bmi = calculateBMI(w, heightCm);
    const cat = getBMICategory(bmi);
    if (preview) {
      preview.textContent = `${bmi}${cat ? ` (${cat.label})` : ''}`;
      preview.style.color = cat ? cat.color : 'var(--primary)';
    }
  }

  input.addEventListener('input', updatePreview);

  saveBtn.addEventListener('click', async () => {
    const w = parseFloat(input.value);
    if (!w || w < 30 || w > 200) {
      showToast('กรุณากรอกน้ำหนักเป้าหมายระหว่าง 30–200 kg', 'error');
      return;
    }
    try {
      await saveUserProfile(user.uid, { targetWeightKg: w });
      if (window.appState && window.appState.profile) {
        window.appState.profile.targetWeightKg = w;
      }
      const targetBMI = calculateBMI(w, heightCm);
      if (_histBMIChart) { _histBMIChart.destroy(); _histBMIChart = null; }
      _histBMIChart = renderBMIChart('hist-bmi-chart', _allRecords, targetBMI);
      updatePreview();
      showToast(`บันทึกน้ำหนักเป้าหมาย ${w} kg (BMI ${targetBMI}) แล้ว`, 'success');
    } catch (err) {
      console.error(err);
      showToast('บันทึกไม่สำเร็จ กรุณาลองใหม่', 'error');
    }
  });

  input.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn.click(); });
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
