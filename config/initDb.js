const pool = require("./db");

async function initDb() {
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

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS seller_licenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seller_id INT,
      license_file VARCHAR(255),
      status ENUM('pending','approved','rejected') DEFAULT 'pending',
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seller_id INT,
      category_id INT,
      name VARCHAR(200),
      description TEXT,
      price DECIMAL(10,2),
      quantity INT,
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      buyer_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cart_id INT,
      product_id INT,
      quantity INT,
      FOREIGN KEY (cart_id) REFERENCES cart(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      buyer_id INT,
      total_price DECIMAL(10,2),
      payment_status ENUM('pending','paid') DEFAULT 'pending',
      order_status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      product_id INT,
      quantity INT,
      price DECIMAL(10,2),
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      payment_method VARCHAR(50),
      transaction_id VARCHAR(255),
      payment_status ENUM('pending','success','failed'),
      paid_at TIMESTAMP NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);
}

module.exports = initDb;
