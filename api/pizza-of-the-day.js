import { getDb } from "./db.js";

export default async function handler(req, res) {
  try {
    const db = await getDb();

    // Fetch all pizza types
    const pizzas = await db.all(
      "SELECT pizza_type_id as id, name, category, ingredients as description FROM pizza_types",
    );

    if (!pizzas || pizzas.length === 0) {
      return res.status(404).json({ error: "No pizzas found" });
    }

    // Pick pizza of the day
    const daysSinceEpoch = Math.floor(Date.now() / 86400000);
    const pizzaIndex = daysSinceEpoch % pizzas.length;
    const pizza = pizzas[pizzaIndex];

    if (!pizza) {
      return res.status(404).json({ error: "Pizza not found for today" });
    }

    // Fetch sizes for the selected pizza
    const sizes = await db.all(
      "SELECT size, price FROM pizzas WHERE pizza_type_id = ?",
      [pizza.id],
    );

    const sizeObj = (sizes || []).reduce((acc, s) => {
      if (s.size && s.price != null) acc[s.size] = +s.price;
      return acc;
    }, {});

    // Send response
    res.status(200).json({
      id: pizza.id,
      name: pizza.name,
      category: pizza.category,
      description: pizza.description,
      image: `/pizzas/${pizza.id}.webp`, // adjust path if needed
      sizes: sizeObj,
    });
  } catch (err) {
    console.error("Error in /api/pizza-of-the-day:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
