import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import Repertorio from './Repertorio.jsx'
import Conferencia from './Conferencia.jsx'
import Sugestoes from './Sugestoes.jsx'
import Login from './Login.jsx'
import { isAdmin as checkIsAdmin } from './api.js'
import { useAuth, getAccount } from './auth.js'
import './styles.css'

function App() {
  const [page, setPage] = useState(window.location.pathname);
  const [admin, setAdmin] = useState(checkIsAdmin());

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

  // Mantém o estado de admin em sincronia com login/logout (mesmo entre abas).
  useEffect(() => {
    const sync = () => setAdmin(checkIsAdmin());
    window.addEventListener("admin-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("admin-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const wantsConferencia = page === "/conferencia" || page === "/conferencia/";

  // Conferência é restrita ao admin — quem não está logado é levado ao Repertório.
  useEffect(() => {
    if (wantsConferencia && !admin) {
      window.history.replaceState({}, "", "/");
      setPage("/");
    }
  }, [wantsConferencia, admin]);

  if (wantsConferencia && admin) {
    return <Conferencia />;
  }
  if (page === "/sugestoes" || page === "/sugestoes/") {
    return <Sugestoes />;
  }
  return <Repertorio />;
}

// Só quem está logado acessa o site. Se o Supabase não estiver configurado
// (status "disabled"), o site funciona sem login, como antes.
function AuthGate() {
  const { status } = useAuth();
  // Espera o backend dizer se a conta é admin (evita piscar/redirecionar errado)
  const [accountReady, setAccountReady] = useState(getAccount() !== undefined);
  useEffect(() => {
    const sync = () => setAccountReady(getAccount() !== undefined);
    window.addEventListener("admin-changed", sync);
    return () => window.removeEventListener("admin-changed", sync);
  }, []);
  if (status === "loading" || (status === "signed_in" && !accountReady)) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9aa3ad", fontSize: "0.85rem" }}>Carregando...</div>;
  }
  if (status === "recovery") return <Login key="recovery" recovery />;
  if (status === "signed_out") return <Login key="login" />;
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthGate />
  </StrictMode>,
)
