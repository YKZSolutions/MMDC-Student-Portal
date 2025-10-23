import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { DueFilterDto } from '@/common/dto/due-filter.dto';
import {
  parseRelativeDateRange,
  RelativeDateRange,
} from '@/common/utils/date-range.util';
import { GeminiService } from '@/lib/gemini/gemini.service';
import { N8nService } from '@/lib/n8n/n8n.service';
import { EnrollmentService } from '@/modules/enrollment/enrollment.service';
import {
  Injectable,
  NotImplementedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AppointmentsService } from '../appointments/appointments.service';
import { FilterAppointmentDto } from '../appointments/dto/filter-appointment.dto';
import { BillingService } from '../billing/billing.service';
import { DetailedBillDto } from '../billing/dto/detailed-bill.dto';
import { FilterBillDto } from '../billing/dto/filter-bill.dto';
import { CoursesService } from '../courses/courses.service';
import { CourseEnrollmentService } from '../enrollment/course-enrollment.service';
import { FilterEnrollmentDto } from '../enrollment/dto/filter-enrollment.dto';
import { FilterModulesDto } from '../lms/lms-module/dto/filter-modules.dto';
import { PaginatedModulesDto } from '../lms/lms-module/dto/paginated-module.dto';
import { LmsService } from '../lms/lms-module/lms.service';
import { FilterNotificationDto } from '../notifications/dto/filter-notification.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { FilterUserDto } from '../users/dto/filter-user.dto';
import {
  UserStaffDetailsDto,
  UserStudentDetailsDto,
} from '../users/dto/user-details.dto';
import { UsersService } from '../users/users.service';
import { ChatbotResponseDto } from './dto/chatbot-response.dto';
import { PromptDto } from './dto/prompt.dto';
import {
  UserBaseContext,
  UserStaffContext,
  UserStudentContext,
} from './dto/user-context.dto';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly gemini: GeminiService,
    private readonly usersService: UsersService,
    private readonly billingService: BillingService,
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentService,
    private readonly courseEnrollmentService: CourseEnrollmentService,
    private readonly lmsService: LmsService,
    private readonly appointmentsService: AppointmentsService,
    private readonly notificationsService: NotificationsService,
    private readonly n8n: N8nService,
  ) {}

  private mapUserToContext(
    role: Role,
    user: UserStudentDetailsDto | UserStaffDetailsDto,
  ): UserBaseContext | UserStudentContext | UserStaffContext {
    // Create base context with required fields
    const baseContext: UserBaseContext = {
      id: user.id,
      name: user.firstName,
      role: role,
      email: user.email,
    };

    // If the user is a student and has student details
    if (role === 'student' && 'studentDetails' in user && user.studentDetails) {
      return {
        ...baseContext,
        studentNumber: user.studentDetails.studentNumber,
      } as UserStudentContext;
    }

    // If the user is staff and has staff details
    if (
      (role === 'admin' || role === 'mentor') &&
      'staffDetails' in user &&
      user.staffDetails
    ) {
      return {
        ...baseContext,
        employeeNumber: user.staffDetails.employeeNumber,
        department: user.staffDetails.department || '',
        position: user.staffDetails.position || '',
      } as UserStaffContext;
    }

    // Return base context if no specific role details are available
    return baseContext;
  }

  @Log({
    logArgsMessage: ({
      authId,
      role,
      prompt,
    }: {
      authId: string;
      role: string;
      prompt: PromptDto;
    }) =>
      `Handle chatbot question authId=${authId}, role=${role}, question="${prompt.question}"`,
    logSuccessMessage: (_, { authId, role }) =>
      `Successfully handled chatbot question userId=${authId}, role=${role}`,
    logErrorMessage: (err, { authId, role }) =>
      `Failed to handle chatbot question userId=${authId}, role=${role} | Error=${err.message}`,
  })
  async handleQuestion(
    @LogParam('authId') authId: string,
    @LogParam('role') role: Role,
    @LogParam('prompt') prompt: PromptDto,
  ): Promise<ChatbotResponseDto> {
    const result: ChatbotResponseDto = { response: '' };

    const userDetails = await this.usersService.getMe(authId);
    const userContext: UserBaseContext | UserStudentContext | UserStaffContext =
      this.mapUserToContext(role, await this.usersService.getMe(authId));

    const { call, text } = await this.gemini.askWithFunctionCalling(
      prompt.question,
      userContext,
      prompt.sessionHistory,
    );

    if (!call) {
      if (!text) {
        throw new ServiceUnavailableException('No response from Gemini');
      }

      result.response = text;
      return result;
    }

    const functionCallResults = await Promise.all(
      call.map(async (functionCall) => {
        switch (functionCall.name) {
          case 'users_count_all': {
            if (userContext.role !== 'admin') {
              return 'This user does not have permission to count users.';
            }

            const args = functionCall.args as FilterUserDto;
            const count = await this.usersService.countAll(args);
            return `Found ${count} users${args.role ? ` with role '${args.role}'` : ''}${args.search ? ` matching '${args.search}'` : ''}.`;
          }

          case 'users_find_self': {
            return `User details: ${JSON.stringify(userDetails)}`;
          }

          case 'courses_find_all': {
            const args = functionCall.args as BaseFilterDto;
            const courses = await this.coursesService.findAll(args);
            return `Courses${args.search ? ` matching '${args.search}'` : ''}: ${JSON.stringify(courses.courses)}`;
          }

          case 'courses_find_one': {
            const { id } = functionCall.args as { id: string };
            const course = await this.coursesService.findOne(id);
            return `Course: ${JSON.stringify(course)}`;
          }

          case 'enrollment_find_active': {
            const enrollment =
              await this.enrollmentsService.findActiveEnrollment();
            return `Active enrollment: ${JSON.stringify(enrollment)}`;
          }

          case 'enrollment_find_all': {
            const args = functionCall.args as FilterEnrollmentDto;
            const enrollments =
              await this.enrollmentsService.findAllEnrollments(args);
            return `Enrollment periods: ${JSON.stringify(enrollments)}`;
          }

          case 'enrollment_my_courses': {
            const courses =
              await this.courseEnrollmentService.getCourseEnrollments(
                userContext.id,
                userContext.role,
              );
            return `Active enrolled courses: ${JSON.stringify(courses)}`;
          }

          case 'lms_my_modules': {
            const args = functionCall.args as FilterModulesDto;
            let modules: PaginatedModulesDto;
            switch (userContext.role) {
              case 'student':
                modules = await this.lmsService.findAllForStudent(
                  userContext.id,
                  args,
                );
                break;
              case 'mentor':
                modules = await this.lmsService.findAllForMentor(
                  userContext.id,
                  args,
                );
                break;
              case 'admin':
                modules = await this.lmsService.findAllForAdmin(args);
                break;
            }
            return `My modules: ${JSON.stringify(modules)}`;
          }

          case 'billing_my_invoices': {
            if (userContext.role !== 'student') {
              return 'Non students do not have invoices.';
            }

            const args = functionCall.args as FilterBillDto;
            const invoices = await this.billingService.findAll(
              args,
              userContext.role,
              userContext.id,
            );
            return `My invoices: ${JSON.stringify(invoices)}`;
          }

          case 'billing_invoice_details': {
            const { id } = functionCall.args as { id: number };
            const invoice: DetailedBillDto =
              await this.billingService.findOneByInvoiceId(
                id,
                userContext.role,
                userContext.id,
              );
            return `Invoice: ${JSON.stringify(invoice)}`;
          }

          case 'lms_my_todos': {
            if (userContext.role !== 'student') {
              return 'Non students do not have todos.';
            }

            const args = functionCall.args as {
              relativeDate?: string;
              page?: number;
              limit?: number;
            };

            const baseFiler: BaseFilterDto = {
              ...(args.page && { page: args.page }),
              ...(args.limit && { limit: args.limit }),
            };
            const dueFilter: DueFilterDto = {};

            if (typeof args.relativeDate === 'string') {
              const parsed = parseRelativeDateRange(
                args.relativeDate as RelativeDateRange,
              );
              if (parsed) {
                dueFilter.dueDateFrom = new Date(parsed.from);
                dueFilter.dueDateTo = new Date(parsed.to);
              }
            }

            const todos = await this.lmsService.findTodos(userContext.id, {
              ...baseFiler,
              ...dueFilter,
            });
            return `Todos: ${JSON.stringify(todos)}`;
          }

          case 'appointments_my_appointments': {
            const args = functionCall.args as {
              status?: string;
              // courseId?: string;
              // startDate?: string;
              // endDate?: string;
              // search?: string;
              page?: number;
              limit?: number;
            };

            const filterDto = {
              ...(args.status && { status: [args.status] }),
              // ...(args.courseId && { courseId: args.courseId }),
              // ...(args.search && { search: args.search }),
              ...(args.page && { page: args.page }),
              ...(args.limit && { limit: args.limit }),
            } as FilterAppointmentDto;

            const appointments = await this.appointmentsService.findAll(
              filterDto,
              role,
              userContext.id,
            );
            return `My appointments: ${JSON.stringify(appointments)}`;
          }

          case 'appointments_mentor_booked': {
            if (userContext.role !== 'mentor') {
              return 'This function is only available to mentors.';
            }

            const args = functionCall.args as {
              startDate?: string;
              endDate?: string;
            };

            const startDate = args.startDate
              ? new Date(args.startDate)
              : undefined;
            const endDate = args.endDate ? new Date(args.endDate) : undefined;

            const bookedAppointments =
              await this.appointmentsService.findAllBooked(
                userContext.id,
                startDate,
                endDate,
              );
            return `Booked appointments for mentor: ${JSON.stringify(bookedAppointments)}`;
          }

          case 'notifications_my_notifications': {
            const args = functionCall.args as {
              type?: string;
              page?: number;
              limit?: number;
            };

            const filterDto = {
              ...(args.type && { type: args.type }),
              ...(args.page && { page: args.page }),
              ...(args.limit && { limit: args.limit }),
            } as FilterNotificationDto;

            const notifications = await this.notificationsService.findAll(
              filterDto,
              userContext.id,
              role,
            );
            return `My notifications: ${JSON.stringify(notifications)}`;
          }

          case 'notifications_my_counts': {
            const counts = await this.notificationsService.getCount(
              userContext.id,
              role,
            );
            return `Notification counts: ${JSON.stringify(counts)}`;
          }

          case 'search_vector': {
            const args = functionCall.args as { query: string; limit: number };
            const vector = await this.handleVectorSearch(args.query);
            return `Vector search for "${args.query}": ${vector}`;
          }

          default:
            throw new NotImplementedException(
              'Unsupported function call: ' + functionCall.name,
            );
        }
      }),
    );

    // Send results back to Gemini
    const finalAnswer = await this.gemini.generateFinalAnswer(prompt.question, {
      narrative: text,
      results: functionCallResults,
    });

    if (!finalAnswer) {
      throw new ServiceUnavailableException('No response from Gemini');
    }

    result.response = finalAnswer;
    return result;
  }

  async handleVectorSearch(query: string): Promise<string> {
    const res = await this.n8n.searchVector(query);

    return res.output;
  }
}
