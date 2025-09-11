import { CreateModuleContentDto } from '@/generated/nestjs-dto/create-moduleContent.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAssignmentDto } from '@/generated/nestjs-dto/create-assignment.dto';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContentDto extends CreateModuleContentDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;
  @ApiProperty({
    type: CreateAssignmentDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateAssignmentDto)
  assignment?: CreateAssignmentDto;
}
