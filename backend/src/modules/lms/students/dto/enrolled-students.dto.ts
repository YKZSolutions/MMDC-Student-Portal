import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class EnrolledStudentDto {
  @ApiProperty({
    description: 'The unique ID of the student',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: "The student's student number",
    example: '2021-00001',
    nullable: true,
  })
  studentNumber: string | null;

  @ApiProperty({
    description: "The student's first name",
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: "The student's middle name",
    example: 'Michael',
    nullable: true,
  })
  middleName: string | null;

  @ApiProperty({
    description: "The student's last name",
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: Role,
    example: Role.student,
  })
  role: Role;

  @ApiProperty({
    description: 'The course section the student is enrolled in',
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      mentorId: { type: 'string' },
      mentorName: { type: 'string' },
      mentorEmployeeNumber: { type: 'number', nullable: true },
    },
  })
  section: {
    id: string;
    name: string;
    mentorId: string;
    mentorName: string;
    mentorEmployeeNumber: number | null;
  };
}

export class EnrolledStudentsResponseDto {
  @ApiProperty({
    description: 'List of enrolled students',
    type: [EnrolledStudentDto],
  })
  students: EnrolledStudentDto[];

  @ApiProperty({
    description: 'Total number of enrolled students',
    example: 25,
  })
  total: number;
}
