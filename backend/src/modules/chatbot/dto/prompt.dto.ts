import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum ChatbotRole {
  USER = 'user',
  MODEL = 'model',
}

export class Turn {
  @IsNotEmpty()
  @ApiProperty({ enum: ChatbotRole })
  role: ChatbotRole;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class PromptDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => Turn)
  sessionHistory: Turn[];
}
