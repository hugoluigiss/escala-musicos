import SiteHeader from "./SiteHeader.jsx";

// ─── Conferência de Ministros · América do Norte 2026 ───────────────────────
// Página estática: repertório dos 4 dias + dress code (vocal por dia, banda
// branco+bege todos os dias). Clique na música abre o YouTube.

const yt = (id) => `https://www.youtube.com/watch?v=${id}`;
const img = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const song = (n, id, title, artist, canta, tom) => ({ n, id, url: yt(id), img: img(id), title, artist, canta, tom: tom || "—" });

// Texto legível sobre uma cor de acento: escuro em acentos claros (ex: amarelo), branco nos escuros.
const inkOn = (hex) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? "#111418" : "#ffffff";
};

// Versão da cor de acento legível como TEXTO sobre fundo branco (escurece se for clara).
const accentInk = (hex) => {
  const h = hex.replace("#", "");
  let r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  if ((0.299 * r + 0.587 * g + 0.114 * b) <= 150) return hex;
  r = Math.round(r * 0.62); g = Math.round(g * 0.62); b = Math.round(b * 0.62);
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`;
};

const BANDA_SEXTA = [
  { inst: "Teclado", nome: "Natan" },
  { inst: "Bateria", nome: "Asafe" },
  { inst: "Baixo", nome: "Leandro" },
  { inst: "Guitarra", nome: "Marcos" },
  { inst: "Violão", nome: "Hugo" },
];
const BANDA_DEMAIS = [
  { inst: "Teclado", nome: "Asafe" },
  { inst: "Bateria", nome: "Natan" },
  { inst: "Baixo", nome: "Leandro" },
  { inst: "Guitarra", nome: "Marcos" },
  { inst: "Violão", nome: "Hugo" },
];

const DAYS = [
  {
    anchor: "sexta", tag: "Dia 1", title: "Sexta-feira", accent: "#EAC94F",
    ensaioIni: "5:30 pm", ensaioFim: "7:10 pm", culto: "7:30 pm",
    dress: "Uma peça amarela", photo: "/dresscode-sexta.jpg",
    swatches: [
      { color: "#EAC94F", label: "Amarelo" },
      { color: "#F5EFE0", label: "Off-white" },
      { color: "#E4D6B8", label: "Creme" },
    ],
    cantores: ["Ana", "Madalena", "Jokasta", "Clivison", "Hugo"],
    banda: BANDA_SEXTA,
    songs: [
      song(1, "7aeRGFV1_FU", "Há um Lugar", "Eliezer Rodrigues", "Clivison", "E"),
      song(2, "dAbMgyF5d2c", "Deus Está Fazendo Algo Grande", "Ana Ticianeli", "Ana", "C"),
      song(3, "vcX5ljPzIdw", "Fortaleza", "Ana Ticianeli", "Ana", "E"),
      song(4, "S-AuwPIIaW4", "Confiar", "Ana Ticianeli", "Ana", "C"),
      song(5, "2xcFM9CBiOE", "Holy Forever", "CeCe Winans", "Ana", "G"),
    ],
  },
  {
    anchor: "sab-manha", tag: "Dia 2", title: "Sábado — Manhã", accent: "#C8783C",
    ensaioIni: "8:00 am", ensaioFim: "9:40 am", culto: "10:00 am",
    dress: "Uma peça laranja ou terracota", photo: "/dresscode-sabado-manha.jpg",
    swatches: [
      { color: "#B85E33", label: "Terracota" },
      { color: "#E08A4B", label: "Laranja" },
      { color: "#F0E7D6", label: "Creme" },
      { color: "#293B59", label: "Marinho" },
    ],
    cantores: ["Bia", "Victor", "Matheus", "Hugo", "Jokasta"],
    banda: [
      { inst: "Teclado", nome: "Mário Borges" },
      { inst: "Bateria", nome: "Pr Caio" },
      { inst: "Baixo", nome: "Asafe" },
      { inst: "Guitarra", nome: "Marcos" },
      { inst: "Violão", nome: "Victor" },
    ],
    songs: [
      song(1, "qOD9M95_fS0", "Goodbye Yesterday", "Elevation Rhythm", "Victor e Bia", "G"),
      song(2, "wK2uxXMJ4a4", "Minha Vitória", "Eliezer Rodrigues", "Bia e Victor", "G"),
      song(3, "8Nly1vFSK-E", "Seja Exaltado (Be Lifted Up)", "Bethel Music", "Victor", "B"),
      song(4, "QufS8jLfCj8", "Who Else", "Gateway Worship", "Bia", "G"),
    ],
  },
  {
    anchor: "sab-noite", tag: "Dia 2", title: "Sábado — Noite", accent: "#3E6EA5",
    ensaioIni: "5:30 pm", ensaioFim: "7:10 pm", culto: "7:30 pm",
    dress: "Uma peça azul (claro ou marinho)", photo: "/dresscode-sabado-noite.jpg",
    swatches: [
      { color: "#A3C0DE", label: "Azul claro" },
      { color: "#1F2E4F", label: "Marinho" },
      { color: "#EEE7D8", label: "Branco/Bege" },
    ],
    cantores: ["Matheus", "Aline", "Clivison", "Jokasta"],
    banda: BANDA_DEMAIS,
    songs: [
      song(1, "V7DTBO7c8Yw", "Ha Ha Ha", "Eliezer Rodrigues", "Matheus", "D"),
      song(2, "n3S_01oI6Q4", "A Alegria do Senhor", "Eliezer Rodrigues", "Clivison", "D"),
      song(3, "QS04WbSnxok", "I Trust in God", "Elevation Worship", "Matheus", "C"),
      song(4, "gL7QZ5DLmnE", "Tudo É Possível", "Emylie Rodrigues", "Aline", "B"),
    ],
  },
  {
    anchor: "domingo", tag: "Dia 3", title: "Domingo — Manhã", accent: "#7C9166",
    ensaioIni: "9:00 am", ensaioFim: "10:40 am", culto: "11:00 am",
    dress: "Uma peça sage green", photo: "/dresscode-domingo.jpg",
    swatches: [
      { color: "#96A784", label: "Sage green" },
      { color: "#E8E0CD", label: "Creme" },
      { color: "#F6F2E9", label: "Branco" },
    ],
    cantores: ["Madalena", "Aline", "Jokasta", "Clivison", "Hugo"],
    banda: BANDA_DEMAIS,
    songs: [
      song(1, "ULUYuQ4ZWwM", "Óleo de Alegria", "Alda Célia", "Madalena", "A"),
      song(2, "bxMzZVfh7zc", "Canção Ao Cordeiro", "Eliezer Rodrigues", "Madalena", "G"),
      song(3, "QIuVWpLLYy8", "Novo e Vivo Caminho", "MVV", "Clivison", "G"),
      song(4, "5MwyYi9OYow", "Redimido", "Bruna Olly e Júlia Vitória", "Madalena", "G"),
    ],
  },
];

const C = {
  page: { minHeight: "100vh", background: "#ffffff", paddingBottom: 60 },
  section: { maxWidth: 1080, margin: "0 auto", padding: "48px 20px 0" },
  daySection: { maxWidth: 1080, margin: "0 auto", padding: "44px 20px 0" },
  eyebrow: { fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#047857", marginBottom: 10 },
  h1: { fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, color: "#111418" },
  sub: { color: "#6b7684", fontSize: "0.95rem", marginTop: 10, maxWidth: 520, textWrap: "pretty" },
  anchorPill: {
    padding: "7px 14px", borderRadius: 999, border: "1px solid #e2e6ea",
    background: "#ffffff", color: "#374151", fontSize: "0.78rem", fontWeight: 500, whiteSpace: "nowrap",
  },
  swatch: (color) => ({
    width: 28, height: 28, borderRadius: "50%", background: color,
    border: "1px solid #e2e6ea", boxShadow: "0 1px 3px rgba(17,20,24,0.08)",
  }),
  swatchLabel: { fontStyle: "normal", fontSize: "0.62rem", color: "#9aa3ad" },
  swatchCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  exemplosBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px",
    borderRadius: 10, border: "1px solid #e2e6ea", background: "#ffffff",
    color: "#374151", fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap",
  },
  kicker: (color) => ({ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color }),
  dayTag: (accent) => ({
    fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.08em", color: inkOn(accent),
    background: accent, padding: "4px 10px", borderRadius: 6, textTransform: "uppercase",
  }),
  card: { border: "1px solid #eef1f4", borderRadius: 14, padding: "12px 16px", flex: "1 1 300px" },
  cantorChip: {
    fontSize: "0.78rem", fontWeight: 500, padding: "5px 12px", borderRadius: 999,
    background: "#f7f9fa", border: "1px solid #eef1f4", color: "#374151",
  },
  bandInst: { fontSize: "0.6rem", letterSpacing: "0.06em", color: "#9aa3ad", textTransform: "uppercase" },
  bandName: { fontSize: "0.88rem", color: "#111418" },
  songsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14, marginTop: 14 },
  songCard: {
    background: "#ffffff", border: "1px solid #eef1f4", borderRadius: 16, overflow: "hidden",
    display: "flex", flexDirection: "column",
    transition: "border-color .15s, box-shadow .15s", color: "inherit",
  },
  songNum: {
    position: "absolute", top: 8, left: 8, width: 26, height: 26, borderRadius: 8,
    background: "#ffffff", color: "#111418", fontWeight: 700, fontSize: "0.78rem",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 1px 4px rgba(17,20,24,0.15)",
  },
  playBadge: {
    position: "absolute", inset: 0, margin: "auto", width: 44, height: 44, borderRadius: "50%",
    background: "rgba(17,20,24,0.55)", color: "#fff", fontSize: 15,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  tomPill: {
    fontSize: "0.64rem", letterSpacing: "0.04em", color: "#9aa3ad",
    border: "1px solid #eef1f4", borderRadius: 8, padding: "3px 8px", whiteSpace: "nowrap",
  },
};

export default function Conferencia() {
  const progTh = { textAlign: "left", padding: "10px 14px", fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9aa3ad", whiteSpace: "nowrap" };
  const progTdDia = { padding: "12px 14px", whiteSpace: "nowrap" };
  const progTd = { padding: "12px 14px", fontSize: "0.84rem", color: "#374151", whiteSpace: "nowrap" };
  const spot = (icon, role, note) => (
    <div style={{ background: "#ffffff", border: "1px solid #e2e6ea", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 20, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#111418", marginTop: 4 }}>{role}</div>
      {note ? <div style={{ fontSize: "0.66rem", color: "#9aa3ad", marginTop: 2 }}>{note}</div> : null}
    </div>
  );
  const spotVoc = (icon, role, note) => (
    <div style={{ background: "#ecfdf5", border: "1px solid #a7d9c4", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 20, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#047857", marginTop: 4 }}>{role}</div>
      {note ? <div style={{ fontSize: "0.66rem", color: "#6b7684", marginTop: 2 }}>{note}</div> : null}
    </div>
  );
  return (
    <div style={C.page}>
      <SiteHeader current="conferencia" maxWidth={1080} />

      {/* HERO */}
      <section style={C.section}>
        <div style={C.eyebrow}>Equipe de Louvor · América do Norte 2026</div>
        <h1 style={C.h1}>Conferência de Ministros</h1>
        <p style={C.sub}>Repertório e dress code. Clique na música para abrir no YouTube — tons a confirmar.</p>
        <div style={{ border: "1px solid #eef1f4", borderRadius: 16, overflow: "hidden", marginTop: 20 }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid #eef1f4", background: "#fafbfc", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#047857" }}>Programação</span>
            <span style={{ fontSize: "0.72rem", color: "#9aa3ad" }}>Ensaio começa 2h antes · encerra 20 min antes do culto</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
              <thead>
                <tr>
                  <th style={progTh}>Dia</th>
                  <th style={progTh}>Ensaio · início</th>
                  <th style={progTh}>Ensaio · encerra</th>
                  <th style={progTh}>Culto</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map(d => (
                  <tr key={d.anchor} style={{ borderTop: "1px solid #f4f6f8" }}>
                    <td style={progTdDia}>
                      <a href={`#${d.anchor}`} className="prog-link" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#111418", fontWeight: 600, fontSize: "0.86rem" }}>
                        <span style={{ width: 9, height: 9, borderRadius: "50%", background: d.accent, flexShrink: 0 }} />
                        {d.title}
                      </a>
                    </td>
                    <td style={progTd}><b style={{ color: accentInk(d.accent) }}>{d.ensaioIni}</b></td>
                    <td style={progTd}>{d.ensaioFim}</td>
                    <td style={progTd}><b style={{ color: "#111418" }}>{d.culto}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dress code dos músicos — todos os dias */}
        <div style={{ border: "1px solid #eef1f4", borderRadius: 14, padding: "16px 18px", marginTop: 24, background: "#fafbfc" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px 20px" }}>
            <span style={C.kicker("#047857")}>Músicos (banda) — todos os dias</span>
            <span style={{ display: "flex", gap: 12 }}>
              <span style={C.swatchCol}><span style={C.swatch("#FBF8F2")} /><em style={C.swatchLabel}>Branco</em></span>
              <span style={C.swatchCol}><span style={C.swatch("#D6C4A2")} /><em style={C.swatchLabel}>Bege</em></span>
            </span>
            <span style={{ fontSize: "0.85rem", color: "#374151", flex: "1 1 320px" }}>
              Parte de cima branca + calça bege · no sábado à noite, a camisa precisa ser social.
              A paleta dos músicos vale <b>todos os dias</b>; as paletas por dia abaixo são só para o <b>vocal</b>.
            </span>
            <a href="/dresscode-musicos.jpg" target="_blank" rel="noopener noreferrer" style={C.exemplosBtn} className="outline-btn">Ver exemplos ↗</a>
          </div>
        </div>
      </section>

      {/* Posicionamento no palco */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "44px 20px 0" }} className="conf-section">
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, borderLeft: "4px solid #047857", paddingLeft: 14 }}>
          <span style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.08em", color: "#ffffff", background: "#047857", padding: "4px 10px", borderRadius: 6, textTransform: "uppercase" }}>Palco</span>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#111418" }}>Posicionamento no palco</h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#6b7684", marginTop: 8, maxWidth: 560 }}>Vista de cima — a plateia fica na frente (embaixo). Bateria à esquerda, teclado à direita.</p>

        <div style={{ marginTop: 16, border: "1px solid #eef1f4", borderRadius: 16, background: "#fafbfc", padding: 18, maxWidth: 720 }}>
          <div style={{ textAlign: "center", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa3ad", background: "#eef1f4", borderRadius: 10, padding: "8px 10px" }}>
            🖥️ Fundo · Telão / LED
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            {spot("🥁", "Bateria", "Esquerda · no acrílico")}
            {spot("🎹", "Teclado", "Direita")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
            {spot("🎸", "Guitarra", "")}
            {spot("🎸", "Violão", "")}
            {spot("🎸", "Baixo", "")}
          </div>
          <div style={{ marginTop: 10 }}>
            {spotVoc("🎤", "Vocais", "Frente do palco")}
          </div>
          <div style={{ textAlign: "center", fontSize: "0.72rem", fontWeight: 600, color: "#9aa3ad", marginTop: 12 }}>▼ Frente do palco · Plateia</div>
        </div>
      </section>

      {/* DIAS */}
      {DAYS.map(d => (
        <section key={d.anchor} id={d.anchor} style={C.daySection} className="conf-section">
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, borderLeft: `4px solid ${d.accent}`, paddingLeft: 14 }}>
            <span style={C.dayTag(d.accent)}>{d.tag}</span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#111418" }}>{d.title}</h2>
          </div>

          {(d.ensaioIni || d.culto) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              {d.ensaioIni && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 15px", borderRadius: 10, background: d.accent, color: inkOn(d.accent), boxShadow: "0 3px 10px rgba(17,20,24,0.14)" }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.75 }}>🎧 Ensaio</span>
                  <b style={{ fontSize: "0.95rem", letterSpacing: "-0.01em" }}>{d.ensaioIni} – {d.ensaioFim}</b>
                </span>
              )}
              {d.culto && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 15px", borderRadius: 10, background: "#ffffff", border: "1px solid #e2e6ea", color: "#111418" }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9aa3ad" }}>⛪ Culto</span>
                  <b style={{ fontSize: "0.95rem", letterSpacing: "-0.01em" }}>{d.culto}</b>
                </span>
              )}
            </div>
          )}

          {/* Dress code do vocal */}
          <div style={{ border: "1px solid #eef1f4", borderLeft: `4px solid ${d.accent}`, borderRadius: 14, padding: "14px 18px", marginTop: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px 22px" }}>
              <span style={C.kicker("#9aa3ad")}>Dress Code — Vocal</span>
              <span style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {d.swatches.map(sw => (
                  <span key={sw.label} style={C.swatchCol}>
                    <span style={C.swatch(sw.color)} />
                    <em style={C.swatchLabel}>{sw.label}</em>
                  </span>
                ))}
              </span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111418" }}>{d.dress}</span>
              <a href={d.photo} target="_blank" rel="noopener noreferrer" style={C.exemplosBtn} className="outline-btn">Ver exemplos ↗</a>
              <span style={{ fontSize: "0.72rem", color: "#9aa3ad" }}>Músicos: branco + bege (todos os dias)</span>
            </div>
          </div>

          {/* Cantores + Banda */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
            <div style={C.card}>
              <div style={{ ...C.kicker("#047857"), marginBottom: 8 }}>Cantores</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {d.cantores.map(nome => <span key={nome} style={C.cantorChip}>{nome}</span>)}
              </div>
            </div>
            <div style={C.card}>
              <div style={{ ...C.kicker("#047857"), marginBottom: 8 }}>Banda</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
                {d.banda.map(b => (
                  <span key={b.inst} style={{ display: "flex", flexDirection: "column" }}>
                    <span style={C.bandInst}>{b.inst}</span>
                    <b style={C.bandName}>{b.nome}</b>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Músicas */}
          <div style={C.songsGrid}>
            {d.songs.map(s => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" style={C.songCard} className="conf-card">
                <span style={{ position: "relative", display: "block", aspectRatio: "16/9", background: "#f4f6f8" }}>
                  <img loading="lazy" src={s.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <span style={C.songNum}>{s.n}</span>
                  <span style={C.playBadge}>▶</span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 3, padding: "12px 14px 14px", flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", letterSpacing: "-0.01em", color: "#111418" }}>{s.title}</span>
                  <span style={{ fontSize: "0.76rem", color: "#6b7684" }}>{s.artist}</span>
                  <span style={{ marginTop: "auto", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    {s.canta
                      ? <span style={{ fontSize: "0.76rem", color: "#374151" }}>Canta: <b style={{ color: "#047857" }}>{s.canta}</b></span>
                      : <span />}
                    <span style={C.tomPill}>TOM <b style={{ color: "#111418", fontSize: "0.8rem" }}>{s.tom}</b></span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      ))}

      <footer style={{ textAlign: "center", color: "#9aa3ad", fontSize: "0.74rem", padding: "50px 20px 20px" }}>
        Repertório &amp; Dress Code — Conferência de Ministros · América do Norte 2026
      </footer>
    </div>
  );
}
