import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ChatbotService } from '@/modules/chatbot/chatbot.service';
import { PromptDto } from '@/modules/chatbot/dto/prompt.dto';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { AuthUser } from '@supabase/supabase-js';
import { ChatbotResponseDto } from '@/modules/chatbot/dto/chatbot-response.dto';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';

@ApiBearerAuth()
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * @remarks
   * Handles user's question and returns a response.
   *
   * @param user - The user making the request.
   * @param prompt - The prompt to be sent to the chatbot.
   *
   * @returns A response from the chatbot.
   */
  @Post()
  @ApiCreatedResponse({ type: ChatbotResponseDto })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async prompt(
    @CurrentUser() user: CurrentAuthUser,
    @Body() prompt: PromptDto,
  ) {
    const { role } = user.user_metadata;
    const authId = user.id;
    return this.chatbotService.handleQuestion(authId, role, prompt);
  }
}
