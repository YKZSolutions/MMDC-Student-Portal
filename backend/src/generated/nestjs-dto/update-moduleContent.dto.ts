import { ContentType, Prisma } from '@prisma/client';
import { ApiExtraModels, ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
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

export class UpdateModuleContentModuleSectionRelationInputDto {
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
  UpdateModuleContentModuleSectionRelationInputDto,
)
export class UpdateModuleContentDto {
  @ApiHideProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateModuleContentModuleSectionRelationInputDto)
  moduleSection?: UpdateModuleContentModuleSectionRelationInputDto;
  @ApiProperty({
    enum: ContentType,
    enumName: 'ContentType',
    default: 'LESSON',
    required: false,
  })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;
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
    required: false,
  })
  @IsOptional()
  @IsArray()
  content?: Prisma.InputJsonValue[];
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  order?: number;
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
