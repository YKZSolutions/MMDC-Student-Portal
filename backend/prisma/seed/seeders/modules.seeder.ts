import {
  Course,
  Module,
  ModuleContent,
  ModuleSection,
  PrismaClient,
  User,
} from '@prisma/client';
import { log, pickRandom } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createModuleContentData,
  createModuleData,
  createModuleSectionData,
} from '../factories/module.factory';

export async function seedModules(
  prisma: PrismaClient,
  courses: Course[],
  mentors: User[],
) {
  log('Seeding modules...');
  const allModules: Module[] = [];
  const allSections: ModuleSection[] = [];
  const allContents: ModuleContent[] = [];

  for (const course of courses) {
    const courseModules: Module[] = [];
    for (let i = 0; i < seedConfig.MODULES_PER_COURSE; i++) {
      const module = await prisma.module.create({
        data: createModuleData(course.id, pickRandom(mentors).id),
      });
      courseModules.push(module);
    }
    allModules.push(...courseModules);

    for (const module of courseModules) {
      const moduleSections: ModuleSection[] = [];
      for (let j = 0; j < seedConfig.SECTIONS_PER_MODULE; j++) {
        const section = await prisma.moduleSection.create({
          data: createModuleSectionData(
            module.id,
            pickRandom(mentors).id,
            j + 1,
          ),
        });
        moduleSections.push(section);
      }
      allSections.push(...moduleSections);

      for (const section of moduleSections) {
        const sectionContents: ModuleContent[] = [];
        for (let k = 0; k < seedConfig.CONTENTS_PER_SECTION; k++) {
          const content = await prisma.moduleContent.create({
            data: createModuleContentData(
              module.id,
              section.id,
              pickRandom(mentors).id,
              k + 1,
            ),
          });
          sectionContents.push(content);
        }
        allContents.push(...sectionContents);
      }
    }
  }

  log(`-> Created ${allModules.length} modules.`);
  log(`-> Created ${allSections.length} module sections.`);
  log(`-> Created ${allContents.length} module contents.`);

  const assignments = allContents.filter((c) => c.contentType === 'ASSIGNMENT');
  log(`   - including ${assignments.length} assignments.`);

  return {
    modules: allModules,
    sections: allSections,
    contents: allContents,
    assignments,
  };
}
