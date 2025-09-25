import { CreateAssignmentDto } from '@/generated/nestjs-dto/create-assignment.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { CreateGradingConfigDto } from '@/generated/nestjs-dto/create-gradingConfig.dto';
import { Type } from 'class-transformer';

export class CreateAssignmentItemDto extends CreateAssignmentDto {
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
