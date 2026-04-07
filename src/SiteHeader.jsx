import { useState, useEffect } from "react";
import { isAdmin as checkIsAdmin, adminLogin, clearAdminPassword } from "./api.js";
import { LoginModal } from "./AdminEdit.jsx";
import { getTheme, toggleTheme } from "./theme.js";

// ─── Site-wide top header ────────────────────────────────────────────────
// Glassmorphism navigation bar with brand, page nav, theme toggle and admin
// pill. The Escalas button is gated behind admin login.

function navigate(path) {
  if (typeof window === "undefined") return;
  if (window.__navigate) { window.__navigate(path); return; }
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const H = {
  bar: {
    position: "sticky", top: 0, zIndex: 200,
    padding: "12px 18px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12,
    background: "var(--surface-strong)",
    backdropFilter: "blur(var(--blur)) saturate(160%)",
    WebkitBackdropFilter: "blur(var(--blur)) saturate(160%)",
    borderBottom: "1px solid var(--border)",
  },
  brand: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: "0.88rem", fontWeight: 800, letterSpacing: "0.02em",
    color: "var(--text)",
    minWidth: 0, flex: "1 1 auto", overflow: "hidden",
  },
  brandText: {
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    minWidth: 0,
  },
  brandDot: {
    width: 28, height: 28, borderRadius: 9,
    background: "linear-gradient(135deg, var(--accent), var(--accent-strong))",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 14, fontWeight: 800,
    boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
  },
  nav: {
    display: "flex", gap: 4, padding: 4, borderRadius: 999,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    flex: "0 1 auto",
  },
  btn: {
    padding: "7px 14px", borderRadius: 999, border: "none",
    background: "transparent", color: "var(--text-muted)",
    fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 5,
    transition: "all .18s ease",
  },
  btnActive: {
    background: "var(--surface-hover)",
    color: "var(--text)",
    boxShadow: "var(--shadow-sm)",
  },
  right: { display: "flex", gap: 8, alignItems: "center" },
  iconBtn: {
    width: 36, height: 36, borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 16, transition: "all .18s ease",
  },
  adminBtn: {
    padding: "8px 14px", borderRadius: 999,
    border: "1px solid var(--accent-border)",
    background: "var(--accent-soft)",
    color: "var(--accent-text)",
    fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 5,
  },
  adminOn: {
    padding: "8px 14px", borderRadius: 999,
    border: "1px solid var(--accent-border)",
    background: "linear-gradient(135deg, var(--accent), var(--accent-strong))",
    color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 5,
    boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
  },
};

export default function SiteHeader({ current }) {
  const [admin, setAdmin] = useState(checkIsAdmin());
  const [theme, setThemeState] = useState(getTheme());
  const [showLogin, setShowLogin] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);

  useEffect(() => {
    const sync = () => setAdmin(checkIsAdmin());
    const syncTheme = () => setThemeState(getTheme());
    window.addEventListener("admin-changed", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("theme-changed", syncTheme);
    return () => {
      window.removeEventListener("admin-changed", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("theme-changed", syncTheme);
    };
  }, []);

  function goRepertorio() {
    if (current !== "repertorio") navigate("/repertorio");
  }

  function goEscala() {
    if (current === "escala") return;
    if (admin) navigate("/escala");
    else { setPendingNav("/escala"); setShowLogin(true); }
  }

  async function handleLogin(pw) {
    await adminLogin(pw);
    setAdmin(true);
    if (pendingNav) {
      const target = pendingNav;
      setPendingNav(null);
      setTimeout(() => navigate(target), 50);
    }
  }

  function handleLogout() {
    clearAdminPassword();
    setAdmin(false);
    if (current === "escala") navigate("/repertorio");
  }

  function openLogin() { setPendingNav(null); setShowLogin(true); }

  return (
    <>
      <div style={H.bar} className="bar-pad">
        <div style={H.brand}>
          <div style={H.brandDot}>♪</div>
          <span style={H.brandText}>
            <span className="brand-full">Verbo da Vida Music — Orlando, FL</span>
            <span className="brand-short">Verbo Music</span>
          </span>
        </div>

        <div style={H.nav} className="nav-compact">
          <button type="button" onClick={goRepertorio}
            style={{ ...H.btn, ...(current === "repertorio" ? H.btnActive : {}) }}>
            Repertório
          </button>
          <button type="button" onClick={goEscala}
            style={{ ...H.btn, ...(current === "escala" ? H.btnActive : {}) }}
            title={admin ? "Abrir Escala" : "Requer senha de admin"}>
            Escalas {!admin && <span style={{ fontSize: 11, opacity: .7 }}>🔒</span>}
          </button>
        </div>

        <div style={H.right}>
          <button
            type="button"
            onClick={() => { toggleTheme(); setThemeState(getTheme()); }}
            style={H.iconBtn}
            className="icon-btn-sm"
            title={theme === "light" ? "Mudar para escuro" : "Mudar para claro"}
            aria-label="Alternar tema"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {admin
            ? <button type="button" style={H.adminOn} className="admin-btn-sm" onClick={handleLogout} title="Sair do modo admin">✓ Admin</button>
            : <button type="button" style={H.adminBtn} className="admin-btn-sm" onClick={openLogin}>🔐 Admin</button>
          }
        </div>
      </div>
      <LoginModal
        open={showLogin}
        onClose={() => { setShowLogin(false); setPendingNav(null); }}
        onLogin={handleLogin}
      />
    </>
  );
}
