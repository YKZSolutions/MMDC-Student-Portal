import { Injectable } from '@nestjs/common';
import { GeminiService } from '@/lib/gemini/gemini.service';
import { UsersService } from '@/modules/users/users.service';
import { BillingService } from '@/modules/billing/billing.service';
import { CoursesService } from '@/modules/courses/courses.service';
import { FunctionCall } from '@google/genai';
import {
  PromptDto,
  UserBaseContextDto,
  UserStaffContextDto,
  UserStudentContextDto,
} from '@/modules/chatbot/dto/prompt.dto';
import { FilterUserDto } from '@/modules/users/dto/filter-user.dto';
import { SupabaseService } from '@/lib/supabase/supabase.service';
import {
  UserStaffDetailsDto,
  UserStudentDetailsDto,
} from '@/modules/users/dto/user-details.dto';

@Injectable()
export class ChatbotService {
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
  ): UserBaseContextDto | UserStudentContextDto | UserStaffContextDto {
    // Create base context with required fields
    const baseContext: UserBaseContextDto = {
      id: user.id,
      role: role,
      email: user.email,
    };

    // If user is a student and has student details
    if (role === 'student' && 'studentDetails' in user && user.studentDetails) {
      return {
        ...baseContext,
        studentNumber: user.studentDetails.studentNumber,
      } as UserStudentContextDto;
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
      } as UserStaffContextDto;
    }

    // Return base context if no specific role details are available
    return baseContext;
  }

  async handleQuestion(userId: string, role: string, prompt: PromptDto) {
    const userContext:
      | UserBaseContextDto
      | UserStudentContextDto
      | UserStaffContextDto = this.mapUserToContext(
      role,
      await this.usersService.getMe(userId),
    );

    const {
      call,
      text,
    }: { call: FunctionCall[] | null; text: string | undefined } =
      await this.gemini.askWithFunctionCalling(prompt.question, userContext);

    if (!call) {
      return { answer: text };
    }

    const result: string[] = [];

    for (const functionCall of call) {
      switch (functionCall.name) {
        case 'users_count_all': {
          const args = functionCall.args as FilterUserDto;
          const count = await this.usersService.countAll(args);
          result.push(
            `${count} users found with the following filters: ${JSON.stringify(args)}`,
          );
          break;
        }
        case 'search_vector': {
          const args = functionCall.args as { query: string; limit: number };
          const vector = await this.handleVectorSearch(args.query, args.limit);
          result.push(
            `Vector search for "${args.query}": ${JSON.stringify(vector)}`,
          );
          break;
        }
        default:
          return { answer: `Function ${functionCall.name} not implemented.` };
      }
    }

    // Send results back to Gemini
    const finalAnswer = await this.gemini.generateFinalAnswer(
      prompt.question,
      result,
    );
    return { answer: finalAnswer };
  }

  async handleVectorSearch(query: string, limit: number = 10): Promise<string> {
    const embedding = await this.gemini.generateEmbedding(query);
    return ''; //TODO: Implement vector search from supabase
  }
}
