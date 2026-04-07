// Taxonomia de temas das músicas
// Cada música pode ter até 3 temas (em ordem de relevância)
// Chave do mapeamento TEMAS = videoId

export const TEMAS_DEF = {
  santidade:   { label: "Santidade e Glória",      color: "#e8a838", bg: "rgba(232,168,56,0.12)",  border: "rgba(232,168,56,0.3)"  },
  soberania:   { label: "Soberania e Reinado",     color: "#a99bff", bg: "rgba(108,99,255,0.12)",  border: "rgba(108,99,255,0.3)"  },
  nome:        { label: "Nome de Jesus",           color: "#ff9a76", bg: "rgba(255,154,118,0.12)", border: "rgba(255,154,118,0.3)" },
  cruz:        { label: "Cruz e Salvação",         color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)"   },
  amor:        { label: "Amor do Pai",             color: "#f472b6", bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.3)" },
  graca:       { label: "Graça e Perdão",          color: "#fb7185", bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.3)" },
  cura:        { label: "Cura e Libertação",       color: "#5bc8af", bg: "rgba(91,200,175,0.12)",  border: "rgba(91,200,175,0.3)"  },
  fe:          { label: "Fé e Confiança",          color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)"  },
  entrega:     { label: "Entrega e Consagração",   color: "#818cf8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.3)" },
  vitoria:     { label: "Vitória",                 color: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.3)"  },
  intimidade:  { label: "Intimidade e Presença",   color: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.3)" },
  espirito:    { label: "Espírito Santo",          color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)"  },
  gratidao:    { label: "Gratidão e Testemunho",   color: "#4ade80", bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.3)"  },
  esperanca:   { label: "Esperança e Promessa",    color: "#22d3ee", bg: "rgba(34,211,238,0.12)",  border: "rgba(34,211,238,0.3)"  },
};

// Mapeamento videoId → array de até 3 temas (em ordem de relevância)
export const TEMAS = {
  // 1-10 (classificadas)
  "ILy997rP3Po": ["fe", "esperanca"],              // Não é Homem pra Mentir — Marcos Freire
  "dlGOiuxSzVw": ["intimidade", "entrega"],        // A Boa Parte — Nívea Soares
  "4grgpeRwcfg": ["intimidade"],                   // Prefiro a Tua Presença — Ana Luiza
  "Z1faUgngZlU": ["gratidao"],                     // Gratidão — ADAI / Fernando Silva
  "x4ZaA7JgYC4": ["nome", "vitoria"],              // O Nome Dele — Sued Silva
  "oNUErOaOuPw": ["santidade", "gratidao"],        // Minh'alma Engrandece / Adorado
  "3CqL4pgTF5Q": ["nome", "vitoria"],              // Em Nome de Jesus — Emylie Rodrigues
  "aBJKhyXyxCI": ["esperanca"],                    // Cristo Vem Me Buscar — Ligia Coelho
  "TypWyNW7yJ0": ["gratidao", "fe"],               // Medley: Tens Sido Fiel + Vem de Ti Senhor
  "9Lb6iTtcvFc": ["fe", "intimidade"],             // Medley: Confio em Ti + Salmos 23

  // 11-70 (a classificar nos próximos lotes)
};
