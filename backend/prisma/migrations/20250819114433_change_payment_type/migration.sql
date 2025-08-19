/*
  Warnings:

  - Changed the type of `paymentType` on the `BillPayment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "BillPayment" DROP COLUMN "paymentType",
ADD COLUMN     "paymentType" "PaymentType" NOT NULL;
