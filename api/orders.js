import { getDb } from "./db.js";

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const orders = await db.all("SELECT order_id, date, time FROM orders");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
