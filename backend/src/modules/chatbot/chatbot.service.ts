import { Injectable } from '@nestjs/common';
import { GeminiService } from '@/lib/gemini/gemini.service';
import { UsersService } from '@/modules/users/users.service';
import { BillingService } from '@/modules/billing/billing.service';
import { CoursesService } from '@/modules/courses/courses.service';
import { FunctionCall } from '@google/genai';
import { PromptDto } from '@/modules/chatbot/dto/prompt.dto';
import { FilterUserDto } from '@/modules/users/dto/filter-user.dto';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly gemini: GeminiService,
    private readonly usersService: UsersService,
    private readonly billingService: BillingService,
    private readonly coursesService: CoursesService,
  ) {}

  async handleQuestion(prompt: PromptDto) {
    const {
      call,
      text,
    }: { call: FunctionCall[] | null; text: string | undefined } =
      await this.gemini.askWithFunctionCalling(
        prompt.sessionId,
        prompt.prompt,
        prompt.user,
      );

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
        default:
          return { answer: `Function ${functionCall.name} not implemented.` };
      }
    }

    // Send results back to Gemini
    const finalAnswer = await this.gemini.generateFinalAnswer(
      prompt.prompt,
      result,
    );
    return { answer: finalAnswer };
  }
}
