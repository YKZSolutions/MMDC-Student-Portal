import { Prisma } from '@prisma/client';
import { ApiExtraModels, ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConnectUserDto,
  type ConnectUserDto as ConnectUserDtoAsType,
} from './connect-user.dto';

export class CreateStaffDetailsUserRelationInputDto {
  @ApiProperty({
    type: ConnectUserDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ConnectUserDto)
  connect: ConnectUserDtoAsType;
}

@ApiExtraModels(ConnectUserDto, CreateStaffDetailsUserRelationInputDto)
export class CreateStaffDetailsDto {
  @ApiHideProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateStaffDetailsUserRelationInputDto)
  user: CreateStaffDetailsUserRelationInputDto;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  employee_number: number;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  department: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  position: string;
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  other_details: Prisma.InputJsonValue;
}
