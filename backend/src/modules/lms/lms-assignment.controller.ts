import { Controller, Get } from '@nestjs/common';
import { LmsContentService } from '@/modules/lms/lms-content.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { Role } from '@/common/enums/roles.enum';

@Controller('assignment')
export class LmsAssignmentController {
  constructor(readonly lmsContentService: LmsContentService) {}

  // /**
  //  * Retrieve all assignments
  //  *
  //  * @remarks
  //  * Retrieves a paginated list of assignments based on the user role and provided filters.
  //  *
  //  */
  // @Roles(Role.STUDENT, Role.ADMIN, Role.MENTOR)
  // @Get()
  // getAllAssignmentSubmissions(
  //   @Query() filters: FilterAssignmentsDto,
  //   @CurrentUser() user: CurrentAuthUser,
  // ) {
  //   const { role, user_id } = user.user_metadata;
  //   return this.lmsContentService.findAllAssignments(role, user_id, filters);
  // }

  /**
   * Retrieve all todo assignments
   *
   * @remarks
   * Retrieves a paginated list of assignments based on the user role and provided filters.
   *
   */
  @Roles(Role.STUDENT)
  @Get()
  getTodos(@CurrentUser() user: CurrentAuthUser) {
    // const { role, user_id } = user.user_metadata;
    const user_id = 'ab9ad660-6418-4035-886c-2d8705c77dc4'; //TODO: remove this after testing
    return this.lmsContentService.findAssignmentTodos(user_id);
  }
}
