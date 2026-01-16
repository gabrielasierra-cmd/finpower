import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const storageDir = path.resolve(process.cwd(), 'server', 'storage');
if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

const sharesFile = path.join(storageDir, 'shares.json');
const postcardsFile = path.join(storageDir, 'postcards.json');

function readJson(file, def) {
  try {
    if (!fs.existsSync(file)) return def;
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw || 'null') ?? def;
  } catch (e) { return def; }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

let shares = readJson(sharesFile, {});
let postcards = readJson(postcardsFile, []);

app.get('/api/shares/:token', (req, res) => {
  const s = shares[req.params.token];
  if (!s) return res.status(404).json({ error: 'not found' });
  return res.json(s.snapshot);
});

app.post('/api/shares', (req, res) => {
  const snapshot = req.body;
  const key = JSON.stringify(snapshot);
  // find existing
  for (const t of Object.keys(shares)) {
    if (JSON.stringify(shares[t].snapshot) === key) return res.json({ token: t, url: `/shared/${t}`, createdAt: shares[t].createdAt });
  }
  const token = (Date.now().toString(36) + Math.random().toString(36).slice(2,8));
  const createdAt = new Date().toISOString();
  shares[token] = { token, createdAt, snapshot };
  writeJson(sharesFile, shares);
  return res.json({ token, url: `/shared/${token}`, createdAt });
});

app.post('/api/shares/:oldToken/regenerate', (req, res) => {
  const old = req.params.oldToken;
  if (!shares[old]) return res.status(404).json({ error: 'not found' });
  const snapshot = shares[old].snapshot;
  const newToken = (Date.now().toString(36) + Math.random().toString(36).slice(2,8));
  const createdAt = new Date().toISOString();
  shares[newToken] = { token: newToken, createdAt, snapshot };
  delete shares[old];
  writeJson(sharesFile, shares);
  return res.json({ token: newToken, url: `/shared/${newToken}`, createdAt });
});

app.post('/api/reset', (req, res) => {
  shares = {};
  postcards = [];
  writeJson(sharesFile, shares);
  writeJson(postcardsFile, postcards);
  return res.json({ ok: true });
});

app.get('/api/postcards', (req, res) => {
  return res.json(postcards);
});

app.post('/api/postcards', (req, res) => {
  const p = req.body;
  const id = postcards.reduce((m, x) => Math.max(m, x.id ?? 0), 0) + 1;
  const created = { id, ...p, createdAt: new Date().toISOString() };
  postcards.push(created);
  writeJson(postcardsFile, postcards);
  return res.json(created);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Mock server running on http://localhost:${port}`));
