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
import { ChatbotResponseDto } from '@/modules/chatbot/dto/chatbot-response.dto';
import { PromptDto } from '@/modules/chatbot/dto/prompt.dto';
import {
  UserBaseContext,
  UserStaffContext,
  UserStudentContext,
} from '@/modules/chatbot/dto/user-context.dto';
import { CourseEnrollmentService } from '@/modules/enrollment/course-enrollment.service';
import { EnrollmentService } from '@/modules/enrollment/enrollment.service';
import { FilterModuleContentsDto } from '@/modules/lms/dto/filter-module-contents.dto';
import { FilterModulesDto } from '@/modules/lms/dto/filter-modules.dto';
import { LmsContentService } from '@/modules/lms/lms-content.service';
import { LmsService } from '@/modules/lms/lms.service';
import { CoursesService } from '@/modules/courses/courses.service';
import { BillingService } from '@/modules/billing/billing.service';
import { FilterUserDto } from '@/modules/users/dto/filter-user.dto';
import { FilterBillDto } from '@/modules/billing/dto/filter-bill.dto';
import {
  UserStaffDetailsDto,
  UserStudentDetailsDto,
} from '@/modules/users/dto/user-details.dto';
import { UsersService } from '@/modules/users/users.service';
import {
  Injectable,
  NotImplementedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

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
    private readonly lmsContentService: LmsContentService,
    private readonly n8n: N8nService,
  ) {}

  private mapUserToContext(
    role: Role,
    user: UserStudentDetailsDto | UserStaffDetailsDto,
  ): UserBaseContext | UserStudentContext | UserStaffContext {
    // Create base context with required fields
    const baseContext: UserBaseContext = {
      id: user.id,
      role: role,
      email: user.email,
    };

    // If user is a student and has student details
    if (role === 'student' && 'studentDetails' in user && user.studentDetails) {
      return {
        ...baseContext,
        studentNumber: user.studentDetails.studentNumber,
      } as UserStudentContext;
    }

    // If user is staff and has staff details
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
            const args = functionCall.args as FilterUserDto;
            const count = await this.usersService.countAll(args);
            return `Found ${count} users${args.role ? ` with role '${args.role}'` : ''}${args.search ? ` matching '${args.search}'` : ''}.`;
          }

          case 'users_find_one': {
            const { id } = functionCall.args as { id: string };
            const user = await this.usersService.findOne(id);
            return `User details: ${JSON.stringify(user)}`;
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
            const args = functionCall.args as BaseFilterDto;
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
            let modules;
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
                modules = await this.lmsService.findAllForAdmin(
                  userContext.id,
                  args,
                );
                break;
            }
            return `My modules: ${JSON.stringify(modules)}`;
          }

          case 'lms_module_contents': {
            const args = functionCall.args as FilterModuleContentsDto;
            const contents = await this.lmsContentService.findAll(
              args,
              userContext.role,
              userContext.id,
            );
            return `Module contents: ${JSON.stringify(contents)}`;
          }

          case 'billing_my_invoices': {
            const args = functionCall.args as FilterBillDto;
            const invoices = await this.billingService.findAll(
              args,
              userContext.role,
              userContext.id,
            );
            return `My invoices: ${JSON.stringify(invoices)}`;
          }

          case 'billing_invoice_details': {
            const { id } = functionCall.args as { id: string };
            const invoice = await this.billingService.findOne(
              id,
              userContext.role,
              userContext.id,
            );
            return `Invoice: ${JSON.stringify(invoice)}`;
          }

          case 'lms_my_todos': {
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

            const todos = await this.lmsContentService.findTodos(
              userContext.id,
              {
                ...baseFiler,
                ...dueFilter,
              },
            );
            return `Todos: ${JSON.stringify(todos)}`;
          }

          case 'search_vector': {
            const args = functionCall.args as { query: string; limit: number };
            const vector = await this.handleVectorSearch(args.query);
            return `Vector search for "${args.query}": ${vector}`;
          }

          default:
            throw new NotImplementedException(
              `Unhandled function call: ${functionCall.name}`,
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

    // Keep it short for the LLM tools call; you can pass richer JSON if desired
    return res.output;
  }
}
