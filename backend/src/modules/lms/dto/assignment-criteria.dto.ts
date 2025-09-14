export class CriteriaDto {
  key: string;
  criteria: string;
  points: number;
  ratings: RatingDto[];
}

export class RatingDto {
  weight: number;
  label: string;
  description: string;
}

export class RubricDto {
  criteria: CriteriaDto[];
}
