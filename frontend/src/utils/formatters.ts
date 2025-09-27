import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)

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

export function formatDaysAbbrev(days?: string[] | null): string {
  if (!days?.length) return ''

  const weekOrder = [
    { key: 'monday', abbr: 'M', aliases: ['mon', 'm'] },
    { key: 'tuesday', abbr: 'T', aliases: ['tue', 'tues', 'tu'] },
    { key: 'wednesday', abbr: 'W', aliases: ['wed', 'w'] },
    { key: 'thursday', abbr: 'Th', aliases: ['thu', 'thur', 'th'] },
    { key: 'friday', abbr: 'F', aliases: ['fri', 'f'] },
    { key: 'saturday', abbr: 'Sa', aliases: ['sat', 'sa'] },
    { key: 'sunday', abbr: 'Su', aliases: ['sun', 'su'] },
  ]

  // Build a lookup map of all aliases → canonical key
  const aliasMap = new Map<string, string>()
  weekOrder.forEach(({ key, aliases }) => {
    aliasMap.set(key, key)
    aliases.forEach((a) => aliasMap.set(a, key))
  })

  const seen = new Set<string>()
  for (const d of days) {
    const canon = aliasMap.get(d.trim().toLowerCase())
    if (canon) seen.add(canon)
  }

  return weekOrder
    .filter(({ key }) => seen.has(key))
    .map(({ abbr }) => abbr)
    .join('')
}

export function formatToTimeOfDay(
  start: string,
  end: string,
): 'Morning' | 'Afternoon' | 'Evening' | 'Night' {
  const toMinutes = (time: string): number => {
    const parsed = dayjs(time, ['H:mm', 'HH:mm'], true)
    if (!parsed.isValid()) {
      throw new Error(`Invalid time format: "${time}". Expected H:mm or HH:mm`)
    }
    return parsed.hour() * 60 + parsed.minute()
  }

  let startMin = toMinutes(start)
  let endMin = toMinutes(end)

  if (endMin <= startMin) endMin += 24 * 60
  const mid = ((startMin + endMin) / 2) % (24 * 60)

  if (mid < 5 * 60) return 'Night'
  if (mid < 12 * 60) return 'Morning'
  if (mid < 17 * 60) return 'Afternoon'
  if (mid < 22 * 60) return 'Evening'
  return 'Night'
}
