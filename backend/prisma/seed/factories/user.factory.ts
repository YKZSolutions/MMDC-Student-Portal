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
): Prisma.UserCreateInput {
  const gender = faker.person.sexType();
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName(gender);

  const isStudent = role === Role.student;
  const isStaff = role === Role.mentor || role === Role.admin;

  const baseData: Prisma.UserCreateInput = {
    firstName,
    middleName: Math.random() > 0.7 ? faker.person.firstName() : undefined,
    lastName,
    role,
    userAccount: {
      create: {
        authUid: faker.string.uuid(),
        email: faker.internet.email({ firstName, lastName }),
      },
    },
    userDetails: {
      create: {
        dateJoined: faker.date.past({ years: 2 }),
        dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        gender,
      },
    },
  };

  if (isStudent) {
    return {
      ...baseData,
      studentDetails: {
        create: {
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
        },
      },
    };
  }

  if (isStaff) {
    return {
      ...baseData,
      staffDetails: {
        create: {
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
        },
      },
    };
  }

  return baseData;
}
