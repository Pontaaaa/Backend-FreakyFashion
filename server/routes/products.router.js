const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Database = require("better-sqlite3");

const db = new Database("./db/freakyfashion.db", { verbose: console.log });

// file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "public", "images")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/* ===== Helpers ===== */
function parseCategoryIds(raw) {
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      const maybeJson = JSON.parse(raw);
      if (Array.isArray(maybeJson)) return maybeJson.map(Number).filter(n => Number.isInteger(n));
    } catch {}
    return raw.split(",").map(s => Number(s.trim())).filter(n => Number.isInteger(n));
  }
  if (Array.isArray(raw)) return raw.map(Number).filter(n => Number.isInteger(n));
  return [];
}
function slugify(s) {
  return s.toString().trim().toLowerCase()
    .replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-').replace(/^\-+|\-+$/g, '');
}

/* ===== GET /api/products  (optional ?category=slug or ?categoryId=ID) ===== */
router.get("/", (req, res) => {
  try {
    const { category, categoryId } = req.query;

    if (category || categoryId) {
      const bySlug = !!category;
      const stmt = db.prepare(`
        SELECT p.*
        FROM products p
        JOIN product_categories pc ON pc.product_id = p.id
        JOIN categories c ON c.id = pc.category_id
        WHERE ${bySlug ? "c.slug = ?" : "c.id = ?"}
        GROUP BY p.id
        ORDER BY p.publicationDate DESC, p.id DESC
      `);
      const rows = stmt.all(bySlug ? category : Number(categoryId));
      return res.json(rows);
    }

    const stmt = db.prepare("SELECT * FROM products ORDER BY publicationDate DESC, id DESC");
    const products = stmt.all();
    res.json(products);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    res.status(500).json({ message: "Kunde inte hämta produkter." });
  }
});

/* ===== GET /api/products/search?q=...  (must be BEFORE /:id) ===== */
router.get("/search", (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) return res.status(400).json({ message: "Sökfråga saknas." });

  try {
    const stmt = db.prepare(`
      SELECT * FROM products
      WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(brand) LIKE ?
    `);
    const results = stmt.all(`%${query}%`, `%${query}%`, `%${query}%`);
    res.json(results);
  } catch (err) {
    console.error("Sökfel:", err);
    res.status(500).json({ message: "Kunde inte hämta sökresultat." });
  }
});

/* ===== GET /api/products/:id  (includes categories) ===== */
router.get("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    if (!product) return res.status(404).json({ message: "Produkten finns inte." });

    const cats = db.prepare(`
      SELECT c.id, c.name, c.slug
      FROM product_categories pc
      JOIN categories c ON c.id = pc.category_id
      WHERE pc.product_id = ?
      ORDER BY c.name
    `).all(id);

    res.json({ ...product, categories: cats });
  } catch (e) {
    console.error("GET /products/:id failed", e);
    res.status(500).json({ message: "Kunde inte hämta produkt." });
  }
});

/* ===== POST /api/products  (create + categories) ===== */
router.post("/", upload.single("image"), (req, res) => {
  try {
    const { name, description, brand, sku, price, publicationDate } = req.body;
    const imageFile = req.file;

    if (!name || !description || !brand || !sku || !price || !publicationDate || !imageFile) {
      return res.status(400).json({ message: "Alla fält måste fyllas i." });
    }
    if (!/^[A-Za-z]{3}\d{3}$/.test(sku)) {
      return res.status(400).json({ message: "SKU-formatet är felaktigt. Exempel: AAA111" });
    }

    const imagePath = `/images/${imageFile.filename}`;
    const slug = slugify(name);
    const isNew = 1;

    const insert = db.prepare(`
      INSERT INTO products (name, description, image, brand, sku, price, publicationDate, slug, isNew)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      const info = insert.run(name, description, imagePath, brand, sku, price, publicationDate, slug, isNew);
      const productId = info.lastInsertRowid;

      const categoryIds = parseCategoryIds(req.body.categoryIds);
      if (categoryIds.length) {
        const insPC = db.prepare(`INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)`);
        for (const cid of categoryIds) insPC.run(productId, cid);
      }

      return productId;
    });

    const newId = tx();

    res.status(201).json({ message: "Produkten har lagts till!", id: newId });
  } catch (err) {
    if (String(err?.message).includes("UNIQUE constraint failed: products.sku")) {
      return res.status(400).json({ message: "Denna SKU används redan. Välj en unik SKU." });
    }
    console.error("POST /products failed:", err);
    res.status(500).json({ message: "Något gick fel vid sparning av produkten." });
  }
});

/* ===== PUT /api/products/:id  (update + categories) ===== */
router.put("/:id", upload.single("image"), (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ message: "Produkten finns inte." });

    const { name, description, brand, sku, price, publicationDate } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : undefined;
    const slug = name ? slugify(name) : undefined;

    const sets = [];
    const vals = [];
    if (name !== undefined) { sets.push("name=?"); vals.push(name); }
    if (description !== undefined) { sets.push("description=?"); vals.push(description); }
    if (imagePath !== undefined) { sets.push("image=?"); vals.push(imagePath); }
    if (brand !== undefined) { sets.push("brand=?"); vals.push(brand); }
    if (sku !== undefined) {
      if (!/^[A-Za-z]{3}\d{3}$/.test(sku)) return res.status(400).json({ message: "SKU-formatet är felaktigt." });
      sets.push("sku=?"); vals.push(sku);
    }
    if (price !== undefined) { sets.push("price=?"); vals.push(price); }
    if (publicationDate !== undefined) { sets.push("publicationDate=?"); vals.push(publicationDate); }
    if (slug !== undefined) { sets.push("slug=?"); vals.push(slug); }
    if (sets.length) {
      vals.push(id);
      db.prepare(`UPDATE products SET ${sets.join(", ")} WHERE id=?`).run(...vals);
    }

    // categories (replace all)
    if (req.body.categoryIds !== undefined) {
      const categoryIds = parseCategoryIds(req.body.categoryIds);
      const tx = db.transaction(() => {
        db.prepare(`DELETE FROM product_categories WHERE product_id = ?`).run(id);
        if (categoryIds.length) {
          const insPC = db.prepare(`INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)`);
          for (const cid of categoryIds) insPC.run(id, cid);
        }
      });
      tx();
    }

    res.json({ message: "Produkten uppdaterad.", id });
  } catch (err) {
    if (String(err?.message).includes("UNIQUE constraint failed: products.sku")) {
      return res.status(400).json({ message: "Denna SKU används redan." });
    }
    console.error("PUT /products/:id failed", err);
    res.status(500).json({ message: "Kunde inte uppdatera produkten." });
  }
});

/* ===== DELETE /api/products/:id ===== */
router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const stmt = db.prepare("DELETE FROM products WHERE id = ?");
    const result = stmt.run(id);
    if (result.changes === 0) return res.status(404).json({ message: "No product found to delete." });
    res.json({ message: "Product deleted", changes: result.changes });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;