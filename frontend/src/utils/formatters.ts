import dayjs from 'dayjs'

export function formatPaginationMessage({
  limit,
  page,
  total,
}: {
  limit: number
  page: number
  total: number
}) {
  const start = limit * (page - 1) + 1
  const end = Math.min(total, limit * page)
  return `Showing ${start} - ${end} of ${total}`
}

export function formatTimestampToDateTimeText(timestamp: string, separator: string = 'at') {
  const day = dayjs(timestamp);
  const date = day.format('MMM D');
  const time = day.format('h:mm A');

  return `${date} ${separator} ${time}`;
}
