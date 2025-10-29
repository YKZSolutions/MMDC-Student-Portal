import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';
import {
  PROGRAM_NAMES,
  MAJOR_SPECIALIZATIONS,
  COURSE_TITLES,
  COURSE_SUBJECTS,
  COURSE_TOPICS,
} from '../constants/mockAcademics';

function getProgramCode(programName: string) {
  if (programName.includes('Computer Science')) return 'CS';
  if (programName.includes('Information Technology')) return 'IT';
  if (programName.includes('Data Science')) return 'DS';
  if (programName.includes('Cybersecurity')) return 'CY';
  return 'GEN';
}

function getMajorCode(major: string) {
  if (major.includes('Artificial Intelligence')) return 'AI';
  if (major.includes('Web Development')) return 'WEB';
  if (major.includes('Mobile Development')) return 'MOB';
  if (major.includes('Software Development')) return 'SD';
  if (major.includes('Data Analytics')) return 'DAT';
  if (major.includes('Network & CyberSecurity')) return 'CS';
  if (major.includes('Marketing Technology')) return 'MT';
  if (major.includes('Entrepreneurship Technology')) return 'ET';
  if (major.includes('Cloud Computing')) return 'CLOUD';
  if (major.includes('Database Management')) return 'DB';
  if (major.includes('Game Development')) return 'GAME';
  if (major.includes('UX/UI Design')) return 'UI';
  if (major.includes('DevOps')) return 'DEVOPS';
}

export function createProgramData(
  programName: string,
): Prisma.ProgramCreateManyInput {
  return {
    programCode: getProgramCode(programName),
    name: programName,
    description: `Comprehensive program focusing on ${programName.toLowerCase().replace('bachelor of science in ', '')} principles and practices.`,
    yearDuration: 4,
  };
}

export function createMajorData(
  specialization: string,
  programId: string,
  programCode: string,
  programName: string,
): Prisma.MajorCreateManyInput {
  return {
    programId,
    majorCode: `${programCode}-${getMajorCode(specialization)}`,
    name: `${programName} Specialization in ${specialization}`,
    description: `Specialization in ${specialization} covering advanced topics and practical applications.`,
  };
}

export function createCourseData(
  index: number,
  majorCode: string,
): Prisma.CourseCreateManyInput {
  const courseTitle =
    COURSE_TITLES[index % COURSE_TITLES.length] ||
    `${faker.helpers.arrayElement(COURSE_TOPICS)} ${faker.helpers.arrayElement(COURSE_SUBJECTS)}`;

  const programCode = majorCode.split('-')[0];
  const courseCode = `M0-${programCode}-${100 + index}`;

  return {
    courseCode,
    name: courseTitle,
    description: `This course covers fundamental concepts and practical applications of ${courseTitle.toLowerCase()}. Students will gain hands-on experience through projects and assignments.`,
    units: faker.helpers.arrayElement([3, 4, 5]),
    type: faker.helpers.arrayElement([
      'Lecture',
      'Lab',
      'Seminar',
      'Lecture/Lab',
    ]),
  };
}

export function createCurriculumData(
  majorId: string,
  majorName: string,
): Prisma.CurriculumCreateManyInput {
  return {
    majorId,
    name: `${majorName} Curriculum`,
    description: `Official curriculum for ${majorName}`,
  };
}

export function createCurriculumCourseData(
  curriculumId: string,
  courseId: string,
  order: number,
): Prisma.CurriculumCourseCreateManyInput {
  return {
    curriculumId,
    courseId,
    order,
    year: Math.floor(order / 5) + 1,
    semester: (order % 2) + 1,
  };
}
