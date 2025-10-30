import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

/**
 * Status filter options for all tasks view
 */
export enum TaskStatusFilter {
  ALL = 'all',
  UPCOMING = 'upcoming', // Not submitted yet
  SUBMITTED = 'submitted', // Submitted but not graded
  GRADED = 'graded', // Graded
}

/**
 * Sorting options for tasks
 */
export enum TaskSortBy {
  DUE_DATE = 'dueDate',
  TITLE = 'title',
  COURSE = 'course',
  STATUS = 'status',
}

/**
 * Filter and sorting options for all tasks endpoint
 */
export class FilterAllTasksDto extends BaseFilterDto {
  /**
   * Filter by task status
   * @example "upcoming"
   */
  @IsOptional()
  @IsEnum(TaskStatusFilter)
  status?: TaskStatusFilter;

  /**
   * Filter by specific course ID
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsOptional()
  @IsUUID()
  courseId?: string;

  /**
   * Sort tasks by field
   * @example "dueDate"
   */
  @IsOptional()
  @IsEnum(TaskSortBy)
  sortBy?: TaskSortBy;

  /**
   * Sort direction (asc or desc)
   * @example "asc"
   */
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc';
}
