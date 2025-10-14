import { RubricDto } from '@/modules/lms/rubric/dto/assignment-criteria.dto';

export const calculateMaxScoreFromRubric = (rubric: RubricDto) => {
  let maxScore = 0;
  rubric.criteria.forEach((criterion) => {
    maxScore += criterion.points;
  });
  return maxScore;
};
