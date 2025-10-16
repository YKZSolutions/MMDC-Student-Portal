import {
  ContentType,
  Course,
  CourseOffering,
  Module,
  ModuleContent,
  ModuleSection,
} from '@prisma/client';
import { log, pickRandom } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createAssignmentData,
  createModuleContentData,
  createModuleData,
  createModuleSectionData,
} from '../factories/module.factory';
import { PrismaTransaction } from '../../../src/lib/prisma/prisma.extension';

export async function seedModules(
  prisma: PrismaTransaction,
  courses: Course[],
  courseOfferings: CourseOffering[],
) {
  log('Seeding modules and course content...');

  const allModules: Module[] = [];
  const allSections: ModuleSection[] = [];
  const allSubsections: ModuleSection[] = [];
  const allContents: ModuleContent[] = [];
  const allAssignments: any[] = [];
  const allLessons: any[] = [];

  for (const course of courses) {
    const courseModules: Module[] = [];
    const courseOfferingsForCourse = courseOfferings.filter(
      (offering) => offering.courseId === course.id,
    );

    for (let i = 0; i < seedConfig.MODULES_PER_COURSE; i++) {
      const module = await prisma.module.create({
        data: createModuleData(
          course.id,
          pickRandom(courseOfferingsForCourse).id,
          i,
        ),
      });
      courseModules.push(module);
    }
    allModules.push(...courseModules);

    for (let i = 0; i < courseModules.length; i++) {
      const module = courseModules[i];

      const moduleSections: ModuleSection[] = [];

      // Create main sections
      for (let j = 0; j < seedConfig.SECTIONS_PER_MODULE; j++) {
        const section = await prisma.moduleSection.create({
          data: createModuleSectionData(module.id, j + 1),
        });
        moduleSections.push(section);

        // Create subsections
        for (let s = 0; s < seedConfig.SUBSECTIONS_PER_SECTION; s++) {
          const subsection = await prisma.moduleSection.create({
            data: createModuleSectionData(module.id, s + 1, section.id),
          });
          allSubsections.push(subsection);

          // Create content in subsections
          for (let k = 0; k < seedConfig.CONTENTS_PER_SUBSECTION; k++) {
            let contentType: ContentType;
            const rand = Math.random();

            if (rand < seedConfig.ASSIGNMENT_CHANCE) {
              contentType = ContentType.ASSIGNMENT;
            } else {
              contentType = ContentType.LESSON; // Added default value
            }

            const content = await prisma.moduleContent.create({
              data: createModuleContentData(subsection.id, k + 1, contentType),
            });
            allContents.push(content);

            // Create specific content type
            switch (contentType) {
              case ContentType.ASSIGNMENT: {
                const assignment = await prisma.assignment.create({
                  data: createAssignmentData(content.id),
                });
                allAssignments.push(assignment);
                break;
              }
              case ContentType.LESSON: {
                allLessons.push(content);
                break; // Added break for consistency
              }
            }
          }
        }
      }
      allSections.push(...moduleSections);
    }
  }

  log(`-> Created ${allModules.length} modules.`);
  log(`-> Created ${allSections.length} module sections.`);
  log(`-> Created ${allSubsections.length} module subsections.`);
  log(`-> Created ${allContents.length} module contents.`);
  log(`-> Created ${allAssignments.length} assignments.`);
  log(`-> Created ${allLessons.length} lessons.`);

  return {
    modules: allModules,
    sections: allSections,
    subsections: allSubsections,
    contents: allContents,
    assignments: allAssignments,
    lessons: allLessons,
  };
}
