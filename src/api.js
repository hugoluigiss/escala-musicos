// ─── Shared API client + admin auth ────────────────────────────────────────
// Backend: Express + Postgres at /api/data/:key (key-value store)
// Admin password is stored in localStorage after a successful login.
// A single password unifies the Escala admin gate and the Repertório
// admin editing — the user only logs in once.

const ADMIN_PW_KEY = "admin_pw_v1";

// Local fallback senha — só é aceita se o backend ainda não tiver
// ADMIN_PASSWORD configurado (responde 503). Permite navegar/usar a Escala
// mesmo sem o env var setado. Editar repertório (PUT gateado) exige o env
// var configurado no Railway com este mesmo valor.
export const ADMIN_LOCAL_FALLBACK = "122663Hlss#";

function notifyChanged() {
  try { window.dispatchEvent(new Event("admin-changed")); } catch {}
}

export function getAdminPassword() {
  try { return localStorage.getItem(ADMIN_PW_KEY) || ""; } catch { return ""; }
}
export function setAdminPassword(pw) {
  try { localStorage.setItem(ADMIN_PW_KEY, pw); } catch {}
  notifyChanged();
}
export function clearAdminPassword() {
  try { localStorage.removeItem(ADMIN_PW_KEY); } catch {}
  notifyChanged();
}
export function isAdmin() {
  return !!getAdminPassword();
}

export async function adminLogin(password) {
  let serverOk = false;
  let serverNeedsSetup = false;
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) serverOk = true;
    else if (res.status === 503) serverNeedsSetup = true;
    else if (res.status === 401) {
      // Senha rejeitada pelo backend
      throw new Error("unauthorized");
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (e) {
    if (e.message === "unauthorized") throw e;
    // Erro de rede — segue para fallback local
    serverNeedsSetup = true;
  }

  if (serverOk) {
    setAdminPassword(password);
    return true;
  }
  // Fallback local: aceita a senha hardcoded (mesma da Escala antiga)
  if (serverNeedsSetup && password === ADMIN_LOCAL_FALLBACK) {
    setAdminPassword(password);
    return true;
  }
  throw new Error("unauthorized");
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
  if (res.status === 503) {
    throw new Error("admin_password_not_set");
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
