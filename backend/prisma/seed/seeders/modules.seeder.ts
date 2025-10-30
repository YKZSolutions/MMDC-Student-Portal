import {
  ContentType,
  Course,
  CourseOffering,
  Module,
  ModuleContent,
  ModuleSection,
  Prisma,
} from '@prisma/client';
import { log } from '../utils/helpers';
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

  // Pre-calculate all module data for batch creation
  const modulesToCreate: Prisma.ModuleCreateManyInput[] = [];
  let globalModuleIndex = 0;

  for (const course of courses) {
    const courseOfferingsForCourse = courseOfferings.filter(
      (offering) => offering.courseId === course.id,
    );

    // Create one module per course offering instead of multiple modules per course
    for (const offering of courseOfferingsForCourse) {
      modulesToCreate.push(
        createModuleData(course.id, offering.id, globalModuleIndex),
      );
      globalModuleIndex++;
    }

    // If we need more modules than offerings, create additional modules without course offerings
    const remainingModules =
      seedConfig.MODULES_PER_COURSE - courseOfferingsForCourse.length;
    if (remainingModules > 0) {
      for (let i = 0; i < remainingModules; i++) {
        modulesToCreate.push(
          createModuleData(
            course.id,
            null, // No course offering for these additional modules
            globalModuleIndex,
          ),
        );
        globalModuleIndex++;
      }
    }
  }

  // Batch creates all modules
  if (modulesToCreate.length > 0) {
    await prisma.module.createMany({
      data: modulesToCreate,
    });
    // Fetch created modules to get their IDs
    const createdModules = await prisma.module.findMany({
      where: {
        courseId: {
          in: courses.map((c) => c.id),
        },
      },
      orderBy: [{ courseId: 'asc' }, { title: 'asc' }],
    });
    allModules.push(...createdModules);
  }

  // Pre-calculate all sections of data for batch creation
  const sectionsToCreate: Prisma.ModuleSectionCreateManyInput[] = [];

  for (const module of allModules) {
    // Create main sections
    for (let j = 0; j < seedConfig.SECTIONS_PER_MODULE; j++) {
      sectionsToCreate.push(createModuleSectionData(module.id, j + 1));
    }
  }

  // Batch creates all sections
  if (sectionsToCreate.length > 0) {
    await prisma.moduleSection.createMany({
      data: sectionsToCreate,
    });
    // Fetch created sections to get their IDs
    const createdSections = await prisma.moduleSection.findMany({
      where: {
        moduleId: {
          in: allModules.map((m) => m.id),
        },
      },
      orderBy: [{ moduleId: 'asc' }, { order: 'asc' }],
    });
    allSections.push(...createdSections);
  }

  // Pre-calculate all subsections data for batch creation
  const subsectionsToCreate: Prisma.ModuleSectionCreateManyInput[] = [];

  for (const section of allSections) {
    // Create subsections for each main section
    for (let s = 0; s < seedConfig.SUBSECTIONS_PER_SECTION; s++) {
      subsectionsToCreate.push(
        createModuleSectionData(section.moduleId, s + 1, section.id),
      );
    }
  }

  // Batch creates all subsections
  if (subsectionsToCreate.length > 0) {
    await prisma.moduleSection.createMany({
      data: subsectionsToCreate,
    });
    // Fetch created subsections to get their IDs
    const createdSubsections = await prisma.moduleSection.findMany({
      where: {
        parentSectionId: {
          in: allSections.map((s) => s.id),
        },
      },
      orderBy: [{ parentSectionId: 'asc' }, { order: 'asc' }],
    });
    allSubsections.push(...createdSubsections);
  }

  // Pre-calculate all content data for batch creation
  const contentsToCreate: Prisma.ModuleContentCreateManyInput[] = [];

  for (const subsection of allSubsections) {
    // Create content in subsections
    for (let k = 0; k < seedConfig.CONTENTS_PER_SUBSECTION; k++) {
      let contentType: ContentType;
      const rand = Math.random();

      if (rand < seedConfig.ASSIGNMENT_CHANCE) {
        contentType = ContentType.ASSIGNMENT;
      } else {
        contentType = ContentType.LESSON;
      }

      contentsToCreate.push(
        createModuleContentData(subsection.id, k + 1, contentType),
      );
    }
  }

  // Batch creates all contents
  if (contentsToCreate.length > 0) {
    await prisma.moduleContent.createMany({
      data: contentsToCreate,
    });
    // Fetch created contents to get their IDs
    const createdContents = await prisma.moduleContent.findMany({
      where: {
        moduleSectionId: {
          in: allSubsections.map((s) => s.id),
        },
      },
      orderBy: [{ moduleSectionId: 'asc' }, { order: 'asc' }],
    });
    allContents.push(...createdContents);
  }

  // Pre-calculate all assignment data for batch creation
  const assignmentsToCreate: Prisma.AssignmentCreateManyInput[] = [];

  for (const content of allContents) {
    if (content.contentType === ContentType.ASSIGNMENT) {
      assignmentsToCreate.push(createAssignmentData(content.id));
    }
  }

  // Batch creates all assignments
  if (assignmentsToCreate.length > 0) {
    await prisma.assignment.createMany({
      data: assignmentsToCreate,
    });
    // Fetch created assignments
    const createdAssignments = await prisma.assignment.findMany({
      where: {
        moduleContentId: {
          in: allContents
            .filter((c) => c.contentType === ContentType.ASSIGNMENT)
            .map((c) => c.id),
        },
      },
    });
    allAssignments.push(...createdAssignments);
  }

  // Handle lessons (all non-assignment content becomes lessons)
  const lessonContents = allContents.filter(
    (c) => c.contentType === ContentType.LESSON,
  );
  allLessons.push(...lessonContents);
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
