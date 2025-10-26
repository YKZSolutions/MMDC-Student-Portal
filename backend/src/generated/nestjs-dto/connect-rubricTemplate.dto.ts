import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RubricTemplateNameDeletedAtUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}

@ApiExtraModels(RubricTemplateNameDeletedAtUniqueInputDto)
export class ConnectRubricTemplateDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: RubricTemplateNameDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RubricTemplateNameDeletedAtUniqueInputDto)
  name_deletedAt?: RubricTemplateNameDeletedAtUniqueInputDto;
}
