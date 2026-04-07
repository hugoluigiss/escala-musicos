import { useState, useEffect } from "react";
import { isAdmin as checkIsAdmin, adminLogin, clearAdminPassword } from "./api.js";
import { LoginModal } from "./AdminEdit.jsx";

// ─── Site-wide top header with navigation between pages ───────────────────
// Renders a fixed strip at the top with two nav buttons (Repertório / Escalas)
// and an admin status pill. The Escalas button is gated: if not admin, it
// opens the login modal first and only navigates after successful login.

const H = {
  bar: {
    position: "sticky", top: 0, zIndex: 200,
    background: "linear-gradient(135deg,#0a0818,#141028)",
    borderBottom: "1px solid rgba(201,169,110,0.2)",
    padding: "10px 14px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 10,
    fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  brand: {
    fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.06em",
    color: "#c9a96e", textTransform: "uppercase",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    flex: "0 1 auto",
  },
  nav: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", flex: "1 1 auto" },
  btn: {
    padding: "7px 14px", borderRadius: 18,
    border: "1px solid rgba(201,169,110,0.25)",
    background: "rgba(201,169,110,0.06)",
    color: "#c9a96e", fontSize: "0.76rem", fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", gap: 5,
  },
  btnActive: {
    background: "linear-gradient(135deg,rgba(232,168,56,0.25),rgba(201,169,110,0.18))",
    borderColor: "rgba(232,168,56,0.55)",
    color: "#f0e6d3",
    boxShadow: "0 0 0 1px rgba(232,168,56,0.15) inset",
  },
  btnLock: { fontSize: "0.7rem", opacity: 0.8 },
  adminWrap: { display: "flex", gap: 6, alignItems: "center", flex: "0 0 auto" },
  adminBtn: {
    padding: "6px 12px", borderRadius: 16,
    border: "1px solid rgba(232,168,56,0.35)",
    background: "rgba(232,168,56,0.08)",
    color: "#e8a838", fontSize: "0.7rem", fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit",
  },
  adminOn: {
    padding: "6px 12px", borderRadius: 16,
    border: "1px solid rgba(34,197,94,0.4)",
    background: "rgba(34,197,94,0.1)",
    color: "#4ade80", fontSize: "0.7rem", fontWeight: 800,
    cursor: "pointer", fontFamily: "inherit",
  },
};

function navigate(path) {
  if (typeof window === "undefined") return;
  if (window.__navigate) {
    window.__navigate(path);
    return;
  }
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function SiteHeader({ current }) {
  const [admin, setAdmin] = useState(checkIsAdmin());
  const [showLogin, setShowLogin] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);

  useEffect(() => {
    const sync = () => setAdmin(checkIsAdmin());
    window.addEventListener("admin-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("admin-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function goRepertorio() {
    if (current !== "repertorio") navigate("/repertorio");
  }

  function goEscala() {
    if (current === "escala") return;
    if (admin) {
      navigate("/escala");
    } else {
      setPendingNav("/escala");
      setShowLogin(true);
    }
  }

  async function handleLogin(pw) {
    await adminLogin(pw);
    setAdmin(true);
    if (pendingNav) {
      const target = pendingNav;
      setPendingNav(null);
      // pequeno delay para o modal fechar antes da navegação
      setTimeout(() => navigate(target), 50);
    }
  }

  function handleLogout() {
    clearAdminPassword();
    setAdmin(false);
    if (current === "escala") navigate("/repertorio");
  }

  function openLogin() {
    setPendingNav(null);
    setShowLogin(true);
  }

  return (
    <>
      <div style={H.bar}>
        <div style={H.brand}>✦ Verbo Orlando</div>
        <div style={H.nav}>
          <button
            type="button"
            onClick={goRepertorio}
            style={{ ...H.btn, ...(current === "repertorio" ? H.btnActive : {}) }}
          >
            🎵 Repertório
          </button>
          <button
            type="button"
            onClick={goEscala}
            style={{ ...H.btn, ...(current === "escala" ? H.btnActive : {}) }}
            title={admin ? "Abrir Escala" : "Requer senha de admin"}
          >
            📅 Escalas {!admin && <span style={H.btnLock}>🔒</span>}
          </button>
        </div>
        <div style={H.adminWrap}>
          {admin
            ? <button type="button" style={H.adminOn} onClick={handleLogout} title="Sair do modo admin">✓ Admin</button>
            : <button type="button" style={H.adminBtn} onClick={openLogin}>🔐 Admin</button>
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
