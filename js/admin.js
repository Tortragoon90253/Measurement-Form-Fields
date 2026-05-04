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
      <td class="td-actions">
        ${!u.isAdmin
          ? `<button class="btn btn-danger" data-delete-uid="${u.uid}" data-username="${u.username || u.uid}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
              ลบ
            </button>`
          : '<span class="td-muted">–</span>'}
      </td>
    </tr>`).join('');

  return `
    <div class="table-card">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:1.25rem 1.25rem 0">
        <div>
          <h3 style="font-size:1rem;font-weight:700">ผู้ใช้ทั้งหมด
            <span style="font-size:0.85rem;font-weight:400;color:var(--text-muted)">(${users.length} บัญชี / ผู้ใช้ทั่วไป ${nonAdmin.length} คน)</span>
          </h3>
        </div>
        <p style="font-size:0.78rem;color:var(--text-muted)">
          * การลบจะลบข้อมูลใน Firestore (Auth account ยังคงอยู่)
        </p>
      </div>
      <div class="table-wrapper" style="margin-top:1rem">
        <table id="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>ชื่อ-นามสกุล</th>
              <th>เพศ</th>
              <th>ส่วนสูง</th>
              <th>บทบาท</th>
              <th>วันที่สมัคร</th>
              <th class="td-actions">จัดการ</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function bindAdminActions() {
  document.querySelectorAll('[data-delete-uid]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const uid      = btn.dataset.deleteUid;
      const username = btn.dataset.username;
      if (!confirm(`ลบบัญชี "${username}" และข้อมูลสัดส่วนทั้งหมด?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) return;
      btn.disabled = true;
      btn.textContent = 'กำลังลบ...';
      try {
        await deleteUserData(uid);
        showToast(`ลบบัญชี ${username} สำเร็จ`, 'success');
        btn.closest('tr').style.opacity = '0.4';
        setTimeout(() => btn.closest('tr').remove(), 400);
      } catch (err) {
        console.error(err);
        showToast('ลบไม่สำเร็จ กรุณาตรวจสอบ Firestore Rules', 'error');
        btn.disabled = false;
        btn.textContent = 'ลบ';
      }
    });
  });
}
