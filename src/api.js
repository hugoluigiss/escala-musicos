// ─── Shared API client + admin auth ────────────────────────────────────────
// Backend: Express + Postgres at /api/data/:key (key-value store)
// Admin password is stored in localStorage after a successful /api/admin/login.

const ADMIN_PW_KEY = "admin_pw_v1";

export function getAdminPassword() {
  try { return localStorage.getItem(ADMIN_PW_KEY) || ""; } catch { return ""; }
}
export function setAdminPassword(pw) {
  try { localStorage.setItem(ADMIN_PW_KEY, pw); } catch {}
}
export function clearAdminPassword() {
  try { localStorage.removeItem(ADMIN_PW_KEY); } catch {}
}
export function isAdmin() {
  return !!getAdminPassword();
}

export async function adminLogin(password) {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  setAdminPassword(password);
  return true;
}

export async function apiGet(key) {
  try {
    const res = await fetch(`/api/data/${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("apiGet error", key, e);
    return null;
  }
}

export async function apiPut(key, value) {
  const headers = { "Content-Type": "application/json" };
  const pw = getAdminPassword();
  if (pw) headers["X-Admin-Password"] = pw;
  const res = await fetch(`/api/data/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ value }),
  });
  if (res.status === 401) {
    clearAdminPassword();
    throw new Error("unauthorized");
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
