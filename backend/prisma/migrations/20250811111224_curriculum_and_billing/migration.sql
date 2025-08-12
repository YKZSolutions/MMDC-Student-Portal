/*
  Warnings:

  - You are about to drop the column `employee_number` on the `StaffDetails` table. All the data in the column will be lost.
  - You are about to drop the column `other_details` on the `StaffDetails` table. All the data in the column will be lost.
  - You are about to drop the column `admission_date` on the `StudentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `other_details` on the `StudentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `student_number` on the `StudentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `student_type` on the `StudentDetails` table. All the data in the column will be lost.
  - Added the required column `employeeNumber` to the `StaffDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otherDetails` to the `StaffDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissionDate` to the `StudentDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otherDetails` to the `StudentDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentNumber` to the `StudentDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentType` to the `StudentDetails` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('paid', 'unpaid', 'overpaid');

-- DropIndex
DROP INDEX "Notification_userId_key";

-- AlterTable
ALTER TABLE "StaffDetails" DROP COLUMN "employee_number",
DROP COLUMN "other_details",
ADD COLUMN     "employeeNumber" INTEGER NOT NULL,
ADD COLUMN     "otherDetails" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "StudentDetails" DROP COLUMN "admission_date",
DROP COLUMN "other_details",
DROP COLUMN "student_number",
DROP COLUMN "student_type",
ADD COLUMN     "admissionDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "otherDetails" JSONB NOT NULL,
ADD COLUMN     "studentNumber" INTEGER NOT NULL,
ADD COLUMN     "studentType" "StudentType" NOT NULL;

-- CreateTable
CREATE TABLE "Program" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Major" (
    "id" UUID NOT NULL,
    "programId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Major_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" UUID NOT NULL,
    "courseCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "units" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "invoiceId" TEXT NOT NULL,
    "payerName" TEXT NOT NULL,
    "payerEmail" TEXT NOT NULL,
    "billType" TEXT NOT NULL,
    "status" "BillStatus" NOT NULL,
    "receivableAmount" DECIMAL(10,2) NOT NULL,
    "receiptedAmount" DECIMAL(10,2) NOT NULL,
    "outstandingAmount" DECIMAL(10,2) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "costBreakdown" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillPayment" (
    "id" UUID NOT NULL,
    "billId" UUID NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "paymentType" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BillPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CourseToMajor" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CourseToMajor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CoursePrereq" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CoursePrereq_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CourseCoreq" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CourseCoreq_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseToMajor_B_index" ON "_CourseToMajor"("B");

-- CreateIndex
CREATE INDEX "_CoursePrereq_B_index" ON "_CoursePrereq"("B");

-- CreateIndex
CREATE INDEX "_CourseCoreq_B_index" ON "_CourseCoreq"("B");

-- AddForeignKey
ALTER TABLE "Major" ADD CONSTRAINT "Major_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToMajor" ADD CONSTRAINT "_CourseToMajor_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToMajor" ADD CONSTRAINT "_CourseToMajor_B_fkey" FOREIGN KEY ("B") REFERENCES "Major"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePrereq" ADD CONSTRAINT "_CoursePrereq_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePrereq" ADD CONSTRAINT "_CoursePrereq_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseCoreq" ADD CONSTRAINT "_CourseCoreq_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseCoreq" ADD CONSTRAINT "_CourseCoreq_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
