import z from 'zod'

export const commonSearchSchema = z.object({
  search: z.string().min(1).max(100).optional(),
  page: z.number().optional(),
})
