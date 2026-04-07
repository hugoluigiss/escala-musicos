import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import EscalaMusicos from './EscalaMusicos.jsx'
import Repertorio from './Repertorio.jsx'
import SiteHeader from './SiteHeader.jsx'
import { isAdmin, adminLogin } from './api.js'

const style = document.createElement('style')
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0d0b1e; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
  ::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.3); border-radius: 3px; }
`
document.head.appendChild(style)

// ─── Admin Gate ────────────────────────────────────────────────────────────
// A senha de admin é UNIFICADA: a mesma senha vale para a Escala e para a
// edição do Repertório. O estado é persistido em localStorage via api.js
// (chave admin_pw_v1) e também usado como header X-Admin-Password no PUT.
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
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 60px)",background:"#0d0b1e",fontFamily:"'Inter','Segoe UI',sans-serif",padding:20 }}>
        <form onSubmit={handleSubmit} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(201,169,110,0.15)",borderRadius:16,padding:32,maxWidth:380,width:"100%",textAlign:"center" }}>
          <div style={{ fontSize:40,marginBottom:12 }}>🔒</div>
          <h2 style={{ color:"#e8e6f0",fontSize:"1.2rem",fontWeight:700,marginBottom:4 }}>Área Administrativa</h2>
          <p style={{ color:"#7a7890",fontSize:"0.82rem",marginBottom:20 }}>Digite o código de acesso para gerenciar a escala</p>
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Código de acesso"
            autoFocus
            style={{
              width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.05)",border: error ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.1)",
              borderRadius:10,color:"#e8e6f0",fontSize:"1rem",outline:"none",fontFamily:"inherit",textAlign:"center",letterSpacing:2,marginBottom:12
            }}
          />
          {error && <p style={{ color:"#f87171",fontSize:"0.78rem",marginBottom:8 }}>{error}</p>}
          <button type="submit" disabled={loading || !code} style={{
            width:"100%",padding:12,borderRadius:10,border:"none",background:"linear-gradient(135deg,#e8a838,#c9a96e)",
            color:"#1a1440",fontFamily:"inherit",fontSize:"0.9rem",fontWeight:700,cursor:"pointer",opacity: (loading||!code) ? 0.6 : 1
          }}>{loading ? "Entrando..." : "Entrar"}</button>
          <a href="/repertorio" style={{ display:"block",marginTop:16,color:"#7a7890",fontSize:"0.78rem",textDecoration:"none" }}>
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
