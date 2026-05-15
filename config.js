// ══════════════════════════════════════════════════════════
//  config.js — API URL + shared helpers
//  JWT stored in HttpOnly cookie (server-managed, XSS-safe)
// ══════════════════════════════════════════════════════════
const CONFIG = {
  API_URL: (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )
    ? 'http://localhost:5000'
    : 'https://smmpannelbackend.onrender.com',
};

/* ── API call helper ─────────────────────────────────────
   credentials:'include' sends HttpOnly cookie automatically
   No manual token handling needed (XSS-safe)             */
async function apiCall(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    credentials: 'include',                // ← sends HttpOnly cookie
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${CONFIG.API_URL}${endpoint}`, opts);
  } catch {
    throw new Error('Cannot connect to server. Check your internet connection.');
  }

  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(`Server error (HTTP ${response.status}). Please try again.`);
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

/* ── Auth guards ─────────────────────────────────────────
   Use smm_user (non-sensitive profile data) from localStorage
   JWT token itself is NEVER in localStorage (XSS risk)   */
function requireAuth() {
  if (!localStorage.getItem('smm_user')) window.location.replace('/login');
}
function redirectIfLoggedIn() {
  // Try pinging /api/auth/me; cookie decides if session is valid
  apiCall('/api/auth/me').then(() => window.location.replace('/')).catch(() => {});
}

/* ── Logout ──────────────────────────────────────────────*/
async function logout() {
  try { await apiCall('/api/auth/logout', 'POST'); } catch (_) {}
  localStorage.removeItem('smm_user');
  window.location.replace('/login');
}

/* ── Utilities ───────────────────────────────────────────*/
function sanitizeHTML(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;' }[c]));
}
function debounce(fn, ms) {
  let t; return function(...a) { clearTimeout(t); t = setTimeout(() => fn(...a), ms || 300); };
}
function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert show alert-${type}`;
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
