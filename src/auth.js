// ─── Login de usuários (Supabase Auth) ─────────────────────────────────────
// URL e chave pública vêm de /api/config (variáveis SUPABASE_URL e
// SUPABASE_ANON_KEY no Railway) — assim não é preciso rebuild para configurar.
// Opcionalmente, VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY no build.
// Sem configuração, o login fica desligado e o site funciona como antes.

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

let clientPromise = null;

// Link de "redefinir senha" do email — o evento PASSWORD_RECOVERY pode
// disparar antes do hook assinar, então guardamos o sinal aqui.
let recoveryPending = typeof window !== "undefined" && /type=recovery/.test(window.location.hash);

async function loadConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey) return { supabaseUrl: envUrl, supabaseAnonKey: envKey };
  try {
    const res = await fetch("/api/config");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Retorna o client do Supabase, ou null se o login não estiver configurado.
export function getSupabase() {
  if (!clientPromise) {
    clientPromise = loadConfig().then(cfg => {
      if (!cfg || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return null;
      const sb = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
      sb.auth.onAuthStateChange(event => {
        if (event === "PASSWORD_RECOVERY") recoveryPending = true;
        if (event === "USER_UPDATED" || event === "SIGNED_OUT") recoveryPending = false;
      });
      return sb;
    });
  }
  return clientPromise;
}

export async function getAccessToken() {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token || null;
}

function redirectUrl() {
  return window.location.origin + "/";
}

export async function signInWithGoogle() {
  const sb = await getSupabase();
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUrl() },
  });
  if (error) throw error;
}

export async function signInWithEmail(email, password) {
  const sb = await getSupabase();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

// Retorna true se a conta já entrou logada (confirmação de email desligada).
export async function signUpWithEmail(name, email, password) {
  const sb = await getSupabase();
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { full_name: name }, emailRedirectTo: redirectUrl() },
  });
  if (error) throw error;
  return !!data.session;
}

export async function sendPasswordReset(email) {
  const sb = await getSupabase();
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() });
  if (error) throw error;
}

export async function updatePassword(password) {
  const sb = await getSupabase();
  const { error } = await sb.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  const sb = await getSupabase();
  if (sb) await sb.auth.signOut();
}

// Traduz as mensagens de erro mais comuns do Supabase.
export function authErrorMessage(err) {
  const msg = (err && err.message) || "";
  if (/invalid login credentials/i.test(msg)) return "Email ou senha incorretos.";
  if (/email not confirmed/i.test(msg)) return "Confirme seu email antes de entrar (veja sua caixa de entrada).";
  if (/already registered/i.test(msg)) return "Este email já tem conta. Use \"Entrar\".";
  if (/password should be at least/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  if (/rate limit/i.test(msg)) return "Muitas tentativas. Aguarde um pouco e tente de novo.";
  if (/provider is not enabled/i.test(msg)) return "Login com Google ainda não foi ativado no Supabase.";
  if (/invalid.*email/i.test(msg)) return "Email inválido.";
  return "Não foi possível concluir. Tente novamente.";
}

// ─── Hook: sessão atual ────────────────────────────────────────────────────
// status: "loading" | "disabled" (login não configurado) | "signed_out" |
// "signed_in" | "recovery" (usuário veio do link de redefinir senha)

export function useAuth() {
  const [state, setState] = useState({ status: "loading", user: null });

  useEffect(() => {
    let sub = null;
    let cancelled = false;
    getSupabase().then(async sb => {
      if (cancelled) return;
      if (!sb) { setState({ status: "disabled", user: null }); return; }
      const { data } = await sb.auth.getSession();
      if (cancelled) return;
      setState(prev => prev.status === "recovery" ? prev : {
        status: !data.session ? "signed_out" : recoveryPending ? "recovery" : "signed_in",
        user: data.session?.user || null,
      });
      sub = sb.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setState({ status: "recovery", user: session?.user || null });
          return;
        }
        setState(prev => {
          // Continua na tela de nova senha até o usuário salvar
          if (prev.status === "recovery" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return prev;
          return { status: session ? "signed_in" : "signed_out", user: session?.user || null };
        });
      }).data.subscription;
    });
    return () => { cancelled = true; if (sub) sub.unsubscribe(); };
  }, []);

  return state;
}

export function userDisplayName(user) {
  if (!user) return "";
  const m = user.user_metadata || {};
  return m.full_name || m.name || user.email || "";
}
