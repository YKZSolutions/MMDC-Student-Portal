import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { DueFilterDto } from '@/common/dto/due-filter.dto';
import {
  parseRelativeDateRange,
  RelativeDateRange,
} from '@/common/utils/date-range.util';
import { GeminiService } from '@/lib/gemini/gemini.service';
import { EnrollmentService } from '@/modules/enrollment/enrollment.service';
import {
  Inject,
  Injectable,
  Logger,
  NotImplementedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Days, ProgressStatus, Role } from '@prisma/client';
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
import { PromptDto } from './dto/prompt.dto';
import {
  UserBaseContext,
  UserStaffContext,
  UserStudentContext,
} from './dto/user-context.dto';
import { VectorSearchService } from '@/modules/chatbot/vector-search.service';
import { ChatbotResponseDto } from '@/modules/chatbot/dto/chatbot-response.dto';
import { FunctionCall } from '@google/genai';
import { FilterMentorAvailabilityDto } from '@/modules/appointments/dto/filter-mentor-availability.dto';
import { MentorAvailabilityDto } from '@/modules/appointments/dto/mentor-availability.dto';
import { CourseOfferingService } from '@/modules/enrollment/course-offering.service';
import { CreateAppointmentDto } from '@/generated/nestjs-dto/create-appointment.dto';
import { CreateAppointmentItemDto } from '@/modules/appointments/dto/create-appointment.dto';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { ModuleProgressService } from '@/modules/lms/lms-module/module-progress.service';
import { MyModulesProgressFilters } from '@/modules/lms/lms-module/dto/modules-progress.dto';
import { AssignmentService } from '@/modules/lms/assignment/assignment.service';
import {
  TaskSortBy,
  TaskStatusFilter,
} from '@/modules/lms/assignment/dto/filter-all-tasks.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly gemini: GeminiService,
    private readonly vectorSearch: VectorSearchService,
    private readonly usersService: UsersService,
    private readonly billingService: BillingService,
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentService,
    private readonly courseEnrollmentService: CourseEnrollmentService,
    private readonly courseOfferingService: CourseOfferingService,
    private readonly lmsService: LmsService,
    private readonly assignmentService: AssignmentService,
    private readonly appointmentsService: AppointmentsService,
    private readonly notificationsService: NotificationsService,
    private readonly progressService: ModuleProgressService,
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  private mapUserToContext(
    role: Role,
    user: UserStudentDetailsDto | UserStaffDetailsDto,
  ): UserBaseContext | UserStudentContext | UserStaffContext {
    const baseContext: UserBaseContext = {
      id: user.id,
      name: user.firstName,
      role: role,
      email: user.email,
    };

    if (role === 'student' && 'studentDetails' in user && user.studentDetails) {
      return {
        ...baseContext,
        studentNumber: user.studentDetails.studentNumber,
      } as UserStudentContext;
    }

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

    return baseContext;
  }

  @Log({
    logArgsMessage: ({
      userId,
      role,
      prompt,
    }: {
      userId: string;
      role: string;
      prompt: PromptDto;
    }) =>
      `Handle chatbot question userId=${userId}, role=${role}, question="${prompt.question}"`,
    logSuccessMessage: (_, { userId, role }) =>
      `Successfully handled chatbot question userId=${userId}, role=${role}`,
    logErrorMessage: (err, { userId, role }) =>
      `Failed to handle chatbot question userId=${userId}, role=${role} | Error=${err.message}`,
  })
  async handleQuestion(
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
    @LogParam('prompt') prompt: PromptDto,
  ): Promise<ChatbotResponseDto> {
    const result: ChatbotResponseDto = { response: '' };
    const userContext: UserBaseContext | UserStudentContext | UserStaffContext =
      this.mapUserToContext(role, await this.usersService.getMe(userId));

    let iterationCount = 0;
    const maxIterations = 6; // Increased to allow for reflection turn
    let awaitingReflection = false;
    let initialResponseReceived = false;

    // Build initial conversation with context
    const conversation = this.gemini.buildInitialConversation(
      userContext,
      prompt.sessionHistory || [],
      prompt.question,
    );

    this.logger.log(
      `Starting conversation with ${conversation.length} messages`,
    );

    // Multi-turn function calling loop with self-reflection
    while (iterationCount < maxIterations) {
      iterationCount++;
      this.logger.log(`Iteration ${iterationCount}/${maxIterations}`);

      // Call Gemini with current conversation
      const { response, functionCalls } =
        await this.gemini.generateContentWithTools(conversation, role);

      // Handle empty response with no function calls (error state)
      if (
        (!functionCalls || functionCalls.length === 0) &&
        (!response || response.trim() === '')
      ) {
        this.logger.warn(
          'Gemini returned empty response with no function calls - attempting recovery',
        );

        // Add a prompt to force a response
        conversation.push({
          role: 'user',
          parts: [
            {
              text: 'Please provide a response based on the information gathered. Summarize what you found and answer the original question.',
            },
          ],
        });

        // Try one more time without tools
        const recoveryResult = await this.gemini.generateContent(conversation);

        if (recoveryResult) {
          result.response = recoveryResult.response;
          return result;
        }

        throw new ServiceUnavailableException(
          'No response from Gemini after recovery attempt',
        );
      }

      // If no function calls and we haven't triggered reflection yet
      if (
        (!functionCalls || functionCalls.length === 0) &&
        !awaitingReflection &&
        !initialResponseReceived
      ) {
        this.logger.log(
          'First response received - triggering self-reflection check',
        );

        // Mark that we got an initial response
        initialResponseReceived = true;

        // Add self-reflection prompt
        conversation.push({
          role: 'user',
          parts: [
            {
              text: `Before finalizing your response, please perform a self-check on your answer to: "${prompt.question}"

**Completeness Checklist:**
✓ Have I fully addressed all aspects of the question?
✓ For "how to" questions: Have I provided complete step-by-step instructions?
✓ Have I included WHERE to find features/pages in the portal?
✓ Have I mentioned any prerequisites or requirements?
✓ Have I included relevant deadlines or time-sensitive information?
✓ Have I provided contact information for additional help?

**Action Required:**
- If you realize information is MISSING, call the appropriate functions now (e.g., 'search_vector' for procedures, or other relevant functions)
- If your answer is COMPLETE and addresses all points above, respond with your final answer

Do NOT just say "yes it's complete" - either call more functions or provide your final complete answer.`,
            },
          ],
        });

        awaitingReflection = true;
        continue; // Go to next iteration for reflection response
      }

      // If we were awaiting reflection and got a response without function calls
      if (
        awaitingReflection &&
        (!functionCalls || functionCalls.length === 0)
      ) {
        this.logger.log('Self-reflection complete - returning final response');
        result.response = response;
        return result;
      }

      // If we got function calls after reflection, reset flag and continue gathering
      if (awaitingReflection && functionCalls && functionCalls.length > 0) {
        this.logger.log(
          'AI identified missing information during reflection - gathering additional data',
        );
        awaitingReflection = false;
      }

      // If no function calls at this point, skip to next iteration
      if (!functionCalls || functionCalls.length === 0) {
        continue;
      }

      // Execute all function calls
      const functionResults = await Promise.all(
        functionCalls.map(async (functionCall) => {
          try {
            this.logger.debug(
              `Executing: ${functionCall.name}`,
              JSON.stringify(functionCall.args),
            );

            const functionResult = await this.executeFunctionCall(
              functionCall,
              userContext,
              role,
            );

            this.logger.debug(
              `Result from ${functionCall.name}: ${functionResult.substring(0, 200)}...`,
            );

            return {
              functionCall,
              result: functionResult,
            };
          } catch (error) {
            this.logger.error(
              `Error executing ${functionCall.name}: ${error.message}`,
            );
            return {
              functionCall,
              result: `Error: ${error.message}`,
            };
          }
        }),
      );

      // Add the model's function calls to conversation
      this.gemini.addFunctionCallsToConversation(conversation, functionCalls);

      // Add function results to the conversation
      this.gemini.addFunctionResultsToConversation(
        conversation,
        functionResults,
      );

      this.logger.log(
        `Conversation now has ${conversation.length} messages. Continuing...`,
      );
    }

    // If we hit max iterations, try to generate a meaningful response
    this.logger.warn(
      `Max iterations (${maxIterations}) reached. Generating fallback response.`,
    );

    const fallbackResponse = await this.gemini.generateFallbackResponse(
      prompt.question,
      conversation,
    );

    result.response =
      fallbackResponse ||
      'I apologize, but I encountered difficulties processing your request. Please try rephrasing or breaking down your question into smaller parts.';

    return result;
  }

  private async executeFunctionCall(
    functionCall: FunctionCall,
    userContext: UserBaseContext | UserStudentContext | UserStaffContext,
    role: Role,
  ): Promise<string> {
    try {
      switch (functionCall.name) {
        case 'users_count_all': {
          if (userContext.role !== 'admin') {
            return 'This user does not have permission to count users.';
          }

          const args = functionCall.args as FilterUserDto;
          const count = await this.usersService.countAll(args);
          return `Found ${count} users${args.role ? ` with role '${args.role}'` : ''}${args.search ? ` matching '${args.search}'` : ''}.`;
        }

        case 'users_all_mentor_list': {
          const args = functionCall.args as {
            search?: string;
          };

          const mentors = await this.usersService.findAll(
            args,
            userContext.role,
            userContext.id,
          );

          return `Mentors: ${JSON.stringify(mentors)}`;
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

        case 'course_offering_for_active_enrollment': {
          if (userContext.role !== 'student') {
            return 'Non students do not have course offerings.';
          }

          const courseOfferings =
            await this.courseOfferingService.findActiveCourseOfferings(
              userContext.id,
              userContext.role,
            );

          return `Course offerings for active enrollment: ${JSON.stringify(courseOfferings)}`;
        }

        case 'lms_my_todos': {
          if (userContext.role !== 'student') {
            return 'Non students do not have todos.';
          }

          const args = functionCall.args as {
            status?: TaskStatusFilter;
            courseId?: string;
            sortBy?: TaskSortBy;
            sortDirection?: 'asc' | 'desc';
            page?: number;
            limit?: number;
          };

          const todos = await this.assignmentService.findAllTasksForStudent(
            userContext.id,
            args,
          );
          return `Todos: ${JSON.stringify(todos)}`;
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

        case 'appointments_my_appointments': {
          const args = functionCall.args as {
            status?: string;
            search?: string;
            page?: number;
            limit?: number;
          };

          const filterDto = {
            ...(args.status && { status: [args.status] }),
            ...(args.search && { search: args.search }),
            ...(args.page && { page: args.page }),
            ...(args.limit && { limit: args.limit }),
          } as FilterAppointmentDto;

          const appointments = await this.appointmentsService.findAll(
            filterDto,
            userContext.role,
            userContext.id,
          );
          return `My appointments: ${JSON.stringify(appointments)}`;
        }

        case 'appointments_mentor_booked': {
          if (userContext.role !== 'mentor') {
            return 'This function is only available to mentors.';
          }

          const args = functionCall.args as {
            relativeDate: string;
          };

          let startDate: Date = new Date();
          let endDate: Date = new Date(Date.now() + 24 * 60 * 60 * 1000);

          const parsed = parseRelativeDateRange(
            args.relativeDate as RelativeDateRange,
          );
          if (parsed) {
            startDate = new Date(parsed.from);
            endDate = new Date(parsed.to);
          }

          const bookedAppointments =
            await this.appointmentsService.findAllBooked(
              userContext.id,
              startDate,
              endDate,
            );
          return `Booked appointments for mentor: ${JSON.stringify(bookedAppointments)}`;
        }

        case 'appointments_mentor_available': {
          if (userContext.role !== 'student') {
            return 'This function is only available to students.';
          }

          const args = functionCall.args as {
            relativeDate?: string;
            startingFrom?: string;
            mentorId?: string;
            search?: string;
            page?: number;
            limit?: number;
          };

          const filterDto = {
            ...(args.mentorId && { mentorId: args.mentorId }),
            ...(args.search && { search: args.search }),
            ...(args.page && { page: args.page }),
            ...(args.limit && { limit: args.limit }),
            startDate: args.startingFrom
              ? new Date(args.startingFrom)
              : new Date(),
            endDate: new Date(),
          } as FilterMentorAvailabilityDto;

          const parsed = parseRelativeDateRange(
            (args.relativeDate as RelativeDateRange) ?? 'this_week',
            filterDto.startDate,
          );
          if (parsed) {
            filterDto.endDate = new Date(parsed.to);
          }

          const availableAppointments: MentorAvailabilityDto =
            await this.appointmentsService.findMentorAvailability(
              filterDto,
              userContext.id,
              userContext.role,
            );

          return `Mentor's available appointments: ${JSON.stringify(availableAppointments)}`;
        }

        case 'appointments_book_appointment': {
          if (userContext.role === 'admin') {
            return 'This function is only available to students and mentors.';
          }

          const args = functionCall.args as {
            mentorId?: string;
            courseOfferingId?: string;
            startAt: string;
            endAt: string;
            title: string;
            description: string;
          };

          const createDto = {
            studentId: userContext.id,
            mentorId: args.mentorId,
            courseOfferingId: args.courseOfferingId,
            startAt: new Date(args.startAt),
            endAt: new Date(args.endAt),
            title: args.title,
            description: args.description,
          } as CreateAppointmentItemDto;

          const appointment: CreateAppointmentDto =
            await this.appointmentsService.create(createDto);
          return `Appointment created successfully: ${JSON.stringify(appointment)}`;
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

        case 'progress_module_overview': {
          const args = functionCall.args as {
            moduleId: string;
            courseOfferingId?: string;
          };

          const progress = await this.progressService.getModuleProgressOverview(
            args.moduleId,
            userContext.id,
            userContext.role,
            args.courseOfferingId
              ? { courseOfferingId: args.courseOfferingId }
              : undefined,
          );

          return `Module progress overview: ${JSON.stringify(progress)}`;
        }

        case 'progress_module_detail': {
          const args = functionCall.args as {
            moduleId: string;
            courseOfferingId?: string;
          };

          const progress = await this.progressService.getModuleProgressDetail(
            args.moduleId,
            userContext.id,
            userContext.role,
            args.courseOfferingId
              ? { courseOfferingId: args.courseOfferingId }
              : undefined,
          );

          return `Module progress detail: ${JSON.stringify(progress)}`;
        }

        case 'progress_dashboard': {
          const args = functionCall.args as {
            courseOfferingId?: string;
            search?: string;
          };

          const dashboard = await this.progressService.getDashboardProgress(
            userContext.id,
            userContext.role,
            {
              ...(args.courseOfferingId && {
                courseOfferingId: args.courseOfferingId,
              }),
            },
          );

          return `Progress dashboard: ${JSON.stringify(dashboard)}`;
        }

        case 'progress_my_modules': {
          const args = functionCall.args as {
            status?: string;
            search?: string;
            courseOfferingId?: string;
          };

          // Convert string status to ProgressStatus enum if provided
          let status: ProgressStatus | undefined;
          if (args.status) {
            status = ProgressStatus[args.status as keyof typeof ProgressStatus];
          }

          const filters: MyModulesProgressFilters = {
            status,
            search: args.search,
            courseOfferingId: args.courseOfferingId,
          };

          const myModulesProgress =
            await this.progressService.getMyModulesProgress(
              userContext.id,
              userContext.role,
              filters,
            );

          return `My modules progress: ${JSON.stringify(myModulesProgress)}`;
        }

        case 'date_utility': {
          const args = functionCall.args as {
            dateTime?: string;
            useCurrentDateTime?: boolean;
            daysToAdd?: {
              days?: number;
              hours?: number;
              minutes?: number;
              seconds?: number;
            };
            daysToSubtract?: {
              days?: number;
              hours?: number;
              minutes?: number;
              seconds?: number;
            };
            monthsToAdd?: number;
            monthsToSubtract?: number;
          };

          if (!args.useCurrentDateTime && !args.dateTime) {
            return 'dateTime is required when useCurrentDateTime is false';
          }

          const date = args.useCurrentDateTime
            ? new Date()
            : new Date(args.dateTime!);

          date.setDate(date.getDate() + (args.daysToAdd?.days ?? 0));
          date.setHours(date.getHours() + (args.daysToAdd?.hours ?? 0));
          date.setMinutes(date.getMinutes() + (args.daysToAdd?.minutes ?? 0));
          date.setSeconds(date.getSeconds() + (args.daysToAdd?.seconds ?? 0));
          date.setDate(date.getDate() - (args.daysToSubtract?.days ?? 0));
          date.setHours(date.getHours() - (args.daysToSubtract?.hours ?? 0));
          date.setMinutes(
            date.getMinutes() - (args.daysToSubtract?.minutes ?? 0),
          );
          date.setSeconds(
            date.getSeconds() - (args.daysToSubtract?.seconds ?? 0),
          );
          date.setMonth(date.getMonth() + (args.monthsToAdd ?? 0));
          date.setMonth(date.getMonth() - (args.monthsToSubtract ?? 0));

          return JSON.stringify({
            dateTime: date.toISOString(),
            day: Days[date.getDay()],
          });
        }

        case 'search_vector': {
          const args = functionCall.args as { query: string[]; limit?: number };
          return await this.vectorSearch.searchAndFormatContext(
            args.query,
            args.limit || 5,
          );
        }

        default:
          throw new NotImplementedException(
            'Unsupported function call: ' + functionCall.name,
          );
      }
    } catch (error) {
      this.logger.error(
        `Error executing function ${functionCall.name}: ${error.message}`,
      );
      return `Error: ${error.message}`;
    }
  }
}
