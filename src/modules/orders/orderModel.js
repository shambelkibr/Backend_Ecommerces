const pool = require("../../config/db");

async function getOrCreateCart(buyerId) {
  const [existing] = await pool.execute(
    "SELECT * FROM cart WHERE buyer_id = ?",
    [buyerId],
  );

  if (existing[0]) {
    return existing[0];
  }

  const [result] = await pool.execute(
    "INSERT INTO cart (buyer_id) VALUES (?)",
    [buyerId],
  );
  return { id: result.insertId, buyer_id: buyerId };
}

async function addToCart({ buyerId, productId, quantity }) {
  const cart = await getOrCreateCart(buyerId);

  const [existing] = await pool.execute(
    "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cart.id, productId],
  );

  if (existing[0]) {
    await pool.execute(
      "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
      [quantity, existing[0].id],
    );
  } else {
    await pool.execute(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
      [cart.id, productId, quantity],
    );
  }

  return getCartItems(buyerId);
}

async function getCartItems(buyerId) {
  const cart = await getOrCreateCart(buyerId);
  const [rows] = await pool.execute(
    `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.quantity AS stock, p.seller_id,
						(ci.quantity * p.price) AS line_total
		 FROM cart_items ci
		 JOIN products p ON p.id = ci.product_id
		 WHERE ci.cart_id = ?`,
    [cart.id],
  );

  const total = rows.reduce((sum, item) => sum + Number(item.line_total), 0);
  return { cartId: cart.id, items: rows, total };
}

async function removeFromCart({ buyerId, productId }) {
  const cart = await getOrCreateCart(buyerId);
  await pool.execute(
    "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cart.id, productId],
  );
  return getCartItems(buyerId);
}

async function clearCart(cartId, conn = pool) {
  await conn.execute("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
}

async function checkoutAndCreateOrder(buyerId) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [cartRows] = await conn.execute(
      "SELECT * FROM cart WHERE buyer_id = ?",
      [buyerId],
    );
    const cart = cartRows[0];

    if (!cart) {
      throw new Error("Cart not found");
    }

    const [items] = await conn.execute(
      `SELECT ci.product_id, ci.quantity, p.price, p.quantity AS stock, p.seller_id
			 FROM cart_items ci
			 JOIN products p ON p.id = ci.product_id
			 WHERE ci.cart_id = ?`,
      [cart.id],
    );

    if (!items.length) {
      throw new Error("Cart is empty");
    }

    for (const item of items) {
      if (item.quantity > item.stock) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }
    }

    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    const [orderResult] = await conn.execute(
      `INSERT INTO orders (buyer_id, total_price, payment_status, order_status)
			 VALUES (?, ?, 'pending', 'pending')`,
      [buyerId, total],
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
				 VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price],
      );

      await conn.execute(
        "UPDATE products SET quantity = quantity - ? WHERE id = ?",
        [item.quantity, item.product_id],
      );
    }

    await clearCart(cart.id, conn);
    await conn.commit();

    return getOrderById(orderId);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function getOrderById(orderId) {
  const [orders] = await pool.execute("SELECT * FROM orders WHERE id = ?", [
    orderId,
  ]);
  const order = orders[0];

  if (!order) {
    return null;
  }

  const [items] = await pool.execute(
    `SELECT oi.*, p.name AS product_name
		 FROM order_items oi
		 JOIN products p ON p.id = oi.product_id
		 WHERE oi.order_id = ?`,
    [orderId],
  );

  return { ...order, items };
}

async function listOrdersByBuyer(buyerId) {
  const [orders] = await pool.execute(
    "SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC",
    [buyerId],
  );
  return orders;
}

async function listOrdersBySeller(sellerId) {
  const [orders] = await pool.execute(
    `SELECT DISTINCT o.*
		 FROM orders o
		 JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
     WHERE p.seller_id = ?
		 ORDER BY o.created_at DESC`,
    [sellerId],
  );

  return orders;
}

async function updateOrderStatus(orderId, status) {
  await pool.execute("UPDATE orders SET order_status = ? WHERE id = ?", [
    status,
    orderId,
  ]);
  return getOrderById(orderId);
}

async function updateOrderPaymentStatus(orderId, paymentStatus) {
  await pool.execute("UPDATE orders SET payment_status = ? WHERE id = ?", [
    paymentStatus,
    orderId,
  ]);
  return getOrderById(orderId);
}

module.exports = {
  addToCart,
  getCartItems,
  removeFromCart,
  checkoutAndCreateOrder,
  getOrderById,
  listOrdersByBuyer,
  listOrdersBySeller,
  updateOrderStatus,
  updateOrderPaymentStatus,
};
