export default async function getPastOrders(page) {
  const response = await fetch(
    `https://pizza-backend-xpbk.onrender.com/api/past-orders?lpage=${page}`,
  );
  const data = await response.json();
  return data;
}
