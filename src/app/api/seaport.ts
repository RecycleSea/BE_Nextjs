import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { title, description, location } = req.body;

      const newReport = await prisma.seaReport.create({
        data: {
          title,
          description,
          location,
        },
      });

      return res.status(201).json(newReport);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create report' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
