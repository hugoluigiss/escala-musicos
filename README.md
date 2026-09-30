# Verbo Music — Orlando, FL

Sistema de repertório do ministério de louvor.

## Páginas
- `/` — **Repertório**: busca, filtros (MVV / temas), seleção de 4 músicas e geração da mensagem para WhatsApp. Admin (senha) pode adicionar/editar/excluir músicas e ver o histórico.
- `/conferencia` — **Conferência de Ministros · América do Norte 2026**: repertório dos 4 dias, cantores, banda e dress code.

## Login (Supabase)
O site inteiro exige login: **Google** ou **email + senha** (com criar conta e "esqueci a senha").
Configure no Railway as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` (Supabase → Project Settings → API).
Sem essas variáveis o login fica desligado e o site funciona aberto, como antes.
Com elas, o backend também exige o token do usuário em `/api/data`.
A senha de admin continua separada: ela libera edição do repertório e a Conferência.

## Stack
- React + Vite (design flat branco, fonte Instrument Sans)
- Backend: Express + Postgres key-value em `/api/data/:key` (escrita protegida por `ADMIN_PASSWORD`)
- Deploy: Railway (o `dist/` é commitado — rode `npm run build` antes de subir)
