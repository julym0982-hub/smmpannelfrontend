// ══════════════════════════════════════════════
//  config.js — API URL + shared helpers
// ══════════════════════════════════════════════

/* Auto-detect API URL:
   - localhost / 127.0.0.1  → local dev server
   - otherwise              → production Render backend  */
const CONFIG = {
  API_URL: (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )
    ? 'http://localhost:5000'
    : 'https://smmpannelbackend.onrender.com',
};

/* ── API call helper ────────────────────────── */
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('smm_token');
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body)  opts.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${CONFIG.API_URL}${endpoint}`, opts);
  } catch {
    throw new Error('Cannot connect to server. Check your internet connection.');
  }

  // Guard against non-JSON responses (HTML error pages)
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(`Server error (HTTP ${response.status}). Please try again.`);
  }

  let data;
  try { data = await response.json(); }
  catch { throw new Error('Server returned an invalid response.'); }

  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

/* ── MMK formatter ──────────────────────────── */
function fmtMMK(v) {
  return Math.round(v || 0).toLocaleString() + ' Ks';
}

/* ── Auth guards ─────────────────────────────── */
function requireAuth() {
  if (!localStorage.getItem('smm_token')) window.location.replace('/login');
}
function redirectIfLoggedIn() {
  if (localStorage.getItem('smm_token')) window.location.replace('/');
}

/* ── Misc helpers ────────────────────────────── */
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
  btn.innerHTML = loading ? `<span class="spinner"></span> Please wait...` : defaultText;
}
