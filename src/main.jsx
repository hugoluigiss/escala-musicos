import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import Repertorio from './Repertorio.jsx'
import Conferencia from './Conferencia.jsx'
import './styles.css'

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

  if (page === "/conferencia" || page === "/conferencia/") {
    return <Conferencia />;
  }
  return <Repertorio />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
