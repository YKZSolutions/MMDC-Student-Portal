import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleCourseIdCourseOfferingIdDeletedAtUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  courseId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  courseOfferingId: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}
export class ModuleCourseIdCourseOfferingIdTitleDeletedAtUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  courseId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  courseOfferingId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  title: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}

@ApiExtraModels(
  ModuleCourseIdCourseOfferingIdDeletedAtUniqueInputDto,
  ModuleCourseIdCourseOfferingIdTitleDeletedAtUniqueInputDto,
)
export class ConnectModuleDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: ModuleCourseIdCourseOfferingIdDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleCourseIdCourseOfferingIdDeletedAtUniqueInputDto)
  courseId_courseOfferingId_deletedAt?: ModuleCourseIdCourseOfferingIdDeletedAtUniqueInputDto;
  @ApiProperty({
    type: ModuleCourseIdCourseOfferingIdTitleDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleCourseIdCourseOfferingIdTitleDeletedAtUniqueInputDto)
  courseId_courseOfferingId_title_deletedAt?: ModuleCourseIdCourseOfferingIdTitleDeletedAtUniqueInputDto;
}
