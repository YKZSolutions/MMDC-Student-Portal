import { CreateModuleDto } from '@/generated/nestjs-dto/create-module.dto';
import { AssignmentMode, ContentType, Prisma } from '@prisma/client';

/**
 * Basic single module DTO generator
 */
export const createModule = (
  overrides: {
    title?: string;
    publishedAt?: Date;
  } = {},
): CreateModuleDto => {
  return {
    title: overrides?.title || 'Test Module',
  };
};

/**
 * Unified factory for building a full course-module-offering setup.
 * Supports both "lesson tree" and "todo (assignment)" variants.
 */
export const createModuleSetup = (
  options: {
    type?: 'tree' | 'todo';
    courseCode?: string;
    courseName?: string;
    moduleTitle?: string;
    sectionTitle?: string;
    assignmentTitle?: string;
    lessonCount?: number;
  } = {},
) => {
  const {
    type = 'tree',
    courseCode = type === 'todo' ? 'TODO101' : 'TREE101',
    courseName = type === 'todo' ? 'Todo Test Course' : 'Tree Test Course',
    moduleTitle = type === 'todo' ? 'Todo Test Module' : 'Module Tree Test',
    sectionTitle = type === 'todo' ? 'Section 1' : 'Root Section',
    assignmentTitle = 'Test Assignment',
    lessonCount = 3,
  } = options;

  const now = new Date();

  // Common base entities shared by both setups
  const enrollmentPeriod = {
    startYear: 2025,
    endYear: 2026,
    term: type === 'todo' ? 2 : 1,
    startDate:
      type === 'todo' ? new Date('2025-01-01') : new Date('2025-06-01'),
    endDate: type === 'todo' ? new Date('2025-12-31') : new Date('2025-10-01'),
    status: 'active' as Prisma.EnrollmentPeriodCreateInput['status'],
  };

  const course = {
    courseCode,
    name: courseName,
    description:
      type === 'todo'
        ? 'Used for /modules/todo testing'
        : 'A course used for testing module trees',
    units: 3,
    type: 'lecture' as Prisma.CourseCreateInput['type'],
  };

  const courseOffering = (courseId: string, periodId: string) => ({
    courseId,
    periodId,
  });

  const courseSection = (offeringId: string) => ({
    name: sectionTitle,
    courseOfferingId: offeringId,
    maxSlot: 30,
    startSched: '08:00',
    endSched: type === 'todo' ? '09:00' : '09:30',
    days: ['monday', 'wednesday'] as Prisma.CourseSectionCreateInput['days'],
  });

  const courseEnrollment = (
    offeringId: string,
    sectionId: string,
    studentId: string,
  ) => ({
    courseOfferingId: offeringId,
    courseSectionId: sectionId,
    studentId,
    status: 'enrolled' as Prisma.CourseEnrollmentCreateInput['status'],
    startedAt: now,
  });

  const module = (offeringId: string) => ({
    title: moduleTitle,
    courseOfferingId: offeringId,
  });

  // Section and content differ between types
  const moduleSections = (moduleId: string, rootId?: string) => {
    if (type === 'todo') {
      return {
        rootSection: {
          title: sectionTitle,
          moduleId,
          order: 1,
          publishedAt: now,
        },
      };
    }

    // "tree" type
    const rootSection = {
      title: 'Root Section',
      order: 1,
      publishedAt: now,
      moduleId,
    };
    const subSection = {
      title: 'Subsection A',
      order: 2,
      publishedAt: now,
      moduleId,
      parentSectionId: rootId,
    };
    return { rootSection, subSection };
  };

  const moduleContents = (rootId: string, subId?: string) => {
    if (type === 'todo') {
      return [
        {
          title: assignmentTitle,
          contentType: ContentType.ASSIGNMENT,
          order: 1,
          publishedAt: now,
          moduleSectionId: rootId,
        },
      ];
    }

    // "tree" lessons
    const lessons = Array.from({ length: lessonCount }).map((_, i) => ({
      title: `Lesson ${i + 1}`,
      contentType: ContentType.LESSON,
      order: i + 1,
      publishedAt: now,
      moduleSectionId: i < 2 ? rootId : subId!,
      content: [],
    }));
    return lessons;
  };

  const assignment = (moduleContentId: string) => ({
    moduleContentId,
    mode: AssignmentMode.INDIVIDUAL,
    maxScore: 100,
    weightPercentage: 10,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    type,
    enrollmentPeriod,
    course,
    courseOffering,
    courseSection,
    courseEnrollment,
    module,
    moduleSections,
    moduleContents,
    assignment,
  };
};
