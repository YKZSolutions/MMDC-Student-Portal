import { Course, CourseEnrollment, User } from '@prisma/client';
import { log, pickRandom } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createCourseEnrollmentData,
  createCourseSectionData,
  createEnrollmentPeriodData,
} from '../factories/enrollment.factory';
import { PrismaTransaction } from '../../../src/lib/prisma/prisma.extension';

export async function seedEnrollments(
  prisma: PrismaTransaction,
  courses: Course[],
  mentors: User[],
  students: User[],
) {
  log('Seeding enrollments...');

  // 1. Create Enrollment Periods
  const enrollmentPeriods = await Promise.all(
    Array.from({ length: seedConfig.ENROLLMENT_PERIODS }, (_, i) =>
      prisma.enrollmentPeriod.create({
        data: createEnrollmentPeriodData(
          2023 + Math.floor(i / 2),
          (i % 2) + 1,
          i === 0 ? 'active' : undefined,
        ),
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

  // 4. Create Course Enrollments (Students in Sections) - Alternative approach
  const courseEnrollments: CourseEnrollment[] = [];

  // Group sections by course offering
  const sectionsByOffering = new Map<string, typeof courseSections>();
  for (const section of courseSections) {
    if (!sectionsByOffering.has(section.courseOfferingId)) {
      sectionsByOffering.set(section.courseOfferingId, []);
    }
    sectionsByOffering.get(section.courseOfferingId)!.push(section);
  }

  // Track which students are enrolled in which offerings
  const studentOfferings = new Map<string, Set<string>>();
  students.forEach((student) => {
    studentOfferings.set(student.id, new Set());
  });

  // For each student, enroll them in random course offerings
  for (const student of students) {
    // Get available course offerings (ones the student isn't already enrolled in)
    const availableOfferings = courseOfferings.filter(
      (offering) => !studentOfferings.get(student.id)?.has(offering.id),
    );

    // Determine how many courses this student will take (1-3)
    const coursesToTake = Math.floor(Math.random() * 3) + 1;
    const selectedOfferings = availableOfferings
      .sort(() => 0.5 - Math.random())
      .slice(0, coursesToTake);

    for (const offering of selectedOfferings) {
      // Get sections for this offering
      const offeringSections = sectionsByOffering.get(offering.id) || [];
      if (offeringSections.length === 0) continue;

      // Pick a random section from this offering
      const section = pickRandom(offeringSections);

      try {
        const enrollment = await prisma.courseEnrollment.create({
          data: createCourseEnrollmentData(offering.id, section.id, student.id),
        });
        courseEnrollments.push(enrollment);

        // Mark student as enrolled in this offering
        studentOfferings.get(student.id)?.add(offering.id);
      } catch (error) {
        if (error.code === 'P2002') {
          // Duplicate enrollment, skip
          continue;
        }
        throw error;
      }
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
