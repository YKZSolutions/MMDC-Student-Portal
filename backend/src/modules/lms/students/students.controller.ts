import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { EnrolledStudentsResponseDto } from './dto/enrolled-students.dto';

@Controller('modules/:moduleId/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * Retrieve all enrolled students for a module
   *
   * @remarks
   * Returns a list of students enrolled in the course offering associated with this module,
   * along with their section information (section name, mentor, etc.).
   * Only returns students from the specified enrollment period (or active period if not specified).
   * Requires `ADMIN` or `MENTOR` role.
   *
   * @param moduleId - The UUID of the module
   * @param courseOfferingId - Optional course offering ID to filter by specific offering
   * @returns A list of enrolled students with their section information
   */
  @Get()
  @Roles(Role.ADMIN, Role.MENTOR)
  @ApiOperation({
    summary: 'Get enrolled students for a module',
    description:
      'Retrieves all students enrolled in the course offering for this module, with their section information',
  })
  @ApiQuery({
    name: 'courseOfferingId',
    required: false,
    description: 'Optional course offering ID to filter by specific offering',
    type: String,
  })
  @ApiOkResponse({
    description: 'Enrolled students retrieved successfully',
    type: EnrolledStudentsResponseDto,
  })
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  async getEnrolledStudents(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Query('courseOfferingId') courseOfferingId?: string,
  ): Promise<EnrolledStudentsResponseDto> {
    return this.studentsService.getEnrolledStudents(moduleId, courseOfferingId);
  }
}
