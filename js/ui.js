// ===== UI UTILITIES =====

let _toastTimer = null;

function showToast(message, type = 'default', duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast toast--show';
  if (type !== 'default') toast.classList.add(`toast--${type}`);
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    toast.classList.remove('toast--show');
  }, duration);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.remove('hidden');

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });

  // Close mobile menu
  closeNav();
  window.scrollTo(0, 0);
}

function showNav(username) {
  const nav = document.getElementById('main-nav');
  nav.classList.remove('hidden');
  if (username) {
    document.getElementById('nav-username').textContent = username;
  }
}

function hideNav() {
  document.getElementById('main-nav').classList.add('hidden');
}

function closeNav() {
  const links = document.getElementById('nav-links');
  const btn   = document.getElementById('hamburger-btn');
  links.classList.remove('open');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

function setLoading(btnEl, isLoading) {
  const text    = btnEl.querySelector('.btn-text');
  const spinner = btnEl.querySelector('.btn-spinner');
  btnEl.disabled = isLoading;
  if (text)    text.classList.toggle('hidden', isLoading);
  if (spinner) spinner.classList.toggle('hidden', !isLoading);
}

function showError(elId, message) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

function hideError(elId) {
  const el = document.getElementById(elId);
  if (el) el.classList.add('hidden');
}

function formatDate(ts) {
  if (!ts) return '-';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateInput(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toISOString().split('T')[0];
}

function todayInputValue() {
  return new Date().toISOString().split('T')[0];
}

// Init hamburger toggle
document.addEventListener('DOMContentLoaded', () => {
  const btn   = document.getElementById('hamburger-btn');
  const links = document.getElementById('nav-links');
  if (btn && links) {
    btn.addEventListener('click', () => {
      const open = !links.classList.contains('open');
      links.classList.toggle('open', open);
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
});
