import {
  Injectable,
  NotImplementedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GeminiService } from '@/lib/gemini/gemini.service';
import { UsersService } from '@/modules/users/users.service';
import { BillingService } from '@/modules/billing/billing.service';
import { CoursesService } from '@/modules/courses/courses.service';
import { FunctionCall } from '@google/genai';
import { PromptDto } from '@/modules/chatbot/dto/prompt.dto';
import { FilterUserDto } from '@/modules/users/dto/filter-user.dto';
import {
  UserStaffDetailsDto,
  UserStudentDetailsDto,
} from '@/modules/users/dto/user-details.dto';
import {
  UserBaseContext,
  UserStaffContext,
  UserStudentContext,
} from '@/modules/chatbot/dto/user-context.dto';
import { ChatbotResponseDto } from '@/modules/chatbot/dto/chatbot-response.dto';
import { N8nService } from '@/lib/n8n/n8n.service';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { LmsService } from '@/modules/lms/lms.service';
import { EnrollmentService } from '@/modules/enrollment/enrollment.service';
import { CourseEnrollmentService } from '@/modules/enrollment/course-enrollment.service';
import { Role } from '@prisma/client';
import { LmsContentService } from '@/modules/lms/lms-content.service';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { FilterModuleContentsDto } from '@/modules/lms/dto/filter-module-contents.dto';
import { FilterModulesDto } from '@/modules/lms/dto/filter-modules.dto';
import { FilterBillDto } from '@/modules/billing/dto/filter-bill.dto';

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
    role: string,
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
    logArgsMessage: ({ authId, role, prompt }) =>
      `Handle chatbot question authId=${authId}, role=${role}, question="${prompt.question}"`,
    logSuccessMessage: (_, { authId, role }) =>
      `Successfully handled chatbot question userId=${authId}, role=${role}`,
    logErrorMessage: (err, { authId, role }) =>
      `Failed to handle chatbot question userId=${authId}, role=${role} | Error=${err.message}`,
  })
  async handleQuestion(
    @LogParam('authId') authId: string,
    @LogParam('role') role: string,
    @LogParam('prompt') prompt: PromptDto,
  ): Promise<ChatbotResponseDto> {
    const result: ChatbotResponseDto = {
      response: '',
    };

    const userContext: UserBaseContext | UserStudentContext | UserStaffContext =
      this.mapUserToContext(role, await this.usersService.getMe(authId));

    const {
      call,
      text,
    }: { call: FunctionCall[] | null; text: string | undefined } =
      await this.gemini.askWithFunctionCalling(
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

    const functionCallResult: string[] = [];

    for (const functionCall of call) {
      switch (functionCall.name) {
        case 'users_count_all': {
          const args = functionCall.args as FilterUserDto;
          const count = await this.usersService.countAll(args);
          functionCallResult.push(
            `Found ${count} users${args.role ? ` with role '${args.role}'` : ''}${args.search ? ` matching '${args.search}'` : ''}`,
          );
          break;
        }

        case 'users_find_one': {
          const { id } = functionCall.args as { id: string };
          const user = await this.usersService.findOne(id);
          functionCallResult.push(
            `${text}: User details: ${JSON.stringify(user)}`,
          );
          break;
        }

        case 'courses_find_all': {
          const args = functionCall.args as BaseFilterDto;
          const courses = await this.coursesService.findAll(args);
          functionCallResult.push(
            `Courses${args.search ? ` matching '${args.search}'` : ''}: ${JSON.stringify(courses.courses)}`,
          );
          break;
        }

        case 'courses_find_one': {
          const { id } = functionCall.args as { id: string };
          const course = await this.coursesService.findOne(id);
          functionCallResult.push(`${text}: Course: ${JSON.stringify(course)}`);
          break;
        }

        case 'enrollment_find_active': {
          const enrollment =
            await this.enrollmentsService.findActiveEnrollment();
          functionCallResult.push(
            `${text}: Active enrollment: ${JSON.stringify(enrollment)}`,
          );
          break;
        }

        case 'enrollment_find_all': {
          const args = functionCall.args as BaseFilterDto;
          const enrollments =
            await this.enrollmentsService.findAllEnrollments(args);
          functionCallResult.push(
            `${text}: Enrollment periods: ${JSON.stringify(enrollments)}`,
          );
          break;
        }

        case 'enrollment_my_courses': {
          const courses =
            await this.courseEnrollmentService.getCourseEnrollments(
              userContext.id,
              userContext.role as Role,
            );
          functionCallResult.push(
            `${text}: Active enrolled courses: ${JSON.stringify(courses)}`,
          );
          break;
        }

        case 'lms_my_modules': {
          const args = functionCall.args as FilterModulesDto;
          const modules = await this.lmsService.findAll(
            userContext.id,
            userContext.role as Role,
            args,
          );
          functionCallResult.push(
            `${text}: My modules: ${JSON.stringify(modules)}`,
          );
          break;
        }

        case 'lms_module_contents': {
          const args = functionCall.args as FilterModuleContentsDto;
          const contents = await this.lmsContentService.findAll(
            args,
            userContext.role as Role,
            userContext.id,
          );
          functionCallResult.push(
            `${text}: Module contents: ${JSON.stringify(contents)}`,
          );
          break;
        }

        case 'billing_my_invoices': {
          const args = functionCall.args as FilterBillDto;
          const invoices = await this.billingService.findAll(
            args,
            userContext.role as Role,
            userContext.id,
          );
          functionCallResult.push(
            `${text}: My invoices: ${JSON.stringify(invoices)}`,
          );
          break;
        }

        case 'billing_invoice_details': {
          const { id } = functionCall.args as { id: string };
          const invoice = await this.billingService.findOne(
            id,
            userContext.role as Role,
            userContext.id,
          );
          functionCallResult.push(
            `${text}: Invoice: ${JSON.stringify(invoice)}`,
          );
          break;
        }

        case 'search_vector': {
          const args = functionCall.args as { query: string; limit: number };
          const vector = await this.handleVectorSearch(args.query);
          functionCallResult.push(
            `${text}: Vector search for "${args.query}": ${vector}`,
          );
          break;
        }

        default:
          throw new NotImplementedException(
            `Unhandled function call: ${functionCall.name}`,
          );
      }
    }

    // Send results back to Gemini
    const finalAnswer = await this.gemini.generateFinalAnswer(
      prompt.question,
      functionCallResult,
    );
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
