import { useEffect, useState } from "react";
import {
  signInWithGoogle, signInWithEmail, signUpWithEmail,
  sendPasswordReset, isGoogleEnabled, updatePassword, authErrorMessage,
} from "./auth.js";

// ─── Tela de login ───────────────────────────────────────────────────────
// Google (OAuth) ou email + senha. Modos: entrar, criar conta, esqueci a
// senha e "recovery" (definir nova senha após clicar no link do email).

const S = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    padding: 18, background: "#f7f8fa",
  },
  box: {
    width: "100%", maxWidth: 400, borderRadius: 20, background: "#ffffff",
    border: "1px solid #eef1f4", boxShadow: "0 24px 60px rgba(17,20,24,0.08)",
    padding: 28, textAlign: "center",
  },
  logo: {
    width: 52, height: 52, borderRadius: 16, background: "#047857",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 24, fontWeight: 700, margin: "0 auto 14px",
  },
  title: { fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#111418" },
  sub: { fontSize: "0.82rem", color: "#6b7684", marginTop: 4, marginBottom: 20 },
  google: {
    width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e2e6ea",
    background: "#ffffff", color: "#111418", fontSize: "0.9rem", fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
  },
  divider: {
    display: "flex", alignItems: "center", gap: 10, margin: "18px 0",
    color: "#9aa3ad", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em",
  },
  line: { flex: 1, height: 1, background: "#eef1f4" },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #e2e6ea",
    background: "#ffffff", color: "#111418", fontSize: "0.92rem", outline: "none", marginBottom: 10,
  },
  primary: {
    width: "100%", marginTop: 4, padding: 13, borderRadius: 12, border: "none",
    background: "#047857", color: "#fff", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
  },
  link: {
    background: "none", border: "none", color: "#047857", fontSize: "0.8rem",
    fontWeight: 600, cursor: "pointer", padding: 0,
  },
  links: { marginTop: 16, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" },
  muted: { fontSize: "0.8rem", color: "#6b7684" },
  err: {
    color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: 10, padding: "9px 12px", fontSize: "0.78rem", marginBottom: 12, textAlign: "left",
  },
  ok: {
    color: "#047857", background: "#ecfdf5", border: "1px solid #a7d9c4",
    borderRadius: 10, padding: "9px 12px", fontSize: "0.78rem", marginBottom: 12, textAlign: "left",
  },
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

export default function Login({ recovery = false }) {
  const [mode, setMode] = useState(recovery ? "recovery" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const [google, setGoogle] = useState(false);

  useEffect(() => {
    let alive = true;
    isGoogleEnabled().then(on => { if (alive) setGoogle(on); });
    return () => { alive = false; };
  }, []);

  function switchMode(m) {
    setMode(m); setErr(""); setOk(""); setPassword("");
  }

  async function run(fn) {
    setErr(""); setOk(""); setLoading(true);
    try { await fn(); } catch (ex) { setErr(authErrorMessage(ex)); } finally { setLoading(false); }
  }

  function submit(e) {
    e.preventDefault();
    if (mode === "login") {
      run(() => signInWithEmail(email.trim(), password));
    } else if (mode === "signup") {
      run(async () => {
        const loggedIn = await signUpWithEmail(name.trim(), email.trim(), password);
        if (!loggedIn) {
          switchMode("login");
          setOk("Conta criada! Enviamos um link de confirmação para o seu email. Confirme e depois entre.");
        }
      });
    } else if (mode === "reset") {
      run(async () => {
        await sendPasswordReset(email.trim());
        setOk("Se houver uma conta com esse email, você vai receber um link para criar uma nova senha.");
      });
    } else if (mode === "recovery") {
      run(() => updatePassword(password));
    }
  }

  const titles = {
    login: ["Entrar", "Acesse o repertório do ministério de louvor."],
    signup: ["Criar conta", "Cadastre-se para acessar o site."],
    reset: ["Esqueci a senha", "Informe seu email para receber o link de redefinição."],
    recovery: ["Nova senha", "Digite a nova senha da sua conta."],
  };
  const [title, sub] = titles[mode];
  const showGoogle = google && (mode === "login" || mode === "signup");
  const needsPassword = mode !== "reset";
  const canSubmit = !loading
    && (mode === "recovery" || email.trim())
    && (!needsPassword || password.length >= 6)
    && (mode !== "signup" || name.trim());
  const submitLabel = {
    login: "Entrar", signup: "Criar conta", reset: "Enviar link", recovery: "Salvar nova senha",
  }[mode];

  return (
    <div style={S.page}>
      <form style={S.box} className="modal-box" onSubmit={submit}>
        <div style={S.logo}>♪</div>
        <div style={S.title}>{title}</div>
        <div style={S.sub}>{sub}</div>

        {err && <div style={S.err}>{err}</div>}
        {ok && <div style={S.ok}>{ok}</div>}

        {showGoogle && (
          <>
            <button type="button" style={S.google} className="outline-btn" disabled={loading}
              onClick={() => run(signInWithGoogle)}>
              <GoogleIcon /> Continuar com Google
            </button>
            <div style={S.divider}><span style={S.line} />ou com email<span style={S.line} /></div>
          </>
        )}

        {mode === "signup" && (
          <input style={S.input} className="search-input" type="text" placeholder="Seu nome"
            autoComplete="name" value={name} onChange={e => setName(e.target.value)} />
        )}
        {mode !== "recovery" && (
          <input style={S.input} className="search-input" type="email" placeholder="Email"
            autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        )}
        {needsPassword && (
          <input style={S.input} className="search-input" type="password"
            placeholder={mode === "login" ? "Senha" : "Senha (mínimo 6 caracteres)"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password} onChange={e => setPassword(e.target.value)} />
        )}

        <button type="submit" style={{ ...S.primary, opacity: canSubmit ? 1 : 0.6 }}
          className="green-btn" disabled={!canSubmit}>
          {loading ? "Aguarde..." : submitLabel}
        </button>

        <div style={S.links}>
          {mode === "login" && (
            <>
              <button type="button" style={S.link} onClick={() => switchMode("reset")}>Esqueci a senha</button>
              <span style={S.muted}>
                Não tem conta?{" "}
                <button type="button" style={S.link} onClick={() => switchMode("signup")}>Criar conta</button>
              </span>
            </>
          )}
          {(mode === "signup" || mode === "reset") && (
            <span style={S.muted}>
              Já tem conta?{" "}
              <button type="button" style={S.link} onClick={() => switchMode("login")}>Entrar</button>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
