import { useState, useEffect } from "react";
import { isAdmin as checkIsAdmin, adminLogin, clearAdminPassword } from "./api.js";

// ─── Site-wide top header ────────────────────────────────────────────────
// Sticky branco com blur, logo, nav pill (Repertório | Conferência) e área
// admin à direita. O login usa o fluxo real /api/admin/login (api.js).

function navigate(path) {
  if (typeof window === "undefined") return;
  if (window.__navigate) { window.__navigate(path); return; }
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const H = {
  bar: {
    position: "sticky", top: 0, zIndex: 200,
    background: "rgba(255,255,255,0.94)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid #eef1f4",
  },
  inner: {
    margin: "0 auto", padding: "9px 20px", minHeight: 60,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 16, rowGap: 8, flexWrap: "wrap",
  },
  navWrap: { display: "flex", justifyContent: "center" },
  brand: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  logo: {
    width: 30, height: 30, borderRadius: 8, background: "#047857",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 15, fontWeight: 700, flexShrink: 0,
  },
  brandName: { fontSize: "0.85rem", fontWeight: 700, letterSpacing: "-0.01em", color: "#111418", whiteSpace: "nowrap" },
  brandSub: { fontSize: "0.66rem", color: "#9aa3ad", whiteSpace: "nowrap" },
  nav: { display: "flex", gap: 2, padding: 3, borderRadius: 10, background: "#f4f6f8" },
  navBtn: {
    padding: "7px 16px", borderRadius: 8, border: "none", background: "transparent",
    color: "#6b7684", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
  },
  navActive: {
    background: "#ffffff", color: "#111418", fontWeight: 600,
    boxShadow: "0 1px 2px rgba(17,20,24,0.06)", cursor: "default",
  },
  right: { display: "flex", gap: 8, alignItems: "center" },
  btn: {
    padding: "8px 14px", borderRadius: 10, border: "1px solid #e2e6ea",
    background: "#ffffff", color: "#374151", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
    whiteSpace: "nowrap",
  },
  adminOn: {
    padding: "8px 16px", borderRadius: 10, border: "1px solid #a7d9c4",
    background: "#ecfdf5", color: "#047857", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
    whiteSpace: "nowrap",
  },
};

const L = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 300, background: "rgba(17,20,24,0.40)",
    backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
  },
  box: {
    width: "100%", maxWidth: 400, borderRadius: 20, background: "#ffffff",
    boxShadow: "0 24px 60px rgba(17,20,24,0.18)", padding: 28, textAlign: "center",
  },
  icon: {
    width: 52, height: 52, borderRadius: 16, background: "#f4f6f8",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, margin: "0 auto 14px",
  },
  title: { fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#111418" },
  sub: { fontSize: "0.8rem", color: "#6b7684", marginTop: 4, marginBottom: 18 },
  input: (error) => ({
    width: "100%", padding: "13px 16px", borderRadius: 12,
    border: `1px solid ${error ? "#f5c6c6" : "#e2e6ea"}`,
    background: "#ffffff", color: "#111418", fontSize: "0.95rem", outline: "none",
    textAlign: "center", letterSpacing: 2,
  }),
  err: { color: "#b91c1c", fontSize: "0.76rem", marginTop: 8 },
  enter: {
    width: "100%", marginTop: 14, padding: 13, borderRadius: 12, border: "none",
    background: "#047857", color: "#fff", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
  },
  cancel: {
    width: "100%", marginTop: 8, padding: 11, borderRadius: 12, border: "none",
    background: "transparent", color: "#6b7684", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600,
  },
};

export function LoginModal({ open, onClose, onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  if (!open) return null;
  async function submit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await onLogin(pw);
      setPw("");
      onClose();
    } catch (ex) {
      setErr(ex.message === "unauthorized" ? "Senha incorreta" : "Erro ao conectar. Tente novamente.");
    } finally { setLoading(false); }
  }
  return (
    <div style={L.overlay} className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <form style={L.box} className="modal-box" onSubmit={submit}>
        <div style={L.icon}>🔒</div>
        <div style={L.title}>Área administrativa</div>
        <div style={L.sub}>Digite a senha de admin para gerenciar o repertório.</div>
        <input
          type="password" autoFocus placeholder="Senha de acesso"
          style={L.input(!!err)} value={pw}
          onChange={e => { setPw(e.target.value); setErr(""); }}
        />
        {err && <div style={L.err}>{err}</div>}
        <button type="submit" className="green-btn" disabled={loading || !pw}
          style={{ ...L.enter, opacity: (loading || !pw) ? 0.6 : 1 }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <button type="button" style={L.cancel} onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
}

export default function SiteHeader({ current, maxWidth = 960, onAddSong, onHistory }) {
  const [admin, setAdmin] = useState(checkIsAdmin());
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const sync = () => setAdmin(checkIsAdmin());
    window.addEventListener("admin-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("admin-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  async function handleLogin(pw) {
    await adminLogin(pw);
    setAdmin(true);
  }

  function handleLogout() {
    clearAdminPassword();
    setAdmin(false);
  }

  // Ações admin (Nova música / Histórico) só existem no Repertório; a
  // Conferência mantém o header limpo com um espaçador para centralizar a nav.
  const hasActions = !!(onAddSong || onHistory);

  return (
    <>
      <header style={H.bar}>
        <div style={{ ...H.inner, maxWidth }}>
          <div style={H.brand}>
            <div style={H.logo}>♪</div>
            <div style={{ minWidth: 0 }} className="brand-text">
              <div style={H.brandName}>Verbo Music</div>
              <div style={H.brandSub}>Orlando, FL</div>
            </div>
          </div>

          <div className="hdr-nav" style={H.navWrap}>
            <nav style={H.nav}>
              <button type="button"
                style={{ ...H.navBtn, ...(current === "repertorio" ? H.navActive : {}) }}
                onClick={() => { if (current !== "repertorio") navigate("/"); }}>
                Repertório
              </button>
              <button type="button"
                style={{ ...H.navBtn, ...(current === "conferencia" ? H.navActive : {}) }}
                onClick={() => { if (current !== "conferencia") navigate("/conferencia"); }}>
                Conferência
              </button>
            </nav>
          </div>

          {hasActions ? (
            <div style={H.right}>
              {admin ? (
                <>
                  {onAddSong && (
                    <button type="button" style={H.btn} className="hdr-btn" onClick={onAddSong}>
                      <span className="lbl-full">+ Nova música</span><span className="lbl-short">+ Nova</span>
                    </button>
                  )}
                  {onHistory && <button type="button" style={H.btn} className="hdr-btn" onClick={onHistory}>Histórico</button>}
                  <button type="button" style={H.adminOn} className="hdr-btn" onClick={handleLogout} title="Sair do modo admin">
                    <span className="lbl-full">✓ Admin · Sair</span><span className="lbl-short">Sair</span>
                  </button>
                </>
              ) : (
                <button type="button" style={H.btn} className="outline-btn hdr-btn" onClick={() => setShowLogin(true)}>Admin</button>
              )}
            </div>
          ) : (
            <div className="hdr-spacer" style={{ width: 70 }} />
          )}
        </div>
      </header>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
    </>
  );
}
