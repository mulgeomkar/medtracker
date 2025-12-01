const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 4000; // backend on 4000
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-secret-in-prod';

app.use(cors());
app.use(bodyParser.json());

// --- Auth routes ---
app.post('/api/signup', (req, res) => {
  const { name, email, password, role, extra } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const stmt = db.prepare(`INSERT INTO users (name, email, password_hash, role, extra) VALUES (?, ?, ?, ?, ?)`);
  stmt.run(name, email.toLowerCase(), hash, role, JSON.stringify(extra || {}), function (err) {
    if (err) {
      return res.status(400).json({ error: 'User exists or DB error', detail: err.message });
    }
    const userId = this.lastID;
    const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'created', token, user: { id: userId, name, email, role } });
  });
});

app.post('/api/signin', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: 'Missing fields' });

  db.get(`SELECT id, name, email, password_hash, role, extra FROM users WHERE email = ? AND role = ?`,
    [email.toLowerCase(), role],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = bcrypt.compareSync(password, row.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: row.id, role: row.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: row.id, name: row.name, email: row.email, role: row.role, extra: JSON.parse(row.extra || '{}') } });
    }
  );
});

// simple protected middleware (not heavily used in this demo)
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// sample endpoints for future expansion
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
