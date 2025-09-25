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
  return (
    PROGRAM_NAMES.find(() =>
      programName.includes('Computer Science')
        ? 'CS'
        : programName.includes('Information Technology')
          ? 'IT'
          : programName.includes('Data Science')
            ? 'DS'
            : 'CY',
    )?.substring(0, 2) || 'CS'
  );
}

export function createProgramData(
  programName: string,
): Prisma.ProgramCreateInput {
  return {
    programCode: getProgramCode(programName),
    name: programName,
    description: `Comprehensive program focusing on ${programName.toLowerCase().replace('bachelor of science in ', '')} principles and practices.`,
    yearDuration: 4,
  };
}

export function createMajorData(
  programId: string,
  programCode: string,
): Prisma.MajorCreateInput {
  const specialization = faker.helpers.arrayElement(MAJOR_SPECIALIZATIONS);

  return {
    program: { connect: { id: programId } },
    majorCode: `${programCode}-${specialization.substring(0, 3).toUpperCase()}`,
    name: `${specialization} Specialization`,
    description: `Specialization in ${specialization} covering advanced topics and practical applications.`,
  };
}

export function createCourseData(
  index: number,
  majorId?: string,
): Prisma.CourseCreateInput {
  const courseTitle =
    COURSE_TITLES[index % COURSE_TITLES.length] ||
    `${faker.helpers.arrayElement(COURSE_TOPICS)} ${faker.helpers.arrayElement(COURSE_SUBJECTS)}`;

  const dept =
    courseTitle
      .split(' ')
      .find((word) =>
        [
          'Programming',
          'Database',
          'Network',
          'Web',
          'Mobile',
          'Data',
        ].includes(word),
      )
      ?.substring(0, 3) || 'CSC';

  // Generate a unique course code using department, index, and a random component
  const randomSuffix = faker.string.alphanumeric(2).toUpperCase();
  const majorPrefix = majorId ? majorId.substring(0, 2) : '';
  const courseCode = `${dept.toUpperCase()}${100 + index}${majorPrefix}${randomSuffix}`;

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
