/*
  Warnings:

  - You are about to drop the column `semester` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Program` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[majorCode]` on the table `Major` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[programCode]` on the table `Program` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CourseSection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `majorCode` to the `Major` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programCode` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearDuration` to the `Program` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('OVERVIEW', 'DISCUSSION', 'ASSIGNMENT', 'REFLECTION', 'URL', 'FILE');

-- CreateEnum
CREATE TYPE "public"."AssignmentMode" AS ENUM ('INDIVIDUAL', 'GROUP');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."AssignmentType" AS ENUM ('ASSIGNMENT', 'MILESTONE', 'QUIZ', 'TERMINAL_ASSESSMENT', 'PRESENTATION');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'LATE', 'GRADED');

-- DropForeignKey
ALTER TABLE "public"."CourseSection" DROP CONSTRAINT "CourseSection_mentorId_fkey";

-- DropIndex
DROP INDEX "public"."Program_code_key";

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "semester",
DROP COLUMN "year",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CourseSection" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "mentorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Major" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "majorCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Program" DROP COLUMN "code",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "programCode" TEXT NOT NULL,
ADD COLUMN     "yearDuration" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Curriculum" (
    "id" UUID NOT NULL,
    "majorId" UUID NOT NULL,
    "icon" TEXT,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CurriculumCourse" (
    "id" UUID NOT NULL,
    "curriculumId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CurriculumCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Module" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "courseId" UUID NOT NULL,
    "courseOfferingId" UUID,
    "publishedAt" TIMESTAMP(3),
    "toPublishAt" TIMESTAMP(3),
    "publishedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModuleSection" (
    "id" UUID NOT NULL,
    "moduleId" UUID NOT NULL,
    "parentSectionId" UUID,
    "title" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "toPublishAt" TIMESTAMP(3),
    "publishedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ModuleSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModuleContent" (
    "id" UUID NOT NULL,
    "moduleId" UUID NOT NULL,
    "moduleSectionId" UUID,
    "order" INTEGER NOT NULL DEFAULT 0,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(500),
    "content" JSONB NOT NULL,
    "contentType" "public"."ContentType" NOT NULL DEFAULT 'OVERVIEW',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "toPublishAt" TIMESTAMP(3),
    "publishedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ModuleContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assignment" (
    "id" UUID NOT NULL,
    "moduleContentId" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "rubric" JSONB NOT NULL,
    "type" "public"."AssignmentType" NOT NULL DEFAULT 'ASSIGNMENT',
    "mode" "public"."AssignmentMode" NOT NULL DEFAULT 'INDIVIDUAL',
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'OPEN',
    "dueDate" TIMESTAMP(3),
    "points" SMALLINT DEFAULT 100,
    "allowResubmission" BOOLEAN NOT NULL DEFAULT false,
    "maxAttempts" SMALLINT DEFAULT 1,
    "allowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
    "latePenalty" DECIMAL(5,2) DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentProgress" (
    "id" UUID NOT NULL,
    "completedAt" TIMESTAMP(3),
    "userId" UUID NOT NULL,
    "moduleContentId" UUID NOT NULL,
    "moduleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Submission" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "submission" TEXT,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "score" SMALLINT,
    "maxScore" SMALLINT,
    "grade" VARCHAR(10),
    "feedback" TEXT,
    "attemptNumber" SMALLINT,
    "lateDays" SMALLINT,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "moduleContentId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "gradedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubmissionAttachment" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "attachment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SubmissionAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumCourse_curriculumId_courseId_key" ON "public"."CurriculumCourse"("curriculumId", "courseId");

-- CreateIndex
CREATE INDEX "Module_courseId_idx" ON "public"."Module"("courseId");

-- CreateIndex
CREATE INDEX "ModuleSection_moduleId_idx" ON "public"."ModuleSection"("moduleId");

-- CreateIndex
CREATE INDEX "ModuleSection_parentSectionId_idx" ON "public"."ModuleSection"("parentSectionId");

-- CreateIndex
CREATE INDEX "ModuleSection_order_idx" ON "public"."ModuleSection"("order");

-- CreateIndex
CREATE INDEX "ModuleSection_publishedAt_idx" ON "public"."ModuleSection"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleSection_moduleId_order_key" ON "public"."ModuleSection"("moduleId", "order");

-- CreateIndex
CREATE INDEX "ModuleContent_moduleSectionId_idx" ON "public"."ModuleContent"("moduleSectionId");

-- CreateIndex
CREATE INDEX "ModuleContent_contentType_idx" ON "public"."ModuleContent"("contentType");

-- CreateIndex
CREATE INDEX "ModuleContent_order_idx" ON "public"."ModuleContent"("order");

-- CreateIndex
CREATE INDEX "ModuleContent_publishedAt_idx" ON "public"."ModuleContent"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleContent_moduleSectionId_order_key" ON "public"."ModuleContent"("moduleSectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_moduleContentId_key" ON "public"."Assignment"("moduleContentId");

-- CreateIndex
CREATE INDEX "Assignment_moduleContentId_idx" ON "public"."Assignment"("moduleContentId");

-- CreateIndex
CREATE INDEX "Assignment_status_idx" ON "public"."Assignment"("status");

-- CreateIndex
CREATE INDEX "Assignment_dueDate_idx" ON "public"."Assignment"("dueDate");

-- CreateIndex
CREATE INDEX "ContentProgress_userId_idx" ON "public"."ContentProgress"("userId");

-- CreateIndex
CREATE INDEX "ContentProgress_moduleContentId_moduleId_idx" ON "public"."ContentProgress"("moduleContentId", "moduleId");

-- CreateIndex
CREATE INDEX "ContentProgress_completedAt_idx" ON "public"."ContentProgress"("completedAt");

-- CreateIndex
CREATE INDEX "ContentProgress_moduleId_idx" ON "public"."ContentProgress"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentProgress_userId_moduleContentId_key" ON "public"."ContentProgress"("userId", "moduleContentId");

-- CreateIndex
CREATE INDEX "Submission_moduleContentId_idx" ON "public"."Submission"("moduleContentId");

-- CreateIndex
CREATE INDEX "Submission_studentId_idx" ON "public"."Submission"("studentId");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "public"."Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_submittedAt_idx" ON "public"."Submission"("submittedAt");

-- CreateIndex
CREATE INDEX "Submission_gradedAt_idx" ON "public"."Submission"("gradedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Major_majorCode_key" ON "public"."Major"("majorCode");

-- CreateIndex
CREATE UNIQUE INDEX "Program_programCode_key" ON "public"."Program"("programCode");

-- AddForeignKey
ALTER TABLE "public"."Curriculum" ADD CONSTRAINT "Curriculum_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "public"."Major"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CurriculumCourse" ADD CONSTRAINT "CurriculumCourse_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CurriculumCourse" ADD CONSTRAINT "CurriculumCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseSection" ADD CONSTRAINT "CourseSection_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "public"."CourseOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModuleSection" ADD CONSTRAINT "ModuleSection_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModuleSection" ADD CONSTRAINT "ModuleSection_parentSectionId_fkey" FOREIGN KEY ("parentSectionId") REFERENCES "public"."ModuleSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModuleSection" ADD CONSTRAINT "ModuleSection_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModuleContent" ADD CONSTRAINT "ModuleContent_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModuleContent" ADD CONSTRAINT "ModuleContent_moduleSectionId_fkey" FOREIGN KEY ("moduleSectionId") REFERENCES "public"."ModuleSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModuleContent" ADD CONSTRAINT "ModuleContent_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_moduleContentId_fkey" FOREIGN KEY ("moduleContentId") REFERENCES "public"."ModuleContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentProgress" ADD CONSTRAINT "ContentProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentProgress" ADD CONSTRAINT "ContentProgress_moduleContentId_fkey" FOREIGN KEY ("moduleContentId") REFERENCES "public"."ModuleContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentProgress" ADD CONSTRAINT "ContentProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_moduleContentId_fkey" FOREIGN KEY ("moduleContentId") REFERENCES "public"."ModuleContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_gradedBy_fkey" FOREIGN KEY ("gradedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubmissionAttachment" ADD CONSTRAINT "SubmissionAttachment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
