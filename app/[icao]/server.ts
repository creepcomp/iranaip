"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAirportCharts = async (icao: string) => {
    try {
        const lowerCaseIcao = icao.toLowerCase();

        const airport = await prisma.airport.findFirst({
            where: {
                icao: {
                    equals: lowerCaseIcao,
                    mode: "insensitive",
                },
            },
            include: { charts: true },
        });

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

export const updateChartName = async (chartId: string, newName: string) => {
    try {
        const updatedChart = await prisma.chart.update({
            where: { id: chartId },
            data: { name: newName },
        });

        return updatedChart;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to update chart name.");
    } finally {
        await prisma.$disconnect();
    }
};
