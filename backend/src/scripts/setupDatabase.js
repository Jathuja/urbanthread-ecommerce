const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const categoriesData = [
  { name: 'Men' },
  { name: 'Women' },
  { name: 'Accessories' }
];

const productsData = [
  {
    name: 'Classic Cotton T-Shirt',
    categoryName: 'Men',
    description: 'Essential crewneck t-shirt made with 100% breathable organic cotton. Perfect for everyday versatile wear.',
    price: 2900.00,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'S', colour: 'White', stock: 25 },
      { size: 'M', colour: 'White', stock: 35 },
      { size: 'L', colour: 'White', stock: 30 },
      { size: 'XL', colour: 'White', stock: 15 },
      { size: 'S', colour: 'Black', stock: 20 },
      { size: 'M', colour: 'Black', stock: 40 },
      { size: 'L', colour: 'Black', stock: 30 },
      { size: 'XL', colour: 'Black', stock: 20 },
      { size: 'M', colour: 'Navy', stock: 25 },
      { size: 'L', colour: 'Navy', stock: 20 }
    ]
  },
  {
    name: 'Oversized Black T-Shirt',
    categoryName: 'Men',
    description: 'Relaxed streetwear-inspired drop-shoulder tee crafted from heavy-duty combed cotton for an effortless silhouette.',
    price: 3500.00,
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'S', colour: 'Black', stock: 20 },
      { size: 'M', colour: 'Black', stock: 30 },
      { size: 'L', colour: 'Black', stock: 25 },
      { size: 'XL', colour: 'Black', stock: 15 }
    ]
  },
  {
    name: 'Premium Hoodie',
    categoryName: 'Men',
    description: 'Ultra-soft brushed fleece pullover hoodie with a spacious kangaroo pocket and ribbed cuffs.',
    price: 6800.00,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'S', colour: 'Grey', stock: 15 },
      { size: 'M', colour: 'Grey', stock: 25 },
      { size: 'L', colour: 'Grey', stock: 20 },
      { size: 'XL', colour: 'Grey', stock: 10 },
      { size: 'M', colour: 'Black', stock: 30 },
      { size: 'L', colour: 'Black', stock: 25 }
    ]
  },
  {
    name: 'Denim Jacket',
    categoryName: 'Men',
    description: 'Vintage washed trucker denim jacket featuring button closure, chest flap pockets, and durable contrast stitching.',
    price: 8500.00,
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'M', colour: 'Blue', stock: 20 },
      { size: 'L', colour: 'Blue', stock: 25 },
      { size: 'XL', colour: 'Blue', stock: 15 },
      { size: 'M', colour: 'Black', stock: 15 },
      { size: 'L', colour: 'Black', stock: 18 }
    ]
  },
  {
    name: 'Casual Shirt',
    categoryName: 'Men',
    description: 'Smart casual button-down shirt with a crisp collar and comfortable stretch cotton fabric for modern styling.',
    price: 4200.00,
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'S', colour: 'White', stock: 15 },
      { size: 'M', colour: 'White', stock: 25 },
      { size: 'L', colour: 'White', stock: 20 },
      { size: 'M', colour: 'Light Blue', stock: 30 },
      { size: 'L', colour: 'Light Blue', stock: 20 }
    ]
  },
  {
    name: 'Cargo Pants',
    categoryName: 'Men',
    description: 'Durable utilitarian cargo trousers equipped with multiple functional pockets and tapered cuffs for casual utility.',
    price: 5400.00,
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'S', colour: 'Olive', stock: 15 },
      { size: 'M', colour: 'Olive', stock: 25 },
      { size: 'L', colour: 'Olive', stock: 20 },
      { size: 'M', colour: 'Black', stock: 25 },
      { size: 'L', colour: 'Black', stock: 20 }
    ]
  },
  {
    name: 'Straight Fit Jeans',
    categoryName: 'Men',
    description: 'Timeless straight-leg five-pocket denim trousers designed with authentic wash and durable reinforced seams.',
    price: 5900.00,
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: '30', colour: 'Blue', stock: 20 },
      { size: '32', colour: 'Blue', stock: 35 },
      { size: '34', colour: 'Blue', stock: 30 },
      { size: '36', colour: 'Blue', stock: 15 }
    ]
  },
  {
    name: 'Summer Dress',
    categoryName: 'Women',
    description: 'Breezy floral wrap dress with a V-neckline, flutter sleeves, and lightweight chiffon drape.',
    price: 5200.00,
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'XS', colour: 'Floral', stock: 12 },
      { size: 'S', colour: 'Floral', stock: 20 },
      { size: 'M', colour: 'Floral', stock: 25 },
      { size: 'L', colour: 'Floral', stock: 15 },
      { size: 'S', colour: 'Yellow', stock: 15 },
      { size: 'M', colour: 'Yellow', stock: 20 }
    ]
  },
  {
    name: 'Linen Blouse',
    categoryName: 'Women',
    description: 'Pure breathable linen blouse with relaxed three-quarter sleeves and mother-of-pearl buttons.',
    price: 4500.00,
    image_url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'S', colour: 'White', stock: 20 },
      { size: 'M', colour: 'White', stock: 30 },
      { size: 'L', colour: 'White', stock: 20 },
      { size: 'S', colour: 'Beige', stock: 18 },
      { size: 'M', colour: 'Beige', stock: 25 }
    ]
  },
  {
    name: 'Casual Skirt',
    categoryName: 'Women',
    description: 'A-line midi skirt with elasticized high waistband and subtle pleated movement.',
    price: 3800.00,
    image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'S', colour: 'Olive', stock: 15 },
      { size: 'M', colour: 'Olive', stock: 25 },
      { size: 'L', colour: 'Olive', stock: 15 },
      { size: 'S', colour: 'Black', stock: 20 },
      { size: 'M', colour: 'Black', stock: 20 }
    ]
  },
  {
    name: 'Crossbody Bag',
    categoryName: 'Accessories',
    description: 'Compact structured faux-leather crossbody bag with adjustable strap and metallic hardware.',
    price: 4200.00,
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'One Size', colour: 'Black', stock: 30 },
      { size: 'One Size', colour: 'Brown', stock: 25 },
      { size: 'One Size', colour: 'Tan', stock: 15 }
    ]
  },
  {
    name: 'Minimal Backpack',
    categoryName: 'Accessories',
    description: 'Water-resistant sleek commuter backpack with padded 15-inch laptop compartment and dual zip closure.',
    price: 6500.00,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    variants: [
      { size: 'One Size', colour: 'Black', stock: 40 },
      { size: 'One Size', colour: 'Charcoal', stock: 30 },
      { size: 'One Size', colour: 'Navy', stock: 20 }
    ]
  }
];

async function setupDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'urbanthread_db';

  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);

  // Connect without database first to ensure urbanthread_db exists
  const rootConn = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });

  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  console.log(`Database '${database}' verified/created.`);
  await rootConn.end();

  // Now connect to urbanthread_db
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
  });

  console.log(`Connected to '${database}'. Creating tables...`);

  // 1. categories
  await conn.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. products
  await conn.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image_url VARCHAR(1000),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. product_variants
  await conn.query(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      size VARCHAR(50) NOT NULL,
      colour VARCHAR(50) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Tables verified/created successfully.');

  // Seed categories
  console.log('Seeding categories...');
  const categoryMap = {};
  for (const cat of categoriesData) {
    const [existing] = await conn.query('SELECT id, name FROM categories WHERE name = ?', [cat.name]);
    if (existing.length > 0) {
      categoryMap[cat.name] = existing[0].id;
    } else {
      const [insertRes] = await conn.query('INSERT INTO categories (name) VALUES (?)', [cat.name]);
      categoryMap[cat.name] = insertRes.insertId;
      console.log(` Inserted category: ${cat.name} (id: ${insertRes.insertId})`);
    }
  }

  // Seed products and variants
  console.log('Seeding products and variants...');
  for (const p of productsData) {
    const categoryId = categoryMap[p.categoryName];
    if (!categoryId) {
      console.warn(`Category ${p.categoryName} not found for product ${p.name}`);
      continue;
    }

    const [existing] = await conn.query('SELECT id FROM products WHERE name = ?', [p.name]);
    let productId;
    if (existing.length > 0) {
      productId = existing[0].id;
      // Update details to ensure latest seed info
      await conn.query(
        'UPDATE products SET category_id = ?, description = ?, price = ?, image_url = ? WHERE id = ?',
        [categoryId, p.description, p.price, p.image_url, productId]
      );
      console.log(` Updated product: ${p.name} (id: ${productId})`);
    } else {
      const [prodRes] = await conn.query(
        'INSERT INTO products (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
        [categoryId, p.name, p.description, p.price, p.image_url]
      );
      productId = prodRes.insertId;
      console.log(` Inserted product: ${p.name} (id: ${productId})`);
    }

    // Insert variants (remove old variants for clean idempotency)
    await conn.query('DELETE FROM product_variants WHERE product_id = ?', [productId]);
    for (const v of p.variants) {
      await conn.query(
        'INSERT INTO product_variants (product_id, size, colour, stock) VALUES (?, ?, ?, ?)',
        [productId, v.size, v.colour, v.stock]
      );
    }
    console.log(`   Seeded ${p.variants.length} variants for ${p.name}`);
  }

  console.log('Database setup and seed completed successfully!');
  await conn.end();
}

if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Database setup failed:', err);
      process.exit(1);
    });
}

module.exports = setupDatabase;
