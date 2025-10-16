import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EnrollmentPeriodStartYearEndYearTermUniqueInputDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  startYear: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  endYear: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  term: number;
}

@ApiExtraModels(EnrollmentPeriodStartYearEndYearTermUniqueInputDto)
export class ConnectEnrollmentPeriodDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: EnrollmentPeriodStartYearEndYearTermUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnrollmentPeriodStartYearEndYearTermUniqueInputDto)
  startYear_endYear_term?: EnrollmentPeriodStartYearEndYearTermUniqueInputDto;
}
