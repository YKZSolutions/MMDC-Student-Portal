import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import {
  FullModuleContent,
  ModuleTreeContentItem,
} from '@/modules/lms/lms-content/types';

export function mapModuleContentToModuleTreeItem(
  moduleContent: Omit<ModuleContent, 'content' | 'moduleSection' | 'deletedAt'>,
): ModuleTreeContentItem {
  const { assignment, contentType, ...rest } = moduleContent;

  if (contentType === 'ASSIGNMENT') {
    if (!assignment) {
      throw new Error('Assignment is required for assignment content');
    }

    return {
      contentType,
      ...assignment,
      ...rest,
    };
  }

  return {
    contentType,
    ...rest,
  };
}

export function mapModuleContentToFullModuleContent(
  moduleContent: ModuleContent,
): FullModuleContent {
  const { assignment, contentType, ...rest } = moduleContent;

  if (contentType === 'ASSIGNMENT') {
    if (!assignment) {
      throw new Error('Assignment is required for assignment content');
    }

    return {
      contentType,
      ...assignment,
      ...rest,
    };
  }

  return {
    contentType,
    ...rest,
  };
}
