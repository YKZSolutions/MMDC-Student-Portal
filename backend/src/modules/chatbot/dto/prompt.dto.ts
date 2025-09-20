import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum ChatbotRole {
  USER = 'user',
  MODEL = 'model',
}

export class Turn {
  @ApiProperty({ enum: ChatbotRole })
  @IsNotEmpty()
  role: ChatbotRole;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class PromptDto {
  @ApiProperty({
    type: String,
    example: 'What is the current semester?',
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiPropertyOptional({
    type: [Turn],
    example: [
      {
        role: 'user',
        content: 'What is the current semester?',
      },
      {
        role: 'model',
        content: 'The current semester is 2024-2025.',
      },
    ],
    required: false,
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => Turn)
  sessionHistory?: Turn[];
}
