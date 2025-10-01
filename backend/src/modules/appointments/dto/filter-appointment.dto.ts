import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

export class FilterAppointmentDto extends BaseFilterDto {
  @ApiPropertyOptional({
    enum: AppointmentStatus,
    enumName: 'AppointmentStatus',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AppointmentStatus, { each: true })
  @Type(() => String)
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  status?: AppointmentStatus[];
}
