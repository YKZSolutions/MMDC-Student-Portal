import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentItemDto } from './dto/create-appointment.dto';
import { UpdateAppointmentItemDto } from './dto/update-appointment.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { AppointmentStatus, Prisma, Role } from '@prisma/client';
import {
  AppointmentDetailsDto,
  AppointmentItemDto,
  PaginatedAppointmentDto,
} from './dto/paginated-appointment.dto';
import { BookedAppointmentDto } from './dto/booked-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { Log } from '@/common/decorators/log.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { FilterAppointmentDto } from './dto/filter-appointment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { BookedAppointment } from './dto/booked-appointment-list';

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private readonly notificationService: NotificationsService,
  ) {}

  /**
   * Creates a new appointment entry in the database.
   *
   * @param createAppointmentDto - The DTO containing the appointment data.
   * @returns The newly created appointment object.
   * @throws NotFoundException - If the related course, student, or mentor ID does not exist.
   */
  @Log({
    logArgsMessage: ({
      createAppointmentDto,
    }: {
      createAppointmentDto: CreateAppointmentItemDto;
    }) =>
      `Creating appointment for student ${createAppointmentDto.studentId} with mentor ${createAppointmentDto.mentorId}`,
    logSuccessMessage: (result) => `Created appointment with ID: ${result.id}`,
    logErrorMessage: (err) =>
      `Failed to create appointment. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException(
        'The specified course, student, or mentor ID was not found.',
      ),
  })
  async create(
    @LogParam('createAppointmentDto')
    createAppointmentDto: CreateAppointmentItemDto,
  ): Promise<AppointmentItemDto> {
    await this.validateCreateAppointment(createAppointmentDto);

    try {
      const appointment = await this.prisma.client.appointment.create({
        data: createAppointmentDto,
        include: {
          courseOffering: {
            include: {
              course: true,
            },
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
              role: true,
            },
          },
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
              role: true,
            },
          },
        },
      });

      await this.notificationService.notifyUser(
        createAppointmentDto.mentorId,
        'Mentoring Appointment Booking',
        `${appointment.student.firstName} ${appointment.student.lastName} has booked an appointment`,
      );

      return {
        ...appointment,
        course: {
          id: appointment.courseOffering.course.id,
          courseCode: appointment.courseOffering.course.courseCode,
          name: appointment.courseOffering.course.name,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaErrorCode.UniqueConstraint) {
          throw new ConflictException(
            'An appointment already exists for this mentor, student, and start time',
          );
        }
      }
      throw error;
    }
  }

  async findBookedRange(
    courseOfferingId: string,
    mentorId: string,
    from: Date,
    to: Date,
  ): Promise<BookedAppointment[]> {
    const appointments = await this.prisma.client.appointment.findMany({
      where: {
        status: 'approved',
        courseOfferingId,
        mentorId,
        startAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
      },
    });

    return appointments;
  }

  /**
   * Retrieves a paginated list of appointments from the database based on user role.
   *
   * @param filters - The filter, search, and pagination options for the query.
   * @param role - The user's role (admin, student, or mentor).
   * @param userId - The user's ID to filter appointments by.
   * @returns A paginated list of appointments.
   */
  @Log({
    logArgsMessage: ({ filters, role, userId }) =>
      `Fetching appointments for role ${role} (user: ${userId}) with filters: ${JSON.stringify(
        filters,
      )}`,
    logSuccessMessage: (result) =>
      `Fetched ${result.meta.totalCount} appointments.`,
    logErrorMessage: (err) =>
      `Failed to fetch appointments. Error: ${err.message}`,
  })
  async findAll(
    @LogParam('filters') filters: FilterAppointmentDto,
    @LogParam('role') role: Role,
    @LogParam('userId') userId: string,
  ): Promise<PaginatedAppointmentDto> {
    const where: Prisma.AppointmentWhereInput = {};
    const page = filters.page || 1;

    if (filters.search?.trim()) {
      const searchTerms = filters.search.trim();

      where.title = {
        contains: searchTerms,
        mode: Prisma.QueryMode.insensitive,
      };
    }

    if (role === 'student') {
      where.studentId = userId;
    } else if (role === 'mentor') {
      where.mentorId = userId;
    }

    where.OR = filters.status?.map((status) => ({
      status: status,
    }));

    const [data, meta] = await this.prisma.client.appointment
      .paginate({
        where,
        include: {
          courseOffering: {
            include: {
              course: true,
            },
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
              role: true,
            },
          },
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
              role: true,
            },
          },
        },
        orderBy: {
          startAt: 'desc',
        },
      })
      .withPages({ limit: 10, page, includePageCount: true });

    const appointments: AppointmentItemDto[] = data.map((item) => ({
      ...item,
      course: {
        id: item.courseOffering.course.id,
        courseCode: item.courseOffering.course.courseCode,
        name: item.courseOffering.course.name,
      },
    }));

    return { appointments, meta };
  }

  /**
   * Retrieves a list of booked appointments for a specific mentor within a date range.
   *
   * @param mentorId - The ID of the mentor.
   * @param startDateRange - (Optional) The start of the date range to filter by.
   * @param endDateRange - (Optional) The end of the date range to filter by.
   * @returns A list of booked appointments.
   */
  @Log({
    logArgsMessage: ({ mentorId, startDateRange, endDateRange }) =>
      `Fetching booked appointments for mentor ${mentorId} from ${startDateRange} to ${endDateRange}`,
    logSuccessMessage: (result) =>
      `Fetched ${result.length} booked appointments.`,
    logErrorMessage: (err) =>
      `Failed to fetch booked appointments. Error: ${err.message}`,
  })
  async findAllBooked(
    @LogParam('mentorId') mentorId: string,
    @LogParam('startDateRange') startDateRange?: Date,
    @LogParam('endDateRange') endDateRange?: Date,
  ): Promise<BookedAppointmentDto[]> {
    return await this.prisma.client.appointment.findMany({
      where: {
        mentorId,
        startAt: {
          gte: startDateRange,
          lte: endDateRange,
        },
        OR: [
          { status: 'booked' },
          { status: 'approved' },
          { status: 'rescheduled' },
          { status: 'finished' },
        ],
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
      },
    });
  }

  /**
   * Retrieves a single appointment by ID, with filtering based on user role.
   *
   * @param id - The ID of the appointment to retrieve.
   * @param role - The user's role (admin, student, or mentor).
   * @param userId - The user's ID to check ownership.
   * @returns The appointment object if found.
   * @throws NotFoundException - If the appointment with the specified ID is not found or the user is not authorized to view it.
   */
  @Log({
    logArgsMessage: ({ id, role, userId }) =>
      `Fetching appointment with ID ${id} for user ${userId} (${role})`,
    logSuccessMessage: (result) =>
      `Successfully fetched appointment with ID: ${result.id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to fetch appointment with ID ${id}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Appointment with ID ${id} was not found.`),
  })
  async findOne(
    @LogParam('id') id: string,
    @LogParam('role') role: Role,
    @LogParam('userId') userId: string,
  ): Promise<AppointmentDetailsDto> {
    const where: Prisma.AppointmentWhereInput = {};

    where.id = id;

    if (role === 'student') {
      where.studentId = userId;
    } else if (role === 'mentor') {
      where.mentorId = userId;
    }

    const appointment = await this.prisma.client.appointment.findFirstOrThrow({
      where: {
        ...where,
      },
      include: {
        courseOffering: {
          include: {
            course: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
          },
        },
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
          },
        },
      },
    });

    const schedule = await this.prisma.client.courseEnrollment.findFirstOrThrow(
      {
        where: {
          courseOffering: {
            course: { id: appointment.courseOffering.courseId },
          },
        },
        include: {
          courseSection: {
            select: {
              id: true,
              startSched: true,
              endSched: true,
              days: true,
            },
          },
        },
      },
    );

    return {
      ...appointment,
      course: {
        id: appointment.courseOffering.id,
        courseCode: appointment.courseOffering.course.courseCode,
        name: appointment.courseOffering.course.name,
      },
      section: schedule.courseSection,
    };
  }

  /**
   * Updates the details of an appointment.
   *
   * @param id - The ID of the appointment to update.
   * @param updateAppointmentDto - The DTO containing the updated appointment data.
   * @returns The updated appointment object.
   * @throws NotFoundException - If the appointment with the specified ID is not found.
   */
  @Log({
    logArgsMessage: ({ id }) =>
      `Updating details for appointment with ID ${id}`,
    logSuccessMessage: (result) =>
      `Successfully updated appointment with ID: ${result.id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to update appointment with ID ${id}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Appointment with ID ${id} was not found.`),
  })
  async updateDetails(
    @LogParam('id') id: string,
    updateAppointmentDto: UpdateAppointmentItemDto,
  ): Promise<AppointmentItemDto> {
    const appointment = await this.prisma.client.appointment.update({
      where: { id },
      data: updateAppointmentDto,
      include: {
        courseOffering: {
          include: {
            course: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
          },
        },
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
          },
        },
      },
    });

    return {
      ...appointment,
      course: {
        id: appointment.courseOffering.course.id,
        courseCode: appointment.courseOffering.course.courseCode,
        name: appointment.courseOffering.course.name,
      },
    };
  }

  /**
   * Updates the status of an appointment.
   *
   * @param id - The ID of the appointment to update.
   * @param updateAppointmentDto - The DTO containing the new status and optional cancel reason.
   * @param role - The user's role performing the update.
   * @returns The updated appointment object.
   * @throws BadRequestException - If the user's role is not allowed to change the status to the desired state.
   * @throws NotFoundException - If the appointment with the specified ID is not found.
   */
  @Log({
    logArgsMessage: ({ id, updateAppointmentDto }) =>
      `Updating status for appointment ${id} to ${updateAppointmentDto.status}`,
    logSuccessMessage: (result) =>
      `Updated status for appointment ${result.id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to update status for appointment ${id}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Appointment with ID ${id} was not found.`),
  })
  async updateStatus(
    @LogParam('id') id: string,
    @LogParam('updateAppointmentDto')
    updateAppointmentDto: UpdateAppointmentStatusDto,
    role: Role,
  ): Promise<AppointmentItemDto> {
    if (
      role === 'student' &&
      updateAppointmentDto.status !== 'cancelled'
      // || (role === 'mentor' && updateAppointmentDto.status === 'cancelled')
    )
      throw new BadRequestException(
        `You are not allowed to change the status of this appointment to ${updateAppointmentDto.status}`,
      );

    const appointment = await this.prisma.client.appointment.update({
      where: { id },
      data: updateAppointmentDto,
      include: {
        courseOffering: {
          include: {
            course: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
          },
        },
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            role: true,
          },
        },
      },
    });

    const notificationMessage: Record<
      Exclude<AppointmentStatus, 'booked' | 'finished' | 'extended'>,
      { title: string; content: string }
    > = {
      approved: {
        title: 'Appointment Accepted',
        content: `Your appointment ${appointment.title} has been accepted`,
      },
      cancelled: {
        title: 'Appointment Cancelled',
        content: `The appointment ${appointment.title} has been cancelled`,
      },
      rescheduled: {
        title: 'Appointment Rescheduled',
        content: `Your appointment ${appointment.title} was rescheduled on another date`,
      },
    };

    await this.notificationService.notifyUser(
      role === 'student' ? appointment.mentor.id : appointment.student.id,
      notificationMessage[updateAppointmentDto.status].title,
      notificationMessage[updateAppointmentDto.status].content,
    );

    return {
      ...appointment,
      course: {
        id: appointment.courseOffering.course.id,
        courseCode: appointment.courseOffering.course.courseCode,
        name: appointment.courseOffering.course.name,
      },
    };
  }

  /**
   * Deletes an appointment (soft or permanent).
   *
   * This endpoint performs either a **soft delete** or a **permanent deletion** of an appointment.
   * - If `directDelete` is true, the appointment is permanently deleted.
   * - If `directDelete` is not provided or false:
   * - If the appointment has not been soft-deleted yet, it will be soft-deleted by setting the `deletedAt` timestamp.
   * - If the appointment has already been soft-deleted, it will be permanently deleted.
   *
   * @param id - The ID of the appointment to delete.
   * @param directDelete - Whether to skip soft delete and directly remove the appointment.
   * @returns A message indicating the result.
   * @throws NotFoundException - If the appointment with the specified ID is not found.
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Removing appointment with ID: ${id}. Direct delete: ${directDelete ?? 'false'}`,
    logSuccessMessage: (result) => result.message,
    logErrorMessage: (err, { id }) =>
      `Failed to remove appointment with ID: ${id}. Error: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`Appointment with ID: ${id} was not found.`),
  })
  async remove(
    @LogParam('id') id: string,
    @LogParam('directDelete') directDelete?: boolean,
  ): Promise<{ message: string }> {
    const prismaClient = this.prisma.client;

    if (!directDelete) {
      const payment = await prismaClient.appointment.findFirstOrThrow({
        where: { id: id },
      });
      if (!payment.deletedAt) {
        await prismaClient.appointment.updateMany({
          where: { id: id },
          data: {
            deletedAt: new Date(),
          },
        });

        return {
          message: 'Appointment has been soft deleted',
        };
      }
    }

    await prismaClient.appointment.delete({
      where: { id: id },
    });

    return {
      message: 'Appointment has been permanently deleted',
    };
  }

  private async validateCreateAppointment(
    createAppointmentDto: CreateAppointmentItemDto,
  ): Promise<void> {
    const { startAt, endAt, mentorId, studentId } = createAppointmentDto;

    // Validate time constraints
    this.validateTimeConstraints(startAt, endAt);

    // Check for scheduling conflicts
    await this.checkSchedulingConflicts(mentorId, studentId, startAt, endAt);

    // Validate business rules
    await this.validateBusinessRules(createAppointmentDto);
  }

  private validateTimeConstraints(startAt: Date, endAt: Date): void {
    const now = new Date();

    // Check if the appointment is in the future
    if (startAt <= now) {
      throw new BadRequestException(
        'Appointment must be scheduled in the future',
      );
    }

    // Check if end time is after start time
    if (endAt <= startAt) {
      throw new BadRequestException('End time must be after start time');
    }
  }

  private async checkSchedulingConflicts(
    mentorId: string,
    studentId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<void> {
    // Check for mentor conflicts
    const mentorConflicts = await this.prisma.client.appointment.findFirst({
      where: {
        mentorId,
        status: { in: ['approved', 'rescheduled', 'extended'] }, // Only check active appointments
        OR: [
          // Case 1: New appointment starts during an existing appointment
          {
            startAt: { lte: startAt },
            endAt: { gt: startAt },
          },
          // Case 2: New appointment ends during an existing appointment
          {
            startAt: { lt: endAt },
            endAt: { gte: endAt },
          },
          // Case 3: New appointment completely overlaps existing appointment
          {
            startAt: { gte: startAt },
            endAt: { lte: endAt },
          },
        ],
      },
    });

    if (mentorConflicts) {
      throw new ConflictException(
        'Mentor is not available during the requested time slot',
      );
    }

    // Check for student conflicts
    const studentConflicts = await this.prisma.client.appointment.findFirst({
      where: {
        studentId,
        status: { in: ['booked', 'approved', 'rescheduled', 'extended'] },
        OR: [
          {
            startAt: { lte: startAt },
            endAt: { gt: startAt },
          },
          {
            startAt: { lt: endAt },
            endAt: { gte: endAt },
          },
          {
            startAt: { gte: startAt },
            endAt: { lte: endAt },
          },
        ],
      },
    });

    if (studentConflicts) {
      throw new ConflictException(
        'Student has a conflicting appointment during the requested time slot',
      );
    }
  }

  private async validateBusinessRules(
    createAppointmentDto: CreateAppointmentItemDto,
  ): Promise<void> {
    const { mentorId, studentId, courseOfferingId } = createAppointmentDto;

    // Verify mentor exists and is active
    const mentor = await this.prisma.client.user.findFirst({
      where: {
        id: mentorId,
        role: Role.mentor,
        deletedAt: null,
      },
    });

    if (!mentor) {
      throw new BadRequestException('Mentor not found or inactive');
    }

    // Verify the student exists and is active
    const student = await this.prisma.client.user.findFirst({
      where: {
        id: studentId,
        role: Role.student,
        deletedAt: null,
      },
    });

    if (!student) {
      throw new BadRequestException('Student not found or inactive');
    }

    // Verify course offering exists and is active
    const courseOffering = await this.prisma.client.courseOffering.findFirst({
      where: {
        id: courseOfferingId,
        deletedAt: null,
      },
      include: {
        courseSections: {
          include: {
            mentor: true,
          },
        },
      },
    });

    if (!courseOffering) {
      throw new BadRequestException('Course offering not found or inactive');
    }

    // Verify mentor is associated with the course offering
    const mentorExists = courseOffering.courseSections.find((section) => {
      return section.mentorId === mentorId;
    });

    if (!mentorExists) {
      throw new BadRequestException(
        'Mentor is not associated with the course offering',
      );
    }
  }
}
