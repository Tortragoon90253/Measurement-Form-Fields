// ===== BODY SHAPE SIMULATION =====

function estimateTargetRecord(latest, targetWeightKg) {
  if (!targetWeightKg || !latest || !latest.weightKg) return null;
  const ratio = Math.cbrt(targetWeightKg / latest.weightKg);
  const keys = ['chest', 'bust', 'underbust', 'waist', 'hips',
                 'shoulders', 'thighL', 'thighR', 'upperArmL', 'upperArmR'];
  const result = { weightKg: Math.round(targetWeightKg * 10) / 10 };
  keys.forEach(k => {
    if (latest[k] != null) result[k] = Math.round(latest[k] * ratio * 10) / 10;
  });
  return result;
}

function _simDefaults(gender) {
  return gender === 'female'
    ? { shoulders: 96, bust: 90, underbust: 76, chest: 84, waist: 72, hips: 97, thigh: 55, upperArm: 28 }
    : { shoulders: 108, chest: 95, waist: 80, hips: 94, thigh: 52, upperArm: 30 };
}

function _computeWidths(record, profile, gender) {
  const heightCm = (profile && profile.heightCm) || 170;
  const def = _simDefaults(gender);

  function hw(circ, fallback) {
    const c = (circ != null) ? circ : fallback;
    return Math.min(55, Math.max(4, (c / (2 * Math.PI) / heightCm) * 320 * 0.85));
  }

  const thigh = ((record.thighL != null ? record.thighL : def.thigh) +
                 (record.thighR != null ? record.thighR : def.thigh)) / 2;
  const thHW  = hw(thigh, def.thigh);
  const neckCirc = gender === 'female' ? 33 : 38;

  return {
    headR:       (7.5 / heightCm) * 320 * 0.85,
    neckHW:      hw(null, neckCirc),
    shoulderHW:  hw(record.shoulders, def.shoulders),
    chestHW:     gender === 'female'
                   ? hw(record.bust != null ? record.bust : record.chest, def.bust)
                   : hw(record.chest, def.chest),
    underbustHW: gender === 'female' ? hw(record.underbust, def.underbust) : null,
    waistHW:     hw(record.waist, def.waist),
    hipsHW:      hw(record.hips, def.hips),
    thighHW:     thHW,
    kneeHW:      thHW * 0.72,
    calfHW:      thHW * 0.60,
    ankleHW:     thHW * 0.30,
  };
}

function _f(n) { return Math.round(n * 10) / 10; }

function _seg(x1, y1, x2, y2, t) {
  if (t == null) t = 0.33;
  const dy = y2 - y1;
  return `C ${_f(x1)},${_f(y1+dy*t)} ${_f(x2)},${_f(y2-dy*t)} ${_f(x2)},${_f(y2)}`;
}

function _buildBodyPath(w, gender) {
  const cx = 60;

  // Y anchors (in 320-unit SVG)
  const yHT=2, yCh=32, yNB=42, ySh=56, yAp=76, yCs=93;
  const yUb=109, yWa=138, yHi=173, yCr=202, yMT=228;
  const yKn=252, yCa=278, yAn=304, yFt=319;

  const headR = w.headR;
  const nHW   = w.neckHW;
  const shHW  = w.shoulderHW;
  const csHW  = w.chestHW;
  const ubHW  = w.underbustHW != null ? w.underbustHW : w.waistHW;
  const waHW  = w.waistHW;
  const hiHW  = w.hipsHW;
  const thHW  = w.thighHW;
  const knHW  = w.kneeHW;
  const caHW  = w.calfHW;
  const anHW  = w.ankleHW;
  const ftHW  = Math.min(55, anHW * 1.45);
  const isFem = gender === 'female';

  // Right side: top → bottom
  const R = [
    `M ${cx},${yHT}`,
    // Head arc (right half)
    `C ${_f(cx+headR)},${yHT} ${_f(cx+headR)},${yCh} ${cx},${yCh}`,
    // Neck
    _seg(cx,           yCh, cx+nHW,        yNB,  0.40),
    // Shoulder (widens)
    _seg(cx+nHW,       yNB, cx+shHW,       ySh,  0.45),
    // Armpit (slight inward from shoulder to armpit)
    _seg(cx+shHW,      ySh, cx+csHW*0.85,  yAp,  0.40),
    // Chest / Bust (outward)
    _seg(cx+csHW*0.85, yAp, cx+csHW,       yCs,  0.45),
  ];

  if (isFem) {
    R.push(_seg(cx+csHW, yCs, cx+ubHW, yUb, 0.50)); // underbust
    R.push(_seg(cx+ubHW, yUb, cx+waHW, yWa, 0.45)); // waist
  } else {
    R.push(_seg(cx+csHW, yCs, cx+waHW, yWa, 0.45));
  }

  R.push(
    _seg(cx+waHW,       yWa, cx+hiHW,       yHi,  0.42),
    _seg(cx+hiHW,       yHi, cx+thHW,       yCr,  0.38),
    _seg(cx+thHW,       yCr, cx+thHW*0.97,  yMT,  0.50),
    _seg(cx+thHW*0.97,  yMT, cx+knHW,       yKn,  0.40),
    _seg(cx+knHW,       yKn, cx+caHW,       yCa,  0.45),
    _seg(cx+caHW,       yCa, cx+anHW,       yAn,  0.35),
    `L ${_f(cx+ftHW)},${yFt}`,
  );

  // Left side: bottom → top (mirror)
  const Lsegs = [
    [cx-anHW,      yAn, cx-caHW,      yCa,  0.35],
    [cx-caHW,      yCa, cx-knHW,      yKn,  0.45],
    [cx-knHW,      yKn, cx-thHW*0.97, yMT,  0.40],
    [cx-thHW*0.97, yMT, cx-thHW,      yCr,  0.50],
    [cx-thHW,      yCr, cx-hiHW,      yHi,  0.38],
    [cx-hiHW,      yHi, cx-waHW,      yWa,  0.42],
  ];

  if (isFem) {
    Lsegs.push([cx-waHW, yWa, cx-ubHW, yUb, 0.45]);
    Lsegs.push([cx-ubHW, yUb, cx-csHW, yCs, 0.50]);
  } else {
    Lsegs.push([cx-waHW, yWa, cx-csHW, yCs, 0.45]);
  }

  Lsegs.push(
    [cx-csHW,      yCs, cx-csHW*0.85, yAp, 0.45],
    [cx-csHW*0.85, yAp, cx-shHW,      ySh, 0.40],
    [cx-shHW,      ySh, cx-nHW,       yNB, 0.45],
    [cx-nHW,       yNB, cx,           yCh, 0.40],
  );

  const L = [
    `L ${_f(cx-ftHW)},${yFt}`,
    ...Lsegs.map(([x1,y1,x2,y2,t]) => _seg(x1,y1,x2,y2,t)),
    // Head arc (left half) back to top
    `C ${_f(cx-headR)},${yCh} ${_f(cx-headR)},${yHT} ${cx},${yHT}`,
    'Z',
  ];

  return R.join(' ') + ' ' + L.join(' ');
}

function _buildGhostRecord(gender) {
  const def = _simDefaults(gender);
  return {
    shoulders: def.shoulders,
    chest:     def.chest,
    bust:      def.bust,
    underbust: def.underbust,
    waist:     def.waist,
    hips:      def.hips,
    thighL:    def.thigh,
    thighR:    def.thigh,
  };
}

function _buildSimPanel(cfg, profile, gender) {
  const { label, record, color, disabled, note } = cfg;

  if (disabled || !record) {
    const w = _computeWidths(_buildGhostRecord(gender), profile, gender);
    const d = _buildBodyPath(w, gender);
    return `
      <div class="sim-panel sim-panel--disabled">
        <div class="sim-panel__label" style="color:${color}">${label}</div>
        <div class="sim-panel__svg-wrap">
          <svg viewBox="0 0 120 320" class="sim-svg" aria-hidden="true">
            <path d="${d}" fill="${color}" fill-opacity="0.10"
                  stroke="${color}" stroke-width="1.5" stroke-opacity="0.28"/>
          </svg>
        </div>
        ${note ? `<div class="sim-panel__note">${note}</div>` : ''}
      </div>`;
  }

  const w = _computeWidths(record, profile, gender);
  const d = _buildBodyPath(w, gender);

  const weightStr = record.weightKg != null ? `${record.weightKg} kg` : '';
  const waistStr  = record.waist    != null ? `เอว ${record.waist} cm` : '';

  return `
    <div class="sim-panel">
      <div class="sim-panel__label" style="color:${color}">${label}</div>
      <div class="sim-panel__svg-wrap">
        <svg viewBox="0 0 120 320" class="sim-svg" aria-hidden="true">
          <path d="${d}" fill="${color}" fill-opacity="0.20"
                stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="sim-panel__stats">
        ${weightStr ? `<span>${weightStr}</span>` : ''}
        ${waistStr  ? `<span>${waistStr}</span>`  : ''}
      </div>
    </div>`;
}

function renderBodySimulation(containerId, records, profile) {
  const container = document.getElementById(containerId);
  if (!container || !records || !records.length) return;

  const gender         = (profile && profile.gender) || 'male';
  const targetWeightKg = profile && profile.targetWeightKg;
  const latest         = records[0];
  const oldest         = records[records.length - 1];
  const hasMultiple    = records.length > 1;
  const targetRecord   = estimateTargetRecord(latest, targetWeightKg);

  const panels = [
    {
      label:    'ก่อน',
      record:   hasMultiple ? oldest : null,
      color:    '#94AAB8',
      disabled: !hasMultiple,
      note:     !hasMultiple ? 'บันทึกอย่างน้อย 2 ครั้ง<br>เพื่อดูการเปลี่ยนแปลง' : null,
    },
    {
      label:    'ตอนนี้',
      record:   latest,
      color:    '#2E86AB',
      disabled: false,
    },
    {
      label:    'เป้าหมาย',
      record:   targetRecord,
      color:    '#2DC653',
      disabled: !targetRecord,
      note:     !targetWeightKg ? 'ตั้งน้ำหนักเป้าหมาย<br>ในส่วน BMI ด้านล่าง' : null,
    },
  ];

  const panelsHTML = panels.map(p => _buildSimPanel(p, profile, gender)).join('');

  container.innerHTML = `
    <div class="chart-card">
      <h3>จำลองรูปร่างร่างกาย</h3>
      <p class="sim-card__subtitle">เปรียบเทียบสัดส่วน ก่อน · ปัจจุบัน · เป้าหมาย</p>
      <div class="sim-panels">${panelsHTML}</div>
      <p class="sim-card__note">* รูปร่างเป้าหมายประมาณการจากน้ำหนักเป้าหมายโดยใช้ cube-root scaling</p>
    </div>`;
}
