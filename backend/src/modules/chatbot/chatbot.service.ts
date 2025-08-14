import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly gemini: GeminiService,
    private readonly usersService: UsersService,
    private readonly billingService: BillingService,
    private readonly coursesService: CoursesService,
    private readonly supabase: SupabaseService,
    private readonly programService: SupabaseService,
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

  async handleQuestion(userId: string, role: string, prompt: PromptDto) {
    const method = 'handleQuestion';
    this.logger.log(`[${method}] START: userId=${userId}, role=${role}`);

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
      this.logger.log(
        `[${method}] SUCCESS: userId=${userId}, role=${role} answer=${text}`,
      );
      this.logger.debug(`[${method}] Final answer: ${text}`);
      return { answer: text };
    }

    const result: string[] = [];

    for (const functionCall of call) {
      switch (functionCall.name) {
        case 'users_count_all': {
          this.logger.debug(`[${method}] Function call: ${functionCall.name}`);
          const args = functionCall.args as FilterUserDto;
          const count = await this.usersService.countAll(args);
          result.push(
            `${text}: ${count} users found with the following filters: ${JSON.stringify(args)}`,
          );
          break;
        }
        case 'search_vector': {
          this.logger.debug(`[${method}] Function call: ${functionCall.name}`);
          const args = functionCall.args as { query: string; limit: number };
          const vector = await this.handleVectorSearch(args.query, args.limit);
          result.push(
            `${text}: Vector search for "${args.query}": ${JSON.stringify(vector)}`,
          );
          break;
        }
        default:
          throw new Error(`Unhandled function call: ${functionCall.name}`);
      }
    }

    // Send results back to Gemini
    const finalAnswer = await this.gemini.generateFinalAnswer(
      prompt.question,
      result,
    );
    this.logger.log(`[${method}] SUCCESS: userId=${userId}, role=${role}`);
    this.logger.debug(`[${method}] Final answer: ${finalAnswer}`);
    return { answer: finalAnswer };
  }

  async handleVectorSearch(query: string, limit: number = 10): Promise<string> {
    const embedding = await this.gemini.generateEmbedding(query);
    return ''; //TODO: Implement vector search from supabase
  }
}
