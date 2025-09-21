import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { OmitType } from '@nestjs/swagger';

export class StudentAssignmentDto extends OmitType(AssignmentDto, [
  'createdAt',
  'updatedAt',
  'deletedAt',
] as const) {}
