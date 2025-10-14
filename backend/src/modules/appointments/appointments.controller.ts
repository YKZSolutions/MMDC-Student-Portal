import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentItemDto } from './dto/create-appointment.dto';
import { UpdateAppointmentItemDto } from './dto/update-appointment.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { BookedAppointmentFilterDto } from './dto/booked-appointment.dto';
import { UsersService } from '../users/users.service';
import { CourseEnrollmentService } from '../enrollment/course-enrollment.service';
import { FilterAppointmentDto } from './dto/filter-appointment.dto';
import { FilterBookedAppointment } from './dto/filter-booked-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly usersService: UsersService,
    private readonly enrolledCoursesService: CourseEnrollmentService,
  ) {}

  /**
   * Create a new appointment
   * @remarks This operation allows a student to create a new appointment with a mentor.
   */
  @Post()
  @Roles(Role.STUDENT)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  create(@Body() createAppointmentDto: CreateAppointmentItemDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  /**
   * Fetch mentors (Temporary)
   * @remarks This operation retrieves a paginated list of mentors.
   */
  @Get('mentors')
  findMentor(@Query() filters: BaseFilterDto) {
    return this.usersService.findAll({
      ...filters,
      role: 'mentor',
    });
  }

  @Get('courses')
  @Roles(Role.STUDENT)
  async findCourses(@CurrentUser() user: CurrentAuthUser) {
    const { role, user_id } = user.user_metadata;

    return this.enrolledCoursesService.getCourseEnrollments(user_id, role);
  }

  @Get('booked')
  @Roles(Role.STUDENT)
  async findBookedRange(@Query() query: FilterBookedAppointment) {
    const start = new Date(query.from);
    const end = new Date(query.to);
    return this.appointmentsService.findBookedRange(
      query.courseId,
      query.mentorId,
      start,
      end,
    );
  }

  /**
   * Fetch courses (Temporary)
   * @remarks This operation retrieves a paginated list of courses.
   */
  @Get()
  @ApiException(() => [InternalServerErrorException])
  findAll(
    @Query() filters: FilterAppointmentDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { role, user_id } = user.user_metadata;

    return this.appointmentsService.findAll(filters, role, user_id);
  }

  /**
   * Fetch all booked appointments for a mentor
   * @remarks This operation retrieves a list of a mentor's booked appointments within a specified date range.
   */
  @Get(':mentorId/mentor')
  @ApiException(() => [InternalServerErrorException])
  findAllBooked(
    @Param('mentorId') mentorId: string,
    @Query() filters: BookedAppointmentFilterDto,
  ) {
    return this.appointmentsService.findAllBooked(
      mentorId,
      filters.startAt,
      filters.endAt,
    );
  }

  /**
   * Fetch a single appointment
   * @remarks This operation retrieves a single appointment by its ID, restricted to appointments associated with the authenticated user.
   */
  @Get(':id')
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentAuthUser) {
    const { role, user_id } = user.user_metadata;

    return this.appointmentsService.findOne(id, role, user_id);
  }

  /**
   * Update appointment details
   * @remarks This operation allows a mentor to update the details of a specific appointment.
   */
  @Patch(':id')
  @Roles(Role.MENTOR)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  updateDetails(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentItemDto,
  ) {
    return this.appointmentsService.updateDetails(id, updateAppointmentDto);
  }

  /**
   * Update appointment status
   * @remarks This operation allows a student or mentor to update the status of an appointment, with role-based restrictions on which status changes are allowed.
   */
  @Patch(':id/status')
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  updateStatus(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentStatusDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { role } = user.user_metadata;

    return this.appointmentsService.updateStatus(
      id,
      updateAppointmentDto,
      role,
    );
  }

  /**
   * Delete an appointment (temporary or permanent)
   * @remarks This endpoint soft-deletes or permanently removes an appointment based on the `directDelete` query parameter.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(@Param('id') id: string, @Query() query?: DeleteQueryDto) {
    return this.appointmentsService.remove(id, query?.directDelete);
  }
}
