import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleSectionModuleIdOrderDeletedAtUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  moduleId: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 1,
  })
  @IsNotEmpty()
  @IsInt()
  order: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}
export class ModuleSectionParentSectionIdOrderDeletedAtUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  parentSectionId: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 1,
  })
  @IsNotEmpty()
  @IsInt()
  order: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}

@ApiExtraModels(
  ModuleSectionModuleIdOrderDeletedAtUniqueInputDto,
  ModuleSectionParentSectionIdOrderDeletedAtUniqueInputDto,
)
export class ConnectModuleSectionDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: ModuleSectionModuleIdOrderDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleSectionModuleIdOrderDeletedAtUniqueInputDto)
  moduleId_order_deletedAt?: ModuleSectionModuleIdOrderDeletedAtUniqueInputDto;
  @ApiProperty({
    type: ModuleSectionParentSectionIdOrderDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleSectionParentSectionIdOrderDeletedAtUniqueInputDto)
  parentSectionId_order_deletedAt?: ModuleSectionParentSectionIdOrderDeletedAtUniqueInputDto;
}
