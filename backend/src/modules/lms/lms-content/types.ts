import {
  ModuleTreeAssignmentItemDto,
  ModuleTreeLessonItemDto,
} from '@/modules/lms/lms-module/dto/module-tree-content-item.dto';
import {
  AssignmentItemDto,
  LessonItemDto,
} from '@/modules/lms/lms-content/dto/full-module-content.dto';
import {
  UpdateAssignmentItemDto,
  UpdateLessonItemDto,
} from '@/modules/lms/lms-content/dto/update-full-module-content.dto';

export type ModuleTreeAssignmentItem = InstanceType<
  typeof ModuleTreeAssignmentItemDto
> & {
  contentType: 'ASSIGNMENT';
};

export type ModuleTreeLessonItem = InstanceType<
  typeof ModuleTreeLessonItemDto
> & {
  contentType: 'LESSON';
};

export type ModuleTreeContentItem =
  | ModuleTreeAssignmentItem
  | ModuleTreeLessonItem;

export type FullModuleContent = LessonItemDto | AssignmentItemDto;
export type UpdateFullModuleContent =
  | UpdateLessonItemDto
  | UpdateAssignmentItemDto;
