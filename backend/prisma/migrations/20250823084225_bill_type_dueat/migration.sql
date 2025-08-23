/*
  Warnings:

  - You are about to drop the column `dueAt` on the `Bill` table. All the data in the column will be lost.
  - Added the required column `billType` to the `Bill` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('academic', 'administrative', 'facilities', 'studentServices', 'activities', 'penalties');

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "dueAt",
ADD COLUMN     "billType" "BillType" NOT NULL;
