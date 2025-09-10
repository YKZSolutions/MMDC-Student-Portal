import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { CourseOfferingService } from './course-offering.service';
import { CreateCourseOfferingDto } from './dto/create-course-offering.dto';
import { FilterCourseOfferingDto } from './dto/filter-course-offering.dto';
import { CreateCourseOfferingCurriculumDto } from './dto/create-course-offering-curriculum.dto';

@Controller('enrollments')
export class CourseOfferingController {
  constructor(private readonly courseOfferingService: CourseOfferingService) {}

  /**
   * Creates a new course offering under a specific enrollment period
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the enrollment period or course does not exist
   * @throws BadRequestException If invalid references are provided
   */
  @ApiException(() => [NotFoundException, BadRequestException])
  @Roles(Role.ADMIN)
  @Post(':enrollmentId/offerings')
  createCourseOffering(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Body() dto: CreateCourseOfferingDto,
  ) {
    return this.courseOfferingService.createCourseOffering(enrollmentId, dto);
  }

  /**
   * Creates a course offerings given a curriculum
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the enrollment period or course does not exist
   * @throws BadRequestException If invalid references are provided
   */
  @ApiException(() => [NotFoundException, BadRequestException])
  @Roles(Role.ADMIN)
  @Post(':enrollmentId/curriculum')
  createCourseOfferingsByCurriculumId(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Body() dto: CreateCourseOfferingCurriculumDto,
  ) {
    return this.courseOfferingService.createCourseOfferingsByCurriculum(
      enrollmentId,
      dto,
    );
  }

  /**
   * Retrieves all course offerings in a specific enrollment period
   *
   * @remarks
   * Fetches a paginated list of course offerings for the given period.
   * Requires `ADMIN` or `STUDENT` role.
   */
  @Roles(Role.ADMIN, Role.STUDENT)
  @Get(':enrollmentId/offerings')
  findCourseOfferingsByPeriod(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Query() filters: FilterCourseOfferingDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    return this.courseOfferingService.findAllCourseOfferings(
      filters,
      enrollmentId,
      user,
    );
  }

  /**
   * Retrieves a specific course offering by ID
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the offering does not exist
   * @throws BadRequestException If ID format is invalid
   */
  @ApiException(() => [NotFoundException, BadRequestException])
  @Roles(Role.ADMIN)
  @Get(':enrollmentId/offerings/:offeringId')
  findOneCourseOffering(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Param('offeringId', new ParseUUIDPipe()) offeringId: string,
  ) {
    return this.courseOfferingService.findOneCourseOffering(
      enrollmentId,
      offeringId,
    );
  }

  /**
   * Removes a course offering from a specific enrollment period
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the course offering does not exist
   * @throws BadRequestException If enrollment is closed or offering is referenced
   */
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Roles(Role.ADMIN)
  @Delete(':enrollmentId/offerings/:offeringId')
  removeCourseOffering(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Param('offeringId', new ParseUUIDPipe()) offeringId: string,
  ) {
    return this.courseOfferingService.removeCourseOffering(
      enrollmentId,
      offeringId,
    );
  }
}
