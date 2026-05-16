// ══════════════════════════════════════════════════════════
//  config.js  —  Auth: HttpOnly cookie (JWT) + localStorage (profile only)
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
   credentials:'include' → HttpOnly cookie sent automatically
   JWT is NEVER touched by JavaScript (XSS-safe)          */
async function apiCall(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    credentials: 'include',          // sends HttpOnly cookie automatically
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

/* ── Fix 3: Auth guards — localStorage is UI cache only.
   requireAuth() checks localStorage for fast redirect,
   but the REAL auth is the HttpOnly cookie validated server-side.
   If the cookie is missing, /api/auth/me will fail and
   the app gracefully handles it.                          */
function requireAuth() {
  if (!localStorage.getItem('smm_user')) window.location.replace('/login');
}
function redirectIfLoggedIn() {
  if (localStorage.getItem('smm_user')) window.location.replace('/');
}

/* ── Logout: always call server to clear cookie ──────────*/
async function logout() {
  try { await apiCall('/api/auth/logout', 'POST'); } catch (_) {}
  localStorage.removeItem('smm_user');
  window.location.replace('/login');
}

/* ── XSS Fix: sanitize before any innerHTML insertion ────*/
function sanitizeHTML(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"'`]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#x27;', '`': '&#x60;',
  }[c]));
}

/* ── Utilities ────────────────────────────────────────────*/
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
