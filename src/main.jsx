import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import Repertorio from './Repertorio.jsx'
import Conferencia from './Conferencia.jsx'
import { isAdmin as checkIsAdmin } from './api.js'
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
  return <Repertorio />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
