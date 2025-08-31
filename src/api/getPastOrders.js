export default async function getPastOrders(page) {
  import.meta.env.MODE === "development"
    ? "" // use relative path → Vite proxy forwards to localhost
    : import.meta.env.VITE_BACKEND_URL; // production backend
  const response = await fetch(`${baseUrl}/api/past-orders?lpage=${page}`);
  const data = await response.json();
  return data;
}
