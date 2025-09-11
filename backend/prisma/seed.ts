import {
  AssignmentMode,
  AssignmentStatus,
  AssignmentType,
  BillType,
  ContentType,
  CourseEnrollmentStatus,
  Days,
  EnrollmentStatus,
  PaymentScheme,
  PaymentType,
  Prisma,
  PrismaClient,
  Role,
  StudentType,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

//TODO: Do update on schema changes
async function main() {
  console.log('Starting seed...');

  // Create Users with different roles
  const users = await Promise.all(
    Array.from({ length: 20 }).map(async (_, i) => {
      const role = i === 0 ? Role.admin : i < 5 ? Role.mentor : Role.student;

      return prisma.user.create({
        data: {
          firstName: faker.person.firstName(),
          middleName: Math.random() > 0.5 ? faker.person.middleName() : null,
          lastName: faker.person.lastName(),
          role,
          userAccount: {
            create: {
              authUid: `auth${i}`,
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
          ...(role === Role.student && {
            studentDetails: {
              create: {
                studentNumber: 10000 + i,
                studentType: faker.helpers.arrayElement(
                  Object.values(StudentType),
                ),
                admissionDate: faker.date.past({ years: 1 }),
                otherDetails: {
                  address: faker.location.streetAddress(),
                  contact: faker.phone.number(),
                } as Prisma.JsonObject,
              },
            },
          }),
          ...(role === Role.mentor && {
            staffDetails: {
              create: {
                employeeNumber: 20000 + i,
                department: faker.commerce.department(),
                position: faker.person.jobTitle(),
                otherDetails: {
                  office: faker.location.streetAddress(),
                  specialization: faker.person.jobArea(),
                } as Prisma.JsonObject,
              },
            },
          }),
        },
      });
    }),
  );

  // Create Programs
  const programs = await Promise.all([
    prisma.program.create({
      data: {
        programCode: 'BSIT',
        name: 'Bachelor of Science in Information Technology',
        description: 'Information technology program',
        yearDuration: 4,
      },
    }),
    prisma.program.create({
      data: {
        programCode: 'BSCS',
        name: 'Bachelor of Science in Computer Science',
        description: 'Computer science program',
        yearDuration: 4,
      },
    }),
  ]);

  // Create Majors for each program
  const majors = await Promise.all([
    prisma.major.create({
      data: {
        programId: programs[0].id,
        majorCode: 'BSIT-SE',
        name: 'Software Engineering',
        description: 'Software Engineering major',
      },
    }),
    prisma.major.create({
      data: {
        programId: programs[1].id,
        majorCode: 'BSCS-DS',
        name: 'Data Science',
        description: 'Data Science major',
      },
    }),
  ]);

  // Create Courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        courseCode: 'CS101',
        name: 'Introduction to Programming',
        description: 'Basic programming concepts',
        units: 3,
        type: 'Lecture',
        majors: {
          connect: [{ id: majors[0].id }, { id: majors[1].id }],
        },
      },
    }),
    prisma.course.create({
      data: {
        courseCode: 'CS102',
        name: 'Data Structures',
        description: 'Data structures and algorithms',
        units: 3,
        type: 'Lecture',
        majors: {
          connect: [{ id: majors[0].id }, { id: majors[1].id }],
        },
      },
    }),
  ]);

  // Set up course prerequisites and corequisites
  await prisma.course.update({
    where: { id: courses[1].id },
    data: {
      prereqs: {
        connect: { id: courses[0].id },
      },
    },
  });

  // Create Curriculum
  const curriculum = await prisma.curriculum.create({
    data: {
      majorId: majors[0].id,
      name: '2023 Software Engineering Curriculum',
      description: 'Latest curriculum for SE',
    },
  });

  // Create Curriculum Courses
  await Promise.all([
    prisma.curriculumCourse.create({
      data: {
        curriculumId: curriculum.id,
        courseId: courses[0].id,
        order: 1,
        year: 1,
        semester: 1,
      },
    }),
    prisma.curriculumCourse.create({
      data: {
        curriculumId: curriculum.id,
        courseId: courses[1].id,
        order: 2,
        year: 1,
        semester: 2,
      },
    }),
  ]);

  // Create Enrollment Period
  const enrollmentPeriod = await prisma.enrollmentPeriod.create({
    data: {
      startYear: 2023,
      endYear: 2024,
      term: 1,
      startDate: new Date('2023-08-01'),
      endDate: new Date('2023-12-15'),
      status: EnrollmentStatus.active,
    },
  });

  // Create Course Offerings
  const courseOfferings = await Promise.all(
    courses.map((course) =>
      prisma.courseOffering.create({
        data: {
          courseId: course.id,
          periodId: enrollmentPeriod.id,
        },
      }),
    ),
  );

  // Create Course Sections
  const mentors = users.filter((user) => user.role === Role.mentor);
  const courseSections = await Promise.all(
    courseOfferings.map((offering, i) =>
      prisma.courseSection.create({
        data: {
          name: `Section ${i + 1}`,
          mentorId: mentors[i % mentors.length].id,
          courseOfferingId: offering.id,
          maxSlot: 30,
          startSched: '09:00',
          endSched: '10:30',
          days: [Days.monday, Days.wednesday, Days.friday],
        },
      }),
    ),
  );

  // Create Course Enrollments
  const students = users.filter((user) => user.role === Role.student);
  const courseEnrollments = await Promise.all(
    students.flatMap((student) =>
      courseSections.map((section, i) =>
        prisma.courseEnrollment.create({
          data: {
            courseOfferingId: courseOfferings[i % courseOfferings.length].id,
            courseSectionId: section.id,
            studentId: student.id,
            status: Object.values(CourseEnrollmentStatus)[
              Math.floor(
                Math.random() * Object.values(CourseEnrollmentStatus).length,
              )
            ],
            startedAt: new Date(),
          },
        }),
      ),
    ),
  );

  // Create Modules
  const modules = await Promise.all(
    courseOfferings.map((offering) =>
      prisma.module.create({
        data: {
          title: `${faker.word.adjective()} Module`,
          courseId: offering.courseId,
          courseOfferingId: offering.id,
          publishedAt: new Date(),
          publishedBy: mentors[0].id,
        },
      }),
    ),
  );

  // Create Module Sections
  const moduleSections = await Promise.all(
    modules.flatMap((module) =>
      Array.from({ length: 3 }).map((_, i) =>
        prisma.moduleSection.create({
          data: {
            title: `Section ${i + 1}`,
            moduleId: module.id,
            order: i + 1,
            publishedAt: new Date(),
            publishedBy: mentors[0].id,
          },
        }),
      ),
    ),
  );

  // Create Module Contents
  const moduleContents = await Promise.all(
    moduleSections.flatMap((section) =>
      Array.from({ length: 6 }).map((_, i) =>
        prisma.moduleContent.create({
          data: {
            title: `Content ${i + 1}`,
            moduleId: section.moduleId,
            moduleSectionId: section.id,
            order: i + 1,
            content: {
              type: 'text',
              value: faker.lorem.paragraphs(3),
            } as Prisma.JsonObject,
            contentType:
              Object.values(ContentType)[
                Math.floor(Math.random() * Object.values(ContentType).length)
              ],
            publishedAt: new Date(),
            publishedBy: mentors[0].id,
          },
        }),
      ),
    ),
  );

  // Create Assignments
  const assignments = await Promise.all(
    moduleContents
      .filter((content) => content.contentType === ContentType.ASSIGNMENT)
      .map((content) =>
        prisma.assignment.create({
          data: {
            moduleContentId: content.id,
            title: `Assignment ${faker.word.noun()}`,
            rubric: {
              criteria: [
                {
                  name: 'Completeness',
                  weight: 0.5,
                },
                {
                  name: 'Accuracy',
                  weight: 0.5,
                },
              ],
            } as Prisma.JsonObject,
            type: Object.values(AssignmentType)[
              Math.floor(Math.random() * Object.values(AssignmentType).length)
            ],
            mode: Object.values(AssignmentMode)[
              Math.floor(Math.random() * Object.values(AssignmentMode).length)
            ],
            status:
              Object.values(AssignmentStatus)[
                Math.floor(
                  Math.random() * Object.values(AssignmentStatus).length,
                )
              ],
            dueDate: faker.date.future(),
            points: 100,
          },
        }),
      ),
  );

  // Create Content Progress
  const contentProgress = await Promise.all(
    students.flatMap((student) =>
      moduleContents.map((content) =>
        prisma.contentProgress.create({
          data: {
            userId: student.id,
            moduleContentId: content.id,
            moduleId: content.moduleId,
            completedAt: Math.random() > 0.7 ? new Date() : null,
          },
        }),
      ),
    ),
  );

  // Create Submissions
  const submissions = await Promise.all(
    students.flatMap((student) =>
      assignments.map((assignment, i) =>
        prisma.submission.create({
          data: {
            title: `Submission for ${assignment.title}`,
            moduleContentId: assignment.moduleContentId,
            studentId: student.id,
            submittedAt: Math.random() > 0.5 ? new Date() : null,
            attemptNumber: 1,
            attachments: {
              create:
                Math.random() > 0.5
                  ? [
                      {
                        name: 'attachment1.pdf',
                        attachment: '/uploads/attachment1.pdf',
                      },
                    ]
                  : [],
            },
          },
        }),
      ),
    ),
  );

  // Create Bills
  const bills = await Promise.all(
    students.map((student) =>
      prisma.bill.create({
        data: {
          userId: student.id,
          payerName: `${student.firstName} ${student.lastName}`,
          payerEmail: faker.internet.email(),
          billType: BillType.academic,
          paymentScheme: PaymentScheme.full,
          totalAmount: new Prisma.Decimal(25000.0),
          costBreakdown: [
            {
              category: 'tuition',
              name: 'Tuition Fee',
              cost: new Prisma.Decimal(20000),
            },
            {
              category: 'miscellaneous',
              name: 'Miscellaneous Fees',
              cost: new Prisma.Decimal(5000),
            },
          ],
        },
      }),
    ),
  );

  // Create Bill Installments
  const NUM_INSTALLMENTS = 2;
  const billInstallments = await Promise.all(
    bills.flatMap((bill) =>
      Array.from({ length: NUM_INSTALLMENTS }).map((_, i) =>
        prisma.billInstallment.create({
          data: {
            billId: bill.id,
            name: `Installment ${i + 1}`,
            installmentOrder: i + 1,
            amountToPay: new Prisma.Decimal(bill.totalAmount.toNumber() / NUM_INSTALLMENTS),
            dueAt: faker.date.future(),
          },
        }),
      ),
    ),
  );

  // Create some bill payments
  await Promise.all(
    billInstallments.slice(0, 5).map((installment) =>
      prisma.billPayment.create({
        data: {
          billId: installment.billId,
          installmentId: installment.id,
          installmentOrder: installment.installmentOrder,
          amountPaid: installment.amountToPay,
          paymentType: PaymentType.gcash,
          notes: 'Paid via GCash',
          paymentDate: new Date(),
        },
      }),
    ),
  );

  // Create Notifications
  await Promise.all(
    users.slice(0, 5).map((user) =>
      prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to the System',
          content: 'Your account has been successfully created',
          isRead: Math.random() > 0.5,
        },
      }),
    ),
  );

  console.log('Seed completed successfully!');
}

main()
  .then(async () => {
    console.log('Seeding finished.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
