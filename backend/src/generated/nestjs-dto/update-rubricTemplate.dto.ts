import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateRubricTemplateDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;
  @ApiProperty({
    type: 'string',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  criteriaJson?: PrismaJson.RubricCriterion | null;
}
