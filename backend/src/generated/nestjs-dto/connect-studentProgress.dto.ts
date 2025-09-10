import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StudentProgressUserIdModuleContentIdModuleIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  moduleContentId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  moduleId: string;
}

@ApiExtraModels(StudentProgressUserIdModuleContentIdModuleIdUniqueInputDto)
export class ConnectStudentProgressDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: StudentProgressUserIdModuleContentIdModuleIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StudentProgressUserIdModuleContentIdModuleIdUniqueInputDto)
  userId_moduleContentId_moduleId?: StudentProgressUserIdModuleContentIdModuleIdUniqueInputDto;
}
