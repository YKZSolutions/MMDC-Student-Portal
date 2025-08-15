import { IsNotEmpty } from 'class-validator';

export class ChatbotResponseDto {
  @IsNotEmpty()
  response: string;
}
