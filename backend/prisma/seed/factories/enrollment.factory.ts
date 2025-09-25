import { faker } from '@faker-js/faker';
import {
  CourseEnrollmentStatus,
  Days,
  EnrollmentStatus,
  Prisma,
} from '@prisma/client';

const SECTION_NAMES = ['A', 'B', 'C', 'D', 'E', 'F'];
const TIME_SLOTS = [
  { start: '08:00', end: '10:00' },
  { start: '10:00', end: '12:00' },
  { start: '13:00', end: '15:00' },
  { start: '15:00', end: '17:00' },
  { start: '18:00', end: '20:00' },
];

const DAY_COMBINATIONS = [
  [Days.monday, Days.wednesday],
  [Days.tuesday, Days.thursday],
  [Days.wednesday, Days.friday],
  [Days.monday, Days.wednesday, Days.friday],
  [Days.tuesday, Days.thursday],
];

export function createEnrollmentPeriodData(
  year: number,
  term: number,
  status: EnrollmentStatus = term === 1
    ? EnrollmentStatus.active
    : EnrollmentStatus.upcoming,
): Prisma.EnrollmentPeriodCreateInput {
  const startDate = new Date(year, (term - 1) * 6, 1);
  const endDate = new Date(year, term * 6 - 1, 30);

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
  const timeSlot = faker.helpers.arrayElement(TIME_SLOTS);
  const days = faker.helpers.arrayElement(DAY_COMBINATIONS);

  return {
    name: `Section ${SECTION_NAMES[index] || String.fromCharCode(65 + index)}`,
    maxSlot: faker.number.int({ min: 15, max: 30 }),
    startSched: timeSlot.start,
    endSched: timeSlot.end,
    days,
    courseOffering: { connect: { id: courseOfferingId } },
    mentor: { connect: { id: mentorId } },
  };
}

export function createCourseEnrollmentData(
  courseOfferingId: string,
  courseSectionId: string,
  studentId: string,
): Prisma.CourseEnrollmentCreateInput {
  const status = faker.helpers.arrayElement([
    CourseEnrollmentStatus.enrolled,
    CourseEnrollmentStatus.enrolled,
    CourseEnrollmentStatus.enrolled, // Higher weight for enrolled
    CourseEnrollmentStatus.completed,
    CourseEnrollmentStatus.incomplete,
  ]);

  const startedAt = faker.date.recent({ days: 60 });
  const completedAt =
    status === CourseEnrollmentStatus.completed
      ? faker.date.between({ from: startedAt, to: new Date() })
      : null;

  return {
    courseOffering: { connect: { id: courseOfferingId } },
    courseSection: { connect: { id: courseSectionId } },
    student: { connect: { id: studentId } },
    status,
    startedAt,
    completedAt,
  };
}
