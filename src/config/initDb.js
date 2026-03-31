const pool = require("./db");

async function initDb() {
  try {
    // 1. Users
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        phone VARCHAR(20),
        role ENUM('buyer','seller','admin') DEFAULT 'buyer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Locations (Specific to Debre Birhan Delivery Zones)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city VARCHAR(100) DEFAULT 'Debre Birhan',
        kebele VARCHAR(50) NOT NULL,
        shipping_fee DECIMAL(10,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // 3. Shops (Sellers have specific shops/brands)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS shops (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seller_id INT,
        name VARCHAR(150),
        description TEXT,
        address VARCHAR(255),
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4. Products (Clothes base information)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        shop_id INT,
        category_id INT,
        name VARCHAR(200),
        description TEXT,
        base_price DECIMAL(10,2),
        status ENUM('active','inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
      )
    `);

    // 5. Product Variants (crucial for clothes: Size, Color, Material)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        size VARCHAR(20),
        color VARCHAR(50),
        material VARCHAR(50),
        price_adjustment DECIMAL(10,2) DEFAULT 0.00,
        quantity INT DEFAULT 0,
        sku VARCHAR(100) UNIQUE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // 6. Product Images
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        image_url VARCHAR(255),
        is_primary BOOLEAN DEFAULT false,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // 7. Orders
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        buyer_id INT,
        shop_id INT,
        total_price DECIMAL(10,2),
        shipping_fee DECIMAL(10,2),
        location_id INT,
        delivery_address TEXT,
        payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
        order_status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (shop_id) REFERENCES shops(id),
        FOREIGN KEY (location_id) REFERENCES locations(id)
      )
    `);

    // 8. Order Items (capturing variant bought)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id INT,
        variant_id INT,
        quantity INT,
        price DECIMAL(10,2),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (variant_id) REFERENCES product_variants(id)
      )
    `);

    console.log("Database tables initialized for Enterprise Debre Birhan e-commerce.");
  } catch (error) {
    console.error("Error initializing Database:", error);
  }
}

module.exports = initDb;
