import { SolapiMessageService } from "solapi";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, text } = req.body;
  if (!to || !text) {
    return res.status(400).json({ error: "to and text are required" });
  }

  const API_KEY = process.env.SOLAPI_API_KEY;
  const API_SECRET = process.env.SOLAPI_API_SECRET;
  const SENDER = process.env.SOLAPI_SENDER_NUMBER;

  if (!API_KEY || !API_SECRET || !SENDER) {
    return res.status(500).json({ error: "Solapi env vars not configured" });
  }

  try {
    const messageService = new SolapiMessageService(API_KEY, API_SECRET);

    const result = await messageService.sendOne({
      to,
      from: SENDER,
      text,
    });

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Solapi SMS error:", error);
    return res.status(500).json({ error: "Failed to send SMS" });
  }
}
