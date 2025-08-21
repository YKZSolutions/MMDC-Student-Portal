import { Days } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateCourseSectionDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  @IsOptional()
  @IsInt()
  maxSlot?: number;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  startSched?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  endSched?: string;
  @ApiProperty({
    isArray: true,
    enum: Days,
    enumName: 'Days',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Days, { each: true })
  days?: Days[];
}
