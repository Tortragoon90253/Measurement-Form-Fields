// ===== ADMIN PANEL =====

async function initAdmin() {
  const { profile } = window.appState;
  if (!profile || !profile.isAdmin) {
    window.location.hash = '#dashboard';
    return;
  }

  const content = document.getElementById('admin-content');
  content.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>กำลังโหลด...</p></div>';

  try {
    const users = await getAllUsers();
    content.innerHTML = renderAdminPanel(users);
    bindAdminActions();
  } catch (err) {
    console.error(err);
    content.innerHTML = `
      <div class="empty-state">
        <p style="color:var(--danger)">โหลดข้อมูลไม่สำเร็จ</p>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.5rem">
          กรุณาตรวจสอบ Firestore Security Rules ให้ Admin มีสิทธิ์อ่าน collection users
        </p>
      </div>`;
  }
}

function renderAdminPanel(users) {
  const nonAdmin = users.filter(u => !u.isAdmin);
  const rows = users.map(u => `
    <tr>
      <td><strong>${u.username || '-'}</strong></td>
      <td>${u.displayName || '-'}</td>
      <td>${u.gender === 'male' ? 'ชาย' : 'หญิง'}</td>
      <td>${u.heightCm ? u.heightCm + ' cm' : '-'}</td>
      <td>
        ${u.isAdmin
          ? '<span class="badge badge--admin">Admin</span>'
          : '<span class="badge badge--user">ผู้ใช้</span>'}
      </td>
      <td>${formatDate(u.createdAt)}</td>
      <td class="td-actions" style="display:flex;gap:0.25rem;justify-content:flex-end">
        ${!u.isAdmin ? `
          <button class="btn btn-secondary btn-sm admin-reset-pw-btn"
            data-uid="${u.uid}" data-username="${u.username || u.uid}"
            title="เปลี่ยนรหัสผ่าน" style="padding:0.35rem 0.6rem;font-size:0.8rem">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            รหัสผ่าน
          </button>
          <button class="btn btn-danger" data-delete-uid="${u.uid}" data-username="${u.username || u.uid}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            ลบ
          </button>` : '<span class="td-muted">–</span>'}
      </td>
    </tr>`).join('');

  return `
    <!-- Password Reset Modal -->
    <div id="admin-pw-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <h3>เปลี่ยนรหัสผ่าน</h3>
          <button class="modal-close" id="admin-modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom:1rem;color:var(--text-muted);font-size:0.9rem">
            ผู้ใช้: <strong id="admin-modal-username" style="color:var(--text)"></strong>
          </p>
          <div class="form-group">
            <label>รหัสผ่านใหม่ <span class="required">*</span></label>
            <div class="input-with-icon">
              <input type="password" id="admin-new-pw" placeholder="อย่างน้อย 6 ตัวอักษร" minlength="6">
              <button type="button" class="toggle-password" data-target="admin-new-pw" aria-label="แสดง/ซ่อน">
                <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label>ยืนยันรหัสผ่าน <span class="required">*</span></label>
            <div class="input-with-icon">
              <input type="password" id="admin-confirm-pw" placeholder="พิมพ์รหัสผ่านอีกครั้ง">
              <button type="button" class="toggle-password" data-target="admin-confirm-pw" aria-label="แสดง/ซ่อน">
                <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-error hidden" id="admin-pw-error"></div>
          <p style="margin-top:0.75rem;font-size:0.78rem;color:var(--text-muted)">
            รหัสผ่านใหม่จะมีผลเมื่อผู้ใช้ Login ครั้งถัดไป
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="admin-modal-cancel">ยกเลิก</button>
          <button class="btn btn-primary" id="admin-modal-confirm">
            <span class="btn-text">บันทึก</span>
            <span class="btn-spinner hidden"></span>
          </button>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:1.25rem 1.25rem 0">
        <h3 style="font-size:1rem;font-weight:700">ผู้ใช้ทั้งหมด
          <span style="font-size:0.85rem;font-weight:400;color:var(--text-muted)">
            (${users.length} บัญชี / ผู้ใช้ทั่วไป ${nonAdmin.length} คน)
          </span>
        </h3>
        <p style="font-size:0.78rem;color:var(--text-muted)">* การลบจะลบข้อมูลใน Firestore</p>
      </div>
      <div class="table-wrapper" style="margin-top:1rem">
        <table id="admin-table">
          <thead>
            <tr>
              <th>Username</th><th>ชื่อ-นามสกุล</th><th>เพศ</th>
              <th>ส่วนสูง</th><th>บทบาท</th><th>วันที่สมัคร</th>
              <th class="td-actions">จัดการ</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function bindAdminActions() {
  let _targetUid = null;

  // Delete buttons
  document.querySelectorAll('[data-delete-uid]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const uid = btn.dataset.deleteUid;
      const username = btn.dataset.username;
      if (!confirm(`ลบบัญชี "${username}" และข้อมูลสัดส่วนทั้งหมด?\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) return;
      btn.disabled = true; btn.textContent = 'กำลังลบ...';
      try {
        await deleteUserData(uid);
        showToast(`ลบบัญชี ${username} สำเร็จ`, 'success');
        btn.closest('tr').style.opacity = '0.4';
        setTimeout(() => btn.closest('tr').remove(), 400);
      } catch (err) {
        console.error(err);
        showToast('ลบไม่สำเร็จ กรุณาตรวจสอบ Firestore Rules', 'error');
        btn.disabled = false; btn.textContent = 'ลบ';
      }
    });
  });

  // Password reset buttons
  const modal = document.getElementById('admin-pw-modal');
  const closeModal = () => {
    modal.classList.add('hidden');
    document.getElementById('admin-new-pw').value = '';
    document.getElementById('admin-confirm-pw').value = '';
    hideError('admin-pw-error');
    _targetUid = null;
  };

  document.querySelectorAll('.admin-reset-pw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _targetUid = btn.dataset.uid;
      document.getElementById('admin-modal-username').textContent = btn.dataset.username;
      modal.classList.remove('hidden');
      document.getElementById('admin-new-pw').focus();
    });
  });

  document.getElementById('admin-modal-close').addEventListener('click', closeModal);
  document.getElementById('admin-modal-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Toggle password visibility in modal
  modal.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  document.getElementById('admin-modal-confirm').addEventListener('click', async () => {
    const newPw  = document.getElementById('admin-new-pw').value;
    const confPw = document.getElementById('admin-confirm-pw').value;
    hideError('admin-pw-error');

    if (newPw.length < 6) { showError('admin-pw-error', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (newPw !== confPw) { showError('admin-pw-error', 'รหัสผ่านและการยืนยันไม่ตรงกัน'); return; }
    if (!_targetUid)      { showError('admin-pw-error', 'เกิดข้อผิดพลาด กรุณาลองใหม่'); return; }

    const confirmBtn = document.getElementById('admin-modal-confirm');
    setLoading(confirmBtn, true);
    try {
      await setPendingPasswordReset(_targetUid, newPw);
      showToast('ตั้งรหัสผ่านใหม่สำเร็จ จะมีผลเมื่อผู้ใช้ Login ครั้งถัดไป', 'success');
      closeModal();
    } catch (err) {
      console.error(err);
      showError('admin-pw-error', 'บันทึกไม่สำเร็จ กรุณาตรวจสอบ Firestore Rules');
    } finally {
      setLoading(confirmBtn, false);
    }
  });
}
