import { PrismaClient, Module, CourseSection } from '@prisma/client';
import { log } from '../utils/helpers';

export async function seedSectionModules(
  prisma: PrismaClient,
  courseSections: CourseSection[],
  modules: Module[],
) {
  log('Seeding section-module relationships...');

  const sectionModules: Array<{
    id: string;
    courseSectionId: string;
    moduleId: string;
    publishedAt: Date | null;
    classMeetings: any;
  }> = [];
  const classMeetingsTemplate = {
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
  };

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
      const sectionModule = await prisma.sectionModule.create({
        data: {
          courseSectionId: section.id,
          moduleId: module.id,
          publishedAt: new Date(),
          classMeetings: classMeetingsTemplate,
        },
      });
      sectionModules.push(sectionModule);
    }
  }

  log(`-> Created ${sectionModules.length} section-module relationships.`);
  return { sectionModules };
}
