import {
  zCreateEnrollmentPeriodItemDto,
  zPricingGroupDto,
} from '@/integrations/api/client/zod.gen'
import { nullableInput } from '@/integrations/zod/nullable-input'
import z from 'zod'

const zodEnrollmentPeriodCreate = zCreateEnrollmentPeriodItemDto.shape

export const zodStatusEnum = z.enum(zodEnrollmentPeriodCreate.status.options, {
  error: 'Invalid enrollment status.',
})

export const enrollmentPeriodFormSchema = z
  .object({
    endDate: z.date(),
    endYear: z.number(),
    startDate: z.date(),
    startYear: z.number(),
    term: z.number().min(1, 'Term must be at least 1'),
    status: zodStatusEnum,
    pricingGroup: nullableInput(
      zPricingGroupDto,
      'Pricing Group should not be empty',
    ),
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

export type EnrollmentPeriodFormInput = z.input<
  typeof enrollmentPeriodFormSchema
>
export type EnrollmentPeriodFormOutput = z.output<
  typeof enrollmentPeriodFormSchema
>

export type EnrollmentStatus = z.infer<typeof zodStatusEnum>
