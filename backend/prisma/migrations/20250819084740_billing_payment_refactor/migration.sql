/*
  Warnings:

  - You are about to drop the column `outstandingAmount` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `receiptedAmount` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `receivableAmount` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Bill` table. All the data in the column will be lost.
  - The `invoiceId` column on the `Bill` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `amountToPay` to the `Bill` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `billType` on the `Bill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('full', 'installment');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('card', 'maya', 'gcash', 'manual');

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "outstandingAmount",
DROP COLUMN "receiptedAmount",
DROP COLUMN "receivableAmount",
DROP COLUMN "status",
ADD COLUMN     "amountToPay" DECIMAL(10,2) NOT NULL,
DROP COLUMN "invoiceId",
ADD COLUMN     "invoiceId" SERIAL NOT NULL,
DROP COLUMN "billType",
ADD COLUMN     "billType" "BillType" NOT NULL;

-- DropEnum
DROP TYPE "BillStatus";
