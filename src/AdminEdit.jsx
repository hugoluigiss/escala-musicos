import { useState, useEffect } from "react";
import { TEMAS_DEF } from "./temas.js";

// ─── Shared styles ─────────────────────────────────────────────────────────
const M = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", justifyContent: "center", alignItems: "flex-end", backdropFilter: "blur(4px)" },
  modal: { background: "#1a1440", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", border: "1px solid rgba(201,169,110,0.25)", padding: "20px 22px 28px" },
  title: { fontSize: "1.05rem", fontWeight: 800, color: "#e8a838", marginBottom: 4 },
  sub: { fontSize: "0.78rem", color: "#7a7890", marginBottom: 16 },
  label: { fontSize: "0.72rem", fontWeight: 700, color: "#c9a96e", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 14, marginBottom: 6 },
  input: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.3)", color: "#e8e6f0", fontSize: "0.85rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  hint: { fontSize: "0.66rem", color: "#7a7890", marginTop: 4 },
  chipsRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: { padding: "6px 11px", borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#7a7890", fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  chipOn: (def, idx) => ({
    padding: "6px 11px", borderRadius: 18, border: `1px solid ${def.border}`, background: def.bg, color: def.color, fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 700,
    boxShadow: idx >= 0 ? `inset 0 0 0 2px rgba(255,255,255,0.08)` : undefined,
  }),
  ordBadge: { fontSize: "0.6rem", marginLeft: 6, padding: "1px 6px", borderRadius: 8, background: "rgba(0,0,0,0.35)", color: "#fff", fontWeight: 800 },
  row: { display: "flex", gap: 6, alignItems: "center", marginBottom: 6 },
  rowInput: { flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.3)", color: "#e8e6f0", fontSize: "0.82rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  rowSmall: { width: 90 },
  rowDel: { width: 30, height: 30, borderRadius: 6, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)", color: "#f87171", cursor: "pointer", fontSize: 14, fontWeight: 700 },
  addBtn: { padding: "7px 12px", borderRadius: 8, border: "1px dashed rgba(108,99,255,0.4)", background: "rgba(108,99,255,0.06)", color: "#a99bff", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit", fontWeight: 600, marginTop: 4 },
  actions: { display: "flex", gap: 8, marginTop: 22 },
  btnSave: { flex: 1, padding: "11px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6c63ff,#8b83ff)", color: "#fff", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", fontFamily: "inherit" },
  btnCancel: { padding: "11px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#7a7890", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit" },
  err: { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", padding: "8px 10px", borderRadius: 8, fontSize: "0.75rem", marginTop: 10 },
  pessoaRow: { display: "flex", gap: 6, marginBottom: 6 },
  pessoaInput: { flex: 1, padding: "7px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.3)", color: "#e8e6f0", fontSize: "0.8rem", fontFamily: "inherit", outline: "none" },
  loginInput: { width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.35)", color: "#e8e6f0", fontSize: "0.95rem", fontFamily: "inherit", outline: "none", marginTop: 8, marginBottom: 4, boxSizing: "border-box" },
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
    <div style={M.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{...M.modal, maxWidth: 420}}>
        <div style={M.title}>🔐 Acesso Admin</div>
        <div style={M.sub}>Entre com a senha de administrador para editar o repertório.</div>
        <form onSubmit={submit}>
          <input
            type="password"
            autoFocus
            style={M.loginInput}
            placeholder="Senha de admin"
            value={pw}
            onChange={e => setPw(e.target.value)}
          />
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

// ─── Edit Modal ────────────────────────────────────────────────────────────
// props: song, currentTemas (array), currentOverride ({indicadaPor, tom}),
//        currentKeys (array of {cantor, tom}), pessoas (array of strings),
//        onSave({temas, override, keys, pessoas}), onClose
export function EditSongModal({ song, currentTemas, currentOverride, currentKeys, pessoas: initialPessoas, onSave, onClose }) {
  const [temas, setTemas] = useState(currentTemas || []);
  const [indicadaPor, setIndicadaPor] = useState((currentOverride?.indicadaPor) ?? song.indicadaPor ?? "");
  const [tom, setTom] = useState((currentOverride?.tom) ?? song.tom ?? "");
  const [keys, setKeys] = useState(currentKeys || []);
  const [pessoas, setPessoas] = useState(initialPessoas || []);
  const [newPessoa, setNewPessoa] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function toggleTema(id) {
    setTemas(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  }
  function addKey() {
    setKeys(prev => [...prev, { cantor: "", tom: "" }]);
  }
  function updateKey(i, field, val) {
    setKeys(prev => prev.map((k, idx) => idx === i ? { ...k, [field]: val } : k));
  }
  function removeKey(i) {
    setKeys(prev => prev.filter((_, idx) => idx !== i));
  }
  function addPessoa() {
    const n = newPessoa.trim();
    if (!n) return;
    if (pessoas.includes(n)) { setNewPessoa(""); return; }
    setPessoas(prev => [...prev, n]);
    setNewPessoa("");
  }
  function removePessoa(name) {
    setPessoas(prev => prev.filter(p => p !== name));
  }

  async function save() {
    setErr(""); setSaving(true);
    try {
      const cleanKeys = keys.filter(k => (k.cantor || "").trim() || (k.tom || "").trim());
      await onSave({
        temas,
        override: { indicadaPor: indicadaPor.trim(), tom: tom.trim() },
        keys: cleanKeys,
        pessoas,
      });
      onClose();
    } catch (ex) {
      setErr(ex.message === "unauthorized" ? "Sessão expirou. Faça login novamente." : "Erro ao salvar: " + ex.message);
    } finally { setSaving(false); }
  }

  return (
    <div style={M.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={M.modal}>
        <div style={M.title}>✏️ Editar música</div>
        <div style={M.sub}>{song.musica} — <span style={{color:"#a99bff"}}>{song.artista}</span></div>

        <div style={M.label}>Temas (até 3, em ordem de relevância)</div>
        <div style={M.chipsRow}>
          {Object.entries(TEMAS_DEF).map(([id, def]) => {
            const idx = temas.indexOf(id);
            const on = idx >= 0;
            return (
              <button key={id} type="button" onClick={() => toggleTema(id)}
                style={on ? M.chipOn(def, idx) : M.chip}
              >
                {def.label}{on && <span style={M.ordBadge}>{idx+1}</span>}
              </button>
            );
          })}
        </div>
        <div style={M.hint}>Clique para adicionar/remover. Máximo 3 temas.</div>

        <div style={M.label}>Indicada por</div>
        <input style={M.input} value={indicadaPor} onChange={e => setIndicadaPor(e.target.value)} placeholder="Nome de quem indicou" list="pessoas-list" />
        <datalist id="pessoas-list">
          {pessoas.map(p => <option key={p} value={p} />)}
        </datalist>

        <div style={M.label}>Tom geral</div>
        <input style={M.input} value={tom} onChange={e => setTom(e.target.value)} placeholder="Ex: G, Bb, F#m, ou - se não definido" />

        <div style={M.label}>Tom por cantor</div>
        <div style={M.hint}>Cada linha registra qual tom um cantor específico usa para essa música.</div>
        <div style={{marginTop: 8}}>
          {keys.map((k, i) => (
            <div key={i} style={M.row}>
              <input style={M.rowInput} placeholder="Cantor" value={k.cantor} onChange={e => updateKey(i, "cantor", e.target.value)} list="pessoas-list" />
              <input style={{...M.rowInput, ...M.rowSmall}} placeholder="Tom" value={k.tom} onChange={e => updateKey(i, "tom", e.target.value)} />
              <button type="button" style={M.rowDel} onClick={() => removeKey(i)}>✕</button>
            </div>
          ))}
          <button type="button" style={M.addBtn} onClick={addKey}>+ Adicionar tom de outro cantor</button>
        </div>

        <div style={M.label}>Cantores e músicos cadastrados</div>
        <div style={M.hint}>Esses nomes aparecem como sugestão nos campos acima.</div>
        <div style={{marginTop: 8}}>
          {pessoas.map(p => (
            <div key={p} style={M.pessoaRow}>
              <div style={{...M.pessoaInput, display:"flex", alignItems:"center"}}>{p}</div>
              <button type="button" style={M.rowDel} onClick={() => removePessoa(p)}>✕</button>
            </div>
          ))}
          <div style={M.pessoaRow}>
            <input style={M.pessoaInput} placeholder="Novo nome..." value={newPessoa}
              onChange={e => setNewPessoa(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addPessoa(); } }}
            />
            <button type="button" style={{...M.addBtn, marginTop: 0}} onClick={addPessoa}>+ Add</button>
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
