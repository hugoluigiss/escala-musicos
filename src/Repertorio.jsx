import { useState, useEffect } from "react";
import { TEMAS, TEMAS_DEF } from "./temas.js";
import { apiGet, apiPut, isAdmin as checkIsAdmin } from "./api.js";
import { EditSongModal, PessoasModal, AddSongModal, PersonPicker } from "./AdminEdit.jsx";
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
  visionCard: {
    maxWidth: 560, margin: "16px auto 0",
    padding: "14px 18px", borderRadius: 16,
    background: "var(--verbo-soft)",
    border: "1px solid var(--verbo-border)",
    backdropFilter: "blur(var(--blur))",
    WebkitBackdropFilter: "blur(var(--blur))",
    textAlign: "left",
  },
  visionTitle: {
    fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--verbo-text)",
    marginBottom: 6,
  },
  visionText: {
    fontSize: "0.86rem", lineHeight: 1.5, color: "var(--text)",
    margin: "0 0 10px",
  },
  verseList: {
    marginTop: 12, paddingTop: 12,
    borderTop: "1px solid var(--verbo-border)",
    display: "flex", flexDirection: "column", gap: 10,
  },
  verse: {
    padding: "8px 12px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
  },
  verseText: {
    fontSize: "0.8rem", lineHeight: 1.5, color: "var(--text)",
    fontStyle: "italic",
  },
  verseRef: {
    fontSize: "0.72rem", fontWeight: 700, color: "var(--verbo-text)",
    marginTop: 4, textAlign: "right",
  },
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
  filters: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  filterBtn: { padding: "7px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--chip-bg)", color: "var(--chip-text)", fontSize: "0.78rem", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, transition: "all .15s" },
  filterActive: { background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", border: "1px solid var(--accent-border)", color: "#fff", boxShadow: "0 4px 12px rgba(16,185,129,0.30)" },
  filterVerbo: { background: "var(--verbo-soft)", border: "1px solid var(--verbo-border)", color: "var(--verbo-text)" },
  temaRow: { display: "flex", flexWrap: "wrap", gap: 6 },
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
  badgeCeleb: { background: "rgba(250,204,21,0.18)", color: "#b45309", border: "1px solid rgba(250,204,21,0.45)" },
  // Admin-only celebration toggle on each card.
  celebToggle: {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 9px", borderRadius: 999,
    border: "1.5px dashed rgba(250,204,21,0.45)",
    background: "transparent", color: "var(--text-faint)",
    fontSize: "0.65rem", fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit",
  },
  celebToggleOn: {
    background: "rgba(250,204,21,0.22)",
    border: "1.5px solid rgba(250,204,21,0.55)",
    color: "#b45309",
    boxShadow: "0 0 0 2px rgba(250,204,21,0.10)",
  },
  badgePerson: { background: "var(--chip-bg)", color: "var(--chip-text)", border: "1px solid var(--border)" },
  indicadaLine: { fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6, marginBottom: 2 },
  indicadaLabel: { color: "var(--text-faint)", fontWeight: 600 },
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
  // Confirm step (lead + tom per song) before generating WhatsApp output
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmRows, setConfirmRows] = useState([]); // [{ videoId, lead, tom }]
  const [savingConfirm, setSavingConfirm] = useState(false);
  // Metadata for the repertorio (date, type, creator) — also persisted to history
  const [meetDate, setMeetDate] = useState("");
  const [meetType, setMeetType] = useState("domingo"); // 'domingo' | 'evento'
  const [meetEventName, setMeetEventName] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  // ── Admin / overrides state ──
  const [admin, setAdmin] = useState(checkIsAdmin());
  const [editing, setEditing] = useState(null); // song being edited
  const [overrides, setOverrides] = useState({});  // { videoId: { indicadaPor, tom } }
  const [temasOver, setTemasOver] = useState({});  // { videoId: [tagId, ...] }
  const [songKeys, setSongKeys] = useState({});    // { videoId: [{cantor, tom}, ...] }
  const [pessoas, setPessoas] = useState([]);      // string[]
  const [deletedSongs, setDeletedSongs] = useState([]);  // string[] of videoIds
  const [customSongs, setCustomSongs] = useState([]);    // custom song objects
  const [celebracao, setCelebracao] = useState([]);      // string[] of videoIds (celebration songs)
  const [savingFlash, setSavingFlash] = useState(false);
  const [showPessoas, setShowPessoas] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  // Histórico de repertórios (admin only)
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState({}); // { id: bool }

  // ── Load overrides from API on mount ──
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ov, to, sk, pe, del, cus, cel] = await Promise.all([
          apiGet("repertorio_overrides"),
          apiGet("repertorio_temas"),
          apiGet("song_keys"),
          apiGet("pessoas_repertorio"),
          apiGet("repertorio_deleted"),
          apiGet("repertorio_custom_songs"),
          apiGet("repertorio_celebracao"),
        ]);
        if (cancelled) return;
        if (ov && typeof ov === "object") setOverrides(ov);
        if (to && typeof to === "object") setTemasOver(to);
        if (sk && typeof sk === "object") setSongKeys(sk);
        if (del && Array.isArray(del)) setDeletedSongs(del);
        if (cus && Array.isArray(cus)) setCustomSongs(cus);
        if (cel && Array.isArray(cel)) setCelebracao(cel);
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
  // Lookup the raw (pre-override) song by videoId across base + custom lists.
  function findRawSong(vid) {
    return SONGS.find(s => s.videoId === vid) || customSongs.find(s => s.videoId === vid);
  }
  function isCelebracao(s) {
    return celebracao.includes(s.videoId);
  }
  // Toggle celebration flag for a song (admin only). Optimistic update.
  async function toggleCelebracao(vid) {
    if (!admin) return;
    const next = celebracao.includes(vid)
      ? celebracao.filter(v => v !== vid)
      : [...celebracao, vid];
    setCelebracao(next);
    setSavingFlash(true);
    try {
      await apiPut("repertorio_celebracao", next);
    } catch (e) {
      // rollback on failure
      setCelebracao(celebracao);
      console.error("Failed to save celebracao", e);
    } finally { setSavingFlash(false); }
  }

  // Base songs minus deleted, plus admin-created custom songs.
  const allSongs = [
    ...SONGS.filter(s => !deletedSongs.includes(s.videoId)),
    ...customSongs,
  ];
  const effectiveSongs = allSongs.map(getEffectiveSong);

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
    const baseSong = findRawSong(vid) || editing;

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
        const raw = findRawSong(vid);
        if (raw) setDetail(getEffectiveSong(raw));
      }
    } finally { setSavingFlash(false); }
  }

  // ── Add new custom song ─────────────────────────────────────────────
  async function handleAddSong(data) {
    const allNums = [...SONGS.map(s => s.num), ...customSongs.map(s => s.num)];
    const nextNum = (allNums.length ? Math.max(...allNums) : 0) + 1;
    const newSong = {
      num: nextNum,
      musica: data.musica,
      artista: data.artista,
      tom: data.tom || "-",
      indicadaPor: data.indicadaPor || "",
      verbo: !!data.verbo,
      videoId: data.videoId,
    };
    const nextCustom = [...customSongs, newSong];
    setSavingFlash(true);
    try {
      await apiPut("repertorio_custom_songs", nextCustom);
      setCustomSongs(nextCustom);
    } finally { setSavingFlash(false); }
  }

  // ── Delete song (base or custom) ────────────────────────────────────
  async function handleDeleteSong(song) {
    const vid = song.videoId;
    const isCustom = customSongs.some(c => c.videoId === vid);
    setSavingFlash(true);
    try {
      if (isCustom) {
        const nextCustom = customSongs.filter(c => c.videoId !== vid);
        await apiPut("repertorio_custom_songs", nextCustom);
        setCustomSongs(nextCustom);
      } else {
        if (!deletedSongs.includes(vid)) {
          const nextDel = [...deletedSongs, vid];
          await apiPut("repertorio_deleted", nextDel);
          setDeletedSongs(nextDel);
        }
      }
      // Clean up traces and close any open views
      setSelected(sel => sel.filter(s => s.videoId !== vid));
      if (detail && detail.videoId === vid) setDetail(null);
      if (editing && editing.videoId === vid) setEditing(null);
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
        const raw = findRawSong(detail.videoId);
        if (raw) setDetail(getEffectiveSong(raw));
      }
    } finally { setSavingFlash(false); }
  }

  const filtered = effectiveSongs.filter(s => {
    if (filter === "verbo" && !s.verbo) return false;
    if (filter === "celebracao" && !isCelebracao(s)) return false;
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
      const base = allSongs.find(s => s.num === num);
      if (base) setSelected([...selected, getEffectiveSong(base)]);
    }
  }

  function remove(num) {
    setSelected(selected.filter(s => s.num !== num));
  }

  function generate() {
    if (!canGenerate) return;
    // Pre-fill the confirm rows with the best guess for each song:
    // - lead: existing indicadaPor if any
    // - tom: if there's already a tom registered for that lead in song_keys, use it;
    //        otherwise use the song's general tom (s.tom) when it isn't a placeholder.
    const rows = selected.map(s => {
      const lead = (s.indicadaPor || "").trim();
      const keys = getKeysFor(s);
      const known = lead ? keys.find(k => (k.cantor || "").trim() === lead) : null;
      let tom = "";
      if (known && known.tom) tom = known.tom;
      else if (s.tom && s.tom !== "-" && s.tom !== "") tom = s.tom;
      return { videoId: s.videoId, lead, tom };
    });
    setConfirmRows(rows);
    // Default the meeting date to the next upcoming Sunday (YYYY-MM-DD)
    if (!meetDate) {
      const today = new Date();
      const dow = today.getDay(); // 0 = Sunday
      const add = dow === 0 ? 7 : (7 - dow);
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + add);
      const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      setMeetDate(iso);
    }
    setShowConfirm(true);
  }

  // Persist the chosen lead/tom into song_keys (per-singer history),
  // append a history entry for the whole repertorio, then open the
  // WhatsApp output modal. Tom can be left blank — only saves when filled.
  async function confirmAndShow() {
    // Validation: creator name is required
    if (!createdBy.trim()) {
      alert("Por favor, informe quem está criando o repertório.");
      return;
    }
    if (!meetDate) {
      alert("Por favor, selecione a data do culto.");
      return;
    }
    if (meetType === "evento" && !meetEventName.trim()) {
      alert("Por favor, informe o nome do evento.");
      return;
    }
    setSavingConfirm(true);
    try {
      // 1) Update per-singer key history (only when both lead and tom present)
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

      // 2) Build the history entry for this repertorio
      const entry = {
        id: `rep_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
        createdAt: new Date().toISOString(),
        createdBy: createdBy.trim(),
        date: meetDate,
        type: meetType, // 'domingo' | 'evento'
        eventName: meetType === "evento" ? meetEventName.trim() : "",
        songs: selected.map((s, i) => {
          const row = confirmRows[i] || {};
          return {
            videoId: s.videoId,
            musica: s.musica,
            artista: s.artista,
            verbo: !!s.verbo,
            lead: (row.lead || "").trim(),
            tom: (row.tom || "").trim(),
          };
        }),
      };

      // 3) Load current history, append, persist
      let history = [];
      try {
        const cur = await apiGet("repertorio_history");
        if (Array.isArray(cur)) history = cur;
      } catch {}
      const nextHistory = [entry, ...history];

      // 4) Save in parallel
      const ops = [apiPut("repertorio_history", nextHistory)];
      if (keysChanged) ops.push(apiPut("song_keys", nextKeys));
      await Promise.all(ops);
      if (keysChanged) setSongKeys(nextKeys);

      setShowConfirm(false);
      setShowOutput(true);
    } catch (e) {
      console.error("Failed to save repertorio", e);
      // Still show the output even if persistence fails
      setShowConfirm(false);
      setShowOutput(true);
    } finally {
      setSavingConfirm(false);
    }
  }

  // Abre o histórico de repertórios e carrega da API
  async function openHistory() {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const cur = await apiGet("repertorio_history");
      setHistory(Array.isArray(cur) ? cur : []);
    } catch (e) {
      console.error("Failed to load history", e);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  // Datas em formato americano (MM/DD/YYYY)
  function formatBrDateTime(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      let hh = d.getHours();
      const mi = String(d.getMinutes()).padStart(2, "0");
      const ampm = hh >= 12 ? "PM" : "AM";
      hh = hh % 12 || 12;
      return `${mm}/${dd}/${yyyy} ${hh}:${mi} ${ampm}`;
    } catch { return iso; }
  }

  function formatBrDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${m}/${d}/${y}`;
  }

  function getOutputText() {
    const sep = "━━━━━━━━━━━━━━━━━━━━━";
    let t = `🎵 *REPERTÓRIO DE LOUVOR* 🎵\n`;
    t += `📍 *Verbo da Vida Music — Orlando, FL*\n`;
    if (meetDate) {
      const tipo = meetType === "evento"
        ? (meetEventName ? `🎉 ${meetEventName}` : "🎉 Evento Especial")
        : "⛪ Culto de Domingo";
      t += `📅 ${formatBrDate(meetDate)}  ·  ${tipo}\n`;
    }
    if (createdBy) t += `✍ Repertório por: *${createdBy}*\n`;
    t += `${sep}\n\n`;

    selected.forEach((s, i) => {
      const row = confirmRows.find(r => r.videoId === s.videoId);
      const lead = row && row.lead ? row.lead.trim() : "";
      const tom = row && row.tom ? row.tom.trim() : "";
      const temas = getEffectiveTemas(s).map(tid => TEMAS_DEF[tid]?.label).filter(Boolean);

      t += `*${i+1}. ${s.musica}*${s.verbo ? " ⭐" : ""}${isCelebracao(s) ? " 🎉" : ""}\n`;
      t += `🎤 ${s.artista}\n`;
      if (lead || tom) {
        const parts = [];
        if (lead) parts.push(`🎙 Lead: *${lead}*`);
        if (tom) parts.push(`🎼 Tom: *${tom}*`);
        t += parts.join("  ·  ") + "\n";
      }
      if (temas.length > 0) {
        t += `💭 Temas: ${temas.join(" • ")}\n`;
      }
      if (s.videoId) t += `▶ https://youtu.be/${s.videoId}\n`;
      t += "\n";
    });

    t += `${sep}\n`;
    t += `⭐ Verbo da Vida   🎉 Celebração\n`;
    t += `_Que o Senhor seja exaltado neste culto!_ 🙌`;
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
    { id: "celebracao", label: "🎉 Celebração" },
    { id: "none", label: "Sem indicação" },
    ...cantoresFiltro.map(nome => ({ id: `p:${nome}`, label: nome })),
  ];

  const slotMsgs = ["Toque para adicionar", "2ª música", "3ª música", "4ª música"];

  return (
    <div style={S.page}>
      <SiteHeader current="repertorio" />

      {/* HERO */}
      <div style={S.hero} className="hero-pad">
        <div style={S.eyebrow}>✦ Verbo da Vida Music · Orlando, FL</div>
        <h1 style={S.h1}>Repertório de Louvor</h1>
        <p style={S.sub}>Escolha <b>4 músicas</b> para o próximo culto.</p>
        <div style={S.visionCard} className="vision-card">
          <div style={S.visionTitle}>⭐ Nossa Visão</div>
          <p style={S.visionText}>
            Nós cantamos a <b>Palavra da Fé!</b> Por isso valorizamos os ministros que carregam a nossa visão —
            <b> ao menos uma música do Verbo da Vida</b> deve estar presente em cada repertório.
          </p>
          <p style={S.visionText}>
            Ore por este momento, consagre-se, medite na Palavra relacionada ao repertório que o Espírito Santo lhe direcionou.
            Deus está se movendo através do seu trabalho — <b>seja forte e corajoso</b>.
          </p>
          <div style={S.verseList}>
            <div style={S.verse}>
              <div style={S.verseText}>"Habite, em vós, ricamente, a palavra de Cristo; instruí-vos e aconselhai-vos mutuamente em toda a sabedoria, louvando a Deus, com salmos, hinos e cânticos espirituais, com gratidão, em vosso coração."</div>
              <div style={S.verseRef}>— Colossenses 3:16</div>
            </div>
            <div style={S.verse}>
              <div style={S.verseText}>"Falando entre vós com salmos, hinos e cânticos espirituais, cantando e louvando de coração ao Senhor."</div>
              <div style={S.verseRef}>— Efésios 5:19</div>
            </div>
            <div style={S.verse}>
              <div style={S.verseText}>"Por meio de Jesus, ofereçamos sempre a Deus sacrifício de louvor, isto é, o fruto de lábios que confessam o seu nome."</div>
              <div style={S.verseRef}>— Hebreus 13:15</div>
            </div>
            <div style={S.verse}>
              <div style={S.verseText}>"Cantarei com o espírito, mas também cantarei com o entendimento."</div>
              <div style={S.verseRef}>— 1 Coríntios 14:15</div>
            </div>
          </div>
        </div>
        <div style={S.stats}>
          <span style={S.stat}><b>{SONGS.length}</b> &nbsp;músicas</span>
          <span style={{...S.stat,...S.statVerbo}}>⭐ <b>{SONGS.filter(s=>s.verbo).length}</b> &nbsp;Verbo da Vida</span>
          {admin && <span style={{...S.stat,...S.statAdmin}}>✓ Admin{savingFlash ? " ⏳" : ""}</span>}
          {admin && (
            <button
              type="button"
              onClick={() => setShowAddSong(true)}
              style={{...S.stat, ...S.statAdmin, cursor: "pointer", fontFamily: "inherit", fontWeight: 700}}
              title="Adicionar nova música"
            >
              ➕ Nova música
            </button>
          )}
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
          {admin && (
            <button
              type="button"
              onClick={openHistory}
              style={{...S.stat, cursor: "pointer", fontFamily: "inherit"}}
              title="Ver histórico de repertórios criados"
            >
              📜 Histórico
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={S.container} className="container-pad">
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
              <div key={s.num} style={cardStyle} className="song-card" onClick={() => setDetail(s)}>
                {t ? <img src={t} style={S.thumb} className="song-thumb" loading="lazy" alt="" /> : <div style={S.thumb} className="song-thumb" />}
                <div style={S.info}>
                  <div style={S.title} className="song-title">{s.musica}</div>
                  <div style={S.artist} className="song-artist">{s.artista}</div>
                  {s.indicadaPor && (
                    <div style={S.indicadaLine}>
                      <span style={S.indicadaLabel}>Indicado por:</span> {s.indicadaPor}
                    </div>
                  )}
                  <div style={S.badges}>
                    {s.verbo && <span style={{...S.badge, ...S.badgeVerbo}}>⭐ Verbo da Vida</span>}
                    {/* Celebração: badge para todos quando marcada; toggle clicável apenas para admin */}
                    {admin ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleCelebracao(s.videoId); }}
                        style={{
                          ...S.celebToggle,
                          ...(isCelebracao(s) ? S.celebToggleOn : {}),
                        }}
                        title={isCelebracao(s) ? "Desmarcar Celebração" : "Marcar como Celebração"}
                      >
                        {isCelebracao(s) ? "🎉 Celebração" : "🎉 Marcar"}
                      </button>
                    ) : (
                      isCelebracao(s) && <span style={{...S.badge, ...S.badgeCeleb}}>🎉 Celebração</span>
                    )}
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
      <div style={S.bottom} className="bottom-dock">
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
                  <div style={slotStyle} className="slot">
                    <div style={numStyle}>#{i+1}{s?.verbo ? " ⭐" : ""}</div>
                    {s ? <div style={S.slotName} className="slot-name">{s.musica}</div>
                       : <div style={S.slotEmpty} className="slot-name">{slotMsgs[i]}</div>}
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
                  {isCelebracao(detail) && <span style={{...S.modalBadge, ...S.badgeCeleb}}>🎉 Celebração</span>}
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

      {/* EDIT MODAL — admin only */}
      {editing && admin && (
        <EditSongModal
          song={editing}
          currentTemas={getEffectiveTemas(editing)}
          currentOverride={overrides[editing.videoId]}
          currentKeys={getKeysFor(editing)}
          pessoas={pessoas}
          onSave={handleSaveEdit}
          onDelete={handleDeleteSong}
          onClose={() => setEditing(null)}
        />
      )}

      {/* PESSOAS MODAL (admin singer list) */}
      {admin && (
        <PessoasModal
          open={showPessoas}
          pessoas={pessoas}
          onSave={handleSavePessoas}
          onClose={() => setShowPessoas(false)}
        />
      )}

      {/* ADD SONG MODAL (admin) */}
      {admin && (
        <AddSongModal
          open={showAddSong}
          pessoas={pessoas}
          existingVideoIds={allSongs.map(s => s.videoId)}
          onSave={handleAddSong}
          onClose={() => setShowAddSong(false)}
        />
      )}

      {/* HISTORY MODAL — admin only */}
      {showHistory && admin && (
        <div style={S.overlay} className="v-fade" onClick={e => { if (e.target === e.currentTarget) setShowHistory(false); }}>
          <div className="v-scale" style={{ width: "100%", maxWidth: 720 }}>
            <div style={S.modal}>
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)" }}>📜 Histórico de Repertórios</div>
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    style={{
                      width: 32, height: 32, borderRadius: 10,
                      border: "1px solid var(--border-strong)",
                      background: "var(--input-bg)", color: "var(--text-muted)",
                      fontSize: "1.1rem", cursor: "pointer", fontFamily: "inherit",
                    }}
                    title="Fechar"
                  >×</button>
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 16 }}>
                  Todos os repertórios criados, do mais recente para o mais antigo.
                </div>

                {loadingHistory ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-faint)", fontSize: "0.9rem" }}>
                    Carregando...
                  </div>
                ) : history.length === 0 ? (
                  <div style={{
                    padding: "40px 20px", textAlign: "center",
                    color: "var(--text-faint)", fontSize: "0.9rem", fontStyle: "italic",
                    background: "var(--chip-bg)", borderRadius: 14,
                    border: "1px dashed var(--border-strong)",
                  }}>
                    Nenhum repertório no histórico ainda.<br/>
                    Crie um repertório e ele aparecerá aqui.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "60vh", overflowY: "auto", paddingRight: 4 }}>
                    {history.map(entry => {
                      const isOpen = !!expandedHistory[entry.id];
                      const tipoLabel = entry.type === "evento"
                        ? (entry.eventName ? `🎉 ${entry.eventName}` : "🎉 Evento Especial")
                        : "⛪ Culto de Domingo";
                      return (
                        <div key={entry.id} style={{
                          background: "var(--chip-bg)",
                          border: "1px solid var(--border)",
                          borderRadius: 14,
                          overflow: "hidden",
                        }}>
                          <div
                            onClick={() => setExpandedHistory(p => ({ ...p, [entry.id]: !p[entry.id] }))}
                            style={{ padding: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
                                {formatBrDate(entry.date)} · {tipoLabel}
                              </div>
                              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", flexWrap: "wrap", gap: 10 }}>
                                <span>✍ {entry.createdBy || "—"}</span>
                                <span>🎵 {(entry.songs || []).length} música{(entry.songs || []).length === 1 ? "" : "s"}</span>
                                <span style={{ color: "var(--text-faint)" }}>Salvo em {formatBrDateTime(entry.createdAt)}</span>
                              </div>
                            </div>
                            <span style={{ color: "var(--text-faint)", fontSize: "0.9rem", flexShrink: 0 }}>
                              {isOpen ? "▴" : "▾"}
                            </span>
                          </div>
                          {isOpen && (
                            <div style={{
                              padding: "0 14px 14px",
                              borderTop: "1px solid var(--border)",
                              display: "flex", flexDirection: "column", gap: 10, paddingTop: 12,
                            }}>
                              {(entry.songs || []).map((sg, i) => {
                                // Pega temas atualizados (ou da própria entrada, se existir)
                                const raw = findRawSong(sg.videoId);
                                const temas = raw ? getEffectiveTemas(raw).map(tid => TEMAS_DEF[tid]?.label).filter(Boolean) : [];
                                return (
                                  <div key={i} style={{
                                    background: "var(--menu-bg)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 10,
                                    padding: 12,
                                  }}>
                                    <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                                      {i+1}. {sg.musica}{sg.verbo ? " ⭐" : ""}
                                    </div>
                                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: 6 }}>
                                      🎤 {sg.artista}
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: "0.74rem" }}>
                                      {sg.lead && (
                                        <span style={{
                                          padding: "3px 9px", borderRadius: 999,
                                          background: "var(--accent-soft)",
                                          color: "var(--accent-text)",
                                          border: "1px solid var(--accent-border)",
                                          fontWeight: 700,
                                        }}>🎙 {sg.lead}</span>
                                      )}
                                      {sg.tom && (
                                        <span style={{
                                          padding: "3px 9px", borderRadius: 999,
                                          background: "var(--chip-bg)",
                                          color: "var(--text-muted)",
                                          border: "1px solid var(--border)",
                                          fontWeight: 700,
                                        }}>🎼 {sg.tom}</span>
                                      )}
                                      {temas.map(tl => (
                                        <span key={tl} style={{
                                          padding: "3px 9px", borderRadius: 999,
                                          background: "var(--chip-bg)",
                                          color: "var(--text-faint)",
                                          border: "1px solid var(--border)",
                                        }}>{tl}</span>
                                      ))}
                                      {sg.videoId && (
                                        <a href={`https://youtu.be/${sg.videoId}`} target="_blank" rel="noopener noreferrer"
                                          style={{
                                            padding: "3px 9px", borderRadius: 999,
                                            background: "var(--chip-bg)",
                                            color: "var(--accent-text)",
                                            border: "1px solid var(--border)",
                                            textDecoration: "none",
                                            fontWeight: 700,
                                          }}>▶ YouTube</a>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL — pick lead + tom for each of the 4 selected songs */}
      {showConfirm && (
        <div style={S.overlay} className="v-fade" onClick={e => { if (e.target === e.currentTarget) setShowConfirm(false); }}>
          <div className="v-scale" style={{ width: "100%", maxWidth: 560 }}>
            <div style={S.modal}>
              <div style={{ padding: 24 }}>
                <div style={S.outputTitle}>🎙 Confirmar Repertório</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "center", marginBottom: 18 }}>
                  Preencha os dados do culto e, para cada música, escolha o Lead e o tom (pode ficar em branco se ainda não souber).
                </div>

                {/* ── Metadata: data, tipo, criador ── */}
                <div style={{
                  background: "var(--accent-soft)",
                  border: "1px solid var(--accent-border)",
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 14,
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                        Data do culto
                      </div>
                      <input
                        type="date"
                        value={meetDate}
                        onChange={e => setMeetDate(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-strong)",
                          borderRadius: 10,
                          color: "var(--text)",
                          fontSize: "0.86rem",
                          outline: "none",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                        Tipo
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setMeetType("domingo")}
                          style={{
                            flex: 1,
                            padding: "10px 8px",
                            borderRadius: 10,
                            border: meetType === "domingo" ? "1px solid var(--accent)" : "1px solid var(--border-strong)",
                            background: meetType === "domingo" ? "var(--accent-soft)" : "var(--input-bg)",
                            color: meetType === "domingo" ? "var(--accent-text)" : "var(--text-muted)",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Domingo
                        </button>
                        <button
                          type="button"
                          onClick={() => setMeetType("evento")}
                          style={{
                            flex: 1,
                            padding: "10px 8px",
                            borderRadius: 10,
                            border: meetType === "evento" ? "1px solid var(--accent)" : "1px solid var(--border-strong)",
                            background: meetType === "evento" ? "var(--accent-soft)" : "var(--input-bg)",
                            color: meetType === "evento" ? "var(--accent-text)" : "var(--text-muted)",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Evento
                        </button>
                      </div>
                    </div>
                  </div>

                  {meetType === "evento" && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                        Nome do evento
                      </div>
                      <input
                        value={meetEventName}
                        onChange={e => setMeetEventName(e.target.value)}
                        placeholder="Ex: Vigília de Ano Novo"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border-strong)",
                          borderRadius: 10,
                          color: "var(--text)",
                          fontSize: "0.86rem",
                          outline: "none",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  )}

                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                      Criado por
                    </div>
                    <PersonPicker
                      value={createdBy}
                      pessoas={pessoas}
                      placeholder="Quem está criando este repertório?"
                      onChange={setCreatedBy}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "45vh", overflowY: "auto", paddingRight: 4 }}>
                  {selected.map((s, i) => {
                    const row = confirmRows[i] || { videoId: s.videoId, lead: "", tom: "" };
                    const update = (patch) => {
                      setConfirmRows(prev => {
                        const next = [...prev];
                        next[i] = { ...next[i], ...patch };
                        return next;
                      });
                    };
                    return (
                      <div key={s.videoId} style={{
                        background: "var(--chip-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: 14,
                        padding: 14,
                      }}>
                        <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>
                          {i+1}. {s.musica}{s.verbo ? " ⭐" : ""}
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: 10 }}>
                          {s.artista}
                        </div>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                          Lead
                        </div>
                        <PersonPicker
                          value={row.lead}
                          pessoas={pessoas}
                          placeholder="Selecione o cantor"
                          onChange={(v) => update({ lead: v })}
                        />
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, marginTop: 12 }}>
                          Tom <span style={{ textTransform: "none", fontWeight: 500, color: "var(--text-faint)" }}>(opcional)</span>
                        </div>
                        <input
                          value={row.tom}
                          onChange={e => update({ tom: e.target.value })}
                          placeholder="Ex: G, Bb, F#m — ou deixe em branco"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            background: "var(--input-bg)",
                            border: "1px solid var(--border-strong)",
                            borderRadius: 10,
                            color: "var(--text)",
                            fontSize: "0.86rem",
                            outline: "none",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid var(--border-strong)",
                      background: "transparent",
                      color: "var(--text-muted)",
                      fontSize: "0.86rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    disabled={savingConfirm}
                    onClick={confirmAndShow}
                    style={{
                      flex: 2,
                      padding: 12,
                      borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg, var(--accent), var(--accent-strong))",
                      color: "#fff",
                      fontSize: "0.92rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      opacity: savingConfirm ? 0.6 : 1,
                      boxShadow: "0 6px 18px rgba(16,185,129,0.30)",
                    }}
                  >
                    {savingConfirm ? "Salvando..." : "✓ Confirmar e gerar texto"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
