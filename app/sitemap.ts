import prisma from '@/lib/prisma'
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const airports = await prisma.airport.findMany();

  return airports.map((airport) => ({ url: `${SITE_URL}/${airport.icao}` }));
}
