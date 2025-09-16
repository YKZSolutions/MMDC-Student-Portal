import { faker } from '@faker-js/faker';
import { CourseEnrollmentStatus, Days, EnrollmentStatus, Prisma, } from '@prisma/client';
import { pickRandomEnum } from '../utils/helpers';

export function createEnrollmentPeriodData(
  year: number,
  term: number,
  status: EnrollmentStatus = pickRandomEnum(EnrollmentStatus),
): Prisma.EnrollmentPeriodCreateInput {
  const startDate = new Date(year, (term - 1) * 6); // Simple date logic
  const endDate = new Date(year, term * 6 - 1);
  return {
    startYear: year,
    endYear: year,
    term,
    startDate,
    endDate,
    status,
  };
}

export function createCourseSectionData(
  courseOfferingId: string,
  mentorId: string,
  index: number,
): Prisma.CourseSectionCreateInput {
  return {
    name: `Section ${String.fromCharCode(65 + index)}`, // A, B, C...
    maxSlot: 20,
    startSched: '09:00',
    endSched: '11:00',
    days: faker.helpers.arrayElements(Object.values(Days), {
      min: 1,
      max: 3,
    }),
    courseOffering: { connect: { id: courseOfferingId } },
    user: { connect: { id: mentorId } },
  };
}

export function createCourseEnrollmentData(
  courseOfferingId: string,
  courseSectionId: string,
  studentId: string,
): Prisma.CourseEnrollmentCreateInput {
  return {
    courseOffering: { connect: { id: courseOfferingId } },
    courseSection: { connect: { id: courseSectionId } },
    user: { connect: { id: studentId } },
    status: pickRandomEnum(CourseEnrollmentStatus),
    startedAt: faker.date.recent(),
    completedAt:
      Math.random() > 0.5 ? faker.date.future({ refDate: new Date() }) : null,
  };
}
