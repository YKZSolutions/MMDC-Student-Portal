import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CourseSectionService } from './courseSection.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ApiOkResponse } from '@nestjs/swagger';
import { CreateCourseSectionFullDto } from './dto/create-courseSection.dto';
import { UpdateCourseSectionDto } from './dto/update-courseSection.dto';
import { Role } from '@/common/enums/roles.enum';

@Controller('enrollments')
export class CourseSectionController {
  constructor(private readonly courseSectionService: CourseSectionService) {}

  /**
   * Retrieves all sections for a specific enrollment period
   *
   * @remarks
   * Fetches a paginated list of course sections.
   * Requires `ADMIN` role.
   */
  @ApiException(() => [BadRequestException])
  @Roles(Role.ADMIN, Role.STUDENT)
  @Get(':enrollmentId/sections')
  findAllCourseSections(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Query() filters: BaseFilterDto,
  ) {
    return this.courseSectionService.findAllCourseSections(
      filters,
      enrollmentId,
    );
  }

  /**
   * Retrieves all sections for a specific course offering
   *
   * @remarks
   * Fetches a paginated list of course sections.
   * Requires `ADMIN` role.
   */
  @ApiException(() => [BadRequestException])
  @Roles(Role.ADMIN, Role.STUDENT)
  @Get(':enrollmentId/offerings/:offeringId/sections')
  findAllCourseSectionsForOffering(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Param('offeringId', new ParseUUIDPipe()) offeringId: string,
    @Query() filters: BaseFilterDto,
  ) {
    return this.courseSectionService.findAllCourseSections(
      filters,
      enrollmentId,
      offeringId,
    );
  }

  /**
   * Creates a new course section under a specific course offering
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the course offering or mentor does not exist
   * @throws BadRequestException If invalid references are provided
   */
  @ApiException(() => [NotFoundException, BadRequestException])
  @Roles(Role.ADMIN)
  @Post(':enrollmentId/offerings/:offeringId/sections')
  createCourseSection(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Param('offeringId', new ParseUUIDPipe()) offeringId: string,
    @Body() dto: CreateCourseSectionFullDto,
  ) {
    return this.courseSectionService.createCourseSection(
      enrollmentId,
      offeringId,
      dto,
    );
  }

  /**
   * Retrieves a specific course section under a course offering
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the section or offering does not exist
   * @throws BadRequestException If ID format is invalid
   */
  @ApiException(() => [NotFoundException, BadRequestException])
  @Roles(Role.ADMIN)
  @Get(':enrollmentId/offerings/:offeringId/sections/:sectionId')
  findOneCourseSection(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Param('offeringId', new ParseUUIDPipe()) offeringId: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
  ) {
    return this.courseSectionService.findOneCourseSection(
      enrollmentId,
      offeringId,
      sectionId,
    );
  }

  /**
   * Updates a course section under a specific course offering
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the section does not exist
   * @throws BadRequestException If invalid relations or closed enrollment
   */
  @ApiException(() => [NotFoundException, BadRequestException])
  @Roles(Role.ADMIN)
  @Patch(':enrollmentId/offerings/:offeringId/sections/:sectionId')
  updateCourseSection(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Param('offeringId', new ParseUUIDPipe()) offeringId: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Body() updateCourseSectionDto: UpdateCourseSectionDto,
  ) {
    return this.courseSectionService.updateCourseSection(
      enrollmentId,
      offeringId,
      sectionId,
      updateCourseSectionDto,
    );
  }

  /**
   * Removes a course section from a specific course offering
   *
   * @remarks
   * Requires `ADMIN` role.
   *
   * @throws NotFoundException If the section does not exist
   * @throws BadRequestException If enrollment is closed or section is referenced
   */
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  })
  @ApiException(() => [NotFoundException, BadRequestException])
  @Roles(Role.ADMIN)
  @Delete(':enrollmentId/offerings/:offeringId/sections/:sectionId')
  removeCourseSection(
    @Param('enrollmentId', new ParseUUIDPipe()) enrollmentId: string,
    @Param('offeringId', new ParseUUIDPipe()) offeringId: string,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
  ) {
    return this.courseSectionService.removeCourseSection(
      enrollmentId,
      offeringId,
      sectionId,
    );
  }
}
