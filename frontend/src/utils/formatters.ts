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
