import { faker } from '@faker-js/faker';
import { Prisma, Role, StudentType } from '@prisma/client';
import { pickRandomEnum } from '../utils/helpers';

const STAFF_POSITIONS = {
  admin: ['System Administrator', 'Database Administrator', 'IT Manager'],
  mentor: [
    'Professor',
    'Assistant Professor',
    'Lecturer',
    'Senior Lecturer',
    'Adjunct Professor',
  ],
};

const STUDENT_TYPES = Object.values(StudentType);

export function createUserData(
  role: Role,
  index: number,
): Prisma.UserCreateManyInput {
  const gender = faker.person.sexType();
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName(gender);

  return {
    firstName,
    middleName: Math.random() > 0.7 ? faker.person.firstName() : undefined,
    lastName,
    role,
  };
}
export function createUserAccountData(
  userId: string,
  index: number,
): Prisma.UserAccountCreateManyInput {
  const gender = faker.person.sexType();
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName(gender);

  return {
    userId,
    authUid: faker.string.uuid(),
    email: faker.internet.email({ firstName, lastName }),
  };
}

export function createUserDetailsData(
  userId: string,
  index: number,
): Prisma.UserDetailsCreateManyInput {
  const gender = faker.person.sexType();

  return {
    userId,
    dateJoined: faker.date.past({ years: 2 }),
    dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
    gender,
  };
}

export function createStudentDetailsData(
  userId: string,
  index: number,
): Prisma.StudentDetailsCreateManyInput {
  return {
    userId,
    studentNumber: `20${faker.number.int({ min: 20, max: 24 })}${faker.string.numeric(5)}`,
    studentType: pickRandomEnum(StudentType),
    admissionDate: faker.date.past({ years: 1 }),
    otherDetails: {
      address: faker.location.streetAddress(),
      contact: faker.phone.number(),
      emergencyContact: {
        name: faker.person.fullName(),
        relationship: faker.helpers.arrayElement([
          'Parent',
          'Guardian',
          'Sibling',
        ]),
        phone: faker.phone.number(),
      },
    },
  };
}

export function createStaffDetailsData(
  userId: string,
  role: Role,
  index: number,
): Prisma.StaffDetailsCreateManyInput {
  return {
    userId,
    employeeNumber: 10000 + index,
    department: faker.helpers.arrayElement([
      'Computer Science',
      'Information Technology',
      'Data Science',
      'Cybersecurity',
      'Software Engineering',
    ]),
    position: faker.helpers.arrayElement(STAFF_POSITIONS[role]),
    otherDetails: {
      office: `Room ${faker.number.int({ min: 100, max: 500 })}`,
      specialization: faker.person.jobArea(),
      officeHours: `${faker.helpers.arrayElement(['Mon-Wed', 'Tue-Thu', 'Wed-Fri'])} ${faker.number.int({ min: 9, max: 11 })}:00-${faker.number.int({ min: 1, max: 4 })}:00`,
    },
  };
}
