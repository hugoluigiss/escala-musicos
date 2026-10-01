import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '5mb' }));

// ─── ADMIN AUTH ─────────────────────────────────────────────────────────────
// Set ADMIN_PASSWORD as an environment variable on Railway.
// All write endpoints require the X-Admin-Password header to match.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
// Keys that require admin auth to write. All other keys remain open
// (so the existing escala features keep working without auth).
const ADMIN_PROTECTED_KEYS = new Set([
  'repertorio_overrides',
  'repertorio_temas',
  'song_keys',
  'pessoas_repertorio',
  'repertorio_custom_songs',
  'repertorio_deleted',
  'repertorio_celebracao',
  'repertorio_history',
  'suggestions_config',
]);

// ─── USER AUTH (Supabase) ───────────────────────────────────────────────────
// Set SUPABASE_URL and SUPABASE_ANON_KEY on Railway. When both are set, every
// /api/data request requires a logged-in user (Authorization: Bearer <jwt>).
// When unset, the site keeps working without login (previous behavior).
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const AUTH_ENABLED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Cache de tokens já validados (evita bater no Supabase a cada request)
const tokenCache = new Map();
const TOKEN_CACHE_MS = 5 * 60 * 1000;

async function verifyUserToken(token) {
  const cached = tokenCache.get(token);
  if (cached && cached.expires > Date.now()) return cached.user;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const user = await res.json();
  if (tokenCache.size > 1000) tokenCache.clear();
  tokenCache.set(token, { user, expires: Date.now() + TOKEN_CACHE_MS });
  return user;
}

async function requireUser(req, res, next) {
  if (!AUTH_ENABLED) return next();
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'login_required' });
  try {
    const user = await verifyUserToken(token);
    if (!user) return res.status(401).json({ error: 'login_required' });
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(503).json({ error: 'auth_unavailable' });
  }
}

// Admins por conta (com o Supabase ligado, a senha ADMIN_PASSWORD deixa de valer):
//  - papel gravado no Supabase: app_metadata.role = "admin" (só muda via painel/SQL
//    do Supabase — o usuário não consegue alterar pelo site);
//  - ou email listado em ADMIN_EMAILS no Railway (opcional, separados por vírgula).
// O email precisa estar confirmado — ninguém vira admin usando o email de outro.
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
);
const ACCOUNT_ADMIN = AUTH_ENABLED;

function isAccountAdmin(user) {
  if (!ACCOUNT_ADMIN || !user || !user.email) return false;
  if (!user.email_confirmed_at) return false;
  const role = user.app_metadata && user.app_metadata.role;
  return role === 'admin' || ADMIN_EMAILS.has(user.email.toLowerCase());
}

// Quem está logado e se é admin
app.get('/api/me', requireUser, (req, res) => {
  res.json({
    email: req.user ? req.user.email : null,
    isAdmin: isAccountAdmin(req.user),
    adminMode: ACCOUNT_ADMIN ? 'account' : 'password',
  });
});

// Public config for the frontend (the anon key is public by design)
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: AUTH_ENABLED ? SUPABASE_URL : null,
    supabaseAnonKey: AUTH_ENABLED ? SUPABASE_ANON_KEY : null,
  });
});

app.use('/api/data', requireUser);

// ─── DATABASE ───────────────────────────────────────────────────────────────
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_data (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS song_suggestions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT,
        user_name TEXT,
        musica TEXT NOT NULL,
        artista TEXT NOT NULL,
        video_id TEXT NOT NULL,
        verbo BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        reviewed_at TIMESTAMP,
        reviewed_by TEXT
      )
    `);
    await pool.query('ALTER TABLE song_suggestions ADD COLUMN IF NOT EXISTS round TEXT');
    await pool.query('CREATE INDEX IF NOT EXISTS song_suggestions_user_idx ON song_suggestions (user_id)');
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

// ─── API ROUTES ─────────────────────────────────────────────────────────────
// Get a value by key
app.get('/api/data/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await pool.query('SELECT value FROM app_data WHERE key = $1', [key]);
    if (result.rows.length > 0) {
      res.json(result.rows[0].value);
    } else {
      res.json(null);
    }
  } catch (err) {
    console.error('GET error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin login: verify password (returns ok or 401)
app.post('/api/admin/login', (req, res) => {
  // Com admins por conta, a senha compartilhada não dá mais acesso
  if (ACCOUNT_ADMIN) return res.status(401).json({ error: 'unauthorized' });
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'admin_password_not_set' });
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) return res.json({ ok: true });
  return res.status(401).json({ error: 'unauthorized' });
});

// Save a value by key
app.put('/api/data/:key', async (req, res) => {
  try {
    const { key } = req.params;
    // Gate writes to admin-protected keys
    if (ADMIN_PROTECTED_KEYS.has(key) && ACCOUNT_ADMIN) {
      if (!isAccountAdmin(req.user)) return res.status(401).json({ error: 'unauthorized' });
    } else if (ADMIN_PROTECTED_KEYS.has(key)) {
      if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'admin_password_not_set' });
      const provided = req.headers['x-admin-password'];
      if (!provided || provided !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'unauthorized' });
      }
    }
    const { value } = req.body;
    await pool.query(
      `INSERT INTO app_data (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all data (for initial load)
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM app_data');
    const data = {};
    result.rows.forEach(row => { data[row.key] = row.value; });
    res.json(data);
  } catch (err) {
    console.error('GET all error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── SUGESTÕES DE MÚSICAS ───────────────────────────────────────────────────
// O admin abre um período de envio (data de início/fim) e define quantas
// sugestões cada músico pode mandar nesse período. Só as pendentes podem ser
// retiradas (liberando a vaga). Ao aprovar, o frontend do admin adiciona a
// música ao repertório (repertorio_custom_songs).
// Config fica em app_data['suggestions_config'] = { max, start, end } (datas
// YYYY-MM-DD, no fuso de Orlando). O "round" identifica o período.
const SUGGESTIONS_TZ = 'America/New_York';
const DEFAULT_SUGGESTIONS_CONFIG = { max: 5, start: null, end: null };

function todayInTz() {
  // en-CA formata como YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: SUGGESTIONS_TZ }).format(new Date());
}

async function getSuggestionsConfig() {
  const r = await pool.query("SELECT value FROM app_data WHERE key = 'suggestions_config'");
  const cfg = { ...DEFAULT_SUGGESTIONS_CONFIG, ...(r.rows[0] ? r.rows[0].value : {}) };
  const today = todayInTz();
  const open = !!(cfg.start && cfg.end && cfg.start <= today && today <= cfg.end);
  return { ...cfg, today, open, round: cfg.start && cfg.end ? `${cfg.start}_${cfg.end}` : null };
}

const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

function parseYoutubeId(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(s) ? s : null;
}

function suggestionRow(r) {
  return {
    id: r.id, musica: r.musica, artista: r.artista, videoId: r.video_id, verbo: r.verbo,
    status: r.status, createdAt: r.created_at, reviewedAt: r.reviewed_at,
    userName: r.user_name, userEmail: r.user_email,
  };
}

function requireLogin(req, res, next) {
  if (!AUTH_ENABLED) return res.status(503).json({ error: 'auth_disabled' });
  return requireUser(req, res, next);
}

function requireAccountAdmin(req, res, next) {
  if (!isAccountAdmin(req.user)) return res.status(403).json({ error: 'forbidden' });
  next();
}

app.use('/api/suggestions', requireLogin);

// Período e limite atuais
app.get('/api/suggestions/config', async (req, res) => {
  try {
    res.json(await getSuggestionsConfig());
  } catch (err) {
    console.error('suggestions config error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: define período e limite
app.put('/api/suggestions/config', requireAccountAdmin, async (req, res) => {
  const { max, start, end } = req.body || {};
  const n = Number(max);
  if (!Number.isInteger(n) || n < 1 || n > 50) return res.status(400).json({ error: 'invalid_max' });
  if (!isDate(start) || !isDate(end) || start > end) return res.status(400).json({ error: 'invalid_dates' });
  try {
    await pool.query(
      `INSERT INTO app_data (key, value, updated_at) VALUES ('suggestions_config', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [JSON.stringify({ max: n, start, end })]);
    res.json(await getSuggestionsConfig());
  } catch (err) {
    console.error('suggestions config save error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Minhas sugestões
app.get('/api/suggestions/mine', async (req, res) => {
  try {
    const cfg = await getSuggestionsConfig();
    const r = await pool.query(
      'SELECT * FROM song_suggestions WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const used = r.rows.filter(row => cfg.round && row.round === cfg.round).length;
    res.json({ config: cfg, used, items: r.rows.map(suggestionRow) });
  } catch (err) {
    console.error('suggestions mine error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Enviar sugestão
app.post('/api/suggestions', async (req, res) => {
  const { url, musica, artista, verbo } = req.body || {};
  const videoId = parseYoutubeId(url);
  const nome = String(musica || '').trim().slice(0, 200);
  const cantor = String(artista || '').trim().slice(0, 200);
  if (!videoId) return res.status(400).json({ error: 'invalid_url' });
  if (!nome || !cantor) return res.status(400).json({ error: 'missing_fields' });
  if (typeof verbo !== 'boolean') return res.status(400).json({ error: 'missing_verbo' });
  let cfg;
  try {
    cfg = await getSuggestionsConfig();
  } catch (err) {
    console.error('suggestions config error:', err.message);
    return res.status(500).json({ error: 'Database error' });
  }
  if (!cfg.open) return res.status(409).json({ error: 'closed' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Serializa os envios do mesmo usuário (evita passar do limite com cliques duplos)
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [req.user.id]);
    const mine = await client.query('SELECT video_id, round FROM song_suggestions WHERE user_id = $1', [req.user.id]);
    if (mine.rows.filter(r => r.round === cfg.round).length >= cfg.max) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'limit_reached' });
    }
    if (mine.rows.some(r => r.video_id === videoId)) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'duplicate' });
    }
    const m = req.user.user_metadata || {};
    const ins = await client.query(
      `INSERT INTO song_suggestions (user_id, user_email, user_name, musica, artista, video_id, verbo, round)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, req.user.email, m.full_name || m.name || null, nome, cantor, videoId, verbo, cfg.round]);
    await client.query('COMMIT');
    res.json(suggestionRow(ins.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('suggestion create error:', err.message);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

// Retirar uma sugestão própria que ainda está em análise
app.delete('/api/suggestions/:id', async (req, res) => {
  try {
    const r = await pool.query(
      "DELETE FROM song_suggestions WHERE id = $1 AND user_id = $2 AND status = 'pending' RETURNING id",
      [Number(req.params.id) || 0, req.user.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'not_found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('suggestion delete error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: todas as sugestões (pendentes primeiro)
app.get('/api/suggestions', requireAccountAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM song_suggestions
       ORDER BY (status = 'pending') DESC, created_at DESC LIMIT 300`);
    res.json({ items: r.rows.map(suggestionRow) });
  } catch (err) {
    console.error('suggestions list error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: aprovar / recusar
app.post('/api/suggestions/:id/status', requireAccountAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'invalid_status' });
  }
  try {
    const r = await pool.query(
      `UPDATE song_suggestions SET status = $1, reviewed_at = NOW(), reviewed_by = $2
       WHERE id = $3 RETURNING *`,
      [status, req.user.email, Number(req.params.id) || 0]);
    if (!r.rows.length) return res.status(404).json({ error: 'not_found' });
    res.json(suggestionRow(r.rows[0]));
  } catch (err) {
    console.error('suggestion status error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── SERVE FRONTEND ─────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ─── START SERVER ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});
