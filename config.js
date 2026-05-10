// ══════════════════════════════════════════════
//  config.js — API URL + shared helpers
// ══════════════════════════════════════════════
const CONFIG = {
  API_URL: "https://smmpannelbackend.onrender.com",
};

/* ── API call helper ────────────────────────── */
async function apiCall(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("smm_token");

  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;
  if (body)  opts.body = JSON.stringify(body);

  let response, data;
  try {
    response = await fetch(`${CONFIG.API_URL}${endpoint}`, opts);
  } catch {
    throw new Error("Cannot connect to server. Check your internet or try again.");
  }

  try {
    data = await response.json();
  } catch {
    throw new Error("Server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

/* ── Auth guards ────────────────────────────── */

// ဒီ page ကို Login မဝင်ဘဲ access မလုပ်ရ (dashboard pages)
function requireAuth() {
  if (!localStorage.getItem("smm_token")) {
    window.location.replace("/login");   // clean URL
  }
}

// Login ဝင်ပြီးသားဆိုရင် login page ကို ပြန်မဖွင့်ရ
function redirectIfLoggedIn() {
  if (localStorage.getItem("smm_token")) {
    window.location.replace("/");        // dashboard root
  }
}

/* ── Alert / loading helpers ────────────────── */
function showAlert(id, msg, type = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert show alert-${type}`;
  el.textContent = msg;
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.className = "alert";
}

function setLoading(btnId, loading, defaultText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner"></span> Please wait...`
    : defaultText;
}
