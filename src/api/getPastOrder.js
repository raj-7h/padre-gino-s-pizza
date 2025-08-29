export default async function getPastOrder(order) {
  try {
    if (!order) return null;
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const response = await fetch(
      `https://pizza-backend-xpbk.onrender.com/api/past-order/${order}`,
    );
    if (!response.ok) {
      console.warn(`⚠️ API response with status ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("🚨 Failed to fetch past order:", error);
    return null;
  }
}
