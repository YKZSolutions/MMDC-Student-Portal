import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentAssignmentsSubmissionsUserIdModuleContentIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  module_content_id: string;
}

@ApiExtraModels(
  StudentAssignmentsSubmissionsUserIdModuleContentIdUniqueInputDto,
)
export class ConnectStudentAssignmentsSubmissionsDto {
  @ApiProperty({
    type: StudentAssignmentsSubmissionsUserIdModuleContentIdUniqueInputDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => StudentAssignmentsSubmissionsUserIdModuleContentIdUniqueInputDto)
  user_id_module_content_id: StudentAssignmentsSubmissionsUserIdModuleContentIdUniqueInputDto;
}
