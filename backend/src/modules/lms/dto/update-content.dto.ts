import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateAssignmentDto } from '@/generated/nestjs-dto/update-assignment.dto';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContentDto extends UpdateModuleContentDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  sectionId?: string;
  @ApiProperty({
    type: UpdateAssignmentDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => UpdateAssignmentDto)
  assignment?: UpdateAssignmentDto;
}
