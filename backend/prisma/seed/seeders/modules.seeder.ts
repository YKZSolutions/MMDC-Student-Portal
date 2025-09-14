import {
  ContentType,
  Course,
  Module,
  ModuleContent,
  ModuleSection,
  PrismaClient,
} from '@prisma/client';
import { log, pickRandomEnum } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createAssignmentData,
  createAssignmentGradingData,
  createExternalUrlData,
  createFileResourceData,
  createLessonData,
  createModuleContentData,
  createModuleData,
  createModuleSectionData,
  createQuizData,
  createVideoData,
} from '../factories/module.factory';

export async function seedModules(prisma: PrismaClient, courses: Course[]) {
  log('Seeding modules...');
  const allModules: Module[] = [];
  const allSections: ModuleSection[] = [];
  const allContents: ModuleContent[] = [];
  const allAssignments: any[] = [];
  const allQuizzes: any[] = [];
  const allLessons: any[] = [];
  const allGradings: any[] = [];

  for (const course of courses) {
    const courseModules: Module[] = [];
    for (let i = 0; i < seedConfig.MODULES_PER_COURSE; i++) {
      const module = await prisma.module.create({
        data: createModuleData(course.id),
      });
      courseModules.push(module);
    }
    allModules.push(...courseModules);

    for (const module of courseModules) {
      const moduleSections: ModuleSection[] = [];
      for (let j = 0; j < seedConfig.SECTIONS_PER_MODULE; j++) {
        const section = await prisma.moduleSection.create({
          data: createModuleSectionData(module.id, j + 1),
        });
        moduleSections.push(section);
      }
      allSections.push(...moduleSections);

      for (const section of moduleSections) {
        for (let k = 0; k < seedConfig.CONTENTS_PER_SECTION; k++) {
          const contentType =
            Math.random() < seedConfig.ASSIGNMENT_CHANCE
              ? ContentType.ASSIGNMENT
              : pickRandomEnum(ContentType);

          const content = await prisma.moduleContent.create({
            data: createModuleContentData(
              module.id,
              section.id,
              k + 1,
              contentType,
            ),
          });
          allContents.push(content);

          // Create specific content type
          switch (contentType) {
            case ContentType.ASSIGNMENT:
              const grading = await prisma.assignmentGrading.create({
                data: createAssignmentGradingData(),
              });
              allGradings.push(grading);

              const assignment = await prisma.assignment.create({
                data: createAssignmentData(content.id, grading.id),
              });
              allAssignments.push(assignment);
              break;

            case ContentType.QUIZ:
              const quiz = await prisma.quiz.create({
                data: createQuizData(content.id),
              });
              allQuizzes.push(quiz);
              break;

            case ContentType.LESSON:
              const lesson = await prisma.lesson.create({
                data: createLessonData(content.id),
              });
              allLessons.push(lesson);
              break;

            case ContentType.VIDEO:
              const video = await prisma.video.create({
                data: createVideoData(content.id),
              });
              break;

            case ContentType.URL:
              const externalUrl = await prisma.externalUrl.create({
                data: createExternalUrlData(content.id),
              });
              break;

            case ContentType.FILE:
              const fileResource = await prisma.fileResource.create({
                data: createFileResourceData(content.id),
              });
              break;
          }
        }
      }
    }
  }

  log(`-> Created ${allModules.length} modules.`);
  log(`-> Created ${allSections.length} module sections.`);
  log(`-> Created ${allContents.length} module contents.`);
  log(`-> Created ${allAssignments.length} assignments.`);
  log(`-> Created ${allQuizzes.length} quizzes.`);
  log(`-> Created ${allLessons.length} lessons.`);
  log(`-> Created ${allGradings.length} assignment gradings.`);

  return {
    modules: allModules,
    sections: allSections,
    contents: allContents,
    assignments: allAssignments,
    quizzes: allQuizzes,
    lessons: allLessons,
    gradings: allGradings,
  };
}
