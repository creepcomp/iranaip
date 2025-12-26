"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { Airport, Prisma } from "@/prisma/generated/client";

const airportSchema = z.object({
  icao: z.string().max(4, "ICAO code must be at most 4 characters"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
});

export async function getAirports(page: number, pageSize: number, searchQuery?: string) {
  const where = searchQuery
    ? {
        OR: [
          { icao: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
          { name: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  const data = await prisma.airport.findMany({
    where,
    skip: page * pageSize,
    take: pageSize,
  });

  const total = await prisma.airport.count({ where });

  return { data, total };
}

export async function getAirport(icao: string) {
  return prisma.airport.findUnique({ where: { icao } });
}

export async function upsertAirport(data: Airport) {
  const parsed = airportSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const validData = parsed.data;

  try {
    const airport = await prisma.airport.upsert({
      where: { icao: validData.icao },
      create: validData,
      update: validData,
    });

    return { success: true, data: airport };
  } catch (err) {
    console.error(err);
    return { success: false, errors: { general: ["Failed to upsert airport"] } };
  }
}

export async function deleteAirport(icao: string) {
  try {
    await prisma.airport.delete({ where: { icao } });
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, errors: { general: ["Failed to delete airport"] } };
  }
}
