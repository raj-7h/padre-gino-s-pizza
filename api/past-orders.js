import { getDb } from "./db.js";

export default async function handler(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * 20;
    const db = await getDb();
    const pastOrders = await db.all(
      "SELECT order_id, date, time FROM orders ORDER BY order_id DESC LIMIT 10 OFFSET ?",
      [offset],
    );
    res.status(200).json(pastOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
