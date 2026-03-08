import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '5mb' }));

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

// Save a value by key
app.put('/api/data/:key', async (req, res) => {
  try {
    const { key } = req.params;
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
