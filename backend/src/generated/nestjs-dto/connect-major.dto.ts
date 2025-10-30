import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MajorMajorCodeDeletedAtUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  majorCode: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}
export class MajorNameDeletedAtUniqueInputDto {
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

@ApiExtraModels(
  MajorMajorCodeDeletedAtUniqueInputDto,
  MajorNameDeletedAtUniqueInputDto,
)
export class ConnectMajorDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: MajorMajorCodeDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MajorMajorCodeDeletedAtUniqueInputDto)
  majorCode_deletedAt?: MajorMajorCodeDeletedAtUniqueInputDto;
  @ApiProperty({
    type: MajorNameDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MajorNameDeletedAtUniqueInputDto)
  name_deletedAt?: MajorNameDeletedAtUniqueInputDto;
}
