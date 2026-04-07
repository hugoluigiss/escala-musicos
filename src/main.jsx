import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import EscalaMusicos from './EscalaMusicos.jsx'
import Repertorio from './Repertorio.jsx'
import SiteHeader from './SiteHeader.jsx'
import { isAdmin, adminLogin } from './api.js'
import { installTheme } from './theme.js'

installTheme();

// ─── Admin Gate ────────────────────────────────────────────────────────────
function AdminGate({ children }) {
  const [auth, setAuth] = useState(isAdmin());
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sync = () => setAuth(isAdmin());
    window.addEventListener("admin-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("admin-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await adminLogin(code);
      setAuth(true);
      setCode("");
    } catch (ex) {
      setError(ex.message === "unauthorized" ? "Código incorreto" : "Erro de conexão");
      setTimeout(() => setError(""), 2500);
    } finally {
      setLoading(false);
    }
  }

  if (auth) return children;

  return (
    <div>
      <SiteHeader current="escala" />
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 64px)",padding:24 }}>
        <form
          onSubmit={handleSubmit}
          className="glass-strong v-scale"
          style={{ borderRadius:22,padding:"36px 32px",maxWidth:380,width:"100%",textAlign:"center" }}
        >
          <div style={{ width:60,height:60,borderRadius:"50%",background:"var(--accent-soft)",border:"1px solid var(--accent-border)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:26 }}>🔒</div>
          <h2 style={{ color:"var(--text)",fontSize:"1.25rem",fontWeight:700,marginBottom:6 }}>Área Administrativa</h2>
          <p style={{ color:"var(--text-muted)",fontSize:"0.85rem",marginBottom:22 }}>Digite o código de acesso para gerenciar a escala</p>
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Código de acesso"
            autoFocus
            style={{
              width:"100%",padding:"13px 16px",background:"var(--input-bg)",
              border: error ? "1px solid var(--danger)" : "1px solid var(--border-strong)",
              borderRadius:12,color:"var(--text)",fontSize:"1rem",outline:"none",
              textAlign:"center",letterSpacing:2,marginBottom:12,
            }}
          />
          {error && <p style={{ color:"var(--danger)",fontSize:"0.78rem",marginBottom:8 }}>{error}</p>}
          <button type="submit" disabled={loading || !code} style={{
            width:"100%",padding:13,borderRadius:12,border:"none",
            background:"linear-gradient(135deg, var(--accent), var(--accent-strong))",
            color:"#fff",fontSize:"0.92rem",fontWeight:700,cursor:"pointer",
            opacity: (loading||!code) ? 0.55 : 1,
            boxShadow:"0 6px 18px rgba(16,185,129,0.30)",
          }}>{loading ? "Entrando..." : "Entrar"}</button>
          <a href="/repertorio" onClick={(e)=>{e.preventDefault();window.__navigate&&window.__navigate('/repertorio')}} style={{ display:"block",marginTop:18,color:"var(--text-muted)",fontSize:"0.8rem",textDecoration:"none" }}>
            ← Voltar ao Repertório
          </a>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState(window.location.pathname);

  useEffect(() => {
    const handlePop = () => setPage(window.location.pathname);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    window.__navigate = (path) => {
      window.history.pushState({}, "", path);
      setPage(path);
    };
  }, []);

  if (page === "/escala" || page === "/escala/") {
    return (
      <AdminGate>
        <EscalaMusicos />
      </AdminGate>
    );
  }

  return <Repertorio />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
