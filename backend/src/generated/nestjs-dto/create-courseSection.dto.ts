import { Days } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCourseSectionDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  maxSlot: number;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  startSched: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  endSched: string;
  @ApiProperty({
    isArray: true,
    enum: Days,
    enumName: 'Days',
  })
  @IsNotEmpty()
  @IsArray()
  @IsEnum(Days, { each: true })
  days: Days[];
}
