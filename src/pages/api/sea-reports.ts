import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const reports = await prisma.seaReport.findMany()
      res.status(200).json(reports)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to fetch sea reports' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
