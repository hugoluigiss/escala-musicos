# Verbo Music — Orlando, FL

Sistema de repertório do ministério de louvor.

## Páginas
- `/` — **Repertório**: busca, filtros (MVV / temas), seleção de 4 músicas e geração da mensagem para WhatsApp. Admin (senha) pode adicionar/editar/excluir músicas e ver o histórico.
- `/conferencia` — **Conferência de Ministros · América do Norte 2026**: repertório dos 4 dias, cantores, banda e dress code.

## Stack
- React + Vite (design flat branco, fonte Instrument Sans)
- Backend: Express + Postgres key-value em `/api/data/:key` (escrita protegida por `ADMIN_PASSWORD`)
- Deploy: Railway (o `dist/` é commitado — rode `npm run build` antes de subir)
