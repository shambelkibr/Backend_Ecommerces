require('dotenv').config();
const pool = require('./db');
const initDb = require('./initDb');

async function forceInit() {
  console.log("Dropping old tables safely...");
  await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
  
  await pool.query('DROP TABLE IF EXISTS cart_items, carts, order_items, orders, product_images, product_variants, products, shops, seller_licenses, locations, users;');
  
  await pool.query('SET FOREIGN_KEY_CHECKS = 1;');
  
  await initDb();
}

async function seed() {
  try {
    await forceInit();

    console.log('Seeding initial Debre Birhan clothing data...');

    const [seller] = await pool.execute(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Abebe Local Weaver', 'abebe@liyu.com', '$2b$10$xyz', 'seller']
    );
    const sellerId = seller.insertId;

    const [shop] = await pool.execute(
      `INSERT INTO shops (seller_id, name, description, address, status) VALUES (?, ?, ?, ?, ?)`,
      [sellerId, 'Abebe Traditional Clothes', 'Best Bernos in Debre Birhan', 'Kebele 02, Piazza', 'approved']
    );
    const shopId = shop.insertId;

    const products = [
      { cat: 1, name: 'Debre Birhan Thick Bernos', desc: 'Hand-woven traditional Ethiopian winter cloak.', price: 2500, img: 'https://images.unsplash.com/photo-1544022613-e87ca75a3c46?w=500&q=80' },
      { cat: 2, name: 'Shemma Dress with Tilet', desc: 'Elegant cultural wear directly from local weavers.', price: 4200, img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80' },
      { cat: 1, name: 'Modern Wool Coat', desc: 'Stay warm in style with locally manufactured coats.', price: 6500, img: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&q=80' }
    ];

    for (const p of products) {
      const [prodRes] = await pool.execute(
        `INSERT INTO products (shop_id, category_id, name, description, base_price, status) VALUES (?, ?, ?, ?, ?, 'active')`,
        [shopId, p.cat, p.name, p.desc, p.price]
      );
      const pId = prodRes.insertId;

      await pool.execute(
        `INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, true)`,
        [pId, p.img]
      );

      const colors = ['White', 'Black'];
      const sizes = ['M', 'L'];
      
      for (const size of sizes) {
        for (const color of colors) {
           await pool.execute(
             `INSERT INTO product_variants (product_id, size, color, material, price_adjustment, quantity, sku) VALUES (?, ?, ?, ?, ?, ?, ?)`,
             [pId, size, color, 'Cotton/Wool', 0, 10, `SKU-${pId}-${size}-${color}`]
           );
        }
      }
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
