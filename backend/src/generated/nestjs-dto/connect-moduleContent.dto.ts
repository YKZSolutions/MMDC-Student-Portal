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

export class ModuleContentModuleSectionIdOrderDeletedAtUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  moduleSectionId: string;
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

@ApiExtraModels(ModuleContentModuleSectionIdOrderDeletedAtUniqueInputDto)
export class ConnectModuleContentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: ModuleContentModuleSectionIdOrderDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleContentModuleSectionIdOrderDeletedAtUniqueInputDto)
  moduleSectionId_order_deletedAt?: ModuleContentModuleSectionIdOrderDeletedAtUniqueInputDto;
}
