import { ApiProperty } from '@nestjs/swagger';

export class QuizAnswersDto {
  @ApiProperty()
  questionId: string;

  @ApiProperty({ required: false })
  selectedAnswerId?: string;

  @ApiProperty({ required: false })
  textAnswer?: string;

  @ApiProperty({
    required: false,
    description:
      'For matching questions, maps item IDs to their selected match IDs',
    example: { item1: 'match1', item2: 'match2' },
    additionalProperties: { type: 'string' },
  })
  matchingAnswers?: Record<string, string>;
}
