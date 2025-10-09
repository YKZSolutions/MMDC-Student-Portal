import { zUpdateAssignmentConfigDto } from '@/integrations/api/client/zod.gen'
import z from 'zod'

const zAssignmentConfigSchema = zUpdateAssignmentConfigDto.shape

export const assignmentConfigFormSchema = z.object({
  ...zAssignmentConfigSchema,
  maxScore: z.number().nullable(),
  dueAt: z.string().nullable(),
  maxAttempt: zAssignmentConfigSchema.maxAttempt.nullable(),
})

export type AssignmentConfigFormInput = z.input<
  typeof assignmentConfigFormSchema
>
export type AssignmentConfigFormOutput = z.output<
  typeof assignmentConfigFormSchema
>
