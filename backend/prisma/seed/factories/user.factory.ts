import { faker } from '@faker-js/faker';
import { Prisma, Role, StudentType } from '@prisma/client';
import { pickRandomEnum } from '../utils/helpers';

export function createUserData(
  role: Role,
  index: number,
): Prisma.UserCreateInput {
  const isStudent = role === Role.student;
  const isStaff = role === Role.mentor || role === Role.admin;

  return {
    firstName: faker.person.firstName(),
    middleName: Math.random() > 0.5 ? faker.person.middleName() : undefined,
    lastName: faker.person.lastName(),
    role,
    userAccount: {
      create: {
        authUid: faker.string.uuid(),
        email: faker.internet.email(),
      },
    },
    userDetails: {
      create: {
        dateJoined: faker.date.past({ years: 2 }),
        dob: faker.date.birthdate(),
        gender: faker.person.sex(),
      },
    },
    ...(isStudent && {
      studentDetails: {
        create: {
          studentNumber: 20240000 + index,
          studentType: pickRandomEnum(StudentType),
          admissionDate: faker.date.past({ years: 1 }),
          otherDetails: {
            address: faker.location.streetAddress(),
            contact: faker.phone.number(),
          },
        },
      },
    }),
    ...(isStaff && {
      staffDetails: {
        create: {
          employeeNumber: 9000 + index,
          department: faker.commerce.department(),
          position:
            role === 'admin' ? 'Administrator' : faker.person.jobTitle(),
          otherDetails: {
            office: `Building ${faker.number.int({ min: 1, max: 5 })}`,
            specialization: faker.person.jobArea(),
          },
        },
      },
    }),
  };
}
