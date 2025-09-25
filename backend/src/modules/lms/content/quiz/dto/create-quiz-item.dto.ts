import { CreateQuizDto } from '@/generated/nestjs-dto/create-quiz.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { CreateGradingConfigDto } from '@/generated/nestjs-dto/create-gradingConfig.dto';
import { Type } from 'class-transformer';

export class CreateQuizItemDto extends CreateQuizDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  gradingId?: string;

  @ApiProperty({
    type: CreateGradingConfigDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateGradingConfigDto)
  grading?: CreateGradingConfigDto;
}
