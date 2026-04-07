// Taxonomia de temas das músicas
// Cada música pode ter até 3 temas (em ordem de relevância)
// Chave do mapeamento TEMAS = videoId

export const TEMAS_DEF = {
  santidade:   { label: "Santidade e Glória",      color: "#e8a838", bg: "rgba(232,168,56,0.12)",  border: "rgba(232,168,56,0.3)"  },
  soberania:   { label: "Soberania e Reinado",     color: "#a99bff", bg: "rgba(108,99,255,0.12)",  border: "rgba(108,99,255,0.3)"  },
  nome:        { label: "Nome de Jesus",           color: "#ff9a76", bg: "rgba(255,154,118,0.12)", border: "rgba(255,154,118,0.3)" },
  ressurreicao:{ label: "Ressurreição e Salvação", color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)"   },
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
  alegria:     { label: "Sorriso e Alegria",       color: "#facc15", bg: "rgba(250,204,21,0.12)",  border: "rgba(250,204,21,0.3)"  },
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

  // 11-20
  "39_zgvLtPS4": ["fe"],                           // Medley Fé — Verbo da Vida
  "b1d6C681f4Y": ["alegria", "fe", "gratidao"],    // Eu me Alegro em Ti — Shalom
  "_C2v2F2C9vA": ["santidade", "soberania", "nome"], // Emmanuel — Hillsong (PT)
  "jRfwoIe3tE4": ["fe", "esperanca"],              // Medley: Sonhando os Sonhos + Está Escrito
  "5MwyYi9OYow": ["ressurreicao", "graca"],        // Redimido — Bruna Olly + Julia Vitória
  "xODYnxwPz_c": ["soberania"],                    // Poderoso — Marcos Witt feat. Kike Pavón
  "H0BLt5pOXCs": ["fe", "intimidade"],             // Não Temerei — Heloisa Rosa
  "0I_3CCL6Q5U": ["soberania", "nome", "vitoria"], // Tua Igreja Canta — Israel Salazar
  "bHooZ7OGN1I": ["nome", "cura", "vitoria"],      // Em Seu Nome — André Aquino + Gabriela Rocha
  "lSwiHA8gymg": ["amor"],                         // Me Ama — Diante do Trono

  // 21-30
  "lTRNHofvCmU": ["vitoria", "esperanca", "soberania"], // Hino da Vitória (Não Se Frustraram) — Gabriela Rocha
  "QDry3GFwXUw": ["ressurreicao", "cura", "vitoria"],   // Estou Livre — Heloisa Rosa
  "EJi0tgUfEkE": ["gratidao", "esperanca"],             // Abençoado — Gabriel Rodrigues
  "6H92C6oWv2k": ["esperanca", "fe", "alegria"],        // Nova Fase — Ana Diniz
  "xHzGAG5gk0o": ["graca", "gratidao", "ressurreicao"], // Eu Te Agradeço — Verbo da Vida (Maverick City)
  "8jqhvdgOfG4": ["fe", "vitoria"],                     // Nada é Impossível — Quatro Por Um
  "xWi8IRepur0": ["graca", "entrega"],                  // Nova Criatura — Kleber Lucas
  "faRYpkO3v3A": ["entrega", "intimidade"],             // Meu Alvo — Kleber Lucas
  "bZFm2ckl30c": ["fe", "esperanca", "vitoria"],        // Eu Creio em Ti — André Martins
  "ljG1r0L7NUI": ["esperanca", "alegria", "graca"],     // Algo Novo — André Martins

  // 31-40
  "3q-pRKf-VaQ": ["amor", "fe"],                        // Teu Amor Não Falha — Nívea Soares
  "LF1UnPP4MvY": ["amor", "fe", "entrega"],             // Diz (You Say) — Gabriela Rocha
  "7GWZwO0MdsY": ["santidade", "intimidade"],           // Sublime — Fhop Music
  "ijNCc7ICCck": ["santidade"],                         // Santo Pra Sempre — Gabriel Guedes
  "46r7YDxB0t4": ["santidade", "soberania"],            // Digno de Tudo — Central 3
  "qcekc_yJLxw": ["intimidade"],                        // Yo Te Busco — Coalo Zamorano
  "LnrwXvesMy0": ["ressurreicao", "santidade"],         // Medley: Vida aos Sepulcros / Só Tu és Santo — Jesse Nascimento
  "Z_mvHa5BnvQ": ["fe", "gratidao"],                    // Nunca Me Deixou — Livres Para Adorar (Matt Redman)
  "t5iptUXVyX0": ["fe", "intimidade"],                  // Nada Me Falta — Eliezer Rodrigues (Salmo 23 / El Shaddai)
  "iqCM_yxslfU": ["amor", "fe"],                        // Teu Amor Não Falha — André Valadão (Your Love Never Fails)

  "phog1GGvzHU": ["fe"],                                // Pela Fé — André Valadão
  "mAMyXHC85Nc": ["graca", "ressurreicao"],             // Nasci de Novo — André Valadão
  "pfxh4uPy9dA": ["nome", "ressurreicao"],              // Sobre Todo Nome — Davi Silva
  "QIuVWpLLYy8": ["ressurreicao", "intimidade"],        // Novo e Vivo Caminho — Verbo da Vida
  "IMD1eBr1cfw": ["esperanca", "gratidao"],             // A Bênção — Gabriel Guedes / Misaias
  "tesOYs6bIgc": ["entrega", "intimidade"],             // Vem, Esta é a Hora
  "hDjFz6DOcQo": ["entrega", "intimidade"],             // Que Ele Cresça — Nívea Soares + Nathanael Brito
  "5kzkPheDZiI": ["santidade", "entrega"],              // Santo + Que Ele Cresça — Thiago Godoi
  "kHKVFxyTjsE": ["santidade", "soberania"],            // Ao Que Está Assentado / Nada Vai Roubar Tua Glória
  "vzx_FT48k1o": ["alegria", "fe"],                     // A Alegria do Senhor — Eliezer Rodrigues

  "qxzQR5uwWsk": ["entrega", "intimidade"],             // Tudo é Perda — Felipe Rodrigues (Fp 3:7-8)
  "_SzVzMh7qfM": ["entrega", "fe"],                     // Eu Me Rendo — Leonardo Gonçalves
  "4ks4j9KqXXk": ["entrega", "fe"],                     // Te Seguirei Até o Fim — Sede Verbo da Vida (Kaleb & Josh)
  "XUs7nuz6c0M": ["fe", "vitoria"],                     // Sobre as Águas — Rapha Gonçalves / Isaías Saad (Mt 14)
  "p4SX8gG38zg": ["fe", "vitoria"],                     // Cremos no Teu Poder — Sede Verbo da Vida
  "d2OLS1RkGF4": ["fe", "vitoria"],                     // Cremos no Teu Poder (Ao Vivo) — Emylie Rodrigues
  "WlR8o3D0V5c": ["entrega", "intimidade"],             // Bom Perfume — Sede Verbo da Vida (Maria de Betânia)
  "Npsfmz5PrvA": ["amor", "graca"],                     // Teu Amor Não Falha — Templo Soul
  "vcX5ljPzIdw": ["vitoria", "fe"],                     // Fortaleza — Ana Ticianeli
  "YuBmD6BmAs0": ["intimidade", "entrega"],             // Satisfaz — André Martins

  "_VJgJx1FM0A": ["fe", "vitoria"],                     // Este é o Dia — Euller Oliveira
  "wK2uxXMJ4a4": ["vitoria", "alegria"],                // Minha Vitória — Eliezer Rodrigues
  "KO5qvwujwVg": ["amor", "vitoria"],                   // O Seu Amor — Manassés Guerra & Cinthya Miranda
  "g0vwsqmq_3U": ["esperanca", "fe"],                   // Só Vai Melhorar — Eliezer Rodrigues
  "bOPsqICVi9Q": ["soberania", "ressurreicao"],         // Rei da Glória — Israel Salazar
  "gOnp0Kuq-9M": ["entrega", "espirito"],               // Altar — Brasa Church Music / Liz Johnson
  "dehE3ISeWNo": ["ressurreicao", "vitoria"],           // Venceu — Nívea Soares
  "p7Gy9m7LEZg": ["ressurreicao", "graca", "alegria"],  // Canção dos Redimidos — Julia Vitoria & Nívea Soares
  "dfmjN09kaX4": ["santidade", "gratidao"],             // Grande É o Senhor (Great Are You Lord)
  "dAbMgyF5d2c": ["esperanca", "fe"],                   // Deus Está Fazendo Algo Grande — Ana Ticianeli
  "PbcSnNw9NnA": ["nome", "cura", "vitoria"],           // Falo Jesus (I Speak Jesus) — Verbo Music feat. Josias Goulart
};
