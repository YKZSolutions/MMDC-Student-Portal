import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { UserCredentialsDto } from './user-credentials.dto';
import { CreateUserDto } from '@/generated/nestjs-dto/create-user.dto';
import { CreateUserDetailsDto } from '@/generated/nestjs-dto/create-userDetails.dto';
import { CreateStudentDetailsDto } from '@/generated/nestjs-dto/create-studentDetails.dto';
import { CreateStaffDetailsDto } from '@/generated/nestjs-dto/create-staffDetails.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserBaseDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @ValidateNested()
  @Type(() => UserCredentialsDto)
  credentials: UserCredentialsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserDetailsDto)
  userDetails?: CreateUserDetailsDto;
}

export class CreateUserFullDto extends CreateUserBaseDto {
  @ApiProperty({
    enum: Role,
    enumName: 'Role',
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}

export class CreateUserStudentDto extends CreateUserBaseDto {
  @ValidateNested()
  @Type(() => CreateStudentDetailsDto)
  specificDetails: CreateStudentDetailsDto;
}

export class CreateUserStaffDto extends CreateUserBaseDto {
  @ApiProperty({
    enum: ['mentor', 'admin'],
    enumName: 'StaffRole',
  })
  @IsNotEmpty()
  @IsEnum(['mentor', 'admin'])
  role: Exclude<Role, 'student'>;

  @ValidateNested()
  @Type(() => CreateStaffDetailsDto)
  specificDetails: CreateStaffDetailsDto;
}
