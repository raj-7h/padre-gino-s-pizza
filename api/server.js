import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import "dotenv/config";

const db = new Database("./pizza.sqlite");
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL;

const server = fastify({ logger: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

server.register(fastifyCors, {
  origin: true,
});

server.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/public/",
  setHeaders: (res, path, stat) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  },
});

server.get("/api/pizzas", (req, res) => {
  const pizzas = db
    .prepare(
      "SELECT pizza_type_id, name, category, ingredients as description FROM pizza_types"
    )
    .all();

  const pizzaSizes = db
    .prepare("SELECT pizza_type_id as id, size, price FROM pizzas")
    .all();

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
      image: `${API_URL}/public/pizzas/${pizza.pizza_type_id}.webp`,
      sizes,
    };
  });

  res.send(responsePizzas);
});

server.get("/api/pizza-of-the-day", function getPizzaOfTheDay(req, res) {
  const pizzas = db
    .prepare(
      `SELECT 
      pizza_type_id as id, name, category, ingredients as description
    FROM 
      pizza_types`
    )
    .all();

  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const pizzaIndex = daysSinceEpoch % pizzas.length;
  const pizza = pizzas[pizzaIndex];

  const sizes = db
    .prepare(
      `SELECT
      size, price
    FROM
      pizzas
    WHERE
      pizza_type_id = ?`
    )
    .all(pizza.id);

  const sizeObj = sizes.reduce((acc, current) => {
    acc[current.size] = +current.price;
    return acc;
  }, {});

  const responsePizza = {
    id: pizza.id,
    name: pizza.name,
    category: pizza.category,
    description: pizza.description,
    image: `${API_URL}/public/pizzas/${pizza.id}.webp`,
    sizes: sizeObj,
  };

  res.send(responsePizza);
});

server.get("/api/orders", function getOrders(req, res) {
  const id = req.query.id;
  const orders = db.prepare("SELECT order_id, date, time FROM orders").all();

  res.send(orders);
});

server.get("/api/order", function getOrders(req, res) {
  const id = req.query.id;
  const order = db
    .prepare("SELECT order_id, date, time FROM orders WHERE order_id = ?")
    .get(id);
  const orderItemsRes = db
    .prepare(
      `SELECT 
      t.pizza_type_id as pizzaTypeId, t.name, t.category, t.ingredients as description, o.quantity, p.price, o.quantity * p.price as total, p.size
    FROM 
      order_details o
    JOIN
      pizzas p
    ON
      o.pizza_id = p.pizza_id
    JOIN
      pizza_types t
    ON
      p.pizza_type_id = t.pizza_type_id
    WHERE 
      order_id = ?`
    )
    .all(id);

  const orderItems = orderItemsRes.map((item) =>
    Object.assign({}, item, {
      image: `${API_URL}/public/pizzas/${item.pizzaTypeId}.webp`,
      quantity: +item.quantity,
      price: +item.price,
    })
  );

  const total = orderItems.reduce((acc, item) => acc + item.total, 0);

  res.send({
    order: Object.assign({ total }, order),
    orderItems,
  });
});

server.post("/api/order", function createOrder(req, res) {
  const { cart } = req.body;

  const now = new Date();
  // forgive me Date gods, for I have sinned
  const time = now.toLocaleTimeString("en-US", { hour12: false });
  const date = now.toISOString().split("T")[0];

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    res.status(400).send({ error: "Invalid order data" });
    return;
  }

  try {
    db.prepare("BEGIN TRANSACTION").run();

    const result = db
      .prepare("INSERT INTO orders (date, time) VALUES (?, ?)")
      .run(date, time);
    const orderId = result.lastInsertRowid;

    const mergedCart = cart.reduce((acc, item) => {
      const id = item.pizza.id;
      const size = item.size.toLowerCase();
      if (!id || !size) {
        throw new Error("Invalid item data");
      }
      const pizzaId = `${id}_${size}`;

      if (!acc[pizzaId]) {
        acc[pizzaId] = { pizzaId, quantity: 1 };
      } else {
        acc[pizzaId].quantity += 1;
      }

      return acc;
    }, {});

    for (const item of Object.values(mergedCart)) {
      const { pizzaId, quantity } = item;
      db.prepare(
        "INSERT INTO order_details (order_id, pizza_id, quantity) VALUES (?, ?, ?)"
      ).run(orderId, pizzaId, quantity);
    }

    db.prepare("COMMIT").run();

    res.send({ orderId });
  } catch (error) {
    req.log.error(error);
    db.prepare("ROLLBACK").run();
    res.status(500).send({ error: "Failed to create order" });
  }
});

server.get("/api/past-orders", async function getPastOrders(req, res) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const pastOrders = db
      .prepare(
        "SELECT order_id, date, time FROM orders ORDER BY order_id DESC LIMIT 10 OFFSET ?"
      )
      .all(offset);
    res.send(pastOrders);
  } catch (error) {
    req.log.error(error);
    res.status(500).send({ error: "Failed to fetch past orders" });
  }
});

server.get("/api/past-order/:order_id", function getPastOrder(req, res) {
  const orderId = req.params.order_id;

  try {
    const order = db
      .prepare("SELECT order_id, date, time FROM orders WHERE order_id = ?")
      .get(orderId);

    if (!order) {
      res.status(404).send({ error: "Order not found" });
      return;
    }

    const orderItems = db
      .prepare(
        `SELECT 
        t.pizza_type_id as pizzaTypeId, t.name, t.category, t.ingredients as description, o.quantity, p.price, o.quantity * p.price as total, p.size
      FROM 
        order_details o
      JOIN
        pizzas p
      ON
        o.pizza_id = p.pizza_id
      JOIN
        pizza_types t
      ON
        p.pizza_type_id = t.pizza_type_id
      WHERE 
        order_id = ?`
      )
      .all(orderId);

    const formattedOrderItems = orderItems.map((item) =>
      Object.assign({}, item, {
        image: `${API_URL}/public/pizzas/${item.pizzaTypeId}.webp`,
        quantity: +item.quantity,
        price: +item.price,
      })
    );

    const total = formattedOrderItems.reduce(
      (acc, item) => acc + item.total,
      0
    );

    res.send({
      order: Object.assign({ total }, order),
      orderItems: formattedOrderItems,
    });
  } catch (error) {
    req.log.error(error);
    res.status(500).send({ error: "Failed to fetch order" });
  }
});

server.post("/api/contact", async function contactForm(req, res) {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).send({ error: "All fields are required" });
    return;
  }

  req.log.info(`Contact Form Submission:
    Name: ${name}
    Email: ${email}
    Message: ${message}
  `);

  res.send({ success: "Message received" });
});

server.setNotFoundHandler((req, reply) => {
  reply.sendFile("index.html");
});

server.get("/", async (req, res) => {
  res.send({ message: "Backend is live 🚀" });
});
const HOST = "0.0.0.0";
const start = async () => {
  try {
    await server.listen({
      port: PORT,
      host: HOST,
    });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
