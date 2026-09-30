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
