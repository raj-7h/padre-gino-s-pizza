import { getDb } from "./db.js";

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const db = await getDb();
    const order = await db.get(
      "SELECT order_id, date, time FROM orders WHERE order_id = ?",
      [id],
    );
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderItemsRes = await db.all(
      `SELECT t.pizza_type_id as pizzaTypeId, t.name, t.category, t.ingredients as description,
              o.quantity, p.price, o.quantity * p.price as total, p.size
       FROM order_details o
       JOIN pizzas p ON o.pizza_id = p.pizza_id
       JOIN pizza_types t ON p.pizza_type_id = t.pizza_type_id
       WHERE order_id = ?`,
      [id],
    );

    const orderItems = orderItemsRes.map((item) => ({
      ...item,
      image: `/pizzas/${item.pizzaTypeId}.webp`,
      quantity: +item.quantity,
      price: +item.price,
    }));

    const total = orderItems.reduce((acc, item) => acc + item.total, 0);

    res.status(200).json({ order: { ...order, total }, orderItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
