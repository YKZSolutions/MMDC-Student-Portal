/*
  Warnings:

  - Added the required column `dateJoined` to the `UserDetails` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StudentType" AS ENUM ('new', 'regular', 'irregular', 'transfer', 'returnee', 'graduate', 'special');

-- AlterTable
ALTER TABLE "UserDetails" ADD COLUMN     "dateJoined" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "StudentDetails" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "student_number" INTEGER NOT NULL,
    "student_type" "StudentType" NOT NULL,
    "admission_date" TIMESTAMP(3) NOT NULL,
    "other_details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StudentDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffDetails" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "employee_number" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "other_details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StaffDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentDetails_userId_key" ON "StudentDetails"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffDetails_userId_key" ON "StaffDetails"("userId");

-- AddForeignKey
ALTER TABLE "StudentDetails" ADD CONSTRAINT "StudentDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffDetails" ADD CONSTRAINT "StaffDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
