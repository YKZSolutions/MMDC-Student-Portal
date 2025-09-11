import { Course, CourseEnrollment, PrismaClient, User } from '@prisma/client';
import { log, pickRandom } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createCourseEnrollmentData,
  createCourseSectionData,
  createEnrollmentPeriodData,
} from '../factories/enrollment.factory';

export async function seedEnrollments(
  prisma: PrismaClient,
  courses: Course[],
  mentors: User[],
  students: User[],
) {
  log('Seeding enrollments...');

  // 1. Create Enrollment Periods
  const enrollmentPeriods = await Promise.all(
    Array.from({ length: seedConfig.ENROLLMENT_PERIODS }, (_, i) =>
      prisma.enrollmentPeriod.create({
        data: createEnrollmentPeriodData(2023 + Math.floor(i / 2), (i % 2) + 1),
      }),
    ),
  );
  log(`-> Created ${enrollmentPeriods.length} enrollment periods.`);

  // 2. Create Course Offerings
  const courseOfferings = (
    await Promise.all(
      courses.map((course) =>
        prisma.courseOffering.create({
          data: {
            courseId: course.id,
            periodId: pickRandom(enrollmentPeriods).id,
          },
        }),
      ),
    )
  ).flat();
  log(`-> Created ${courseOfferings.length} course offerings.`);

  // 3. Create Course Sections
  const courseSections = (
    await Promise.all(
      courseOfferings.map((offering) =>
        Promise.all(
          Array.from({ length: seedConfig.SECTIONS_PER_OFFERING }, (_, i) =>
            prisma.courseSection.create({
              data: createCourseSectionData(
                offering.id,
                pickRandom(mentors).id,
                i,
              ),
            }),
          ),
        ),
      ),
    )
  ).flat();
  log(`-> Created ${courseSections.length} course sections.`);

  // 4. Create Course Enrollments (Students in Sections)
  const courseEnrollments: CourseEnrollment[] = [];
  for (const section of courseSections) {
    // Get a random subset of students to enroll
    const studentsToEnroll = students.filter(
      () => Math.random() < seedConfig.ENROLLMENT_CHANCE,
    );
    for (const student of studentsToEnroll.slice(
      0,
      seedConfig.MAX_STUDENTS_PER_SECTION,
    )) {
      const enrollment = await prisma.courseEnrollment.create({
        data: createCourseEnrollmentData(
          section.courseOfferingId,
          section.id,
          student.id,
        ),
      });
      courseEnrollments.push(enrollment);
    }
  }
  log(`-> Created ${courseEnrollments.length} course enrollments.`);

  return {
    enrollmentPeriods,
    courseOfferings,
    courseSections,
    courseEnrollments,
  };
}
