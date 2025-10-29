import {
  Course,
  CourseEnrollment,
  CourseOffering,
  CourseSection,
  EnrollmentPeriod,
  User,
  Prisma,
} from '@prisma/client';
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

  // 1. Pre-calculate enrollment periods data for batch creation
  const enrollmentPeriodsToCreate: Prisma.EnrollmentPeriodCreateManyInput[] = [];
  for (let i = 0; i < seedConfig.ENROLLMENT_PERIODS; i++) {
    enrollmentPeriodsToCreate.push(createEnrollmentPeriodData(
      2023 + Math.floor(i / 2),
      (i % 2) + 1,
      i === 0 ? 'active' : undefined,
    ));
  }

  // Batch create enrollment periods
  if (enrollmentPeriodsToCreate.length > 0) {
    await prisma.enrollmentPeriod.createMany({
      data: enrollmentPeriodsToCreate,
    });
  }

  // Fetch created enrollment periods
  const enrollmentPeriods = await prisma.enrollmentPeriod.findMany({
    orderBy: [{ startYear: 'asc' }, { term: 'asc' }],
  });
  log(`-> Created ${enrollmentPeriods.length} enrollment periods.`);

  // 2. Pre-calculate course offerings data for batch creation
  const courseOfferingsToCreate: Prisma.CourseOfferingCreateManyInput[] = [];
  for (const course of courses) {
    courseOfferingsToCreate.push({
      courseId: course.id,
      periodId: pickRandom(enrollmentPeriods).id,
    });
  }

  // Batch create course offerings
  if (courseOfferingsToCreate.length > 0) {
    await prisma.courseOffering.createMany({
      data: courseOfferingsToCreate,
    });
  }

  // Fetch created course offerings
  const courseOfferings = await prisma.courseOffering.findMany({
    where: {
      courseId: {
        in: courses.map(c => c.id),
      },
    },
    include: {
      course: true,
      enrollmentPeriod: true,
    },
  });
  log(`-> Created ${courseOfferings.length} course offerings.`);

  // 3. Pre-calculate course sections data for batch creation
  const courseSectionsToCreate: Prisma.CourseSectionCreateManyInput[] = [];
  let globalSectionIndex = 0;

  for (const offering of courseOfferings) {
    for (let i = 0; i < seedConfig.SECTIONS_PER_OFFERING; i++) {
      // Ensure unique mentor/schedule combinations by distributing mentors and using systematic scheduling
      const mentorIndex = globalSectionIndex % mentors.length;
      const mentor = mentors[mentorIndex];

      courseSectionsToCreate.push(createCourseSectionData(
        offering.id,
        mentor.id,
        globalSectionIndex,
      ));
      globalSectionIndex++;
    }
  }

  // Batch create course sections
  if (courseSectionsToCreate.length > 0) {
    await prisma.courseSection.createMany({
      data: courseSectionsToCreate,
    });
  }

  // Fetch created course sections
  const courseSections = await prisma.courseSection.findMany({
    where: {
      courseOfferingId: {
        in: courseOfferings.map(o => o.id),
      },
    },
    include: {
      courseOffering: true,
      mentor: true,
    },
  });
  log(`-> Created ${courseSections.length} course sections.`);

  // 4. Pre-calculate course enrollments data for batch creation
  const courseEnrollmentsToCreate: Prisma.CourseEnrollmentCreateManyInput[] = [];

  // Group sections by course offering for easier access
  const sectionsByOffering = new Map<string, CourseSection[]>();
  for (const section of courseSections) {
    if (!sectionsByOffering.has(section.courseOfferingId)) {
      sectionsByOffering.set(section.courseOfferingId, []);
    }
    sectionsByOffering.get(section.courseOfferingId)!.push(section);
  }

  // Track which students are enrolled in which offerings to avoid duplicates
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
      .slice(0, Math.min(coursesToTake, availableOfferings.length));

    for (const offering of selectedOfferings) {
      // Get sections for this offering
      const offeringSections = sectionsByOffering.get(offering.id) || [];
      if (offeringSections.length === 0) continue;

      // Pick a random section from this offering
      const section = pickRandom(offeringSections);

      // Add enrollment data
      courseEnrollmentsToCreate.push(createCourseEnrollmentData(
        offering.id,
        section.id,
        student.id,
      ));

      // Mark student as enrolled in this offering
      studentOfferings.get(student.id)?.add(offering.id);
    }
  }

  // Batch create course enrollments
  if (courseEnrollmentsToCreate.length > 0) {
    await prisma.courseEnrollment.createMany({
      data: courseEnrollmentsToCreate,
    });
  }

  // Fetch created course enrollments
  const courseEnrollments = await prisma.courseEnrollment.findMany({
    where: {
      courseOfferingId: {
        in: courseOfferings.map(o => o.id),
      },
    },
    include: {
      courseOffering: true,
      courseSection: true,
      student: true,
    },
  });
  log(`-> Created ${courseEnrollments.length} course enrollments.`);

  return {
    enrollmentPeriods,
    courseOfferings,
    courseSections,
    courseEnrollments,
  };
}
