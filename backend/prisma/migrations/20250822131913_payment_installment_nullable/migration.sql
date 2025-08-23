-- DropForeignKey
ALTER TABLE "BillPayment" DROP CONSTRAINT "BillPayment_installmentId_fkey";

-- AlterTable
ALTER TABLE "BillPayment" ALTER COLUMN "installmentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "BillInstallment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
