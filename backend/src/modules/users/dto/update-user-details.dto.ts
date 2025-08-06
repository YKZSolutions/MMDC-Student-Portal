import { UpdateUserDto } from '@/generated/nestjs-dto/update-user.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserDetailsDto } from '@/generated/nestjs-dto/update-userDetails.dto';
import { UpdateStudentDetailsDto } from '@/generated/nestjs-dto/update-studentDetails.dto';
import { UpdateStaffDetailsDto } from '@/generated/nestjs-dto/update-staffDetails.dto';

export class UpdateUserBaseDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  user?: UpdateUserDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserDetailsDto)
  userDetails?: UpdateUserDetailsDto;
}

export class UpdateUserStudentDto extends UpdateUserBaseDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStudentDetailsDto)
  specificDetails?: UpdateStudentDetailsDto;
}
export class UpdateUserStaffDto extends UpdateUserBaseDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStaffDetailsDto)
  specificDetails?: UpdateStaffDetailsDto;
}
