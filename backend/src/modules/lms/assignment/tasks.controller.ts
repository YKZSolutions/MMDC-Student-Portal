import {
  Controller,
  Get,
  InternalServerErrorException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { FilterAllTasksDto } from './dto/filter-all-tasks.dto';
import { PaginatedAllTasksDto } from './dto/all-tasks.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly assignmentService: AssignmentService) {}

  /**
   * Get all tasks/assignments across all enrolled courses
   *
   * @remarks
   * Retrieves all assignments from all modules in courses the student is enrolled in
   * for the current active term. Includes submission status and grades for each task.
   * Results can be filtered by status (upcoming, submitted, graded) and course,
   * and sorted by various fields.
   * Requires `STUDENT` role.
   *
   * @param filters - Query filters for pagination, status, course, and sorting
   * @param currentUser - The authenticated student user
   * @returns Paginated the list of all tasks with course and module context
   */
  @Get()
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: 'Get all tasks across enrolled courses',
    description:
      'Retrieves all assignments from enrolled courses in the current term with filtering and sorting options',
  })
  @ApiOkResponse({
    description: 'Tasks retrieved successfully',
    type: PaginatedAllTasksDto,
  })
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  async getAllTasksForStudent(
    @Query() filters: FilterAllTasksDto,
    @CurrentUser() currentUser: CurrentAuthUser,
  ): Promise<PaginatedAllTasksDto> {
    const { user_id } = currentUser.user_metadata;
    return this.assignmentService.findAllTasksForStudent(user_id, filters);
  }
}
