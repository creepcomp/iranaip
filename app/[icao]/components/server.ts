'use server';

import { isAdmin } from "@/lib/isAdmin";
import prisma from "@/lib/prisma";

export async function renameChart(id: string, name: string) {
  if (!(await isAdmin())) return { success: false, message: "You must be an admin to perform this action." };
  const data = await prisma.chart.update({ where: { id }, data: { name } });
  return { success: true, data };
}
