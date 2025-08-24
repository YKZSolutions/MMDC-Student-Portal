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
