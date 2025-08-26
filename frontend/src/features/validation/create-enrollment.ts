import { zCreateEnrollmentPeriodDto } from '@/integrations/api/client/zod.gen'
import z from 'zod'

const zodEnrollmentPeriodCreate = zCreateEnrollmentPeriodDto.shape

const zodStatusEnum = z.enum(zodEnrollmentPeriodCreate.status.options, {
  error: 'Invalid enrollment status.',
})

export const CreateEnrollmentPeriodFormSchema = z
  .object({
    ...zodEnrollmentPeriodCreate,
    endDate: z.date(),
    endYear: z.number(),
    startDate: z.date(),
    startYear: z.number(),
    term: z.number().min(1, 'Term must be at least 1'),
    status: zodStatusEnum,
  })
  .superRefine((data, ctx) => {
    if (data.startDate >= data.endDate) {
      ctx.addIssue({
        path: ['startDate'],
        code: 'custom',
        message: 'Start date must be before end date.',
      })

      ctx.addIssue({
        path: ['endDate'],
        code: 'custom',
        message: 'End date must be after start date.',
      })
    }
  })

export type CreateEnrollmentPeriodFormValues = z.infer<
  typeof CreateEnrollmentPeriodFormSchema
>
