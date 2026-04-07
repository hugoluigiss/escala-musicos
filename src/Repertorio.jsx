import { useState, useEffect } from "react";
import { LETRAS } from "./letras.js";
import { TEMAS, TEMAS_DEF } from "./temas.js";
import { apiGet, apiPut, isAdmin as checkIsAdmin } from "./api.js";
import { EditSongModal } from "./AdminEdit.jsx";
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
];

const thumb = (id) => id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "";
const ytLink = (id) => id ? `https://youtu.be/${id}` : "";

// ─── STYLES ─────────────────────────────────────────────────────────────────
const S = {
  page: { fontFamily: "'Inter','Segoe UI',sans-serif", background: "#0d0b1e", color: "#e8e6f0", minHeight: "100vh", paddingBottom: 320 },
  header: { background: "linear-gradient(135deg,#141028,#1a1440)", borderBottom: "1px solid rgba(201,169,110,0.15)", padding: "16px 20px", textAlign: "center", position: "sticky", top: 0, zIndex: 100 },
  h1: { fontSize: "1.3rem", fontWeight: 800, background: "linear-gradient(135deg,#e8a838,#c9a96e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sub: { color: "#7a7890", fontSize: "0.75rem", marginTop: 2 },
  stats: { display: "flex", gap: 8, justifyContent: "center", marginTop: 10, flexWrap: "wrap" },
  stat: { background: "rgba(255,255,255,0.04)", padding: "4px 12px", borderRadius: 20, fontSize: "0.7rem", color: "#7a7890", border: "1px solid rgba(255,255,255,0.06)" },
  statVerbo: { background: "rgba(232,168,56,0.1)", border: "1px solid rgba(232,168,56,0.25)", color: "#e8a838" },
  nav: { display: "flex", gap: 8, justifyContent: "center", marginTop: 10 },
  navBtn: { padding: "6px 16px", borderRadius: 20, border: "1px solid rgba(201,169,110,0.2)", background: "rgba(201,169,110,0.08)", color: "#c9a96e", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, textDecoration: "none" },
  container: { maxWidth: 600, margin: "0 auto", padding: "12px 16px" },
  searchBox: { position: "relative", marginBottom: 10 },
  searchInput: { width: "100%", padding: "10px 14px 10px 40px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#e8e6f0", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#7a7890", fontSize: 16 },
  filters: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 12 },
  filterBtn: { padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#7a7890", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", fontWeight: 500 },
  filterActive: { background: "rgba(108,99,255,0.25)", border: "1px solid rgba(108,99,255,0.4)", color: "#a99bff" },
  filterVerbo: { background: "rgba(232,168,56,0.2)", border: "1px solid rgba(232,168,56,0.35)", color: "#e8a838" },
  card: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, cursor: "pointer", marginBottom: 4, transition: "all 0.15s" },
  cardVerbo: { background: "rgba(232,168,56,0.06)", borderLeft: "3px solid rgba(232,168,56,0.5)" },
  cardSelected: { border: "1px solid rgba(108,99,255,0.5)", background: "rgba(108,99,255,0.08)" },
  cardSelectedVerbo: { border: "1px solid rgba(232,168,56,0.5)", background: "rgba(232,168,56,0.12)" },
  thumb: { width: 52, height: 39, borderRadius: 6, objectFit: "cover", flexShrink: 0, background: "rgba(255,255,255,0.05)" },
  info: { flex: 1, minWidth: 0 },
  title: { fontSize: "0.82rem", fontWeight: 600, color: "#e8e6f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  artist: { fontSize: "0.72rem", color: "#7a7890", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 },
  badges: { display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" },
  badgeVerbo: { fontSize: "0.6rem", padding: "1px 6px", borderRadius: 8, fontWeight: 600, background: "rgba(232,168,56,0.15)", color: "#e8a838" },
  badgePerson: { fontSize: "0.6rem", padding: "1px 6px", borderRadius: 8, fontWeight: 600, background: "rgba(108,99,255,0.12)", color: "#a99bff" },
  badgeTom: { fontSize: "0.6rem", padding: "1px 6px", borderRadius: 8, fontWeight: 600, background: "rgba(91,200,175,0.12)", color: "#5bc8af" },
  badgeTema: { fontSize: "0.58rem", padding: "1px 6px", borderRadius: 8, fontWeight: 600 },
  temaRow: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 12, marginTop: -4 },
  temaChip: { padding: "5px 11px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#7a7890", fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", fontWeight: 600 },
  check: { width: 22, height: 22, borderRadius: 6, border: "2px solid rgba(255,255,255,0.1)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "transparent" },
  checkSel: { background: "#6c63ff", borderColor: "#6c63ff", color: "#fff" },
  checkSelVerbo: { background: "#e8a838", borderColor: "#e8a838", color: "#1a1440" },
  // Bottom panel
  bottom: { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 150, background: "#141028", borderTop: "1px solid rgba(201,169,110,0.15)", boxShadow: "0 -2px 20px rgba(0,0,0,0.4)" },
  bottomContent: { maxWidth: 600, margin: "0 auto", padding: "12px 16px 20px" },
  repHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  repTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#e8e6f0" },
  repCount: { fontSize: "0.75rem", color: "#7a7890", background: "rgba(255,255,255,0.05)", padding: "2px 10px", borderRadius: 12 },
  slot: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 8, minHeight: 42, marginBottom: 6 },
  slotFilled: { borderStyle: "solid", borderColor: "rgba(108,99,255,0.4)", background: "rgba(108,99,255,0.06)" },
  slotFilledVerbo: { borderColor: "rgba(232,168,56,0.4)", background: "rgba(232,168,56,0.06)" },
  slotNum: { width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: "#7a7890", flexShrink: 0 },
  slotNumFilled: { background: "#6c63ff", color: "#fff" },
  slotNumVerbo: { background: "#e8a838", color: "#1a1440" },
  slotName: { fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  slotArtist: { fontSize: "0.65rem", color: "#7a7890" },
  slotEmpty: { fontSize: "0.75rem", color: "#4a4860", fontStyle: "italic" },
  slotRemove: { background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14, padding: 4, opacity: 0.6, flexShrink: 0 },
  ruleWarn: { padding: "8px 10px", borderRadius: 8, marginBottom: 10, fontSize: "0.73rem", fontWeight: 500, background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" },
  ruleOk: { padding: "8px 10px", borderRadius: 8, marginBottom: 10, fontSize: "0.73rem", fontWeight: 500, background: "rgba(74,222,128,0.08)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" },
  btnGenerate: { width: "100%", padding: 12, borderRadius: 8, border: "none", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  btnEnabled: { background: "linear-gradient(135deg,#6c63ff,#8b83ff)", color: "#fff" },
  btnDisabled: { background: "rgba(255,255,255,0.05)", color: "#4a4860", cursor: "not-allowed" },
  // Modals
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", justifyContent: "center", alignItems: "flex-end", backdropFilter: "blur(4px)" },
  modal: { background: "#1a1440", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", border: "1px solid rgba(201,169,110,0.15)" },
  modalThumb: { width: "100%", aspectRatio: "16/9", objectFit: "cover" },
  modalBody: { padding: "16px 20px 24px" },
  modalTitle: { fontSize: "1.15rem", fontWeight: 700, marginBottom: 2 },
  modalArtist: { color: "#7a7890", fontSize: "0.88rem", marginBottom: 10 },
  modalBadge: { padding: "3px 10px", borderRadius: 10, fontSize: "0.73rem", fontWeight: 600, display: "inline-block", marginRight: 6, marginBottom: 6 },
  modalActions: { display: "flex", gap: 8, marginTop: 12 },
  modalYt: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 16px", background: "#ff0000", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: "0.85rem" },
  modalSelect: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 16px", borderRadius: 8, border: "none", fontFamily: "inherit", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", color: "#fff" },
  modalClose: { width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#7a7890", fontFamily: "inherit", fontSize: "0.82rem", cursor: "pointer" },
  letraTitle: { marginTop: 16, marginBottom: 6, fontSize: "0.78rem", fontWeight: 700, color: "#c9a96e", letterSpacing: "0.05em", textTransform: "uppercase" },
  letraBox: { background: "rgba(0,0,0,0.3)", padding: 14, borderRadius: 8, fontSize: "0.85rem", lineHeight: 1.7, whiteSpace: "pre-wrap", color: "#d8d6e8", border: "1px solid rgba(255,255,255,0.06)", maxHeight: "40vh", overflowY: "auto", fontFamily: "'Inter','Segoe UI',sans-serif" },
  letraEmpty: { background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 8, fontSize: "0.8rem", color: "#7a7890", fontStyle: "italic", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)" },
  // Output
  outputBox: { background: "#1a1440", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 560, padding: 20, maxHeight: "85vh", overflowY: "auto", border: "1px solid rgba(201,169,110,0.15)" },
  outputTitle: { fontSize: "1.1rem", fontWeight: 700, marginBottom: 14, textAlign: "center" },
  outputText: { background: "rgba(0,0,0,0.3)", padding: 14, borderRadius: 8, fontSize: "0.82rem", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 14, border: "1px solid rgba(255,255,255,0.06)", color: "#e8e6f0" },
  btnCopy: { width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#25d366", color: "#fff", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  outputClose: { marginTop: 8, width: "100%", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#7a7890", fontFamily: "inherit", fontSize: "0.82rem", cursor: "pointer" },
  noResults: { textAlign: "center", padding: "40px 20px", color: "#4a4860", fontSize: "0.88rem" },
  adminBtn: { padding: "5px 12px", borderRadius: 16, border: "1px solid rgba(232,168,56,0.35)", background: "rgba(232,168,56,0.08)", color: "#e8a838", fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, marginLeft: 6 },
  adminOnBtn: { padding: "5px 12px", borderRadius: 16, border: "1px solid rgba(74,222,128,0.4)", background: "rgba(74,222,128,0.1)", color: "#4ade80", fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, marginLeft: 6 },
  editBtn: { width: "100%", marginTop: 8, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(232,168,56,0.4)", background: "rgba(232,168,56,0.1)", color: "#e8a838", fontFamily: "inherit", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" },
  keyRow: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 },
  keyChip: { fontSize: "0.7rem", padding: "3px 9px", borderRadius: 10, background: "rgba(91,200,175,0.1)", color: "#5bc8af", border: "1px solid rgba(91,200,175,0.25)", fontWeight: 600 },
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
        if (pe && Array.isArray(pe)) setPessoas(pe);
        else {
          // seed default pessoas from existing indicadaPor field
          const defaults = Array.from(new Set(SONGS.map(s => s.indicadaPor).filter(Boolean))).sort();
          setPessoas(defaults);
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
    const { temas: newTemas, override, keys, pessoas: newPessoas } = payload;
    const vid = editing.videoId;
    // Build next maps
    const nextOv = { ...overrides };
    if ((override.indicadaPor || "").trim() === "" && (override.tom || "").trim() === "") {
      delete nextOv[vid];
    } else {
      nextOv[vid] = { indicadaPor: override.indicadaPor, tom: override.tom };
    }
    const nextTemas = { ...temasOver };
    if (Array.isArray(newTemas) && newTemas.length > 0) nextTemas[vid] = newTemas;
    else delete nextTemas[vid];
    const nextKeys = { ...songKeys };
    if (Array.isArray(keys) && keys.length > 0) nextKeys[vid] = keys;
    else delete nextKeys[vid];
    const nextPessoas = Array.isArray(newPessoas) ? newPessoas : pessoas;

    setSavingFlash(true);
    try {
      await Promise.all([
        apiPut("repertorio_overrides", nextOv),
        apiPut("repertorio_temas", nextTemas),
        apiPut("song_keys", nextKeys),
        apiPut("pessoas_repertorio", nextPessoas),
      ]);
      setOverrides(nextOv);
      setTemasOver(nextTemas);
      setSongKeys(nextKeys);
      setPessoas(nextPessoas);
      // refresh detail view if open
      if (detail && detail.videoId === vid) {
        setDetail(getEffectiveSong(SONGS.find(s => s.videoId === vid)));
      }
    } finally { setSavingFlash(false); }
  }

  const filtered = effectiveSongs.filter(s => {
    if (filter === "verbo" && !s.verbo) return false;
    if (filter === "other" && s.verbo) return false;
    if (["matheus","jokasta","madalena","aline"].includes(filter) && !(s.indicadaPor || "").toLowerCase().includes(filter)) return false;
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

  const filters = [
    { id: "all", label: "Todas" }, { id: "verbo", label: "⭐ Verbo da Vida" }, { id: "other", label: "Outras" },
    { id: "matheus", label: "Matheus" }, { id: "jokasta", label: "Jokasta" }, { id: "madalena", label: "Madalena" }, { id: "aline", label: "Aline" },
  ];

  const slotMsgs = ["Toque para adicionar", "2ª música", "3ª música", "4ª música"];

  return (
    <div style={S.page}>
      <SiteHeader current="repertorio" />
      {/* HEADER */}
      <div style={S.header}>
        <h1 style={S.h1}>Repertório de Louvor</h1>
        <p style={S.sub}>Verbo Orlando — Winter Garden</p>
        <div style={S.stats}>
          <span style={S.stat}><b>{SONGS.length}</b> músicas</span>
          <span style={{...S.stat,...S.statVerbo}}><b>{SONGS.filter(s=>s.verbo).length}</b> Verbo da Vida</span>
          {admin && <span style={{...S.stat, ...S.statVerbo}}>✓ Admin{savingFlash ? " ⏳" : ""}</span>}
        </div>
      </div>

      {/* CONTENT */}
      <div style={S.container}>
        {/* Search */}
        <div style={S.searchBox}>
          <span style={S.searchIcon}>🔍</span>
          <input style={S.searchInput} placeholder="Buscar música ou artista..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Filters */}
        <div style={S.filters}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{...S.filterBtn, ...(filter===f.id ? (f.id==="verbo" ? S.filterVerbo : S.filterActive) : {})}}
            >{f.label}</button>
          ))}
        </div>

        {/* Tema chips */}
        <div style={S.temaRow}>
          <button onClick={() => setTema("all")}
            style={{...S.temaChip, ...(tema==="all" ? {background:"rgba(108,99,255,0.25)", borderColor:"rgba(108,99,255,0.4)", color:"#a99bff"} : {})}}
          >Todos os temas</button>
          {Object.entries(TEMAS_DEF).map(([id, def]) => (
            <button key={id} onClick={() => setTema(id)}
              style={{
                ...S.temaChip,
                ...(tema===id ? {background: def.bg, border:`1px solid ${def.border}`, color: def.color} : {})
              }}
            >{def.label}</button>
          ))}
        </div>

        {/* Song List */}
        {filtered.length === 0 ? (
          <div style={S.noResults}>Nenhuma música encontrada</div>
        ) : filtered.map(s => {
          const isSel = selected.some(x => x.num === s.num);
          const t = thumb(s.videoId);
          const cardStyle = {
            ...S.card,
            ...(s.verbo ? S.cardVerbo : {}),
            ...(isSel ? (s.verbo ? S.cardSelectedVerbo : S.cardSelected) : {}),
          };
          const checkStyle = {
            ...S.check,
            ...(isSel ? (s.verbo ? S.checkSelVerbo : S.checkSel) : {}),
          };
          return (
            <div key={s.num} style={cardStyle}>
              {t ? <img src={t} style={S.thumb} loading="lazy" onClick={() => setDetail(s)} /> : <div style={S.thumb} onClick={() => setDetail(s)} />}
              <div style={S.info} onClick={() => setDetail(s)}>
                <div style={S.title}>{s.musica}</div>
                <div style={S.artist}>{s.artista}</div>
                <div style={S.badges}>
                  {s.verbo && <span style={S.badgeVerbo}>⭐ Verbo da Vida</span>}
                  {s.indicadaPor && <span style={S.badgePerson}>{s.indicadaPor}</span>}
                  {s.tom && s.tom !== "-" && <span style={S.badgeTom}>{s.tom}</span>}
                  {getEffectiveTemas(s).map(tid => {
                    const def = TEMAS_DEF[tid]; if (!def) return null;
                    return <span key={tid} style={{...S.badgeTema, background: def.bg, color: def.color, border:`1px solid ${def.border}`}}>{def.label}</span>;
                  })}
                </div>
              </div>
              <div style={checkStyle} onClick={() => toggle(s.num)}>
                {isSel ? "✓" : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM PANEL */}
      <div style={S.bottom}>
        <div style={S.bottomContent}>
          <div style={S.repHeader}>
            <span style={S.repTitle}>Meu Repertório</span>
            <span style={S.repCount}>{selected.length}/4</span>
          </div>
          {[0,1,2,3].map(i => {
            const s = selected[i];
            const slotStyle = {
              ...S.slot,
              ...(s ? (s.verbo ? S.slotFilledVerbo : S.slotFilled) : {}),
            };
            const numStyle = {
              ...S.slotNum,
              ...(s ? (s.verbo ? S.slotNumVerbo : S.slotNumFilled) : {}),
            };
            return (
              <div key={i} style={slotStyle}>
                <div style={numStyle}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  {s ? (<><div style={S.slotName}>{s.musica}</div><div style={S.slotArtist}>{s.artista}{s.verbo?" ⭐":""}</div></>) :
                    <div style={S.slotEmpty}>{slotMsgs[i]}</div>}
                </div>
                {s && <button style={S.slotRemove} onClick={() => remove(s.num)}>✕</button>}
              </div>
            );
          })}
          <div style={hasVerbo ? S.ruleOk : S.ruleWarn}>
            {hasVerbo ? `✅ ${selected.filter(s=>s.verbo).length} música(s) do Verbo da Vida` : "⚠️ Mínimo 1 música do Verbo da Vida obrigatória"}
          </div>
          <button style={{...S.btnGenerate, ...(canGenerate ? S.btnEnabled : S.btnDisabled)}} disabled={!canGenerate} onClick={generate}>
            📋 Gerar Repertório para WhatsApp
          </button>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detail && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setDetail(null); }}>
          <div style={S.modal}>
            {detail.videoId && <img src={thumb(detail.videoId)} style={S.modalThumb} />}
            <div style={S.modalBody}>
              <div style={S.modalTitle}>{detail.musica}</div>
              <div style={S.modalArtist}>{detail.artista}</div>
              <div>
                {detail.verbo && <span style={{...S.modalBadge,background:"rgba(232,168,56,0.15)",color:"#e8a838",border:"1px solid rgba(232,168,56,0.3)"}}>⭐ Verbo da Vida</span>}
                {detail.indicadaPor && <span style={{...S.modalBadge,background:"rgba(108,99,255,0.12)",color:"#a99bff",border:"1px solid rgba(108,99,255,0.25)"}}>Indicada por: {detail.indicadaPor}</span>}
                {detail.tom && detail.tom!=="-" && <span style={{...S.modalBadge,background:"rgba(91,200,175,0.12)",color:"#5bc8af",border:"1px solid rgba(91,200,175,0.25)"}}>Tom: {detail.tom}</span>}
                {getEffectiveTemas(detail).map(tid => {
                  const def = TEMAS_DEF[tid]; if (!def) return null;
                  return <span key={tid} style={{...S.modalBadge, background: def.bg, color: def.color, border:`1px solid ${def.border}`}}>{def.label}</span>;
                })}
              </div>
              {getKeysFor(detail).length > 0 && (
                <>
                  <div style={S.letraTitle}>🎼 Tons por cantor</div>
                  <div style={S.keyRow}>
                    {getKeysFor(detail).map((k, i) => (
                      <span key={i} style={S.keyChip}>{k.cantor || "?"} → <b>{k.tom || "—"}</b></span>
                    ))}
                  </div>
                </>
              )}
              <div style={S.modalActions}>
                {detail.videoId && <a href={ytLink(detail.videoId)} target="_blank" rel="noreferrer" style={S.modalYt}>▶ YouTube</a>}
                <button onClick={() => { toggle(detail.num); }} style={{...S.modalSelect, background: selected.some(x=>x.num===detail.num) ? "#16a34a" : "#6c63ff"}}>
                  {selected.some(x=>x.num===detail.num) ? "✓ Selecionada" : "+ Adicionar"}
                </button>
              </div>
              {admin && (
                <button style={S.editBtn} onClick={() => setEditing(detail)}>
                  ✏️ Editar música (admin)
                </button>
              )}
              <div style={S.letraTitle}>📜 Letra</div>
              {LETRAS[detail.videoId] && LETRAS[detail.videoId].trim()
                ? <div style={S.letraBox}>{LETRAS[detail.videoId]}</div>
                : <div style={S.letraEmpty}>Letra ainda não cadastrada</div>}
              <button style={S.modalClose} onClick={() => setDetail(null)}>Fechar</button>
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

      {/* OUTPUT MODAL */}
      {showOutput && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setShowOutput(false); }}>
          <div style={S.outputBox}>
            <div style={S.outputTitle}>📋 Repertório Pronto!</div>
            <div style={S.outputText}>{getOutputText()}</div>
            <button style={{...S.btnCopy, ...(copied ? {background:"#16a34a"} : {})}} onClick={copyText}>
              {copied ? "✅ Copiado!" : "📱 Copiar para WhatsApp"}
            </button>
            <button style={S.outputClose} onClick={() => setShowOutput(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
