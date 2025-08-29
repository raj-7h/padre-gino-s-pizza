import { getDb } from "./db.js";

export default async function handler(req, res) {
  const { order_id } = req.query;
  try {
    const db = await getDb();
    const order = await db.get(
      "SELECT order_id, date, time FROM orders WHERE order_id = ?",
      [order_id],
    );
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await db.all(
      `SELECT t.pizza_type_id as pizzaTypeId, t.name, t.category, t.ingredients as description,
              o.quantity, p.price, o.quantity * p.price as total, p.size
       FROM order_details o
       JOIN pizzas p ON o.pizza_id = p.pizza_id
       JOIN pizza_types t ON p.pizza_type_id = t.pizza_type_id
       WHERE order_id = ?`,
      [order_id],
    );

    const formatted = items.map((i) => ({
      ...i,
      image: `/pizzas/${i.pizzaTypeId}.webp`,
      quantity: +i.quantity,
      price: +i.price,
    }));

    const total = formatted.reduce((acc, i) => acc + i.total, 0);

    res.status(200).json({ order: { ...order, total }, orderItems: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
