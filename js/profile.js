// ===== USER PROFILE PAGE =====

async function initProfile() {
  const { user, profile } = window.appState;
  const content = document.getElementById('profile-content');
  if (!profile) {
    content.innerHTML = '<p style="color:var(--danger)">ไม่พบข้อมูลผู้ใช้</p>';
    return;
  }
  content.innerHTML = renderProfilePage(profile);
  bindProfileForms(user, profile);
}

function renderProfilePage(profile) {
  const bmiNote = `BMI คำนวณจาก: <strong>น้ำหนัก (kg) ÷ ส่วนสูง (m)²</strong>
    เช่น น้ำหนัก 70 kg ส่วนสูง 170 cm → BMI = 70 ÷ (1.70²) = <strong>24.2</strong>`;

  return `
  <div class="profile-layout">

    <!-- ===== ข้อมูลส่วนตัว ===== -->
    <div class="profile-card">
      <h3 class="profile-section-title">ข้อมูลส่วนตัว</h3>
      <form id="profile-info-form" novalidate>
        <div class="form-group">
          <label>ชื่อผู้ใช้ (Username)</label>
          <input type="text" value="${profile.username || ''}" disabled
            style="background:var(--surface);color:var(--text-muted);cursor:not-allowed">
          <span class="field-hint">ไม่สามารถเปลี่ยน Username ได้</span>
        </div>
        <div class="form-row">
          <div class="form-group" style="margin-bottom:0">
            <label for="profile-displayname">ชื่อ-นามสกุล <span class="required">*</span></label>
            <input type="text" id="profile-displayname" value="${profile.displayName || ''}"
              placeholder="ชื่อ นามสกุล" autocomplete="name" required>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label>เพศ <span class="required">*</span></label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="profile-gender" value="male" ${profile.gender === 'male' ? 'checked' : ''}>
                <span class="radio-custom"></span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>
                ชาย
              </label>
              <label class="radio-label">
                <input type="radio" name="profile-gender" value="female" ${profile.gender === 'female' ? 'checked' : ''}>
                <span class="radio-custom"></span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 21h6M12 18v-3"/></svg>
                หญิง
              </label>
            </div>
          </div>
        </div>

        <div style="margin-top:1.25rem">
          <h4 class="profile-subsection">ข้อมูลสำหรับคำนวณ BMI</h4>
          <div class="bmi-explain-box">${bmiNote}</div>
          <div class="form-row" style="margin-top:1rem">
            <div class="form-group" style="margin-bottom:0">
              <label for="profile-height">ส่วนสูง (cm) <span class="required">*</span></label>
              <input type="number" id="profile-height" value="${profile.heightCm || ''}"
                min="100" max="250" step="0.5" placeholder="เช่น 170" required>
              <span class="field-hint">ใช้คำนวณ BMI ทุกการบันทึก</span>
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label>BMI ปัจจุบัน (ตัวอย่าง)</label>
              <div id="profile-bmi-preview" class="bmi-preview-box">
                <span style="color:var(--text-muted);font-size:0.9rem">กรอกน้ำหนักล่าสุดเพื่อดูตัวอย่าง</span>
              </div>
              <span class="field-hint">อัปเดตส่วนสูง → BMI ใหม่ใช้ค่าที่อัปเดต</span>
            </div>
          </div>
        </div>

        <div class="form-error hidden" id="profile-info-error"></div>
        <div style="margin-top:1.25rem">
          <button type="submit" class="btn btn-primary" id="profile-info-btn">
            <span class="btn-text">บันทึกข้อมูล</span>
            <span class="btn-spinner hidden"></span>
          </button>
        </div>
      </form>
    </div>

    <!-- ===== เปลี่ยนรหัสผ่าน ===== -->
    <div class="profile-card">
      <h3 class="profile-section-title">เปลี่ยนรหัสผ่าน</h3>
      <form id="profile-pw-form" novalidate>
        <div class="form-group">
          <label for="profile-current-pw">รหัสผ่านปัจจุบัน <span class="required">*</span></label>
          <div class="input-with-icon">
            <input type="password" id="profile-current-pw" placeholder="รหัสผ่านที่ใช้อยู่" autocomplete="current-password">
            <button type="button" class="toggle-password" data-target="profile-current-pw" aria-label="แสดง/ซ่อน">
              <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label for="profile-new-pw">รหัสผ่านใหม่ <span class="required">*</span></label>
          <div class="input-with-icon">
            <input type="password" id="profile-new-pw" placeholder="อย่างน้อย 6 ตัวอักษร" minlength="6" autocomplete="new-password">
            <button type="button" class="toggle-password" data-target="profile-new-pw" aria-label="แสดง/ซ่อน">
              <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label for="profile-confirm-pw">ยืนยันรหัสผ่านใหม่ <span class="required">*</span></label>
          <div class="input-with-icon">
            <input type="password" id="profile-confirm-pw" placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง" autocomplete="new-password">
            <button type="button" class="toggle-password" data-target="profile-confirm-pw" aria-label="แสดง/ซ่อน">
              <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div class="form-error hidden" id="profile-pw-error"></div>
        <button type="submit" class="btn btn-primary" id="profile-pw-btn">
          <span class="btn-text">เปลี่ยนรหัสผ่าน</span>
          <span class="btn-spinner hidden"></span>
        </button>
      </form>
    </div>

  </div>`;
}

function bindProfileForms(user, profile) {
  // Toggle password visibility
  document.querySelectorAll('#profile-content .toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  // ===== Profile info form =====
  document.getElementById('profile-info-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('profile-info-error');
    const btn         = document.getElementById('profile-info-btn');
    const displayName = document.getElementById('profile-displayname').value.trim();
    const genderEl    = document.querySelector('input[name="profile-gender"]:checked');
    const heightCm    = parseFloat(document.getElementById('profile-height').value);

    if (!displayName)          { showError('profile-info-error', 'กรุณากรอกชื่อ-นามสกุล'); return; }
    if (!genderEl)             { showError('profile-info-error', 'กรุณาเลือกเพศ'); return; }
    if (!heightCm || heightCm < 100 || heightCm > 250) {
      showError('profile-info-error', 'กรุณากรอกส่วนสูงที่ถูกต้อง (100–250 cm)'); return;
    }

    setLoading(btn, true);
    try {
      await saveUserProfile(user.uid, { displayName, gender: genderEl.value, heightCm });
      await user.updateProfile({ displayName });
      // Update local appState
      window.appState.profile = { ...window.appState.profile, displayName, gender: genderEl.value, heightCm };
      showNav(displayName, !!(window.appState.profile && window.appState.profile.isAdmin));
      showToast('บันทึกข้อมูลสำเร็จ', 'success');
    } catch (err) {
      console.error(err);
      showError('profile-info-error', 'บันทึกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoading(btn, false);
    }
  });

  // ===== Password change form =====
  document.getElementById('profile-pw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('profile-pw-error');
    const btn       = document.getElementById('profile-pw-btn');
    const currentPw = document.getElementById('profile-current-pw').value;
    const newPw     = document.getElementById('profile-new-pw').value;
    const confirmPw = document.getElementById('profile-confirm-pw').value;

    if (!currentPw)        { showError('profile-pw-error', 'กรุณากรอกรหัสผ่านปัจจุบัน'); return; }
    if (newPw.length < 6)  { showError('profile-pw-error', 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (newPw !== confirmPw) { showError('profile-pw-error', 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน'); return; }
    if (newPw === currentPw) { showError('profile-pw-error', 'รหัสผ่านใหม่ต้องต่างจากรหัสผ่านเดิม'); return; }

    setLoading(btn, true);
    try {
      // Re-authenticate before changing password (Firebase requirement)
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPw);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPw);
      showToast('เปลี่ยนรหัสผ่านสำเร็จ', 'success');
      document.getElementById('profile-pw-form').reset();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        showError('profile-pw-error', 'รหัสผ่านปัจจุบันไม่ถูกต้อง');
      } else {
        showError('profile-pw-error', 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่');
      }
    } finally {
      setLoading(btn, false);
    }
  });
}
