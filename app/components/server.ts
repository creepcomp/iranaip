"use server";

import prisma from "@/lib/prisma";

export async function findAirport(searchQuery: string) {
  try {
    const airports = await prisma.airport.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            icao: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    return airports;
  } catch (error) {
    console.error("Error finding airport:", error);
    throw new Error("Could not find airport");
  } finally {
    await prisma.$disconnect();
  }
};
