import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Time Slot DTO
export class TimeSlotDto {
  @ApiProperty({
    description: 'Start time of the available slot',
    example: '2024-01-15T09:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  start: Date;

  @ApiProperty({
    description: 'End time of the available slot',
    example: '2024-01-15T10:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  end: Date;
}

// Mentor Summary DTO (for search results)
export class MentorSummaryDto {
  @ApiProperty({
    description: 'Mentor ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Mentor first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Mentor last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Course name if searched by course',
    example: 'Advanced Mathematics',
  })
  @IsString()
  @IsOptional()
  courseName?: string;

  @ApiPropertyOptional({
    description: 'Course code if searched by course',
    example: 'MATH101',
  })
  @IsString()
  @IsOptional()
  courseCode?: string;
}

// Selected Mentor DTO
export class SelectedMentorDto {
  @ApiProperty({
    description: 'Selected mentor ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Selected mentor full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

// Date Range DTO
export class DateRangeDto {
  @ApiProperty({
    description: 'Start date of the search range',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'End date of the search range',
    example: '2024-01-22T23:59:59.999Z',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

// Meta-Information DTO
export class MentorAvailabilityMetaDto {
  @ApiProperty({
    description: 'Total number of free slots found',
    example: 15,
  })
  @IsNumber()
  totalFreeSlots: number;

  @ApiProperty({
    description: 'Duration of each slot in minutes',
    example: 60,
  })
  @IsNumber()
  slotDuration: number;

  @ApiProperty({
    description: 'Timestamp when the results were generated',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsString()
  generatedAt: string;

  @ApiPropertyOptional({
    description: 'Total number of mentors found when using search',
    example: 3,
  })
  @IsNumber()
  @IsOptional()
  totalMentorsFound?: number;
}

// Main Response DTO
export class MentorAvailabilityDto {
  @ApiPropertyOptional({
    description: 'Mentor ID (when searching by specific mentor)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  mentorId?: string;

  @ApiPropertyOptional({
    description: 'List of mentors found when using search',
    type: [MentorSummaryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MentorSummaryDto)
  @IsOptional()
  mentors?: MentorSummaryDto[];

  @ApiPropertyOptional({
    description: 'Selected mentor details when using search',
    type: SelectedMentorDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => SelectedMentorDto)
  @IsOptional()
  selectedMentor?: SelectedMentorDto;

  @ApiProperty({
    description: 'Date range used for the search',
    type: DateRangeDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange: DateRangeDto;

  @ApiProperty({
    description: 'List of available time slots',
    type: [TimeSlotDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  freeSlots: TimeSlotDto[];

  @ApiProperty({
    description: 'Meta information about the results',
    type: MentorAvailabilityMetaDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MentorAvailabilityMetaDto)
  meta: MentorAvailabilityMetaDto;
}
