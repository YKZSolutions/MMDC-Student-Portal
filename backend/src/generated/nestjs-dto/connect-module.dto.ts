import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleCourseIdCourseOfferingIdUniqueInputDto {
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
}
export class ModuleCourseIdCourseOfferingIdTitleUniqueInputDto {
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
}

@ApiExtraModels(
  ModuleCourseIdCourseOfferingIdUniqueInputDto,
  ModuleCourseIdCourseOfferingIdTitleUniqueInputDto,
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
    type: ModuleCourseIdCourseOfferingIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleCourseIdCourseOfferingIdUniqueInputDto)
  courseId_courseOfferingId?: ModuleCourseIdCourseOfferingIdUniqueInputDto;
  @ApiProperty({
    type: ModuleCourseIdCourseOfferingIdTitleUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleCourseIdCourseOfferingIdTitleUniqueInputDto)
  courseId_courseOfferingId_title?: ModuleCourseIdCourseOfferingIdTitleUniqueInputDto;
}
