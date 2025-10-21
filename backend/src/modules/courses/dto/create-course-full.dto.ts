import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { CreateCourseDto } from '@/generated/nestjs-dto/create-course.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseFullDto extends CreateCourseDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  majorIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  prereqIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  coreqIds?: string[];
}
