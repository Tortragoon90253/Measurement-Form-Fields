// ===== AUTHENTICATION =====
// Firebase Auth requires email, so we map username → username@bodytracker.app internally.
// Users only ever see/type their username.

function usernameToEmail(username) {
  return `${username.toLowerCase()}@bodytracker.app`;
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_]{4,20}$/.test(username);
}

async function registerUser(username, password, displayName, gender, heightCm) {
  // Validate username format
  if (!validateUsername(username)) {
    throw new Error('ชื่อผู้ใช้ต้องมี 4-20 ตัว และใช้เฉพาะ a-z, 0-9, _ เท่านั้น');
  }

  // Check uniqueness
  const taken = await isUsernameTaken(username);
  if (taken) throw new Error('ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่อผู้ใช้อื่น');

  const email = usernameToEmail(username);
  const cred  = await auth.createUserWithEmailAndPassword(email, password);
  const uid   = cred.user.uid;

  // Reserve username in Firestore (atomic with profile write)
  await reserveUsername(username, uid);

  // Save user profile
  await saveUserProfile(uid, {
    username:    username.toLowerCase(),
    displayName,
    gender,
    heightCm:   Number(heightCm),
    createdAt:  firebase.firestore.FieldValue.serverTimestamp()
  });

  // Set Firebase display name
  await cred.user.updateProfile({ displayName });

  return cred.user;
}

async function loginUser(username, password) {
  const email = usernameToEmail(username);
  try {
    return await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential') {
      throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
    if (err.code === 'auth/too-many-requests') {
      throw new Error('ลองเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่');
    }
    throw new Error('เกิดข้อผิดพลาด กรุณาลองใหม่');
  }
}

async function logoutUser() {
  await auth.signOut();
}

// ===== FORM HANDLERS =====

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('login-error');
  const btn      = document.getElementById('login-btn');
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) {
    showError('login-error', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
    return;
  }
  setLoading(btn, true);
  try {
    await loginUser(username, password);
    // onAuthStateChanged in main.js will handle redirect
  } catch (err) {
    showError('login-error', err.message);
    setLoading(btn, false);
  }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('register-error');
  const btn         = document.getElementById('register-btn');
  const username    = document.getElementById('reg-username').value.trim();
  const displayName = document.getElementById('reg-displayname').value.trim();
  const password    = document.getElementById('reg-password').value;
  const confirm     = document.getElementById('reg-confirm').value;
  const genderEl    = document.querySelector('input[name="gender"]:checked');
  const heightCm    = parseFloat(document.getElementById('reg-height').value);

  if (!username || !displayName || !password || !confirm || !genderEl || !heightCm) {
    showError('register-error', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
    return;
  }
  if (password !== confirm) {
    showError('register-error', 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
    return;
  }
  if (password.length < 6) {
    showError('register-error', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    return;
  }
  if (heightCm < 100 || heightCm > 250) {
    showError('register-error', 'กรุณากรอกส่วนสูงที่ถูกต้อง (100-250 cm)');
    return;
  }

  setLoading(btn, true);
  try {
    await registerUser(username, password, displayName, genderEl.value, heightCm);
    // onAuthStateChanged will handle redirect
  } catch (err) {
    showError('register-error', err.message);
    setLoading(btn, false);
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await logoutUser();
});
