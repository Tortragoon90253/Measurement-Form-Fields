// ===== HASH-BASED ROUTER =====

const AUTH_ROUTES    = ['login', 'register'];
const GUARDED_ROUTES = ['dashboard', 'add', 'history'];

function getHash() {
  return (window.location.hash || '#login').replace('#', '') || 'login';
}

function navigate(page) {
  const user = auth.currentUser;

  if (GUARDED_ROUTES.includes(page) && !user) {
    window.location.hash = '#login';
    return;
  }
  if (AUTH_ROUTES.includes(page) && user) {
    window.location.hash = '#dashboard';
    return;
  }
  if (!AUTH_ROUTES.includes(page) && !GUARDED_ROUTES.includes(page)) {
    window.location.hash = user ? '#dashboard' : '#login';
    return;
  }

  showPage(page);
  onPageEnter(page);
}

function onPageEnter(page) {
  if (page === 'dashboard') initDashboard();
  if (page === 'add')       initAddMeasurement();
  if (page === 'history')   initHistory();
}

window.addEventListener('hashchange', () => navigate(getHash()));
