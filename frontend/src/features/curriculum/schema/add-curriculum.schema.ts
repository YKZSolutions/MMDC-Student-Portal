import { nullableInput } from '@/integrations/zod/nullable-input'
import z from 'zod'

export const curriculumFormSchema = z.object({
  program: nullableInput(z.uuid(), 'Program required'),
  major: nullableInput(z.uuid(), 'Major required'),
  description: z.string(),
})

export type CurriculumFormInput = z.input<typeof curriculumFormSchema>
export type CurriculumFormOutput = z.output<typeof curriculumFormSchema>
