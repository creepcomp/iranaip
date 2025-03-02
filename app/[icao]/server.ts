"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAirportCharts = async (icao: string) => {
    try {
        const airport = await prisma.airport.findUnique({
            where: { icao: icao },
            include: { charts: true },
        });

        if (!airport) {
            throw new Error(`Airport with icao "${icao}" not found.`);
        }

        return airport.charts;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to retrieve airport charts.');
    } finally {
        await prisma.$disconnect();
    }
};

export default getAirportCharts;