// ===== APPLICATION ENTRY POINT =====
// Shared state available to all page modules
window.appState = { user: null, profile: null };

auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const profile = await getUserProfile(user.uid);
      window.appState = { user, profile };

      showNav(profile ? profile.displayName : user.displayName);

      const currentHash = getHash();
      if (AUTH_ROUTES.includes(currentHash)) {
        window.location.hash = '#dashboard';
      } else {
        navigate(currentHash);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
  } else {
    window.appState = { user: null, profile: null };
    hideNav();
    const currentHash = getHash();
    if (!AUTH_ROUTES.includes(currentHash)) {
      window.location.hash = '#login';
    } else {
      navigate(currentHash);
    }
  }
});

// Initial navigation on page load
navigate(getHash());
