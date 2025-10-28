import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentItemDto } from './dto/create-appointment.dto';
import { UpdateAppointmentItemDto } from './dto/update-appointment.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  AppointmentStatus,
  CourseEnrollmentStatus,
  Prisma,
  Role,
} from '@prisma/client';
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
import { FilterMentorAvailabilityDto } from '@/modules/appointments/dto/filter-mentor-availability.dto';
import {
  MentorAvailabilityDto,
  TimeSlotDto,
} from '@/modules/appointments/dto/mentor-availability.dto';

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

  @Log({
    logArgsMessage: ({ courseOfferingId, mentorId, from, to }) =>
      `Finding booked appointments for mentor ${mentorId} in course ${courseOfferingId} from ${from} to ${to}`,
    logSuccessMessage: (result) =>
      `Found ${result.length} booked appointments in the specified range`,
    logErrorMessage: (error, { courseOfferingId, mentorId }) =>
      `Failed to find booked appointments for mentor ${mentorId} in course ${courseOfferingId}: ${error.message}`,
  })
  async findBookedRange(
    @LogParam('courseOfferingId') courseOfferingId: string,
    @LogParam('mentorId') mentorId: string,
    @LogParam('from') from: Date,
    @LogParam('to') to: Date,
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

      where.AND = {
        OR: [
          {
            title: {
              contains: searchTerms,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: searchTerms,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            courseOffering: {
              course: {
                name: {
                  contains: searchTerms,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
          {
            mentor: {
              firstName: {
                contains: searchTerms,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        ],
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

  @Log({
    logArgsMessage: ({ filters, userId, role }) =>
      `Finding mentor availability for user ${userId} (${role}) with filters: ${JSON.stringify(filters)}`,
    logSuccessMessage: (result) =>
      `Found ${result.freeSlots?.length || 0} available slots for mentor`,
    logErrorMessage: (err, { filters, userId }) =>
      `Failed to find mentor availability for user ${userId}. Error: ${err.message}`,
  })
  async findMentorAvailability(
    @LogParam('filters') filters: FilterMentorAvailabilityDto,
    @LogParam('userId') userId: string, // Student ID
    @LogParam('role') role: Role, // Add role parameter for authorization
  ): Promise<MentorAvailabilityDto> {
    const { mentorId, startDate, endDate, duration = 60, search } = filters;

    // Validate required parameters
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    // Validate date range (max 30 days to prevent performance issues)
    const maxDateRange = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (
      new Date(endDate).getTime() - new Date(startDate).getTime() >
      maxDateRange
    ) {
      throw new BadRequestException('Date range cannot exceed 30 days');
    }

    // Validate duration
    if (duration < 15 || duration > 480) {
      throw new BadRequestException(
        'Duration must be between 15 and 480 minutes',
      );
    }

    // If mentorId is not provided but search is, find mentors based on search criteria
    let resolvedMentorId: string | undefined = mentorId;
    let mentors: Array<{
      id: string;
      firstName: string;
      lastName: string;
    }> = [];

    if (!mentorId && search) {
      mentors = await this.findMentorsBySearch(search, userId, role);
      if (mentors.length === 0) {
        return {
          mentors: [],
          dateRange: { startDate, endDate },
          freeSlots: [],
          meta: {
            totalFreeSlots: 0,
            slotDuration: duration,
            generatedAt: new Date().toISOString(),
          },
        };
      }
      // For now, use the first mentor found
      resolvedMentorId = mentors[0].id;
    } else if (!mentorId) {
      throw new BadRequestException(
        'Either mentorId or search parameter is required',
      );
    }

    // For students, validate they are enrolled in the mentor's course/section
    if (role === Role.student && resolvedMentorId) {
      await this.validateStudentEnrollment(userId, resolvedMentorId);
    }

    // If we have a resolved mentor ID, get their availability
    let freeSlots: TimeSlotDto[] = [];
    if (resolvedMentorId) {
      try {
        const bookedAppointments = await this.getBookedAppointments(
          resolvedMentorId,
          startDate,
          endDate,
        );

        const workingHours = await this.getMentorWorkingHours(resolvedMentorId);

        // Generate free time slots
        const generatedSlots = this.generateFreeTimeSlots(
          startDate,
          endDate,
          bookedAppointments,
          workingHours,
          duration,
        );

        // Ensure we have a proper array
        freeSlots = Array.isArray(generatedSlots) ? generatedSlots : [];
      } catch (error) {
        freeSlots = [];
      }
    }

    // If we searched for mentors, return the list along with availability for the first one
    if (mentors.length > 0 && resolvedMentorId) {
      return {
        mentors,
        selectedMentor: {
          id: resolvedMentorId,
          name: `${mentors[0].firstName} ${mentors[0].lastName}`,
        },
        dateRange: { startDate, endDate },
        freeSlots,
        meta: {
          totalFreeSlots: freeSlots.length,
          slotDuration: duration,
          generatedAt: new Date().toISOString(),
          totalMentorsFound: mentors.length,
        },
      };
    }

    return {
      mentorId: resolvedMentorId!,
      dateRange: { startDate, endDate },
      freeSlots,
      meta: {
        totalFreeSlots: freeSlots.length,
        slotDuration: duration,
        generatedAt: new Date().toISOString(),
      },
    };
  }
  // Updated method to find mentors by course name or mentor name with proper typing
  @Log({
    logArgsMessage: ({ search, studentId, role }) =>
      `Searching for mentors with term "${search}" for student ${studentId} (${role})`,
    logSuccessMessage: (result) =>
      `Found ${result.length} mentors matching search criteria`,
    logErrorMessage: (err, { search }) =>
      `Failed to search for mentors with term "${search}". Error: ${err.message}`,
  })
  private async findMentorsBySearch(
    @LogParam('search') search: string,
    @LogParam('studentId') studentId: string,
    @LogParam('role') role: Role,
  ): Promise<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      middleName?: string;
    }>
  > {
    const searchTerm = search.trim().toLowerCase();

    // Base query for mentors
    const mentorsQuery = {
      where: {
        deletedAt: null,
        role: Role.mentor,
        OR: [
          {
            firstName: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
          {
            lastName: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    };

    // If a user is a student, filter mentors from courses they're enrolled in
    if (role === Role.student) {
      // Get course sections where the student is enrolled
      const studentEnrollments =
        await this.prisma.client.courseEnrollment.findMany({
          where: {
            studentId,
            deletedAt: null,
            status: {
              in: [
                'enlisted',
                'finalized',
                'enrolled',
              ] as CourseEnrollmentStatus[],
            },
          },
          include: {
            courseSection: {
              include: {
                mentor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                courseOffering: {
                  include: {
                    course: {
                      select: {
                        id: true,
                        name: true,
                        courseCode: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

      // Filter enrollments by search term (mentor name OR course name)
      const filteredEnrollments = studentEnrollments.filter((enrollment) => {
        const mentor = enrollment.courseSection.mentor;
        if (!mentor) return false;

        const mentorFullName =
          `${mentor.firstName} ${mentor.lastName}`.toLowerCase();
        const courseName =
          enrollment.courseSection.courseOffering.course.name.toLowerCase();
        const courseCode =
          enrollment.courseSection.courseOffering.course.courseCode.toLowerCase();

        return (
          mentorFullName.includes(searchTerm) ||
          mentor.firstName.toLowerCase().includes(searchTerm) ||
          mentor.lastName.toLowerCase().includes(searchTerm) ||
          courseName.includes(searchTerm) ||
          courseCode.includes(searchTerm)
        );
      });

      // Extract unique mentors from filtered enrollments
      const filteredMentors = filteredEnrollments
        .map((enrollment) => enrollment.courseSection.mentor!)
        .filter(
          (mentor, index, array) =>
            array.findIndex((m) => m.id === mentor.id) === index,
        );

      return filteredMentors;
    }

    // For admin/mentor roles, search by course name and mentor name
    if (role === Role.admin || role === Role.mentor) {
      // Search by course name
      const mentorsByCourse = await this.prisma.client.courseSection.findMany({
        where: {
          deletedAt: null,
          mentor: {
            deletedAt: null,
            role: Role.mentor,
          },
          OR: [
            {
              courseOffering: {
                deletedAt: null,
                course: {
                  name: {
                    contains: searchTerm,
                    mode: 'insensitive' as const,
                  },
                },
              },
            },
            {
              courseOffering: {
                deletedAt: null,
                course: {
                  courseCode: {
                    contains: searchTerm,
                    mode: 'insensitive' as const,
                  },
                },
              },
            },
          ],
        },
        select: {
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              middleName: true,
            },
          },
        },
      });

      // Filter out null mentors and deduplicate
      const uniqueMentorsByCourse = mentorsByCourse
        .map((section) => section.mentor)
        .filter(
          (mentor): mentor is NonNullable<typeof mentor> => mentor !== null,
        )
        .filter(
          (mentor, index, array) =>
            array.findIndex((m) => m.id === mentor.id) === index,
        );

      // Also get mentors by name
      const mentorsByName =
        await this.prisma.client.user.findMany(mentorsQuery);

      // Combine and deduplicate
      const allMentors = [...uniqueMentorsByCourse, ...mentorsByName];
      return allMentors.filter(
        (mentor, index, array) =>
          array.findIndex((m) => m.id === mentor.id) === index,
      );
    }

    // For other cases, just search by name
    return await this.prisma.client.user.findMany(mentorsQuery);
  }

  // Validate that a student is enrolled in a course/section taught by the mentor
  @Log({
    logArgsMessage: ({ studentId, mentorId }) =>
      `Validating enrollment for student ${studentId} with mentor ${mentorId}`,
    logSuccessMessage: () => 'Student enrollment validation successful',
    logErrorMessage: (err, { studentId, mentorId }) =>
      `Failed to validate enrollment for student ${studentId} with mentor ${mentorId}. Error: ${err.message}`,
  })
  private async validateStudentEnrollment(
    @LogParam('studentId') studentId: string,
    @LogParam('mentorId') mentorId: string,
  ): Promise<void> {
    const enrollment = await this.prisma.client.courseEnrollment.findFirst({
      where: {
        studentId,
        deletedAt: null,
        status: {
          in: ['enlisted', 'finalized', 'enrolled'] as CourseEnrollmentStatus[],
        },
        courseSection: {
          mentorId,
          deletedAt: null,
        },
      },
      include: {
        courseSection: {
          select: {
            name: true,
            courseOffering: {
              select: {
                course: {
                  select: {
                    name: true,
                    courseCode: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You are not enrolled in any course section taught by this mentor',
      );
    }
  }

  @Log({
    logArgsMessage: ({ mentorId }) =>
      `Getting working hours for mentor ${mentorId}`,
    logSuccessMessage: (result) =>
      `Found working hours for ${result.workingDays?.length || 0} days`,
    logErrorMessage: (err, { mentorId }) =>
      `Failed to get working hours for mentor ${mentorId}. Error: ${err.message}`,
  })
  private async getMentorWorkingHours(@LogParam('mentorId') mentorId: string) {
    try {
      const courseSections = await this.prisma.client.courseSection.findMany({
        where: {
          mentorId,
          deletedAt: null,
          courseOffering: {
            deletedAt: null,
          },
        },
        select: {
          startSched: true,
          endSched: true,
          days: true,
        },
      });

      if (courseSections.length === 0) {
        throw new NotFoundException('No working hours found for this mentor');
      }

      // Group working hours by day - convert string days to numbers
      const workingHoursByDay = new Map<
        number,
        { start: string; end: string }[]
      >();

      // Map day strings to numbers (Monday = 1, Sunday = 0)
      const dayMap: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      };

      courseSections.forEach((section, index) => {
        section.days.forEach((day: string) => {
          const dayNumber = dayMap[day.toLowerCase()];
          if (dayNumber === undefined) {
            return;
          }

          if (!workingHoursByDay.has(dayNumber)) {
            workingHoursByDay.set(dayNumber, []);
          }
          // Use non-null assertion since we just set it if it didn't exist
          workingHoursByDay.get(dayNumber)!.push({
            start: section.startSched,
            end: section.endSched,
          });
        });
      });

      return {
        workingHoursByDay,
        workingDays: Array.from(workingHoursByDay.keys()),
      };
    } catch (error) {
      throw error;
    }
  }

  @Log({
    logArgsMessage: ({ mentorId, startDate, endDate }) =>
      `Getting booked appointments for mentor ${mentorId} from ${startDate} to ${endDate}`,
    logSuccessMessage: (result) => `Found ${result.length} booked appointments`,
    logErrorMessage: (err, { mentorId }) =>
      `Failed to get booked appointments for mentor ${mentorId}. Error: ${err.message}`,
  })
  private async getBookedAppointments(
    @LogParam('mentorId') mentorId: string,
    @LogParam('startDate') startDate: Date,
    @LogParam('endDate') endDate: Date,
  ) {
    if (!mentorId) {
      return [];
    }

    return await this.prisma.client.appointment.findMany({
      where: {
        mentorId,
        deletedAt: null,
        OR: [
          // Appointments that overlap with the date range
          {
            startAt: { lt: endDate },
            endAt: { gt: startDate },
          },
        ],
        status: {
          in: [
            'booked',
            'approved',
            'rescheduled',
            'extended',
          ] as AppointmentStatus[],
        },
      },
      select: {
        startAt: true,
        endAt: true,
      },
      orderBy: {
        startAt: 'asc',
      },
    });
  }

  private generateFreeTimeSlots(
    @LogParam('startDate') startDate: Date,
    @LogParam('endDate') endDate: Date,
    @LogParam('bookedAppointments')
    bookedAppointments: { startAt: Date; endAt: Date }[],
    @LogParam('workingHours')
    workingHours: {
      workingHoursByDay: Map<number, { start: string; end: string }[]>;
    },
    @LogParam('duration') duration: number,
  ): { start: Date; end: Date }[] {
    try {
      const freeSlots: { start: Date; end: Date }[] = [];
      const currentDate = new Date(startDate);
      const end = new Date(endDate);
      const durationMs = duration * 60 * 1000;

      // Validate inputs
      if (isNaN(currentDate.getTime()) || isNaN(end.getTime())) {
        return [];
      }

      if (durationMs <= 0) {
        return [];
      }

      // Convert booked appointments to time ranges for easier comparison
      const bookedRanges = bookedAppointments
        .map((appt) => {
          if (
            !appt.startAt ||
            !appt.endAt ||
            isNaN(appt.startAt.getTime()) ||
            isNaN(appt.endAt.getTime())
          ) {
            return null;
          }
          return {
            start: appt.startAt.getTime(),
            end: appt.endAt.getTime(),
          };
        })
        .filter(
          (range): range is { start: number; end: number } => range !== null,
        );

      let processedDays = 0;
      let totalSlotsGenerated = 0;

      while (currentDate <= end) {
        processedDays++;
        const dayOfWeek = currentDate.getDay();

        // Get working hours for this specific day
        const dayWorkingHours = workingHours.workingHoursByDay.get(dayOfWeek);

        if (dayWorkingHours && dayWorkingHours.length > 0) {
          // Process each working hour block for this day
          for (const workBlock of dayWorkingHours) {
            // Parse time strings safely
            const startParts = workBlock.start.split(':').map(Number);
            const endParts = workBlock.end.split(':').map(Number);

            if (startParts.length < 2 || endParts.length < 2) {
              continue;
            }

            const startHour = startParts[0];
            const startMinute = startParts[1] || 0;
            const endHour = endParts[0];
            const endMinute = endParts[1] || 0;

            const dayStart = new Date(currentDate);
            dayStart.setHours(startHour, startMinute, 0, 0);

            const dayEnd = new Date(currentDate);
            dayEnd.setHours(endHour, endMinute, 0, 0);

            // Only generate slots if the day is within our date range
            if (dayStart < end && dayEnd > currentDate) {
              const slotsFromBlock = this.generateSlotsForTimeBlock(
                dayStart,
                dayEnd,
                bookedRanges,
                durationMs,
              );
              // Add null/undefined check before spreading
              if (slotsFromBlock && Array.isArray(slotsFromBlock)) {
                freeSlots.push(...slotsFromBlock);
                totalSlotsGenerated += slotsFromBlock.length;
              }
            }
          }
        }

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);
      }

      // Explicitly return the array
      return freeSlots;
    } catch (error) {
      return [];
    }
  }

  private generateSlotsForTimeBlock(
    blockStart: Date,
    blockEnd: Date,
    bookedRanges: { start: number; end: number }[],
    durationMs: number,
  ): { start: Date; end: Date }[] {
    const slots: { start: Date; end: Date }[] = [];

    try {
      let currentSlotStart = new Date(blockStart);

      while (currentSlotStart < blockEnd) {
        const slotEnd = new Date(currentSlotStart.getTime() + durationMs);

        // If slot extends beyond working hours, stop
        if (slotEnd > blockEnd) {
          break;
        }

        // Check if this slot conflicts with any booked appointments
        const isConflict = bookedRanges.some((booked) =>
          this.isTimeOverlap(
            currentSlotStart.getTime(),
            slotEnd.getTime(),
            booked.start,
            booked.end,
          ),
        );

        if (!isConflict) {
          slots.push({
            start: new Date(currentSlotStart),
            end: slotEnd,
          });
        }

        // Move to the next potential slot (15-minute intervals)
        currentSlotStart = new Date(
          currentSlotStart.getTime() + 15 * 60 * 1000,
        );
      }
    } catch (error) {
      // Return empty array on error instead of potentially undefined
      return [];
    }

    return slots;
  }

  // Improved time overlap detection
  @Log({
    logArgsMessage: ({ slotStart, slotEnd, bookedStart, bookedEnd }) =>
      `Checking time overlap: slot [${new Date(slotStart).toISOString()} - ${new Date(slotEnd).toISOString()}] vs booked [${new Date(bookedStart).toISOString()} - ${new Date(bookedEnd).toISOString()}]`,
    logSuccessMessage: (result) =>
      `Time overlap check result: ${result ? 'overlap' : 'no overlap'}`,
    logErrorMessage: (err) =>
      `Failed to check time overlap. Error: ${err.message}`,
  })
  private isTimeOverlap(
    @LogParam('slotStart') slotStart: number,
    @LogParam('slotEnd') slotEnd: number,
    @LogParam('bookedStart') bookedStart: number,
    @LogParam('bookedEnd') bookedEnd: number,
  ): boolean {
    return slotStart < bookedEnd && slotEnd > bookedStart;
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

  @Log({
    logArgsMessage: ({ createAppointmentDto }) =>
      `Validating appointment creation for student ${createAppointmentDto.studentId} with mentor ${createAppointmentDto.mentorId}`,
    logSuccessMessage: () => 'Appointment validation successful',
    logErrorMessage: (error) =>
      `Appointment validation failed: ${error.message}`,
  })
  private async validateCreateAppointment(
    @LogParam('createAppointmentDto')
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

  @Log({
    logArgsMessage: ({ startAt, endAt }) =>
      `Validating time constraints for appointment from ${startAt} to ${endAt}`,
    logSuccessMessage: () => 'Time constraints validation successful',
    logErrorMessage: (error) =>
      `Time constraints validation failed: ${error.message}`,
  })
  private validateTimeConstraints(
    @LogParam('startAt') startAt: Date,
    @LogParam('endAt') endAt: Date,
  ): void {
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

  @Log({
    logArgsMessage: ({ mentorId, studentId, startAt, endAt }) =>
      `Checking scheduling conflicts for mentor ${mentorId} and student ${studentId} from ${startAt} to ${endAt}`,
    logSuccessMessage: () => 'No scheduling conflicts found',
    logErrorMessage: (error) =>
      `Scheduling conflict check failed: ${error.message}`,
  })
  private async checkSchedulingConflicts(
    @LogParam('mentorId') mentorId: string,
    @LogParam('studentId') studentId: string,
    @LogParam('startAt') startAt: Date,
    @LogParam('endAt') endAt: Date,
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

  @Log({
    logArgsMessage: ({ createAppointmentDto }) =>
      `Validating business rules for appointment with mentor ${createAppointmentDto.mentorId}`,
    logSuccessMessage: () => 'Business rules validation successful',
    logErrorMessage: (error) =>
      `Business rules validation failed: ${error.message}`,
  })
  private async validateBusinessRules(
    @LogParam('createAppointmentDto')
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
