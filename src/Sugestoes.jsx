import { useState, useEffect } from "react";
import SiteHeader from "./SiteHeader.jsx";
import { SONGS } from "./Repertorio.jsx";
import { apiGet, apiPut, apiRequest, isAdmin as checkIsAdmin } from "./api.js";

// ─── Sugestões de músicas ────────────────────────────────────────────────
// O admin abre um período de envio (início/fim) e define quantas músicas cada
// músico pode sugerir nele. Músicos logados enviam link do YouTube, nome,
// cantor e se é do Ministério Verbo da Vida. O admin aprova ou recusa; ao
// aprovar, a música entra no repertório (repertorio_custom_songs).

const thumb = (id) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
const ytLink = (id) => `https://youtu.be/${id}`;

function parseYoutubeId(raw) {
  const s = String(raw || "").trim();
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(s) ? s : null;
}

// "2026-10-15" → "15/10/2026" (sem passar por fuso horário)
function fmtDay(ymd) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return ""; }
}

const STATUS = {
  pending: { label: "Em análise", bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  approved: { label: "Aprovada", bg: "#ecfdf5", color: "#047857", border: "#a7d9c4" },
  rejected: { label: "Recusada", bg: "#f4f6f8", color: "#6b7684", border: "#e2e6ea" },
};

const ERRORS = {
  invalid_url: "Link do YouTube inválido. Cole o link completo do vídeo.",
  missing_fields: "Preencha o nome da música e o cantor.",
  missing_verbo: "Responda se a música é do Ministério Verbo da Vida.",
  limit_reached: "Você já enviou o máximo de sugestões deste período.",
  closed: "O período de envio de sugestões está fechado.",
  duplicate: "Você já sugeriu essa música.",
  login_required: "Sua sessão expirou. Saia e entre novamente.",
};

const S = {
  page: { minHeight: "100vh", background: "#ffffff", paddingBottom: 80 },
  wrap: { maxWidth: 760, margin: "0 auto", padding: "0 20px" },
  hero: { padding: "48px 0 8px" },
  eyebrow: { fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#047857", marginBottom: 10 },
  h1: { fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, color: "#111418" },
  sub: { color: "#6b7684", fontSize: "0.95rem", marginTop: 10, maxWidth: 520, textWrap: "pretty" },
  section: { marginTop: 36 },
  h2: { fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.01em", color: "#111418", display: "flex", alignItems: "center", gap: 8 },
  h2Count: { fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#fff7ed", color: "#c2410c" },
  card: { border: "1px solid #eef1f4", borderRadius: 16, padding: 20, marginTop: 14, background: "#ffffff" },
  fieldLabel: { fontSize: "0.68rem", fontWeight: 700, color: "#9aa3ad", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  input: {
    width: "100%", padding: "11px 12px", borderRadius: 10,
    border: "1px solid #e2e6ea", background: "#ffffff", color: "#111418",
    fontSize: "0.88rem", outline: "none",
  },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 12 },
  choice: (on) => ({
    flex: 1, padding: "11px 12px", borderRadius: 10, cursor: "pointer",
    border: `1.5px solid ${on ? "#a7d9c4" : "#e2e6ea"}`,
    background: on ? "#ecfdf5" : "#ffffff", color: on ? "#047857" : "#6b7684",
    fontSize: "0.85rem", fontWeight: 600,
  }),
  preview: { display: "flex", gap: 12, alignItems: "center", marginTop: 10, padding: 10, borderRadius: 12, background: "#f7f8fa" },
  previewImg: { width: 96, height: 54, borderRadius: 8, objectFit: "cover", background: "#e2e6ea", flexShrink: 0 },
  btnPrimary: {
    width: "100%", marginTop: 16, padding: "13px 18px", borderRadius: 10, border: "none",
    background: "#047857", color: "#ffffff", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
  },
  errBox: { marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "#fdf2f2", border: "1px solid #f5c6c6", color: "#b91c1c", fontSize: "0.8rem" },
  okBox: { marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "#ecfdf5", border: "1px solid #a7d9c4", color: "#047857", fontSize: "0.8rem" },
  meter: { display: "flex", gap: 6, marginTop: 14 },
  meterDot: (on) => ({ flex: 1, height: 6, borderRadius: 3, background: on ? "#047857" : "#eef1f4" }),
  meterLabel: { fontSize: "0.78rem", color: "#6b7684", marginTop: 8 },
  item: { display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderTop: "1px solid #f1f3f5" },
  itemImg: { width: 88, height: 50, borderRadius: 8, objectFit: "cover", background: "#eef1f4", flexShrink: 0, display: "block" },
  itemTitle: { fontSize: "0.9rem", fontWeight: 600, color: "#111418", lineHeight: 1.25 },
  itemSub: { fontSize: "0.78rem", color: "#6b7684", marginTop: 2 },
  itemMeta: { fontSize: "0.72rem", color: "#9aa3ad", marginTop: 4 },
  badgeMVV: { fontSize: "0.62rem", padding: "2px 8px", borderRadius: 999, fontWeight: 700, background: "#ecfdf5", color: "#047857", marginLeft: 6, verticalAlign: "middle" },
  status: (st) => ({
    fontSize: "0.7rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap",
    background: STATUS[st].bg, color: STATUS[st].color, border: `1px solid ${STATUS[st].border}`,
  }),
  smallBtn: {
    padding: "7px 12px", borderRadius: 8, border: "1px solid #e2e6ea", background: "#ffffff",
    color: "#6b7684", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  },
  approveBtn: {
    padding: "8px 14px", borderRadius: 8, border: "none", background: "#047857",
    color: "#ffffff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
  },
  rejectBtn: {
    padding: "8px 14px", borderRadius: 8, border: "1px solid #f5c6c6", background: "#fdf2f2",
    color: "#b91c1c", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  },
  actions: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
  empty: { fontSize: "0.85rem", color: "#9aa3ad", padding: "14px 0" },
};

const EMPTY_FORM = { url: "", musica: "", artista: "", verbo: null };
const EMPTY_MINE = { config: { max: 5, start: null, end: null, open: false, today: "" }, used: 0, items: [] };

export default function Sugestoes() {
  const [admin, setAdmin] = useState(checkIsAdmin());
  const [mine, setMine] = useState(EMPTY_MINE);
  const [cfgForm, setCfgForm] = useState(null);
  const [cfgMsg, setCfgMsg] = useState({ type: "", text: "" });
  const [savingCfg, setSavingCfg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [all, setAll] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [adminErr, setAdminErr] = useState("");
  const [showReviewed, setShowReviewed] = useState(false);

  useEffect(() => {
    const sync = () => setAdmin(checkIsAdmin());
    window.addEventListener("admin-changed", sync);
    return () => window.removeEventListener("admin-changed", sync);
  }, []);

  async function loadMine() {
    try {
      const r = await apiRequest("GET", "/api/suggestions/mine");
      setMine(r);
      setCfgForm(f => f || { max: String(r.config.max || 5), start: r.config.start || "", end: r.config.end || "" });
    } catch (e) {
      console.error("load suggestions", e);
    } finally { setLoading(false); }
  }
  async function loadAll() {
    try {
      const r = await apiRequest("GET", "/api/suggestions");
      setAll(r.items || []);
    } catch (e) {
      console.error("load all suggestions", e);
    }
  }

  useEffect(() => { loadMine(); }, []);
  useEffect(() => { if (admin) loadAll(); }, [admin]);

  // Músicas já no repertório (fixas não excluídas + adicionadas)
  async function repertoireIds() {
    const [custom, deleted] = await Promise.all([apiGet("repertorio_custom_songs"), apiGet("repertorio_deleted")]);
    const del = Array.isArray(deleted) ? deleted : [];
    const ids = new Set(SONGS.filter(s => !del.includes(s.videoId)).map(s => s.videoId));
    (Array.isArray(custom) ? custom : []).forEach(s => ids.add(s.videoId));
    return { ids, custom: Array.isArray(custom) ? custom : [], deleted: del };
  }

  const cfg = mine.config;
  const used = mine.used;
  const remaining = Math.max(0, cfg.max - used);

  function periodText() {
    if (!cfg.start || !cfg.end) return "O envio de sugestões ainda não foi aberto.";
    if (cfg.today < cfg.start) return `O envio abre em ${fmtDay(cfg.start)} e vai até ${fmtDay(cfg.end)}.`;
    if (cfg.today > cfg.end) return `O período de envio terminou em ${fmtDay(cfg.end)}. Aguarde o próximo.`;
    return `Envio aberto de ${fmtDay(cfg.start)} até ${fmtDay(cfg.end)}.`;
  }

  async function saveConfig(e) {
    e.preventDefault();
    setCfgMsg({ type: "", text: "" });
    const max = Number(cfgForm.max);
    if (!Number.isInteger(max) || max < 1 || max > 50) { setCfgMsg({ type: "err", text: "O limite deve ser entre 1 e 50 músicas." }); return; }
    if (!cfgForm.start || !cfgForm.end) { setCfgMsg({ type: "err", text: "Informe a data de início e a de fim." }); return; }
    if (cfgForm.start > cfgForm.end) { setCfgMsg({ type: "err", text: "A data de fim deve ser depois da de início." }); return; }
    setSavingCfg(true);
    try {
      await apiRequest("PUT", "/api/suggestions/config", { max, start: cfgForm.start, end: cfgForm.end });
      setCfgMsg({ type: "ok", text: "Período salvo." });
      await loadMine();
    } catch (ex) {
      setCfgMsg({ type: "err", text: ex.status === 403 ? "Sua sessão de admin expirou. Saia e entre novamente." : "Não foi possível salvar. Tente novamente." });
    } finally { setSavingCfg(false); }
  }
  const videoId = parseYoutubeId(form.url);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setOk("");
    if (!videoId) { setErr(ERRORS.invalid_url); return; }
    if (!form.musica.trim() || !form.artista.trim()) { setErr(ERRORS.missing_fields); return; }
    if (form.verbo === null) { setErr(ERRORS.missing_verbo); return; }
    setSending(true);
    try {
      const { ids } = await repertoireIds();
      if (ids.has(videoId)) { setErr("Essa música já está no repertório. Escolha outra."); return; }
      await apiRequest("POST", "/api/suggestions", {
        url: form.url, musica: form.musica, artista: form.artista, verbo: form.verbo,
      });
      setForm(EMPTY_FORM);
      setOk("Sugestão enviada! Ela vai para a aprovação do admin.");
      await loadMine();
      if (admin) loadAll();
    } catch (ex) {
      setErr(ERRORS[ex.message] || "Não foi possível enviar. Tente novamente.");
    } finally { setSending(false); }
  }

  async function withdraw(item) {
    if (!window.confirm(`Retirar a sugestão "${item.musica}"?`)) return;
    try {
      await apiRequest("DELETE", `/api/suggestions/${item.id}`);
      await loadMine();
      if (admin) loadAll();
    } catch (e) {
      console.error("withdraw", e);
    }
  }

  // Admin: aprovar (adiciona ao repertório) ou recusar
  async function review(item, status) {
    setAdminErr(""); setBusyId(item.id);
    try {
      if (status === "approved") {
        const { ids, custom, deleted } = await repertoireIds();
        if (!ids.has(item.videoId)) {
          const fixed = SONGS.find(s => s.videoId === item.videoId);
          if (fixed) {
            // Música fixa que tinha sido excluída: restaura
            await apiPut("repertorio_deleted", deleted.filter(v => v !== item.videoId));
          } else {
            const nums = [...SONGS, ...custom].map(s => s.num || 0);
            const song = {
              num: (nums.length ? Math.max(...nums) : 0) + 1,
              musica: item.musica, artista: item.artista || "-", tom: "-",
              verbo: !!item.verbo, videoId: item.videoId,
            };
            await apiPut("repertorio_custom_songs", [...custom, song]);
          }
        }
      }
      await apiRequest("POST", `/api/suggestions/${item.id}/status`, { status });
      await loadAll();
      loadMine();
    } catch (e) {
      console.error("review", e);
      setAdminErr(e.message === "unauthorized" || e.status === 403
        ? "Sua sessão de admin expirou. Saia e entre novamente."
        : "Não foi possível salvar. Tente novamente.");
    } finally { setBusyId(null); }
  }

  const pending = all.filter(s => s.status === "pending");
  const reviewed = all.filter(s => s.status !== "pending");

  function SongInfo({ item, showSender }) {
    return (
      <>
        <a href={ytLink(item.videoId)} target="_blank" rel="noreferrer" title="Abrir no YouTube">
          <img src={thumb(item.videoId)} alt="" style={S.itemImg} loading="lazy" />
        </a>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.itemTitle}>
            {item.musica}
            {item.verbo && <span style={S.badgeMVV}>MVV</span>}
          </div>
          <div style={S.itemSub}>{item.artista}</div>
          <div style={S.itemMeta}>
            {showSender ? `${item.userName || item.userEmail} · ` : ""}
            {item.verbo ? "Ministério Verbo da Vida" : "Não é do Verbo da Vida"} · {formatDate(item.createdAt)}
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={S.page}>
      <SiteHeader current="sugestoes" />
      <div style={S.wrap}>
        <div style={S.hero}>
          <div style={S.eyebrow}>Ministério de louvor</div>
          <h1 style={S.h1}>Sugestões de músicas</h1>
          <p style={S.sub}>
            Sugira músicas novas para o repertório principal.
            Cada sugestão passa pela aprovação do admin antes de entrar na lista.
          </p>
        </div>

        {admin && cfgForm && (
          <section style={S.section}>
            <div style={S.h2}>
              Período de envio
              <span style={{ ...S.h2Count, ...(cfg.open ? { background: "#ecfdf5", color: "#047857" } : { background: "#f4f6f8", color: "#6b7684" }) }}>
                {cfg.open ? "Aberto" : "Fechado"}
              </span>
            </div>
            <form style={S.card} onSubmit={saveConfig}>
              <div style={{ ...S.grid2, marginTop: 0 }}>
                <div>
                  <div style={S.fieldLabel}>Início</div>
                  <input type="date" style={S.input} value={cfgForm.start}
                    onChange={e => { setCfgForm({ ...cfgForm, start: e.target.value }); setCfgMsg({ type: "", text: "" }); }} />
                </div>
                <div>
                  <div style={S.fieldLabel}>Fim</div>
                  <input type="date" style={S.input} value={cfgForm.end}
                    onChange={e => { setCfgForm({ ...cfgForm, end: e.target.value }); setCfgMsg({ type: "", text: "" }); }} />
                </div>
                <div>
                  <div style={S.fieldLabel}>Músicas por pessoa</div>
                  <input type="number" min="1" max="50" style={S.input} value={cfgForm.max}
                    onChange={e => { setCfgForm({ ...cfgForm, max: e.target.value }); setCfgMsg({ type: "", text: "" }); }} />
                </div>
              </div>
              <div style={{ ...S.meterLabel, marginTop: 12 }}>{periodText()} Datas no horário de Orlando; o último dia conta inteiro.</div>
              {cfgMsg.text && <div style={cfgMsg.type === "ok" ? S.okBox : S.errBox}>{cfgMsg.text}</div>}
              <button type="submit" className="green-btn" style={{ ...S.btnPrimary, opacity: savingCfg ? 0.6 : 1 }} disabled={savingCfg}>
                {savingCfg ? "Salvando..." : "Salvar período"}
              </button>
            </form>
          </section>
        )}

        {admin && (
          <section style={S.section}>
            <div style={S.h2}>
              Aguardando aprovação
              {pending.length > 0 && <span style={S.h2Count}>{pending.length}</span>}
            </div>
            <div style={S.card}>
              {adminErr && <div style={{ ...S.errBox, marginTop: 0, marginBottom: 8 }}>{adminErr}</div>}
              {pending.length === 0 && <div style={S.empty}>Nenhuma sugestão pendente.</div>}
              {pending.map((item, i) => (
                <div key={item.id} style={{ ...S.item, ...(i === 0 ? { borderTop: "none" } : {}), flexWrap: "wrap" }}>
                  <SongInfo item={item} showSender />
                  <div style={S.actions}>
                    <button type="button" style={{ ...S.rejectBtn, opacity: busyId === item.id ? 0.6 : 1 }}
                      disabled={busyId === item.id} onClick={() => review(item, "rejected")}>Recusar</button>
                    <button type="button" className="green-btn" style={{ ...S.approveBtn, opacity: busyId === item.id ? 0.6 : 1 }}
                      disabled={busyId === item.id} onClick={() => review(item, "approved")}>
                      {busyId === item.id ? "Salvando..." : "Aprovar"}
                    </button>
                  </div>
                </div>
              ))}
              {reviewed.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <button type="button" style={S.smallBtn} onClick={() => setShowReviewed(v => !v)}>
                    {showReviewed ? "Ocultar analisadas" : `Ver analisadas (${reviewed.length})`}
                  </button>
                  {showReviewed && reviewed.map(item => (
                    <div key={item.id} style={{ ...S.item, flexWrap: "wrap" }}>
                      <SongInfo item={item} showSender />
                      <span style={S.status(item.status)}>{STATUS[item.status].label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section style={S.section}>
          <div style={S.h2}>Enviar sugestão</div>
          <div style={S.card}>
            <div style={{ fontSize: "0.85rem", color: cfg.open ? "#047857" : "#6b7684", fontWeight: 600 }}>
              {loading ? "Carregando..." : periodText()}
            </div>
            {!loading && cfg.open && (
              <>
                <div style={S.meter}>
                  {Array.from({ length: cfg.max }).map((_, i) => <div key={i} style={S.meterDot(i < used)} />)}
                </div>
                <div style={S.meterLabel}>{used} de {cfg.max} sugestões enviadas neste período</div>
              </>
            )}

            {loading || !cfg.open ? null : remaining === 0 ? (
              <div style={{ ...S.okBox, background: "#f7f8fa", borderColor: "#eef1f4", color: "#6b7684" }}>
                Você já usou suas {cfg.max} sugestões deste período. Para liberar uma vaga, retire uma sugestão que ainda esteja em análise.
              </div>
            ) : (
              <form onSubmit={submit} style={{ marginTop: 18 }}>
                <div style={S.fieldLabel}>Link do YouTube</div>
                <input style={S.input} className="search-input" placeholder="https://www.youtube.com/watch?v=…"
                  value={form.url} onChange={e => { setForm({ ...form, url: e.target.value }); setErr(""); setOk(""); }} />
                {videoId && (
                  <div style={S.preview}>
                    <img src={thumb(videoId)} alt="" style={S.previewImg} />
                    <div style={{ fontSize: "0.78rem", color: "#6b7684" }}>Vídeo encontrado ✓</div>
                  </div>
                )}
                <div style={S.grid2}>
                  <div>
                    <div style={S.fieldLabel}>Nome da música</div>
                    <input style={S.input} className="search-input" placeholder="Título"
                      value={form.musica} onChange={e => { setForm({ ...form, musica: e.target.value }); setErr(""); }} />
                  </div>
                  <div>
                    <div style={S.fieldLabel}>Cantor</div>
                    <input style={S.input} className="search-input" placeholder="Cantor / banda"
                      value={form.artista} onChange={e => { setForm({ ...form, artista: e.target.value }); setErr(""); }} />
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#111418", marginBottom: 8 }}>
                    Essa música é do Ministério Verbo da Vida?
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" style={S.choice(form.verbo === true)}
                      onClick={() => { setForm({ ...form, verbo: true }); setErr(""); }}>Sim</button>
                    <button type="button" style={S.choice(form.verbo === false)}
                      onClick={() => { setForm({ ...form, verbo: false }); setErr(""); }}>Não</button>
                  </div>
                </div>
                {err && <div style={S.errBox}>{err}</div>}
                {ok && <div style={S.okBox}>{ok}</div>}
                <button type="submit" className="green-btn" style={{ ...S.btnPrimary, opacity: sending ? 0.6 : 1 }} disabled={sending}>
                  {sending ? "Enviando..." : "Enviar sugestão"}
                </button>
              </form>
            )}
            {(remaining === 0 || !cfg.open) && ok && <div style={S.okBox}>{ok}</div>}
          </div>
        </section>

        <section style={S.section}>
          <div style={S.h2}>Minhas sugestões</div>
          <div style={S.card}>
            {!loading && mine.items.length === 0 && <div style={S.empty}>Você ainda não enviou nenhuma sugestão.</div>}
            {mine.items.map((item, i) => (
              <div key={item.id} style={{ ...S.item, ...(i === 0 ? { borderTop: "none" } : {}), flexWrap: "wrap" }}>
                <SongInfo item={item} />
                <div style={S.actions}>
                  <span style={S.status(item.status)}>{STATUS[item.status].label}</span>
                  {item.status === "pending" && (
                    <button type="button" style={S.smallBtn} onClick={() => withdraw(item)}>Retirar</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
