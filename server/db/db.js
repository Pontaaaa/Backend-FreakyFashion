const path = require('path');
const Database = require('better-sqlite3');

// Open (or create) the DB file
const dbPath = path.join(__dirname, 'freakyfashion.db');
const db = new Database(dbPath);

// Enforce FK constraints
db.pragma('foreign_keys = ON');

// --- Base tables (idempotent) ---
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    description TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS product_categories (
    product_id  INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id)  REFERENCES products(id)   ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );
`);

// --- Migrations / additive columns ---
// products: brand, sku, publicationDate, slug, isNew
try { db.exec(`ALTER TABLE products ADD COLUMN brand TEXT`); } catch { /* exists */ }
try { db.exec(`ALTER TABLE products ADD COLUMN sku TEXT`); } catch { /* exists */ }
try { db.exec(`ALTER TABLE products ADD COLUMN publicationDate TEXT`); } catch { /* exists */ }
try { db.exec(`ALTER TABLE products ADD COLUMN slug TEXT`); } catch { /* exists */ }
try { db.exec(`ALTER TABLE products ADD COLUMN isNew INTEGER DEFAULT 0`); } catch { /* exists */ }

// categories: image
try { db.exec(`ALTER TABLE categories ADD COLUMN image TEXT`); } catch { /* exists */ }

// --- Helpful indexes / constraints (idempotent) ---
// Unique SKU (matches your route validation)
db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_unique ON products(sku)`);
// Unique slug for products (optional but useful if you route by slug)
db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique ON products(slug)`);
// Slug on categories is already UNIQUE via table definition; index still helps lookups
db.exec(`CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)`);

// --- Seed defaults (safe to run every boot) ---
db.exec(`
  INSERT OR IGNORE INTO categories (id, name, slug) VALUES
  (1, 'Kläder', 'klader'),
  (2, 'Accessoarer', 'accessoarer'),
  (3, 'Skor', 'skor');
`);

module.exports = db;