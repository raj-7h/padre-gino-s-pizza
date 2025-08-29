import { getDb } from "./db.js";

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const pizzas = await db.all(
      "SELECT pizza_type_id, name, category, ingredients as description FROM pizza_types",
    );
    const pizzaSizes = await db.all(
      "SELECT pizza_type_id as id, size, price FROM pizzas",
    );

    const responsePizzas = pizzas.map((pizza) => {
      const sizes = pizzaSizes.reduce((acc, current) => {
        if (current.id === pizza.pizza_type_id) {
          acc[current.size] = +current.price;
        }
        return acc;
      }, {});
      return {
        id: pizza.pizza_type_id,
        name: pizza.name,
        category: pizza.category,
        description: pizza.description,
        image: `/pizzas/${pizza.pizza_type_id}.webp`,
        sizes,
      };
    });

    res.status(200).json(responsePizzas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
