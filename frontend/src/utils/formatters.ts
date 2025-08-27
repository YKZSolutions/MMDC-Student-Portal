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

export function formatToLabel(value: string): string {
  return (
    value // insert spaces before capital letters
      .replace(/([A-Z])/g, ' $1')
      // insert spaces before numbers
      .replace(/([0-9]+)/g, ' $1')
      // trim extra spaces
      .trim()
      // capitalize each word
      .replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

export function formatTimestampToDateTimeText(
  timestamp: string,
  separator: string = 'at',
) {
  const day = dayjs(timestamp)
  const date = day.format('MMM D')
  const time = day.format('h:mm A')

  return `${date} ${separator} ${time}`
}

export function formatToSchoolYear(startDate: number, endDate: number): string {
  return `${startDate} - ${endDate}`
}

export const capitalizeFirstLetter = (string: string) => {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function formatOrdinal(n: number) {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}
