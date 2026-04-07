import { useState, useEffect, useRef } from "react";
import { TEMAS_DEF } from "./temas.js";

// ─── Shared themed styles (CSS vars from theme.js) ────────────────────────
const M = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 300,
    background: "var(--overlay)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    display: "flex", justifyContent: "center", alignItems: "center",
    padding: 18,
  },
  modal: {
    width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto",
    borderRadius: 24,
    background: "var(--surface-strong)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid var(--border-strong)",
    boxShadow: "var(--shadow-lg)",
    padding: "26px 26px 28px",
  },
  title: { fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", marginBottom: 4, letterSpacing: "-0.01em" },
  sub: { fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 16 },
  label: { fontSize: "0.7rem", fontWeight: 800, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 16, marginBottom: 6 },
  input: { width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid var(--border-strong)", background: "var(--input-bg)", color: "var(--text)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  hint: { fontSize: "0.72rem", color: "var(--text-faint)", marginTop: 6 },
  chipsRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: { padding: "6px 12px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--chip-bg)", color: "var(--chip-text)", fontSize: "0.72rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  chipOn: (def) => ({
    padding: "6px 12px", borderRadius: 999,
    border: `1px solid ${def.border}`, background: def.bg, color: def.color,
    fontSize: "0.72rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 800,
  }),
  ordBadge: { fontSize: "0.6rem", marginLeft: 6, padding: "1px 6px", borderRadius: 8, background: "rgba(0,0,0,0.25)", color: "#fff", fontWeight: 800 },
  row: { display: "flex", gap: 6, alignItems: "stretch", marginBottom: 6 },
  rowSmall: { width: 90 },
  rowDel: { width: 40, borderRadius: 10, border: "1px solid rgba(239,68,68,0.30)", background: "rgba(239,68,68,0.10)", color: "var(--danger)", cursor: "pointer", fontSize: 14, fontWeight: 700, flexShrink: 0 },
  addBtn: { padding: "10px 14px", borderRadius: 12, border: "1px dashed var(--accent-border)", background: "var(--accent-soft)", color: "var(--accent-text)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "inherit", fontWeight: 700, marginTop: 6 },
  actions: { display: "flex", gap: 8, marginTop: 24 },
  btnSave: { flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", color: "#fff", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 16px rgba(16,185,129,0.30)" },
  btnCancel: { padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border-strong)", background: "transparent", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", fontFamily: "inherit" },
  err: { background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.30)", color: "var(--danger)", padding: "10px 12px", borderRadius: 12, fontSize: "0.78rem", marginTop: 12 },

  // PersonPicker
  picker: { position: "relative", flex: 1 },
  pickerBtn: { width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid var(--border-strong)", background: "var(--input-bg)", color: "var(--text)", fontSize: "0.88rem", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit", boxSizing: "border-box" },
  pickerPlaceholder: { color: "var(--text-faint)" },
  pickerMenu: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, maxHeight: 240, overflowY: "auto", background: "var(--surface-strong)", backdropFilter: "blur(18px) saturate(160%)", WebkitBackdropFilter: "blur(18px) saturate(160%)", border: "1px solid var(--border-strong)", borderRadius: 12, boxShadow: "var(--shadow-md)", zIndex: 20 },
  pickerItem: { padding: "11px 14px", cursor: "pointer", color: "var(--text)", fontSize: "0.85rem", borderBottom: "1px solid var(--border)" },
  pickerItemClear: { padding: "10px 14px", cursor: "pointer", color: "var(--text-faint)", fontSize: "0.8rem", fontStyle: "italic", borderBottom: "1px solid var(--border)" },
  pickerEmpty: { padding: "14px", color: "var(--text-faint)", fontSize: "0.8rem", fontStyle: "italic", textAlign: "center" },

  // PessoasModal list
  pessoaListRow: { display: "flex", gap: 6, marginBottom: 6 },
  pessoaInput: { flex: 1, padding: "11px 13px", borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--input-bg)", color: "var(--text)", fontSize: "0.85rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
};

// ─── Login Modal ───────────────────────────────────────────────────────────
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
      setErr(ex.message === "unauthorized" ? "Senha incorreta" : "Erro ao conectar. Verifique se a senha de admin foi configurada no servidor.");
    } finally { setLoading(false); }
  }
  return (
    <div style={M.overlay} className="v-fade" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="v-scale" style={{...M.modal, maxWidth: 420}}>
        <div style={M.title}>🔐 Acesso Admin</div>
        <div style={M.sub}>Entre com a senha de administrador para editar o repertório.</div>
        <form onSubmit={submit}>
          <input type="password" autoFocus style={M.input} placeholder="Senha de admin" value={pw} onChange={e => setPw(e.target.value)} />
          {err && <div style={M.err}>{err}</div>}
          <div style={M.actions}>
            <button type="button" onClick={onClose} style={M.btnCancel}>Cancelar</button>
            <button type="submit" disabled={loading || !pw} style={{...M.btnSave, opacity: (loading||!pw) ? 0.6 : 1}}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── PersonPicker ──────────────────────────────────────────────────────────
// Dropdown button that lists all registered singers. Clicking an item selects
// it. Clicking outside closes the menu.
function PersonPicker({ value, pessoas, placeholder, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  const list = pessoas || [];
  return (
    <div style={M.picker} ref={ref}>
      <button type="button" style={M.pickerBtn} onClick={() => setOpen(o => !o)}>
        <span style={!value ? M.pickerPlaceholder : undefined}>
          {value || placeholder || "Selecionar cantor..."}
        </span>
        <span style={{color:"var(--text-faint)",fontSize:12,marginLeft:8}}>▾</span>
      </button>
      {open && (
        <div style={M.pickerMenu}>
          <div style={M.pickerItemClear} onClick={() => { onChange(""); setOpen(false); }}>
            — Limpar seleção —
          </div>
          {list.length === 0 ? (
            <div style={M.pickerEmpty}>
              Nenhum cantor cadastrado.<br/>Adicione em ⚙ Cantores.
            </div>
          ) : (
            list.map(p => (
              <div key={p} style={{
                ...M.pickerItem,
                background: value === p ? "var(--accent-soft)" : undefined,
                color: value === p ? "var(--accent-text)" : "var(--text)",
                fontWeight: value === p ? 700 : 500,
              }} onClick={() => { onChange(p); setOpen(false); }}>
                {value === p ? "✓ " : ""}{p}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── PessoasModal ──────────────────────────────────────────────────────────
// Admin config panel for managing the master list of singers. Supports add,
// edit (inline rename), and remove. Emits the new list + a renames map so
// the parent can cascade renames through overrides and song keys.
export function PessoasModal({ open, pessoas: initial, onSave, onClose }) {
  const [list, setList] = useState(initial || []);
  const [original, setOriginal] = useState(initial || []);
  const [novo, setNovo] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setList(initial || []);
      setOriginal(initial || []);
      setNovo("");
      setErr("");
    }
  }, [open, initial]);

  if (!open) return null;

  function add() {
    const n = novo.trim();
    if (!n) return;
    if (list.includes(n)) { setNovo(""); return; }
    setList(prev => [...prev, n]);
    setNovo("");
  }
  function remove(i) { setList(prev => prev.filter((_, idx) => idx !== i)); }
  function update(i, val) {
    setList(prev => prev.map((p, idx) => idx === i ? val : p));
  }

  async function save() {
    setErr(""); setSaving(true);
    try {
      const cleaned = list.map(p => (p || "").trim()).filter(Boolean);
      const dedup = [];
      cleaned.forEach(p => { if (!dedup.includes(p)) dedup.push(p); });
      // Rename detection: compare by index with the snapshot taken at open.
      const renames = {};
      original.forEach((oldName, i) => {
        const newName = (list[i] || "").trim();
        const oldTrim = (oldName || "").trim();
        if (oldTrim && newName && oldTrim !== newName) {
          renames[oldTrim] = newName;
        }
      });
      await onSave(dedup, renames);
      onClose();
    } catch (ex) {
      setErr(ex.message === "unauthorized" ? "Sessão expirou. Faça login novamente." : "Erro ao salvar: " + ex.message);
    } finally { setSaving(false); }
  }

  return (
    <div style={M.overlay} className="v-fade" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="v-scale" style={M.modal}>
        <div style={M.title}>⚙ Cantores e Músicos</div>
        <div style={M.sub}>
          Gerencie a lista de cantores cadastrados. Eles aparecerão nos campos
          "Indicada por" e "Tom por cantor" no editor de cada música. Renomear
          aqui atualiza automaticamente todas as músicas que referenciam o
          nome antigo.
        </div>

        <div style={M.label}>Lista ({list.length})</div>
        <div>
          {list.map((p, i) => (
            <div key={i} style={M.pessoaListRow}>
              <input
                style={M.pessoaInput}
                value={p}
                onChange={e => update(i, e.target.value)}
                placeholder="Nome do cantor / músico"
              />
              <button type="button" style={M.rowDel} onClick={() => remove(i)} title="Remover">✕</button>
            </div>
          ))}
          <div style={M.pessoaListRow}>
            <input
              style={M.pessoaInput}
              placeholder="Novo cantor..."
              value={novo}
              onChange={e => setNovo(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            />
            <button type="button" style={{...M.addBtn, marginTop: 0}} onClick={add}>+ Adicionar</button>
          </div>
        </div>

        {err && <div style={M.err}>{err}</div>}

        <div style={M.actions}>
          <button type="button" onClick={onClose} style={M.btnCancel}>Cancelar</button>
          <button type="button" disabled={saving} onClick={save} style={{...M.btnSave, opacity: saving ? 0.6 : 1}}>
            {saving ? "Salvando..." : "💾 Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Song Modal ───────────────────────────────────────────────────────
// props: song, currentTemas (array),
//        currentOverride ({musica, artista, verbo, indicadaPor, tom}),
//        currentKeys (array of {cantor, tom}), pessoas (array of strings),
//        onSave({temas, override, keys}), onClose
// NOTE: pessoas management was moved to PessoasModal. Here `pessoas` is only
// consumed as the source list for the PersonPicker dropdowns.
export function EditSongModal({ song, currentTemas, currentOverride, currentKeys, pessoas, onSave, onClose }) {
  const [temas, setTemas] = useState(currentTemas || []);
  const [musica, setMusica] = useState((currentOverride?.musica) ?? song.musica ?? "");
  const [artista, setArtista] = useState((currentOverride?.artista) ?? song.artista ?? "");
  const [verbo, setVerbo] = useState(
    currentOverride && typeof currentOverride.verbo === "boolean"
      ? currentOverride.verbo
      : !!song.verbo
  );
  const [indicadaPor, setIndicadaPor] = useState((currentOverride?.indicadaPor) ?? song.indicadaPor ?? "");
  const [tom, setTom] = useState((currentOverride?.tom) ?? song.tom ?? "");
  const [keys, setKeys] = useState(currentKeys || []);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function toggleTema(id) {
    setTemas(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }
  function addKey() { setKeys(prev => [...prev, { cantor: "", tom: "" }]); }
  function updateKey(i, field, val) {
    setKeys(prev => prev.map((k, idx) => idx === i ? { ...k, [field]: val } : k));
  }
  function removeKey(i) { setKeys(prev => prev.filter((_, idx) => idx !== i)); }

  async function save() {
    setErr(""); setSaving(true);
    try {
      const cleanKeys = keys
        .filter(k => (k.cantor || "").trim() || (k.tom || "").trim())
        .map(k => ({ cantor: (k.cantor || "").trim(), tom: (k.tom || "").trim() }));
      await onSave({
        temas,
        override: {
          musica: musica.trim(),
          artista: artista.trim(),
          verbo: !!verbo,
          indicadaPor: (indicadaPor || "").trim(),
          tom: tom.trim(),
        },
        keys: cleanKeys,
      });
      onClose();
    } catch (ex) {
      setErr(ex.message === "unauthorized" ? "Sessão expirou. Faça login novamente." : "Erro ao salvar: " + ex.message);
    } finally { setSaving(false); }
  }

  return (
    <div style={M.overlay} className="v-fade" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="v-scale" style={M.modal}>
        <div style={M.title}>✏️ Editar música</div>
        <div style={M.sub}>{song.musica} — <span style={{color:"var(--accent-text)"}}>{song.artista}</span></div>

        <div style={M.label}>Nome da música</div>
        <input style={M.input} value={musica} onChange={e => setMusica(e.target.value)} placeholder="Título da música" />

        <div style={M.label}>Artista</div>
        <input style={M.input} value={artista} onChange={e => setArtista(e.target.value)} placeholder="Nome do artista / banda" />

        <div style={M.label}>Tags</div>
        <div style={M.chipsRow}>
          <button
            type="button"
            onClick={() => setVerbo(v => !v)}
            style={verbo
              ? {
                  padding: "6px 12px", borderRadius: 999,
                  border: "1px solid var(--verbo-border)",
                  background: "var(--verbo-soft)",
                  color: "var(--verbo-text)",
                  fontSize: "0.72rem", cursor: "pointer",
                  fontFamily: "inherit", fontWeight: 800,
                }
              : M.chip
            }
            title="Marque se for uma música do Verbo da Vida"
          >
            ⭐ Verbo da Vida
          </button>
        </div>

        <div style={M.label}>Temas (até 3, em ordem de relevância)</div>
        <div style={M.chipsRow}>
          {Object.entries(TEMAS_DEF).map(([id, def]) => {
            const idx = temas.indexOf(id);
            const on = idx >= 0;
            return (
              <button key={id} type="button" onClick={() => toggleTema(id)}
                style={on ? M.chipOn(def) : M.chip}
              >
                {def.label}{on && <span style={M.ordBadge}>{idx+1}</span>}
              </button>
            );
          })}
        </div>
        <div style={M.hint}>Clique para adicionar/remover. Máximo 3 temas.</div>

        <div style={M.label}>Indicada por</div>
        <PersonPicker
          value={indicadaPor}
          pessoas={pessoas}
          placeholder="Selecione quem indicou"
          onChange={setIndicadaPor}
        />

        <div style={M.label}>Tom geral</div>
        <input style={M.input} value={tom} onChange={e => setTom(e.target.value)} placeholder="Ex: G, Bb, F#m, ou - se não definido" />

        <div style={M.label}>Tom por cantor</div>
        <div style={M.hint}>Cada linha registra qual tom um cantor específico usa para essa música.</div>
        <div style={{marginTop: 10}}>
          {keys.map((k, i) => (
            <div key={i} style={M.row}>
              <PersonPicker
                value={k.cantor}
                pessoas={pessoas}
                placeholder="Selecione o cantor"
                onChange={val => updateKey(i, "cantor", val)}
              />
              <input
                style={{...M.input, ...M.rowSmall, marginTop: 0}}
                placeholder="Tom"
                value={k.tom}
                onChange={e => updateKey(i, "tom", e.target.value)}
              />
              <button type="button" style={M.rowDel} onClick={() => removeKey(i)}>✕</button>
            </div>
          ))}
          <button type="button" style={M.addBtn} onClick={addKey}>+ Adicionar tom de outro cantor</button>
        </div>

        {err && <div style={M.err}>{err}</div>}

        <div style={M.actions}>
          <button type="button" onClick={onClose} style={M.btnCancel}>Cancelar</button>
          <button type="button" disabled={saving} onClick={save} style={{...M.btnSave, opacity: saving ? 0.6 : 1}}>
            {saving ? "Salvando..." : "💾 Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
