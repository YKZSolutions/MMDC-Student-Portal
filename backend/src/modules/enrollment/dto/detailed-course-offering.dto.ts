import { CourseSectionDto } from '@/generated/nestjs-dto/courseSection.dto';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class DetailedCourseSectionDto extends CourseSectionDto {
  @ApiProperty({ type: UserDto, nullable: true })
  mentor: UserDto | null;

  @IsUUID()
  @IsOptional()
  mentorId: string | null;
}
