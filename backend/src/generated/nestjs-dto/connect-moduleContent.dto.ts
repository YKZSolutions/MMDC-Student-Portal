import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleContentModuleSectionIdOrderUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  moduleSectionId: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
  })
  @IsNotEmpty()
  @IsInt()
  order: number;
}
export class ModuleContentModuleIdOrderUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  moduleId: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
  })
  @IsNotEmpty()
  @IsInt()
  order: number;
}

@ApiExtraModels(
  ModuleContentModuleSectionIdOrderUniqueInputDto,
  ModuleContentModuleIdOrderUniqueInputDto,
)
export class ConnectModuleContentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: ModuleContentModuleSectionIdOrderUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleContentModuleSectionIdOrderUniqueInputDto)
  moduleSectionId_order?: ModuleContentModuleSectionIdOrderUniqueInputDto;
  @ApiProperty({
    type: ModuleContentModuleIdOrderUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleContentModuleIdOrderUniqueInputDto)
  moduleId_order?: ModuleContentModuleIdOrderUniqueInputDto;
}
