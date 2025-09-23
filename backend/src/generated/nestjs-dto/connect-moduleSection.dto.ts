import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleSectionModuleIdOrderUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  moduleId: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  order: number;
}

@ApiExtraModels(ModuleSectionModuleIdOrderUniqueInputDto)
export class ConnectModuleSectionDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: ModuleSectionModuleIdOrderUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleSectionModuleIdOrderUniqueInputDto)
  moduleId_order?: ModuleSectionModuleIdOrderUniqueInputDto;
}
