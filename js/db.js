// ===== FIRESTORE CRUD =====

async function getUserProfile(uid) {
  const snap = await db.collection('users').doc(uid).get();
  return snap.exists ? snap.data() : null;
}

async function saveUserProfile(uid, data) {
  await db.collection('users').doc(uid).set(data, { merge: true });
}

async function isUsernameTaken(username) {
  const snap = await db.collection('usernames').doc(username.toLowerCase()).get();
  return snap.exists;
}

async function reserveUsername(username, uid) {
  await db.collection('usernames').doc(username.toLowerCase()).set({ uid });
}

async function saveMeasurement(uid, data) {
  return db.collection('users').doc(uid).collection('measurements').add(data);
}

async function getMeasurements(uid, limitCount = 0) {
  let q = db.collection('users').doc(uid).collection('measurements').orderBy('date', 'desc');
  if (limitCount > 0) q = q.limit(limitCount);
  const snap = await q.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getLatestMeasurement(uid) {
  const results = await getMeasurements(uid, 1);
  return results[0] || null;
}

async function deleteMeasurement(uid, docId) {
  return db.collection('users').doc(uid).collection('measurements').doc(docId).delete();
}

// ===== ADMIN FUNCTIONS =====

async function getAllUsers() {
  const snap = await db.collection('users').orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

async function deleteUserData(uid) {
  const profile = await getUserProfile(uid);
  const measSnap = await db.collection('users').doc(uid).collection('measurements').get();
  for (let i = 0; i < measSnap.docs.length; i += 400) {
    const batch = db.batch();
    measSnap.docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  if (profile && profile.username) {
    await db.collection('usernames').doc(profile.username.toLowerCase()).delete();
  }
  await db.collection('users').doc(uid).delete();
}
