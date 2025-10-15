import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { SubmitAssignmentDto } from '../submission/dto/submit-assignment.dto';
import { UpdateAssignmentConfigDto } from '@/modules/lms/lms-content/dto/update-assignment-item.dto';

@Controller('modules/:moduleId/assignments')
export class AssignmentController {
  constructor(private readonly lmsAssignmentService: AssignmentService) {}

  @Post(':assignmentId')
  @ApiException(() => [InternalServerErrorException])
  submit(
    @Param('assignmentId') assignmentId: string,
    @Body() submitAssignmentDto: SubmitAssignmentDto,
    @CurrentUser() currentUser: CurrentAuthUser,
  ) {
    const { user_id } = currentUser.user_metadata;

    return this.lmsAssignmentService.submit(
      assignmentId,
      user_id,
      submitAssignmentDto,
    );
  }

  @Get()
  @ApiException(() => [InternalServerErrorException])
  findAllForAdmin(
    @Param('moduleId') moduleId: string,
    @Query() filters: BaseFilterDto,
  ) {
    return this.lmsAssignmentService.findAllForAdmin(moduleId, filters);
  }

  @Get('mentor')
  @Roles(Role.MENTOR)
  @ApiException(() => [InternalServerErrorException])
  findAllForMentor(
    @Param('moduleId') moduleId: string,
    @Query() filters: BaseFilterDto,
    @CurrentUser() currentUser: CurrentAuthUser,
  ) {
    const { user_id } = currentUser.user_metadata;

    return this.lmsAssignmentService.findAllForMentor(
      moduleId,
      user_id,
      filters,
    );
  }

  @Get('student')
  @Roles(Role.STUDENT)
  @ApiException(() => [InternalServerErrorException])
  findAllForStudent(
    @Param('moduleId') moduleId: string,
    @Query() filters: BaseFilterDto,
    @CurrentUser() currentUser: CurrentAuthUser,
  ) {
    const { user_id } = currentUser.user_metadata;

    return this.lmsAssignmentService.findAllForStudent(
      moduleId,
      user_id,
      filters,
    );
  }

  @Get(':assignmentId')
  @ApiException(() => [InternalServerErrorException])
  findOne(@Param('assignmentId') assignmentId: string) {
    return this.lmsAssignmentService.findOne(assignmentId);
  }

  @Get(':assignmentId/student')
  @Roles(Role.STUDENT)
  @ApiException(() => [InternalServerErrorException])
  findOneForStudent(
    @Param('assignmentId') assignmentId: string,
    @CurrentUser() currentUser: CurrentAuthUser,
  ) {
    const { user_id } = currentUser.user_metadata;

    return this.lmsAssignmentService.findOneForStudent(assignmentId, user_id);
  }

  @Patch(':assignmentId')
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  update(
    @Param('assignmentId') assignmentId: string,
    @Body() updateAssignmentDto: UpdateAssignmentConfigDto,
  ): Promise<{ message: string }> {
    return this.lmsAssignmentService.update(assignmentId, updateAssignmentDto);
  }

  // @Get()
  // @Roles(Role.STUDENT)
  // @ApiException(() => [BadRequestException, InternalServerErrorException])
  // findAllForStudent(
  //   @CurrentUser() user: CurrentAuthUser,
  //   @Query() filters: FilterModulesDto,
  // ) {
  //   const { user_id } = user.user_metadata;
  //   return this.lmsService.findAllForStudent(user_id, filters);
  // }
}
