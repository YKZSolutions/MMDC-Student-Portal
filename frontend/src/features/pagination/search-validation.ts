import z from 'zod'

export const paginationSearchSchema = z.object({
  page: z.number().int().positive().optional(),
  search: z.string().optional(),
})

export type PaginationSearch = z.infer<typeof paginationSearchSchema>
