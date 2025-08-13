/*
  Warnings:

  - Added the required column `paymongoData` to the `BillPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BillPayment" ADD COLUMN     "paymongoData" JSONB NOT NULL;
