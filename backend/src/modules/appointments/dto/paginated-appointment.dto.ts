import { PaginatedDto } from '@/common/dto/paginated.dto';
import { AppointmentDto } from '@/generated/nestjs-dto/appointment.dto';
import { CourseDto } from '@/generated/nestjs-dto/course.dto';
import { CourseSectionDto } from '@/generated/nestjs-dto/courseSection.dto';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { OmitType, PickType } from '@nestjs/swagger';

class AppointmentUserDto extends OmitType(UserDto, [
  'createdAt',
  'updatedAt',
  'deletedAt',
  'disabledAt',
] as const) {}

class AppointmentCourseDto extends PickType(CourseDto, [
  'id',
  'courseCode',
  'name',
] as const) {}

class AppointmentSectionDto extends PickType(CourseSectionDto, [
  'id',
  'startSched',
  'endSched',
  'days',
]) {}

export class AppointmentDetailsDto extends AppointmentDto {
  course: AppointmentCourseDto;
  section: AppointmentSectionDto;
  student: AppointmentUserDto;
  mentor: AppointmentUserDto;
}

export class AppointmentItemDto extends AppointmentDto {
  course: AppointmentCourseDto;
  student: AppointmentUserDto;
  mentor: AppointmentUserDto;
}

export class PaginatedAppointmentDto extends PaginatedDto {
  appointments: AppointmentItemDto[];
}
