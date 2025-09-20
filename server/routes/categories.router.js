const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const db = require('../db/db');

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, '..', 'public', 'images')),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

function slugify(s) {
  return s.toString().trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '');
}

function uniqueSlugFromName(name, db) {
  const base = slugify(name);
  if (!base) return null;

  let slug = base;
  let i = 1;
  while (true) {
    const exists = db.prepare(`SELECT 1 FROM categories WHERE slug = ?`).get(slug);
    if (!exists) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`SELECT id, name, slug, image FROM categories ORDER BY name`).all();
    res.json(rows);
  } catch (e) {
    console.error('GET /categories failed', e);
    res.status(500).json({ message: 'Kunde inte hämta kategorier.' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare(`SELECT id, name, slug, image FROM categories WHERE id=?`).get(id);
    if (!row) return res.status(404).json({ message: 'Kategorin hittades inte.' });
    res.json(row);
  } catch (e) {
    console.error('GET /categories/:id failed', e);
    res.status(500).json({ message: 'Kunde inte hämta kategorin.' });
  }
});

router.post('/', upload.single('image'), (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'name krävs.' });
    }

    const slug = uniqueSlugFromName(name, db);
    if (!slug) return res.status(400).json({ message: 'Ogiltigt namn.' });

    const imagePath = req.file ? `/images/${req.file.filename}` : null;

    const info = db
      .prepare(`INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)`)
      .run(name.trim(), slug, imagePath);

    res.status(201).json({ id: info.lastInsertRowid, name: name.trim(), slug, image: imagePath });
  } catch (e) {
    console.error('POST /categories failed', e);
    res.status(500).json({ message: 'Kunde inte skapa kategori.' });
  }
});

router.put('/:id', upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : undefined;

    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (slug !== undefined) { fields.push('slug = ?'); values.push(slug); }
    if (imagePath !== undefined) { fields.push('image = ?'); values.push(imagePath); }

    if (fields.length === 0) return res.json({ id: Number(id) });

    values.push(id);
    db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    res.json({ id: Number(id) });
  } catch (e) {
    console.error('PUT /categories/:id failed', e);
    res.status(500).json({ message: 'Kunde inte uppdatera kategori.' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare(`DELETE FROM product_categories WHERE category_id=?`).run(id);
    const result = db.prepare(`DELETE FROM categories WHERE id=?`).run(id);
    if (result.changes === 0) return res.status(404).json({ message: 'Kategorin finns inte.' });
    res.status(204).end();
  } catch (e) {
    console.error('DELETE /categories/:id failed', e);
    res.status(500).json({ message: 'Kunde inte ta bort kategori.' });
  }
});

module.exports = router;