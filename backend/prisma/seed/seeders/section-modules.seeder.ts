import { Module, CourseSection, Prisma } from '@prisma/client';
import { log } from '../utils/helpers';
import { PrismaTransaction } from '../../../src/lib/prisma/prisma.extension';

export async function seedSectionModules(
  prisma: PrismaTransaction,
  courseSections: CourseSection[],
  modules: Module[],
) {
  log('Seeding section-module relationships...');

  // Wrap the classMeetingsTemplate in an array since the field expects JSON[]
  const classMeetingsTemplate = [
    {
      schedule: [
        {
          day: 'monday',
          startTime: '09:00',
          endTime: '11:00',
          room: 'Virtual Classroom A',
        },
        {
          day: 'wednesday',
          startTime: '09:00',
          endTime: '11:00',
          room: 'Virtual Classroom A',
        },
      ],
      instructor: 'Professor Smith',
      officeHours: [
        {
          day: 'tuesday',
          startTime: '14:00',
          endTime: '16:00',
          location: 'Online',
        },
      ],
    },
  ];

  // Pre-calculate section modules data for batch creation
  const sectionModulesToCreate: Prisma.SectionModuleCreateManyInput[] = [];

  for (const section of courseSections) {
    // Get modules that belong to the same course offering as this section
    const sectionModulesForOffering = modules.filter(
      (module) => module.courseOfferingId === section.courseOfferingId,
    );

    // Assign 2-4 modules to each section
    const modulesToAssign = sectionModulesForOffering
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 modules

    for (const module of modulesToAssign) {
      sectionModulesToCreate.push({
        courseSectionId: section.id,
        moduleId: module.id,
        classMeetings: classMeetingsTemplate,
      });
    }
  }

  // Batch create section modules
  if (sectionModulesToCreate.length > 0) {
    await prisma.sectionModule.createMany({
      data: sectionModulesToCreate,
    });
  }

  // Fetch created section modules
  const sectionModules = await prisma.sectionModule.findMany({
    where: {
      courseSectionId: {
        in: courseSections.map(s => s.id),
      },
    },
    include: {
      courseSection: true,
      module: true,
    },
  });

  log(`-> Created ${sectionModules.length} section-module relationships.`);

  return { sectionModules };
}
