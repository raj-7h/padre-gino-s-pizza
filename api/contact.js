export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  console.log(
    `Contact Form Submission: Name: ${name}, Email: ${email}, Message: ${message}`,
  );
  res.status(200).json({ success: "Message received" });
}
