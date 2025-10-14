import { Prisma } from '@prisma/client';
import { ApiExtraModels, ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConnectModuleSectionDto,
  type ConnectModuleSectionDto as ConnectModuleSectionDtoAsType,
} from './connect-moduleSection.dto';

export class CreateModuleContentModuleSectionRelationInputDto {
  @ApiProperty({
    type: ConnectModuleSectionDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ConnectModuleSectionDto)
  connect: ConnectModuleSectionDtoAsType;
}

@ApiExtraModels(
  ConnectModuleSectionDto,
  CreateModuleContentModuleSectionRelationInputDto,
)
export class CreateModuleContentDto {
  @ApiHideProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateModuleContentModuleSectionRelationInputDto)
  moduleSection: CreateModuleContentModuleSectionRelationInputDto;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  title: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  subtitle?: string | null;
  @ApiProperty({
    type: () => Object,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  content: Prisma.InputJsonValue[];
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  unpublishedAt?: Date | null;
}
