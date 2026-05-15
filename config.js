// ══════════════════════════════════════════════════════════
//  config.js — Auth state: HttpOnly cookie (JWT) + localStorage (user profile)
//
//  Flow:
//    Login  → server sets HttpOnly cookie + returns user data
//             → frontend saves user data to localStorage (smm_user)
//    Check  → requireAuth()       checks localStorage.smm_user (sync, fast)
//    Check  → redirectIfLoggedIn() checks localStorage.smm_user (sync, fast)
//    Logout → POST /api/auth/logout clears cookie
//             → frontend clears localStorage
// ══════════════════════════════════════════════════════════

const CONFIG = {
  API_URL: (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )
    ? 'http://localhost:5000'
    : 'https://smmpannelbackend.onrender.com',
};

/* ── API call ─────────────────────────────────────────────
   credentials:'include' → HttpOnly cookie sent automatically */
async function apiCall(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(CONFIG.API_URL + endpoint, opts);
  } catch {
    throw new Error('Cannot connect to server. Check your internet connection.');
  }

  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('application/json'))
    throw new Error('Server error (HTTP ' + response.status + '). Please try again.');

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

/* ── Auth guards (synchronous — no API calls, no loops) ─── */
function requireAuth() {
  if (!localStorage.getItem('smm_user'))
    window.location.replace('/login');
}

function redirectIfLoggedIn() {
  if (localStorage.getItem('smm_user'))
    window.location.replace('/');
}

/* ── Logout ───────────────────────────────────────────────*/
async function logout() {
  try { await apiCall('/api/auth/logout', 'POST'); } catch (_) {}
  localStorage.removeItem('smm_user');
  window.location.replace('/login');
}

/* ── Utilities ────────────────────────────────────────────*/
function sanitizeHTML(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c]));
}
function debounce(fn, ms) {
  let t;
  return function (...a) { clearTimeout(t); t = setTimeout(() => fn(...a), ms || 300); };
}
function showAlert(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'alert show alert-' + (type || 'error');
  el.textContent = msg;
}
function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.className = 'alert';
}
function setLoading(btnId, loading, defaultText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<span class="spinner"></span> Please wait...'
    : defaultText;
}
