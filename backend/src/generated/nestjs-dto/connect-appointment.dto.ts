import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AppointmentStudentIdMentorIdStartAtUniqueInputDto {
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
  mentorId: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  startAt: Date;
}

@ApiExtraModels(AppointmentStudentIdMentorIdStartAtUniqueInputDto)
export class ConnectAppointmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: AppointmentStudentIdMentorIdStartAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AppointmentStudentIdMentorIdStartAtUniqueInputDto)
  studentId_mentorId_startAt?: AppointmentStudentIdMentorIdStartAtUniqueInputDto;
}
