/*
  Warnings:

  - A unique constraint covering the columns `[authUid]` on the table `UserAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "StaffDetails" DROP CONSTRAINT "StaffDetails_userId_fkey";

-- DropForeignKey
ALTER TABLE "StudentDetails" DROP CONSTRAINT "StudentDetails_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserAccount" DROP CONSTRAINT "UserAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserDetails" DROP CONSTRAINT "UserDetails_userId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_authUid_key" ON "UserAccount"("authUid");

-- AddForeignKey
ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDetails" ADD CONSTRAINT "UserDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDetails" ADD CONSTRAINT "StudentDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffDetails" ADD CONSTRAINT "StaffDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
