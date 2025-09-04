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
import { SupabaseService } from '@/lib/supabase/supabase.service';
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

@Injectable()
export class ChatbotService {
  constructor(
    private readonly gemini: GeminiService,
    private readonly usersService: UsersService,
    private readonly billingService: BillingService,
    private readonly coursesService: CoursesService,
    private readonly supabase: SupabaseService,
    private readonly programService: SupabaseService,
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
    logArgsMessage: ({ userId, role, prompt }) =>
      `Handle chatbot question userId=${userId}, role=${role}, question="${prompt.question}"`,
    logSuccessMessage: (_, { userId, role }) =>
      `Successfully handled chatbot question userId=${userId}, role=${role}`,
    logErrorMessage: (err, { userId, role }) =>
      `Failed to handle chatbot question userId=${userId}, role=${role} | Error=${err.message}`,
  })
  async handleQuestion(
    @LogParam('userId') userId: string,
    @LogParam('role') role: string,
    @LogParam('prompt') prompt: PromptDto,
  ): Promise<ChatbotResponseDto> {
    const result: ChatbotResponseDto = {
      response: '',
    };

    const userContext: UserBaseContext | UserStudentContext | UserStaffContext =
      this.mapUserToContext(role, await this.usersService.getMe(userId));

    const {
      call,
      text,
    }: { call: FunctionCall[] | null; text: string | undefined } =
      await this.gemini.askWithFunctionCalling(
        prompt.question,
        prompt.sessionHistory,
        userContext,
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
            `${text}: ${count} users found with filter ${JSON.stringify(args)}`,
          );
          break;
        }
        case 'search_vector': {
          const args = functionCall.args as { query: string; limit: number };
          const vector = await this.handleVectorSearch(args.query);
          functionCallResult.push(
            `${text}: Vector search for "${args.query}": ${JSON.stringify(vector)}`,
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
