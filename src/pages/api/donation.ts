import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/database";
import { z } from "zod";

const donationSchema = z.object({
  phone: z.string().min(10),
  amount: z.number().positive(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Tangani preflight CORS (OPTIONS request)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  // Tangani hanya method POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Set header CORS juga untuk response POST
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    const parsed = donationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { phone, amount } = parsed.data;

    // Simulasi URL redirect (misal ke payment gateway)
    const redirectUrl = `https://example.com/thank-you?amount=${amount}`;

    // Simpan donasi ke database
    const donation = await prisma.donation.create({
      data: {
        phone,
        amount,
        status: "PENDING", // default status
        redirect_url: redirectUrl,
      },
    });

    return res.status(200).json({
      message: "Donation created",
      transaction: {
        id: donation.id,
        redirect_url: redirectUrl,
      },
    });
  } catch (error) {
    console.error("Donation error:", error);
    return res.status(500).json({ message: "Failed to process donation" });
  }
}
