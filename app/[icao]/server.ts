"use server";

import prisma from "@/lib/prisma";

export const getCharts = async (icao: string) => {
  try {
    const lowerCaseIcao = icao.toLowerCase();

    const airport = await prisma.airport.findFirst({ where: { icao: { equals: lowerCaseIcao, mode: "insensitive" } }, include: { charts: true } });

    if (!airport) {
      throw new Error(`Airport with ICAO "${icao}" not found.`);
    }

    return airport.charts;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve airport charts.");
  } finally {
    await prisma.$disconnect();
  }
};
