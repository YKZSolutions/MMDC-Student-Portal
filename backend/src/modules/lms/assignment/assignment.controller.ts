import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
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
import { UpdateAssignmentConfigDto } from '@/modules/lms/assignment/dto/update-assignment-config.dto';

@Controller('modules/:moduleId/:moduleContentId/assignments')
export class AssignmentController {
  constructor(private readonly lmsAssignmentService: AssignmentService) {}

  @Post('/:assignmentId')
  @ApiException(() => [InternalServerErrorException])
  submit(
    @Param('assignmentId', new ParseUUIDPipe()) assignmentId: string,
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

  @Get('/admin/all')
  @Roles(Role.ADMIN)
  @ApiException(() => [InternalServerErrorException])
  findAllForAdmin(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Query() filters: BaseFilterDto,
  ) {
    return this.lmsAssignmentService.findAllForAdmin(moduleId, filters);
  }

  @Get('/mentor/all')
  @Roles(Role.MENTOR)
  @ApiException(() => [InternalServerErrorException])
  findAllForMentor(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
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

  @Get('/student/all')
  @Roles(Role.STUDENT)
  @ApiException(() => [InternalServerErrorException])
  findAllForStudent(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
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

  @Get()
  @ApiException(() => [InternalServerErrorException])
  findOne(
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
  ) {
    return this.lmsAssignmentService.findOne(moduleContentId);
  }

  @Get('/student')
  @Roles(Role.STUDENT)
  @ApiException(() => [InternalServerErrorException])
  findOneForStudent(
    @Param('moduleContentId', new ParseUUIDPipe()) moduleContentId: string,
    @CurrentUser() currentUser: CurrentAuthUser,
  ) {
    const { user_id } = currentUser.user_metadata;

    return this.lmsAssignmentService.findOneForStudent(
      moduleContentId,
      user_id,
    );
  }

  @Patch('/:assignmentId')
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  update(
    @Param('assignmentId', new ParseUUIDPipe()) assignmentId: string,
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
