import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleContentBaseModuleSectionIdOrderUniqueInputDto {
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
}

@ApiExtraModels(ModuleContentBaseModuleSectionIdOrderUniqueInputDto)
export class ConnectModuleContentBaseDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: ModuleContentBaseModuleSectionIdOrderUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleContentBaseModuleSectionIdOrderUniqueInputDto)
  moduleSectionId_order?: ModuleContentBaseModuleSectionIdOrderUniqueInputDto;
}
