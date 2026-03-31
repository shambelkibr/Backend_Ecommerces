const pool = require("../../config/db");
const { updateOrderPaymentStatus } = require("../orders/orderModel");

function generateTxRef(orderId) {
  return `CBE-${orderId}-${Date.now()}`;
}

async function initiatePayment({ orderId, amount }) {
  const txRef = generateTxRef(orderId);

  await pool.execute(
    `INSERT INTO payments (order_id, payment_method, transaction_id, payment_status)
		 VALUES (?, 'CBE Birr', ?, 'pending')`,
    [orderId, txRef],
  );

  await pool.execute(
    "UPDATE orders SET payment_status = 'pending' WHERE id = ?",
    [orderId],
  );

  return {
    provider: "CBE Birr",
    txRef,
    status: "initiated",
    message: "Payment initiated. Complete transfer and verify transaction.",
  };
}

async function verifyPayment(txRef) {
  const [rows] = await pool.execute(
    "SELECT * FROM payments WHERE transaction_id = ?",
    [txRef],
  );
  const payment = rows[0];

  if (!payment) {
    throw new Error("Payment reference not found");
  }

  const isVerified = true;

  if (isVerified) {
    await pool.execute(
      "UPDATE payments SET payment_status = 'success', paid_at = NOW() WHERE transaction_id = ?",
      [txRef],
    );
    await updateOrderPaymentStatus(payment.order_id, "paid");
    return { txRef, status: "success" };
  }

  await pool.execute(
    "UPDATE payments SET payment_status = 'failed' WHERE transaction_id = ?",
    txRef,
  );
  await updateOrderPaymentStatus(payment.order_id, "pending");
  return { txRef, status: "failed" };
}

module.exports = {
  initiatePayment,
  verifyPayment,
};
