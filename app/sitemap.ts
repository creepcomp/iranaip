import prisma from '@/lib/prisma'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.SITE_URL || 'https://example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const airports = await prisma.airport.findMany()

  return airports.map((airport) => ({
    url: `${SITE_URL}/${airport.icao}`,
  }))
}