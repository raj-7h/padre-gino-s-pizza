export default async function getPastOrder(order) {
  try {
    if (!order) return null;
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const baseUrl =
      import.meta.env.MODE === "development"
        ? ""
        : import.meta.env.VITE_BACKEND_URL;
    const response = await fetch(`${baseUrl}/api/past-order/${order}`);
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
