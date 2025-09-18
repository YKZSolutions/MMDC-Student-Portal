import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GroupModuleIdGroupNumberUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  moduleId: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  groupNumber: number;
}

@ApiExtraModels(GroupModuleIdGroupNumberUniqueInputDto)
export class ConnectGroupDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: GroupModuleIdGroupNumberUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GroupModuleIdGroupNumberUniqueInputDto)
  moduleId_groupNumber?: GroupModuleIdGroupNumberUniqueInputDto;
}
