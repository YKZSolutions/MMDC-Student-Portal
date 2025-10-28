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
import { ChatbotResponseDto } from '@/modules/chatbot/dto/chatbot-response.dto';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';

@ApiBearerAuth()
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * @remarks
   * Handles a user's question and returns a response.
   *
   * @param user - The user making the request.
   * @param prompt - The prompt to be sent to the chatbot.
   *
   * @returns A response from the chatbot.
   */
  @ApiCreatedResponse({ type: ChatbotResponseDto })
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Post()
  async prompt(
    @CurrentUser() user: CurrentAuthUser,
    @Body() prompt: PromptDto,
  ): Promise<ChatbotResponseDto> {
    const { role, user_id } = user.user_metadata;
    return this.chatbotService.handleQuestion(user_id, role, prompt);
  }
}
