import z from 'zod'
import { enrollmentStatusOptions } from './constants'

export const zEnrollmentStatusEnum = z.enum(
  enrollmentStatusOptions.map((option) => option.value),
)
