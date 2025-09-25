import {
  ContentType,
  Course,
  CourseOffering,
  Module,
  ModuleContent,
  ModuleSection,
  PrismaClient,
} from '@prisma/client';
import { log, pickRandom, pickRandomEnum } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createAssignmentData,
  createDiscussionData,
  createExternalUrlData,
  createFileResourceData,
  createGradingConfigData,
  createLessonData,
  createModuleContentData,
  createModuleData,
  createModuleSectionData,
  createQuizData,
  createVideoData,
} from '../factories/module.factory';

export async function seedModules(
  prisma: PrismaClient,
  courses: Course[],
  courseOfferings: CourseOffering[],
) {
  log('Seeding modules and course content...');

  const allModules: Module[] = [];
  const allSections: ModuleSection[] = [];
  const allSubsections: ModuleSection[] = [];
  const allContents: ModuleContent[] = [];
  const allAssignments: any[] = [];
  const allQuizzes: any[] = [];
  const allLessons: any[] = [];
  const allDiscussions: any[] = [];
  const allGradings: any[] = [];

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
      const moduleIndex = i;

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
            } else if (
              rand <
              seedConfig.ASSIGNMENT_CHANCE + seedConfig.QUIZ_CHANCE
            ) {
              contentType = ContentType.QUIZ;
            } else {
              contentType = pickRandomEnum(
                Object.values(ContentType).filter(
                  (type) =>
                    type !== ContentType.ASSIGNMENT &&
                    type !== ContentType.QUIZ,
                ),
              );
            }

            const content = await prisma.moduleContent.create({
              data: createModuleContentData(
                module.id,
                subsection.id,
                k + 1,
                contentType,
              ),
            });
            allContents.push(content);

            // Create specific content type
            switch (contentType) {
              case ContentType.ASSIGNMENT: {
                const grading = await prisma.gradingConfig.create({
                  data: createGradingConfigData(true),
                });
                allGradings.push(grading);

                const assignment = await prisma.assignment.create({
                  data: createAssignmentData(
                    content.id,
                    grading.id,
                    moduleIndex,
                  ),
                });
                allAssignments.push(assignment);
                break;
              }
              case ContentType.QUIZ: {
                const grading = await prisma.gradingConfig.create({
                  data: createGradingConfigData(false),
                });
                allGradings.push(grading);

                const quiz = await prisma.quiz.create({
                  data: createQuizData(content.id, grading.id, moduleIndex),
                });
                allQuizzes.push(quiz);
                break;
              }
              case ContentType.LESSON: {
                const lesson = await prisma.lesson.create({
                  data: createLessonData(content.id, j),
                });
                allLessons.push(lesson);
                break;
              }
              case ContentType.VIDEO: {
                await prisma.video.create({
                  data: createVideoData(content.id),
                });
                break;
              }
              case ContentType.URL: {
                await prisma.externalUrl.create({
                  data: createExternalUrlData(content.id),
                });
                break;
              }
              case ContentType.FILE: {
                await prisma.fileResource.create({
                  data: createFileResourceData(content.id),
                });
                break;
              }
              case ContentType.DISCUSSION: {
                const discussion = await prisma.discussion.create({
                  data: createDiscussionData(content.id),
                });
                allDiscussions.push(discussion);
                break;
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
  log(`-> Created ${allQuizzes.length} quizzes.`);
  log(`-> Created ${allLessons.length} lessons.`);
  log(`-> Created ${allDiscussions.length} discussions.`);
  log(`-> Created ${allGradings.length} grading configurations.`);

  return {
    modules: allModules,
    sections: allSections,
    subsections: allSubsections,
    contents: allContents,
    assignments: allAssignments,
    quizzes: allQuizzes,
    lessons: allLessons,
    discussions: allDiscussions,
    gradings: allGradings,
  };
}
