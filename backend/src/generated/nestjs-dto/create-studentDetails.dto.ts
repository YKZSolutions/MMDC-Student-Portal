import { Prisma, StudentType } from '@prisma/client';
import { ApiExtraModels, ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConnectUserDto,
  type ConnectUserDto as ConnectUserDtoAsType,
} from './connect-user.dto';

export class CreateStudentDetailsUserRelationInputDto {
  @ApiProperty({
    type: ConnectUserDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ConnectUserDto)
  connect: ConnectUserDtoAsType;
}

@ApiExtraModels(ConnectUserDto, CreateStudentDetailsUserRelationInputDto)
export class CreateStudentDetailsDto {
  @ApiHideProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateStudentDetailsUserRelationInputDto)
  user: CreateStudentDetailsUserRelationInputDto;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  student_number: number;
  @ApiProperty({
    enum: StudentType,
    enumName: 'StudentType',
  })
  @IsNotEmpty()
  @IsEnum(StudentType)
  student_type: StudentType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  admission_date: Date;
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  other_details: Prisma.InputJsonValue;
}
