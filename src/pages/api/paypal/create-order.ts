import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await axios.post(`${backend}/paypal/create-order`, req.body);
    res.status(200).json(response.data);
  } catch (err: any) {
    console.error("Proxy error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
}
