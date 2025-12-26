-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ChartCategory" AS ENUM ('GND', 'APP', 'SID', 'STAR', 'ENR', 'VAC');

-- CreateTable
CREATE TABLE "Airport" (
    "icao" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Chart" (
    "id" TEXT NOT NULL,
    "icao" TEXT,
    "name" TEXT NOT NULL,
    "category" "ChartCategory",
    "url" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Airport_icao_key" ON "Airport"("icao");

-- CreateIndex
CREATE INDEX "Chart_icao_category_idx" ON "Chart"("icao", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Chart_icao_name_key" ON "Chart"("icao", "name");

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_icao_fkey" FOREIGN KEY ("icao") REFERENCES "Airport"("icao") ON DELETE SET NULL ON UPDATE CASCADE;

