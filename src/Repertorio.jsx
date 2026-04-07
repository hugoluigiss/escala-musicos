import { useState, useEffect } from "react";
import { TEMAS, TEMAS_DEF } from "./temas.js";
import { apiGet, apiPut, isAdmin as checkIsAdmin } from "./api.js";
import { EditSongModal, PessoasModal } from "./AdminEdit.jsx";
import SiteHeader from "./SiteHeader.jsx";

// ─── SONG DATA ──────────────────────────────────────────────────────────────
const SONGS=[
{num:1,musica:"Não é Homem pra Mentir",artista:"Marcos Freire",tom:"-",indicadaPor:"Matheus Emmanuel",verbo:false,videoId:"ILy997rP3Po"},
{num:2,musica:"A Boa Parte (Ao Vivo)",artista:"Fhop Music / Nívea Soares",tom:"-",indicadaPor:"Matheus Emmanuel",verbo:false,videoId:"dlGOiuxSzVw"},
{num:3,musica:"Prefiro a Tua Presença",artista:"Ana Luiza",tom:"-",indicadaPor:"Matheus Emmanuel",verbo:false,videoId:"4grgpeRwcfg"},
{num:4,musica:"Gratidão",artista:"ADAI Music / Fernando Silva",tom:"-",indicadaPor:"Matheus Emmanuel",verbo:false,videoId:"Z1faUgngZlU"},
{num:5,musica:"O Nome Dele",artista:"Sued Silva",tom:"-",indicadaPor:"Matheus Emmanuel",verbo:false,videoId:"x4ZaA7JgYC4"},
{num:6,musica:"Minh'alma Engrandece ao Senhor / Adorado",artista:"Rachel Novaes e Thamires Garcia",tom:"-",indicadaPor:"Jokasta Silva",verbo:false,videoId:"oNUErOaOuPw"},
{num:7,musica:"Em Nome De Jesus (Ao Vivo)",artista:"Emylie Rodrigues",tom:"-",indicadaPor:"Jokasta Silva",verbo:true,videoId:"3CqL4pgTF5Q"},
{num:8,musica:"Cristo Vem Me Buscar",artista:"Ligia Coelho",tom:"-",indicadaPor:"Jokasta Silva",verbo:false,videoId:"aBJKhyXyxCI"},
{num:9,musica:"Medley: Tens Sido Fiel + Vem de Ti Senhor",artista:"Sede Verbo da Vida",tom:"-",indicadaPor:"Jokasta Silva",verbo:true,videoId:"TypWyNW7yJ0"},
{num:10,musica:"Medley: Confio em Ti + Salmos 23",artista:"Sede Verbo da Vida",tom:"-",indicadaPor:"Jokasta Silva",verbo:true,videoId:"9Lb6iTtcvFc"},
{num:11,musica:"Medley Fé",artista:"Sede Verbo da Vida",tom:"-",indicadaPor:"Jokasta Silva",verbo:true,videoId:"39_zgvLtPS4"},
{num:12,musica:"Eu me Alegro em Ti",artista:"Ministério de Louvor Shalom DF",tom:"-",indicadaPor:"Jokasta Silva",verbo:false,videoId:"b1d6C681f4Y"},
{num:13,musica:"Emmanuel",artista:"Hillsong (Legendado PT)",tom:"-",indicadaPor:"Jokasta Silva",verbo:false,videoId:"_C2v2F2C9vA"},
{num:14,musica:"Medley: Sonhando os Sonhos de Deus + Está Escrito",artista:"Sede Verbo da Vida",tom:"-",indicadaPor:"Madalena",verbo:true,videoId:"jRfwoIe3tE4"},
{num:15,musica:"Redimido (Ao Vivo)",artista:"Bruna Olly e Julia Vitória",tom:"-",indicadaPor:"Madalena",verbo:false,videoId:"5MwyYi9OYow"},
{num:16,musica:"Poderoso",artista:"Marcos Witt feat. Kike Pavón",tom:"-",indicadaPor:"Madalena",verbo:false,videoId:"xODYnxwPz_c"},
{num:17,musica:"Não Temerei (Ao Vivo)",artista:"Heloisa Rosa",tom:"-",indicadaPor:"Madalena",verbo:false,videoId:"H0BLt5pOXCs"},
{num:18,musica:"Tua Igreja Canta",artista:"Israel Salazar",tom:"C",indicadaPor:"Aline Magalhães",verbo:false,videoId:"0I_3CCL6Q5U"},
{num:19,musica:"Em Seu Nome",artista:"André Aquino ft. Gabriela Rocha",tom:"Gb",indicadaPor:"Aline Magalhães",verbo:false,videoId:"bHooZ7OGN1I"},
{num:20,musica:"Me Ama",artista:"Diante do Trono",tom:"G",indicadaPor:"Aline Magalhães",verbo:false,videoId:"lSwiHA8gymg"},
{num:21,musica:"Hino da Vitória (Não Se Frustaram Medley)",artista:"Gabriela Rocha",tom:"D",indicadaPor:"Aline Magalhães",verbo:false,videoId:"lTRNHofvCmU"},
{num:22,musica:"Estou Livre (Ao Vivo)",artista:"Heloisa Rosa",tom:"-",indicadaPor:"",verbo:false,videoId:"QDry3GFwXUw"},
{num:23,musica:"Abençoado (Ao Vivo)",artista:"Gabriel Rodrigues",tom:"-",indicadaPor:"",verbo:true,videoId:"EJi0tgUfEkE"},
{num:24,musica:"Nova Fase",artista:"Ana Diniz",tom:"-",indicadaPor:"",verbo:true,videoId:"6H92C6oWv2k"},
{num:25,musica:"Eu Te Agradeço",artista:"Sede Verbo da Vida",tom:"-",indicadaPor:"",verbo:true,videoId:"xHzGAG5gk0o"},
{num:26,musica:"Nada é Impossível",artista:"Quatro por Um",tom:"-",indicadaPor:"",verbo:false,videoId:"8jqhvdgOfG4"},
{num:27,musica:"Nova Criatura",artista:"Kleber Lucas",tom:"-",indicadaPor:"",verbo:false,videoId:"xWi8IRepur0"},
{num:28,musica:"Meu Alvo",artista:"Kleber Lucas",tom:"-",indicadaPor:"",verbo:false,videoId:"faRYpkO3v3A"},
{num:29,musica:"Eu Creio em Ti",artista:"André Martins",tom:"-",indicadaPor:"",verbo:false,videoId:"bZFm2ckl30c"},
{num:30,musica:"Algo Novo",artista:"André Martins",tom:"-",indicadaPor:"",verbo:false,videoId:"ljG1r0L7NUI"},
{num:31,musica:"Teu Amor Não Falha",artista:"Nívea Soares",tom:"-",indicadaPor:"",verbo:false,videoId:"3q-pRKf-VaQ"},
{num:32,musica:"Diz (You Say)",artista:"Gabriela Rocha",tom:"-",indicadaPor:"",verbo:false,videoId:"LF1UnPP4MvY"},
{num:33,musica:"Sublime (Ao Vivo)",artista:"Fhop Music",tom:"-",indicadaPor:"",verbo:false,videoId:"7GWZwO0MdsY"},
{num:34,musica:"Santo Pra Sempre (Ao Vivo)",artista:"Gabriel Guedes",tom:"-",indicadaPor:"",verbo:false,videoId:"ijNCc7ICCck"},
{num:35,musica:"Digno de Tudo",artista:"Central 3 / Gabriela Maganete / Gabi Sampaio",tom:"-",indicadaPor:"",verbo:false,videoId:"46r7YDxB0t4"},
{num:36,musica:"Yo Te Busco",artista:"Gateway Worship / Coalo Zamorano",tom:"-",indicadaPor:"",verbo:false,videoId:"qcekc_yJLxw"},
{num:37,musica:"Medley: Vida Aos Sepulcros / Tudo Sobre Você / Só Tu es Santo",artista:"Jesse Nascimento",tom:"-",indicadaPor:"",verbo:false,videoId:"LnrwXvesMy0"},
{num:38,musica:"Nunca Me Deixou",artista:"Livres Para Adorar",tom:"-",indicadaPor:"",verbo:false,videoId:"Z_mvHa5BnvQ"},
{num:39,musica:"Nada Me Falta",artista:"Sede Verbo da Vida (Eliezer Rodrigues)",tom:"-",indicadaPor:"",verbo:true,videoId:"t5iptUXVyX0"},
{num:40,musica:"Teu Amor Não Falha",artista:"André Valadão",tom:"-",indicadaPor:"",verbo:false,videoId:"iqCM_yxslfU"},
{num:41,musica:"Pela Fé",artista:"André Valadão",tom:"-",indicadaPor:"",verbo:false,videoId:"phog1GGvzHU"},
{num:42,musica:"Nasci de Novo",artista:"André Valadão",tom:"-",indicadaPor:"",verbo:false,videoId:"mAMyXHC85Nc"},
{num:43,musica:"Sobre Todo Nome",artista:"Davi Silva",tom:"-",indicadaPor:"",verbo:false,videoId:"pfxh4uPy9dA"},
{num:44,musica:"Novo e Vivo Caminho (Ao Vivo)",artista:"Sede Verbo da Vida",tom:"-",indicadaPor:"",verbo:true,videoId:"QIuVWpLLYy8"},
{num:45,musica:"A Bênção",artista:"Misaias Oliveira (Cover Gabriel Guedes)",tom:"-",indicadaPor:"",verbo:false,videoId:"IMD1eBr1cfw"},
{num:46,musica:"Vem Esta é a Hora",artista:"Vineyard Piratininga / O Canto das Igrejas",tom:"-",indicadaPor:"",verbo:false,videoId:"tesOYs6bIgc"},
{num:47,musica:"Que Ele Cresça",artista:"Nívea Soares + Nathanael Brito",tom:"-",indicadaPor:"",verbo:false,videoId:"hDjFz6DOcQo"},
{num:48,musica:"Santo + Que Ele Cresça",artista:"Thiago Godoi",tom:"-",indicadaPor:"",verbo:false,videoId:"5kzkPheDZiI"},
{num:49,musica:"Ao Que Está Assentado Sobre o Trono + Nada Vai Roubar Tua Glória",artista:"Altomonte / Victor Valente",tom:"-",indicadaPor:"",verbo:false,videoId:"kHKVFxyTjsE"},
{num:50,musica:"A Alegria do Senhor (Ao Vivo)",artista:"Eliezer Rodrigues",tom:"-",indicadaPor:"",verbo:true,videoId:"vzx_FT48k1o"},
{num:51,musica:"Tudo é Perda (Ao Vivo)",artista:"Felipe Rodrigues",tom:"-",indicadaPor:"",verbo:false,videoId:"qxzQR5uwWsk"},
{num:52,musica:"Eu Me Rendo (Ao Vivo)",artista:"Leonardo Gonçalves",tom:"-",indicadaPor:"",verbo:false,videoId:"_SzVzMh7qfM"},
{num:53,musica:"Te Seguirei Até O Fim",artista:"Sede Verbo da Vida",tom:"-",indicadaPor:"",verbo:true,videoId:"4ks4j9KqXXk"},
{num:54,musica:"Sobre as Águas (Ao Vivo)",artista:"Rapha Gonçalves / Isaías Saad",tom:"-",indicadaPor:"",verbo:false,videoId:"XUs7nuz6c0M"},
{num:55,musica:"Cremos no Teu Poder",artista:"Sede Verbo da Vida",tom:"-",indicadaPor:"",verbo:true,videoId:"p4SX8gG38zg"},
{num:56,musica:"Cremos No Teu Poder (Ao Vivo)",artista:"Emylie Rodrigues",tom:"-",indicadaPor:"",verbo:true,videoId:"d2OLS1RkGF4"},
{num:57,musica:"Bom Perfume",artista:"Sede Verbo da Vida",tom:"-",indicadaPor:"",verbo:true,videoId:"WlR8o3D0V5c"},
{num:58,musica:"Teu Amor Não Falha",artista:"Templo Soul",tom:"-",indicadaPor:"",verbo:false,videoId:"Npsfmz5PrvA"},
{num:59,musica:"Fortaleza",artista:"Ana Ticianeli",tom:"-",indicadaPor:"",verbo:true,videoId:"vcX5ljPzIdw"},
{num:60,musica:"Satisfaz",artista:"André Martins",tom:"-",indicadaPor:"",verbo:false,videoId:"YuBmD6BmAs0"},
{num:61,musica:"Este é o Dia",artista:"Euller Oliveira",tom:"-",indicadaPor:"",verbo:false,videoId:"_VJgJx1FM0A"},
{num:62,musica:"Minha Vitória",artista:"Eliezer Rodrigues",tom:"-",indicadaPor:"",verbo:true,videoId:"wK2uxXMJ4a4"},
{num:63,musica:"O Seu Amor",artista:"Manassés Guerra e Cinthya Miranda",tom:"-",indicadaPor:"",verbo:false,videoId:"KO5qvwujwVg"},
{num:64,musica:"Só Vai Melhorar",artista:"-",tom:"-",indicadaPor:"",verbo:false,videoId:"g0vwsqmq_3U"},
{num:65,musica:"Rei da Glória",artista:"Israel Salazar",tom:"A",indicadaPor:"Leandro",verbo:false,videoId:"bOPsqICVi9Q"},
{num:66,musica:"Altar",artista:"Brasa Church Music / Liz Johnson",tom:"A",indicadaPor:"Aline Magalhães",verbo:false,videoId:"gOnp0Kuq-9M"},
{num:67,musica:"Venceu",artista:"Nívea Soares",tom:"G",indicadaPor:"Madalena",verbo:false,videoId:"dehE3ISeWNo"},
{num:68,musica:"Canção dos Redimidos (Ao Vivo)",artista:"Julia Vitoria e Nívea Soares",tom:"-",indicadaPor:"",verbo:false,videoId:"p7Gy9m7LEZg"},
{num:69,musica:"Grande É o Senhor (Great Are You Lord)",artista:"Thiago Henrique & Matheus França",tom:"-",indicadaPor:"",verbo:false,videoId:"dfmjN09kaX4"},
{num:70,musica:"Deus Está Fazendo Algo Grande",artista:"Ana Ticianeli",tom:"-",indicadaPor:"",verbo:false,videoId:"dAbMgyF5d2c"},
{num:71,musica:"Falo Jesus (I Speak Jesus)",artista:"Verbo Music feat. Josias Goulart",tom:"-",indicadaPor:"",verbo:true,videoId:"PbcSnNw9NnA"},
];

const thumb = (id) => id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "";
const thumbHQ = (id) => id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
const ytLink = (id) => id ? `https://youtu.be/${id}` : "";
const ytEmbed = (id) => id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : "";
const cifraClubLink = (musica, artista) => {
  const q = encodeURIComponent(`${musica || ""} ${artista || ""}`.trim());
  return `https://www.cifraclub.com.br/?q=${q}`;
};
const letrasLink = (musica, artista) => {
  const q = encodeURIComponent(`${musica || ""} ${artista || ""}`.trim());
  return `https://www.letras.mus.br/?q=${q}`;
};

// Lista oficial dos músicos da banda — nomes corretos (com sobrenome).
// Usado como seed inicial da lista de pessoas do editor admin, para que
// admin nunca precise digitar o nome do zero. Mantém compatibilidade com a
// nomeclatura usada na página de Escalas.
const BAND_MEMBERS = [
  "Hugo Luigi",
  "Asafe",
  "Jokasta",
  "Matheu Emanuel",
  "Leandro Guimarães",
  "Aline Guimarães",
  "Madalena",
  "Ana",
];

// ─── STYLES (themed via CSS vars from theme.js) ─────────────────────────
const S = {
  page: { color: "var(--text)", minHeight: "100vh", paddingBottom: 340 },

  // Hero header
  hero: { maxWidth: 880, margin: "0 auto", padding: "32px 20px 8px", textAlign: "center" },
  eyebrow: { display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "var(--accent-soft)", border: "1px solid var(--accent-border)", color: "var(--accent-text)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 },
  h1: { fontSize: "clamp(1.7rem, 5vw, 2.4rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 8 },
  sub: { color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto" },
  stats: { display: "flex", gap: 10, justifyContent: "center", marginTop: 18, flexWrap: "wrap" },
  stat: { padding: "8px 16px", borderRadius: 999, fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, background: "var(--surface)", border: "1px solid var(--border)", backdropFilter: "blur(var(--blur))", WebkitBackdropFilter: "blur(var(--blur))" },
  statVerbo: { background: "var(--verbo-soft)", border: "1px solid var(--verbo-border)", color: "var(--verbo-text)" },
  statAdmin: { background: "var(--accent-soft)", border: "1px solid var(--accent-border)", color: "var(--accent-text)" },

  container: { maxWidth: 880, margin: "0 auto", padding: "20px 20px 0" },

  // Search + filters card
  toolbar: { borderRadius: 22, padding: 16, marginBottom: 18 },
  searchBox: { position: "relative", marginBottom: 12 },
  searchInput: { width: "100%", padding: "13px 16px 13px 44px", background: "var(--input-bg)", border: "1px solid var(--border-strong)", borderRadius: 14, color: "var(--text)", fontSize: "0.95rem", outline: "none" },
  searchIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", fontSize: 18 },

  filtersTitle: { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 },
  filters: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 10, scrollbarWidth: "thin" },
  filterBtn: { padding: "7px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--chip-bg)", color: "var(--chip-text)", fontSize: "0.78rem", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, transition: "all .15s" },
  filterActive: { background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", border: "1px solid var(--accent-border)", color: "#fff", boxShadow: "0 4px 12px rgba(16,185,129,0.30)" },
  filterVerbo: { background: "var(--verbo-soft)", border: "1px solid var(--verbo-border)", color: "var(--verbo-text)" },
  temaRow: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 },
  temaChip: { padding: "6px 12px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--chip-bg)", color: "var(--chip-text)", fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600 },

  // Song cards
  songsGrid: { display: "grid", gap: 10 },
  card: {
    display: "flex", alignItems: "center", gap: 14, padding: 12,
    borderRadius: 18, cursor: "pointer", transition: "all .2s ease",
    background: "var(--surface)", border: "1px solid var(--border)",
    backdropFilter: "blur(var(--blur))", WebkitBackdropFilter: "blur(var(--blur))",
    boxShadow: "var(--shadow-sm)",
  },
  cardVerbo: { borderLeft: "3px solid var(--verbo)" },
  cardSelected: { border: "1px solid var(--accent-border)", background: "var(--accent-soft)", boxShadow: "0 8px 24px rgba(16,185,129,0.18)" },
  thumb: { width: 78, height: 58, borderRadius: 12, objectFit: "cover", flexShrink: 0, background: "var(--chip-bg)", boxShadow: "var(--shadow-sm)" },
  info: { flex: 1, minWidth: 0 },
  title: { fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 },
  artist: { fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 },
  badges: { display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" },
  badge: { fontSize: "0.65rem", padding: "2px 8px", borderRadius: 8, fontWeight: 700, letterSpacing: "0.02em" },
  badgeVerbo: { background: "var(--verbo-soft)", color: "var(--verbo-text)", border: "1px solid var(--verbo-border)" },
  badgePerson: { background: "var(--chip-bg)", color: "var(--chip-text)", border: "1px solid var(--border)" },
  badgeTom: { background: "var(--accent-soft)", color: "var(--accent-text)", border: "1px solid var(--accent-border)" },
  badgeTema: { },

  check: {
    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 800, cursor: "pointer",
    background: "var(--surface-faint)", border: "1.5px solid var(--border-strong)",
    color: "transparent", transition: "all .15s",
  },
  checkSel: { background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", borderColor: "var(--accent-strong)", color: "#fff", boxShadow: "0 4px 12px rgba(16,185,129,0.40)" },

  // Bottom dock (Meu Repertório)
  bottom: {
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 150,
    padding: "12px 14px 18px",
    background: "var(--surface-strong)",
    backdropFilter: "blur(24px) saturate(170%)",
    WebkitBackdropFilter: "blur(24px) saturate(170%)",
    borderTop: "1px solid var(--border)",
    boxShadow: "0 -8px 32px rgba(15,23,42,0.10)",
  },
  bottomContent: { maxWidth: 880, margin: "0 auto" },
  repHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  repTitle: { fontSize: "0.92rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" },
  repCount: { fontSize: "0.76rem", color: "var(--text-muted)", background: "var(--chip-bg)", border: "1px solid var(--border)", padding: "4px 12px", borderRadius: 999, fontWeight: 700 },
  slotsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 },
  slot: {
    display: "flex", flexDirection: "column", gap: 4, padding: "9px 10px",
    background: "var(--chip-bg)", border: "1.5px dashed var(--border-strong)",
    borderRadius: 12, minHeight: 60, justifyContent: "center",
  },
  slotFilled: { borderStyle: "solid", background: "var(--accent-soft)", borderColor: "var(--accent-border)" },
  slotFilledVerbo: { borderStyle: "solid", background: "var(--verbo-soft)", borderColor: "var(--verbo-border)" },
  slotNum: { fontSize: "0.62rem", fontWeight: 800, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase" },
  slotNumActive: { color: "var(--accent-text)" },
  slotNumActiveVerbo: { color: "var(--verbo-text)" },
  slotName: { fontSize: "0.74rem", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  slotEmpty: { fontSize: "0.7rem", color: "var(--text-faint)", fontStyle: "italic" },
  slotRemove: { position: "absolute", top: 4, right: 4, background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, padding: 2 },
  slotWrap: { position: "relative" },

  ruleBar: { padding: "9px 14px", borderRadius: 12, marginBottom: 10, fontSize: "0.78rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 },
  ruleWarn: { background: "rgba(239,68,68,0.10)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.30)" },
  ruleOk: { background: "var(--accent-soft)", color: "var(--accent-text)", border: "1px solid var(--accent-border)" },

  btnGenerate: {
    width: "100%", padding: "14px 20px", borderRadius: 14, border: "none",
    fontSize: "0.95rem", fontWeight: 800, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    transition: "all .2s",
  },
  btnEnabled: { background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", color: "#fff", boxShadow: "0 8px 22px rgba(16,185,129,0.35)" },
  btnDisabled: { background: "var(--chip-bg)", color: "var(--text-faint)", cursor: "not-allowed", border: "1px solid var(--border)" },

  // ─── Centered modal ───
  overlay: {
    position: "fixed", inset: 0, zIndex: 250,
    background: "var(--overlay)", backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex", justifyContent: "center", alignItems: "center",
    padding: 18,
  },
  modal: {
    width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto",
    borderRadius: 24, background: "var(--surface-strong)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid var(--border-strong)",
    boxShadow: "var(--shadow-lg)",
  },
  modalClose: {
    position: "absolute", top: 14, right: 14, zIndex: 5,
    width: 36, height: 36, borderRadius: "50%", border: "none",
    background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 18,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(8px)",
  },
  videoWrap: { position: "relative", width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: "24px 24px 0 0", overflow: "hidden" },
  videoIframe: { width: "100%", height: "100%", border: "none" },

  modalBody: { padding: "22px 24px 26px" },
  modalTitle: { fontSize: "1.35rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em", lineHeight: 1.2, marginBottom: 4 },
  modalArtist: { color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: 14 },
  modalBadges: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  modalBadge: { padding: "5px 11px", borderRadius: 10, fontSize: "0.74rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 },

  modalActions: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 },
  actionBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
    fontSize: "0.85rem", fontWeight: 700, textDecoration: "none",
    transition: "all .15s",
  },
  actionPrimary: { background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", color: "#fff", boxShadow: "0 6px 16px rgba(16,185,129,0.30)" },
  actionSecondary: { background: "var(--chip-bg)", color: "var(--text)", border: "1px solid var(--border-strong)" },
  actionRed: { background: "rgba(239,68,68,0.10)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.30)" },
  actionSuccess: { background: "rgba(34,197,94,0.10)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.30)" },

  editBtn: {
    width: "100%", marginTop: 10, padding: "12px 14px",
    borderRadius: 12, border: "1px solid var(--verbo-border)",
    background: "var(--verbo-soft)", color: "var(--verbo-text)",
    fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
  },

  sectionTitle: { marginTop: 18, marginBottom: 8, fontSize: "0.7rem", fontWeight: 800, color: "var(--text-faint)", letterSpacing: "0.10em", textTransform: "uppercase" },
  letraBox: { background: "var(--chip-bg)", padding: 16, borderRadius: 14, fontSize: "0.88rem", lineHeight: 1.75, whiteSpace: "pre-wrap", color: "var(--text)", border: "1px solid var(--border)", maxHeight: "32vh", overflowY: "auto" },
  letraEmpty: { background: "var(--chip-bg)", padding: 16, borderRadius: 14, fontSize: "0.82rem", color: "var(--text-faint)", fontStyle: "italic", textAlign: "center", border: "1px dashed var(--border-strong)" },
  keyRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  keyChip: { fontSize: "0.74rem", padding: "5px 11px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-text)", border: "1px solid var(--accent-border)", fontWeight: 700 },

  // Output box
  outputBox: { padding: 24 },
  outputTitle: { fontSize: "1.2rem", fontWeight: 800, marginBottom: 14, textAlign: "center", color: "var(--text)" },
  outputText: { background: "var(--chip-bg)", padding: 16, borderRadius: 14, fontSize: "0.85rem", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 14, border: "1px solid var(--border)", color: "var(--text)", maxHeight: "50vh", overflowY: "auto" },
  btnCopy: { width: "100%", padding: 13, borderRadius: 12, border: "none", background: "#25d366", color: "#fff", fontSize: "0.92rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 6px 18px rgba(37,211,102,0.30)" },
  outputClose: { marginTop: 8, width: "100%", padding: 11, borderRadius: 12, border: "1px solid var(--border-strong)", background: "transparent", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 },

  noResults: { textAlign: "center", padding: "60px 20px", color: "var(--text-faint)", fontSize: "0.92rem" },
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────
export default function Repertorio() {
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tema, setTema] = useState("all");
  const [detail, setDetail] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Admin / overrides state ──
  const [admin, setAdmin] = useState(checkIsAdmin());
  const [editing, setEditing] = useState(null); // song being edited
  const [overrides, setOverrides] = useState({});  // { videoId: { indicadaPor, tom } }
  const [temasOver, setTemasOver] = useState({});  // { videoId: [tagId, ...] }
  const [songKeys, setSongKeys] = useState({});    // { videoId: [{cantor, tom}, ...] }
  const [pessoas, setPessoas] = useState([]);      // string[]
  const [savingFlash, setSavingFlash] = useState(false);
  const [showPessoas, setShowPessoas] = useState(false);

  // ── Load overrides from API on mount ──
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ov, to, sk, pe] = await Promise.all([
          apiGet("repertorio_overrides"),
          apiGet("repertorio_temas"),
          apiGet("song_keys"),
          apiGet("pessoas_repertorio"),
        ]);
        if (cancelled) return;
        if (ov && typeof ov === "object") setOverrides(ov);
        if (to && typeof to === "object") setTemasOver(to);
        if (sk && typeof sk === "object") setSongKeys(sk);
        if (pe && Array.isArray(pe) && pe.length > 0) setPessoas(pe);
        else {
          // Seed: combina nomes do indicadaPor (base + overrides) com a banda
          // oficial da Escala (nomes corretos com sobrenome).
          const fromSongs = SONGS.map(s => s.indicadaPor).filter(Boolean);
          const fromOverrides = Object.values(ov || {}).map(o => o?.indicadaPor).filter(Boolean);
          const merged = Array.from(new Set([...BAND_MEMBERS, ...fromSongs, ...fromOverrides])).sort();
          setPessoas(merged);
        }
      } catch (e) { console.error("Failed to load overrides", e); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Helpers: apply overrides on top of base data ──
  function getEffectiveSong(s) {
    const ov = overrides[s.videoId];
    if (!ov) return s;
    return {
      ...s,
      musica: ov.musica !== undefined && ov.musica !== "" ? ov.musica : s.musica,
      artista: ov.artista !== undefined && ov.artista !== "" ? ov.artista : s.artista,
      verbo: typeof ov.verbo === "boolean" ? ov.verbo : s.verbo,
      indicadaPor: ov.indicadaPor !== undefined && ov.indicadaPor !== "" ? ov.indicadaPor : s.indicadaPor,
      tom: ov.tom !== undefined && ov.tom !== "" ? ov.tom : s.tom,
    };
  }
  function getEffectiveTemas(s) {
    return temasOver[s.videoId] || TEMAS[s.videoId] || [];
  }
  function getKeysFor(s) {
    return songKeys[s.videoId] || [];
  }

  const effectiveSongs = SONGS.map(getEffectiveSong);

  const hasVerbo = selected.some(s => s.verbo);
  const canGenerate = selected.length === 4 && hasVerbo;

  // ── Sync admin state with global login events from SiteHeader ──
  useEffect(() => {
    const sync = () => setAdmin(checkIsAdmin());
    window.addEventListener("admin-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("admin-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  async function handleSaveEdit(payload) {
    const { temas: newTemas, override, keys } = payload;
    const vid = editing.videoId;
    const baseSong = SONGS.find(s => s.videoId === vid) || editing;

    const nextOv = { ...overrides };
    const trimmedMusica = (override.musica || "").trim();
    const trimmedArtista = (override.artista || "").trim();
    const trimmedIndicada = (override.indicadaPor || "").trim();
    const trimmedTom = (override.tom || "").trim();
    const cleanOv = {};
    if (trimmedMusica && trimmedMusica !== baseSong.musica) cleanOv.musica = trimmedMusica;
    if (trimmedArtista && trimmedArtista !== baseSong.artista) cleanOv.artista = trimmedArtista;
    if (!!override.verbo !== !!baseSong.verbo) cleanOv.verbo = !!override.verbo;
    if (trimmedIndicada !== (baseSong.indicadaPor || "")) cleanOv.indicadaPor = trimmedIndicada;
    if (trimmedTom !== (baseSong.tom || "")) cleanOv.tom = trimmedTom;
    if (Object.keys(cleanOv).length === 0) delete nextOv[vid];
    else nextOv[vid] = cleanOv;

    const nextTemas = { ...temasOver };
    if (Array.isArray(newTemas) && newTemas.length > 0) nextTemas[vid] = newTemas;
    else delete nextTemas[vid];

    const nextKeys = { ...songKeys };
    if (Array.isArray(keys) && keys.length > 0) nextKeys[vid] = keys;
    else delete nextKeys[vid];

    setSavingFlash(true);
    try {
      await Promise.all([
        apiPut("repertorio_overrides", nextOv),
        apiPut("repertorio_temas", nextTemas),
        apiPut("song_keys", nextKeys),
      ]);
      setOverrides(nextOv);
      setTemasOver(nextTemas);
      setSongKeys(nextKeys);
      if (detail && detail.videoId === vid) {
        setDetail(getEffectiveSong(SONGS.find(s => s.videoId === vid)));
      }
    } finally { setSavingFlash(false); }
  }

  // ── Save handler for PessoasModal ───────────────────────────────────
  // When the admin renames/removes singers in the master list, we cascade
  // the changes through all overrides (indicadaPor) and song keys (cantor).
  async function handleSavePessoas(nextPessoas, renames) {
    const renameMap = renames && typeof renames === "object" ? renames : {};
    const hasRenames = Object.keys(renameMap).length > 0;
    const mapName = (name) => {
      const t = (name || "").trim();
      return renameMap[t] || t;
    };

    const nextOv = {};
    Object.entries(overrides).forEach(([k, ov]) => {
      if (!ov) return;
      const newOv = { ...ov };
      if (newOv.indicadaPor !== undefined) newOv.indicadaPor = mapName(newOv.indicadaPor);
      nextOv[k] = newOv;
    });
    // Force override for any base song whose indicadaPor was renamed.
    if (hasRenames) {
      SONGS.forEach(s => {
        const baseName = (s.indicadaPor || "").trim();
        if (renameMap[baseName]) {
          const cur = nextOv[s.videoId] ? { ...nextOv[s.videoId] } : {};
          cur.indicadaPor = renameMap[baseName];
          nextOv[s.videoId] = cur;
        }
      });
    }

    const nextKeys = {};
    Object.entries(songKeys).forEach(([k, arr]) => {
      if (!Array.isArray(arr)) return;
      nextKeys[k] = arr.map(row => ({ ...row, cantor: mapName(row.cantor) }));
    });

    setSavingFlash(true);
    try {
      await Promise.all([
        apiPut("pessoas_repertorio", nextPessoas),
        apiPut("repertorio_overrides", nextOv),
        apiPut("song_keys", nextKeys),
      ]);
      setPessoas(nextPessoas);
      setOverrides(nextOv);
      setSongKeys(nextKeys);
      if (detail) {
        const refreshed = getEffectiveSong(SONGS.find(s => s.videoId === detail.videoId));
        if (refreshed) setDetail(refreshed);
      }
    } finally { setSavingFlash(false); }
  }

  const filtered = effectiveSongs.filter(s => {
    if (filter === "verbo" && !s.verbo) return false;
    if (filter === "none" && (s.indicadaPor || "").trim() !== "") return false;
    if (filter.startsWith("p:")) {
      const who = filter.slice(2);
      if ((s.indicadaPor || "").trim() !== who) return false;
    }
    if (tema !== "all") {
      const songTemas = getEffectiveTemas(s);
      if (!songTemas.includes(tema)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return s.musica.toLowerCase().includes(q) || s.artista.toLowerCase().includes(q) || (s.indicadaPor||"").toLowerCase().includes(q);
    }
    return true;
  });

  function toggle(num) {
    const idx = selected.findIndex(s => s.num === num);
    if (idx >= 0) {
      setSelected(selected.filter(s => s.num !== num));
    } else {
      if (selected.length >= 4) return;
      const base = SONGS.find(s => s.num === num);
      setSelected([...selected, getEffectiveSong(base)]);
    }
  }

  function remove(num) {
    setSelected(selected.filter(s => s.num !== num));
  }

  function generate() {
    if (!canGenerate) return;
    setShowOutput(true);
  }

  function getOutputText() {
    let t = `🎵 *REPERTÓRIO DE LOUVOR*\n📍 Verbo Orlando — Winter Garden\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
    selected.forEach((s, i) => {
      t += `*${i+1}. ${s.musica}*${s.verbo ? " ⭐" : ""}\n🎤 ${s.artista}\n`;
      if (s.videoId) t += `🔗 https://youtu.be/${s.videoId}\n`;
      t += "\n";
    });
    t += `━━━━━━━━━━━━━━━━━━━━━\n⭐ = Verbo da Vida`;
    return t;
  }

  function copyText() {
    navigator.clipboard.writeText(getOutputText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Lista dinâmica de cantores: inclui todos que aparecem em alguma música
  // (indicadaPor) e também os cadastrados no painel de Cantores.
  const indicadosDasMusicas = Array.from(new Set(
    effectiveSongs.map(s => (s.indicadaPor || "").trim()).filter(Boolean)
  ));
  const cantoresFiltro = Array.from(new Set([...indicadosDasMusicas, ...(pessoas || [])])).sort();

  const filters = [
    { id: "all", label: "Todas" },
    { id: "verbo", label: "⭐ Verbo da Vida" },
    { id: "none", label: "Sem indicação" },
    ...cantoresFiltro.map(nome => ({ id: `p:${nome}`, label: nome })),
  ];

  const slotMsgs = ["Toque para adicionar", "2ª música", "3ª música", "4ª música"];

  return (
    <div style={S.page}>
      <SiteHeader current="repertorio" />

      {/* HERO */}
      <div style={S.hero}>
        <div style={S.eyebrow}>✦ Verbo Orlando · Winter Garden</div>
        <h1 style={S.h1}>Repertório de Louvor</h1>
        <p style={S.sub}>Escolha 4 músicas para o próximo culto. Pelo menos uma do Verbo da Vida.</p>
        <div style={S.stats}>
          <span style={S.stat}><b>{SONGS.length}</b> &nbsp;músicas</span>
          <span style={{...S.stat,...S.statVerbo}}>⭐ <b>{SONGS.filter(s=>s.verbo).length}</b> &nbsp;Verbo da Vida</span>
          {admin && <span style={{...S.stat,...S.statAdmin}}>✓ Admin{savingFlash ? " ⏳" : ""}</span>}
          {admin && (
            <button
              type="button"
              onClick={() => setShowPessoas(true)}
              style={{...S.stat, cursor: "pointer", fontFamily: "inherit"}}
              title="Gerenciar lista de cantores"
            >
              ⚙ Cantores
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={S.container}>
        {/* Toolbar (search + filters) */}
        <div className="glass" style={S.toolbar}>
          <div style={S.searchBox}>
            <span style={S.searchIcon}>🔍</span>
            <input style={S.searchInput} placeholder="Buscar música, artista ou pessoa..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={S.filtersTitle}>Filtros</div>
          <div style={S.filters}>
            {filters.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                style={{...S.filterBtn, ...(filter===f.id ? (f.id==="verbo" ? S.filterVerbo : S.filterActive) : {})}}
              >{f.label}</button>
            ))}
          </div>

          <div style={S.filtersTitle}>Temas</div>
          <div style={S.temaRow}>
            <button onClick={() => setTema("all")}
              style={{...S.temaChip, ...(tema==="all" ? S.filterActive : {})}}
            >Todos</button>
            {Object.entries(TEMAS_DEF).map(([id, def]) => (
              <button key={id} onClick={() => setTema(id)}
                style={{
                  ...S.temaChip,
                  ...(tema===id ? {background: def.bg, border:`1px solid ${def.border}`, color: def.color, fontWeight:700} : {})
                }}
              >{def.label}</button>
            ))}
          </div>
        </div>

        {/* Song grid */}
        <div style={S.songsGrid}>
          {filtered.length === 0 ? (
            <div style={S.noResults}>Nenhuma música encontrada</div>
          ) : filtered.map(s => {
            const isSel = selected.some(x => x.num === s.num);
            const t = thumb(s.videoId);
            const cardStyle = {
              ...S.card,
              ...(s.verbo ? S.cardVerbo : {}),
              ...(isSel ? S.cardSelected : {}),
            };
            const checkStyle = { ...S.check, ...(isSel ? S.checkSel : {}) };
            return (
              <div key={s.num} style={cardStyle} onClick={() => setDetail(s)}>
                {t ? <img src={t} style={S.thumb} loading="lazy" alt="" /> : <div style={S.thumb} />}
                <div style={S.info}>
                  <div style={S.title}>{s.musica}</div>
                  <div style={S.artist}>{s.artista}</div>
                  <div style={S.badges}>
                    {s.verbo && <span style={{...S.badge, ...S.badgeVerbo}}>⭐ Verbo da Vida</span>}
                    {s.indicadaPor && <span style={{...S.badge, ...S.badgePerson}}>{s.indicadaPor}</span>}
                    {s.tom && s.tom !== "-" && <span style={{...S.badge, ...S.badgeTom}}>♪ {s.tom}</span>}
                    {getEffectiveTemas(s).map(tid => {
                      const def = TEMAS_DEF[tid]; if (!def) return null;
                      return <span key={tid} style={{...S.badge, background: def.bg, color: def.color, border:`1px solid ${def.border}`}}>{def.label}</span>;
                    })}
                  </div>
                </div>
                <div style={checkStyle} onClick={(e) => { e.stopPropagation(); toggle(s.num); }} title={isSel ? "Remover" : "Adicionar"}>
                  {isSel ? "✓" : "+"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM DOCK */}
      <div style={S.bottom}>
        <div style={S.bottomContent}>
          <div style={S.repHeader}>
            <span style={S.repTitle}>♪ Meu Repertório</span>
            <span style={S.repCount}>{selected.length}/4</span>
          </div>
          <div style={S.slotsRow}>
            {[0,1,2,3].map(i => {
              const s = selected[i];
              const slotStyle = {
                ...S.slot,
                ...(s ? (s.verbo ? S.slotFilledVerbo : S.slotFilled) : {}),
              };
              const numStyle = {
                ...S.slotNum,
                ...(s ? (s.verbo ? S.slotNumActiveVerbo : S.slotNumActive) : {}),
              };
              return (
                <div key={i} style={S.slotWrap}>
                  <div style={slotStyle}>
                    <div style={numStyle}>#{i+1}{s?.verbo ? " ⭐" : ""}</div>
                    {s ? <div style={S.slotName}>{s.musica}</div>
                       : <div style={S.slotEmpty}>{slotMsgs[i]}</div>}
                  </div>
                  {s && <button style={S.slotRemove} onClick={() => remove(s.num)} title="Remover">✕</button>}
                </div>
              );
            })}
          </div>
          <div style={{...S.ruleBar, ...(hasVerbo ? S.ruleOk : S.ruleWarn)}}>
            {hasVerbo ? `✓ ${selected.filter(s=>s.verbo).length} música(s) do Verbo da Vida` : "⚠ Mínimo 1 música do Verbo da Vida obrigatória"}
          </div>
          <button style={{...S.btnGenerate, ...(canGenerate ? S.btnEnabled : S.btnDisabled)}} disabled={!canGenerate} onClick={generate}>
            📋 Gerar Repertório para WhatsApp
          </button>
        </div>
      </div>

      {/* DETAIL MODAL — centered with YouTube embed */}
      {detail && (
        <div style={S.overlay} className="v-fade" onClick={e => { if (e.target === e.currentTarget) setDetail(null); }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 640 }} className="v-scale">
            <div style={S.modal}>
              <button style={S.modalClose} onClick={() => setDetail(null)} title="Fechar">✕</button>
              {detail.videoId && (
                <div style={S.videoWrap}>
                  <iframe
                    style={S.videoIframe}
                    src={ytEmbed(detail.videoId)}
                    title={detail.musica}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
              <div style={S.modalBody}>
                <div style={S.modalTitle}>{detail.musica}</div>
                <div style={S.modalArtist}>{detail.artista}</div>
                <div style={S.modalBadges}>
                  {detail.verbo && <span style={{...S.modalBadge, background:"var(--verbo-soft)", color:"var(--verbo-text)", border:"1px solid var(--verbo-border)"}}>⭐ Verbo da Vida</span>}
                  {detail.indicadaPor && <span style={{...S.modalBadge, background:"var(--chip-bg)", color:"var(--chip-text)", border:"1px solid var(--border)"}}>👤 {detail.indicadaPor}</span>}
                  {detail.tom && detail.tom!=="-" && <span style={{...S.modalBadge, background:"var(--accent-soft)", color:"var(--accent-text)", border:"1px solid var(--accent-border)"}}>♪ Tom {detail.tom}</span>}
                  {getEffectiveTemas(detail).map(tid => {
                    const def = TEMAS_DEF[tid]; if (!def) return null;
                    return <span key={tid} style={{...S.modalBadge, background: def.bg, color: def.color, border:`1px solid ${def.border}`}}>{def.label}</span>;
                  })}
                </div>

                {/* Action buttons */}
                <div style={S.modalActions}>
                  <button
                    onClick={() => toggle(detail.num)}
                    style={{...S.actionBtn, ...(selected.some(x=>x.num===detail.num) ? S.actionSuccess : S.actionPrimary)}}
                  >
                    {selected.some(x=>x.num===detail.num) ? "✓ Selecionada" : "+ Adicionar ao Repertório"}
                  </button>
                  <a
                    href={cifraClubLink(detail.musica, detail.artista)}
                    target="_blank" rel="noreferrer"
                    style={{...S.actionBtn, ...S.actionSecondary}}
                  >
                    🎸 Cifra Club
                  </a>
                  <a
                    href={letrasLink(detail.musica, detail.artista)}
                    target="_blank" rel="noreferrer"
                    style={{...S.actionBtn, ...S.actionSecondary}}
                  >
                    📜 Letra
                  </a>
                  <a
                    href={ytLink(detail.videoId)} target="_blank" rel="noreferrer"
                    style={{...S.actionBtn, ...S.actionRed}}
                  >
                    ▶ YouTube
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${detail.musica} — ${detail.artista}\n${ytLink(detail.videoId)}`);
                    }}
                    style={{...S.actionBtn, ...S.actionSecondary, gridColumn: "1 / -1"}}
                  >
                    📋 Copiar link
                  </button>
                </div>

                {admin && (
                  <button style={S.editBtn} onClick={() => setEditing(detail)}>
                    ✏️ Editar música (admin)
                  </button>
                )}

                {getKeysFor(detail).length > 0 && (
                  <>
                    <div style={S.sectionTitle}>🎼 Tons por cantor</div>
                    <div style={S.keyRow}>
                      {getKeysFor(detail).map((k, i) => (
                        <span key={i} style={S.keyChip}>{k.cantor || "?"} → <b>{k.tom || "—"}</b></span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <EditSongModal
          song={editing}
          currentTemas={getEffectiveTemas(editing)}
          currentOverride={overrides[editing.videoId]}
          currentKeys={getKeysFor(editing)}
          pessoas={pessoas}
          onSave={handleSaveEdit}
          onClose={() => setEditing(null)}
        />
      )}

      {/* PESSOAS MODAL (admin singer list) */}
      <PessoasModal
        open={showPessoas}
        pessoas={pessoas}
        onSave={handleSavePessoas}
        onClose={() => setShowPessoas(false)}
      />

      {/* OUTPUT MODAL */}
      {showOutput && (
        <div style={S.overlay} className="v-fade" onClick={e => { if (e.target === e.currentTarget) setShowOutput(false); }}>
          <div className="v-scale" style={{ width: "100%", maxWidth: 560 }}>
            <div style={S.modal}>
              <div style={S.outputBox}>
                <div style={S.outputTitle}>✓ Repertório Pronto!</div>
                <div style={S.outputText}>{getOutputText()}</div>
                <button style={{...S.btnCopy, ...(copied ? {background:"#16a34a"} : {})}} onClick={copyText}>
                  {copied ? "✓ Copiado!" : "📱 Copiar para WhatsApp"}
                </button>
                <button style={S.outputClose} onClick={() => setShowOutput(false)}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
