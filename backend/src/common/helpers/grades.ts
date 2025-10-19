import { Decimal } from '@prisma/client/runtime/library';

export const convertToStandardGrade = (grade: Decimal): Decimal => {
  const standardGrade = grade;

  if (standardGrade.gt(96)) return new Decimal(1.0);
  if (standardGrade.gte(91.51)) return new Decimal(1.25);
  if (standardGrade.gte(87.01)) return new Decimal(1.5);
  if (standardGrade.gte(82.51)) return new Decimal(1.75);
  if (standardGrade.gte(78.01)) return new Decimal(2.0);
  if (standardGrade.gte(73.51)) return new Decimal(2.25);
  if (standardGrade.gte(69.01)) return new Decimal(2.5);
  if (standardGrade.gte(64.51)) return new Decimal(2.75);
  if (standardGrade.gte(60)) return new Decimal(3.0);
  return new Decimal(5.0);
};
