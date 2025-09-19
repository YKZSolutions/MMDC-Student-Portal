import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SectionModuleCourseSectionIdModuleIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  courseSectionId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  moduleId: string;
}

@ApiExtraModels(SectionModuleCourseSectionIdModuleIdUniqueInputDto)
export class ConnectSectionModuleDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: SectionModuleCourseSectionIdModuleIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SectionModuleCourseSectionIdModuleIdUniqueInputDto)
  courseSectionId_moduleId?: SectionModuleCourseSectionIdModuleIdUniqueInputDto;
}
