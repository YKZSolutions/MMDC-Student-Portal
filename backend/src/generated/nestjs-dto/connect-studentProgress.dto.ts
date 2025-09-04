import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StudentProgressUserIdModuleContentIdUniqueInputDto {
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
}

@ApiExtraModels(StudentProgressUserIdModuleContentIdUniqueInputDto)
export class ConnectStudentProgressDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: StudentProgressUserIdModuleContentIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StudentProgressUserIdModuleContentIdUniqueInputDto)
  userId_moduleContentId?: StudentProgressUserIdModuleContentIdUniqueInputDto;
}
