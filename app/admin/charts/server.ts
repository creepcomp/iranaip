"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { Chart, Prisma } from "@/prisma/generated/client";

const chartSchema = z.object({
  id: z.string().optional(),
  icao: z.string().max(4, "ICAO code must be at most 4 characters").optional(),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  category: z.enum(["GND", "APP", "SID", "STAR", "ENR", "VAC"]).optional(),
  url: z.string().min(1, "URL is required"),
  lastUpdated: z.date(),
});

export async function getCharts(page: number, pageSize: number, searchQuery?: string) {
  const where = searchQuery
    ? {
      OR: [
        { icao: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
        { name: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
        { url: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
      ],
    }
    : {};

  const data = await prisma.chart.findMany({
    where,
    skip: page * pageSize,
    take: pageSize,
  });

  const total = await prisma.chart.count({ where });

  return { data, total };
}

export async function getChart(id: string) {
  return prisma.chart.findUnique({ where: { id } });
}

export async function upsertChart(data: Chart) {
  const parsed = chartSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const validData = parsed.data;

  try {
    const chart = await prisma.chart.upsert({
      where: { id: validData.id || "" },
      create: validData,
      update: validData,
    });

    return { success: true, data: chart };
  } catch (err) {
    console.error(err);
    return { success: false, errors: { general: ["Failed to upsert chart"] } };
  }
}

export async function deleteChart(id: string) {
  try {
    await prisma.chart.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, errors: { general: ["Failed to delete chart"] } };
  }
}
