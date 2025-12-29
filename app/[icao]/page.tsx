import type { Metadata } from 'next';
import AirportPage from './AirportPage';
import prisma from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ icao: string }> }): Promise<Metadata> {
  const icao = (await params).icao.toUpperCase();

  const airport = await prisma.airport.findFirst({ where: { icao } });

  return {
    title: `${airport.name} (${airport.icao})`,
    description: `AIP charts for ${airport.name} (${airport.icao}) airport. View SID, STAR, ILS, and airport diagrams.`,
    openGraph: {
      title: `${icao} Airport Charts`,
      description: `Updated AIP charts for ${airport.name} (${airport.icao}) airport.`,
      type: 'website',
    },
  };
}

export default async function Page({ params }: { params: Promise<{ icao: string }> }) {
  const icao = (await params).icao.toUpperCase();
  const charts = await prisma.chart.findMany({ where: { icao } });

  return <AirportPage charts={charts} />;
}
