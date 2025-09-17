const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Database = require("better-sqlite3");

const db = new Database("./db/freakyfashion.db", { verbose: console.log });

// ---- Multer: image upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ---- Helper: parse categoryIds from form-data or JSON
function parseCategoryIds(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(n => Number(n)).filter(n => Number.isFinite(n));
  if (typeof raw === "string") {
    // try JSON first: "[1,2]"
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.map(n => Number(n)).filter(n => Number.isFinite(n));
    } catch (_) {
      // fall back to comma-separated: "1,2,3"
      return raw
        .split(",")
        .map(s => Number(s.trim()))
        .filter(n => Number.isFinite(n));
    }
  }
  return [];
}

// ---- Helper: upsert product <-> categories assignments
function saveProductCategories(productId, categoryIds = []) {
  db.prepare(`DELETE FROM product_categories WHERE product_id = ?`).run(productId);
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return;

  const insert = db.prepare(
    `INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)`
  );
  const txn = db.transaction((ids) => {
    ids.forEach((cid) => insert.run(productId, cid));
  });
  txn(categoryIds);
}

// GET /api/products  (optional filter by category slug or id)
router.get("/", (req, res) => {
  try {
    const { category, categoryId } = req.query;

    if (category || categoryId) {
      const where = category
        ? `pc.category_id = (SELECT id FROM categories WHERE slug = ?)`
        : `pc.category_id = ?`;
      const param = category ? category : Number(categoryId);

      const rows = db.prepare(
        `SELECT p.*
           FROM products p
           JOIN product_categories pc ON pc.product_id = p.id
          WHERE ${where}
          GROUP BY p.id
          ORDER BY p.id DESC`
      ).all(param);

      return res.json(rows);
    }

    const products = db.prepare(`SELECT * FROM products ORDER BY id DESC`).all();
    res.json(products);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    res.status(500).json({ message: "Kunde inte hämta produkter." });
  }
});

// GET /api/products/:id  (returns product + its categories)
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const product = db.prepare(`SELECT * FROM products WHERE id = ?`).get(id);
    if (!product) return res.status(404).json({ message: "Produkten hittades inte." });

    const categories = db
      .prepare(
        `SELECT c.id, c.name, c.slug
           FROM categories c
           JOIN product_categories pc ON pc.category_id = c.id
          WHERE pc.product_id = ?`
      )
      .all(id);

    res.json({ ...product, categories });
  } catch (err) {
    console.error("Failed to fetch product:", err);
    res.status(500).json({ message: "Kunde inte hämta produkten." });
  }
});

// POST /api/products  (multipart/form-data; accepts categoryIds)
router.post("/", upload.single("image"), (req, res) => {
  console.log("POST /api/products called");
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);

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
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const categoryIds = parseCategoryIds(req.body.categoryIds);

    const insert = db.prepare(`
      INSERT INTO products (name, description, image, brand, sku, price, publicationDate, slug, isNew)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      const info = insert.run(
        name,
        description,
        imagePath,
        brand,
        sku,
        price,
        publicationDate,
        slug,
        1
      );

      saveProductCategories(info.lastInsertRowid, categoryIds);

      res.status(201).json({ message: "Produkten har lagts till!", id: info.lastInsertRowid });
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT" || String(err.message).includes("UNIQUE constraint failed: products.sku")) {
        return res.status(400).json({ message: "Denna SKU används redan. Välj en unik SKU." });
      }
      console.error("Insert error:", err);
      res.status(500).json({ message: "Något gick fel vid sparning av produkten." });
    }
  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ message: "Ett fel inträffade vid bearbetning av förfrågan." });
  }
});

// PUT /api/products/:id  (JSON OR multipart; accepts categoryIds)
router.put("/:id", upload.single("image"), (req, res) => {
  try {
    const { id } = req.params;

    // Allow both JSON and form-data
    const {
      name,
      description,
      brand,
      sku,
      price,
      publicationDate,
      slug: incomingSlug,
    } = req.body;

    const imageFile = req.file;
    let imagePath = undefined;

    if (imageFile) {
      imagePath = `/images/${imageFile.filename}`;
    }

    const slug = (incomingSlug || name || "")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-");

    // Build dynamic update
    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (description !== undefined) { fields.push("description = ?"); values.push(description); }
    if (brand !== undefined) { fields.push("brand = ?"); values.push(brand); }
    if (sku !== undefined) { fields.push("sku = ?"); values.push(sku); }
    if (price !== undefined) { fields.push("price = ?"); values.push(price); }
    if (publicationDate !== undefined) { fields.push("publicationDate = ?"); values.push(publicationDate); }
    if (imagePath !== undefined) { fields.push("image = ?"); values.push(imagePath); }
    if (slug) { fields.push("slug = ?"); values.push(slug); }

    if (fields.length) {
      const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
      values.push(id);
      db.prepare(sql).run(...values);
    }

    const categoryIds = parseCategoryIds(req.body.categoryIds);
    saveProductCategories(Number(id), categoryIds);

    res.json({ message: "Produkten uppdaterad", id: Number(id) });
  } catch (err) {
    console.error("PUT error:", err);
    res.status(500).json({ message: "Kunde inte uppdatera produkten." });
  }
});

// DELETE /api/products/:id  (also removes category links)
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  try {
    db.prepare(`DELETE FROM product_categories WHERE product_id = ?`).run(id);
    const result = db.prepare(`DELETE FROM products WHERE id = ?`).run(id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "No product found to delete." });
    }

    res.json({ message: "Product deleted", changes: result.changes });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;