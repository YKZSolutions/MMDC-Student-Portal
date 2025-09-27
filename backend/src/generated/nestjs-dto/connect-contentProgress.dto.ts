import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContentProgressStudentIdModuleContentIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  studentId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  moduleContentId: string;
}

@ApiExtraModels(ContentProgressStudentIdModuleContentIdUniqueInputDto)
export class ConnectContentProgressDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: ContentProgressStudentIdModuleContentIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContentProgressStudentIdModuleContentIdUniqueInputDto)
  studentId_moduleContentId?: ContentProgressStudentIdModuleContentIdUniqueInputDto;
}
