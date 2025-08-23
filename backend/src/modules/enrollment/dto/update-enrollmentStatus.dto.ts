import { UpdateEnrollmentPeriodDto } from '@/generated/nestjs-dto/update-enrollmentPeriod.dto';
import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateEnrollmentStatusDto extends PickType(
  UpdateEnrollmentPeriodDto,
  ['status'] as const,
) {
  @ApiProperty({
    enum: EnrollmentStatus,
    enumName: 'EnrollmentStatus',
    required: true,
  })
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}
