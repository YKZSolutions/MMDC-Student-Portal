import { ContentType } from '@prisma/client';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import {
  LessonItemDto,
  AssignmentItemDto,
} from '@/modules/lms/lms-content/dto/full-module-content.dto';
import {
  ModuleTreeContentItem,
  ModuleTreeLessonItem,
} from '@/modules/lms/lms-content/types';

export function mapModuleContentToModuleTreeItem(
  moduleContent: Omit<ModuleContent, 'content' | 'moduleSection' | 'deletedAt'>,
): ModuleTreeContentItem {
  if (moduleContent.contentType === 'LESSON') {
    return moduleContent as ModuleTreeLessonItem;
  }

  if (moduleContent.contentType === 'ASSIGNMENT') {
    if (!moduleContent.assignment) {
      throw new Error('Assignment is required for assignment content');
    }

    const assignment = moduleContent.assignment;
    const studentSubmissions = (assignment as any).submissions
      ? (assignment as any).submissions.map((submission: any) => ({
          ...submission,
          grade: submission.gradeRecord,
        }))
      : undefined;

    return {
      ...moduleContent,
      assignment: {
        ...assignment,
        studentSubmissions,
      },
      contentType: ContentType.ASSIGNMENT,
    };
  }

  throw new Error(`Unsupported content type: ${moduleContent.contentType}`);
}

export function mapModuleContentToFullModuleContent(
  moduleContent: ModuleContent,
): LessonItemDto | AssignmentItemDto {
  const baseContent = {
    ...moduleContent,
    ...(moduleContent.assignment && { assignment: moduleContent.assignment }),
    ...(moduleContent.studentProgress && {
      studentProgress: moduleContent.studentProgress,
    }),
  };

  if (moduleContent.contentType === ContentType.LESSON) {
    return baseContent as LessonItemDto;
  }

  if (moduleContent.contentType === ContentType.ASSIGNMENT) {
    if (!moduleContent.assignment) {
      throw new Error(
        `Assignment content ${moduleContent.id} is missing assignment relation`,
      );
    }

    return baseContent as AssignmentItemDto;
  }

  throw new Error(`Unsupported content type: ${moduleContent.contentType}`);
}
