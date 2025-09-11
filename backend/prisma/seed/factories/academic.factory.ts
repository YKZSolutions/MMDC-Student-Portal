import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

export function createProgramData(): Prisma.ProgramCreateInput {
  const name = faker.company.name();
  return {
    programCode: name.substring(0, 4).toUpperCase(),
    name: `Bachelor of Science in ${name}`,
    description: faker.lorem.sentence(),
    yearDuration: 4,
  };
}

export function createMajorData(programId: string): Prisma.MajorCreateInput {
  const baseName = faker.person.jobArea();
  const uniqueSuffix = faker.string.alphanumeric(4).toUpperCase();
  const name = `${baseName} ${uniqueSuffix}`;
  
  return {
    program: { connect: { id: programId } },
    majorCode: `${baseName.substring(0, 3).toUpperCase()}-${faker.string.alphanumeric(3).toUpperCase()}`,
    name,
    description: faker.lorem.sentence(),
  };
}

export function createCourseData(index: number): Prisma.CourseCreateInput {
  const dept = faker.commerce.department().substring(0, 3).toUpperCase();
  // Generate a unique identifier for the course code
  const uniqueId = faker.string.alphanumeric(3).toUpperCase();
  return {
    courseCode: `${dept}${100 + index}-${uniqueId}`,
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    units: faker.number.int({ min: 1, max: 5 }),
    type: faker.helpers.arrayElement(['Lecture', 'Lab', 'Seminar']),
  };
}
