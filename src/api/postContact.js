export default async function postContact(name, email, message) {
  import.meta.env.MODE === "development"
    ? ""
    : import.meta.env.VITE_BACKEND_URL;
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, message }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok. Send help.");
  }
  return response.json();
}
