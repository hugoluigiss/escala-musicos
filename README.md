# Verbo Music — Orlando, FL

Sistema de repertório do ministério de louvor.

## Páginas
- `/` — **Repertório**: busca, filtros (MVV / temas), seleção de 4 músicas e geração da mensagem para WhatsApp. Admin (senha) pode adicionar/editar/excluir músicas e ver o histórico.
- `/sugestoes` — **Sugestões**: músicos logados sugerem músicas (link do YouTube, nome, cantor e se é do Ministério Verbo da Vida). O admin define o período de envio (início/fim, horário de Orlando) e o limite por pessoa, e aprova ou recusa; ao aprovar, a música entra no Repertório.
- `/conferencia` — **Conferência de Ministros · América do Norte 2026**: repertório dos 4 dias, cantores, banda e dress code.

## Login (Supabase)
O site inteiro exige login: **Google** ou **email + senha** (com criar conta e "esqueci a senha").
Configure no Railway as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` (Supabase → Project Settings → API).
Sem essas variáveis o login fica desligado e o site funciona aberto, como antes.
Com elas, o backend também exige o token do usuário em `/api/data`.
**Admin por conta:** com o Supabase ligado, é admin (edita o repertório e vê a Conferência) quem tiver
`app_metadata.role = "admin"` no Supabase — ou o email listado em `ADMIN_EMAILS` no Railway (opcional).
O email precisa estar confirmado, e a senha `ADMIN_PASSWORD` deixa de valer. Para tornar alguém admin,
rode no SQL Editor do Supabase:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
where email = 'email@exemplo.com';
```

## Stack
- React + Vite (design flat branco, fonte Instrument Sans)
- Backend: Express + Postgres key-value em `/api/data/:key` (escrita protegida por `ADMIN_PASSWORD`)
- Deploy: Railway (o `dist/` é commitado — rode `npm run build` antes de subir)
