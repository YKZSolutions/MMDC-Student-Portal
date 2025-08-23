/*
  Warnings:

  - You are about to drop the column `amountToPay` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `billType` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `issuedAt` on the `Bill` table. All the data in the column will be lost.
  - Added the required column `paymentScheme` to the `Bill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Bill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `installmentId` to the `BillPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `installmentOrder` to the `BillPayment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentScheme" AS ENUM ('full', 'installment1', 'installment2');

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "amountToPay",
DROP COLUMN "billType",
DROP COLUMN "issuedAt",
ADD COLUMN     "paymentScheme" "PaymentScheme" NOT NULL,
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "BillPayment" ADD COLUMN     "installmentId" UUID NOT NULL,
ADD COLUMN     "installmentOrder" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "BillType";

-- CreateTable
CREATE TABLE "BillInstallment" (
    "id" UUID NOT NULL,
    "billId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "installmentOrder" INTEGER NOT NULL,
    "amountToPay" DECIMAL(10,2) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BillInstallment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BillInstallment" ADD CONSTRAINT "BillInstallment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "BillInstallment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
