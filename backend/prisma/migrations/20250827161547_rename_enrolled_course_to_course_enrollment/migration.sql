/*
  Warnings:

  - You are about to drop the `EnrolledCourse` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."CourseEnrollmentStatus" AS ENUM ('enlisted', 'finalized', 'enrolled', 'completed', 'incomplete', 'dropped', 'failed');

-- DropForeignKey
ALTER TABLE "public"."EnrolledCourse" DROP CONSTRAINT "EnrolledCourse_courseOfferingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EnrolledCourse" DROP CONSTRAINT "EnrolledCourse_studentId_fkey";

-- DropTable
DROP TABLE "public"."EnrolledCourse";

-- DropEnum
DROP TYPE "public"."EnrolledCourseStatus";

-- CreateTable
CREATE TABLE "public"."CourseEnrollment" (
    "id" UUID NOT NULL,
    "courseOfferingId" UUID NOT NULL,
    "courseSectionId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "status" "public"."CourseEnrollmentStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "public"."CourseOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseSectionId_fkey" FOREIGN KEY ("courseSectionId") REFERENCES "public"."CourseSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
