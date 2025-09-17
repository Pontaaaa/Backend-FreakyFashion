const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /api/categories
router.get('/', (req, res) => {
  const rows = db.prepare(`SELECT id, name, slug FROM categories ORDER BY name`).all();
  res.json(rows);
});

// POST /api/categories
router.post('/', (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ message: 'name and slug required' });
  const info = db.prepare(`INSERT INTO categories (name, slug) VALUES (?, ?)`).run(name, slug);
  res.status(201).json({ id: info.lastInsertRowid, name, slug });
});

// PUT /api/categories/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ message: 'name and slug required' });
  db.prepare(`UPDATE categories SET name=?, slug=? WHERE id=?`).run(name, slug, id);
  res.json({ id: Number(id), name, slug });
});

// DELETE /api/categories/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare(`DELETE FROM product_categories WHERE category_id=?`).run(id);
  db.prepare(`DELETE FROM categories WHERE id=?`).run(id);
  res.status(204).end();
});

module.exports = router;