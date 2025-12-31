import type { Metadata } from 'next';
import AirportPage from './AirportPage';
import prisma from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ icao: string }> }): Promise<Metadata> {
  const icao = (await params).icao.toUpperCase();

  const airport = await prisma.airport.findFirst({ where: { icao } });

  const title = `${airport.name} (${airport.icao})`;
  const description = `Find the latest AIP charts, approach procedures, and airport information for ${airport.name} (${airport.icao}). Essential for pilots, flight planners, and aviation enthusiasts.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'website',
    },
  };
}

export default async function Page({ params }: { params: Promise<{ icao: string }> }) {
  const icao = (await params).icao.toUpperCase();
  const charts = await prisma.chart.findMany({ where: { icao } });

  return <AirportPage charts={charts} />;
}
