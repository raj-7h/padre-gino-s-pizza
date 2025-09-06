import { useState, useEffect, useDebugValue } from "react";
import Loading from "./Loading";

export const usePizzaOfTheDay = () => {
  const [pizzaOfTheDay, setPizzaOfTheDay] = useState(null);

  useEffect(() => {
    async function fetchPizzaOfTheDay() {
      const baseUrl =
        import.meta.env.MODE === "development"
          ? ""
          : import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/pizza-of-the-day`);
      const data = await response.json();
      setPizzaOfTheDay(data);
    }
    fetchPizzaOfTheDay();
  }, []);

  return pizzaOfTheDay;
};
