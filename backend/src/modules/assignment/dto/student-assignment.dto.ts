import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { Expose, Transform } from 'class-transformer';
import { ExposedPickType } from '@/common/helpers/exposed-pick-type.helper';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

const TransformToDecimal = () =>
  Transform(({ value }) => {
    if (value === null || value === undefined) {
      return null;
    }
    return new Decimal(value);
  });

export class StudentAssignmentDto extends ExposedPickType(AssignmentDto, [
  'id',
  'title',
  'rubric',
  'type',
  'mode',
  'status',
  'dueDate',
  'points',
  'allowResubmission',
  'maxAttempts',
  'allowLateSubmission',
] as const) {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Late Penalty',
    example: '10',
  })
  @TransformToDecimal()
  latePenalty: string | null;
}
