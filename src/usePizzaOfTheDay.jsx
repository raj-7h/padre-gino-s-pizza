import { useState, useEffect, useDebugValue } from "react";

export const usePizzaOfTheDay = () => {
  const [pizzaOfTheDay, setPizzaOfTheDay] = useState(null);
  useDebugValue(pizzaOfTheDay ? `${pizzaOfTheDay.id} ` : "loading...");

  useEffect(() => {
    async function fetchPizzaOfTheDay() {
      const baseUrl =
        import.meta.env.MODE === "development"
          ? "" // relative path -> Vite proxy will handle
          : import.meta.env.VITE_BACKEND_URL; // production URL from .env
      const response = await fetch(`${baseUrl}/api/pizza-of-the-day`);
      const data = await response.json();
      setPizzaOfTheDay(data);
    }
    fetchPizzaOfTheDay();
  }, []);

  return pizzaOfTheDay;
};
