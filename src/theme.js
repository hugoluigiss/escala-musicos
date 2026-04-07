// ─── Theme system ──────────────────────────────────────────────────────────
// Glassmorphism design with emerald accent. Light + dark variants.
// Theme is applied as CSS variables on :root[data-theme="..."]. Components
// reference them via inline style strings like `var(--surface)` so we don't
// need a CSS-in-JS framework.

export const THEME_KEY = "verbo_theme_v1";

const CSS = `
  :root {
    --accent: #10b981;
    --accent-strong: #059669;
    --accent-glow: #34d399;
    --verbo: #f59e0b;
    --danger: #ef4444;
    --radius-sm: 10px;
    --radius-md: 14px;
    --radius-lg: 22px;
    --font: 'Inter','Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;
    --shadow-sm: 0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.04);
    --shadow-md: 0 4px 12px rgba(15,23,42,.08), 0 12px 28px rgba(15,23,42,.06);
    --shadow-lg: 0 12px 30px rgba(15,23,42,.12), 0 28px 64px rgba(15,23,42,.10);
    --blur: 18px;
  }

  :root[data-theme="light"] {
    --bg-base: #eef3f7;
    --bg-grad: radial-gradient(at 20% -10%, #d6f3e3 0%, transparent 55%),
               radial-gradient(at 80% 10%, #e0ecff 0%, transparent 55%),
               linear-gradient(180deg, #f7fafc 0%, #eef3f7 100%);
    --surface: rgba(255,255,255,0.62);
    --surface-strong: rgba(255,255,255,0.82);
    --surface-hover: rgba(255,255,255,0.92);
    --surface-faint: rgba(255,255,255,0.40);
    --border: rgba(15,23,42,0.08);
    --border-strong: rgba(15,23,42,0.14);
    --text: #0f172a;
    --text-muted: #475569;
    --text-faint: #94a3b8;
    --accent-soft: rgba(16,185,129,0.10);
    --accent-border: rgba(16,185,129,0.35);
    --accent-text: #047857;
    --verbo-soft: rgba(245,158,11,0.12);
    --verbo-border: rgba(245,158,11,0.40);
    --verbo-text: #b45309;
    --overlay: rgba(15,23,42,0.45);
    --chip-bg: rgba(15,23,42,0.04);
    --chip-text: #475569;
    --input-bg: rgba(255,255,255,0.78);
    --menu-bg: #ffffff;
    --menu-hover: #f1f5f9;
  }

  :root[data-theme="dark"] {
    --bg-base: #060914;
    --bg-grad: radial-gradient(at 20% -10%, rgba(16,185,129,0.18) 0%, transparent 55%),
               radial-gradient(at 80% 10%, rgba(56,189,248,0.10) 0%, transparent 55%),
               linear-gradient(180deg, #0a0f1f 0%, #060914 100%);
    --surface: rgba(255,255,255,0.04);
    --surface-strong: rgba(255,255,255,0.07);
    --surface-hover: rgba(255,255,255,0.10);
    --surface-faint: rgba(255,255,255,0.02);
    --border: rgba(255,255,255,0.08);
    --border-strong: rgba(255,255,255,0.18);
    --text: #f1f5f9;
    --text-muted: #94a3b8;
    --text-faint: #64748b;
    --accent-soft: rgba(16,185,129,0.16);
    --accent-border: rgba(16,185,129,0.40);
    --accent-text: #34d399;
    --verbo-soft: rgba(251,191,36,0.14);
    --verbo-border: rgba(251,191,36,0.40);
    --verbo-text: #fbbf24;
    --overlay: rgba(0,0,0,0.72);
    --chip-bg: rgba(255,255,255,0.05);
    --chip-text: #cbd5e1;
    --input-bg: rgba(255,255,255,0.05);
    --menu-bg: #131826;
    --menu-hover: #1e2535;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #root { min-height: 100%; max-width: 100vw; overflow-x: hidden; }
  body {
    background: var(--bg-base);
    background-image: var(--bg-grad);
    background-attachment: fixed;
    color: var(--text);
    font-family: var(--font);
    -webkit-font-smoothing: antialiased;
    transition: background-color .25s ease, color .25s ease;
  }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-faint); }

  input::placeholder, textarea::placeholder { color: var(--text-faint); }
  button, input, select, textarea { font-family: inherit; }
  a { color: inherit; }

  /* Reusable glass card class */
  .glass {
    background: var(--surface);
    backdrop-filter: blur(var(--blur)) saturate(140%);
    -webkit-backdrop-filter: blur(var(--blur)) saturate(140%);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
  }
  .glass-strong {
    background: var(--surface-strong);
    backdrop-filter: blur(var(--blur)) saturate(160%);
    -webkit-backdrop-filter: blur(var(--blur)) saturate(160%);
    border: 1px solid var(--border-strong);
    box-shadow: var(--shadow-lg);
  }

  /* Mobile responsive helpers */
  .brand-full { display: inline; }
  .brand-short { display: none; }
  @media (max-width: 640px) {
    .brand-full { display: none; }
    .brand-short { display: inline; }
    .hero-pad { padding: 22px 14px 6px !important; }
    .container-pad { padding: 14px 12px 0 !important; }
    .bar-pad { padding: 10px 12px !important; gap: 8px !important; }
    .nav-compact { padding: 3px !important; }
    .nav-compact button { padding: 6px 10px !important; font-size: 0.74rem !important; }
    .icon-btn-sm { width: 32px !important; height: 32px !important; }
    .admin-btn-sm { padding: 6px 10px !important; font-size: 0.72rem !important; }
    .song-card { gap: 10px !important; padding: 10px !important; }
    .song-thumb { width: 64px !important; height: 48px !important; }
    .song-title { font-size: 0.88rem !important; }
    .song-artist { font-size: 0.74rem !important; }
    .bottom-dock { padding: 10px 12px 14px !important; }
    .slot { padding: 7px 6px !important; min-height: 54px !important; }
    .slot-name { font-size: 0.68rem !important; }
  }
  @media (max-width: 380px) {
    .nav-compact button { padding: 5px 8px !important; font-size: 0.7rem !important; }
    .brand-short { font-size: 0.78rem !important; }
  }

  /* Smooth fade for modal */
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: translateY(12px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .v-fade { animation: fadeIn .18s ease; }
  .v-scale { animation: scaleIn .22s cubic-bezier(.16,1,.3,1); }
`;

let installed = false;
export function installTheme() {
  if (typeof document === "undefined") return;
  if (!installed) {
    const tag = document.createElement("style");
    tag.id = "verbo-theme-css";
    tag.textContent = CSS;
    document.head.appendChild(tag);
    installed = true;
  }
  const saved = localStorage.getItem(THEME_KEY) || "light";
  document.documentElement.setAttribute("data-theme", saved);
  return saved;
}

export function getTheme() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") || "light";
}

export function setTheme(t) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem(THEME_KEY, t); } catch {}
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: t }));
}

export function toggleTheme() {
  setTheme(getTheme() === "light" ? "dark" : "light");
}
