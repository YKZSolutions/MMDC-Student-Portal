import z from 'zod'

const zApiErrorResponse = z.object({
  error: z.string(),
  timestamp: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  requestId: z.string(),
  path: z.string().optional(),
})

export type ApiErrorResponse = z.infer<typeof zApiErrorResponse>
