// ===== ADD MEASUREMENT PAGE =====

async function initAddMeasurement() {
  const { user, profile } = window.appState;
  const content = document.getElementById('add-content');
  if (!profile) {
    content.innerHTML = '<p style="color:var(--danger)">ไม่พบข้อมูลผู้ใช้</p>';
    return;
  }
  content.innerHTML = renderAddForm(profile);
  bindAddForm(user, profile);
  setupDiagramInteractivity();
}

// ===== SVG BODY DIAGRAMS =====

function getMaleSVG() {
  return `
<svg class="body-svg" viewBox="0 0 280 430" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bd-fill { fill:#E2EBF0; stroke:#96B4C8; stroke-width:1.5; stroke-linejoin:round; }
      .m-line  { stroke:#CBD5E1; stroke-width:1.5; stroke-dasharray:4 3; fill:none; transition:stroke 0.2s; }
      .m-dot   { fill:#CBD5E1; transition:fill 0.2s; }
      .c-line  { stroke:#CBD5E1; stroke-width:1; fill:none; transition:stroke 0.2s; }
      .m-text  { font-family:Sarabun,sans-serif; font-size:11.5px; fill:#94AAB8; transition:fill 0.2s; }
      .m-line.hl  { stroke:#2E86AB; stroke-width:2; }
      .m-dot.hl   { fill:#2E86AB; }
      .c-line.hl  { stroke:#2E86AB; }
      .m-text.hl  { fill:#2E86AB; font-weight:700; }
    </style>
  </defs>

  <!-- Body silhouette -->
  <ellipse class="bd-fill" cx="110" cy="32" rx="22" ry="26"/>
  <path class="bd-fill" d="
    M 102,56 L 84,62 L 58,72 L 52,80
    C 42,100 38,132 42,160 L 50,164 L 58,160
    C 58,132 62,100 68,82 L 72,88
    L 74,158 L 68,196 L 64,210
    L 60,385 L 78,385 L 84,210
    L 94,214 L 126,214 L 136,210
    L 142,385 L 160,385 L 156,210
    L 152,196 L 146,158 L 148,88
    C 158,100 162,132 162,160 L 162,164 L 170,160
    C 182,132 178,100 168,80
    L 162,72 L 136,62 L 118,56
    L 114,74 L 106,74 Z
  "/>

  <!-- ไหล่ indicator -->
  <g class="measure-group" data-field="shoulders">
    <line class="m-line" x1="58" y1="74" x2="162" y2="74"/>
    <circle class="m-dot" cx="58" cy="74" r="4"/>
    <circle class="m-dot" cx="162" cy="74" r="4"/>
    <line class="c-line" x1="162" y1="74" x2="215" y2="74"/>
    <text class="m-text" x="218" y="78">ไหล่</text>
  </g>

  <!-- อก indicator -->
  <g class="measure-group" data-field="chest">
    <line class="m-line" x1="72" y1="108" x2="148" y2="108"/>
    <circle class="m-dot" cx="72" cy="108" r="4"/>
    <circle class="m-dot" cx="148" cy="108" r="4"/>
    <line class="c-line" x1="148" y1="108" x2="215" y2="108"/>
    <text class="m-text" x="218" y="112">อก</text>
  </g>

  <!-- เอว indicator -->
  <g class="measure-group" data-field="waist">
    <line class="m-line" x1="74" y1="158" x2="146" y2="158"/>
    <circle class="m-dot" cx="74" cy="158" r="4"/>
    <circle class="m-dot" cx="146" cy="158" r="4"/>
    <line class="c-line" x1="146" y1="158" x2="215" y2="158"/>
    <text class="m-text" x="218" y="162">เอว</text>
  </g>

  <!-- สะโพก indicator -->
  <g class="measure-group" data-field="hips">
    <line class="m-line" x1="68" y1="196" x2="152" y2="196"/>
    <circle class="m-dot" cx="68" cy="196" r="4"/>
    <circle class="m-dot" cx="152" cy="196" r="4"/>
    <line class="c-line" x1="152" y1="196" x2="215" y2="196"/>
    <text class="m-text" x="218" y="200">สะโพก</text>
  </g>

  <!-- ต้นแขน indicator (left arm) -->
  <g class="measure-group" data-field="upperArm">
    <line class="m-line" x1="40" y1="118" x2="66" y2="118"/>
    <circle class="m-dot" cx="40" cy="118" r="4"/>
    <circle class="m-dot" cx="66" cy="118" r="4"/>
    <line class="c-line" x1="40" y1="118" x2="10" y2="118"/>
    <text class="m-text" text-anchor="end" x="7" y="122">ต้นแขน</text>
  </g>

  <!-- ต้นขา indicator (left thigh) -->
  <g class="measure-group" data-field="thigh">
    <line class="m-line" x1="62" y1="258" x2="90" y2="258"/>
    <circle class="m-dot" cx="62" cy="258" r="4"/>
    <circle class="m-dot" cx="90" cy="258" r="4"/>
    <line class="c-line" x1="90" y1="258" x2="215" y2="258"/>
    <text class="m-text" x="218" y="262">ต้นขา</text>
  </g>
</svg>`;
}

function getFemaleSVG() {
  return `
<svg class="body-svg" viewBox="0 0 280 430" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bd-fill { fill:#F0E8F0; stroke:#C4A4C4; stroke-width:1.5; stroke-linejoin:round; }
      .m-line  { stroke:#CBD5E1; stroke-width:1.5; stroke-dasharray:4 3; fill:none; transition:stroke 0.2s; }
      .m-dot   { fill:#CBD5E1; transition:fill 0.2s; }
      .c-line  { stroke:#CBD5E1; stroke-width:1; fill:none; transition:stroke 0.2s; }
      .m-text  { font-family:Sarabun,sans-serif; font-size:11.5px; fill:#94AAB8; transition:fill 0.2s; }
      .m-line.hl  { stroke:#2E86AB; stroke-width:2; }
      .m-dot.hl   { fill:#2E86AB; }
      .c-line.hl  { stroke:#2E86AB; }
      .m-text.hl  { fill:#2E86AB; font-weight:700; }
    </style>
  </defs>

  <!-- Body silhouette (wider hips, narrower shoulders, curves) -->
  <ellipse class="bd-fill" cx="110" cy="32" rx="21" ry="26"/>
  <path class="bd-fill" d="
    M 104,56 L 90,62 L 68,70 L 62,78
    C 52,98 48,130 52,158 L 60,162 L 66,158
    C 66,130 70,98 76,80 L 80,85
    C 72,100 70,116 72,128 L 80,135
    L 82,162 L 64,200 L 60,214
    L 56,385 L 74,385 L 80,214
    L 90,218 L 130,218 L 140,214
    L 146,385 L 164,385 L 160,214
    L 156,200 L 138,162 L 140,135
    C 150,116 148,100 140,85 L 144,80
    C 150,98 154,130 154,158 L 154,162 L 160,158
    C 172,130 168,98 158,78
    L 152,70 L 130,62 L 116,56
    L 112,74 L 108,74 Z
  "/>

  <!-- รอบอก indicator -->
  <g class="measure-group" data-field="bust">
    <line class="m-line" x1="72" y1="108" x2="148" y2="108"/>
    <circle class="m-dot" cx="72" cy="108" r="4"/>
    <circle class="m-dot" cx="148" cy="108" r="4"/>
    <line class="c-line" x1="148" y1="108" x2="215" y2="108"/>
    <text class="m-text" x="218" y="112">รอบอก</text>
  </g>

  <!-- รอบใต้อก indicator -->
  <g class="measure-group" data-field="underbust">
    <line class="m-line" x1="78" y1="128" x2="142" y2="128"/>
    <circle class="m-dot" cx="78" cy="128" r="4"/>
    <circle class="m-dot" cx="142" cy="128" r="4"/>
    <line class="c-line" x1="142" y1="128" x2="215" y2="128"/>
    <text class="m-text" x="218" y="132">รอบใต้อก</text>
  </g>

  <!-- เอว indicator -->
  <g class="measure-group" data-field="waist">
    <line class="m-line" x1="78" y1="162" x2="138" y2="162"/>
    <circle class="m-dot" cx="78" cy="162" r="4"/>
    <circle class="m-dot" cx="138" cy="162" r="4"/>
    <line class="c-line" x1="138" y1="162" x2="215" y2="162"/>
    <text class="m-text" x="218" y="166">เอว</text>
  </g>

  <!-- สะโพก indicator -->
  <g class="measure-group" data-field="hips">
    <line class="m-line" x1="62" y1="200" x2="158" y2="200"/>
    <circle class="m-dot" cx="62" cy="200" r="4"/>
    <circle class="m-dot" cx="158" cy="200" r="4"/>
    <line class="c-line" x1="158" y1="200" x2="215" y2="200"/>
    <text class="m-text" x="218" y="204">สะโพก</text>
  </g>

  <!-- ต้นแขน indicator (left arm) -->
  <g class="measure-group" data-field="upperArm">
    <line class="m-line" x1="50" y1="116" x2="74" y2="116"/>
    <circle class="m-dot" cx="50" cy="116" r="4"/>
    <circle class="m-dot" cx="74" cy="116" r="4"/>
    <line class="c-line" x1="50" y1="116" x2="10" y2="116"/>
    <text class="m-text" text-anchor="end" x="7" y="120">ต้นแขน</text>
  </g>

  <!-- ต้นขา indicator (left thigh) -->
  <g class="measure-group" data-field="thigh">
    <line class="m-line" x1="58" y1="256" x2="86" y2="256"/>
    <circle class="m-dot" cx="58" cy="256" r="4"/>
    <circle class="m-dot" cx="86" cy="256" r="4"/>
    <line class="c-line" x1="86" y1="256" x2="215" y2="256"/>
    <text class="m-text" x="218" y="260">ต้นขา</text>
  </g>
</svg>`;
}

// ===== FORM RENDERING =====

function renderAddForm(profile) {
  const isMale = profile.gender === 'male';
  const svg    = isMale ? getMaleSVG() : getFemaleSVG();

  const genderSpecificFields = isMale
    ? `<div class="measure-input-group" data-field="shoulders">
        <label><span class="measure-dot" style="background:#0EA5E9"></span>ไหล่</label>
        <div class="measure-input-wrapper">
          <input type="number" id="f-shoulders" min="0" max="200" step="0.5" placeholder="–">
          <span class="measure-unit">cm</span>
        </div>
      </div>`
    : `<div class="measure-input-group" data-field="bust">
        <label><span class="measure-dot" style="background:#EC4899"></span>รอบอก (bust)</label>
        <div class="measure-input-wrapper">
          <input type="number" id="f-bust" min="0" max="200" step="0.5" placeholder="–">
          <span class="measure-unit">cm</span>
        </div>
      </div>
      <div class="measure-input-group" data-field="underbust">
        <label><span class="measure-dot" style="background:#F97316"></span>รอบใต้อก (underbust)</label>
        <div class="measure-input-wrapper">
          <input type="number" id="f-underbust" min="0" max="200" step="0.5" placeholder="–">
          <span class="measure-unit">cm</span>
        </div>
      </div>`;

  return `
<div class="add-form-layout">
  <!-- LEFT: Body Diagram -->
  <div class="add-form-diagram">
    <div class="diagram-card">
      <h4>${isMale ? 'ผู้ชาย' : 'ผู้หญิง'} — ตำแหน่งวัด</h4>
      ${svg}
      <p style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">
        คลิกที่ช่องกรอกเพื่อดูตำแหน่งวัด
      </p>
    </div>
  </div>

  <!-- RIGHT: Form -->
  <div class="add-form-fields">
    <form id="measure-form" novalidate>

      <!-- Date -->
      <fieldset class="measure-fieldset">
        <legend>วันที่และน้ำหนัก</legend>
        <div class="measure-fields-grid" style="grid-template-columns:1fr 1fr">
          <div class="form-group" style="margin-bottom:0">
            <label for="f-date">วันที่</label>
            <input type="date" id="f-date" required>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label for="f-weight">น้ำหนัก (kg) <span class="required">*</span></label>
            <input type="number" id="f-weight" min="20" max="300" step="0.1" placeholder="เช่น 65.5" required>
          </div>
        </div>
      </fieldset>

      <!-- BMI Display -->
      <div id="bmi-display-wrapper" style="margin-bottom:1.25rem;display:none">
        <label style="font-size:0.88rem;font-weight:600;color:var(--text);margin-bottom:0.4rem;display:block">BMI (คำนวณอัตโนมัติ)</label>
        <div class="bmi-display">
          <div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:2px">จากส่วนสูง ${profile.heightCm} cm</div>
            <div id="bmi-value" class="bmi-display__value">–</div>
          </div>
          <span id="bmi-category" class="bmi-display__category"></span>
        </div>
      </div>

      <!-- Gender-specific -->
      <fieldset class="measure-fieldset">
        <legend>สัดส่วน — ส่วนบน</legend>
        <div class="measure-fields-grid">
          ${genderSpecificFields}
          <div class="measure-input-group" data-field="chest">
            <label><span class="measure-dot" style="background:#2E86AB"></span>${isMale ? 'อก' : 'อก (chest)'}</label>
            <div class="measure-input-wrapper">
              <input type="number" id="f-chest" min="0" max="200" step="0.5" placeholder="–">
              <span class="measure-unit">cm</span>
            </div>
          </div>
          <div class="measure-input-group" data-field="upperArm">
            <label><span class="measure-dot" style="background:#9B5DE5"></span>ต้นแขน</label>
            <div class="measure-input-wrapper">
              <input type="number" id="f-upperArm" min="0" max="100" step="0.5" placeholder="–">
              <span class="measure-unit">cm</span>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="measure-fieldset">
        <legend>สัดส่วน — ส่วนกลาง</legend>
        <div class="measure-fields-grid">
          <div class="measure-input-group" data-field="waist">
            <label><span class="measure-dot" style="background:#F6AE2D"></span>เอว</label>
            <div class="measure-input-wrapper">
              <input type="number" id="f-waist" min="0" max="200" step="0.5" placeholder="–">
              <span class="measure-unit">cm</span>
            </div>
          </div>
          <div class="measure-input-group" data-field="hips">
            <label><span class="measure-dot" style="background:#A8D5BA"></span>สะโพก</label>
            <div class="measure-input-wrapper">
              <input type="number" id="f-hips" min="0" max="200" step="0.5" placeholder="–">
              <span class="measure-unit">cm</span>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="measure-fieldset">
        <legend>สัดส่วน — ส่วนล่าง</legend>
        <div class="measure-fields-grid">
          <div class="measure-input-group" data-field="thigh">
            <label><span class="measure-dot" style="background:#E63946"></span>ต้นขา</label>
            <div class="measure-input-wrapper">
              <input type="number" id="f-thigh" min="0" max="150" step="0.5" placeholder="–">
              <span class="measure-unit">cm</span>
            </div>
          </div>
        </div>
      </fieldset>

      <!-- Notes -->
      <div class="form-group">
        <label for="f-notes">บันทึกเพิ่มเติม (ไม่บังคับ)</label>
        <input type="text" id="f-notes" placeholder="เช่น หลังออกกำลังกาย, ช่วงลดน้ำหนัก..." maxlength="200">
      </div>

      <div class="form-error hidden" id="measure-error"></div>

      <div style="display:flex;gap:0.75rem;margin-top:0.5rem;">
        <button type="submit" class="btn btn-primary" style="flex:1" id="measure-submit-btn">
          <span class="btn-text">บันทึกข้อมูล</span>
          <span class="btn-spinner hidden"></span>
        </button>
        <a href="#history" class="btn btn-secondary">ดูประวัติ</a>
      </div>

    </form>
  </div>
</div>`;
}

// ===== FORM BINDING =====

function bindAddForm(user, profile) {
  // Set today's date
  document.getElementById('f-date').value = todayInputValue();

  // Live BMI calculation
  const weightInput = document.getElementById('f-weight');
  weightInput.addEventListener('input', () => updateBMIDisplay(profile.heightCm));

  // Form submit
  document.getElementById('measure-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('measure-error');
    const btn = document.getElementById('measure-submit-btn');

    const dateVal  = document.getElementById('f-date').value;
    const weightVal = parseFloat(document.getElementById('f-weight').value);

    if (!dateVal) { showError('measure-error', 'กรุณาเลือกวันที่'); return; }
    if (!weightVal || weightVal < 20) { showError('measure-error', 'กรุณากรอกน้ำหนักที่ถูกต้อง'); return; }

    const bmi = calculateBMI(weightVal, profile.heightCm);

    const isMale = profile.gender === 'male';
    const data = {
      date:      firebase.firestore.Timestamp.fromDate(new Date(dateVal)),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      weightKg:  weightVal,
      bmi:       bmi,
      chest:     parseFloatOrNull('f-chest'),
      waist:     parseFloatOrNull('f-waist'),
      hips:      parseFloatOrNull('f-hips'),
      thigh:     parseFloatOrNull('f-thigh'),
      upperArm:  parseFloatOrNull('f-upperArm'),
      shoulders: isMale  ? parseFloatOrNull('f-shoulders') : null,
      bust:      !isMale ? parseFloatOrNull('f-bust')      : null,
      underbust: !isMale ? parseFloatOrNull('f-underbust') : null,
      notes:     document.getElementById('f-notes').value.trim() || null,
    };

    setLoading(btn, true);
    try {
      await saveMeasurement(user.uid, data);
      showToast('บันทึกข้อมูลสำเร็จ!', 'success');
      window.location.hash = '#history';
    } catch (err) {
      console.error(err);
      showError('measure-error', 'บันทึกไม่สำเร็จ กรุณาลองใหม่');
      setLoading(btn, false);
    }
  });
}

function parseFloatOrNull(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const v = parseFloat(el.value);
  return isNaN(v) ? null : v;
}

function updateBMIDisplay(heightCm) {
  const weightVal = parseFloat(document.getElementById('f-weight').value);
  const wrapper   = document.getElementById('bmi-display-wrapper');
  const bmiValEl  = document.getElementById('bmi-value');
  const bmiCatEl  = document.getElementById('bmi-category');

  if (!weightVal || weightVal < 10) {
    wrapper.style.display = 'none';
    return;
  }

  const bmi = calculateBMI(weightVal, heightCm);
  const cat = getBMICategory(bmi);
  wrapper.style.display = 'block';
  bmiValEl.textContent  = bmi;
  if (cat) {
    bmiCatEl.textContent         = cat.label;
    bmiCatEl.style.color         = cat.color;
    bmiCatEl.style.background    = cat.bg;
  }
}

// ===== SVG INTERACTIVITY =====

function setupDiagramInteractivity() {
  // Highlight SVG group when input is focused
  document.querySelectorAll('.measure-input-group[data-field]').forEach(group => {
    const field  = group.dataset.field;
    const inputs = group.querySelectorAll('input');

    inputs.forEach(input => {
      input.addEventListener('focus', () => highlightField(field));
      input.addEventListener('blur',  () => clearHighlights());
    });
  });
}

function highlightField(fieldKey) {
  clearHighlights();
  const svgGroup = document.querySelector(`.measure-group[data-field="${fieldKey}"]`);
  if (!svgGroup) return;

  svgGroup.querySelectorAll('.m-line, .m-dot, .c-line, .m-text').forEach(el => {
    el.classList.add('hl');
  });

  const formGroup = document.querySelector(`.measure-input-group[data-field="${fieldKey}"]`);
  if (formGroup) formGroup.classList.add('active');
}

function clearHighlights() {
  document.querySelectorAll('.hl').forEach(el => el.classList.remove('hl'));
  document.querySelectorAll('.measure-input-group.active').forEach(el => el.classList.remove('active'));
}
