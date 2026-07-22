import { useState, useEffect } from "react";
import { TEMAS, TEMAS_DEF } from "./temas.js";
import { apiGet, apiPut, isAdmin as checkIsAdmin } from "./api.js";
import SiteHeader from "./SiteHeader.jsx";

// ─── SONG DATA ──────────────────────────────────────────────────────────────
const SONGS=[
{num:1,musica:"Não é Homem pra Mentir",artista:"Marcos Freire",tom:"-",verbo:false,videoId:"ILy997rP3Po"},
{num:2,musica:"A Boa Parte (Ao Vivo)",artista:"Fhop Music / Nívea Soares",tom:"-",verbo:false,videoId:"dlGOiuxSzVw"},
{num:3,musica:"Prefiro a Tua Presença",artista:"Ana Luiza",tom:"-",verbo:false,videoId:"4grgpeRwcfg"},
{num:4,musica:"Gratidão",artista:"ADAI Music / Fernando Silva",tom:"-",verbo:false,videoId:"Z1faUgngZlU"},
{num:5,musica:"O Nome Dele",artista:"Sued Silva",tom:"-",verbo:false,videoId:"x4ZaA7JgYC4"},
{num:6,musica:"Minh'alma Engrandece ao Senhor / Adorado",artista:"Rachel Novaes e Thamires Garcia",tom:"-",verbo:false,videoId:"oNUErOaOuPw"},
{num:7,musica:"Em Nome De Jesus (Ao Vivo)",artista:"Emylie Rodrigues",tom:"-",verbo:true,videoId:"3CqL4pgTF5Q"},
{num:8,musica:"Cristo Vem Me Buscar",artista:"Ligia Coelho",tom:"-",verbo:false,videoId:"aBJKhyXyxCI"},
{num:9,musica:"Medley: Tens Sido Fiel + Vem de Ti Senhor",artista:"Sede Verbo da Vida",tom:"-",verbo:true,videoId:"TypWyNW7yJ0"},
{num:10,musica:"Medley: Confio em Ti + Salmos 23",artista:"Sede Verbo da Vida",tom:"-",verbo:true,videoId:"9Lb6iTtcvFc"},
{num:11,musica:"Medley Fé",artista:"Sede Verbo da Vida",tom:"-",verbo:true,videoId:"39_zgvLtPS4"},
{num:12,musica:"Eu me Alegro em Ti",artista:"Ministério de Louvor Shalom DF",tom:"-",verbo:false,videoId:"b1d6C681f4Y"},
{num:13,musica:"Emmanuel",artista:"Hillsong (Legendado PT)",tom:"-",verbo:false,videoId:"_C2v2F2C9vA"},
{num:14,musica:"Medley: Sonhando os Sonhos de Deus + Está Escrito",artista:"Sede Verbo da Vida",tom:"-",verbo:true,videoId:"jRfwoIe3tE4"},
{num:15,musica:"Redimido (Ao Vivo)",artista:"Bruna Olly e Julia Vitória",tom:"-",verbo:false,videoId:"5MwyYi9OYow"},
{num:16,musica:"Poderoso",artista:"Marcos Witt feat. Kike Pavón",tom:"-",verbo:false,videoId:"xODYnxwPz_c"},
{num:17,musica:"Não Temerei (Ao Vivo)",artista:"Heloisa Rosa",tom:"-",verbo:false,videoId:"H0BLt5pOXCs"},
{num:18,musica:"Tua Igreja Canta",artista:"Israel Salazar",tom:"C",verbo:false,videoId:"0I_3CCL6Q5U"},
{num:19,musica:"Em Seu Nome",artista:"André Aquino ft. Gabriela Rocha",tom:"Gb",verbo:false,videoId:"bHooZ7OGN1I"},
{num:20,musica:"Me Ama",artista:"Diante do Trono",tom:"G",verbo:false,videoId:"lSwiHA8gymg"},
{num:21,musica:"Hino da Vitória (Não Se Frustaram Medley)",artista:"Gabriela Rocha",tom:"D",verbo:false,videoId:"lTRNHofvCmU"},
{num:22,musica:"Estou Livre (Ao Vivo)",artista:"Heloisa Rosa",tom:"-",verbo:false,videoId:"QDry3GFwXUw"},
{num:23,musica:"Abençoado (Ao Vivo)",artista:"Gabriel Rodrigues",tom:"-",verbo:true,videoId:"EJi0tgUfEkE"},
{num:24,musica:"Nova Fase",artista:"Ana Diniz",tom:"-",verbo:true,videoId:"6H92C6oWv2k"},
{num:25,musica:"Eu Te Agradeço",artista:"Sede Verbo da Vida",tom:"-",verbo:true,videoId:"xHzGAG5gk0o"},
{num:26,musica:"Nada é Impossível",artista:"Quatro por Um",tom:"-",verbo:false,videoId:"8jqhvdgOfG4"},
{num:27,musica:"Nova Criatura",artista:"Kleber Lucas",tom:"-",verbo:false,videoId:"xWi8IRepur0"},
{num:28,musica:"Meu Alvo",artista:"Kleber Lucas",tom:"-",verbo:false,videoId:"faRYpkO3v3A"},
{num:29,musica:"Eu Creio em Ti",artista:"André Martins",tom:"-",verbo:false,videoId:"bZFm2ckl30c"},
{num:30,musica:"Algo Novo",artista:"André Martins",tom:"-",verbo:false,videoId:"ljG1r0L7NUI"},
{num:31,musica:"Teu Amor Não Falha",artista:"Nívea Soares",tom:"-",verbo:false,videoId:"3q-pRKf-VaQ"},
{num:32,musica:"Diz (You Say)",artista:"Gabriela Rocha",tom:"-",verbo:false,videoId:"LF1UnPP4MvY"},
{num:33,musica:"Sublime (Ao Vivo)",artista:"Fhop Music",tom:"-",verbo:false,videoId:"7GWZwO0MdsY"},
{num:34,musica:"Santo Pra Sempre (Ao Vivo)",artista:"Gabriel Guedes",tom:"-",verbo:false,videoId:"ijNCc7ICCck"},
{num:35,musica:"Digno de Tudo",artista:"Central 3 / Gabriela Maganete / Gabi Sampaio",tom:"-",verbo:false,videoId:"46r7YDxB0t4"},
{num:36,musica:"Yo Te Busco",artista:"Gateway Worship / Coalo Zamorano",tom:"-",verbo:false,videoId:"qcekc_yJLxw"},
{num:37,musica:"Medley: Vida Aos Sepulcros / Tudo Sobre Você / Só Tu es Santo",artista:"Jesse Nascimento",tom:"-",verbo:false,videoId:"LnrwXvesMy0"},
{num:38,musica:"Nunca Me Deixou",artista:"Livres Para Adorar",tom:"-",verbo:false,videoId:"Z_mvHa5BnvQ"},
{num:39,musica:"Nada Me Falta",artista:"Sede Verbo da Vida (Eliezer Rodrigues)",tom:"-",verbo:true,videoId:"t5iptUXVyX0"},
{num:40,musica:"Teu Amor Não Falha",artista:"André Valadão",tom:"-",verbo:false,videoId:"iqCM_yxslfU"},
{num:41,musica:"Pela Fé",artista:"André Valadão",tom:"-",verbo:false,videoId:"phog1GGvzHU"},
{num:42,musica:"Nasci de Novo",artista:"André Valadão",tom:"-",verbo:false,videoId:"mAMyXHC85Nc"},
{num:43,musica:"Sobre Todo Nome",artista:"Davi Silva",tom:"-",verbo:false,videoId:"pfxh4uPy9dA"},
{num:44,musica:"Novo e Vivo Caminho (Ao Vivo)",artista:"Sede Verbo da Vida",tom:"-",verbo:true,videoId:"QIuVWpLLYy8"},
{num:45,musica:"A Bênção",artista:"Misaias Oliveira (Cover Gabriel Guedes)",tom:"-",verbo:false,videoId:"IMD1eBr1cfw"},
{num:46,musica:"Vem Esta é a Hora",artista:"Vineyard Piratininga / O Canto das Igrejas",tom:"-",verbo:false,videoId:"tesOYs6bIgc"},
{num:47,musica:"Que Ele Cresça",artista:"Nívea Soares + Nathanael Brito",tom:"-",verbo:false,videoId:"hDjFz6DOcQo"},
{num:48,musica:"Santo + Que Ele Cresça",artista:"Thiago Godoi",tom:"-",verbo:false,videoId:"5kzkPheDZiI"},
{num:49,musica:"Ao Que Está Assentado Sobre o Trono + Nada Vai Roubar Tua Glória",artista:"Altomonte / Victor Valente",tom:"-",verbo:false,videoId:"kHKVFxyTjsE"},
{num:50,musica:"A Alegria do Senhor (Ao Vivo)",artista:"Eliezer Rodrigues",tom:"-",verbo:true,videoId:"vzx_FT48k1o"},
{num:51,musica:"Tudo é Perda (Ao Vivo)",artista:"Felipe Rodrigues",tom:"-",verbo:false,videoId:"qxzQR5uwWsk"},
{num:52,musica:"Eu Me Rendo (Ao Vivo)",artista:"Leonardo Gonçalves",tom:"-",verbo:false,videoId:"_SzVzMh7qfM"},
{num:53,musica:"Te Seguirei Até O Fim",artista:"Sede Verbo da Vida",tom:"-",verbo:true,videoId:"4ks4j9KqXXk"},
{num:54,musica:"Sobre as Águas (Ao Vivo)",artista:"Rapha Gonçalves / Isaías Saad",tom:"-",verbo:false,videoId:"XUs7nuz6c0M"},
{num:55,musica:"Cremos no Teu Poder",artista:"Sede Verbo da Vida",tom:"-",verbo:true,videoId:"p4SX8gG38zg"},
{num:56,musica:"Cremos No Teu Poder (Ao Vivo)",artista:"Emylie Rodrigues",tom:"-",verbo:true,videoId:"d2OLS1RkGF4"},
{num:57,musica:"Bom Perfume",artista:"Sede Verbo da Vida",tom:"-",verbo:true,videoId:"WlR8o3D0V5c"},
{num:58,musica:"Teu Amor Não Falha",artista:"Templo Soul",tom:"-",verbo:false,videoId:"Npsfmz5PrvA"},
{num:59,musica:"Fortaleza",artista:"Ana Ticianeli",tom:"-",verbo:true,videoId:"vcX5ljPzIdw"},
{num:60,musica:"Satisfaz",artista:"André Martins",tom:"-",verbo:false,videoId:"YuBmD6BmAs0"},
{num:61,musica:"Este é o Dia",artista:"Euller Oliveira",tom:"-",verbo:false,videoId:"_VJgJx1FM0A"},
{num:62,musica:"Minha Vitória",artista:"Eliezer Rodrigues",tom:"-",verbo:true,videoId:"wK2uxXMJ4a4"},
{num:63,musica:"O Seu Amor",artista:"Manassés Guerra e Cinthya Miranda",tom:"-",verbo:false,videoId:"KO5qvwujwVg"},
{num:64,musica:"Só Vai Melhorar",artista:"-",tom:"-",verbo:false,videoId:"g0vwsqmq_3U"},
{num:65,musica:"Rei da Glória",artista:"Israel Salazar",tom:"A",verbo:false,videoId:"bOPsqICVi9Q"},
{num:66,musica:"Altar",artista:"Brasa Church Music / Liz Johnson",tom:"A",verbo:false,videoId:"gOnp0Kuq-9M"},
{num:67,musica:"Venceu",artista:"Nívea Soares",tom:"G",verbo:false,videoId:"dehE3ISeWNo"},
{num:68,musica:"Canção dos Redimidos (Ao Vivo)",artista:"Julia Vitoria e Nívea Soares",tom:"-",verbo:false,videoId:"p7Gy9m7LEZg"},
{num:69,musica:"Grande É o Senhor (Great Are You Lord)",artista:"Thiago Henrique & Matheus França",tom:"-",verbo:false,videoId:"dfmjN09kaX4"},
{num:70,musica:"Deus Está Fazendo Algo Grande",artista:"Ana Ticianeli",tom:"-",verbo:false,videoId:"dAbMgyF5d2c"},
{num:71,musica:"Falo Jesus (I Speak Jesus)",artista:"Verbo Music feat. Josias Goulart",tom:"-",verbo:true,videoId:"PbcSnNw9NnA"},
];

const thumb = (id) => id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "";
const ytLink = (id) => id ? `https://youtu.be/${id}` : "";
const ytEmbed = (id) => id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : "";
const cifraClubLink = (musica, artista) => `https://www.cifraclub.com.br/?q=${encodeURIComponent(`${musica || ""} ${artista || ""}`.trim())}`;
const letrasLink = (musica, artista) => `https://www.letras.mus.br/?q=${encodeURIComponent(`${musica || ""} ${artista || ""}`.trim())}`;
const hasTom = (tom) => !!(tom && tom !== "-");

// ─── STYLES — flat branco/minimalista ───────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#ffffff", paddingBottom: 200 },

  hero: { maxWidth: 960, margin: "0 auto", padding: "48px 20px 8px" },
  heroRow: { display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 },
  eyebrow: { fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#047857", marginBottom: 10 },
  h1: { fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, color: "#111418" },
  sub: { color: "#6b7684", fontSize: "0.95rem", marginTop: 10, maxWidth: 440, textWrap: "pretty" },
  counters: { display: "flex", gap: 24, paddingBottom: 6 },
  counterNum: (green) => ({ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", color: green ? "#047857" : "#111418", lineHeight: 1 }),
  counterLabel: { fontSize: "0.72rem", color: "#9aa3ad", marginTop: 4 },

  toolbar: { maxWidth: 960, margin: "0 auto", padding: "28px 20px 0" },
  searchInput: {
    width: "100%", padding: "14px 18px", background: "#f7f9fa",
    border: "1px solid #eef1f4", borderRadius: 12, color: "#111418",
    fontSize: "0.95rem", outline: "none",
  },
  pill: (active) => ({
    padding: "7px 14px", borderRadius: 999,
    border: `1px solid ${active ? "#111418" : "#e2e6ea"}`,
    background: active ? "#111418" : "#ffffff",
    color: active ? "#ffffff" : "#374151",
    fontSize: "0.78rem", cursor: "pointer", whiteSpace: "nowrap",
    fontWeight: active ? 600 : 500, transition: "all .15s",
  }),
  temaLabel: { fontSize: "0.7rem", fontWeight: 600, color: "#9aa3ad", letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 4 },
  temaChip: (active) => ({
    padding: "5px 12px", borderRadius: 999,
    border: `1px solid ${active ? "#a7d9c4" : "#eef1f4"}`,
    background: active ? "#ecfdf5" : "#ffffff",
    color: active ? "#047857" : "#6b7684",
    fontSize: "0.74rem", cursor: "pointer", whiteSpace: "nowrap",
    fontWeight: active ? 600 : 400,
  }),

  grid: { display: "grid", gap: 8, gridTemplateColumns: "minmax(0,1fr)" },
  card: (sel) => ({
    display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
    borderRadius: 14, cursor: "pointer",
    background: sel ? "#f6fbf9" : "#ffffff",
    border: `1px solid ${sel ? "#a7d9c4" : "#eef1f4"}`,
    transition: "border-color .15s, background .15s",
    minWidth: 0, overflow: "hidden",
  }),
  thumb: { width: 72, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0, background: "#f4f6f8" },
  cardTitle: { fontSize: "0.92rem", fontWeight: 600, letterSpacing: "-0.01em", color: "#111418", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  badgeMVV: { flexShrink: 0, fontSize: "0.62rem", padding: "2px 8px", borderRadius: 999, fontWeight: 700, background: "#ecfdf5", color: "#047857", letterSpacing: "0.02em" },
  badgeTom: { flexShrink: 0, fontSize: "0.62rem", padding: "2px 8px", borderRadius: 999, fontWeight: 700, background: "#f4f6f8", color: "#374151" },
  cardArtist: { fontSize: "0.78rem", color: "#6b7684", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 3 },
  temaTag: { fontSize: "0.66rem", padding: "2px 8px", borderRadius: 999, fontWeight: 500, background: "#f7f9fa", color: "#6b7684", border: "1px solid #eef1f4" },
  editBtn: {
    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
    border: "1px solid #eef1f4", background: "#ffffff", color: "#6b7684",
    fontSize: 13, cursor: "pointer",
  },
  check: (sel) => ({
    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: 600, cursor: "pointer",
    background: sel ? "#047857" : "#ffffff",
    border: `1.5px solid ${sel ? "#047857" : "#e2e6ea"}`,
    color: sel ? "#ffffff" : "#9aa3ad", transition: "all .15s",
  }),
  noResults: { textAlign: "center", padding: "60px 20px", color: "#9aa3ad", fontSize: "0.92rem" },

  bottom: {
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 150,
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderTop: "1px solid #eef1f4",
  },
  bottomInner: { maxWidth: 960, margin: "0 auto", padding: "14px 20px 18px" },
  slotWrap: { position: "relative", flex: 1, minWidth: 0 },
  slot: (filled) => ({
    padding: "8px 10px",
    background: filled ? "#f6fbf9" : "#ffffff",
    border: `1.5px ${filled ? "solid #a7d9c4" : "dashed #e2e6ea"}`,
    borderRadius: 10, minHeight: 50,
    display: "flex", flexDirection: "column", justifyContent: "center", gap: 2,
  }),
  slotNum: (filled) => ({ fontSize: "0.6rem", fontWeight: 700, color: filled ? "#047857" : "#c3cad1", letterSpacing: "0.06em", textTransform: "uppercase" }),
  slotName: (filled) => ({
    fontSize: "0.72rem", fontWeight: filled ? 600 : 400,
    color: filled ? "#111418" : "#c3cad1",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    fontStyle: filled ? "normal" : "italic",
  }),
  slotRemove: {
    position: "absolute", top: 3, right: 3, width: 18, height: 18,
    background: "#ffffff", border: "1px solid #eef1f4", borderRadius: 6,
    color: "#9aa3ad", cursor: "pointer", fontSize: 10, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  genBtn: (enabled) => ({
    flex: "0 0 auto", padding: "14px 26px", borderRadius: 12, border: "none",
    fontSize: "0.9rem", fontWeight: 700, cursor: enabled ? "pointer" : "not-allowed",
    background: enabled ? "#047857" : "#f4f6f8",
    color: enabled ? "#ffffff" : "#9aa3ad",
    transition: "all .2s", letterSpacing: "-0.01em",
  }),
  ruleMsg: { marginTop: 10, fontSize: "0.76rem", fontWeight: 500, color: "#b45309" },

  overlay: {
    position: "fixed", inset: 0, zIndex: 300, background: "rgba(17,20,24,0.40)",
    backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
  },
  modal: (maxW, pad) => ({
    width: "100%", maxWidth: maxW, maxHeight: "92vh", overflowY: "auto",
    borderRadius: 20, background: "#ffffff",
    boxShadow: "0 24px 60px rgba(17,20,24,0.18)",
    ...(pad ? { padding: 28 } : {}),
  }),
  modalClose: {
    position: "absolute", top: 12, right: 12, zIndex: 5,
    width: 34, height: 34, borderRadius: 10, border: "none",
    background: "rgba(17,20,24,0.55)", color: "#fff", fontSize: 15, cursor: "pointer",
  },
  modalTitle: { fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#111418" },
  modalSub: { fontSize: "0.8rem", color: "#6b7684", marginTop: 4, marginBottom: 20 },
  fieldLabel: { fontSize: "0.68rem", fontWeight: 700, color: "#9aa3ad", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  input: {
    width: "100%", padding: "11px 12px", borderRadius: 10,
    border: "1px solid #e2e6ea", background: "#ffffff", color: "#111418",
    fontSize: "0.85rem", outline: "none",
  },
  smallInput: (w) => ({ width: w, padding: "9px 10px", borderRadius: 8, border: "1px solid #e2e6ea", fontSize: "0.78rem", outline: "none" }),
  segBtn: (active) => ({
    flex: 1, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
    fontSize: "0.78rem", background: active ? "#ffffff" : "transparent",
    color: active ? "#111418" : "#6b7684", fontWeight: 600,
    boxShadow: active ? "0 1px 2px rgba(17,20,24,0.06)" : "none",
  }),
  errBox: { marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "#fdf2f2", border: "1px solid #f5c6c6", color: "#b91c1c", fontSize: "0.78rem" },
  btnPrimary: {
    flex: 1, padding: "12px 18px", borderRadius: 10, border: "none",
    background: "#047857", color: "#ffffff", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
  },
  btnGhost: {
    padding: "12px 18px", borderRadius: 10, border: "1px solid #e2e6ea",
    background: "#ffffff", color: "#6b7684", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
  },
  btnDanger: {
    padding: "12px 16px", borderRadius: 10, border: "1px solid #f5c6c6",
    background: "#fdf2f2", color: "#b91c1c", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
  },
  actionBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "12px 14px", borderRadius: 10, fontSize: "0.82rem", fontWeight: 600,
    textDecoration: "none", cursor: "pointer",
  },
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────
export default function Repertorio() {
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'verbo'
  const [search, setSearch] = useState("");
  const [tema, setTema] = useState("all");
  const [detail, setDetail] = useState(null);
  // Confirmar repertório (passo 1) → mensagem pronta (passo 2)
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmRows, setConfirmRows] = useState([]); // [{videoId, musica, artista, lead, tom}]
  const [confirmError, setConfirmError] = useState("");
  const [savingConfirm, setSavingConfirm] = useState(false);
  const [meetDate, setMeetDate] = useState("");
  const [meetType, setMeetType] = useState("domingo"); // 'domingo' | 'evento'
  const [meetEventName, setMeetEventName] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Admin / dados persistidos ──
  const [admin, setAdmin] = useState(checkIsAdmin());
  const [overrides, setOverrides] = useState({});   // { videoId: { musica, artista, tom, verbo } }
  const [temasOver, setTemasOver] = useState({});   // { videoId: [temaId, ...] }
  const [songKeys, setSongKeys] = useState({});     // { videoId: [{cantor, tom}, ...] }
  const [deletedSongs, setDeletedSongs] = useState([]);
  const [customSongs, setCustomSongs] = useState([]);
  // Modal Nova música / Editar música
  const [edit, setEdit] = useState(null); // { isNew, videoId, url, musica, artista, tom, verbo, temas, error }
  const [savingEdit, setSavingEdit] = useState(false);
  // Histórico
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ov, to, sk, del, cus] = await Promise.all([
          apiGet("repertorio_overrides"),
          apiGet("repertorio_temas"),
          apiGet("song_keys"),
          apiGet("repertorio_deleted"),
          apiGet("repertorio_custom_songs"),
        ]);
        if (cancelled) return;
        if (ov && typeof ov === "object") setOverrides(ov);
        if (to && typeof to === "object") setTemasOver(to);
        if (sk && typeof sk === "object") setSongKeys(sk);
        if (del && Array.isArray(del)) setDeletedSongs(del);
        if (cus && Array.isArray(cus)) setCustomSongs(cus);
      } catch (e) { console.error("Failed to load data", e); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const sync = () => setAdmin(checkIsAdmin());
    window.addEventListener("admin-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("admin-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // ── Helpers ──
  function getEffectiveSong(s) {
    const ov = overrides[s.videoId];
    if (!ov) return s;
    return {
      ...s,
      musica: ov.musica ? ov.musica : s.musica,
      artista: ov.artista ? ov.artista : s.artista,
      verbo: typeof ov.verbo === "boolean" ? ov.verbo : s.verbo,
      tom: ov.tom ? ov.tom : s.tom,
    };
  }
  function getEffectiveTemas(s) {
    return temasOver[s.videoId] || TEMAS[s.videoId] || [];
  }
  function findRawSong(vid) {
    return SONGS.find(s => s.videoId === vid) || customSongs.find(s => s.videoId === vid);
  }

  const allSongs = [
    ...SONGS.filter(s => !deletedSongs.includes(s.videoId)),
    ...customSongs,
  ];
  const effectiveSongs = allSongs.map(getEffectiveSong);
  const verboCount = effectiveSongs.filter(s => s.verbo).length;

  const filtered = effectiveSongs.filter(s => {
    if (filter === "verbo" && !s.verbo) return false;
    if (tema !== "all" && !getEffectiveTemas(s).includes(tema)) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.musica.toLowerCase().includes(q) || s.artista.toLowerCase().includes(q);
    }
    return true;
  });

  const selIds = new Set(selected.map(s => s.num));
  const hasVerboSel = selected.some(s => s.verbo);
  const canGenerate = selected.length === 4 && hasVerboSel;

  function toggle(s) {
    if (selIds.has(s.num)) {
      setSelected(selected.filter(x => x.num !== s.num));
    } else if (selected.length < 4) {
      setSelected([...selected, s]);
    }
  }

  // ── Fluxo gerar repertório ──
  function openConfirm() {
    if (!canGenerate) return;
    const rows = selected.map(s => ({
      videoId: s.videoId, musica: s.musica, artista: s.artista,
      lead: "", tom: hasTom(s.tom) ? s.tom : "",
    }));
    let date = meetDate;
    if (!date) {
      // Default: próximo domingo
      const today = new Date();
      const dow = today.getDay();
      const add = dow === 0 ? 7 : (7 - dow);
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + add);
      date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    setConfirmRows(rows);
    setMeetDate(date);
    setConfirmError("");
    setShowConfirm(true);
  }

  async function confirmAndShow() {
    if (!createdBy.trim()) { setConfirmError("Informe quem está criando o repertório."); return; }
    if (!meetDate) { setConfirmError("Selecione a data do culto."); return; }
    if (meetType === "evento" && !meetEventName.trim()) { setConfirmError("Informe o nome do evento."); return; }
    setSavingConfirm(true);
    try {
      // Histórico de tons por cantor (song_keys) — só quando lead+tom preenchidos
      const nextKeys = { ...songKeys };
      confirmRows.forEach(row => {
        const lead = (row.lead || "").trim();
        const tom = (row.tom || "").trim();
        if (!lead || !tom) return;
        const arr = Array.isArray(nextKeys[row.videoId]) ? [...nextKeys[row.videoId]] : [];
        const idx = arr.findIndex(k => (k.cantor || "").trim() === lead);
        if (idx >= 0) arr[idx] = { cantor: lead, tom };
        else arr.push({ cantor: lead, tom });
        nextKeys[row.videoId] = arr;
      });
      const keysChanged = JSON.stringify(nextKeys) !== JSON.stringify(songKeys);

      const entry = {
        id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        createdBy: createdBy.trim(),
        date: meetDate,
        type: meetType,
        eventName: meetType === "evento" ? meetEventName.trim() : "",
        songs: selected.map(s => {
          const row = confirmRows.find(r => r.videoId === s.videoId) || {};
          return {
            videoId: s.videoId, musica: s.musica, artista: s.artista, verbo: !!s.verbo,
            lead: (row.lead || "").trim(), tom: (row.tom || "").trim(),
          };
        }),
      };
      let cur = [];
      try {
        const h = await apiGet("repertorio_history");
        if (Array.isArray(h)) cur = h;
      } catch { /* ignore */ }
      const ops = [apiPut("repertorio_history", [entry, ...cur])];
      if (keysChanged) ops.push(apiPut("song_keys", nextKeys));
      await Promise.all(ops);
      if (keysChanged) setSongKeys(nextKeys);
    } catch (e) {
      // Persistência pode falhar sem admin — ainda mostramos a mensagem
      console.error("Failed to save repertorio", e);
    } finally {
      setSavingConfirm(false);
      setShowConfirm(false);
      setShowOutput(true);
    }
  }

  function formatDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${m}/${d}/${y}`;
  }

  function getOutputText() {
    const sep = "━━━━━━━━━━━━━━━━━━━━━";
    let t = `🎵 *REPERTÓRIO DE LOUVOR* 🎵\n`;
    t += `📍 *Verbo Music — Orlando, FL*\n`;
    if (meetDate) {
      const tipo = meetType === "evento"
        ? `🎉 ${meetEventName.trim() || "Evento Especial"}`
        : "⛪ Culto de Domingo";
      t += `📅 ${formatDate(meetDate)}  ·  ${tipo}\n`;
    }
    if (createdBy.trim()) t += `✍ Repertório por: *${createdBy.trim()}*\n`;
    t += `${sep}\n\n`;
    selected.forEach((s, i) => {
      const row = confirmRows.find(r => r.videoId === s.videoId) || {};
      t += `*${i + 1}. ${s.musica}*${s.verbo ? " ⭐" : ""}\n`;
      t += `🎤 ${s.artista}\n`;
      const parts = [];
      if ((row.lead || "").trim()) parts.push(`🎙 Lead: *${row.lead.trim()}*`);
      if ((row.tom || "").trim()) parts.push(`🎼 Tom: *${row.tom.trim()}*`);
      if (parts.length) t += parts.join("  ·  ") + "\n";
      t += `▶ https://youtu.be/${s.videoId}\n\n`;
    });
    t += `${sep}\n⭐ MVV\n_Que o Senhor seja exaltado neste culto!_ 🙌`;
    return t;
  }

  function copyText() {
    navigator.clipboard.writeText(getOutputText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Admin: Nova música / Editar / Excluir ──
  function openAddSong() {
    setEdit({ isNew: true, url: "", musica: "", artista: "", tom: "", verbo: false, temas: [], error: "" });
  }
  function openEdit(s) {
    setDetail(null);
    setEdit({
      isNew: false, videoId: s.videoId,
      musica: s.musica, artista: s.artista === "-" ? "" : s.artista,
      tom: hasTom(s.tom) ? s.tom : "", verbo: !!s.verbo,
      temas: [...getEffectiveTemas(s)], error: "",
    });
  }

  async function saveEdit() {
    if (!edit) return;
    if (!edit.musica.trim()) { setEdit({ ...edit, error: "Nome da música é obrigatório." }); return; }
    setSavingEdit(true);
    try {
      if (edit.isNew) {
        const raw = (edit.url || "").trim();
        const m = raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || (/^[\w-]{11}$/.test(raw) ? [null, raw] : null);
        if (!m) { setEdit({ ...edit, error: "Link do YouTube inválido. Cole o link completo." }); return; }
        const videoId = m[1];
        if (allSongs.some(s => s.videoId === videoId)) { setEdit({ ...edit, error: "Essa música já está no repertório." }); return; }
        const nums = allSongs.map(s => s.num);
        const song = {
          num: (nums.length ? Math.max(...nums) : 0) + 1,
          musica: edit.musica.trim(),
          artista: edit.artista.trim() || "-",
          tom: edit.tom.trim() || "-",
          verbo: !!edit.verbo,
          videoId,
        };
        const nextCustom = [...customSongs, song];
        let nextTemas = temasOver;
        const ops = [apiPut("repertorio_custom_songs", nextCustom)];
        if (edit.temas.length > 0) {
          nextTemas = { ...temasOver, [videoId]: edit.temas };
          ops.push(apiPut("repertorio_temas", nextTemas));
        }
        await Promise.all(ops);
        setCustomSongs(nextCustom);
        setTemasOver(nextTemas);
      } else {
        const vid = edit.videoId;
        const base = findRawSong(vid);
        if (!base) return;
        // Override guarda só o que difere da base
        const nextOv = { ...overrides };
        const ov = {};
        const musica = edit.musica.trim();
        const artista = edit.artista.trim() || "-";
        const tom = edit.tom.trim() || "-";
        if (musica && musica !== base.musica) ov.musica = musica;
        if (artista !== base.artista) ov.artista = artista;
        if (tom !== base.tom) ov.tom = tom;
        if (!!edit.verbo !== !!base.verbo) ov.verbo = !!edit.verbo;
        if (Object.keys(ov).length === 0) delete nextOv[vid];
        else nextOv[vid] = ov;

        const nextTemas = { ...temasOver };
        if (edit.temas.length > 0) nextTemas[vid] = edit.temas;
        else delete nextTemas[vid];

        await Promise.all([
          apiPut("repertorio_overrides", nextOv),
          apiPut("repertorio_temas", nextTemas),
        ]);
        setOverrides(nextOv);
        setTemasOver(nextTemas);
        // Reflete a edição nas músicas já selecionadas nos slots
        setSelected(sel => sel.map(s => {
          if (s.videoId !== vid) return s;
          const merged = nextOv[vid] ? { ...base, ...nextOv[vid] } : base;
          return { ...s, ...merged };
        }));
      }
      setEdit(null);
    } catch (e) {
      console.error("Failed to save song", e);
      setEdit(ed => ed ? { ...ed, error: e.message === "unauthorized" ? "Sessão admin expirada. Entre novamente." : "Falha ao salvar. Tente novamente." } : ed);
    } finally { setSavingEdit(false); }
  }

  async function deleteSong() {
    if (!edit || edit.isNew) return;
    const vid = edit.videoId;
    setSavingEdit(true);
    try {
      const isCustom = customSongs.some(c => c.videoId === vid);
      if (isCustom) {
        const nextCustom = customSongs.filter(c => c.videoId !== vid);
        await apiPut("repertorio_custom_songs", nextCustom);
        setCustomSongs(nextCustom);
      } else if (!deletedSongs.includes(vid)) {
        const nextDel = [...deletedSongs, vid];
        await apiPut("repertorio_deleted", nextDel);
        setDeletedSongs(nextDel);
      }
      setSelected(sel => sel.filter(s => s.videoId !== vid));
      if (detail && detail.videoId === vid) setDetail(null);
      setEdit(null);
    } catch (e) {
      console.error("Failed to delete song", e);
      setEdit(ed => ed ? { ...ed, error: "Falha ao excluir. Tente novamente." } : ed);
    } finally { setSavingEdit(false); }
  }

  // ── Histórico ──
  async function openHistory() {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const cur = await apiGet("repertorio_history");
      setHistory(Array.isArray(cur) ? cur : []);
    } catch (e) {
      console.error("Failed to load history", e);
      setHistory([]);
    } finally { setLoadingHistory(false); }
  }

  function toggleTemaOnEdit(id) {
    if (!edit) return;
    const t = [...edit.temas];
    const j = t.indexOf(id);
    if (j >= 0) t.splice(j, 1);
    else if (t.length < 3) t.push(id);
    setEdit({ ...edit, temas: t, error: "" });
  }

  const detailSel = detail ? selIds.has(detail.num) : false;
  const ruleMsg = selected.length < 4
    ? `Faltam ${4 - selected.length} música(s)${!hasVerboSel ? " — inclua 1 do MVV" : ""}`
    : "Inclua pelo menos 1 música do MVV";

  return (
    <div style={S.page}>
      <SiteHeader current="repertorio" onAddSong={openAddSong} onHistory={openHistory} />

      {/* HERO */}
      <section style={S.hero}>
        <div style={S.heroRow}>
          <div>
            <div style={S.eyebrow}>Ministério de Louvor</div>
            <h1 style={S.h1}>Repertório</h1>
            <p style={S.sub}>Escolha <b style={{ color: "#111418" }}>4 músicas</b> para o próximo culto — pelo menos 1 do MVV.</p>
          </div>
          <div style={S.counters}>
            <div>
              <div style={S.counterNum(false)}>{effectiveSongs.length}</div>
              <div style={S.counterLabel}>músicas</div>
            </div>
            <div style={{ width: 1, background: "#eef1f4" }} />
            <div>
              <div style={S.counterNum(true)}>{verboCount}</div>
              <div style={S.counterLabel}>MVV</div>
            </div>
          </div>
        </div>
      </section>

      {/* BUSCA + FILTROS + LISTA */}
      <section style={S.toolbar}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            className="search-input"
            style={S.searchInput}
            placeholder="Buscar música ou artista…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button type="button" style={S.pill(filter === "all")} onClick={() => setFilter("all")}>Todas</button>
            <button type="button" style={S.pill(filter === "verbo")} onClick={() => setFilter("verbo")}>MVV</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            <span style={S.temaLabel}>Temas</span>
            <button type="button" style={S.temaChip(tema === "all")} onClick={() => setTema("all")}>Todos</button>
            {Object.entries(TEMAS_DEF).map(([id, def]) => (
              <button key={id} type="button" style={S.temaChip(tema === id)} onClick={() => setTema(id)}>{def.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "26px 0 12px" }}>
          <span style={{ fontSize: "0.78rem", color: "#9aa3ad" }}>{filtered.length} resultado(s)</span>
        </div>

        <div style={S.grid}>
          {filtered.map(s => {
            const isSel = selIds.has(s.num);
            const songTemas = getEffectiveTemas(s).map(tid => TEMAS_DEF[tid]).filter(Boolean);
            return (
              <div key={s.videoId} className="song-card" style={S.card(isSel)} onClick={() => setDetail(s)}>
                <img src={thumb(s.videoId)} loading="lazy" alt="" style={S.thumb} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={S.cardTitle}>{s.musica}</span>
                    {s.verbo && <span style={S.badgeMVV}>MVV</span>}
                    {hasTom(s.tom) && <span style={S.badgeTom}>{s.tom}</span>}
                  </div>
                  <div style={S.cardArtist}>{s.artista === "-" ? "Artista não informado" : s.artista}</div>
                  {songTemas.length > 0 && (
                    <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                      {songTemas.map(def => <span key={def.label} style={S.temaTag}>{def.label}</span>)}
                    </div>
                  )}
                </div>
                {admin && (
                  <button type="button" style={S.editBtn} title="Editar música"
                    onClick={e => { e.stopPropagation(); openEdit(s); }}>✎</button>
                )}
                <button type="button" style={S.check(isSel)} title={isSel ? "Remover" : "Adicionar"}
                  onClick={e => { e.stopPropagation(); toggle(s); }}>{isSel ? "✓" : "+"}</button>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={S.noResults}>Nenhuma música encontrada</div>}
        </div>
      </section>

      {/* MODAL: Perfil da música */}
      {detail && (
        <div style={S.overlay} className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDetail(null); }}>
          <div style={{ ...S.modal(620), position: "relative" }} className="modal-box">
            <button type="button" style={S.modalClose} onClick={() => setDetail(null)}>✕</button>
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#111418", borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
              <iframe
                src={ytEmbed(detail.videoId)}
                style={{ width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={detail.musica}
              />
            </div>
            <div style={{ padding: "24px 26px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#111418", lineHeight: 1.2 }}>{detail.musica}</div>
                {detail.verbo && <span style={{ ...S.badgeMVV, padding: "3px 9px" }}>MVV</span>}
                {hasTom(detail.tom) && <span style={{ ...S.badgeTom, padding: "3px 9px" }}>Tom: {detail.tom}</span>}
              </div>
              <div style={{ color: "#6b7684", fontSize: "0.88rem", marginTop: 4 }}>{detail.artista === "-" ? "Artista não informado" : detail.artista}</div>
              {getEffectiveTemas(detail).length > 0 && (
                <div style={{ display: "flex", gap: 5, marginTop: 12, flexWrap: "wrap" }}>
                  {getEffectiveTemas(detail).map(tid => TEMAS_DEF[tid]).filter(Boolean).map(def => (
                    <span key={def.label} style={{ ...S.temaTag, fontSize: "0.7rem", padding: "3px 10px" }}>{def.label}</span>
                  ))}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 18 }}>
                <a href={ytLink(detail.videoId)} target="_blank" rel="noreferrer"
                  style={{ ...S.actionBtn, background: "#047857", color: "#ffffff" }}>▶ Abrir no YouTube</a>
                <button type="button" onClick={() => toggle(detail)}
                  style={{
                    ...S.actionBtn,
                    background: detailSel ? "#ecfdf5" : "#ffffff",
                    border: `1.5px solid ${detailSel ? "#a7d9c4" : "#e2e6ea"}`,
                    color: detailSel ? "#047857" : "#374151",
                  }}>
                  {detailSel ? "✓ No repertório" : "+ Adicionar ao repertório"}
                </button>
                <a href={cifraClubLink(detail.musica, detail.artista)} target="_blank" rel="noreferrer"
                  style={{ ...S.actionBtn, background: "#ffffff", border: "1px solid #e2e6ea", color: "#374151" }}>Cifra Club</a>
                <a href={letrasLink(detail.musica, detail.artista)} target="_blank" rel="noreferrer"
                  style={{ ...S.actionBtn, background: "#ffffff", border: "1px solid #e2e6ea", color: "#374151" }}>Letra</a>
              </div>
              {admin && (
                <button type="button" onClick={() => openEdit(detail)}
                  style={{ width: "100%", marginTop: 8, padding: "12px 14px", borderRadius: 10, border: "1px solid #eef1f4", background: "#fafbfc", color: "#6b7684", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                  ✎ Editar música
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar repertório */}
      {showConfirm && (
        <div style={S.overlay} className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowConfirm(false); setConfirmError(""); } }}>
          <div style={S.modal(560, true)} className="modal-box">
            <div style={S.modalTitle}>Confirmar repertório</div>
            <div style={S.modalSub}>Revise os detalhes antes de gerar a mensagem.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={S.fieldLabel}>Data do culto</div>
                <input type="date" style={S.input} value={meetDate} onChange={e => setMeetDate(e.target.value)} />
              </div>
              <div>
                <div style={S.fieldLabel}>Tipo</div>
                <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 10, background: "#f4f6f8" }}>
                  <button type="button" style={S.segBtn(meetType === "domingo")} onClick={() => setMeetType("domingo")}>Domingo</button>
                  <button type="button" style={S.segBtn(meetType === "evento")} onClick={() => setMeetType("evento")}>Evento</button>
                </div>
              </div>
            </div>
            {meetType === "evento" && (
              <div style={{ marginTop: 12 }}>
                <div style={S.fieldLabel}>Nome do evento</div>
                <input style={S.input} placeholder="Ex: Conferência de Louvor" value={meetEventName} onChange={e => setMeetEventName(e.target.value)} />
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <div style={S.fieldLabel}>Repertório por</div>
              <input style={S.input} placeholder="Seu nome" value={createdBy} onChange={e => setCreatedBy(e.target.value)} />
            </div>
            <div style={{ ...S.fieldLabel, margin: "20px 0 8px" }}>Músicas — lead e tom</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {confirmRows.map((r, i) => (
                <div key={r.videoId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1px solid #eef1f4", borderRadius: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#111418", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.musica}</div>
                    <div style={{ fontSize: "0.7rem", color: "#9aa3ad" }}>{r.artista === "-" ? "Artista não informado" : r.artista}</div>
                  </div>
                  <input
                    style={S.smallInput(120)} placeholder="Lead" value={r.lead}
                    onChange={e => {
                      const rows = [...confirmRows];
                      rows[i] = { ...rows[i], lead: e.target.value };
                      setConfirmRows(rows);
                    }}
                  />
                  <input
                    style={S.smallInput(64)} placeholder="Tom" value={r.tom}
                    onChange={e => {
                      const rows = [...confirmRows];
                      rows[i] = { ...rows[i], tom: e.target.value };
                      setConfirmRows(rows);
                    }}
                  />
                </div>
              ))}
            </div>
            {confirmError && <div style={S.errBox}>{confirmError}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
              <button type="button" style={S.btnGhost} onClick={() => { setShowConfirm(false); setConfirmError(""); }}>Voltar</button>
              <button type="button" className="green-btn" style={{ ...S.btnPrimary, opacity: savingConfirm ? 0.6 : 1 }} disabled={savingConfirm} onClick={confirmAndShow}>
                {savingConfirm ? "Gerando..." : "Gerar mensagem →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Repertório pronto */}
      {showOutput && (
        <div style={S.overlay} className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowOutput(false); }}>
          <div style={S.modal(560, true)} className="modal-box">
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 12px" }}>✓</div>
            <div style={{ ...S.modalTitle, textAlign: "center" }}>Repertório pronto</div>
            <div style={{ ...S.modalSub, textAlign: "center", marginBottom: 18 }}>Copie e envie no grupo do WhatsApp.</div>
            <div style={{ background: "#f7f9fa", padding: 16, borderRadius: 12, fontSize: "0.8rem", lineHeight: 1.7, whiteSpace: "pre-wrap", border: "1px solid #eef1f4", color: "#111418", maxHeight: "44vh", overflowY: "auto" }}>
              {getOutputText()}
            </div>
            <button type="button" className="green-btn" onClick={copyText}
              style={{ width: "100%", marginTop: 14, padding: 13, borderRadius: 12, border: "none", background: "#047857", color: "#fff", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
              {copied ? "✓ Copiado!" : "Copiar para WhatsApp"}
            </button>
            <button type="button" onClick={() => setShowOutput(false)}
              style={{ width: "100%", marginTop: 8, padding: 11, borderRadius: 12, border: "1px solid #e2e6ea", background: "transparent", color: "#6b7684", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600 }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Nova música / Editar música */}
      {edit && (
        <div style={{ ...S.overlay, zIndex: 310 }} className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEdit(null); }}>
          <div style={S.modal(520, true)} className="modal-box">
            <div style={S.modalTitle}>{edit.isNew ? "Nova música" : "Editar música"}</div>
            <div style={S.modalSub}>
              {edit.isNew ? "Adicione uma música a partir de um link do YouTube." : `${edit.musica} — ${edit.artista || "-"}`}
            </div>
            {edit.isNew && (
              <div style={{ marginBottom: 12 }}>
                <div style={S.fieldLabel}>Link do YouTube</div>
                <input style={S.input} placeholder="https://www.youtube.com/watch?v=…" value={edit.url}
                  onChange={e => setEdit({ ...edit, url: e.target.value, error: "" })} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={S.fieldLabel}>Nome da música</div>
                <input style={S.input} placeholder="Título" value={edit.musica}
                  onChange={e => setEdit({ ...edit, musica: e.target.value, error: "" })} />
              </div>
              <div>
                <div style={S.fieldLabel}>Artista</div>
                <input style={S.input} placeholder="Artista / banda" value={edit.artista}
                  onChange={e => setEdit({ ...edit, artista: e.target.value, error: "" })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              <div>
                <div style={S.fieldLabel}>Tom geral</div>
                <input style={S.input} placeholder="Ex: G, Bb, F#m" value={edit.tom}
                  onChange={e => setEdit({ ...edit, tom: e.target.value, error: "" })} />
              </div>
              <div>
                <div style={S.fieldLabel}>Tag</div>
                <button type="button" onClick={() => setEdit({ ...edit, verbo: !edit.verbo })}
                  style={{
                    width: "100%", padding: "11px 12px", borderRadius: 10,
                    border: `1.5px solid ${edit.verbo ? "#a7d9c4" : "#e2e6ea"}`,
                    background: edit.verbo ? "#ecfdf5" : "#ffffff",
                    color: edit.verbo ? "#047857" : "#6b7684",
                    fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  }}>
                  {edit.verbo ? "✓ MVV" : "MVV"}
                </button>
              </div>
            </div>
            <div style={{ ...S.fieldLabel, margin: "16px 0 8px" }}>Temas (até 3)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(TEMAS_DEF).map(([id, def]) => {
                const idx = edit.temas.indexOf(id);
                const on = idx >= 0;
                return (
                  <button key={id} type="button" style={S.temaChip(on)} onClick={() => toggleTemaOnEdit(id)}>
                    {on ? `${def.label} · ${idx + 1}` : def.label}
                  </button>
                );
              })}
            </div>
            {edit.error && <div style={S.errBox}>{edit.error}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
              {!edit.isNew && (
                <button type="button" style={S.btnDanger} disabled={savingEdit} onClick={deleteSong}>Excluir</button>
              )}
              <button type="button" style={S.btnGhost} onClick={() => setEdit(null)}>Cancelar</button>
              <button type="button" className="green-btn" style={{ ...S.btnPrimary, opacity: savingEdit ? 0.6 : 1 }} disabled={savingEdit} onClick={saveEdit}>
                {savingEdit ? "Salvando..." : (edit.isNew ? "Adicionar" : "Salvar")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Histórico */}
      {showHistory && (
        <div style={S.overlay} className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowHistory(false); }}>
          <div style={S.modal(560, true)} className="modal-box">
            <div style={S.modalTitle}>Histórico de repertórios</div>
            <div style={S.modalSub}>Repertórios gerados, do mais recente para o mais antigo.</div>
            {loadingHistory && <div style={{ textAlign: "center", padding: "40px 20px", color: "#9aa3ad", fontSize: "0.85rem" }}>Carregando…</div>}
            {!loadingHistory && history.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#9aa3ad", fontSize: "0.85rem" }}>Nenhum repertório gerado ainda.</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history.map(h => (
                <div key={h.id} style={{ border: "1px solid #eef1f4", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111418" }}>
                      {h.type === "evento" ? `🎉 ${h.eventName || "Evento"}` : "⛪ Culto de Domingo"} — {formatDate(h.date)}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#9aa3ad" }}>por {h.createdBy || "—"}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }}>
                    {(h.songs || []).map((s, i) => (
                      <div key={i} style={{ fontSize: "0.78rem", color: "#374151" }}>
                        {i + 1}. {s.musica}
                        {s.lead ? ` · Lead: ${s.lead}` : ""}
                        {s.tom ? ` · Tom: ${s.tom}` : ""}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setShowHistory(false)}
              style={{ width: "100%", marginTop: 18, padding: 11, borderRadius: 12, border: "1px solid #e2e6ea", background: "transparent", color: "#6b7684", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600 }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* BARRA FIXA INFERIOR */}
      <div style={S.bottom}>
        <div style={S.bottomInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, flex: "1 1 320px", minWidth: 0 }}>
              {[0, 1, 2, 3].map(i => {
                const s = selected[i];
                return (
                  <div key={i} style={S.slotWrap}>
                    <div style={S.slot(!!s)}>
                      <div style={S.slotNum(!!s)}>{i + 1}ª</div>
                      <div style={S.slotName(!!s)}>{s ? s.musica : "vazio"}</div>
                    </div>
                    {s && (
                      <button type="button" style={S.slotRemove} title="Remover"
                        onClick={() => setSelected(selected.filter(x => x.num !== s.num))}>✕</button>
                    )}
                  </div>
                );
              })}
            </div>
            <button type="button" style={S.genBtn(canGenerate)} onClick={openConfirm}>
              {canGenerate ? "Gerar repertório →" : "Gerar repertório"}
            </button>
          </div>
          {selected.length > 0 && !canGenerate && <div style={S.ruleMsg}>{ruleMsg}</div>}
        </div>
      </div>
    </div>
  );
}
