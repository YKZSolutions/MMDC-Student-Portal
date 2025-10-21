import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addWeeks,
  addMonths,
  addDays,
} from 'date-fns';

export enum RelativeDateRange {
  TODAY = 'today',
  TOMORROW = 'tomorrow',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  NEXT_WEEK = 'next_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  NEXT_MONTH = 'next_month',
}

export function parseRelativeDateRange(
  expression: RelativeDateRange,
  now: Date = new Date(),
): { from: string; to: string } | null {
  const lower = expression.toLowerCase().trim();
  let from: Date;
  let to: Date;

  switch (lower) {
    case 'today':
      from = startOfDay(now);
      to = endOfDay(now);
      break;
    case 'tomorrow': {
      const tomorrow = addDays(now, 1);
      from = startOfDay(tomorrow);
      to = endOfDay(tomorrow);
      break;
    }
    case 'yesterday': {
      const yesterday = addDays(now, -1);
      from = startOfDay(yesterday);
      to = endOfDay(yesterday);
      break;
    }
    case 'this_week':
      from = startOfWeek(now, { weekStartsOn: 1 });
      to = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'next_week': {
      const nextWeek = addWeeks(now, 1);
      from = startOfWeek(nextWeek, { weekStartsOn: 1 });
      to = endOfWeek(nextWeek, { weekStartsOn: 1 });
      break;
    }
    case 'last_week': {
      const lastWeek = addWeeks(now, -1);
      from = startOfWeek(lastWeek, { weekStartsOn: 1 });
      to = endOfWeek(lastWeek, { weekStartsOn: 1 });
      break;
    }
    case 'this_month':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'next_month': {
      const nextMonth = addMonths(now, 1);
      from = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
      to = new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      break;
    }
    default:
      return null;
  }

  return { from: from.toISOString(), to: to.toISOString() };
}
