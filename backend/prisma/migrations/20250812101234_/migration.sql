/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Program` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Program` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Program` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Program_code_key" ON "Program"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Program_name_key" ON "Program"("name");
