// ══════════════════════════════════════════════════════
//  config.js — API URL Configuration
//  ➜ Change API_URL below to your Render backend URL
// ══════════════════════════════════════════════════════

const CONFIG = {
  API_URL: "https://smmpannelbackend.onrender.com",
};

// ─── Helper: API call wrapper ─────────────────────────
async function apiCall(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("smm_token");

  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ─── Helper: Redirect if not logged in ───────────────
function requireAuth() {
  const token = localStorage.getItem("smm_token");
  if (!token) {
    window.location.href = "login.html";
  }
}

// ─── Helper: Redirect to dashboard if logged in ──────
function redirectIfLoggedIn() {
  const token = localStorage.getItem("smm_token");
  if (token) {
    window.location.href = "index.html";
  }
}

// ─── Helper: Show alert message ──────────────────────
function showAlert(id, message, type = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert show alert-${type}`;
  el.textContent = message;
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.className = "alert";
}

// ─── Helper: Toggle button loading state ─────────────
function setLoading(btnId, loading, defaultText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner"></span> Please wait...`
    : defaultText;
}
