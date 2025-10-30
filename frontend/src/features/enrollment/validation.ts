import z from 'zod'
import { enrollmentStatusOptions } from './constants'

export const zEnrollmentStatusStudentEnum = z.enum(
  enrollmentStatusOptions.map((option) => option.value),
)
